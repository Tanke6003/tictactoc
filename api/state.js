import { Redis } from '@upstash/redis';

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL,
  token: process.env.UPSTASH_REDIS_REST_TOKEN
});

export default async function handler(req, res) {
  try {
    if (req.method !== 'GET') {
      res.setHeader('Allow', 'GET');
      return res.status(405).end('Only GET');
    }
    const { gameId } = req.query;
    if (!gameId) {
      return res.status(400).json({ error: 'Missing gameId' });
    }

    // Recupera todo el hash de la partida
    const data = await redis.hgetall(`game:${gameId}`);
    return res.status(200).json(data);
  } catch (err) {
    console.error('[state] Error interno:', err);
    return res.status(500).json({ error: err.message });
  }
}
