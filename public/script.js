const socket = io();
const joinBtn = document.getElementById('joinBtn');
const gameIdInput = document.getElementById('gameId');
const statusEl  = document.getElementById('status');
const boardEl   = document.getElementById('board');

let playerSymbol = null;
let currentTurn  = 'X';
const moves      = {};

// 1) Unirse a sala
joinBtn.onclick = () => {
  const id = gameIdInput.value.trim();
  if (!id) return alert('Pon un ID válido');
  socket.emit('join', id);
};

// 2) Recibir asignación de símbolo
socket.on('joined', symbol => {
  playerSymbol = symbol;
  statusEl.textContent = `Eres '${playerSymbol}'. ¡A jugar!`;
  initBoard();
});

// 3) Sala llena
socket.on('full', () => {
  alert('La sala está llena.');
});

// 4) Otro jugador hace movimiento
socket.on('move', ({ idx, symbol }) => {
  moves[idx] = symbol;
  currentTurn = symbol === 'X' ? 'O' : 'X';
  renderBoard();
  renderStatus();
});

// Inicializa el tablero en el DOM
function initBoard() {
  boardEl.innerHTML = '';
  for (let i = 0; i < 9; i++) {
    const cell = document.createElement('div');
    cell.id = 'cell-' + i;
    cell.className = 'cell';
    cell.onclick = () => makeMove(i);
    boardEl.appendChild(cell);
  }
  renderStatus();
}

// Intentar jugar
function makeMove(i) {
  if (playerSymbol !== currentTurn) return;
  if (moves[i]) return;
  moves[i] = playerSymbol;
  socket.emit('move', { idx: i, symbol: playerSymbol });
  currentTurn = playerSymbol === 'X' ? 'O' : 'X';
  renderBoard();
  renderStatus();
}

// Dibuja los símbolos en el tablero
function renderBoard() {
  for (let i = 0; i < 9; i++) {
    const cell = document.getElementById('cell-' + i);
    cell.textContent = moves[i] || '';
    cell.classList.toggle('disabled', !!moves[i]);
  }
}

// Actualiza el mensaje de estado y comprueba victoria
function renderStatus() {
  const w = checkWinner();
  if (w) {
    statusEl.textContent = w === 'draw'
      ? '¡Empate!'
      : `Gana '${w}'`;
    document.querySelectorAll('.cell')
      .forEach(c => c.classList.add('disabled'));
  } else {
    statusEl.textContent = currentTurn === playerSymbol
      ? `Tu turno ('${playerSymbol}')`
      : `Turno de '${currentTurn}'`;
  }
}

// Lógica para determinar ganador o empate
function checkWinner() {
  const lines = [
    [0,1,2],[3,4,5],[6,7,8],
    [0,3,6],[1,4,7],[2,5,8],
    [0,4,8],[2,4,6]
  ];
  for (let [a,b,c] of lines) {
    if (moves[a] && moves[a] === moves[b] && moves[b] === moves[c]) {
      return moves[a];
    }
  }
  return Object.keys(moves).length === 9 ? 'draw' : null;
}
