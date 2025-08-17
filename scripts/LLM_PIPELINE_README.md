LLM pipeline microservice

This small microservice provides a `/generate` endpoint and supports two modes:

- space: calls a Hugging Face Space's `/api/predict` (useful for hosted Spaces like Vesryin/Spectra).
- local: runs a local `transformers.pipeline` (requires large models and dependencies like torch).
- auto: prefers `HF_SPACE_URL` if set otherwise tries local pipeline.

Quick usage

1. Install (recommended in a virtualenv):

```bash
python3 -m venv .venv
source .venv/bin/activate
pip install -r scripts/llm_requirements.txt
```

2. Point to the Hugging Face Space (example using the Space you provided):

```bash
export HF_SPACE_URL=https://huggingface.co/spaces/Vesryin/Spectra
python scripts/llm_pipeline.py --port 5101
```

3. Call it:

```bash
curl -sS -X POST http://localhost:5101/generate -H "Content-Type: application/json" -d '{"prompt":"Hello Spectra"}' | jq
```

Notes
- If you prefer to run a local model (heavy), unset `HF_SPACE_URL` and install the transformers/torch stack; `HF_MODEL` controls the local model id.
- Spaces may require an API token depending on the space's settings. If the Space requires auth, you must set `HUGGINGFACE_API_KEY` in the environment and modify the script to send an Authorization header.
- This microservice is intentionally minimal. For production, run under a proper ASGI server, add rate limiting, auth, and secure the endpoint behind a VPN or gateway.
