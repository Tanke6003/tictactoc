// api/state.js
import { kv } from '@vercel/kv';

export default async function handler(req, res) {
  const { gameId } = req.query;
  const data = await kv.hgetall(`game:${gameId}`);
  res.status(200).json(data);
}
