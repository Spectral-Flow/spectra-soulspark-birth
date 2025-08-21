const express = require('express');
const bodyParser = require('body-parser');
const fetch = require('node-fetch');
const app = express();
app.use(bodyParser.json());
const PORT = process.env.PORT || 6003;

app.get('/health', (req, res) => res.json({ ok: true, server: 'huggingface-mcp' }));

app.post('/mcp', async (req, res) => {
  const { input } = req.body;
  // Mock: optionally proxy to HuggingFace if HF_API_KEY and model provided
  if (process.env.HF_API_KEY && input && input.model) {
    try {
      const hfRes = await fetch(`https://api-inference.huggingface.co/models/${input.model}`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${process.env.HF_API_KEY}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ inputs: input.text || 'Hello' }),
      });
      const data = await hfRes.json();
      return res.json({ server: 'huggingface-mcp', proxied: true, data });
    } catch (err) {
      return res.status(500).json({ error: String(err) });
    }
  }

  res.json({
    server: 'huggingface-mcp',
    received: input || null,
    result: {
      message: 'Mock HuggingFace response',
      model: input && input.model ? input.model : 'gpt2',
    },
  });
});

app.listen(PORT, () => console.log(`HuggingFace MCP server listening on ${PORT}`));
