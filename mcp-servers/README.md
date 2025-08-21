# MCP Servers (GitHub, Playwright, HuggingFace)

This folder contains simple mock MCP servers to use locally during development.

Quick start:

1. Install dependencies for all servers:

```bash
cd mcp-servers
npm run install-all
```

2. Start an individual server:

```bash
npm run start-github
# or
npm run start-playwright
# or
npm run start-huggingface
```

3. Start all servers concurrently (requires dev dependency `concurrently`):

```bash
npm run start-all
```

Health checks:

- GitHub: http://localhost:6001/health
- Playwright: http://localhost:6002/health
- HuggingFace: http://localhost:6003/health

Each server exposes POST /mcp for test payloads.
