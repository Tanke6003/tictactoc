// Referencias al DOM
const createBtn   = document.getElementById('createBtn');
const gameIdInput = document.getElementById('gameId');
const joinBtn     = document.getElementById('joinBtn');
const controlsEl  = document.getElementById('controls');
const roomInfoEl  = document.getElementById('roomInfo');
const scoreboardEl= document.getElementById('scoreboard');
const statusEl    = document.getElementById('status');
const boardEl     = document.getElementById('board');

let gameId, playerSymbol, turn, moves = {}, finishCalled = false;

// 1) Crear sala
createBtn.addEventListener('click', async () => {
  const res = await fetch('/api/create', { method: 'POST' });
  const { gameId: newId } = await res.json();
  gameIdInput.value = newId;
  alert(`Sala creada: ${newId}\nComparte este código para que tu amigo se una`);
});

// 2) Unirse (o el creador también usa este botón)
joinBtn.addEventListener('click', async () => {
  gameId = gameIdInput.value.trim();
  if (!gameId) return alert('Introduce un ID de partida');

  try {
    const res = await fetch('/api/join', {
      method: 'POST',
      headers:{'Content-Type':'application/json'},
      body: JSON.stringify({ gameId })
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || res.status);
    }
    const { symbol } = await res.json();
    playerSymbol = symbol;

    // UI: ocultar controles, mostrar sala y marcador
    controlsEl.style.display = 'none';
    roomInfoEl.textContent   = `Sala: ${gameId}`;
    fetchScore();

    // Iniciar tablero y polling
    initBoard();
    startPolling();

    // Avisar al servidor cuando salgamos
    window.addEventListener('beforeunload', async () => {
      await fetch('/api/leave', {
        method:'POST',
        headers:{'Content-Type':'application/json'},
        body: JSON.stringify({ gameId })
      });
    });
  } catch (err) {
    alert('No se pudo unir: ' + err.message);
    console.error(err);
  }
});

// 3) Tablero
function initBoard() {
  boardEl.innerHTML = '';
  for (let i = 0; i < 9; i++) {
    const cell = document.createElement('div');
    cell.id        = 'cell-' + i;
    cell.className = 'cell';
    cell.addEventListener('click', () => makeMove(i));
    boardEl.appendChild(cell);
  }
  turn  = 'X';
  moves = {};
  renderStatus();
}

// 4) Movimientos
async function makeMove(i) {
  if (turn !== playerSymbol || moves[i]) return;
  await fetch('/api/move', {
    method:'POST',
    headers:{'Content-Type':'application/json'},
    body: JSON.stringify({ gameId, idx: i, symbol: playerSymbol })
  });
  moves[i] = playerSymbol;
  turn      = playerSymbol === 'X' ? 'O' : 'X';
  renderBoard();
  renderStatus();
}

// 5) Polling de estado
async function fetchState() {
  const res  = await fetch(`/api/state?gameId=${encodeURIComponent(gameId)}`);
  const data = await res.json();
  turn = data.turn;
  moves = {};
  for (let k in data) {
    if (k.startsWith('cell:')) moves[k.split(':')[1]] = data[k];
  }
}
function startPolling() {
  setInterval(async () => {
    await fetchState();
    renderBoard();
    renderStatus();
  }, 1000);
}

// 6) Dibujar
function renderBoard() {
  for (let i = 0; i < 9; i++) {
    const c = document.getElementById('cell-' + i);
    c.textContent = moves[i] || '';
    c.classList.toggle('disabled', !!moves[i]);
  }
}

// 7) Estado, victoria y marcador
function renderStatus() {
  const w = checkWinner();
  if (w) {
    statusEl.textContent = w === 'draw'
      ? '¡Empate!'
      : `Gana '${w}'`;

    // bloquea todas
    document.querySelectorAll('.cell')
      .forEach(c => c.classList.add('disabled'));

    // una sola vez: notificar resultado
    if (!finishCalled) {
      finishCalled = true;
      fetch('/api/finish', {
        method:'POST',
        headers:{'Content-Type':'application/json'},
        body: JSON.stringify({ gameId, winner: w })
      }).then(fetchScore);
    }
  } else {
    statusEl.textContent = turn === playerSymbol
      ? `Tu turno ('${playerSymbol}')`
      : `Turno de '${turn}'`;
  }
}

// 8) Lógica de ganador/empate
function checkWinner() {
  const combos = [
    [0,1,2],[3,4,5],[6,7,8],
    [0,3,6],[1,4,7],[2,5,8],
    [0,4,8],[2,4,6]
  ];
  for (const [a,b,c] of combos) {
    if (moves[a] && moves[a] === moves[b] && moves[b] === moves[c]) {
      return moves[a];
    }
  }
  return Object.keys(moves).length === 9 ? 'draw' : null;
}

// 9) Traer marcador global
async function fetchScore() {
  const res  = await fetch('/api/score');
  const { X=0, O=0 } = await res.json();
  scoreboardEl.textContent = `Marcador → X: ${X} | O: ${O}`;
}
