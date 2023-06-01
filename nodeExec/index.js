const express = require('express');
const { createServer } = require('http');
const { Server } = require('ws');

const app = express();
const server = createServer(app);
const wss = new Server({ server });

wss.on('connection', (ws) => {
  ws.on('message', (message) => {
    console.log(`Received message: ${message}`);
    ws.send(`You sent: ${message}`);
  });

  ws.send('Connected to WebSocket server');
});

app.use(express.static('public'));

exports.handler = serverless(app);
