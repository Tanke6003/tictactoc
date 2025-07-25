// Referencias al DOM
const gameIdInput = document.getElementById('gameId');
const joinBtn     = document.getElementById('joinBtn');
const controlsEl  = document.getElementById('controls');
const roomInfoEl  = document.getElementById('roomInfo');
const statusEl    = document.getElementById('status');
const boardEl     = document.getElementById('board');

let gameId, playerSymbol, turn, moves = {};

// 1) Unirse a la partida
joinBtn.addEventListener('click', async () => {
  gameId = gameIdInput.value.trim();
  if (!gameId) return alert('Introduce un ID de partida');

  try {
    const res = await fetch('/api/join', {
      method: 'POST',
      headers: {'Content-Type':'application/json'},
      body: JSON.stringify({ gameId })
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || res.status);
    }
    const { symbol } = await res.json();
    playerSymbol = symbol;   // 'X' u 'O'

    // Oculta controles y muestra sala
    controlsEl.style.display = 'none';
    roomInfoEl.textContent   = `Sala: ${gameId}`;

    // Prepara tablero y polling
    initBoard();
    startPolling();
  } catch (err) {
    alert('No se pudo unir: ' + err.message);
    console.error(err);
  }
});

// 2) Crear tablero y set inicial
function initBoard() {
  boardEl.innerHTML = '';
  for (let i = 0; i < 9; i++) {
    const cell = document.createElement('div');
    cell.id    = 'cell-' + i;
    cell.className = 'cell';
    cell.addEventListener('click', () => makeMove(i));
    boardEl.appendChild(cell);
  }
  turn  = 'X';
  moves = {};
  renderStatus();
}

// 3) Enviar movimiento
async function makeMove(i) {
  if (turn !== playerSymbol || moves[i]) return;

  await fetch('/api/move', {
    method: 'POST',
    headers: {'Content-Type':'application/json'},
    body: JSON.stringify({ gameId, idx: i, symbol: playerSymbol })
  }).catch(e => console.error(e));

  // Refleja inmediatamente
  moves[i] = playerSymbol;
  turn      = playerSymbol === 'X' ? 'O' : 'X';
  renderBoard();
  renderStatus();
}

// 4) Leer estado del servidor
async function fetchState() {
  try {
    const res = await fetch(`/api/state?gameId=${encodeURIComponent(gameId)}`);
    const data = await res.json();
    // Turno
    turn = data.turn;
    // Jugadas
    moves = {};
    for (let k in data) {
      if (k.startsWith('cell:')) {
        const idx = k.split(':')[1];
        moves[idx] = data[k];
      }
    }
  } catch (e) {
    console.error('fetchState:', e);
  }
}

// 5) Polling cada segundo
function startPolling() {
  setInterval(async () => {
    await fetchState();
    renderBoard();
    renderStatus();
  }, 1000);
}

// 6) Dibujar jugadas
function renderBoard() {
  for (let i = 0; i < 9; i++) {
    const c = document.getElementById('cell-' + i);
    c.textContent = moves[i] || '';
    c.classList.toggle('disabled', !!moves[i]);
  }
}

// 7) Mostrar estado y ganador
function renderStatus() {
  const w = checkWinner();
  if (w) {
    statusEl.textContent = w === 'draw'
      ? '¡Empate!'
      : `Gana '${w}'`;
    document.querySelectorAll('.cell')
      .forEach(c => c.classList.add('disabled'));
  } else {
    statusEl.textContent = turn === playerSymbol
      ? `Tu turno ('${playerSymbol}')`
      : `Turno de '${turn}'`;
  }
}

// 8) Detectar ganador o empate
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
