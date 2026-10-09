#!/usr/bin/env node
/**
 * Zeus C2 setup — clones Gods Eye View as the OSINT base layer,
 * then copies the Zeus C2 overlay on top.
 */

import { execSync } from 'child_process';
import { existsSync, copyFileSync, mkdirSync, readdirSync, statSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const ROOT     = join(dirname(fileURLToPath(import.meta.url)), '..');
const GEV_DIR  = join(ROOT, 'gods-eye-view');
const GEV_REPO = 'https://github.com/bilawalsidhu/gods-eye-view.git';

function run(cmd, opts = {}) {
  console.log(`  $ ${cmd}`);
  execSync(cmd, { stdio: 'inherit', ...opts });
}

function copyDir(src, dest) {
  if (!existsSync(dest)) mkdirSync(dest, { recursive: true });
  for (const entry of readdirSync(src)) {
    const s = join(src, entry), d = join(dest, entry);
    if (statSync(s).isDirectory()) copyDir(s, d);
    else copyFileSync(s, d);
  }
}

// 1. Clone Gods Eye View
if (!existsSync(GEV_DIR)) {
  console.log('\n[1/3] Cloning Gods Eye View…');
  run(`git clone --depth 1 ${GEV_REPO} gods-eye-view`, { cwd: ROOT });
} else {
  console.log('\n[1/3] Gods Eye View already cloned — skipping');
}

// 2. Install Gods Eye View deps
console.log('\n[2/3] Installing Gods Eye View deps…');
run('npm ci', { cwd: GEV_DIR });

// 3. Install Zeus C2 deps
console.log('\n[3/3] Installing Zeus C2 deps…');
run('npm ci', { cwd: ROOT });

console.log(`
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  ⚡ Zeus C2 setup complete

  1. Copy .env.example → .env and fill in your keys
  2. Start Havoc teamserver (./teamserver)
  3. npm run dev
     Browser: http://localhost:4173
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
`);
