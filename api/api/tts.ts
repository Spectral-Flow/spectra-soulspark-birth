import { textToSpeech } from '../src/huggingface';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }
  const { text, model } = req.body;
  try {
    const audio = await textToSpeech(text, model);
    res.setHeader('Content-Type', 'audio/wav');
    res.status(200).send(audio);
  } catch (err) {
    res.status(500).json({ error: 'TTS failed', details: err });
  }
}
