const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const app = express();
const server = http.createServer(app);
const io = socketIo(server);
const { v4 : uuidv4 } = require('uuid');

// Serve static files
app.use(express.static('public'));

// Generate unique room IDs
app.get('/', (req, res) => {
    res.redirect(`/room/${uuidv4()}`);
});

app.get('/room', (req, res) => {
    res.redirect(`/room/${uuidv4()}`);
});

// Serve room page
app.get('/room/:roomId', (req, res) => {
  res.sendFile(__dirname + '/public/index.html');
});

// Socket.io for signaling
io.on('connection', (socket) => {
  socket.on('join-room', (roomId) => {
    socket.join(roomId);
    socket.to(roomId).emit('user-connected', socket.id);
  });

  socket.on('disconnect', () => {
    socket.broadcast.emit('user-disconnected', socket.id);
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});