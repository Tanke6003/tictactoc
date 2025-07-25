// api/move.js
import { kv } from '@vercel/kv';

export default async function handler(req, res) {
  const { gameId, idx, symbol } = req.body;
  // añade la jugada y cambia turno
  await kv.hset(`game:${gameId}`, {
    [`cell:${idx}`]: symbol,
    turn: symbol === 'X' ? 'O' : 'X'
  });
  res.status(200).json({ ok: true });
}
