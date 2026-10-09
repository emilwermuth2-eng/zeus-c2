import 'dotenv/config';
import express from 'express';
import { createServer } from 'http';
import { WebSocketServer } from 'ws';
import { attachHavocProxy } from './providers/havoc.js';

const app  = express();
const port = parseInt(process.env.SERVER_PORT ?? '3001', 10);

app.use(express.json());

// Health check
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', ts: Date.now() });
});

// ── HTTP server + WS upgrade ─────────────────────────────────
const server = createServer(app);

const havocWss = new WebSocketServer({ noServer: true });
attachHavocProxy(havocWss);

server.on('upgrade', (req, socket, head) => {
  if (req.url === '/ws/havoc') {
    havocWss.handleUpgrade(req, socket, head, ws => {
      havocWss.emit('connection', ws, req);
    });
  } else {
    socket.destroy();
  }
});

server.listen(port, () => {
  console.log(`[zeus] Server listening on :${port}`);
  console.log(`[zeus] Havoc proxy → ws://${process.env.HAVOC_HOST ?? '127.0.0.1'}:${process.env.HAVOC_PORT ?? '40056'}`);
});
