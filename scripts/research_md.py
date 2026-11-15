"""Regenerate docs/RESEARCH.md from src/content/research.json (the same data the in-app page uses)."""
import json, os
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
r = json.load(open(os.path.join(ROOT, 'src', 'content', 'research.json'), encoding='utf-8'))
out = ['# Learning-design research behind this application', '', '> ' + r['boundary'], '', '## Evidence strength labels', '']
out += [f'- **{k}** — {v}' for k, v in r['evidenceKey'].items()]
out += ['', '## Feature ← finding', '', '| Feature | Strength | ADHD-specific? |', '|---|---|---|']
out += [f"| {i['feature']} | {i['strength']} | {'yes' if i['adhdSpecific'] else 'no — general learning science'} |" for i in r['items']]
for i in r['items']:
    out += ['', f"### {i['feature']}", '', f"*Evidence: {i['strength']}; {'ADHD-specific' if i['adhdSpecific'] else 'general learning science'}.*", '', i['finding'], '']
    out += [f"- [{s['title']}]({s['url']})" for s in i['sources']] or ['- No direct outcome study; included as an optional, adjustable support.']
out += ['', '## What was deliberately left out', '',
        '- Points, streaks, badges and leaderboards: praise and reward feedback show low effects compared with informative feedback (Wisniewski et al., 2020), and the brief asked for no childish gamification.',
        '- Brain-training games: computerised cognitive training in adults with ADHD showed a small effect on cognition and no significant effect on symptoms (Elbe et al., 2023).',
        '- Mandatory timers or lockouts: no evidence supports a particular schedule; sessions are optional.',
        '- Claims of treatment: see NICE NG87 for clinical care.', '', '## Reference guidance', '']
out += [f"- [{s['title']}]({s['url']})" for s in r['references']]
open(os.path.join(ROOT, 'docs', 'RESEARCH.md'), 'w', encoding='utf-8').write('\n'.join(out) + '\n')
print('wrote docs/RESEARCH.md')
