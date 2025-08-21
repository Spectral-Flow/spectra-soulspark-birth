# GitHub MCP (mock)

Minimal mock MCP server for GitHub-related actions.

Run:

```bash
cd mcp-servers/github
npm install
npm start
```

Endpoints:
- `GET /health` - health check
- `POST /mcp` - accept JSON { input: {...} } and returns a mock response

Set `PORT` via environment or `.env`.
