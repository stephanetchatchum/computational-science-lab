/* AUTO-EXTRACTED from the original computational-science-curriculum.html.
   Content is unchanged except where marked PATCH. Do not hand-edit; re-run scripts/extract.py. */
/* eslint-disable */
// @ts-nocheck
import { VIZ, ESC, ESCA, fmt, plain } from './viz.js';
import { PROJECTS, GUIDES } from './curriculum.js';
const projectById = id => PROJECTS.find(p=>p.id===id);
const vizBlock = (name, cap) => `<div class="vizwrap"><div data-viz="${name}"></div><p class="viz-cap">${fmt(cap||'')}</p></div>`;
const P_ = t => `<p class="g-p" data-tts>${fmt(t)}</p>`;
const UL_ = a => `<ul class="g-ul">${a.map(i=>`<li data-tts>${fmt(i)}</li>`).join('')}</ul>`;
const OL_ = a => `<ol class="g-ol">${a.map(i=>`<li data-tts>${fmt(i)}</li>`).join('')}</ol>`;
const H2_ = t => `<h2 data-tts>${fmt(t)}</h2>`;
const H3_ = t => `<h3 class="g-sub" data-tts>${fmt(t)}</h3>`;
const SEC_ = (title, inner) => `<section class="g-sec">${H2_(title)}${inner}</section>`;


