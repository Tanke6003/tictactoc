let gameId, playerSymbol, turn;

async function join() {
  gameId = document.getElementById('gameId').value;
  await fetch('/api/init', {
    method:'POST',
    headers:{'Content-Type':'application/json'},
    body: JSON.stringify({ gameId })
  });
  playerSymbol = 'X';  // siempre serás X si eres el que inicia
  startPolling();
}

async function makeMove(i) {
  if (turn !== playerSymbol) return;
  await fetch('/api/move', {
    method:'POST',
    headers:{'Content-Type':'application/json'},
    body: JSON.stringify({ gameId, idx: i, symbol: playerSymbol })
  });
  render(); // opcional inmediato
}

async function fetchState() {
  const res = await fetch(`/api/state?gameId=${gameId}`);
  const data = await res.json();
  turn = data.turn;
  // copia todas las cell:<idx> en un objeto moves...
}

// cada 1s pide el estado
function startPolling() {
  setInterval(async () => {
    await fetchState();
    renderBoard();
    renderStatus();
  }, 1000);
}
