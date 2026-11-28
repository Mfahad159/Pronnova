"""Unit tests: no models, no network. Run: .venv\\Scripts\\python -m pytest tests/test_unit.py -q"""

import numpy as np
import pytest

from pronnova_engine.align import align, load_near_table
from pronnova_engine.audio import SR, QualityRules, check_quality, trim_silence
from pronnova_engine.phonemes import normalize, normalize_symbol
from pronnova_engine.scoring import Thresholds, WordInput, classify, score_words


# ── Phoneme normalisation ─────────────────────────────────────────────────────
class TestNormalize:
    def test_strips_stress_and_length(self):
        assert normalize("ʃˈiː") == ["ʃ", "i"]
        assert normalize("ˌsiː") == ["s", "i"]

    def test_spaced_and_glued_give_the_same_tokens(self):
        assert normalize("s ɛ l z") == normalize("sɛlz") == ["s", "ɛ", "l", "z"]

    def test_diphthongs_and_affricates_are_one_token(self):
        assert normalize("taɪm") == ["t", "aɪ", "m"]
        assert normalize("a ɪ") == ["aɪ"]  # model output split by spaces
        assert normalize("tʃɜːtʃ") == ["tʃ", "ɜ", "tʃ"]
        assert normalize("dʒ") == ["dʒ"]

    def test_tie_bars_removed(self):
        assert normalize("t͡ʃ") == ["tʃ"]

    def test_equivalent_symbols(self):
        assert normalize("ɡ") == ["g"]
        assert normalize("r") == ["ɹ"]
        assert normalize("ɚ") == ["ə", "ɹ"]
        assert normalize("ᵻ") == ["ɪ"]
        assert normalize("ʔ") == []

    def test_e_is_epsilon_but_ei_stays_a_diphthong(self):
        assert normalize("e") == ["ɛ"]
        assert normalize("eɪ") == ["eɪ"]

    def test_list_input(self):
        assert normalize(["θ", "ˈɪ", "ŋ", "k"]) == ["θ", "ɪ", "ŋ", "k"]

    def test_near_table_entries_use_the_same_rules(self):
        assert normalize_symbol("iː") == "i"
        assert load_near_table().is_near("ɪ", normalize_symbol("iː"))


# ── Alignment ─────────────────────────────────────────────────────────────────
def statuses(ops):
    return [o.status for o in ops]


class TestAlign:
    def test_perfect(self):
        ops = align(["θ", "ɪ", "ŋ", "k"], ["θ", "ɪ", "ŋ", "k"])
        assert statuses(ops) == ["ok"] * 4
        assert all(o.credit == 1.0 for o in ops)

    def test_one_substitution(self):
        ops = align(["k", "æ", "t"], ["k", "ʌ", "t"])
        assert statuses(ops) == ["ok", "sub", "ok"]
        assert ops[1].expected == "æ" and ops[1].heard == "ʌ"

    def test_near_pair_th_as_t(self):
        ops = align(["θ", "ɪ", "ŋ", "k"], ["t", "ɪ", "ŋ", "k"])
        assert statuses(ops) == ["near", "ok", "ok", "ok"]
        assert ops[0].credit == 0.5

    def test_deletion(self):
        ops = align(["s", "t", "ɑ", "p"], ["s", "ɑ", "p"])
        assert statuses(ops) == ["ok", "del", "ok", "ok"]
        assert ops[1].expected == "t" and ops[1].heard is None

    def test_insertion(self):
        ops = align(["s", "t", "ɑ", "p"], ["s", "ə", "t", "ɑ", "p"])
        assert statuses(ops) == ["ok", "ins", "ok", "ok", "ok"]
        assert ops[1].exp_index is None and ops[1].heard == "ə"

    def test_empty_heard_is_all_deletions(self):
        assert statuses(align(["k", "æ", "t"], [])) == ["del", "del", "del"]


