"""Re-extract the original curriculum HTML into ES modules under src/content/legacy/.
Usage:  python3 scripts/extract.py [path/to/original.html]
Content is copied verbatim; the only edits are the PATCH blocks below (2D-guide snapshot,
reduced-motion flag and teardown hook for the widget engine, progress passed in by the app)."""
import re, sys, os
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
src = sys.argv[1] if len(sys.argv) > 1 else os.path.join(ROOT, 'original', 'computational-science-curriculum.html')
html = open(src, encoding='utf-8').read()
js = html[html.index('<script>') + 8: html.index('</script>')]
OUT = os.path.join(ROOT, 'src', 'content', 'legacy')
def cut(a_marker, b_marker, start=0):
    a = js.index(a_marker, start); b = js.index(b_marker, a+1)
    return js[a:b]
HDR = "/* AUTO-EXTRACTED from the original computational-science-curriculum.html.\n   Content is unchanged except where marked PATCH. Do not hand-edit; re-run scripts/extract.py. */\n/* eslint-disable */\n// @ts-nocheck\n"
# ---------- curriculum ----------
i_stages = js.index('const STAGES')
i_win3d = js.index('const WIN3D')
i_dom = js.index('const DOMAIN_HUE')
OVR = ['s0p2','s1p5','s1p4','s3p2','s5p1','s4p1','s4p4','s4p6','s5p6']
cur = HDR + js[i_stages:i_win3d] + \
  "\n/* PATCH: keep the 2D (pygame) guides that the Ursina blocks below overwrite (audit item A2). */\nconst GUIDES_2D = {};\n" + \
  repr(OVR).replace("'",'"') + ".forEach(k=>{ GUIDES_2D[k] = GUIDES[k]; });\n\n" + js[i_win3d:i_dom] + \
  "\nexport { STAGES, PROJECTS, CAPSTONE, GUIDES, GUIDES_2D, S };\n"
open(os.path.join(OUT,'curriculum.js'),'w').write(cur)

# ---------- viz ----------
i_qc = js.index('const QC ='); i_esc = js.index('const ESC ='); i_p = js.index('const P_ =')
viz = js[i_qc:i_esc]
helpers = js[i_esc:i_p]
# PATCH buildViz: app-level reduced motion + cleanup hook
old = "const reduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;"
assert old in viz
viz = viz.replace(old, "const reduced = (globalThis.__CSLAB_REDUCED_MOTION__ === true) || (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches); /* PATCH: app setting */")
old2 = "  c.resize(); redrawOnce();\n  return root;\n}"
assert old2 in viz
viz = viz.replace(old2, """  c.resize(); redrawOnce();
  /* PATCH: teardown so the single-page app does not leak listeners/animation frames */
  root.__destroy = ()=>{ visible=false; if(raf) cancelAnimationFrame(raf); raf=null; try{ro.disconnect(); io.disconnect();}catch(e){}
    if(spec.pointer){ window.removeEventListener('mousemove',root.__mv); window.removeEventListener('mouseup',root.__up); window.removeEventListener('touchend',root.__up); } };
  return root;
}""")
old3 = "canvas.addEventListener('mousedown',dn); window.addEventListener('mousemove',mv); window.addEventListener('mouseup',up);"
assert old3 in viz
viz = viz.replace(old3, "root.__mv=mv; root.__up=up; "+old3)
out = HDR + helpers + "\n" + viz + "\nexport { QC, VIZ, makeCtx, buildViz, rk4, fmtN, ESC, ESCA, fmt, plain };\n"
open(os.path.join(OUT,'viz.js'),'w').write(out)

# ---------- guide extras ----------
parts = []
parts.append(js[i_p:js.index('function spokenCode')])            # P_, UL_, ...
parts.append(js[js.index('function spokenCode'):js.index('let OS =')])  # spokenCode, codeBlock
parts.append("let OS = 'unix';\nfunction setOS(v){ OS = v; }\nfunction getOS(){ return OS; }\n")
parts.append(js[js.index('function osToggleHTML'):js.index('const STEPS_KEY')])
parts.append("/* PATCH: progress object is passed in by the app store instead of read from localStorage */\nlet guideProgress = {};\nconst gp = id => (guideProgress[id] = guideProgress[id] || {});\nfunction setGuideProgress(o){ guideProgress = o || {}; }\nconst completed = { has: () => false };\n")
parts.append(js[js.index('function stepHTML'):js.index('const LAB =')])
lab = js[js.index('const LAB ='):js.index('function renderLab')]
parts.append(lab)
parts.append(js[js.index('function guideMarkdown'):js.index('function downloadText')])
setup = js[js.index('const URSINA_TEMPLATE'):js.index('/* =========================================================\n   READER')]
# PATCH renderSetup -> returns html string
setup = setup.replace("function renderSetup(){\n  const root = document.getElementById('setupRoot'); if(!root) return;", "function setupPageHTML(){")
setup = setup.replace("  root.innerHTML = `", "  return `", 1)
k = setup.index("  root.querySelectorAll('input[data-step]')")
k2 = setup.index("\n}", k)
setup = setup[:k] + setup[k2+1:]
parts.append(setup)
ext = HDR + "import { VIZ, ESC, ESCA, fmt, plain } from './viz.js';\nimport { PROJECTS, GUIDES } from './curriculum.js';\nconst projectById = id => PROJECTS.find(p=>p.id===id);\nconst vizBlock = (name, cap) => `<div class=\"vizwrap\"><div data-viz=\"${name}\"></div><p class=\"viz-cap\">${fmt(cap||'')}</p></div>`;\n" + "\n".join(parts) + \
  "\nexport { HERO_VIZ, STEP_VIZ, LAB, setOS, getOS, setGuideProgress, buildTree, projectCommands, comeBackCommands, setupStepFor, gitStepFor, stepHTML, codeBlock, guideMarkdown, setupStepsData, setupPageHTML, URSINA_TEMPLATE, PYGAME_TEMPLATE, PY_KIT };\n"
open(os.path.join(OUT,'guideExtras.js'),'w').write(ext)
print("ok", len(cur), len(out), len(ext))
