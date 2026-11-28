"""Phoneme symbol normalisation.

Expected phonemes come from phonemizer/espeak-ng; heard phonemes come from the wav2vec2 espeak CTC
model. Both are espeak IPA, but they differ in small ways (stress marks, length marks, tie bars,
espeak-only symbols, how multi-character symbols are split). Everything goes through `normalize`
so both sides use exactly the same symbol set before alignment.

Rules (applied to both sides, in this order):
1. Remove stress (ˈ ˌ), length/half-length (ː ˑ), tie bars (͡ ͜), syllabic/non-syllabic marks, and
   other diacritics: a long vowel and its short version become the same symbol (iː → i).
2. Map espeak-specific or equivalent symbols onto one canonical symbol (EQUIV).
3. Split into tokens by longest match against the inventory, so "aɪ" or "tʃ" is one token whether
   it arrived as "aɪ", "a ɪ" (separated) or "aɪ" glued to the next symbol.
"""

from __future__ import annotations

import unicodedata

# Marks removed everywhere. Length marks go too (consistently on both sides).
STRIP = set("ˈˌːˑ͜͡‿.ˀ") | {"̩", "̍", "̯", "̆", "̃", "̥", "̚", "˞"}

# Different spellings of the same sound → one canonical symbol (after STRIP).
EQUIV: dict[str, str] = {
    "ɡ": "g",  # U+0261 → ASCII g
    "r": "ɹ",
    "ɾ": "t",  # US flap ("water"): accept t
    "ɫ": "l",
    "ᵻ": "ɪ",  # espeak reduced vowel
    "ɐ": "ə",  # espeak "a" in some contexts
    "ɚ": "əɹ",
    "ɝ": "ɜɹ",
    "ɜ": "ɜ",
    "ʔ": "",  # glottal stop: ignored on both sides
    "ʲ": "",
    "ʰ": "",  # aspiration
    "ʷ": "",
    "ⁿ": "",
    "ˡ": "",
    "e": "ɛ",  # espeak en uses "e" in some diphthong-less contexts; treat as ɛ
}

# Multi-character tokens (after STRIP): diphthongs and affricates, longest first.
MULTI = ["aɪə", "aʊə", "eɪ", "aɪ", "ɔɪ", "aʊ", "oʊ", "əʊ", "ɪə", "ɛə", "ʊə", "eə", "tʃ", "dʒ", "ts", "dz"]
# The "e" in "eɪ" / "eə" must survive EQUIV, so multi tokens are matched before EQUIV is applied.


def _strip(text: str) -> str:
    text = unicodedata.normalize("NFD", text)
    out = []
    for ch in text:
        if ch in STRIP:
            continue
        if unicodedata.category(ch) == "Mn" and ch not in ("͡",):  # other combining diacritics
            continue
        out.append(ch)
    return unicodedata.normalize("NFC", "".join(out))


def _tokenize_chunk(chunk: str) -> list[str]:
    tokens: list[str] = []
    i = 0
    while i < len(chunk):
        for m in MULTI:
            if chunk.startswith(m, i):
                tokens.append(m)
                i += len(m)
                break
        else:
            ch = chunk[i]
            i += 1
            mapped = EQUIV.get(ch, ch)
            if mapped:
                # EQUIV can expand to two symbols (ɚ → əɹ): tokenise the result again.
                tokens.extend(list(mapped) if len(mapped) > 1 else [mapped])
    return tokens


def normalize(text: str | list[str]) -> list[str]:
    """IPA string (spaced or not) or a token list → canonical token list. Whitespace separates
    nothing special: tokens are re-split by the inventory so both sides agree."""
    if isinstance(text, list):
        text = " ".join(text)
    stripped = _strip(text)
    # Join first, then split by the inventory: "a ɪ" and "aɪ" must give the same result.
    joined = "".join(stripped.split())
    return [t for t in _tokenize_chunk(joined) if t.strip()]


def normalize_symbol(symbol: str) -> str:
    """One symbol (e.g. a near-pair entry) → canonical form. Multi-token results are joined."""
    return "".join(normalize(symbol))
