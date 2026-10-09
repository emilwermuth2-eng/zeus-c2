export function initBeaconList(root, c2) {
  root.innerHTML = `
    <div class="beacon-panel">
      <div class="beacon-header">
        <span class="beacon-title">ACTIVE BEACONS</span>
        <span id="beacon-count" class="beacon-count">0</span>
      </div>
      <table class="beacon-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Hostname</th>
            <th>User</th>
            <th>OS</th>
            <th>PID</th>
            <th>Arch</th>
            <th>Last Seen</th>
            <th>Sleep</th>
          </tr>
        </thead>
        <tbody id="beacon-tbody"></tbody>
      </table>
      <div id="beacon-empty" class="beacon-empty">No active beacons</div>
    </div>
  `;

  const tbody = root.querySelector('#beacon-tbody');
  const count = root.querySelector('#beacon-count');
  const empty = root.querySelector('#beacon-empty');

  c2.on('beacons', ({ beacons }) => {
    count.textContent = beacons.length;
    empty.style.display = beacons.length ? 'none' : 'flex';

    tbody.innerHTML = beacons.map(b => `
      <tr class="beacon-row" data-id="${b.id}">
        <td class="beacon-id">${b.id}</td>
        <td>${b.hostname ?? '—'}</td>
        <td>${b.username ?? '—'}</td>
        <td>${b.os ?? '—'}</td>
        <td>${b.pid ?? '—'}</td>
        <td>${b.arch ?? '—'}</td>
        <td class="beacon-seen">${b.lastSeen ? new Date(b.lastSeen).toLocaleTimeString() : '—'}</td>
        <td>${b.sleep != null ? `${b.sleep}s` : '—'}</td>
      </tr>
    `).join('');
  });
}
