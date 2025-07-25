// server.js
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

// Sirve los ficheros estáticos de la carpeta “public”
app.use(express.static(__dirname + '/public'));

io.on('connection', socket => {
  let sala = null;

  socket.on('join', gameId => {
    sala = gameId;
    socket.join(sala);
    const clientes = io.sockets.adapter.rooms.get(sala)?.size || 0;
    if (clientes <= 2) {
      // Asignar símbolo
      const symbol = clientes === 1 ? 'X' : 'O';
      socket.emit('joined', symbol);
    } else {
      socket.emit('full');
    }
  });

  socket.on('move', ({ idx, symbol }) => {
    // Reenvía el movimiento al otro cliente
    socket.to(sala).emit('move', { idx, symbol });
  });

  socket.on('disconnect', () => {
    if (sala) socket.leave(sala);
  });
});

const PORT = 3000;
server.listen(PORT, () => console.log(`Servidor escuchando en puerto ${PORT}`));
