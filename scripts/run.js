// Run one of the shell scripts with a bash that can see Windows.
//
// `bash` on this machine resolves to WSL, whose filesystem and environment are
// separate: no LOCALAPPDATA, no USERPROFILE, no /c, and rclone.exe invisible
// under a Linux $HOME. Every script here drives the Windows rclone and its
// Windows config, so they need Git Bash specifically.
//
//   node scripts/run.js setup-b2
//   node scripts/run.js mirror-archive 01 04

const { spawnSync } = require('node:child_process');
const { existsSync } = require('node:fs');
const path = require('node:path');

const CANDIDATES = [
  'C:/Program Files/Git/bin/bash.exe',
  'C:/Program Files (x86)/Git/bin/bash.exe',
  `${process.env.LOCALAPPDATA || ''}/Programs/Git/bin/bash.exe`,
];

function findBash() {
  if (process.platform !== 'win32') return 'bash';
  for (const c of CANDIDATES) if (c && existsSync(c)) return c;
  return null;
}

const [script, ...rest] = process.argv.slice(2);
if (!script) {
  console.error('usage: node scripts/run.js <script-name> [args...]');
  process.exit(1);
}

const bash = findBash();
if (!bash) {
  console.error('Git Bash not found. These scripts need it — plain `bash` here is WSL,');
  console.error('which cannot see the Windows rclone config. Install Git for Windows.');
  process.exit(1);
}

const file = path.join(__dirname, `${script}.sh`);
if (!existsSync(file)) {
  console.error(`no such script: ${file}`);
  process.exit(1);
}

const res = spawnSync(bash, [file, ...rest], { stdio: 'inherit' });
process.exit(res.status === null ? 1 : res.status);
