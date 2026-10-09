import { Terminal } from 'xterm';
import { FitAddon } from '@xterm/addon-fit';
import { WebLinksAddon } from '@xterm/addon-web-links';

export function buildTerminal(container) {
  const term = new Terminal({
    theme: {
      background:  '#0a0d12',
      foreground:  '#c8d8e8',
      cursor:      '#7b5cf5',
      black:       '#0a0d12',
      brightBlack: '#3d5060',
      red:         '#ff3b5c',
      green:       '#00ff88',
      yellow:      '#ffaa00',
      blue:        '#4488ff',
      magenta:     '#7b5cf5',
      cyan:        '#00e5ff',
      white:       '#c8d8e8',
    },
    fontFamily: '"JetBrains Mono", "Fira Code", "Cascadia Code", monospace',
    fontSize: 13,
    lineHeight: 1.4,
    scrollback: 5000,
    cursorBlink: true,
    convertEol: true,
  });

  const fit   = new FitAddon();
  const links = new WebLinksAddon();
  term.loadAddon(fit);
  term.loadAddon(links);
  term.open(container);
  fit.fit();

  const ro = new ResizeObserver(() => fit.fit());
  ro.observe(container);

  return term;
}
