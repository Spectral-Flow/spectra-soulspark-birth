import { spawn } from 'child_process';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }
  const { category, title, content, tags, metadata } = req.body;
  const py = spawn('python3', ['copilot_memory.py', 'add', category, title, content, JSON.stringify(tags || []), JSON.stringify(metadata || {})]);
  let result = '';
  py.stdout.on('data', (data) => {
    result += data.toString();
  });
  py.stderr.on('data', (err) => {
    res.status(500).json({ error: err.toString() });
  });
  py.on('close', () => {
    res.status(200).json({ result });
  });
}
