/// <reference types="vitest/config" />
import { defineConfig, type Plugin } from 'vite';
import react from '@vitejs/plugin-react';
import { createHash } from 'node:crypto';
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';

/** Every file in a folder, as paths relative to it with forward slashes. */
function walk(dir: string, root = dir): string[] {
  return readdirSync(dir).flatMap(n => {
    const p = join(dir, n);
    return statSync(p).isDirectory() ? walk(p, root) : [relative(root, p).split('\\').join('/')];
  });
}

/** Offline support: writes dist/sw.js, a service worker that saves every built file on the first visit. */
function offlinePlugin(): Plugin {
  return {
    name: 'cslab-offline',
    apply: 'build',
    generateBundle(_opts, bundle) {
      const files = new Set<string>(['', 'index.html']);
      for (const name of Object.keys(bundle)) files.add(name);
      for (const f of walk('public')) files.add(f);
      const list = [...files].sort();
      const hash = createHash('sha256');
      for (const [name, chunk] of Object.entries(bundle).sort(([a], [b]) => a.localeCompare(b)))
        hash.update(name).update(chunk.type === 'chunk' ? chunk.code : chunk.source);
      for (const f of walk('public').sort()) hash.update(f).update(readFileSync(join('public', f)));
      const sw = readFileSync('src/offline/sw.js', 'utf8')
        .replace("'__VERSION__'", JSON.stringify(hash.digest('hex').slice(0, 12)))
        .replace('__PRECACHE__', JSON.stringify(list));
      this.emitFile({ type: 'asset', fileName: 'sw.js', source: sw });
    },
  };
}

// base './' + HashRouter = the built app works from any sub-path (GitHub Pages, Netlify, a USB stick).
export default defineConfig({
  base: './',
  plugins: [react(), offlinePlugin()],
  build: { chunkSizeWarningLimit: 1500, sourcemap: false },
  test: {
    environment: 'jsdom',
    setupFiles: ['./tests/setup.ts'],
    include: ['tests/**/*.test.{ts,tsx}'],
  },
});
