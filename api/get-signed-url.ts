import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const agentId = process.env.VITE_ELEVENLABS_AGENT_ID;
    const apiKey = process.env.VITE_ELEVENLABS_API_KEY;

    if (!agentId || !apiKey) {
      return res.status(500).json({ error: 'Missing required environment variables' });
    }

    const response = await fetch(
      `https://api.elevenlabs.io/v1/convai/conversation/get-signed-url?agent_id=${agentId}`,
      {
        headers: {
          'xi-api-key': apiKey,
        },
      }
    );

    if (!response.ok) {
      throw new Error('Failed to get signed URL');
    }

    const data = await response.json();
    return res.json({ signedUrl: data.signed_url });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to generate signed URL' });
  }
}