import { VercelRequest, VercelResponse } from '@vercel/node';
import { sign, verify } from 'jsonwebtoken';

/**
 * Simple JWT authentication for session management
 * In production, replace with proper auth provider (Supabase Auth, Auth0, etc.)
 */

const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-key-change-in-production';

interface User {
  id: string;
  username: string;
  email?: string;
  createdAt: string;
}

// Simple in-memory user store (replace with database)
const users = new Map<string, User>();

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { action, username, email, token } = req.body;

    switch (action) {
      case 'register': {
        if (!username) {
          return res.status(400).json({ error: 'Username is required' });
        }

        // Check if user already exists
        const existingUser = Array.from(users.values()).find(u => u.username === username);
        if (existingUser) {
          return res.status(409).json({ error: 'Username already exists' });
        }

        // Create new user
        const userId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        const newUser: User = {
          id: userId,
          username,
          email,
          createdAt: new Date().toISOString(),
        };
        users.set(userId, newUser);

        // Generate JWT token
        const userToken = sign({ userId, username }, JWT_SECRET, { expiresIn: '7d' });

        return res.status(201).json({
          user: newUser,
          token: userToken,
        });
      }

      case 'login': {
        if (!username) {
          return res.status(400).json({ error: 'Username is required' });
        }

        // Find user by username
        const user = Array.from(users.values()).find(u => u.username === username);
        if (!user) {
          return res.status(404).json({ error: 'User not found' });
        }

        // Generate JWT token
        const loginToken = sign({ userId: user.id, username: user.username }, JWT_SECRET, { expiresIn: '7d' });

        return res.status(200).json({
          user,
          token: loginToken,
        });
      }

      case 'verify': {
        if (!token) {
          return res.status(400).json({ error: 'Token is required' });
        }

        try {
          const decoded = verify(token, JWT_SECRET) as { userId: string; username: string };
          const verifyUser = users.get(decoded.userId);
          
          if (!verifyUser) {
            return res.status(404).json({ error: 'User not found' });
          }

          return res.status(200).json({ user: verifyUser, valid: true });
        } catch (error) {
          return res.status(401).json({ error: 'Invalid token', valid: false });
        }
        break;
      }

      default:
        return res.status(400).json({ error: 'Invalid action' });
    }

  } catch (error) {
    console.error('Auth endpoint error:', error);
    return res.status(500).json({ 
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}