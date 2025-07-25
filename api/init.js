// api/init.js
import { kv } from '@vercel/kv';

export default async function handler(req, res) {
  try {
    if (req.method !== 'POST') {
      res.setHeader('Allow', 'POST');
      return res.status(405).end('Método no permitido');
    }

    const { gameId } = req.body;
    if (!gameId) {
      return res.status(400).json({ error: 'Falta gameId' });
    }

    // Inicializa el hash para esta partida
    await kv.hset(`game:${gameId}`, { turn: 'X' });
    console.log(`[init] Partida ${gameId} creada`);
    return res.status(200).json({ ok: true });
  }
  catch (err) {
    console.error('[init] Error interno:', err);
    return res
      .status(500)
      .json({ error: 'Error interno en init', details: err.message });
  }
}
