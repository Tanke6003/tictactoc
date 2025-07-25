// api/join.js
import { Redis } from '@upstash/redis';

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL,
  token: process.env.UPSTASH_REDIS_REST_TOKEN
});

export default async function handler(req, res) {
  try {
    if (req.method !== 'POST') {
      res.setHeader('Allow','POST');
      return res.status(405).end('Only POST');
    }
    const { gameId } = req.body;
    if (!gameId) {
      return res.status(400).json({ error: 'Missing gameId' });
    }

    // Lee el estado o {} si no existe
    const data = (await redis.hgetall(`game:${gameId}`)) || {};

    // Convierte players a número (0 si no está)
    const p = data.players != null
      ? Number(data.players)
      : 0;

    if (p === 0) {
      // Primer jugador: crea partida con X
      await redis.hset(`game:${gameId}`, { turn: 'X', players: '1' });
      return res.status(200).json({ symbol: 'X' });
    }
    if (p === 1) {
      // Segundo jugador: suma 1 y devuelve O
      await redis.hset(`game:${gameId}`, { players: '2' });
      return res.status(200).json({ symbol: 'O' });
    }
    // Tercero o más: sala llena
    return res.status(403).json({ error: 'Game full' });
  } catch (err) {
    console.error('[join] Error interno:', err);
    return res.status(500).json({ error: err.message });
  }
}
