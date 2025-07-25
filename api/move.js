import { Redis } from '@upstash/redis';

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL,
  token: process.env.UPSTASH_REDIS_REST_TOKEN
});

export default async function handler(req, res) {
  try {
    if (req.method !== 'POST') {
      res.setHeader('Allow', 'POST');
      return res.status(405).end('Only POST');
    }
    const { gameId, idx, symbol } = req.body;
    if (!gameId || idx == null || !symbol) {
      return res.status(400).json({ error: 'Missing params' });
    }

    // Guarda la jugada y cambia turno
    await redis.hset(`game:${gameId}`, {
      [`cell:${idx}`]: symbol,
      turn: symbol === 'X' ? 'O' : 'X'
    });
    return res.status(200).json({ ok: true });
  } catch (err) {
    console.error('[move] Error interno:', err);
    return res.status(500).json({ error: err.message });
  }
}
