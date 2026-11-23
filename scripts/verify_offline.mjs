// Checks that dist/sw.js lists every built file, so the whole app is saved for offline use.
// Run after `npm run build`: node scripts/verify_offline.mjs
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';
const walk = d => readdirSync(d).flatMap(n => { const p = join(d, n); return statSync(p).isDirectory() ? walk(p) : [relative('dist', p).split('\\').join('/')]; });
const sw = readFileSync('dist/sw.js', 'utf8');
const listed = JSON.parse(sw.match(/const FILES = (\[.*?\]);/)[1]);
const onDisk = walk('dist').filter(f => f !== 'sw.js');
const missing = onDisk.filter(f => !listed.includes(f));
const extra = listed.filter(f => f && !onDisk.includes(f));
if (missing.length || extra.length) { console.error('Offline list is wrong.', { missing, extra }); process.exit(1); }
console.log(`Offline OK: all ${onDisk.length} built files are saved by the service worker.`);
