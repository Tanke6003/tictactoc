import { Redis } from '@upstash/redis';
const redis = new Redis({ url: process.env.UPSTASH_REDIS_REST_URL, token: process.env.UPSTASH_REDIS_REST_TOKEN });

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow','POST');
    return res.status(405).end('Only POST');
  }
  const { gameId, winner } = req.body;
  if (!gameId || !['X','O','draw'].includes(winner)) {
    return res.status(400).json({ error: 'Invalid params' });
  }
  if (winner !== 'draw') {
    await redis.hincrby('scoreboard', winner, 1);
  }
  await redis.del(`game:${gameId}`);
  return res.status(200).json({ ok: true });
}
