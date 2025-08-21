# HuggingFace MCP (mock)

Minimal mock MCP server for HuggingFace model inference.

Run:

```bash
cd mcp-servers/huggingface
npm install
HF_API_KEY=your_key_here npm start
```

Endpoints:
- `GET /health` - health check
- `POST /mcp` - accept JSON { input: { model, text } } and either proxy to HF (if HF_API_KEY+model) or return a mock response

Set `PORT` via environment or `.env`.
