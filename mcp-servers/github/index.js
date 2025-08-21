const express = require('express');
const bodyParser = require('body-parser');
const app = express();
app.use(bodyParser.json());
const PORT = process.env.PORT || 6001;

app.get('/health', (req, res) => res.json({ ok: true, server: 'github-mcp' }));

app.post('/mcp', (req, res) => {
  const { input } = req.body;
  // Mock behavior: echo input and return a small simulated GitHub response
  res.json({
    server: 'github-mcp',
    received: input || null,
    result: {
      message: 'This is a mock GitHub MCP response',
      repo: input && input.repo ? input.repo : 'example-repo',
    },
  });
});

app.listen(PORT, () => console.log(`GitHub MCP server listening on ${PORT}`));
