import { speechToText } from '../src/huggingface';
import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }
  try {
    const transcript = await speechToText(Buffer.from(req.body.audio), req.body.model);
    res.status(200).json(transcript);
  } catch (err) {
    res.status(500).json({ error: 'SST failed', details: err });
  }
}
