#!/usr/bin/env python3
"""
Lightweight LLM pipeline microservice.

Features:
- Mode "space": calls a Hugging Face Space's `/api/predict` endpoint (good if you want to use Vesryin/Spectra or another Space).
- Mode "local": uses `transformers.pipeline` to run a local model (requires transformers + torch and the model weights available).
- Mode "auto": prefers `HF_SPACE_URL` if set, otherwise falls back to local pipeline.

Endpoints:
- POST /generate  { prompt: str, max_tokens?: int, mode?: "auto"|"space"|"local" }

This is intentionally small. For production, run behind uvicorn/gunicorn and secure the endpoint.
"""

import os
import json
from flask import Flask, request, jsonify

app = Flask(__name__)

HF_MODEL = os.getenv("HF_MODEL", "artificialguybr/Meta-Llama-3.1-8B-openhermes-2.5")
HF_SPACE_URL = os.getenv("HF_SPACE_URL")  # e.g. https://huggingface.co/spaces/Vesryin/Spectra
HUGGINGFACE_API_KEY = os.getenv("HUGGINGFACE_API_KEY")

# Lazy imports
_transformers = None
_requests = None


def _ensure_requests():
    global _requests
    if _requests is None:
        try:
            import requests as _r
            _requests = _r
        except Exception as e:
            raise RuntimeError("`requests` is required for space mode: pip install requests")
    return _requests


def _ensure_transformers():
    global _transformers
    if _transformers is None:
        try:
            import transformers as _t
            _transformers = _t
        except Exception as e:
            raise RuntimeError("`transformers` is required for local mode: pip install transformers[torch]")
    return _transformers


@app.route("/generate", methods=["POST"])
def generate():
    payload = request.get_json(force=True) or {}
    prompt = payload.get("prompt") or payload.get("text")
    if not prompt:
        return jsonify({"error": "missing prompt"}), 400
    max_tokens = int(payload.get("max_tokens", 256))
    mode = payload.get("mode", "auto")

    # Decide mode
    use_space = False
    if mode == "space":
        use_space = True
    elif mode == "local":
        use_space = False
    else:  # auto
        use_space = bool(HF_SPACE_URL)

    if use_space:
        # Call Space /api/predict (Gradio-style) with JSON { data: [prompt] }
        try:
            requests = _ensure_requests()
            url = HF_SPACE_URL.rstrip("/") + "/api/predict"
            headers = {"Accept": "application/json"}
            # If a Hugging Face token is provided, include it for private/limited spaces
            if HUGGINGFACE_API_KEY:
                headers["Authorization"] = f"Bearer {HUGGINGFACE_API_KEY}"
            # Some spaces may require no auth; others may check the referring token.
            resp = requests.post(url, json={"data": [prompt]}, headers=headers, timeout=30)
            try:
                body = resp.json()
            except Exception:
                return jsonify({"error": "space returned non-json", "status_code": resp.status_code, "text": resp.text}), 500
            # Many Gradio spaces return {data: [...]} — try to extract text
            if isinstance(body, dict) and "data" in body:
                data = body.get("data")
                # attempt common shapes
                if isinstance(data, list) and len(data) > 0:
                    result = data[0]
                    # result may be a dict or string
                    if isinstance(result, dict):
                        # common: { "generated_text": "..." }
                        text = result.get("generated_text") or result.get("text") or json.dumps(result)
                    else:
                        text = str(result)
                else:
                    text = json.dumps(body)
                return jsonify({"text": text, "model": HF_SPACE_URL, "mode": "space", "raw": body})
            else:
                return jsonify({"error": "unexpected space response", "raw": body}), 500
        except Exception as e:
            return jsonify({"error": str(e)}), 500

    # Local transformers pipeline
    try:
        transformers = _ensure_transformers()
        # Build pipeline lazily (cache on module)
        global _pipe
        try:
            _pipe
        except NameError:
            # Use text-generation pipeline for generality
            _pipe = transformers.pipeline("text-generation", model=HF_MODEL)
        out = _pipe(prompt, max_new_tokens=max_tokens, do_sample=True, temperature=0.7)
        # pipeline usually returns a list of dicts with 'generated_text'
        text = None
        if isinstance(out, list) and len(out) > 0 and isinstance(out[0], dict):
            text = out[0].get("generated_text") or out[0].get("text") or json.dumps(out[0])
        else:
            text = json.dumps(out)
        return jsonify({"text": text, "model": HF_MODEL, "mode": "local"})
    except RuntimeError as e:
        return jsonify({"error": str(e), "hint": "install required packages or set HF_SPACE_URL to use a Space"}), 500
    except Exception as e:
        return jsonify({"error": str(e)}), 500


if __name__ == "__main__":
    import argparse
    parser = argparse.ArgumentParser()
    parser.add_argument("--host", default="127.0.0.1")
    parser.add_argument("--port", default=5101, type=int)
    args = parser.parse_args()
    print("Starting llm_pipeline on %s:%d (HF_SPACE_URL=%s, HF_MODEL=%s)" % (args.host, args.port, bool(HF_SPACE_URL), HF_MODEL))
    app.run(host=args.host, port=args.port)
