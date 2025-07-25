import { Redis } from '@upstash/redis';
const redis = new Redis({ url: process.env.UPSTASH_REDIS_REST_URL, token: process.env.UPSTASH_REDIS_REST_TOKEN });

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow','POST');
    return res.status(405).end('Only POST');
  }
  const { gameId } = req.body;
  let data = (await redis.hgetall(`game:${gameId}`)) || {};
  let p = Math.max(0, (Number(data.players)||0) - 1);
  if (p === 0) {
    await redis.del(`game:${gameId}`);
  } else {
    await redis.hset(`game:${gameId}`, { players: String(p) });
  }
  return res.status(200).json({ ok: true });
}
