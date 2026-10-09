/**
 * Havoc teamserver WebSocket proxy.
 *
 * Havoc's teamserver speaks a JSON-over-WebSocket protocol.
 * Authentication frame (client → server):
 *   { "Head": 1, "Body": { "Head": "Service", "Data": { "Name": <op>, "Password": <pw> } } }
 *
 * This module:
 *  1. Accepts a WS connection from the browser (via /ws/havoc).
 *  2. Opens a WS connection to the Havoc teamserver.
 *  3. Handles the auth handshake automatically using env creds.
 *  4. Translates Havoc frames to Zeus wire format and vice-versa.
 */

import WebSocket from 'ws';

const HAVOC_HOST = process.env.HAVOC_HOST     ?? '127.0.0.1';
const HAVOC_PORT = parseInt(process.env.HAVOC_PORT ?? '40056', 10);
const OPERATOR   = process.env.HAVOC_OPERATOR ?? 'operator';
const PASSWORD   = process.env.HAVOC_PASSWORD ?? 'password';

// ── Zeus wire format (browser ↔ proxy) ──────────────────────
// Inbound  (browser → proxy): { type: 'task',  beacon: <id>, command: <str> }
// Outbound (proxy → browser): {
//   type: 'beacon/register' | 'beacon/remove' | 'task/output' | 'event/log',
//   ...fields
// }

export function attachHavocProxy(wss) {
  wss.on('connection', clientWs => {
    let serverWs = null;
    let authed   = false;
    const pending = [];

    const toClient = obj => {
      if (clientWs.readyState === WebSocket.OPEN) {
        clientWs.send(JSON.stringify(obj));
      }
    };

    const toServer = obj => {
      if (serverWs?.readyState === WebSocket.OPEN) {
        serverWs.send(JSON.stringify(obj));
      } else {
        pending.push(obj);
      }
    };

    // ── Open connection to Havoc teamserver ────────────────
    try {
      serverWs = new WebSocket(`ws://${HAVOC_HOST}:${HAVOC_PORT}`, {
        rejectUnauthorized: false,
      });
    } catch (err) {
      toClient({ type: 'event/log', level: 'error', text: `[proxy] Failed to connect: ${err.message}` });
      clientWs.close();
      return;
    }

    serverWs.on('open', () => {
      // Havoc auth handshake
      serverWs.send(JSON.stringify({
        Head: 1,
        Body: {
          Head: 'Service',
          Data: { Name: OPERATOR, Password: PASSWORD },
        },
      }));
    });

    serverWs.on('message', raw => {
      let msg;
      try { msg = JSON.parse(raw.toString()); } catch { return; }

      // Auth response
      if (!authed) {
        if (msg?.Head === 1 && msg?.Body?.Head === 'Service') {
          authed = true;
          toClient({ type: 'event/log', level: 'success', text: '[havoc] Authenticated to teamserver' });
          pending.forEach(p => serverWs.send(JSON.stringify(p)));
          pending.length = 0;
        } else {
          toClient({ type: 'event/log', level: 'error', text: '[havoc] Auth failed' });
          clientWs.close();
        }
        return;
      }

      // Translate Havoc events → Zeus wire format
      const body = msg?.Body;
      const head = body?.Head;

      if (head === 'Agent') {
        const d = body.Data;
        if (d?.Registered) {
          toClient({
            type: 'beacon/register',
            beacon: {
              id:       d.NameID ?? d.AgentID,
              hostname: d.Info?.Hostname,
              username: d.Info?.Username,
              os:       `${d.Info?.OSName ?? ''} ${d.Info?.OSVersion ?? ''}`.trim(),
              pid:      d.Info?.ProcessID,
              arch:     d.Info?.Arch,
              lastSeen: Date.now(),
              sleep:    d.Info?.SleepDelay,
            },
          });
        } else if (d?.Exited) {
          toClient({ type: 'beacon/remove', beaconId: d.NameID ?? d.AgentID });
        }
      } else if (head === 'Console') {
        toClient({
          type: 'task/output',
          beacon: body.Data?.AgentID,
          output: body.Data?.Message ?? '',
        });
      } else if (head === 'Chat') {
        toClient({ type: 'event/log', level: 'info', text: `[chat] ${body.Data?.Message}` });
      } else {
        // Forward unknown frames as raw log for debugging
        toClient({ type: 'event/log', level: 'info', text: `[havoc] ${JSON.stringify(msg)}` });
      }
    });

    serverWs.on('close', () => {
      toClient({ type: 'event/log', level: 'warn', text: '[havoc] Teamserver connection closed' });
      clientWs.close();
    });

    serverWs.on('error', err => {
      toClient({ type: 'event/log', level: 'error', text: `[havoc] ${err.message}` });
    });

    // ── Browser → teamserver ────────────────────────────────
    clientWs.on('message', raw => {
      let msg;
      try { msg = JSON.parse(raw.toString()); } catch { return; }

      if (msg.type === 'task' && msg.beacon && msg.command) {
        toServer({
          Head: 99,
          Body: {
            Head:  'Console',
            Data: {
              AgentID: msg.beacon,
              Message: msg.command,
            },
          },
        });
      }
    });

    clientWs.on('close', () => {
      serverWs?.close();
    });
  });
}
