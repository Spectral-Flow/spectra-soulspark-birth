import { VercelRequest, VercelResponse } from '@vercel/node';

/**
 * ElevenLabs Voices API Proxy
 * Fetches available voices from ElevenLabs
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const apiKey = process.env.ELEVENLABS_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'ElevenLabs API key not configured' });
  }

  try {
    const response = await fetch('https://api.elevenlabs.io/v1/voices', {
      headers: {
        'xi-api-key': apiKey,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('ElevenLabs voices API error:', response.status, errorText);
      return res.status(response.status).json({ 
        error: 'ElevenLabs API error',
        details: errorText 
      });
    }

    const data = await response.json();
    return res.status(200).json(data);

  } catch (error) {
    console.error('Voices endpoint error:', error);
    return res.status(500).json({ 
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}