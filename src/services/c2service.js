/**
 * C2Service — manages the WebSocket connection to the Zeus proxy,
 * which relays to the Havoc teamserver. Emits events consumed by
 * the console and beacon panels.
 */
export class C2Service extends EventTarget {
  #ws = null;
  #beacons = new Map();
  #reconnectTimer = null;
  #reconnectDelay = 2000;

  constructor() {
    super();
  }

  connect() {
    if (this.#ws?.readyState === WebSocket.OPEN) return;

    this.#emit('status', { state: 'connecting', label: 'Connecting…' });

    const proto = location.protocol === 'https:' ? 'wss:' : 'ws:';
    this.#ws = new WebSocket(`${proto}//${location.host}/ws/havoc`);

    this.#ws.addEventListener('open', () => {
      this.#reconnectDelay = 2000;
      this.#emit('status', { state: 'connected', label: 'Connected' });
      this.#emit('log', { level: 'info', text: '[zeus] Connected to teamserver' });
    });

    this.#ws.addEventListener('message', ({ data }) => {
      try {
        this.#handle(JSON.parse(data));
      } catch {
        this.#emit('log', { level: 'warn', text: `[zeus] Bad frame: ${data}` });
      }
    });

    this.#ws.addEventListener('close', () => {
      this.#emit('status', { state: 'disconnected', label: 'Disconnected' });
      this.#emit('log', { level: 'warn', text: '[zeus] Connection closed — retrying…' });
      this.#scheduleReconnect();
    });

    this.#ws.addEventListener('error', () => {
      this.#emit('log', { level: 'error', text: '[zeus] WebSocket error' });
    });
  }

  disconnect() {
    clearTimeout(this.#reconnectTimer);
    this.#ws?.close();
    this.#ws = null;
  }

  sendTask(beaconId, command) {
    this.#send({ type: 'task', beacon: beaconId, command });
    this.#emit('log', { level: 'input', text: `[${beaconId}] ${command}` });
  }

  getBeacons() {
    return [...this.#beacons.values()];
  }

  // ── private ─────────────────────────────────────────────

  #handle(msg) {
    switch (msg.type) {
      case 'beacon/register':
        this.#beacons.set(msg.beacon.id, msg.beacon);
        this.#emit('beacons', { beacons: this.getBeacons() });
        this.#emit('log', {
          level: 'success',
          text: `[+] New beacon: ${msg.beacon.id}  ${msg.beacon.hostname}\\${msg.beacon.username}  (${msg.beacon.os})`,
        });
        break;

      case 'beacon/remove':
        this.#beacons.delete(msg.beaconId);
        this.#emit('beacons', { beacons: this.getBeacons() });
        this.#emit('log', {
          level: 'warn',
          text: `[-] Beacon exited: ${msg.beaconId}`,
        });
        break;

      case 'task/output':
        this.#emit('output', { beaconId: msg.beacon, output: msg.output });
        this.#emit('log', { level: 'output', text: msg.output, beaconId: msg.beacon });
        break;

      case 'event/log':
        this.#emit('log', { level: msg.level ?? 'info', text: msg.text });
        break;
    }
  }

  #send(obj) {
    if (this.#ws?.readyState === WebSocket.OPEN) {
      this.#ws.send(JSON.stringify(obj));
    }
  }

  #scheduleReconnect() {
    clearTimeout(this.#reconnectTimer);
    this.#reconnectTimer = setTimeout(() => this.connect(), this.#reconnectDelay);
    this.#reconnectDelay = Math.min(this.#reconnectDelay * 1.5, 30000);
  }

  #emit(eventName, detail) {
    this.dispatchEvent(new CustomEvent(eventName, { detail }));
  }

  on(event, cb) {
    this.addEventListener(event, e => cb(e.detail));
    return this;
  }
}
