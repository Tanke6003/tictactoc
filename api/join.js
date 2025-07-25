import { Redis } from '@upstash/redis';
const redis = new Redis({ url: process.env.UPSTASH_REDIS_REST_URL, token: process.env.UPSTASH_REDIS_REST_TOKEN });

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow','POST');
    return res.status(405).end('Only POST');
  }
  const { gameId } = req.body;
  if (!gameId) return res.status(400).json({ error: 'Missing gameId' });

  const data = (await redis.hgetall(`game:${gameId}`)) || {};
  const p = Number(data.players) || 0;

  if (p === 0) {
    await redis.hset(`game:${gameId}`, { turn: 'X', players: '1' });
    return res.status(200).json({ symbol: 'X' });
  }
  if (p === 1) {
    await redis.hset(`game:${gameId}`, { players: '2' });
    return res.status(200).json({ symbol: 'O' });
  }
  return res.status(403).json({ error: 'Game full' });
}
