// server.js
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

// Sirve archivos estáticos
app.use(express.static(path.join(__dirname, 'public')));
// Cualquier ruta va a index.html (SPA fallback)
app.get('*', (req, res) =>
  res.sendFile(path.join(__dirname, 'public', 'index.html'))
);

io.on('connection', socket => {
  let sala = null;
  socket.on('join', gameId => {
    sala = gameId;
    socket.join(sala);
    const count = io.sockets.adapter.rooms.get(sala)?.size || 0;
    if (count <= 2) {
      const symbol = count === 1 ? 'X' : 'O';
      socket.emit('joined', symbol);
    } else {
      socket.emit('full');
    }
  });
  socket.on('move', data => socket.to(sala).emit('move', data));
  socket.on('disconnect', () => sala && socket.leave(sala));
});

// Usa el puerto de Railway o 3000
const PORT = process.env.PORT || 3000;
server.listen(PORT, () =>
  console.log(`Escuchando en puerto ${PORT}`)
);
