const WebSocket = require('ws');

const PORT = process.env.PORT || 8080;

const wss = new WebSocket.Server({ port: PORT });

const players = {};

wss.on('connection', function connection(ws) {
  const playerId = Date.now().toString();
  players[playerId] = { x: 100, y: 100 };

  console.log(`Player connected: ${playerId}`);

  ws.send(JSON.stringify({ type: 'init', playerId, players }));

  broadcast({ type: 'newPlayer', playerId, position: players[playerId] }, ws);

  ws.on('message', function incoming(message) {
    const data = JSON.parse(message);

    if (data.type === 'move') {
      players[playerId].x += data.dx;
      players[playerId].y += data.dy;

      broadcast({ type: 'move', playerId, position: players[playerId] });
    }
  });

  ws.on('close', function () {
    console.log(`Player disconnected: ${playerId}`);
    delete players[playerId];
    broadcast({ type: 'removePlayer', playerId });
  });
});

function broadcast(data, excludeWs) {
  wss.clients.forEach(function each(client) {
    if (client !== excludeWs && client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify(data));
    }
  });
}

console.log(`WebSocket server started on port ${PORT}`);
