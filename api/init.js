// api/init.js
import { kv } from '@vercel/kv';

export default async function handler(req, res) {
  const { gameId } = req.body;
  // inicializa tablero vacío y turno X
  await kv.hset(`game:${gameId}`, { turn: 'X' });
  res.status(200).json({ ok: true });
}
