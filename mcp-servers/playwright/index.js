const express = require('express');
const bodyParser = require('body-parser');
const app = express();
app.use(bodyParser.json());
const PORT = process.env.PORT || 6002;

app.get('/health', (req, res) => res.json({ ok: true, server: 'playwright-mcp' }));

app.post('/mcp', (req, res) => {
  const { input } = req.body;
  // Mock: return a simulated Playwright test result
  res.json({
    server: 'playwright-mcp',
    received: input || null,
    result: {
      message: 'Mock Playwright run',
      testsRun: 3,
      failures: 0,
    },
  });
});

app.listen(PORT, () => console.log(`Playwright MCP server listening on ${PORT}`));