function spokenCode(s){
  return s.split('\n').map(l=>l.trim()).filter(Boolean).map(l=>l
    .replace(/\.venv/g,'dot venv').replace(/\//g,' slash ').replace(/\\/g,' backslash ')
    .replace(/_/g,' underscore ').replace(/\./g,' dot ').replace(/ -m /g,' dash m ')
    .replace(/-/g,' dash ').replace(/=/g,' equals ').replace(/>/g,' greater than ')
    .replace(/\$/g,' dollar ').replace(/~/g,' tilde ').replace(/\s+/g,' ').trim()
  ).join('. Then, ');
}
function codeBlock(text, kind, say){
  const spoken = kind==='cmd' ? spokenCode(text) : (say||'The code is on screen.');
  return `<div class="codewrap"><pre class="code ${kind}" data-tts="code" data-say="${ESCA(spoken)}">${ESC(text)}</pre><button class="copybtn" data-copy type="button">Copy</button></div>`;
}

/* =========================================================
   OS CHOICE + COMMAND BUILDERS
   ========================================================= */

let OS = 'unix';
function setOS(v){ OS = v; }
function getOS(){ return OS; }

function osToggleHTML(){
  return `<div class="ostoggle no-tts"><button type="button" data-os="win" class="${OS==='win'?'on':''}">Windows (PowerShell)</button><button type="button" data-os="unix" class="${OS==='unix'?'on':''}">Mac / Linux</button></div>`;
}

function buildTree(slug, files){
  const all = [['.gitignore','tells git what NOT to save'],['README.md','what this is + how to run it (you write it)'],['requirements.txt','exact package versions (made by pip freeze)'],['.venv/','your private Python install (made by the venv command, never edit it)']].concat(files);
  const root = {};
  all.forEach(([path,c])=>{
    const isDir = path.endsWith('/'); const parts = path.split('/').filter(Boolean); let n = root;
    parts.forEach((part,i)=>{
      const last = i===parts.length-1;
      if(!n[part]) n[part] = {name:part,kids:{},comment:null,dir:(!last||isDir)};
      if(last) n[part].comment = c;
      n = n[part].kids;
    });
  });
  const rows = [[slug+'/', null]];
  (function walk(kids,prefix){
    const list = Object.values(kids).sort((a,b)=>(a.dir-b.dir)||a.name.localeCompare(b.name));
    list.forEach((k,i)=>{
      const last = i===list.length-1;
      rows.push([prefix+(last?'└── ':'├── ')+k.name+(k.dir?'/':''), k.comment]);
      walk(k.kids, prefix+(last?'    ':'│   '));
    });
  })(root,'');
  const w = Math.max(...rows.map(r=>r[0].length)) + 3;
  return rows.map(r=> r[1] ? r[0].padEnd(w)+'← '+r[1] : r[0]).join('\n');
}

function projectCommands(slug, pkgs, files, os){
  const pk = ['pytest'].concat(pkgs||[]).join(' ');
  const clean = files.map(f=>f[0]);
  const dirs = [...new Set(clean.map(p=> p.endsWith('/') ? p.replace(/\/$/,'') : (p.includes('/') ? p.split('/').slice(0,-1).join('/') : null)).filter(Boolean))];
  const fileOnly = clean.filter(p=>!p.endsWith('/'));
  const hasData = clean.some(p=>p.startsWith('data/'));
  const ignore = ['.venv/','__pycache__/','*.pyc'].concat(hasData?['data/']:[]);
  if(os==='win'){
    const W = p=>p.replace(/\//g,'\\');
    const L = ['cd $HOME\\comp-science','mkdir '+slug,'cd '+slug,'py -m venv .venv','.venv\\Scripts\\Activate.ps1','pip install '+pk,
      'pip freeze | Out-File -Encoding ascii requirements.txt'];
    if(dirs.length) L.push('mkdir '+dirs.map(W).join(', '));
    L.push('New-Item -ItemType File -Force '+['README.md'].concat(fileOnly.map(W)).join(', '));
    L.push('Set-Content -Path .gitignore -Value '+ignore.map(i=>'"'+i+'"').join(','));
    L.push('git init','git add .','git commit -m "Start: empty project structure"');
    return L.join('\n');
  }
  const L = ['cd ~/comp-science','mkdir '+slug,'cd '+slug,'python3 -m venv .venv','source .venv/bin/activate','pip install '+pk,'pip freeze > requirements.txt'];
  if(dirs.length) L.push('mkdir -p '+dirs.join(' '));
  L.push('touch '+['README.md'].concat(fileOnly).join(' '));
  L.push("printf '"+ignore.join('\\n')+"\\n' > .gitignore");
  L.push('git init','git add .','git commit -m "Start: empty project structure"');
  return L.join('\n');
}
function comeBackCommands(slug, os){
  return os==='win' ? `cd $HOME\\comp-science\\${slug}\n.venv\\Scripts\\Activate.ps1` : `cd ~/comp-science/${slug}\nsource .venv/bin/activate`;
}

/* =========================================================
   GUIDE PROGRESS (checkbox state is remembered)
   ========================================================= */

/* PATCH: progress object is passed in by the app store instead of read from localStorage */
let guideProgress = {};
const gp = id => (guideProgress[id] = guideProgress[id] || {});
function setGuideProgress(o){ guideProgress = o || {}; }
const completed = { has: () => false };

function stepHTML(n, st, checked, extra){
  const doList = (st.do||[]).map(d=>`<li data-tts>${fmt(d)}</li>`).join('');
  return `<section class="step ${checked?'done':''}" id="step-${n}">
    <div class="step-h"><label class="step-chk"><input type="checkbox" data-step="${n}" ${checked?'checked':''} aria-label="Mark step ${n} as done"><span class="step-n">${n}</span></label>
    <h3 class="step-t" data-tts>Step ${n}. ${fmt(st.t)}</h3></div>
    ${st.why?`<p class="step-why" data-tts>${fmt(st.why)}</p>`:''}
    <div class="step-body">
      ${st.top||''}
      ${st.viz?`<div class="lbl lbl-viz" data-tts>See it before you build it</div>${vizBlock(st.viz, st.vizCap)}`:''}
      ${doList?`<div class="lbl" data-tts>Do this</div><ol class="do">${doList}</ol>`:''}
      ${st.tree?`<div class="lbl lbl-code" data-tts>Your folder should look like this</div>${codeBlock(st.tree,'tree','The folder map is on screen.')}`:''}
      ${st.code?`<div class="lbl lbl-code" data-tts>Write this in the file</div>${codeBlock(st.code,'file','The code for this step is on screen. Pause here and type it in.')}`:''}
      ${st.run?`<div class="lbl lbl-run" data-tts>Run this</div>${codeBlock(st.run,'cmd')}`:''}
      ${st.see?`<div class="lbl lbl-see" data-tts>You should see</div><div class="see" data-tts>${fmt(st.see)}</div>`:''}
      ${st.hint?`<div class="lbl lbl-hint" data-tts>Hint</div><div class="hint" data-tts>${fmt(st.hint)}</div>`:''}
      ${extra||''}
    </div></section>`;
}

function setupStepFor(p,g){
  return {
    t:'Create the project folder and install what it needs',
    why:'Do this once. It makes the folder, the private Python, the files, and your first git save.',
    top: osToggleHTML(),
    do:[
      'Open your terminal. On Windows that is **PowerShell**. On Mac it is **Terminal**. In VS Code press **Control and the backtick key**.',
      'Make sure you finished the **Setup** page first.',
      'Copy the whole block below, paste it into the terminal, and press **Enter**.',
      'Wait until it stops. Downloading packages can take a minute.'
    ],
    tree: buildTree(g.slug, g.files),
    run: projectCommands(g.slug, g.pip, g.files, OS),
    see:'Your terminal line now starts with **(.venv)**. The last lines say something like **[main (root-commit) 1a2b3c4] Start: empty project structure**. Some computers say **master** instead of **main**. Both are fine.',
    hint: OS==='win' ? 'If Windows says **running scripts is disabled**, run {{Set-ExecutionPolicy -Scope CurrentUser RemoteSigned}} then close the terminal, open a new one, and paste the block again.' : 'If a command says **command not found: python3**, go back to the Setup page and install Python.'
  };
}
function gitStepFor(p,g){
  return {
    t:'Write the README and save your work with git',
    why:'A project is finished when it is saved and someone else could run it.',
    do:[
      'Open **README.md** and write three lines. Line one: what this project is. Line two: the exact command that runs it. Line three: one thing you learned.',
      'In the terminal, inside the project folder, run the three commands below.'
    ],
    run:`git add .\ngit commit -m "Finish: ${p.title.split(':')[0].replace(/"/g,'')}"\ngit log --oneline`,
    see:'A short list. The newest save is at the top, and your first save, **Start: empty project structure**, is at the bottom.',
    hint:'Coming back another day? Run these two lines first, then carry on.\n' + comeBackCommands(g.slug, OS)
  };
}

/* =========================================================
   WIDGET ASSIGNMENT
   HERO_VIZ[projectId]      -> the demo shown in "Play with the idea first"
   STEP_VIZ[projectId][n]   -> a demo shown inside step n of g.steps
   Nothing in the guide text is altered; these only add.
   ========================================================= */
const HERO_VIZ = {
 s0p1:['uncertainty',
   'This is your project, already working. Two measurements, each with a margin of error, combined into one. Slide the two margins and watch the merged margin: it is always **smaller than the two added together**, and never smaller than the bigger of the two. The square root in the formula is what causes that. Your code will do exactly this arithmetic.'],
 s0p2:['cannon',
   'This is what you are building. Right now drag k is zero, so the range on screen matches the textbook formula exactly — check the two numbers below the picture against each other. Set θ to 45° and nothing beats it. Then push drag up and watch both things change: the range drops, and 45° stops being the best angle.'],
 s0p3:['growth',
   'Both curves use the same growth rate r and the same starting population. The only difference is the bracket **(1 − P/K)**, which shrinks toward zero as the population approaches the ceiling K. Watch the blue curve flatten exactly at the dashed line. That bracket is one extra term in one line of your code.'],
 s0p4:['lln',
   'Each purple dot is one noisy reading, like one day of weather data. The blue line is the running average. It swings wildly for the first few readings and then settles. Raise the noise and it takes longer to settle, but it still settles. Your dial will draw exactly this line, live.'],
 s1p1:['leastsq',
   '**Drag any blue point.** The red bars are the residuals — how much the line misses each point by. The fitted line is the one position where the total of their squares is as small as possible. Drag a single point far off and watch one bad year drag your whole climate trend with it.'],
 s1p2:['rootfind',
   'Press **Step** over and over. Bisection halves the blue bracket each time: reliable, but slow. Newton jumps along the tangent line and lands on √2 in about four presses. Count the presses each one needs — that count is the whole result of this project.'],
 s1p3:['eulerdrift',
   'A real spring keeps its energy forever. This one does not: the energy graph below climbs, so the swing grows. That is the simple Euler step quietly adding energy at every single step. Shrink Δt and it climbs slower, but it never stops climbing. You are meant to **see** this bug here, not fix it yet.'],
 s1p4:['boids',
   'This is your finished project. Switch the three rules off one at a time. Separation alone scatters them. Alignment alone points them the same way but leaves them spread out. Cohesion alone squashes them into a ball. Only all three together look like a flock — and nowhere in the code is there a rule that says "flock".'],
 s1p5:['forces',
   'Left: the falling body with its two force arrows. Orange is gravity, which never changes. Green is drag, which grows with speed and always points against the motion. When the two arrows are the same length the net force is zero and the speed graph on the right goes flat. That flat line is **terminal velocity**.'],
 s2p1:['gauss',
   'Press **Step**. Each press uses one row to knock out one number below the diagonal. Red cells must become green. Once they are all green the matrix is a staircase and you can read the answer off from the bottom row upward. The line under the grid is the exact row operation your code performs.'],
 s2p2:['montecarlo',
   'Darts land at random in the square. The fraction inside the circle, times four, is π. Watch the error figure: it falls fast at first, then crawls. That is the 1/√N law — **one hundred times more darts buys only ten times less error**. Knowing that is what stops you waiting all night for a fourth decimal place.'],
 s2p3:['overfit',
   'The yellow band on the right is data the fit has never seen. Raise the degree: the training error always falls, but the held-out error falls and then rises. That turn is **overfitting**. This is why your project hides the last years of emissions data before fitting anything.'],
 s2p4:['markov',
   'Every dot hops between dry, light rain and heavy rain using the same probability table. No single dot is predictable, yet the percentages at the bottom settle onto the dashed lines. Those dashed lines are the **stationary distribution** — the long-run climate, which you can also compute exactly from an eigenvector.'],
 s2p5:['power',
   'All five nodes start equally important. Press **Step**: each node hands its score to its neighbours, and the circles resize. After a few presses the scores stop changing. That settled pattern is the eigenvector, and it ranks a town highly when its neighbours are themselves well connected.'],
 s3p1:['integrators',
   'Same equation, same step size Δt, two methods. Euler drifts away from the exact curve; RK4 sits on top of it. Halve Δt and watch the two error numbers: Euler\'s halves, RK4\'s drops about sixteen-fold. That ratio is what "fourth-order accurate" actually means, and your project will measure it.'],
 s3p2:['orbit',
   'This is your project, running. Slide v₀ down and the circle becomes a stretched ellipse; the planet visibly **speeds up near the star and crawls at the far end**. Watch the two shaded wedges: they are swept in equal times and have equal areas. Meanwhile E and L below never move. If your own code lets E drift, you have a bug.'],
 s3p3:['seir',
   'β is how fast infection spreads, γ is how fast people recover. Only their ratio R₀ decides whether the outbreak takes off. Drag γ up until the R₀ box turns green — below 1 the epidemic dies without ever peaking. Notice too that the red peak always arrives just as the blue S curve crosses the dashed 1/R₀ line.'],
 s3p4:['predprey',
   'Left is the two populations over time: predators always peak **after** prey, never with them. Right is the same motion drawn as prey against predator, where it becomes a closed loop — and a loop means the cycle repeats forever. The small cross is the balance point where both rates are zero. Your fit to the real lynx and hare data must reproduce this shape.'],
 s3p5:['integral',
   'A battery\'s charge is an accumulation: every hour you add what the panels made and subtract what the house used. That running total is exactly the area under a curve, which is what this widget builds one slice at a time. More slices means a finer time step and a more honest answer — the same trade-off as your hourly simulation.'],
 s4p1:['heatcfl',
   'Slide r past **0.5** and watch the smooth curve tear itself to pieces within a few steps. Nothing is wrong with the code; the method itself fails above that number. Below 0.5 the heat simply fades away, which is what real heat does. Finding this exact limit yourself is the point of the project.'],
 s4p2:['plume',
   'Two things happen to a pollutant at once. **Advection** (the flow v) carries the peak downstream — compare the measured centre with the exact prediction below. **Diffusion** (D) flattens and widens it. Set D to zero and the pulse travels without spreading; set v to zero and it spreads without going anywhere.'],
 s4p3:['seir',
   'This smooth model assumes everybody mixes with everybody. Your project replaces that assumption with individual people on a real settlement map, who can only infect their neighbours. Play with β and γ here first, then watch how differently your agent version behaves with the same numbers — that difference is the finding.'],
 s4p4:['vectors',
   'Every force in a truss is an arrow, and every arrow splits into a horizontal and a vertical part. Drag the blue arrowhead: the green and orange arrows are the two components your solver actually works with. A joint is in balance when all the greens cancel and all the oranges cancel. That is the entire method.'],
 s4p5:['leastsq',
   'A trend is a slope, and a slope comes from the residuals — the red bars. Drag one point to an extreme value and watch the whole line tilt. Rainfall records contain exactly these outliers, which is why your project uses a rank-based test that ignores **how far** an outlier is, rather than this straight-line fit.'],
 s4p6:['wave',
   'Watch the pulse travel and keep its shape — unlike heat, which forgets its shape. At the purple boundary part of the wave **reflects**, and the bottom trace is what a surface sensor records: first the pulse, then the echo. Move the boundary and the echo arrives at a different time. Working backwards from that time is how you measure a depth you cannot see.'],
 s4p7:['plume',
   'Turing patterns need two ingredients, and this widget is the first one: **diffusion**, chemicals spreading out and smoothing themselves. Your project adds the second, a reaction that keeps making more. Spreading alone always flattens everything; spreading plus reaction, at two different speeds, is what produces stripes.'],
 s5p1:['orbit',
   'Here is the physics you are about to make fast — two bodies, honest gravity, conserved energy. Your project runs hundreds of bodies instead of two, which means the inner loop runs millions of times. Nothing about the physics changes when you optimise it, so the energy number below must stay just as flat afterwards.'],
 s5p2:['seir',
   'One run of the model gives one curve. Your project runs it hundreds of times with slightly different β and γ, because nobody knows those numbers exactly. Nudge the sliders a little and watch how far the peak moves — that sensitivity is precisely what the ensemble is built to measure.'],
 s5p3:['heatcfl',
   'A finer grid means a smaller Δx, and r = α·Δt/Δx² grows as the **square** of that. So doubling the resolution forces a four-times-smaller time step: four times as many steps, on four times as many points. That is sixteen times the work, and it is the reason this project is about speed.'],
 s5p4:['overfit',
   'A surrogate is a cheap stand-in for an expensive simulation, and it is only useful where it was trained. Raise the degree and watch the curve behave beautifully among the blue training points and absurdly in the yellow band. Your project must report held-out error, never training error.'],
 s5p5:['overfit',
   'Yield prediction is this picture with more inputs. The blue points are the seasons you trained on; the yellow band is the season you are actually trying to predict. A model that nails the past and misses the future is worthless to a farmer, so the held-out number below is the only one that counts.'],
 s5p6:['plume',
   'Flood water obeys the same two ideas as this plume: it is **carried** downhill by slope, and it **spreads** sideways. Your model solves this on a real elevation grid in two dimensions, but every term in your equation has a counterpart you can watch moving here.'],
 s6p2:['uncertainty',
   'Sensitivity analysis asks which input uncertainty actually matters. Start with the simplest possible case: two uncertain numbers added together. Make one margin large and the other tiny, then look at the combined value — **the small one barely contributes at all**. That is why your Sobol indices will come out so lopsided.'],
};

const STEP_VIZ = {
 s0p1:{5:['uncertainty','This is the function you are writing, in picture form. The merged blob is narrower than the two inputs added together, and the **saved** figure below tells you by how much. If your {{combine()}} returns the wider number, you have written a plus where a square root belongs.']},
 s0p2:{0:['rocket','Same loop, one extra twist: the mass changes. Thrust stays constant while the fuel drains, so a = F/m grows because m is shrinking. Raise the dry mass to 400 kg and watch the effect vanish \u2014 that is the rocket equation arguing with you.'],
       1:['cannon','This is {{simulate()}} running. Every frame it does the same three lines you are about to write: work out the acceleration, add it to the velocity, add the velocity to the position. The green arrow is the velocity it is carrying; the orange arrow is the acceleration it just computed.'],
       6:['cannon','Here is the experiment, already set up. Sweep θ with drag off: the best angle is 45°. Now set drag to 0.15 and sweep again — the best angle has moved, and the formula number no longer matches reality. Writing down **why** is the deliverable.']},
 s0p3:{1:['growth','The two functions you are writing, side by side, from the same starting point. Everything on screen comes from one extra bracket in the second one.'],
       5:['growth','Before fitting anything, get a feel for what you are fitting. Change K and r until the blue curve looks like the shape of a real population history. Those are the two numbers your fit is hunting for.']},
 s0p4:{1:['lln','The mean you are about to code, drawn as it accumulates. Note the σ/√n column: that is the theoretical width of the blue line\'s wobble, and your own numbers should follow it.'],
       7:['lln','"Settled" needs a definition, and this is where you choose one. Watch the running mean: it crosses the true value several times early on, then stays close. Raise the noise and the settling point moves later. Whatever rule you write must survive that slider.']},
 s1p1:{1:['leastsq','This is your line fit, and the red bars are the quantity it minimises. Drag a point: every red bar changes, and the line moves to the position where the squares of all of them add up to the least.'],
       6:['leastsq','"Trend or noise?" is a real question and this is how to feel it. Drag the points into a cloud with no tilt, then tilt it slightly. At what point would you be willing to claim a trend? That discomfort is why the next project uses a statistical test instead of an eyeball.']},
 s1p2:{1:['rootfind','Both of your solvers, side by side. Press **Step** and count: bisection needs about 27 presses to reach the accuracy Newton reaches in 4. Turn one of them off to watch the other alone.'],
       2:['derivative','This is the other half of the project. The orange line is your finite-difference estimate from two points h apart; the white line is the true tangent. Shrink h and the error column falls — and then, below a point, stops falling. Finding that point is the measurement.'],
       6:['rootfind','Newton fails when the tangent is nearly flat, because dividing by a tiny f′(x) throws you miles away. Step through here until you believe the method, then go and break it deliberately in your own code.']},
 s1p3:{0:['energybars','Before the bug, the physics. The bob trades kinetic energy for potential energy and back, and the white total bar never moves. Your spring does the same swap between \u00bdmv\u00b2 and \u00bdkx\u00b2 \u2014 and your Euler version will fail to keep that total still, which is the whole point of step 4.'],
       1:['eulerdrift','The physics you are writing, with its energy underneath. Right now the energy climbs, which is wrong, and that is not your fault — it is the method. Watch the figure labelled **gained**.'],
       4:['eulerdrift','Here is the bug you are about to make visible, already visible. Slide Δt from large to small: the climb slows but never flattens. Your version will draw this same graph from your own numbers.']},
 s1p4:{1:['boids','The three rules you are writing, each with its own switch. Turn two off and the third one\'s personality is obvious. This is the cleanest way to be sure your {{separation()}} really does separate.'],
       4:['boids','Do this here first, then in your own code. One rule on: scatter, or a line, or a ball. Watch the **order** bar at the bottom — it only reaches the top with all three on.']},
 s1p5:{1:['vectors','Each particle in your system stores a position and a velocity, and each of those is one of these arrows. Drag the arrowhead: the two faint arrows are the pair of numbers your code actually keeps, and the length is what {{abs()}} returns.'],
       4:['forces','"Independent" means each particle feels only gravity and drag, never its neighbours. Here is one particle doing exactly that. Your 80 particles should each behave like this one, and their speeds should all level off at the same terminal value if their masses match.']},
 s2p1:{1:['gauss','Press **Step** to watch the naive solver work. Each press is one row operation, and the line underneath spells it out in the same form your loop will use.'],
       6:['gauss','The naive method fails when a diagonal entry is zero, because the row operation divides by it. Step through here, then set up that situation in your own code and watch it produce nonsense before you add pivoting.']},
 s2p2:{1:['integral','One of your two functions, drawn. Raise N and the slice total creeps toward the exact answer. This is the deterministic way to get an area.'],
       4:['montecarlo','And this is the random way. Watch the error against 1/√N underneath: they track each other, which is the single most useful fact about Monte Carlo.'],
       5:['montecarlo','Before you trust it on a hard integral, trust it on π, where you know the answer. Let N climb to tens of thousands and see how slowly the fifth decimal place arrives. That slowness is the price of the method.']},
 s2p3:{1:['overfit','Your fit, with a degree slider on it. The honest score is the yellow one, and raising the degree makes it worse long before it looks worse.'],
       5:['overfit','"Honest winner" has a precise meaning here. Step the degree from 1 to 9 and write down the held-out error each time. The winner is the lowest of those, not the lowest training error — which is always degree 9.']},
 s2p4:{1:['markov','Your chain, running with 240 walkers at once. Change P(dry→dry) and watch both the crowd percentages and the dashed exact lines move together.'],
       4:['markov','This is the comparison you are being asked to make. The percentages are your simulated crowd; the dashed lines are the exact eigenvector answer. They should agree, and the gap below should shrink the longer you leave it running.']},
 s2p5:{1:['power','Your centrality calculation on a five-town map, one iteration per press. Press until the circles stop resizing — that is convergence, and the loop in your code ends on the same condition.'],
       6:['power','Two kinds of walkers, one answer. The settled circle sizes here are what a very large crowd of random walkers would also give you, because both are measuring the same eigenvector.']},
 s3p1:{1:['integrators','Both of your methods on the same screen with the same Δt. Halve Δt and watch the two error figures respond completely differently. That difference is the entire point of the project.'],
       5:['integrators','This is the error picture you are drawing, in miniature. Step Δt down and record both errors each time; on log paper Euler gives a slope of 1 and RK4 a slope of 4.']},
 s3p2:{1:['integrators','Your integrator choice decides whether the orbit closes or spirals. Here is why: Euler and RK4 on a simpler equation, same step size. Use RK4 in the orbit code and this is the accuracy you inherit.'],
       2:['orbit','The two functions you are writing are E and L, shown bottom right and in the figures below. Both must stay flat. A slow slide in E means your time step is too big or your integrator is wrong — nothing else causes it.'],
       5:['orbit','Three orbits, one slider. Slide v₀ from 1.0 down to 0.5 and watch the circle stretch into a long ellipse while the speed bar swings wildly between near and far. This is what your three test orbits should look like.'],
       6:['orbit','Turn **Equal areas** on and make a long ellipse. Every shaded wedge takes the same time to sweep and every one has the same area — that is Kepler\'s second law, and nobody put it in the code. It falls out of the force law for free, and the third law does too.']},
 s3p3:{1:['seir','The four equations you are writing, running. The only thing that decides whether this takes off is β/γ, shown in the box. Drag γ until that box turns green.'],
       4:['seir','This is the chart you are drawing, with the equations beside it. Note where the red peak lands: always at the moment the blue S curve crosses the dashed 1/R₀ line. Your version should show the same coincidence.'],
       5:['seir','Calibration means hunting for the β and γ that reproduce a real curve. Do it by hand here first, so you know what the search is searching for and roughly where it should end up.']},
 s3p4:{1:['predprey','Your two equations, running, with the phase loop beside them. Predators peak after prey every single cycle — if yours peak together, you have mixed up a sign.'],
       3:['predprey','The phase portrait you are drawing is on the right. A closed loop means the cycle repeats exactly; a spiral inward would mean it settles; a spiral outward would mean your integrator is leaking energy into the model.'],
       5:['predprey','Before fitting the Hudson Bay data, know what shape you are fitting. Change the starting prey count and watch the loop grow or shrink without changing shape — that is why the fit is about the cycle\'s size as much as its period.']},
 s3p5:{1:['integral','Your simulation adds up charge hour by hour, which is what this widget does slice by slice. Fewer slices means a coarser time step and a worse answer — compare the sum with the exact value as you raise N.']},
 s4p1:{1:['heatcfl','Your solver, running, with r on a slider. Below 0.5 it is boring and correct. Above 0.5 it destroys itself. Both behaviours come out of the same three lines you are writing.'],
       4:['heatcfl','"Break it on purpose" is this slider. Push r past 0.5 and watch the step number at which the curve first goes wild. Your own run should blow up at a similar step for the same r.'],
       5:['heatcfl','Keep r below 0.5 and watch the curve fade smoothly. That fading shape is a sine curve shrinking exponentially, which is the exact solution you will compare against.']},
 s4p2:{1:['plume','Your solver, with its two terms on separate sliders. Set D to zero to isolate advection, then v to zero to isolate diffusion, then turn both on. Your code does the same sum every step.'],
       4:['plume','Upwind matters because the advection term reaches **backwards** into the flow. Watch the measured centre track the exact prediction below; if your own centre drifts away from v·t, your difference is pointing the wrong way.'],
       5:['plume','Before using real spill numbers, calibrate your intuition. At v = 1 m/s the peak covers 60 m in a minute, and the spread grows as √t, not t. Those two facts let you sanity-check any real result.']},
 s4p3:{1:['seir','This is the model your agents must be compared against. It assumes everyone mixes with everyone, which is exactly the assumption a travel network breaks.'],
       5:['seir','Here is the well-mixed curve. Match β and γ to your agent model and run both: the agent epidemic should peak later and lower, because infection has to travel. Quantifying that gap is the finding.']},
 s4p4:{0:['vectors','Do this with the widget open. Each bar force is an arrow, and the hand calculation is just adding up the green parts and then the orange parts at one joint. Drag the arrowhead and watch both components change together.'],
       2:['vectors','Your solver builds a matrix whose rows are exactly these two sums, one per joint: all horizontal components add to zero, all vertical components add to zero. Nothing more sophisticated is happening.'],
       5:['vectors','Compression and tension are the same arrow pointing two different ways. Flip the vertical component negative here to see the sign change your solver reports as the difference between a bar being squeezed and being stretched.']},
 s4p5:{1:['leastsq','This is the test you are NOT using, and it helps to know why. A single wild rainfall year drags this line badly — drag a point far off and watch. Your rank-based test only counts whether pairs go up or down, so the same outlier barely moves it.'],
       4:['leastsq','Watch it on one place first. Drag the points into a weak upward tilt: the line clearly rises, but would you bet money on it? That is the question your test answers with a number instead of a feeling.']},
 s4p6:{1:['wave','Your solver, running, with its reflection. The wave keeps its shape — that is the second time derivative at work, and it is the one real difference from the heat equation.'],
       4:['wave','Move the boundary and read the echo time off the bottom trace. Depth is half the speed times that time. Doing that arithmetic backwards from a trace you did not generate is the project.'],
       5:['heatcfl','Waves have a CFL limit too, and it fails the same way. Here is the explosion on the simpler heat equation so you know what to expect before you cause it deliberately.']},
 s4p7:{1:['plume','Reaction-diffusion is two terms, and this is the diffusion one on its own. Notice that it only ever smooths — it can never create a stripe. The stripes must come from the reaction term you are adding.'],
       4:['plume','To prove a pattern comes from f and k rather than luck, you first need to know what the diffusion half does on its own, which is this: flatten everything, always, regardless of where you started.']},
 s5p1:{1:['orbit','This is the force you are about to write three different ways. All three must produce exactly this motion and exactly this flat energy line; if a faster version changes the physics, it is not faster, it is wrong.'],
       5:['orbit','Switching backends must not change the picture. Keep the energy figure in view while you switch: it should stay just as flat with numba as it was with plain Python.']},
 s5p2:{1:['seir','One run of your fast SEIR, interactive. Nudge β by a hundredth and watch how far the peak slides — the ensemble exists because that slide is large and nobody knows the true β.'],
       4:['seir','Before looking at your distribution of 500 runs, build the intuition here: sweep β across its plausible range and note the highest and lowest peaks you see. Your ensemble percentiles should bracket roughly that spread.']},
 s5p3:{1:['heatcfl','The solver you are writing three ways. All three must agree to the last decimal, and all three obey the same r ≤ 0.5 limit no matter how fast they run.'],
       5:['heatcfl','The crossover exists because resolution costs you twice: more points, and — through r = α·Δt/Δx² — more steps. Halve Δx on the slider in your head: r quadruples, so Δt must drop fourfold to stay under the line.']},
 s5p4:{2:['overfit','"Judge them honestly" is this picture. The blue points are your training runs; the yellow band is where you will actually ask the surrogate to work. Raise the degree and watch the two scores separate.'],
       5:['overfit','Watch the fit improve as points are added — and watch what happens outside their range. A surrogate is a map of the region you sampled, and nothing beyond it.']},
 s5p5:{3:['overfit','Twin features and overfitting are the same disease: the model learns the training set rather than the process. Raise the degree and watch the held-out error rise while the training error keeps falling.'],
       5:['overfit','The yellow band is next season, which no amount of fitting to past seasons can see. Keep that in view while your field of crops grows.']},
 s5p6:{1:['plume','Your water model is advection plus spreading, which is what this widget is in one dimension. Get the shapes in your head here, then put them on real terrain.'],
       6:['plume','Flood water moves as a front that is carried and smeared at the same time. If your flooded area grows linearly in time it is being carried; if it grows like √t it is spreading. Real floods show both, in that order.']},
 s6p1:{2:['integrators','Turning a paper figure into a check usually means reproducing a convergence plot like this one. Two methods, one equation, known slopes: 1 for Euler and 4 for RK4. If your reproduction gets those slopes, your implementation is probably right.']},
 s6p2:{1:['uncertainty','Sobol indices answer, with numbers, what this widget shows with pictures: when one input\'s uncertainty is much larger than another\'s, it dominates the output almost entirely. Make one σ ten times the other and look at the combined figure.'],
       4:['uncertainty','Your instrument panel is reporting which input matters. Here is the simplest possible version of that finding, with only two inputs, so you can check that a lopsided answer is the correct answer and not a bug.']},
 s6p3:{5:['lln','Evidence accumulating is this picture: noisy at first, then steady. Whatever your pilot measures, show it converging. A single run is an anecdote; a line that settles is a result.']},
};

/* =========================================================
   CONCEPT LAB — every visualisable idea, in one place
   ========================================================= */

const LAB = [
  ['The language of motion and measurement',
   'Before any physics, three habits: a quantity has a size **and** a direction, every measurement has a margin, and an average only becomes trustworthy when you have enough of them.',
   [['vectors','s0p2'],['uncertainty','s0p1'],['lln','s0p4']]],
  ['Calculus, seen rather than memorised',
   'A derivative is a slope you can watch flatten. An integral is an area you can watch fill up. Both are limits, and both are exactly what your code approximates with a finite step.',
   [['derivative','s1p2'],['integral','s2p2']]],
  ['Forces and trajectories',
   'Newton\'s second law in picture form: add the force arrows, divide by the mass, and that is where the object goes next. Nothing else is happening.',
   [['forces','s1p5'],['cannon','s0p2'],['rocket','s0p2']]],
  ['Energy, and why it must balance',
   'Energy is the accountant of physics. It moves between forms but the total never changes, which makes it the best test you have: if your simulation\'s total energy drifts, the simulation is wrong, and no amount of pretty output fixes that.',
   [['energybars','s1p3'],['eulerdrift','s1p3']]],
  ['Gravity and orbits',
   'One inverse-square force produces every ellipse in the sky, and it does so while keeping two numbers perfectly constant. This is the single most important widget on this page.',
   [['orbit','s3p2']]],
  ['Stepping an equation forward in time',
   'Every simulation you will write is a loop that nudges the state forward. Which nudge you choose decides whether the answer is physics or nonsense.',
   [['integrators','s3p1'],['eulerdrift','s1p3'],['heatcfl','s4p1']]],
  ['Populations, epidemics and feedback',
   'The same three lines of arithmetic produce explosive growth, a plateau, an epidemic curve, or a cycle that never settles. The difference is one bracket.',
   [['growth','s0p3'],['seir','s3p3'],['predprey','s3p4']]],
  ['Randomness that answers exact questions',
   'Throw enough dice and the noise cancels, leaving a number you could not easily have calculated. This is Monte Carlo, and it is how most of modern computational science gets its error bars.',
   [['montecarlo','s2p2'],['markov','s2p4']]],
  ['Fitting data without fooling yourself',
   'A line through points is easy. Knowing whether that line will survive contact with next year\'s data is the hard part, and the only honest test is data the fit has never seen.',
   [['leastsq','s1p1'],['overfit','s2p3']]],
  ['Linear algebra as a machine',
   'A matrix is not a grid of numbers, it is an instruction. Elimination carries it out; repeated multiplication finds what the instruction settles on.',
   [['gauss','s2p1'],['power','s2p5']]],
  ['Things that spread and things that travel',
   'Heat forgets its shape; a wave keeps it. That one difference is visible in the equations, and it is why one of them can tell you the depth of a lake.',
   [['plume','s4p2'],['wave','s4p6'],['rootfind','s1p2']]],
  ['Many simple agents, one complex result',
   'No rule in the code says "flock". The pattern is not programmed, it emerges, and you can switch its ingredients off one at a time to prove it.',
   [['boids','s1p4']]],
];

function guideMarkdown(p,g){
  const sv = STEP_VIZ[p.id] || {};
  const steps = [setupStepFor(p,g)]
    .concat(g.steps.map((s,i)=> sv[i] ? Object.assign({}, s, {viz:sv[i][0], vizCap:sv[i][1]}) : s))
    .concat([gitStepFor(p,g)]);
  let m = `# ${p.title}\n\n_Stage ${p.stage} · ${p.difficulty} · ${p.time}_\n\n## What you are building\n\n`;
  m += String(p.explain).split(/<br\s*\/?>\s*<br\s*\/?>/i).map(h=>h.replace(/<[^>]+>/g,'')).join('\n\n') + '\n\n';
  if((g.words||[]).length){ m += '## Words you will meet\n\n' + g.words.map(([t,d])=>`- **${plain(t)}**: ${plain(d)}`).join('\n') + '\n\n'; }
  const hv = HERO_VIZ[p.id];
  if(hv) m += `## Play with the idea first\n\n> Open this project in the HTML file to use the live demo **"${VIZ[hv[0]]?VIZ[hv[0]].title:hv[0]}"**, or find it on the Concept lab page.\n>\n> ${plain(hv[1])}\n\n`;
  m += '## Steps\n\n';
  steps.forEach((s,i)=>{
    m += `### Step ${i}. ${plain(s.t)}\n\n`;
    if(s.why) m += plain(s.why)+'\n\n';
    if(s.viz) m += `> **Live demo for this step** (HTML file only): "${VIZ[s.viz]?VIZ[s.viz].title:s.viz}" — ${plain(s.vizCap)}\n\n`;
    if((s.do||[]).length) m += '**Do this**\n\n' + s.do.map((d,k)=>`${k+1}. ${plain(d)}`).join('\n') + '\n\n';
    if(s.tree) m += '**Your folder should look like this**\n\n```text\n'+s.tree+'\n```\n\n';
    if(s.code) m += '**Write this in the file**\n\n```python\n'+s.code+'\n```\n\n';
    if(s.run) m += '**Run this**\n\n```bash\n'+s.run+'\n```\n\n';
    if(s.see) m += '**You should see:** '+plain(s.see)+'\n\n';
    if(s.hint) m += '**Hint:** '+plain(s.hint)+'\n\n';
  });
  m += '## You are finished when\n\n' + (g.done||[]).map(d=>`- [ ] ${plain(d)}`).join('\n') + '\n\n';
  if((g.stuck||[]).length) m += '## If something goes wrong\n\n' + g.stuck.map(([a,b])=>`- **${plain(a)}** ${plain(b)}`).join('\n') + '\n';
  return m;
}

const URSINA_TEMPLATE = `from ursina import *

app = Ursina(title="My Simulation")

# --- things in the scene ---
ground = Entity(model='plane', scale=20, color=color.rgb(0.15, 0.17, 0.20))
ball = Entity(model='sphere', color=color.azure, scale=0.4, position=(0, 1, 0))
readout = Text(text='', position=(-0.86, 0.46), scale=1.1)

EditorCamera()                  # left-drag orbit, right-drag pan, scroll zoom
DirectionalLight(y=3, z=-2)     # so shapes are shaded, not flat silhouettes
camera.position = (0, 6, -18)

t = 0.0

def update():                   # Ursina calls this itself, every frame
    global t
    t += time.dt                # time.dt = seconds since the previous frame
    ball.y = 1 + 0.5 * t
    readout.text = f'y = {ball.y:.2f} m    t = {t:.2f} s'

def input(key):                 # Ursina calls this on every key press
    if key == 'r':
        global t
        t = 0.0

app.run()                       # must be the LAST line
`;

const PYGAME_TEMPLATE = `import pygame

pygame.init()
WIDTH, HEIGHT = 1000, 600
screen = pygame.display.set_mode((WIDTH, HEIGHT))
pygame.display.set_caption("My Simulation")
clock = pygame.time.Clock()
font = pygame.font.SysFont(None, 28)

running = True
while running:
    # 1. EVENTS: the player did something (click, key, close window)
    for event in pygame.event.get():
        if event.type == pygame.QUIT:
            running = False

    # 2. UPDATE: change your numbers here (positions, speeds, counters)

    # 3. DRAW: paint everything, from back to front
    screen.fill((15, 20, 30))
    pygame.draw.circle(screen, (80, 200, 160), (500, 300), 20)   # example dot
    text = font.render("It works!", True, (230, 230, 230))
    screen.blit(text, (20, 20))

    pygame.display.flip()   # show what you drew
    clock.tick(60)          # at most 60 frames per second

pygame.quit()`;

const PY_KIT = `# 1. Variables and printing
speed = 12.4
name = "rocket"
print(name, speed)                # prints: rocket 12.4

# 2. Math
import math
print(math.sqrt(16), math.sin(math.pi / 2), 2 ** 3)    # 4.0 1.0 8

# 3. Functions: a named recipe. It takes inputs and gives back an output.
def add(a, b):
    return a + b
print(add(2, 3))                  # 5

# 4. if / else
if speed > 10:
    print("fast")
else:
    print("slow")

# 5. Loops
for i in range(3):                # i is 0, then 1, then 2
    print(i)
total = 0
while total < 3:                  # repeat while the condition is true
    total = total + 1

# 6. Lists, tuples and dictionaries
points = [1, 2, 3]
points.append(4)
print(points[0], points[-1], len(points))    # 1 4 4
pair = (5, 6)                     # a tuple: like a list you cannot change
x, y = pair                       # unpack it: x is 5, y is 6
units = {"m": 1.0, "km": 1000.0}  # a dictionary: look things up by name
print(units["km"])                # 1000.0

# 7. f-strings: put numbers inside text
print(f"speed is {speed:.1f} m/s")        # speed is 12.4 m/s

# 8. Classes: a blueprint for objects
class Ball:
    def __init__(self, x, y):     # runs when you write Ball(0, 0)
        self.x = x
        self.y = y
    def move(self, dx):
        self.x = self.x + dx
b = Ball(0, 0)
b.move(5)
print(b.x)                        # 5

# 9. Using code from your own file
from src.units import convert     # file src/units.py, function convert`;

function setupStepsData(){
  const win = OS==='win';
  const smoke = win
    ? `cd $HOME\\comp-science\nmkdir smoke-test\ncd smoke-test\npy -m venv .venv\n.venv\\Scripts\\Activate.ps1\npip install pygame ursina pytest\npython -c "import pygame; print('pygame ok', pygame.version.ver)"\npython -c "import ursina; print('ursina ok')"\npython -m pytest --version\ndeactivate\ncd ..`
    : `cd ~/comp-science\nmkdir smoke-test\ncd smoke-test\npython3 -m venv .venv\nsource .venv/bin/activate\npip install pygame ursina pytest\npython -c "import pygame; print('pygame ok', pygame.version.ver)"\npython -c "import ursina; print('ursina ok')"\npython -m pytest --version\ndeactivate\ncd ..`;
  return [
    { t:'Install Python', why:'Python is the language every project uses.', top: osToggleHTML(),
      do: win ? ['Open **https://www.python.org/downloads/** in your browser.','Download the newest **3.12** installer. Version 3.11 also works.','Run the installer.','**Before you click anything else, tick the box that says Add python.exe to PATH.** Forgetting this is the number one mistake.','Click **Install Now**, wait, then click **Close**.','Open **PowerShell** from the Start menu.']
          : (OS==='unix' ? ['Mac: open **https://www.python.org/downloads/**, download the newest **3.12** installer, run it, and click Continue until it finishes.','Linux (Ubuntu or Debian): run the command below instead. It also installs Git.','Open your terminal.'] : []),
      run: win ? 'py --version' : 'python3 --version\n# Linux only, if python3 is missing:\nsudo apt update\nsudo apt install -y python3 python3-venv python3-pip git',
      see:'A line like **Python 3.12.4**. Any 3.11 or 3.12 number is fine.', hint:'If it says 3.13 or higher, also install 3.12. Some packages in the later projects are not ready for the newest Python yet.' },
    { t:'Install Git', why:'Git saves every version of your work, like unlimited undo.',
      do: win ? ['Open **https://git-scm.com/download/win**.','Run the installer and click **Next** on every screen. The default choices are fine.','Close PowerShell and open a new one.'] : ['Mac: type the command below. If a window asks to install developer tools, click **Install**.','Linux: Git was installed in the last step.'],
      run:'git --version\ngit config --global user.name "Your Name"\ngit config --global user.email "you@example.com"\ngit config --global init.defaultBranch main',
      see:'A line like **git version 2.45.1**. The three config lines print nothing. That is correct.', hint:'Use your real name and email in the config lines. Keep the quotes.' },
    { t:'Install VS Code, your editor', why:'This is where you will write all your code.',
      do:['Open **https://code.visualstudio.com** and install it.','Open VS Code.','Click the **Extensions** icon in the left bar. It looks like four squares.','Search for **Python**, find the one made by **Microsoft**, and click **Install**.','Open a terminal inside VS Code: press **Control and the backtick key**, or use the menu **View, then Terminal**.'],
      see:'A terminal panel opens at the bottom of VS Code.', hint:'The backtick key is the one above Tab, left of the number 1.' },
    { t:'Make your workspace folder', why:'Every project will live inside one folder, so nothing gets lost.',
      do:['In the terminal, run the commands below.','In VS Code choose **File, then Open Folder**, and pick the **comp-science** folder.'],
      run: win ? 'mkdir $HOME\\comp-science\ncd $HOME\\comp-science\nGet-Location' : 'mkdir -p ~/comp-science\ncd ~/comp-science\npwd',
      see:'A path that ends in **comp-science**.' },
    { t:'Test that everything works', why:'Better to find a problem now than in the middle of a project.',
      do:['Copy the block below into the terminal and press Enter.','Wait for the installs to finish.'],
      run: smoke,
      see:'The line **pygame ok 2.6.1** or a similar number, then **ursina ok**, then a line like **pytest 8.3.2**. While the environment is active, your prompt starts with **(.venv)**. After **deactivate**, that goes away.',
      hint:'You may also see a message that starts with **pygame** and **Hello from the pygame community**. That is normal.' }
  ];
}

function setupPageHTML(){
  const prog = gp('setup');
  const steps = setupStepsData();
  const stepsHTML = steps.map((s,i)=>stepHTML(i+1,s,!!prog['s'+(i+1)])).join('');
  return `
    <h1 data-tts>Setup: do this once, then every project just works</h1>
    ${P_('This page installs the tools and teaches the five or six things you need before the first project. It takes about 30 to 45 minutes. Nothing here is graded.')}
    ${SEC_('How to read or listen to this page', UL_([
      'Press **Listen** in the bar at the bottom of the screen. The line being read is **highlighted in yellow**, and the page scrolls along with it.',
      '**Double-click any line** to start listening from that exact line.',
      'Press the **Space bar** to pause and continue. The **left and right arrow keys** jump one line back or forward. **Escape** stops.',
      'Turn on **Skip code** if you only want to hear the explanations and read the commands yourself.',
      'Use **A minus** and **A plus** to change the text size.',
      'For the nicest voices, open this file in **Microsoft Edge**. Chrome and Safari also work.'
    ]))}
    ${SEC_('Part 1. Install the tools', stepsHTML)}
    ${SEC_('Part 2. The seven rules every project follows', OL_([
      '**One folder per project.** All of them live inside **comp-science**.',
      '**One private Python per project.** It lives in a folder called **.venv**. You switch it on with an **activate** command.',
      'When the private Python is on, your terminal line starts with **(.venv)**. If you do not see that, nothing will work. Activate it.',
      '**Always run commands from the project folder**, the one that contains **src** and **tests**.',
      'Run a program with {{python -m src.main}}. Notice there is no slash and no .py at the end.',
      'Run the checks with {{python -m pytest -q}}. Green dots mean good. Red means something is wrong, and the message tells you where.',
      '**Save with git often.** After every working step, run {{git add .}} and then {{git commit -m "what I did"}}.'
    ]) + P_('To stop a program that is running, close its window, or click the terminal and press **Control and C**.'))}
    ${SEC_('Your workspace folder', codeBlock('comp-science/\n├── uncertainty-sandbox/      ← project 1\n├── cannon-game/              ← project 2\n├── population-blobs/         ← project 3\n└── ...                       ← one folder per project','tree','The workspace map is on screen.') + P_('Each project guide gives you the exact folder name and the exact files inside it.'))}
    ${SEC_('Template: a pygame window', P_('Almost every project shows something moving on screen. This is the starting window for all of them. Copy it into **src/main.py** and run it. It is boilerplate, not a solution.') + codeBlock(PYGAME_TEMPLATE,'file','The pygame window template is on screen.') + UL_([
      'The **while running** loop is your game loop. It repeats about 60 times every second.',
      'Each pass does three things in order: **events**, **update**, **draw**.',
      '**Events** means the player did something. **Update** means you change your numbers. **Draw** means you paint the new picture.',
      '**screen.fill** wipes the old picture. **pygame.display.flip** shows the new one.',
      'The window is **1000 by 600 pixels**. The top left corner is x equals 0 and y equals 0. **y grows downward**, which surprises everyone once.'
    ]) + P_('Test it: save the file, then run {{python -m src.main}}. A dark window with a green dot and the words It works should open. Closing the window ends the program cleanly.'))}
    ${SEC_('Template: a 3D window', P_('Nine projects are in **3D** and use **Ursina**, a 3D engine that is plain Python. This is the starting window for all of them. Copy it into **src/main.py** and run it.') + codeBlock(URSINA_TEMPLATE,'file','The Ursina 3D window template is on screen.') + UL_([
      'Ursina runs the loop **for you**. You never write {{while running}}. You write {{update}} and Ursina calls it about 60 times a second.',
      '{{time.dt}} is the seconds since the last frame. Multiply speeds by it so motion is the same on a fast or slow computer.',
      'An **Entity** is one thing in the scene. {{model}} can be {{sphere}}, {{cube}}, {{plane}}, {{cone}} or {{circle}}.',
      '**y is UP**, x and z are the two ground directions. This is the opposite of pygame, where y grew downward.',
      'Positions are {{Vec3(x, y, z)}} and the units are whatever you decide. In these projects 1 unit usually means 1 metre.',
      '{{EditorCamera()}} gives you a free camera for nothing: left-drag to orbit, scroll to zoom. Being able to look from any angle is the whole reason these projects are in 3D.',
      '{{def input(key):}} handles single key presses. {{held_keys["up arrow"]}} inside {{update}} handles a key being held down.'
    ]) + P_('Test it: run {{python -m src.main}}. A window opens with a grey floor and a blue sphere drifting upward. Orbit the camera with the mouse. Close the window to end the program.'))}
    ${SEC_('Which projects are 3D, and why', P_('3D is used where the thing being studied genuinely lives in three dimensions, and **not** used where it would just be decoration. Being able to tell those apart is itself an engineering judgement.') + UL_([
      '**3D (Ursina)**: the cannon, the particle sandbox, flocking, orbits, the N-body cluster, the heat landscape, the truss bridge, the seismic wavefield, and the flood terrain.',
      '**2D (pygame)**: everything else. Markov rainfall states, the matrix solver, Monte Carlo darts, curve fitting and the rest are genuinely flat problems, and a third dimension would hide the result rather than reveal it.',
      'Two of them show the difference clearly. An **orbit** has a plane and a tilt, so 3D shows real physics. **Monte Carlo darts** landing in a square gain nothing from being floated in space.',
      'A note on other tools: **Blender** is excellent for a final rendered image of a result, but it is not a live simulator. **Unity** would force you into C# and split your physics from your Python. Ursina keeps the physics and the picture in one language, which is why it is used here.'
    ]))}
    ${SEC_('Python survival kit', P_('Every idea you need for the first projects, in one place. Come back here whenever a step uses a word you have forgotten.') + codeBlock(PY_KIT,'file','The Python survival kit is on screen.'))}
    ${SEC_('How to read an error message', UL_([
      'Do not panic. A red error is a message to you. It is not a failure.',
      '**Read from the bottom up.** The very last line says what went wrong, for example {{NameError: name x is not defined}}.',
      'The lines above it say **which file and which line number**. Click that line number in VS Code to jump there.',
      '{{ModuleNotFoundError}} usually means the private Python is not active. Look for **(.venv)**.',
      '{{IndentationError}} means the spaces at the start of a line are wrong. Python uses **four spaces** to show what is inside a function or loop.',
      'A failing check looks like {{assert 6 == 5}}. It means your function returned 6 and the check expected 5.'
    ]))}
    ${SEC_('How a check (a test) works', P_('A check is a tiny program that calls your function and compares the answer. You write the checks first, watch them fail, then write the function until they pass.') + codeBlock('# tests/test_example.py\nfrom src.example import add\n\ndef test_add():\n    assert add(2, 3) == 5','file','An example check is on screen.') + UL_([
      'File names in **tests** must start with **test_**. Function names must start with **test_** too.',
      'Run them with {{python -m pytest -q}}.',
      'Success looks like **1 passed**. Failure shows the line that broke and the two values that disagree.'
    ]))}
    ${SEC_('Git survival kit', UL_([
      '{{git status}} shows what changed since your last save.',
      '{{git add .}} gets everything ready to be saved.',
      '{{git commit -m "short message"}} saves it. The message says what you did.',
      '{{git log --oneline}} lists all your saves, newest first.',
      'To put a project on GitHub: make a free account, click **New repository**, name it, create it empty, then run the three lines GitHub shows under **push an existing repository**. They start with {{git remote add origin}}.'
    ]))}
    ${SEC_('Listening tools and tips', UL_([
      'This page has its own **reader with a yellow highlight**. It works in any modern browser.',
      '**Microsoft Edge** offers free natural-sounding voices, such as Aria and Guy. They appear in the Voice menu in the bottom bar.',
      'Word-by-word highlighting works in recent **Edge, Chrome and Safari**. Line highlighting works everywhere.',
      'Every project guide has a **Download this guide** button. It saves a Markdown file. Put it in your project as **GUIDE.md** and open it in VS Code with **Control, Shift and V**.',
      'To hear that file read aloud, open it in **Microsoft Edge** and press **Control, Shift and U**. Edge Read Aloud highlights each word.',
      'On a Mac you can also turn on **Spoken Content** in **System Settings, Accessibility**, and switch on **Highlight content**.',
      'On Windows, **Narrator** reads anything on screen. Start it with **Windows key, Control and Enter**.'
    ]))}
    ${SEC_('Troubleshooting table', [
      ['**{{python is not recognized}}** (Windows)','Reinstall Python and tick **Add python.exe to PATH**, or use {{py}} instead of {{python}} outside the project.'],
      ['**{{running scripts is disabled}}** (Windows)','Run {{Set-ExecutionPolicy -Scope CurrentUser RemoteSigned}}, then open a new PowerShell.'],
      ['**{{No module named src}}**','You are not in the project folder, or **src/__init__.py** does not exist. Run {{cd}} into the project and check the file.'],
      ['**{{No module named pygame}}** or numpy','The private Python is off. Activate it, then run {{pip install}} again.'],
      ['The window opens and closes instantly','The loop is missing or has an error above it. Compare your file to the template.'],
      ['**{{externally-managed-environment}}**','You ran pip without activating **.venv**. Activate it first.'],
      ['Git says **Please tell me who you are**','Run the two {{git config --global}} lines from Part 1.'],
      ['Linux says **{{ensurepip is not available}}**','Run {{sudo apt install python3-venv}}.']
    ].map(([a,b])=>`<div class="stuck-item"><span class="s" data-tts>${fmt(a)}</span><span data-tts>${fmt(b)}</span></div>`).join(''))}
  `;
}


export { HERO_VIZ, STEP_VIZ, LAB, setOS, getOS, setGuideProgress, buildTree, projectCommands, comeBackCommands, setupStepFor, gitStepFor, stepHTML, codeBlock, guideMarkdown, setupStepsData, setupPageHTML, URSINA_TEMPLATE, PYGAME_TEMPLATE, PY_KIT };
