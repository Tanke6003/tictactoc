import { Redis } from '@upstash/redis';
const redis = new Redis({ url: process.env.UPSTASH_REDIS_REST_URL, token: process.env.UPSTASH_REDIS_REST_TOKEN });

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow','POST');
    return res.status(405).end('Only POST');
  }
  let gameId;
  do {
    gameId = String(Math.floor(100000 + Math.random()*900000));  // 6 dígitos
  } while (await redis.exists(`game:${gameId}`));
  return res.status(200).json({ gameId });
}