# ── Scoring maths + thresholds ────────────────────────────────────────────────
class TestScoring:
    def test_perfect_reading_scores_100(self):
        out = score_words([WordInput("she", ["ʃ", "i"]), WordInput("sells", ["s", "ɛ", "l", "z"])], ["ʃ", "i", "s", "ɛ", "l", "z"])
        assert out.overall == 100.0 and out.cls == "Excellent"
        assert [w["score"] for w in out.words] == [100.0, 100.0]
        assert out.tricky_sounds == []

    def test_word_score_is_mean_credit(self):
        # think → tink: θ is a near pair (0.5) → (0.5 + 1 + 1 + 1) / 4 = 87.5
        out = score_words([WordInput("think", ["θ", "ɪ", "ŋ", "k"])], ["t", "ɪ", "ŋ", "k"])
        assert out.words[0]["score"] == 87.5
        assert out.tricky_sounds == [{"phoneme": "θ", "count": 1}]
        assert out.words[0]["phonemes"][0] == {"expected": "θ", "heard": "t", "status": "near"}

    def test_overall_is_weighted_by_phoneme_count(self):
        # "a" (1 phoneme, wrong) + "cat" (3 phonemes, right) → (0×1 + 100×3) / 4 = 75
        out = score_words([WordInput("a", ["ə"]), WordInput("cat", ["k", "æ", "t"])], ["ɪ", "k", "æ", "t"])
        assert out.words[0]["score"] == 0.0 and out.words[1]["score"] == 100.0
        assert out.overall == 75.0 and out.cls == "Good"

    def test_insertion_penalty_inside_a_word(self):
        t = Thresholds(insertion_penalty=10)
        out = score_words([WordInput("stop", ["s", "t", "ɑ", "p"])], ["s", "ə", "t", "ɑ", "p"], t=t)
        assert out.words[0]["score"] == 90.0

    def test_scores_clamp_to_zero(self):
        out = score_words([WordInput("a", ["ə"])], ["k", "s", "p", "t"])
        assert out.words[0]["score"] == 0.0

    def test_silence_scores_zero(self):
        out = score_words([WordInput("cat", ["k", "æ", "t"])], [])
        assert out.overall == 0.0 and out.cls == "Average"
        assert {"phoneme": "k", "count": 1} in out.tricky_sounds

    @pytest.mark.parametrize("score,cls", [(100, "Excellent"), (85, "Excellent"), (84.9, "Good"), (70, "Good"), (69.9, "Average"), (0, "Average")])
    def test_class_thresholds(self, score, cls):
        assert classify(score) == cls

    def test_thresholds_are_configurable(self):
        assert classify(80, Thresholds(excellent_min=80, good_min=60)) == "Excellent"


# ── Audio quality ─────────────────────────────────────────────────────────────
def tone(seconds: float, amp: float, freq: float = 220.0) -> np.ndarray:
    t = np.arange(int(seconds * SR)) / SR
    return (amp * np.sin(2 * np.pi * freq * t)).astype(np.float32)


def silence(seconds: float, amp: float = 1e-4) -> np.ndarray:
    rng = np.random.default_rng(0)
    return (amp * rng.standard_normal(int(seconds * SR))).astype(np.float32)


class TestAudioQuality:
    def test_clear_speech_is_ok_and_trimmed(self):
        x = np.concatenate([silence(1.0), tone(1.2, 0.3), silence(1.0)])
        ok, reason, trimmed = check_quality(x)
        assert ok and reason is None
        assert 1.2 <= len(trimmed) / SR < 1.7  # silence cut, small padding kept

    def test_silence_is_no_speech(self):
        ok, reason, _ = check_quality(silence(2.0))
        assert not ok and reason == "no_speech"

    def test_quiet_mic_is_too_quiet(self):
        ok, reason, _ = check_quality(tone(2.0, 0.012))  # ≈ -41 dBFS: above silence, below the speech peak rule
        assert not ok and reason == "too_quiet"

    def test_short_blip_is_too_short(self):
        x = np.concatenate([silence(1.0), tone(0.2, 0.3), silence(1.0)])
        ok, reason, _ = check_quality(x)
        assert not ok and reason == "too_short"

    def test_empty_input(self):
        ok, reason, _ = check_quality(np.zeros(0, dtype=np.float32))
        assert not ok and reason == "no_speech"

    def test_trim_reports_speech_seconds(self):
        _, speech = trim_silence(np.concatenate([silence(0.5), tone(0.8, 0.3), silence(0.5)]), QualityRules())
        assert 0.75 <= speech <= 0.85
