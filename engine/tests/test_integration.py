"""Integration tests: real models (loaded once for the module). Slow; needs downloaded models.

    .venv\\Scripts\\python -m pytest tests/test_integration.py -q -s
Skipped automatically if the models aren't there.
"""

from pathlib import Path

import pytest

FIX = Path(__file__).with_name("fixtures")


@pytest.fixture(scope="module")
def client():
    try:
        from fastapi.testclient import TestClient

        from pronnova_engine.app import app
    except Exception as err:  # pragma: no cover
        pytest.skip(f"engine not installed: {err}")
    with TestClient(app) as c:  # runs the lifespan: loads + warms the models
        if not c.get("/health").json()["ok"]:
            pytest.skip("models not loaded (run scripts/download_models.py)")
        yield c


def score(client, wav: str, text: str) -> dict:
    with open(FIX / wav, "rb") as f:
        r = client.post("/score", files={"audio": (wav, f, "audio/wav")}, data={"reference_text": text})
    assert r.status_code == 200, r.text
    return r.json()


def test_health_reports_device(client):
    h = client.get("/health").json()
    print("health:", h)
    assert h["ok"] and h["models_loaded"]
    assert h["device"] in ("cuda", "cpu")


def test_tts_returns_playable_mp3(client):
    for speed in ("normal", "slow"):
        r = client.post("/tts", json={"text": "She sells sea shells.", "speed": speed})
        assert r.status_code == 200 and r.headers["content-type"] == "audio/mpeg"
        assert r.content[:3] == b"ID3" or r.content[0] == 0xFF  # MP3 header / frame sync
        assert len(r.content) > 2000
    slow = client.post("/tts", json={"text": "She sells sea shells.", "speed": "slow"}).content
    normal = client.post("/tts", json={"text": "She sells sea shells.", "speed": "normal"}).content
    assert len(slow) > len(normal)  # 0.75× speed → longer audio


def test_correct_reading_scores_high(client):
    d = score(client, "correct.wav", "She sells sea shells")
    print("correct:", d["overall"], d["class"], d["heard_phonemes"], d["timings"])
    assert d["audio_quality"]["ok"]
    assert d["overall"] >= 80
    assert [w["text"] for w in d["words"]] == ["She", "sells", "sea", "shells"]


def test_one_wrong_word_is_flagged(client):
    d = score(client, "one_wrong.wav", "She sells sea shells")
    print("one wrong:", d["overall"], [(w["text"], w["score"]) for w in d["words"]], d["tricky_sounds"])
    sea = next(w for w in d["words"] if w["text"] == "sea")
    others = [w["score"] for w in d["words"] if w["text"] != "sea"]
    assert sea["score"] < min(others)
    assert any(p["expected"] == "s" and p["status"] != "ok" for p in sea["phonemes"])


def test_think_said_as_tink_flags_theta(client):
    d = score(client, "think_as_tink.wav", "think")
    print("tink:", d["overall"], d["words"][0]["phonemes"], d["tricky_sounds"])
    theta = next(p for p in d["words"][0]["phonemes"] if p["expected"] == "θ")
    assert theta["status"] in ("near", "sub") and theta["heard"] != "θ"
    assert any(t["phoneme"] == "θ" for t in d["tricky_sounds"])


def test_silence_is_rejected_without_a_score(client):
    d = score(client, "silence.wav", "She sells sea shells")
    assert d["audio_quality"] == {"ok": False, "reason": "no_speech"}
    assert d["overall"] is None
