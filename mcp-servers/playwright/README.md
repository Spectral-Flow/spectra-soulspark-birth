# Playwright MCP (mock)

Minimal mock MCP server for running Playwright-like tasks.

Run:

```bash
cd mcp-servers/playwright
npm install
npm start
```

Endpoints:
- `GET /health` - health check
- `POST /mcp` - accept JSON { input: {...} } and returns a mock test result

Set `PORT` via environment or `.env`.
