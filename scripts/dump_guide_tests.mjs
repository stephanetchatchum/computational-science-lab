// Writes the exact pytest files a learner builds from the guides (all audit items approved),
// so scripts/reference/<project>/ solutions can be tested against them. Usage: node scripts/dump_guide_tests.mjs s3p1 s3p2 ...
import { createServer } from 'vite';
import fs from 'node:fs';
import path from 'node:path';
const ids = process.argv.slice(2);
const server = await createServer({ server: { middlewareMode: true, hmr: false }, appType: 'custom', logLevel: 'silent' });
try {
  const { buildProjects, defaultApprovals } = await server.ssrLoadModule('/src/content/curriculum.ts');
  const { effectiveGuide } = await server.ssrLoadModule('/src/content/guides.ts');
  const a = defaultApprovals();
  for (const p of buildProjects(a).filter(p => ids.includes(p.id))) {
    const g = effectiveGuide(p, a); const files = {}; let first = null;
    for (const s of g.steps) {
      if (!/^def test_/m.test(s.code ?? '')) continue;
      const m = (s.run ?? '').match(/tests\/(test_\w+\.py)/); const f = m ? m[1] : first; first ??= f;
      files[f] = (files[f] ? files[f] + '\n\n' : '') + s.code;
    }
    const dir = path.join('scripts', 'reference', p.id, 'tests'); fs.mkdirSync(dir, { recursive: true });
    for (const [f, code] of Object.entries(files)) fs.writeFileSync(path.join(dir, f), code + '\n');
    console.log(p.id, Object.keys(files).join(', '));
  }
} finally { await server.close(); }
