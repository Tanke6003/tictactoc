import { Redis } from '@upstash/redis';
const redis = new Redis({ url: process.env.UPSTASH_REDIS_REST_URL, token: process.env.UPSTASH_REDIS_REST_TOKEN });

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow','GET');
    return res.status(405).end('Only GET');
  }
  const data = (await redis.hgetall('scoreboard')) || {};
  return res.status(200).json({
    X: Number(data.X) || 0,
    O: Number(data.O) || 0
  });
}
