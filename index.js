import express from 'express';
import bodyParser from 'body-parser';
import { createServer } from 'http';
import { WebSocketServer } from 'ws';

const app = express();
const server = createServer(app);

// Set up WebSocket server
const wss = new WebSocketServer({ server });

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

const clients = new Set();

wss.on('connection', (ws) => {
  console.log('🔌 WebSocket client connected');
  clients.add(ws);

  ws.on('close', () => {
    console.log('❌ WebSocket client disconnected');
    clients.delete(ws);
  });
});


app.post('/webhook', (req, res) => {
    console.log('📨 Event received:', req.body);

    // Broadcast to all WebSocket clients
    for (const client of clients) {
        if (client.readyState === client.OPEN) {
        client.send(JSON.stringify(req.body));
        }
    }

    res.sendStatus(200);
});


const port = process.env.PORT || 5000;
server.listen(port, () => {
  console.log(`🚀 Server and WebSocket running on port ${port}`);
});