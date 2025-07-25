let gameId, playerSymbol, turn;
const moves = {};  // asegúrate de declarar esto globalmente

// Enlaza tu botón de unirse
document.getElementById('joinBtn')
        .addEventListener('click', join);

async function join() {
  try {
    console.log('[JOIN] empieza');
    gameId = document.getElementById('gameId').value.trim();
    console.log('[JOIN] gameId=', gameId);
    if (!gameId) throw new Error('ID de partida vacío');

    const res = await fetch('/api/init', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ gameId })
    });
    console.log('[JOIN] respuesta init:', res);

    if (!res.ok) {
      const txt = await res.text();
      throw new Error(`init falló: ${res.status} ${txt}`);
    }

    playerSymbol = 'X';
    console.log('[JOIN] playerSymbol =', playerSymbol);
    startPolling();
  } 
  catch (err) {
    console.error('[JOIN] Error:', err);
  }
}

async function makeMove(i) {
  try {
    console.log('[MOVE] intento en celda', i);
    if (turn !== playerSymbol) {
      console.warn('[MOVE] no es tu turno:', turn, 'vs', playerSymbol);
      return;
    }
    if (moves[i]) {
      console.warn('[MOVE] celda ya ocupada');
      return;
    }

    const res = await fetch('/api/move', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ gameId, idx: i, symbol: playerSymbol })
    });
    console.log('[MOVE] respuesta move:', res);

    if (!res.ok) {
      const txt = await res.text();
      throw new Error(`move falló: ${res.status} ${txt}`);
    }

    // opcional: actualizar UI inmediatamente
    moves[i] = playerSymbol;
    renderBoard();
    renderStatus();
  }
  catch (err) {
    console.error('[MOVE] Error:', err);
  }
}

async function fetchState() {
  try {
    console.log('[STATE] pidiendo estado');
    const res = await fetch(`/api/state?gameId=${encodeURIComponent(gameId)}`);
    console.log('[STATE] respuesta state:', res);

    if (!res.ok) {
      const txt = await res.text();
      throw new Error(`state falló: ${res.status} ${txt}`);
    }

    const data = await res.json();
    console.log('[STATE] datos:', data);

    // actualiza turno
    turn = data.turn;
    console.log('[STATE] turno =', turn);

    // reconstruye moves
    for (const key in data) {
      if (key.startsWith('cell:')) {
        const idx = key.split(':')[1];
        moves[idx] = data[key];
      }
    }
  }
  catch (err) {
    console.error('[STATE] Error:', err);
  }
}

function startPolling() {
  console.log('[POLL] iniciando polling cada 1s');
  setInterval(async () => {
    console.log('[POLL] tick');
    await fetchState();
    renderBoard();
    renderStatus();
  }, 1000);
}

// Asegúrate también de que tus renderBoard() y renderStatus() existan y lean de `moves` y `turn`.
