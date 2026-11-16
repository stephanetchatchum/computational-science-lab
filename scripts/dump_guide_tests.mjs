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
    // Guides often say "add X to the import line" in prose; the learner's file then imports it. Mirror that by
    // importing every name from the project's own modules first (explicit imports in the code still run as written).
    const mods = (g.guide.files ?? []).map(([f]) => f).filter(f => /^src\/(?!main|__init__).*\.py$/.test(f)).map(f => f.slice(4, -3).replace(/\//g, '.'));
    const prelude = mods.map(m => `try:\n    from src.${m} import *  # noqa  (see dump_guide_tests.mjs)\nexcept ModuleNotFoundError as e:\n    if e.name != 'src.${m}': raise`).join('\n');
    for (const [f, code] of Object.entries(files)) fs.writeFileSync(path.join(dir, f), (prelude ? prelude + '\n' : '') + code + '\n');
    console.log(p.id, Object.keys(files).join(', '));
  }
} finally { await server.close(); }
