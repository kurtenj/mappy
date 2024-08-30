const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const Y = require('yjs');
const { WebsocketProvider } = require('y-websocket');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

const doc = new Y.Doc();

wss.on('connection', (ws) => {
  const provider = new WebsocketProvider(doc, ws);
});

const PORT = process.env.PORT || 3002;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});