"""Scoring maths (pure: no audio, no models).

Input: the reference words with their expected phonemes, and the heard phoneme sequence.
1. Align the whole expected sequence (all words, in order) against the heard sequence.
2. Each expected phoneme belongs to a word; an insertion belongs to the word of the expected phoneme
   just before it (or the first word if it comes first).
3. Word score = mean credit of its expected phonemes × 100, minus INSERTION_PENALTY per insertion
   inside the word, clamped to 0–100.
4. Overall = mean of word scores weighted by each word's phoneme count.
5. Class from thresholds (≥ excellent_min → Excellent, ≥ good_min → Good, else Average).
6. tricky_sounds = expected phonemes with status sub / del / near, counted.
"""

from __future__ import annotations

from collections import Counter
from dataclasses import dataclass, field

from .align import NearTable, align, load_near_table


@dataclass(frozen=True)
class Thresholds:
    excellent_min: float = 85.0
    good_min: float = 70.0
    insertion_penalty: float = 10.0  # points off a word per extra (inserted) sound


@dataclass
class WordInput:
    text: str
    phonemes: list[str]  # already normalised


@dataclass
class ScoreOutput:
    overall: float
    cls: str
    words: list[dict] = field(default_factory=list)
    tricky_sounds: list[dict] = field(default_factory=list)


def classify(score: float, t: Thresholds = Thresholds()) -> str:
    if score >= t.excellent_min:
        return "Excellent"
    if score >= t.good_min:
        return "Good"
    return "Average"


def score_words(words: list[WordInput], heard: list[str], near: NearTable | None = None, t: Thresholds = Thresholds()) -> ScoreOutput:
    near = near or load_near_table()
    expected: list[str] = []
    owner: list[int] = []  # expected phoneme index → word index
    for wi, w in enumerate(words):
        for p in w.phonemes:
            expected.append(p)
            owner.append(wi)

    ops = align(expected, heard, near)
    per_word: list[list[dict]] = [[] for _ in words]
    credits: list[list[float]] = [[] for _ in words]
    inserts = [0] * len(words)
    last_word = 0
    for op in ops:
        if op.exp_index is not None:
            last_word = owner[op.exp_index]
            credits[last_word].append(op.credit)
        else:
            inserts[last_word] += 1
        if words:
            per_word[last_word].append({"expected": op.expected, "heard": op.heard, "status": op.status})

    out_words: list[dict] = []
    weighted, total_weight = 0.0, 0
    for wi, w in enumerate(words):
        n = len(credits[wi])
        if n == 0:
            # A word with no phonemes (e.g. a number espeak can't voice): neutral, no weight.
            score = 0.0 if inserts[wi] else 100.0
        else:
            score = sum(credits[wi]) / n * 100 - t.insertion_penalty * inserts[wi]
        score = round(max(0.0, min(100.0, score)), 1)
        out_words.append({"text": w.text, "score": score, "phonemes": per_word[wi]})
        weighted += score * n
        total_weight += n

    overall = round(weighted / total_weight, 1) if total_weight else 0.0
    tricky = Counter(op.expected for op in ops if op.expected is not None and op.status in ("sub", "del", "near"))
    return ScoreOutput(
        overall=overall,
        cls=classify(overall, t),
        words=out_words,
        tricky_sounds=[{"phoneme": p, "count": c} for p, c in tricky.most_common()],
    )
