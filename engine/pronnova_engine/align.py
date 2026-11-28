"""Weighted alignment of expected vs heard phonemes (Needleman–Wunsch / weighted edit distance).

Costs: exact match 0, near pair 0.5, substitution 1, deletion 1, insertion 1. The cheapest path gives
one operation per position with a status:
  ok   – same phoneme            (credit 1.0)
  near – a pair from near_pairs  (credit 0.5 by default)
  sub  – a different phoneme     (credit 0)
  del  – expected but not heard  (credit 0)
  ins  – heard but not expected  (no expected phoneme; penalised per word in scoring)
Pure Python, no model code, so it is unit-tested on its own.
"""

from __future__ import annotations

import json
from dataclasses import dataclass
from functools import lru_cache
from pathlib import Path

from .phonemes import normalize_symbol

NEAR_FILE = Path(__file__).with_name("near_pairs.json")


@dataclass(frozen=True)
class NearTable:
    credit: float
    pairs: frozenset[frozenset[str]]

    def is_near(self, a: str, b: str) -> bool:
        return a != b and frozenset((a, b)) in self.pairs


@lru_cache(maxsize=4)
def load_near_table(path: str | None = None) -> NearTable:
    data = json.loads(Path(path or NEAR_FILE).read_text(encoding="utf-8"))
    pairs = frozenset(frozenset((normalize_symbol(a), normalize_symbol(b))) for a, b in data["pairs"])
    return NearTable(credit=float(data.get("credit", 0.5)), pairs=pairs)


@dataclass(frozen=True)
class Op:
    expected: str | None  # None for insertions
    heard: str | None  # None for deletions
    status: str  # ok | near | sub | del | ins
    credit: float  # 0..1 (insertions: 0)
    exp_index: int | None  # position in the expected sequence (None for insertions)


def align(expected: list[str], heard: list[str], near: NearTable | None = None) -> list[Op]:
    near = near or load_near_table()
    n, m = len(expected), len(heard)

    def sub_cost(a: str, b: str) -> float:
        if a == b:
            return 0.0
        if near.is_near(a, b):
            return 1.0 - near.credit
        return 1.0

    # dp[i][j] = cheapest cost aligning expected[:i] with heard[:j]
    dp = [[0.0] * (m + 1) for _ in range(n + 1)]
    for i in range(1, n + 1):
        dp[i][0] = float(i)
    for j in range(1, m + 1):
        dp[0][j] = float(j)
    for i in range(1, n + 1):
        for j in range(1, m + 1):
            dp[i][j] = min(
                dp[i - 1][j - 1] + sub_cost(expected[i - 1], heard[j - 1]),
                dp[i - 1][j] + 1.0,  # deletion
                dp[i][j - 1] + 1.0,  # insertion
            )

    # Trace back. Tie order: diagonal first (keeps a mispronounced sound as one "sub" instead of
    # a deletion + insertion), then deletion, then insertion.
    ops: list[Op] = []
    i, j = n, m
    eps = 1e-9
    while i > 0 or j > 0:
        if i > 0 and j > 0 and abs(dp[i][j] - (dp[i - 1][j - 1] + sub_cost(expected[i - 1], heard[j - 1]))) < eps:
            a, b = expected[i - 1], heard[j - 1]
            if a == b:
                ops.append(Op(a, b, "ok", 1.0, i - 1))
            elif near.is_near(a, b):
                ops.append(Op(a, b, "near", near.credit, i - 1))
            else:
                ops.append(Op(a, b, "sub", 0.0, i - 1))
            i, j = i - 1, j - 1
        elif i > 0 and abs(dp[i][j] - (dp[i - 1][j] + 1.0)) < eps:
            ops.append(Op(expected[i - 1], None, "del", 0.0, i - 1))
            i -= 1
        else:
            ops.append(Op(None, heard[j - 1], "ins", 0.0, None))
            j -= 1
    ops.reverse()
    return ops
