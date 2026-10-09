const QUICK_COMMANDS = [
  { label: 'whoami',     cmd: 'whoami' },
  { label: 'ipconfig',   cmd: 'ipconfig /all' },
  { label: 'ps',         cmd: 'ps' },
  { label: 'pwd',        cmd: 'pwd' },
  { label: 'ls',         cmd: 'ls' },
  { label: 'getuid',     cmd: 'getuid' },
  { label: 'getsystem',  cmd: 'getsystem' },
  { label: 'screenshot', cmd: 'screenshot' },
];

export function buildTaskbar(root, { onSend }) {
  root.innerHTML = `
    <div class="c2-taskbar">
      <div class="c2-quickcmds">
        ${QUICK_COMMANDS.map(q => `
          <button class="c2-quick-btn" data-cmd="${q.cmd}">${q.label}</button>
        `).join('')}
      </div>
      <div class="c2-input-row">
        <span class="c2-prompt">❯</span>
        <input id="c2-cmd-input" class="c2-cmd-input"
               type="text" placeholder="enter command…"
               autocomplete="off" spellcheck="false" />
        <button class="c2-btn primary" id="btn-send">Send</button>
      </div>
    </div>
  `;

  const input = root.querySelector('#c2-cmd-input');
  const send  = () => {
    const v = input.value.trim();
    if (!v) return;
    onSend(v);
    input.value = '';
  };

  root.querySelector('#btn-send').addEventListener('click', send);
  input.addEventListener('keydown', e => { if (e.key === 'Enter') send(); });

  root.querySelectorAll('.c2-quick-btn').forEach(btn => {
    btn.addEventListener('click', () => onSend(btn.dataset.cmd));
  });
}
