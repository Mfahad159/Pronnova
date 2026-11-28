"""Start the engine: .venv\\Scripts\\python run.py  (port from ENGINE_PORT, default 8001)."""

import sys

import uvicorn

from pronnova_engine.config import settings

if __name__ == "__main__":
    # Windows consoles default to cp1252: IPA symbols in the logs would fail to print.
    for stream in (sys.stdout, sys.stderr):
        stream.reconfigure(encoding="utf-8", errors="replace")
    # One worker: the models live in this process (loaded once, ~2 GB on the GPU).
    uvicorn.run("pronnova_engine.app:app", host="127.0.0.1", port=settings.port, workers=1, log_level="info")
