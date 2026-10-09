import { buildTerminal } from './terminal.js';
import { buildTaskbar } from './taskbar.js';

export function initC2Console(root, c2) {
  // ── Layout ──────────────────────────────────────────────
  root.innerHTML = `
    <div class="c2-toolbar">
      <span class="c2-toolbar-title">C2 CONSOLE</span>
      <div class="c2-toolbar-actions">
        <button id="btn-connect" class="c2-btn primary">Connect</button>
        <button id="btn-clear"   class="c2-btn">Clear</button>
        <select id="beacon-select" class="c2-select">
          <option value="">— select beacon —</option>
        </select>
      </div>
    </div>
    <div class="c2-body">
      <div id="c2-terminal"></div>
    </div>
    <div id="c2-taskbar-root"></div>
  `;

  const terminal = buildTerminal(root.querySelector('#c2-terminal'));
  const select   = root.querySelector('#beacon-select');

  buildTaskbar(root.querySelector('#c2-taskbar-root'), {
    onSend(cmd) {
      const beaconId = select.value;
      if (!beaconId) { terminal.writeln('\x1b[33m[!] Select a beacon first\x1b[0m'); return; }
      c2.sendTask(beaconId, cmd);
    },
  });

  // ── Connect button ───────────────────────────────────────
  root.querySelector('#btn-connect').addEventListener('click', () => {
    c2.connect();
  });

  root.querySelector('#btn-clear').addEventListener('click', () => {
    terminal.clear();
  });

  // ── C2 event listeners ───────────────────────────────────
  c2.on('log', ({ level, text }) => {
    const color = {
      info:    '\x1b[36m',
      success: '\x1b[32m',
      warn:    '\x1b[33m',
      error:   '\x1b[31m',
      input:   '\x1b[35m',
      output:  '\x1b[37m',
    }[level] ?? '\x1b[37m';
    terminal.writeln(`${color}${text}\x1b[0m`);
  });

  c2.on('beacons', ({ beacons }) => {
    const current = select.value;
    select.innerHTML = '<option value="">— select beacon —</option>';
    beacons.forEach(b => {
      const opt = document.createElement('option');
      opt.value = b.id;
      opt.textContent = `${b.id} | ${b.hostname}\\${b.username} (${b.os})`;
      select.appendChild(opt);
    });
    if (current) select.value = current;
  });

  terminal.writeln('\x1b[35m ______\x1b[0m');
  terminal.writeln('\x1b[35m|__  / ___ _   _ ___\x1b[0m');
  terminal.writeln('\x1b[35m  / / / _ \\ | | / __|\x1b[0m');
  terminal.writeln('\x1b[35m / /_|  __/ |_| \\__ \\\x1b[0m');
  terminal.writeln('\x1b[35m/____|\\___|\\_,_|___/  C2\x1b[0m');
  terminal.writeln('');
  terminal.writeln('\x1b[36m[*] Click Connect to establish teamserver session\x1b[0m');
}
