const express = require('express');
const http = require('http');
const path = require('path');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

const PORT = process.env.PORT || 3000;
const players = new Map();

app.use(express.static(path.join(__dirname)));

app.get('/health', (_req, res) => {
  res.json({ ok: true, players: players.size });
});

io.on('connection', (socket) => {
  const spawn = {
    id: socket.id,
    x: 480,
    y: 300,
    species: 'Sparkit',
    level: 1,
    health: 100,
    maxHealth: 100
  };

  players.set(socket.id, spawn);
  socket.emit('state', { players: [...players.values()] });
  socket.broadcast.emit('state', { players: [...players.values()] });

  socket.on('player:update', (payload = {}) => {
    const current = players.get(socket.id) || { id: socket.id };
    const nextPlayer = {
      ...current,
      ...payload,
      id: socket.id
    };
    players.set(socket.id, nextPlayer);
    io.emit('state', { players: [...players.values()] });
  });

  socket.on('disconnect', () => {
    players.delete(socket.id);
    io.emit('state', { players: [...players.values()] });
  });
});

server.listen(PORT, () => {
  console.log(`PokeSurvivor server running on http://localhost:${PORT}`);
});
