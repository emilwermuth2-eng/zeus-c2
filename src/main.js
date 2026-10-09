import { initOsintMap } from './app/osint.js';
import { initC2Console } from './ui/panels/c2console/index.js';
import { initBeaconList } from './ui/panels/c2console/beacons.js';
import { C2Service } from './services/c2service.js';

const c2 = new C2Service();

// Tab navigation
document.querySelectorAll('.rail-tab').forEach(tab => {
  tab.addEventListener('click', () => {
    document.querySelectorAll('.rail-tab').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.panel').forEach(p => p.classList.remove('active'));
    tab.classList.add('active');
    document.getElementById(`panel-${tab.dataset.panel}`).classList.add('active');
  });
});

// Wire teamserver status indicator
c2.on('status', ({ state, label }) => {
  const dot = document.getElementById('c2-indicator');
  const lbl = document.getElementById('c2-label');
  dot.className = `status-dot ${state}`;
  lbl.textContent = `Teamserver: ${label}`;
});

// Boot panels
initOsintMap();
initC2Console(document.getElementById('c2-console-root'), c2);
initBeaconList(document.getElementById('beacon-list-root'), c2);
