/* AUTO-EXTRACTED from the original computational-science-curriculum.html.
   Content is unchanged except where marked PATCH. Do not hand-edit; re-run scripts/extract.py. */
/* eslint-disable */
// @ts-nocheck
const STAGES = [
  {id:0, name:'Computational Foundations', tagline:'Learn to think in variables, steps, and quantities — through science, not syntax drills.',
   summary:'Programming fundamentals, algebraic/quantitative reasoning, and the basic habits of measurement and estimation, each taught through a small real scientific question rather than an abstract exercise.'},
  {id:1, name:'Scientific Programming', tagline:'Numpy, plotting, files, APIs, git, classes — the working toolkit of a computational scientist.',
   summary:'Moves from bare Python into the actual scientific stack: arrays instead of loops where it matters, real files and real APIs instead of typed-in numbers, version control, and your first taste of writing code other people (future you included) can trust.'},
  {id:2, name:'Mathematical Computing', tagline:'Linear algebra, probability, and statistics — implemented, not just studied.',
   summary:'Calculus and linear algebra stop being things you compute by hand and become things you implement, test, and apply to real data: regression, random sampling, Markov chains, and eigenvector-based network analysis.'},
  {id:3, name:'Numerical Methods & Dynamical Modeling', tagline:'Differential equations meet the real world: orbits, epidemics, ecosystems, energy systems.',
   summary:'You build general-purpose numerical tools (ODE solvers, optimizers) from first principles and validate them against known analytical answers, then point them at real dynamical systems with real data.'},
  {id:4, name:'Scientific Simulation — PDEs & Complex Systems', tagline:'Fields instead of points: heat, waves, fluids, populations distributed over space.',
   summary:'Moves from ordinary to partial differential equations and agent-based/network models, applied to real physical, environmental, and urban systems using satellite and population datasets.'},
  {id:5, name:'Advanced Computational Science & HPC', tagline:'Make it fast, make it big, and let data-driven methods do some of the work.',
   summary:'Performance, parallelism, and GPU computing, plus machine learning used as a computational-science tool (surrogate modeling, prediction) rather than as an end in itself — applied to real African datasets on agriculture, flooding, and climate.'},
  {id:6, name:'Research Preparation', tagline:'Reproduce, question, and propose — the actual work of research.',
   summary:'Reproducing a published result, quantifying uncertainty in your own models, and running a small, real, self-directed research investigation from question to written report.'},
  {id:7, name:'Capstone', tagline:'One substantial, validated, real-world computational investigation.',
   summary:'A single project integrating multiple techniques from across the curriculum, built and validated against real data, sized to anchor a portfolio and a graduate application.'},
];

const PROJECTS = [
// ---------------- STAGE 0 ----------------
{
  id:'s0p1', title:'The Uncertainty Sandbox: An Interactive Measurement-Combiner', stage:0, domain:'Computing', difficulty:'Beginner', time:'1–2 weeks',
  prereqs:[],
  concepts:{math:['Arithmetic, algebraic rearrangement of formulas','Uncertainty propagation formulas','Significant figures, scientific notation'], physics:['Physical quantities and units (SI)','Measurement uncertainty vs. precision'], programming:['Variables, functions, input/output','Real-time interactive programs with pygame','Event handling (mouse drag, keyboard)']},
  context:'Every computational scientist first has to stop treating numbers as bare digits and start treating them as physical quantities with units and uncertainty attached. The best way to build real intuition for how uncertainty propagates is to literally watch two fuzzy measurements combine into a new, fuzzier, or sometimes tighter, one, and to feel, by dragging them around, which direction the uncertainty moves — intuition a printed number alone can never give you.',
  explain:'🧪 Imagine you are a mad scientist, except instead of typing a command and reading a number back, you have a glass tank on your desk where every measurement is a literal fuzzy blob of light: bright and tight when you are confident, dim and spread out when you are not. Your job is to build that tank as a real pygame program.<br><br><b>Quest 1, The Blob Translator:</b> drag a measurement-blob onto a different unit scale and watch its glow instantly resize to the new unit, with temperature as the sneaky-affine exception.<br><br><b>Quest 2, The Blob Mixer:</b> drag two measurement-blobs together, pick an operation, and literally watch them merge into a new blob live — and here is the real payoff: you discover, by playing, that combining two uncertain numbers does not just add their fuzziness in an obvious way, it combines in a specific curved way, the propagation formula, which you will see before you ever have to trust it.<br><br><b>The Strict Rules:</b> mixing incompatible units must visibly refuse, the blobs bounce off each other and flash red, and the final blob\'s glow radius must always obey the one-significant-figure rounding law.',
  firstWin:'Within the first hour: drag two fuzzy blobs together on screen and literally watch a new, correctly-sized fuzzy blob appear where they merge — before you have even looked at a single printed number.',
  problem:'Build an interactive pygame program, not a one-shot CLI, where measurements are rendered as circles with a soft glow whose radius is proportional to their uncertainty. The user drags a measurement-blob onto a unit-label zone to convert it live, the blob resizes and re-glows instantly to the new unit and its correctly scaled uncertainty, or drags two blobs onto each other and presses an operator key (+, -, x, /) to combine them live into a new blob whose position is the result and whose glow radius is the propagated uncertainty, animated as a real merge over a few frames, not an instant swap. SUPPORTED UNIT FAMILIES (exactly these, nothing more for now): Length — m, km, cm, mm, ft, mi. Time — s, min, hr. Temperature — C, F, K (affine conversion, not multiplicative — a purely multiplicative implementation will silently give a wrong glow size, and that is a deliberate trap you should be able to catch just by watching the glow resize wrong). Energy — J, kJ, cal, kWh. EXACT CHECK: a blob worth 12.4 ± 0.2 m/s dragged to the km/h zone must resize to show 44.6 with a glow radius corresponding to ± 0.7. Two blobs, 12.4 ± 0.2 m/s and 3.1 ± 0.1 m/s, combined with the plus key, must merge into a blob reading 15.5 with a glow radius corresponding to ± 0.2. ROUNDING RULE (use exactly this): round the uncertainty to 1 significant figure first, then round the value to that same decimal place — this determines the exact glow radius and displayed digits, not just a backend number. ERROR HANDLING: dragging two blobs from different unit families onto each other must make them visibly bounce apart and flash red instead of merging.',
  deliverableType:'Interactive pygame tool', deliverableWhy:'A draggable, live pygame tool turns uncertainty propagation from a formula you compute once into something you explore by play — dragging different blobs together and watching the glow respond is literally how you build intuition for why the formulas look the way they do, which a single CLI run can never give you.',
  dataSource:'None required — this project is about correct arithmetic, unit handling, and an honest interactive representation of it, not data collection.',
  milestones:[
    'Render a single measurement as a circle with a soft glow proportional to its uncertainty, and confirm by eye that doubling the uncertainty visibly doubles the glow radius.',
    'Implement draggable unit-label zones; dropping a blob onto one must trigger a live resize/reglow animation to the new unit and uncertainty, with temperature handled as its own affine case.',
    'Implement blob-to-blob combination: dragging two blobs together and pressing +, -, x, or / must animate them merging into a new blob at the computed value with the propagated uncertainty as its glow radius.',
    'Implement the significant-figure rounding rule as its own function, tested in isolation, and confirm the displayed digits and glow radius both reflect the rounded result, not the raw float.',
    'Implement family-mismatch handling: dragging blobs from different unit families onto each other must visibly bounce them apart and flash red instead of merging.',
    'Write at least 10 hand-checked test cases for the underlying conversion and propagation math, separate from the pygame rendering, and confirm they pass before trusting what you see on screen.'
  ],
  validation:['The two worked examples must reproduce exactly: dragging 12.4 ± 0.2 m/s to km/h must show 44.6 with a glow matching ± 0.7; combining 12.4 ± 0.2 m/s and 3.1 ± 0.1 m/s with plus must show 15.5 with a glow matching ± 0.2.','Temperature must be tested separately and explicitly, since a purely multiplicative implementation will visibly produce the wrong glow size and position here, and that specific failure is what you are meant to catch by watching it.','At least one family-mismatch drag, for example length onto mass, must be confirmed to bounce and flash red rather than silently merging into a wrong number.'],
  tools:['pygame','Python 3 (standard library only)'],
  extensions:['Add a third "what-if" blob that previews the merge result live as you hover two blobs near each other, before you commit to dropping them.','Add a small history trail showing the last 5 merges as fading ghost-blobs, so you can compare how different operations changed the fuzziness differently.']
},
{
  id:'s0p2', title:'Projectile Motion Trajectory Explorer', stage:0, domain:'Physics', difficulty:'Beginner', time:'1–2 weeks',
  prereqs:['s0p1'],
  concepts:{math:['Quadratic equations','Trigonometry (launch angle decomposition)','Basic algebraic solving for time/range'], physics:['Kinematics under constant acceleration','Effect of air resistance (qualitative)'], programming:['Loops and lists/arrays','Basic plotting','Functions with multiple parameters']},
  context:'This is the first project where you compute something a physics textbook would ask for, but by generating the whole trajectory point-by-point rather than only the closed-form range formula — the habit of thinking in discretized time steps is the seed of every simulation you will build later.',
  explain:'🚀 You are a space-camp instructor teaching cannonballs how to fly! When you launch something into the air, it follows a curved path called a trajectory. Your job is to build a tiny flight simulator that tracks a flying object moment by moment, instead of just guessing where it lands with one big formula, and watches how far it flies (its range) and how high it climbs (its peak height).<br><br><b>Quest 1:</b> Launch your object at different angles and speeds with no wind resistance, and discover for yourself why a 45-degree launch angle always throws things the farthest.<br><br><b>Quest 2:</b> Add air resistance (drag), a force that always pushes backward against motion, and watch how it steals distance from your throw and shifts the best launch angle to something less than 45 degrees.',
  firstWin:'Within the first sitting: a parabola arcing across your screen — your very first thrown object, flying exactly where physics says it should.',
  problem:'Write a program that takes three inputs — launch speed v0 in m/s, launch angle θ in degrees, and a drag coefficient k (use 0 for no drag) — and computes the full trajectory by stepping forward in small time increments (e.g. dt = 0.01 s), not by using the one-shot range formula. Stop the simulation the instant the height y returns to 0 (the ground). REQUIRED EXACT CHECK: run your simulator with v0 = 20 m/s, θ = 45°, k = 0, and g = 9.8 m/s². The analytical formulas give a range of v0²sin(2θ)/g = 40.8 m and a peak height of v0²sin²θ/(2g) = 10.2 m. Your time-stepped simulation must agree with both numbers to within 1% (a small gap from discrete time steps is expected; a large gap means a bug). Then sweep θ from 10° to 80° in 5° steps at the same v0 and k=0, plot range vs. angle, and confirm the maximum occurs at (or extremely close to) 45°. Finally add linear drag (a deceleration proportional to speed, opposite the direction of motion) with k>0, re-run the 45° case, and explain in one paragraph why the range decreases and why the angle that now gives maximum range is less than 45°.',
  deliverableType:'Ursina 3D simulation (playable cannon)', deliverableWhy:'The output is a small set of trajectory plots under varying parameters — no interactivity is needed for the learning goal, so a script is the right-sized deliverable.',
  dataSource:'None — physical parameters are chosen by you and swept systematically.',
  milestones:[
    'Implement the no-drag case as a time-stepped loop (not just the closed-form formula) and confirm it matches the formula.',
    'Plot trajectories for at least 5 launch angles at fixed speed; find the angle of maximum range numerically and compare to the analytical 45° result.',
    'Add a simple linear drag term and re-run the time-stepped simulation.',
    'Plot how maximum range changes with drag coefficient.',
    'Write a short (half-page) explanation of why drag breaks the 45°-is-optimal result.',
    'Build this as a small pygame program: let the player set launch angle and speed, hit a key to fire, and watch the ball fly in real time across the window under gravity, with an optional drag toggle — a tiny playable cannon, not a pre-rendered clip.'
  ],
  validation:['No-drag trajectory matches the closed-form range formula (x_range = v²sin(2θ)/g) to within numerical tolerance.','Energy/height sanity check: peak height matches v²sin²θ/2g in the no-drag case.','Drag case checked for physical plausibility: range should always decrease relative to the no-drag case for the same launch conditions.','While the simulation is running live, pause it at the peak of the flight and confirm the displayed height matches v0 squared times sine squared theta over 2g for that shot\'s actual parameters.'],
  tools:['ursina','Python 3', 'NumPy', 'Matplotlib'],
  extensions:['Add quadratic (velocity-squared) drag and compare its effect on range to linear drag.','Find the optimal launch angle numerically under drag using a simple search.']
},
{
  id:'s0p3', title:'Population Growth: Exponential vs. Logistic Models', stage:0, domain:'Math', difficulty:'Beginner', time:'1 week',
  prereqs:['s0p1'],
  concepts:{math:['Exponential and logarithmic functions','Difference equations','Carrying capacity / asymptotic behavior'], physics:['None (this is a modeling-methods project, not physics)'], programming:['Functions, loops','Plotting multiple series on one axis']},
  context:'This is your first real mathematical model: a system\'s future state depends on its current state through a rule you write down and iterate. The exponential-vs-logistic contrast is the smallest possible example of a modeling assumption (unlimited vs. limited resources) visibly changing a prediction — a theme that recurs at every later stage.',
  explain:'🐰 You are a wildlife scientist trying to predict how a population, like rabbits on an island, will grow over time. Your job is to build two rival prediction machines and see which one guesses the future better.<br><br><b>Machine 1, Unlimited Growth (exponential):</b> Assumes there is always enough food and space, so the population just keeps multiplying faster and faster forever, which never actually happens in real life.<br><br><b>Machine 2, Realistic Growth (logistic):</b> Assumes there is a maximum population the environment can support, called the carrying capacity, so growth slows down and levels off as the population gets close to that limit.<br><br><b>The Real Test:</b> Feed both machines real population numbers for an actual country, and figure out which one actually predicts history better, and why.',
  firstWin:'Early win: two curves on one graph, racing apart as you watch — unlimited growth rocketing upward while the realistic curve gently levels off.',
  problem:'Implement two functions — one iterating Pn+1 = Pn + r·Pn (exponential), one iterating Pn+1 = Pn + r·Pn·(1 − Pn/K) (logistic) — each taking a starting population P0, growth rate r, number of steps n, and (for logistic) carrying capacity K, and returning the full sequence. REQUIRED EXACT CHECK: run the exponential model with P0=100, r=0.1, for 10 steps — P1 must be exactly 110, P2 must be exactly 121, and P10 must be approximately 259.4. Run the logistic model with the same P0 and r, K=1000, for 10 steps — P1 must be exactly 109 (since 100 + 0.1×100×(1−100/1000) = 109), and the sequence must never exceed K=1000 no matter how many steps you run. Only once both functions match these exact numbers, download the real total-population time series for one country of your choice from the World Bank (indicator SP.POP.TOTL) covering as many years as are available, and find the r (and, for logistic, K) that make each model best match the real data — do this by trying a range of r and K values and keeping whichever combination gives the lowest sum of squared differences between the model output and the real yearly values (a simple grid search is sufficient; no advanced optimizer is required). Report, with a specific numeric fit-error for each model, which one fits the real data better and over what portion of the time range.',
  deliverableType:'Pygame population-blob simulation', deliverableWhy:'A short analytical script producing comparison plots is sufficient; the point is understanding two models, not building a tool.',
  dataSource:'World Bank Open Data — Population, total (SP.POP.TOTL) for a country of your choice.',
  milestones:[
    'Implement both difference equations as small functions and plot their trajectories for a range of r and K values.',
    'Download real population data for one country (World Bank) for the last ~60 years.',
    'Fit r (and K for logistic) by simple grid search or least squares to minimize error against the real data.',
    'Plot both fitted models against the real data on the same axes.',
    'State explicitly which model fits better, over what time range, and why the exponential model necessarily fails eventually.',
    'Render the population as a live swarm of small dots inside a pygame window: each simulated year, spawn new dots for growth, and for the logistic model draw a boundary circle representing the carrying capacity so you can watch the swarm visibly crowd up against it, while the exponential swarm keeps expanding past where the boundary would be.'
  ],
  validation:['Confirm logistic growth approaches K asymptotically as n→∞ analytically and numerically.','Report a numeric goodness-of-fit measure (e.g. sum of squared residuals) for both models against real data, not just a visual comparison.','Run both simulations live side by side and confirm the logistic swarm\'s growth in dot count visibly slows and flattens near the boundary while the exponential swarm\'s growth rate visibly keeps accelerating.'],
  tools:['pygame','Python 3','NumPy','Matplotlib','pandas (optional, for reading the World Bank CSV)'],
  extensions:['Add a simple immigration/emigration term and see how it changes long-run behavior.','Compare fit quality across 3 countries with very different growth histories.']
},
{
  id:'s0p4', title:'The Converging Average: A Live Weather-Statistics Visualizer', stage:0, domain:'Data Science', difficulty:'Beginner', time:'1–2 weeks',
  prereqs:['s0p2'],
  concepts:{math:['Mean, variance, standard deviation from first principles','The law of large numbers (watching an estimate converge)'], physics:['Basic meteorological quantities (temperature, solar irradiance, precipitation)'], programming:['File I/O','Working with a real HTTP API and JSON','Real-time pygame rendering driven by a data stream']},
  context:'This is your first contact with a real scientific data source instead of numbers you invented, and your first chance to literally watch a statistic become more trustworthy as more real data arrives — the single most important intuition in statistics, usually taught only as an abstract law, here something you can watch happen with your own eyes.',
  explain:'🌦️ You are a weather-station operator, but instead of standing outside with a thermometer, you are asking a satellite for the data, and watching its answer get more trustworthy in real time. Your job is to build a live pygame window where a running average, drawn as a wobbling needle on a dial, starts out jumping around wildly on day 1 and 2, and gradually calms down and settles as more real days of data stream in — this calming-down is the law of large numbers, normally only described in a textbook, here something you will watch happen with your own eyes as real satellite data for an actual place on Earth streams into your program.',
  firstWin:'Early win: a needle on a live gauge jumping wildly for the first few days of real data, then visibly calming down and settling as more days stream in — the law of large numbers, happening in front of you.',
  problem:'Build a pygame program that queries the NASA POWER daily point API for temperature at 2 meters (T2M), precipitation (PRECTOTCORR), and surface shortwave irradiance (ALLSKY_SFC_SW_DWN) for a location and date range of your choice, for example --lat -1.94 --lon 30.06 --start 20230101 --end 20231231 for Kigali, Rwanda, and then replays the fetched days one at a time into a live pygame window at a controllable speed. For each variable, render a dial-style needle showing the running mean computed so far, using your own mean function, not numpy.mean, and a second, fainter needle showing the running standard deviation. As each new day streams in, both needles must visibly move: wildly for the first handful of days, and increasingly settled as the day count grows into the dozens. REQUIRED EXACT CHECK, before touching the real API: run your own mean/variance/standard-deviation functions on the fixed list [2, 4, 4, 4, 5, 5, 7, 9]. The correct answers are mean = 5.0, population variance = 4.0, population standard deviation = 2.0, using the population formula, divide by N not N-1, the convention used throughout this project. Your functions must reproduce these three numbers exactly before you trust what the live dial shows.',
  deliverableType:'Pygame live-statistics visualizer', deliverableWhy:'The entire point of this project is watching a statistic become trustworthy as sample size grows — a live, real-time dial you watch settle is a far more honest and direct representation of that idea than a single printed final number, and makes the law of large numbers something you experience, not just read about.',
  dataSource:'NASA POWER API (power.larc.nasa.gov) — daily point data for temperature, precipitation, solar irradiance.',
  milestones:[
    'Implement mean, variance, and standard deviation as your own functions and verify them exactly against the [2,4,4,4,5,5,7,9] test case before writing any rendering code.',
    'Successfully query the NASA POWER API for one real location/date range and parse the response into an ordered list of daily values.',
    'Build the live pygame dial rendering: a needle whose angle represents the running mean, redrawn every time a new day is added to the running calculation.',
    'Add a second, visually distinct needle for the running standard deviation, and confirm both needles move independently and correctly as data streams in.',
    'Add playback speed control, a key to speed up or pause the stream, so you can watch the early wild wobble in slow motion and the later settling sped up.',
    'Cross-check your hand-written running statistics against numpy.mean and numpy.std computed on the same final dataset, confirming agreement to at least 6 decimal places.'
  ],
  validation:['Run the live visualizer on at least 90 real days and confirm, by watching it, that the needle movement is visibly larger in the first 10 days than in the last 10 days — if it does not calm down, your running-statistics update logic likely has a bug.','Spot-check the needle position at day 10, day 30, and the final day against independently recomputed mean/std values for exactly those prefixes of the data.','Confirm your hand-written mean/variance/standard-deviation functions match numpy output to floating-point precision on the full final dataset.'],
  tools:['pygame','Python 3','requests library'],
  extensions:['Add a third faint needle showing the true final mean from the start, so you can visually measure how far the running estimate still has to travel at any point in the stream.','Run the same visualizer on two very different climates side by side and compare how quickly each one visibly settles.']
},

// ---------------- STAGE 1 ----------------
{
  id:'s1p1', title:'Vectorized Climate Trend Analyzer for an East African Station', stage:1, domain:'Climate', difficulty:'Beginner', time:'2 weeks',
  prereqs:['s0p3','s0p4'],
  concepts:{math:['Linear regression (least squares, derived and implemented)','Basic trend/slope interpretation'], physics:['Long-term temperature/precipitation trends'], programming:['NumPy vectorized array operations (replacing explicit loops)','pandas for tabular data','Multi-panel plotting']},
  context:'This project is where "for" loops over data start being replaced by vectorized NumPy operations — a shift in how you think about computation that every later numerical project depends on. It also introduces trend detection, the single most common real analysis task in climate and environmental science.',
  explain:'📈 You are a climate detective investigating a big question: is it actually getting hotter in East Africa? Your job is to look at decades of temperature data and draw the best straight line through it, this is called a trend line, found using a method called linear regression, to see which direction the numbers are heading and how fast. The tricky part: you have to build your own line-fitting formula from scratch instead of using a ready-made one, and you must report not just the answer but how confident you are in it, since a real scientist never just states a number without saying how sure they are.',
  firstWin:'Early win: real decades-old temperature dots on a graph, with your own hand-built trend line slicing right through them.',
  problem:'First validate your own least-squares slope and intercept implementation on a synthetic dataset where you already know the right answer: generate x = [0,1,2,...,9] and y = 3x + 7 exactly, with no noise, and confirm your regression returns a slope of exactly 3.0 and an intercept of exactly 7.0 (to floating-point precision). Then generate the same x with y = 3x + 7 plus small random noise (e.g. numpy.random.normal(0, 0.5, size=10) added to each point) and confirm your fitted slope is close to 3.0 but no longer exact — this is the expected effect of noise. Only once both checks pass, download at least 20 years of monthly mean temperature for one East African city of your choice from the NASA POWER API, fit a linear trend (year, as a decimal, on the x-axis; temperature on the y-axis) using your own regression code, and report the slope in degrees C per decade together with its standard error (the formula for the standard error of a least-squares slope is a standard statistics formula — implement it, do not skip it). State explicitly whether the slope is more than twice its own standard error, a common rough threshold for concluding a trend is probably not just noise, and say so in your write-up.',
  deliverableType:'Pygame live-fitting visualizer', deliverableWhy:'The output is an analysis with supporting figures — no persistent tool or interactivity is needed.',
  dataSource:'NASA POWER API — monthly time series, 20+ years, for a location of your choice.',
  milestones:[
    'Rewrite your Stage-0 statistics code using vectorized NumPy operations; benchmark old vs. new speed on a large array.',
    'Derive the least-squares slope/intercept formulas for simple linear regression and implement them from the raw formulas (not numpy.polyfit).',
    'Fit a trend line to the temperature time series and to the precipitation time series separately.',
    'Compute a basic significance check on the slope (e.g. compare against the standard error of the slope).',
    'Plot raw data with the fitted trend line and annotate the slope with its units and uncertainty.',
    'Open a pygame window where real yearly temperature dots appear one at a time, and the trend line re-fits and redraws itself live after every new dot, so you watch the slope wobble early on and settle as more years arrive.'
  ],
  validation:['Your hand-implemented regression must match numpy.polyfit (degree 1) to floating-point precision on the same data.','State the trend with an explicit uncertainty (not a bare number) and explain in one paragraph whether it is likely a real signal or within noise, given the data length.','Run it live over the full real dataset and confirm the on-screen line\'s final angle matches your separately computed regression slope.'],
  tools:['pygame','Python 3','NumPy','pandas','Matplotlib'],
  extensions:['Repeat the analysis for 3 different East African stations and compare trend magnitude and direction.','Add a rolling-average smoothing step and discuss how the window size changes your visual impression of trend.']
},
{
  id:'s1p2', title:'Root-Finding and Numerical Differentiation Toolkit', stage:1, domain:'Computing', difficulty:'Beginner', time:'2 weeks',
  prereqs:['s0p1'],
  concepts:{math:['Derivatives (finite-difference approximation)','Intermediate value theorem','Convergence and error order'], physics:['None directly — foundational numerical-methods project'], programming:['Recursion and iteration','Writing and testing small numerical algorithms against known analytical answers']},
  context:'Bisection, Newton\'s method, and finite-difference derivatives are the smallest possible numerical algorithms, and they are the direct ancestors of every ODE/PDE solver you build later. This project is where you first develop the habit of asking "how do I know this number is right?" instead of "did the code run?"',
  explain:'🔍 You are a treasure hunter searching for a hidden number: the exact spot where a mathematical function crosses zero, this is called a root. Your job is to build two different search strategies.<br><br><b>Strategy 1, Bisection:</b> Like playing hot-and-cold, you keep cutting your search area in half until you zero in on the answer — slow, but it always works.<br><br><b>Strategy 2, Newton\'s Method:</b> A much faster shortcut that uses the function\'s slope, its derivative, to leap toward the answer, but it can sometimes get confused and bounce back and forth forever if you are not careful.<br><br>You will also build tools that estimate a slope using only nearby points, called finite differences, instead of true calculus.',
  firstWin:'Early win: a live print-out of your search homing in on an answer step by step, like watching a sniper scope zero in on a target.',
  problem:'Implement three general-purpose functions: bisection(f, a, b, tol), newton(f, df, x0, tol) — where df is the derivative function of f, supplied separately — and central_difference(f, x, h) plus forward_difference(f, x, h). REQUIRED EXACT CHECK: find the root of f(x) = x^2 − 2 (the positive root is exactly the square root of 2, 1.41421356...). Using bisection with a=0, b=2, tol=1e-8, your function must return a value within 1e-8 of 1.41421356. Using Newton\'s method with df(x)=2x, x0=1.0, tol=1e-8, it must converge to the same root in 5 or fewer iterations — record and report the iteration counts for both methods on this same problem, since that comparison is part of the deliverable. For differentiation, apply both finite-difference formulas to f(x) = sin(x) at x = 1.0, where the exact derivative is cos(1.0) = 0.5403023...; compute the error at h = 0.1, 0.01, 0.001, and 0.0001, and plot error versus h on a log-log axis — forward difference should show a slope of about 1 (error shrinks 10 times when h shrinks 10 times) and central difference a slope of about 2 (error shrinks 100 times when h shrinks 10 times). Finally, deliberately run Newton\'s method on f(x) = x^3 − 2x + 2 starting from x0 = 0 and show, with a plot of the iterates, that it fails to converge — it enters an endless 2-cycle, alternating between 0 and 1 — and explain why by inspecting the value of df at x0.',
  deliverableType:'Pygame root-finding visualizer', deliverableWhy:'The deliverable is a demonstrated understanding of convergence behavior, best shown through error-vs-iteration/step-size plots on a log-log scale.',
  dataSource:'None — validated entirely against analytically known test functions (e.g. x²−2 for root-finding, sin(x) for differentiation).',
  milestones:[
    'Implement bisection and Newton\'s method as general functions taking any function and its (optional) derivative.',
    'Test both on at least 4 functions with known roots; record iteration count to reach a target tolerance.',
    'Implement forward-difference and central-difference derivative approximations.',
    'Plot error vs. step size on a log-log axis for both differentiation schemes and empirically confirm their theoretical convergence order (O(h) vs O(h²)).',
    'Identify and explain a case where Newton\'s method fails to converge (e.g. bad initial guess, zero derivative).',
    'Build a live pygame view of the search itself: for bisection, draw the shrinking bracket as a colored zone that visibly narrows every step; for Newton, draw the tangent line at each iterate and animate the jump it produces, step by step, converging on the root live as you press a key to advance.'
  ],
  validation:['Root-finding results must match analytical roots to within a specified tolerance (e.g. 1e-8).','Log-log error plot for finite differences must show a slope consistent with the theoretical order (1 for forward, 2 for central) — this is your first real numerical-analysis validation.','Step through both live visualizations on f(x) = x squared minus 2 and confirm the on-screen marker lands within 1e-8 of 1.41421356 by the iteration count you recorded numerically.'],
  tools:['pygame','Python 3','NumPy','Matplotlib'],
  extensions:['Implement the secant method and compare convergence speed to Newton\'s method.','Implement a simple bracketing safeguard that falls back to bisection when Newton\'s method diverges.']
},
{
  id:'s1p3', title:'Simple Harmonic and Damped Oscillator Simulator', stage:1, domain:'Physics', difficulty:'Beginner', time:'2 weeks',
  prereqs:['s0p2','s1p2'],
  concepts:{math:['Second-order ODEs (converted to first-order systems)','Sinusoidal functions, phase and amplitude'], physics:['Simple harmonic motion, damping, resonance','Energy conservation in oscillators'], programming:['Object-oriented basics (a small Oscillator class)','Animation with matplotlib']},
  context:'This is your first differential equation and your first animated simulation. Getting an oscillator "wrong" numerically (using a naive Euler step) produces a visibly, physically impossible result — energy that grows over time — which makes this an unusually good project for learning that the numerical method you choose is not a neutral implementation detail.',
  explain:'🎵 You are building a tiny universe with just one spring and one mass bouncing on it forever, like a slinky. Your job is to predict its motion moment by moment using a simple stepping method, called Euler\'s method. The twist: this simple method has a secret flaw — it accidentally adds a little bit of extra energy at every single step, so your spring will slowly, unrealistically, bounce higher and higher forever, even though real springs lose energy and slow down. Your mission is to catch this flaw red-handed, measure it, and explain why it happens, before adding real friction (damping) and a periodic push (driving force) to find the exact push-speed that makes your spring swing the wildest, called resonance.',
  firstWin:'Early win: an actual bouncing spring animating on your screen within the first sitting, even before it is physically correct.',
  problem:'Implement a function that steps forward the state (position x, velocity v) of a mass-spring system by one time step dt using forward Euler, given mass m, spring constant k, damping coefficient c, and driving force F(t). REQUIRED EXACT CHECK (undamped, undriven case): use m=1 kg, k=1 N/m, c=0, F=0, x0=1 m, v0=0 m/s. The exact analytical solution is x(t) = cos(t). Run your integrator for 4 full periods (t from 0 to about 25.13 s) with dt=0.01, and compute the total mechanical energy E = 0.5·m·v^2 + 0.5·k·x^2 at every step — the true value should stay exactly 0.5 J throughout, since that is the initial energy and energy is conserved in reality. Plot E(t) and confirm it visibly grows over time instead of staying flat at 0.5 J — this growth is the artifact you are meant to observe and explain, not a bug to fix. Re-run at dt=0.1, 0.01, and 0.001 and show the energy-growth rate shrinks as dt shrinks. Only after documenting this artifact, add damping (c>0) and a sinusoidal driving force F(t) = F0·sin(w_drive·t), and sweep w_drive from 0.5 to 2.0 rad/s in steps of 0.05 to find and plot the resonance peak — for this system it should peak near w_drive = 1.0 rad/s, the system\'s natural frequency.',
  deliverableType:'Pygame spring simulation', deliverableWhy:'Motion over time is the entire point of the physics being taught, so an animated visualization communicates the result far better than a static plot.',
  dataSource:'None — parameters chosen to explore behavior; validated against the exact analytical solution for the undamped case.',
  milestones:[
    'Derive (on paper, then in a comment/markdown block) the conversion of mÿ+cẏ+ky=F(t) into a first-order system.',
    'Implement forward Euler integration for the undamped case and compare position/energy over time to the exact analytical solution.',
    'Quantify and plot the artificial energy growth as a function of time step size.',
    'Add damping and a sinusoidal driving force; explore resonance by sweeping the driving frequency.',
    'Animate position vs. time for at least the resonance case.',
    'Build this as a literal pygame program: a mass on a spring bouncing live on screen, stepped forward with forward Euler every frame, so you can watch, in real time, the oscillation visibly grow larger and larger as energy artificially builds up — a bug you can literally watch happen rather than only read in a plot.'
  ],
  validation:['Undamped case must match the analytical solution x(t)=A cos(ωt+φ) closely for small time steps, with visible, quantified divergence at larger time steps.','Total mechanical energy in the undamped case should be conserved in the true solution — measure and report how much your integrator violates this, as a function of step size.','Run the live simulation for at least 4 periods and confirm the on-screen oscillation amplitude is visibly larger at the end than at the start, consistent with your separately measured energy-growth numbers.'],
  tools:['pygame','Python 3','NumPy','Matplotlib (FuncAnimation)'],
  extensions:['Re-implement using RK4 (used later in Stage 3) and compare energy conservation directly against forward Euler at the same step size.','Sweep driving frequency finely near resonance and plot the resonance curve (amplitude vs. frequency).']
},
{
  id:'s1p4', title:'Flocking: Simulating Emergent Bird Behavior from Three Simple Rules', stage:1, domain:'Biology', difficulty:'Beginner', time:'2 weeks',
  prereqs:['s1p5'],
  concepts:{math:['2D vector math: normalization, averaging, steering forces'], physics:['Emergent collective behavior from simple local rules'], programming:['Object-oriented programming (a Boid class)','Spatial neighbor-finding','Git version control and automated tests applied to a real simulation codebase']},
  context:'Some of the most striking emergent behavior in nature, like a flock of starlings swirling as one, comes from each individual following only a few simple local rules, with no leader and no global plan. This project is the cleanest demonstration in this curriculum that complex, beautiful, global behavior can emerge from simple local rules — and because the entire point is what you see, a working flock is unmistakably correct or unmistakably broken just by watching it.',
  explain:'🐦 You are building a flock of birds from scratch, except each bird is dumb: it only knows three simple rules. Rule 1, Separation: do not crash into your neighbors. Rule 2, Alignment: try to fly in the same direction as nearby birds. Rule 3, Cohesion: drift toward the center of the birds near you. Your job is to give a hundred individual birds, called boids, only these three rules, run them all at once in a live pygame window, and watch something nobody explicitly programmed emerge: a living, swirling, self-organizing flock.<br><br><b>Quest 1, The Lone Boid:</b> get one boid moving and steering smoothly, with no flock yet.<br><br><b>Quest 2, The Crowd:</b> add a hundred boids and the three local rules, and watch disorganized chaos turn into flowing, flocking motion, live, with no leader and no global rule telling them to flock.<br><br><b>The Scientist\'s Discipline:</b> this project also asks you to build it properly: real git commit history, and automated tests for your three steering-rule functions, since a bug hidden inside beautiful-looking chaos is otherwise very easy to miss.',
  firstWin:'Early win: a hundred independent little triangles turning from scattered chaos into a single flowing, swirling flock, live, in the first sitting, with nobody telling them to flock.',
  problem:'Build a pygame flocking simulation: implement a Boid class with position, velocity, and heading, and implement three independent steering-force functions, separation, steer away from boids that are too close, alignment, steer toward the average heading of nearby boids, and cohesion, steer toward the average position of nearby boids, each operating only on boids within a limited neighbor radius you define. Combine the three steering forces with weights you choose and justify, update every boid every frame, and render all of them live in a pygame window as moving triangles or arrows pointing in their direction of travel. REQUIRED EXACT CHECK (rules working in isolation): disable alignment and cohesion and run with separation alone, boids should visibly spread out and never overlap. Disable separation and cohesion and run with alignment alone, all boids should visibly converge on a single shared heading within a few seconds. Disable separation and alignment and run with cohesion alone, all boids should visibly clump into one tight ball. Only once each rule is confirmed working alone, turn all three on together and confirm genuine flocking emerges: sub-groups forming, moving together, and occasionally merging or splitting, with no central controller. Build this with real git commit history, not one final commit, and pytest tests for each of the three steering functions in isolation, using small hand-constructed boid positions where you know the correct steering direction in advance.',
  deliverableType:'Ursina 3D flocking simulation', deliverableWhy:'Flocking only means anything as something you watch — there is no meaningful non-visual deliverable for emergent collective motion, since the scientific claim being demonstrated, complex global behavior from simple local rules, is itself a claim about what you see, not a number you could report instead.',
  dataSource:'None required — flocking is a rules-based emergent-behavior simulation, not a data-fitting exercise; its correctness is checked by isolating and testing each rule, not against external data.',
  milestones:[
    'Implement a single Boid class with position, velocity, and a method to update its position each frame given a steering force.',
    'Implement the separation, alignment, and cohesion steering functions as three independent functions, each taking a boid and its list of nearby neighbors.',
    'Test each rule in isolation by running a simulation with only that one rule active, and confirm the resulting motion matches the expected behavior for that rule alone.',
    'Combine all three rules with chosen weights, run 100 or more boids together live in pygame, and tune the weights until you get visually convincing flocking rather than either frozen clumping or total chaos.',
    'Set up a proper git repository with real incremental commit history and write pytest tests for each steering function using small hand-constructed neighbor configurations where you can predict the correct steering direction yourself.',
    'Add simple screen-edge wrapping or steering-away-from-edges so the flock stays visible instead of flying off screen.'
  ],
  validation:['Each rule in isolation must produce its predicted behavior exactly as described: separation-only spreads boids apart with no overlap, alignment-only converges all headings, cohesion-only clumps all boids into one ball.','The combined simulation must show genuine flock-like motion for at least 30 seconds of real run time: neither frozen in place nor scattering chaotically, with visible sub-group formation and merging.','All pytest tests for the three steering functions must pass on a clean checkout, confirmed by deleting your local environment and rebuilding it from a pinned requirements file.'],
  tools:['ursina','Python 3','NumPy','pytest','Git'],
  extensions:['Add a predator boid that hunts the flock and watch realistic evasive swirling emerge as a fourth behavior.','Add obstacles the flock must steer around and observe how the flock splits and rejoins on the other side.']
},
{
  id:'s1p5', title:'Object-Oriented N-Body Particle System (No Interactions)', stage:1, domain:'Physics', difficulty:'Beginner', time:'2 weeks',
  prereqs:['s1p2'],
  concepts:{math:['2D vectors: addition, scaling, magnitude'], physics:['Newtonian motion under a fixed external force (e.g. uniform gravity, drag)'], programming:['Object-oriented programming: classes, methods, encapsulation','Managing collections of objects']},
  context:'This project exists purely to build real object-oriented programming ability before you need it for something scientifically complex — every simulation from Stage 3 onward benefits from representing a "particle" or "agent" as an object with state and behavior rather than as loose arrays.',
  explain:'🎱 You are a toy-maker building tiny robot balls that each know their own position, speed, and weight, and know how to move themselves when a force, like gravity or air drag, pushes on them. Your job is to design a blueprint, called a class, for one ball, then create fifty of them at once and watch them all fly around independently under gravity and drag. The sneaky bug to avoid: accidentally letting two balls secretly share the exact same position or speed information, so that moving one ball mysteriously teleports another — a classic programming trap called shared mutable state.',
  firstWin:'Early win: fifty little dots flying and falling across your screen under gravity, each one doing its own thing.',
  problem:'Implement a Particle class with attributes position (a 2D NumPy array [x,y]), velocity ([vx,vy]), and mass, and a method step(dt, forces) that updates position and velocity using forward Euler given a list of force functions, each taking the particle and returning a 2D force vector. REQUIRED EXACT CHECK: create a single particle with mass=1 kg, position=[0,0], velocity=[0,0], apply only uniform gravity (force = [0, -9.8*mass]), and step for exactly 1 second with dt=0.001. Compare the simulated final position to the exact formula y = -0.5*g*t^2 = -4.9 m — they should agree to within 0.01 m. Then create a Simulation class holding a list of 50 Particle objects with randomized starting positions (x and y both drawn uniformly from -10 to 10) and velocities (vx and vy both drawn uniformly from -5 to 5), apply uniform gravity plus a linear drag force (force = -drag_coefficient * velocity) to every particle independently, run for 5 simulated seconds, and plot all 50 trajectories on one set of axes. Confirm, by reading your own code rather than just by eye on the plot, that no particle\'s position or velocity array is the same Python object as another particle\'s — accidentally sharing a mutable NumPy array between particles is the single most common bug in this project, and it produces trajectories that look plausible but are silently wrong.',
  deliverableType:'Ursina 3D particle sandbox', deliverableWhy:'The learning goal is software design, best demonstrated through a working simulation with plots rather than a persistent tool.',
  dataSource:'None — synthetic initial conditions are appropriate since the point is software architecture, not a real physical system.',
  milestones:[
    'Design and implement a Particle class with clear encapsulated state and an update(dt) method.',
    'Implement a Simulation class or function that manages a list of Particle objects and steps them forward together.',
    'Add uniform gravity and linear drag as forces acting independently on each particle.',
    'Simulate at least 50 particles with randomized initial conditions and plot their trajectories.',
    'Refactor once: identify one piece of duplicated logic and extract it into a shared method.',
    'Build this as a real pygame particle sandbox: fifty colored dots falling and drifting live under gravity and drag, each an independent Particle object, that you can watch run continuously, pause, and restart — a genuine playable simulation, not a saved animation file.'
  ],
  validation:['A single particle\'s trajectory under gravity+drag should match the analytical (or Stage-0 numerically verified) solution for that same case.','Code review checklist: no force-calculation logic duplicated between particles; each particle\'s state is genuinely independent (verify no accidental shared mutable state, a very common OOP bug).','Run the sandbox live for at least 10 seconds and confirm, by eye, that particles fall faster over time and drift sideways according to their own random drag, with no two particles ever moving in perfect lockstep, which would indicate shared state.'],
  tools:['ursina','Python 3','NumPy','Matplotlib'],
  extensions:['Add particle-particle collision detection (no physics response needed yet, just detection).','Add a simple boundary (particles bounce off walls) as a second force/event type.']
},

// ---------------- STAGE 2 ----------------
{
  id:'s2p1', title:'Linear System Solver From Scratch: Gaussian Elimination and LU', stage:2, domain:'Math', difficulty:'Intermediate', time:'2–3 weeks',
  prereqs:['s1p2','s1p5'],
  concepts:{math:['Systems of linear equations','Matrix operations, LU decomposition','Numerical stability, pivoting'], physics:['None directly'], programming:['2D array manipulation','Comparing custom implementation against a trusted library']},
  context:'Nearly every later numerical method — finite elements, finite differences, least squares, network analysis — eventually reduces to solving Ax=b. Building this yourself once, and seeing it fail without pivoting, is what makes numpy.linalg.solve something you understand rather than a magic box.',
  explain:'🧮 You are an equation-solving detective faced with several mystery numbers hiding inside a tangled web of equations at once, called a system of linear equations. Your job is to build your own solving machine from scratch, using a classic method called Gaussian elimination, instead of pressing a magic solve button. The trap you must discover yourself: sometimes a tiny, almost-zero number sneaks into your calculation and causes wildly wrong answers unless you are clever enough to swap rows around first, a safety trick called pivoting — you will build a broken version on purpose just to watch it fail, then fix it.',
  firstWin:'Early win: watching your own hand-built solver silently fail on a trick system, then come back to life the instant you add pivoting — a visible before-and-after.',
  problem:'Implement gaussian_eliminate(A, b) with no pivoting, gaussian_eliminate_pivoted(A, b) with partial pivoting, and lu_decompose(A) returning L and U such that L times U equals A. REQUIRED EXACT CHECK #1 (well-behaved system): solve [[2,1],[1,3]] times [x,y] = [3,5]. The exact answer is x=0.8, y=1.4 (check: 2×0.8+1×1.4=3.0, 1×0.8+3×1.4=5.0). Both solvers must return this exact answer. REQUIRED EXACT CHECK #2 (pivoting is necessary): solve [[1e-20, 1],[1, 1]] times [x,y] = [1, 2]. The true answer is x and y both approximately 1.0 to high precision. Your non-pivoted solver will divide by the tiny 1e-20 pivot and produce a badly wrong answer for x — confirm and report how wrong; your pivoted solver must still return x and y correct to at least 6 decimal places. REQUIRED EXACT CHECK #3: for both matrices above, confirm numerically that L times U reconstructs the original A to floating-point precision. For a broader accuracy benchmark, construct an 8-by-8 Hilbert matrix (entries A[i,j] = 1/(i+j+1), 0-indexed) as a genuinely ill-conditioned test case, solve it with your pivoted solver and with numpy.linalg.solve, and report both the condition number (numpy.linalg.cond) and how much the two solutions disagree.',
  deliverableType:'Pygame matrix-elimination visualizer', deliverableWhy:'The deliverable is a demonstrated, benchmarked algorithm — no persistent tool needed.',
  dataSource:'None — systems are constructed to test correctness and stability, including at least one genuinely ill-conditioned system.',
  milestones:[
    'Implement Gaussian elimination with back-substitution (no pivoting) and test on a well-behaved system.',
    'Construct a system where naive elimination without pivoting produces a large numerical error, and confirm you can reproduce that failure.',
    'Implement partial pivoting and show it fixes the failure case.',
    'Implement LU decomposition and use it to solve the same systems, confirming L·U reconstructs the original matrix.',
    'Benchmark your implementation vs. numpy.linalg.solve on accuracy (not speed) across at least 5 test systems, including one with a high condition number.',
    'Render the matrix live as a grid of colored tiles in a pygame window, and let the player press a key to step through elimination one operation at a time, watching tiles below the pivot visibly flash and zero out column by column, like watching the matrix solve itself move by move.'
  ],
  validation:['Solutions must match numpy.linalg.solve to within a stated tolerance for well-conditioned systems.','Explicitly report the condition number of each test matrix and relate it to the observed error.','The pivoting-necessary case must be reproduced and clearly explained, not just asserted.','Step through the live visualizer for your pivoting-required test matrix and confirm the on-screen tile values at the final step match your code\'s actual final matrix exactly.'],
  tools:['pygame','Python 3','NumPy (for comparison only, not for the core algorithm)'],
  extensions:['Implement Cholesky decomposition for symmetric positive-definite systems and compare its efficiency.','Implement iterative refinement to improve solution accuracy for ill-conditioned systems.']
},
{
  id:'s2p2', title:'Monte Carlo Estimation: From Pi to Real Integrals', stage:2, domain:'Math', difficulty:'Intermediate', time:'2 weeks',
  prereqs:['s1p2'],
  concepts:{math:['Probability, random sampling','Law of large numbers, convergence rate of Monte Carlo error (1/√N)'], physics:['None directly'], programming:['Pseudo-random number generation and seeding','Vectorized random sampling']},
  context:'Monte Carlo methods are the single most widely used numerical technique across computational science, from statistical physics to epidemiology to finance. Estimating π by throwing random darts is the classic toy version; the real skill this project builds is quantifying how estimation error shrinks with sample size — a concept you will reuse for uncertainty quantification in Stage 6.',
  explain:'🎯 You are a carnival dart-thrower who accidentally discovers a way to calculate pi. Your job is to throw thousands of random darts at a square with a circle inside it, and use the fraction that land inside the circle to estimate pi purely from randomness, a trick called the Monte Carlo method. Once you have proven it works on pi, you will use the exact same randomness trick to estimate the area under any curve, even wiggly ones that normal math formulas cannot solve directly, and you will report not just your guess but how confident you are in it.',
  firstWin:'Early win: a cloud of random dots scattering across a square, and pi emerging from pure randomness before your eyes.',
  problem:'Implement pi_estimate(N) using the classic dart-in-square method: draw N random (x,y) points uniformly in [-1,1] by [-1,1], count the fraction landing inside the unit circle (x^2+y^2 <= 1), and multiply by 4. REQUIRED EXACT CHECK: run pi_estimate at N = 100, 10,000, and 1,000,000 with a fixed random seed, and confirm the estimate gets closer to the true value 3.14159265... as N grows, and that the absolute error roughly follows the 1/sqrt(N) trend — error at N=1,000,000 should be roughly 10 times smaller than error at N=10,000, not 100 times and not the same, since sqrt(1,000,000/10,000)=10. Then implement monte_carlo_integrate(f, a, b, N), which estimates the integral of f(x) from a to b by averaging N random samples of f(x) for x drawn uniformly in [a,b] and multiplying by (b-a). REQUIRED EXACT CHECK: apply it to f(x)=x^2 from a=0 to b=1, whose exact integral is 1/3 = 0.3333...; your estimate at N=1,000,000 should be within about 0.001 of that. Only once this passes, apply the same function to a definite integral with no simple closed form of your choosing (for example, the integral of sin(x)/x from 0 to pi, handling x=0 carefully since sin(x)/x approaches 1 there), and report your estimate together with a 95% confidence interval computed as mean plus or minus 1.96 times the sample standard deviation divided by the square root of N.',
  deliverableType:'Pygame dart-throwing simulation', deliverableWhy:'The output is a convergence analysis best shown through plots; no persistent tool is needed.',
  dataSource:'None — validated against known analytical values (π, and integrals with known closed forms used as a stepping stone before tackling one without).',
  milestones:[
    'Implement the classic circle/square dart-throwing estimate of π and confirm convergence as N grows.',
    'Plot estimation error vs. N on a log-log scale and confirm the slope matches the theoretical −1/2 exponent.',
    'Generalize to Monte Carlo integration of an arbitrary 1D function over an interval.',
    'Apply it to a function with a known closed-form integral to validate correctness, then to one without a simple closed form.',
    'Estimate and report a confidence interval for your integral estimate based on the sample variance.',
    'Build a live pygame window where darts fall into the square one at a time or in small live batches, piling up as dots colored by inside or outside the circle, with a running pi estimate updating in the corner as you watch — press play and watch thousands of darts land in real time.'
  ],
  validation:['π estimate must converge toward the true value as N increases, with the observed error following the theoretical 1/√N trend on a log-log plot.','Report a numeric confidence interval for your final integral estimate, not just a point estimate.','Run the live simulation to at least 100,000 darts and confirm the on-screen running pi estimate visibly stops jumping around and settles near 3.14159.'],
  tools:['pygame','Python 3','NumPy'],
  extensions:['Implement a simple variance-reduction technique (e.g. importance sampling) and show it reduces error at fixed N.','Extend to a 2D or 3D integral where Monte Carlo\'s dimension-independent convergence becomes a genuine advantage over grid-based quadrature.']
},
{
  id:'s2p3', title:'Least-Squares Curve Fitting Toolkit Applied to Real Emissions Data', stage:2, domain:'Data Science', difficulty:'Intermediate', time:'2–3 weeks',
  prereqs:['s2p1','s1p1'],
  concepts:{math:['Least squares as a linear algebra problem (normal equations)','Nonlinear least squares (basic gradient-based fitting)','Residuals and goodness of fit'], physics:['None directly'], programming:['Connecting linear algebra (Stage 2) to real data fitting']},
  context:'This project connects your from-scratch linear-algebra solver directly to a real fitting problem, showing that "curve fitting" is not a separate magic tool but a direct application of solving Ax=b. Fitting real national CO2-emissions trajectories also introduces the very common situation where a simple linear model is the wrong choice and you have to justify a better one.',
  explain:'📉 You are a data scientist trying to draw the best possible line, curve, or wave through messy real-world numbers, in this case a country\'s actual CO2 emissions over many years. Your job is to build your own curve-fitting machine, using something called the normal equations, a shortcut from linear algebra, and test straight lines, curved lines, and wigglier curves. The trap to avoid: a super-wiggly curve can look like it fits your past data perfectly, while secretly being terrible at predicting the future, a mistake called overfitting, and you must catch yourself doing it by testing your curve on data it has never seen before.',
  firstWin:'Early win: a real country\'s rising CO2 emissions plotted as dots, with your own curve bending to fit them.',
  problem:'First validate your normal-equations solver (from the linear-system project) on synthetic data where the exact answer is known: generate x=[0,1,2,3,4,5], y = 2x + 5 exactly, fit a degree-1 polynomial via the normal equations, and confirm you recover slope=2.0 and intercept=5.0 exactly. Then generate x=[0,1,2,3,4,5], y = x^2 - 3x + 2 exactly, fit a degree-2 polynomial, and confirm you recover coefficients [1, -3, 2] (for x^2, x^1, x^0) exactly. Only once both exact checks pass, download real national CO2 emissions data (World Bank indicator EN.ATM.CO2E.KT) for one country over as many years as available, fit degree-1, degree-2, and degree-3 polynomials to it using your own normal-equations code, not numpy.polyfit, and for each report R^2 and RMSE. Hold out the final 20% of years as a test set, fitting only on the earlier 80%, predict those held-out years from each fitted model, and report the out-of-sample RMSE for each degree — the degree with the lowest held-out RMSE, not the lowest training RMSE, is the one you should recommend, and you must state explicitly if a higher-degree model has better training RMSE but worse held-out RMSE, since that is overfitting and catching it is the actual point of the held-out test.',
  deliverableType:'Pygame live curve-fitting visualizer', deliverableWhy:'The result is a comparative fit analysis, well suited to a script producing annotated plots.',
  dataSource:'World Bank Open Data — CO2 emissions (EN.ATM.CO2E.KT) or Our World in Data CO2 dataset, for a country or region of your choice.',
  milestones:[
    'Derive the normal equations for linear least squares and solve them using your Stage-2 solver (not numpy.polyfit).',
    'Fit linear, quadratic, and cubic polynomial models to the same real dataset.',
    'Compute residuals and a fit-quality metric (e.g. R² or RMSE) for each model.',
    'Identify and explain overfitting if a higher-degree polynomial fits noise rather than signal (e.g. via a held-out test period).',
    'Select and justify a final model, explicitly stating why higher accuracy on the training data does not automatically mean a better model.',
    'Render the real CO2 data points as fixed dots in a pygame window, and draw the fitted curve live, redrawing it as you increase the polynomial degree with a key press, so you watch the curve visibly start wriggling unnecessarily between points as it overfits.'
  ],
  validation:['Your normal-equations solver output must match numpy.polyfit for the same degree.','Held-out validation: fit on part of the time series, predict the remainder, and report the out-of-sample error explicitly, not just in-sample R².','Step live from degree 1 to degree 3 and confirm the on-screen curve\'s wiggle between data points is visibly larger at degree 3, matching your separately computed held-out RMSE getting worse at that degree.'],
  tools:['pygame','Python 3','NumPy','pandas','Matplotlib'],
  extensions:['Add regularization (ridge regression) and show how it controls overfitting for high-degree polynomials.','Fit an exponential or logistic model (nonlinear) instead of a polynomial and compare fit quality.']
},
{
  id:'s2p4', title:'Markov Chain Model of Rainfall State Transitions', stage:2, domain:'Climate', difficulty:'Intermediate', time:'2 weeks',
  prereqs:['s2p2'],
  concepts:{math:['Markov chains, transition matrices','Matrix powers and stationary distributions','Conditional probability'], physics:['Persistence structure of daily weather'], programming:['Building and sampling from a transition matrix']},
  context:'Rainfall on one day is not independent of rainfall the day before — the simplest realistic model of that dependency is a Markov chain. This is a small, tractable introduction to stochastic processes that shows up again, in far more complex form, in later epidemic and climate work.',
  explain:'🌧️ You are a fortune teller for the weather, but instead of magic, you use probability. Your job is to notice that today\'s weather depends a bit on yesterday\'s weather, since a rainy day is often followed by another rainy day, and capture that pattern in a simple table of probabilities, called a transition matrix, with the whole system called a Markov chain. Once your table is built from real rainfall data, you can use it to predict the long-run chance of rain on any random day, called the stationary distribution, and even generate entirely fake, but statistically realistic, years of rainfall.',
  firstWin:'Early win: a fake, computer-generated decade of rainfall that looks eerily like the real thing, generated entirely from a table of probabilities you built.',
  problem:'First build and test your Markov-chain code on a toy example with a known answer: define a 2-state chain (Dry, Wet) with transition matrix P = [[0.9, 0.1], [0.5, 0.5]] (row is the current state, column is the next state, so P[Dry][Wet]=0.1). The exact stationary distribution for this chain is [5/6, 1/6], approximately [0.833, 0.167] (solve pi·P=pi with the two probabilities summing to 1 to confirm this yourself on paper first). Confirm your code recovers this same distribution two independent ways: (a) by finding the dominant eigenvector of P transposed and normalizing it to sum to 1, and (b) by simulating a long random walk on the chain, at least 100,000 steps, and counting what fraction of the time was spent in each state — both should agree with [0.833, 0.167] to within about 0.01. Only after this check passes, download several years of daily precipitation for a real location from NASA POWER, define your own rainfall states with explicit thresholds you choose and state (for example: Dry = 0 mm, Light = 0 to 10 mm, Heavy = more than 10 mm — you may use different thresholds, but you must state them), build the transition matrix by counting actual day-to-day transitions in the real data, compute its stationary distribution using both methods above, and confirm they still agree with each other on the real chain. Finally, simulate a synthetic 10-year rainfall-state sequence from your fitted chain and compare its average dry-spell length, meaning consecutive Dry days, against the average dry-spell length in the real data.',
  deliverableType:'Pygame weather-walker simulation', deliverableWhy:'The output is a statistical model and its validation against real sequences — a script with supporting figures is appropriate.',
  dataSource:'NASA POWER API — daily precipitation for a location of your choice, several years of data.',
  milestones:[
    'Define discrete rainfall states with clear, justified thresholds.',
    'Estimate the transition matrix by counting observed state-to-state transitions in the real data.',
    'Compute the stationary distribution by finding the matrix\'s dominant eigenvector (power iteration or numpy.linalg.eig) and by direct matrix-power simulation, and confirm they agree.',
    'Generate synthetic rainfall-state sequences from the fitted chain.',
    'Compare statistics of synthetic sequences (e.g. average dry-spell length) against the real data.',
    'Render a swarm of at least 200 independent walker-blobs simultaneously in a pygame window, each one hopping between the three colored zones, Dry, Light, and Heavy, live according to your transition probabilities, so the long-run probability of each state becomes something you watch as crowd density, not just a number.'
  ],
  validation:['Two independent methods for computing the stationary distribution (eigenvector and long-run matrix powers) must agree.','Synthetic sequence statistics (e.g. run-length distribution of dry days) should be compared quantitatively, not just visually, to the same statistics computed on real data.','Run the live swarm for at least 500 simulated days and confirm the visible fraction of walkers in each zone at the end matches your separately computed stationary distribution to within about 0.05, eyeballing crowd density against the known proportions.'],
  tools:['pygame','Python 3','NumPy','pandas'],
  extensions:['Extend to a second-order Markov chain (transition depends on the last two days) and see if it improves the run-length match.','Fit separate chains per season and compare their stationary distributions.']
},
{
  id:'s2p5', title:'Eigenvector Centrality Analysis of an African Road/Trade Network', stage:2, domain:'Math', difficulty:'Intermediate', time:'2–3 weeks',
  prereqs:['s2p1'],
  concepts:{math:['Eigenvalues and eigenvectors','Graph theory basics (adjacency matrices, degree)','Power iteration'], physics:['None directly'], programming:['Working with real geospatial/graph data (OpenStreetMap)']},
  context:'PageRank-style eigenvector centrality is one of the cleanest real demonstrations that "an eigenvector" is not an abstract linear-algebra exercise but a genuinely useful measure of importance in a real network — in this case, which cities or road junctions are structurally most critical to a regional transport network.',
  explain:'🗺️ You are a spy analyzing a map of roads and towns to figure out which town is secretly the most important one in the whole network, not just the one with the most roads, but the one connected to other important places, exactly the trick Google originally used to rank web pages, called eigenvector centrality. Your job is to build the ranking algorithm yourself using a repeating multiplication trick called power iteration, test it on a simple 4-town map where you already know the answer, and then unleash it on a real African road network pulled from OpenStreetMap.',
  firstWin:'Early win: a real road map with towns sized by importance — the biggest dots are the ones your algorithm just crowned as structurally critical.',
  problem:'First validate your power-iteration eigenvector code on a small graph with a known answer: a 4-node undirected graph where node A connects to B and C, node B connects to A and C, node C connects to A, B, and D, and node D connects only to C. Build its adjacency matrix, run power iteration (start from any nonzero vector, repeatedly multiply by the adjacency matrix and renormalize) until it converges, and compare the result to numpy.linalg.eig\'s dominant eigenvector for the same matrix — they must match, up to an overall sign and scale, to at least 6 decimal places. In this graph, node C should come out with clearly the highest eigenvector centrality, since it has the most connections and connects to well-connected nodes — confirm this by inspection before moving to real data. Then extract a real road or settlement network for one African region of your choice from OpenStreetMap, via the Overpass API, representing at least 30 nodes, build its adjacency matrix, compute both degree centrality (simple connection count) and eigenvector centrality (your validated power-iteration code) for every node, and produce a map or network diagram where node size or color encodes each measure. Identify at least 2 specific nodes where the two measures rank very differently — a node with many connections to unimportant places versus a node with fewer connections but to important places — and name them specifically, with an explanation.',
  deliverableType:'Pygame random-walker centrality simulation', deliverableWhy:'A network visualization with computed centrality overlays is the natural output; no persistent app is needed.',
  dataSource:'OpenStreetMap (via the Overpass API or a pre-extracted regional extract) for a real African region\'s road network.',
  milestones:[
    'Extract a real road/settlement network for a region and represent it as an adjacency matrix or graph structure.',
    'Compute degree centrality as a baseline.',
    'Implement power iteration from scratch to find the dominant eigenvector (eigenvector centrality).',
    'Validate your power-iteration result against numpy.linalg.eig on the same matrix.',
    'Visualize the network with node size/color proportional to each centrality measure and identify at least 2 cases where the two measures rank nodes very differently, with an explanation.',
    'Draw the real road network in a pygame window and scatter many small walker-blobs onto it that wander live from node to connected node, step by step; let each node\'s circle grow slightly every time a walker visits it, so importance visibly accumulates as walker traffic in real time.'
  ],
  validation:['Your power-iteration eigenvector must match numpy.linalg.eig\'s dominant eigenvector (up to sign/scale) to within tolerance.','Sanity-check centrality results against real-world knowledge of the region (e.g. a known major junction should not rank as structurally unimportant).','Run the live walkers for several thousand steps and confirm the nodes that end up visibly largest on screen are the same ones your power-iteration eigenvector ranked highest.'],
  tools:['pygame','Python 3','NumPy','NetworkX (for graph handling, not for the eigenvector algorithm itself)','OpenStreetMap / Overpass API'],
  extensions:['Compute betweenness centrality (a different importance measure) and compare rankings.','Simulate removing the top-ranked node and quantify the resulting drop in network connectivity.']
},

// ---------------- STAGE 3 ----------------
{
  id:'s3p1', title:'General-Purpose ODE Solver Suite: Euler, RK4, Adaptive Step', stage:3, domain:'Computing', difficulty:'Intermediate', time:'3 weeks',
  prereqs:['s1p3','s2p1'],
  concepts:{math:['Ordinary differential equations, systems of ODEs','Taylor series basis of Runge-Kutta methods','Local vs. global truncation error'], physics:['None directly — this is the general numerical engine used by every ODE project after it'], programming:['Writing reusable, general-purpose numerical software (function-of-a-function design)']},
  context:'This project retires the ad hoc forward-Euler code from Stage 1 and replaces it with a properly validated, general-purpose ODE solver — the actual computational tool you will reuse for orbital mechanics, epidemics, and ecosystem models. Building and validating your own RK4 before ever calling scipy.integrate.solve_ivp is what makes that library something you understand rather than trust blindly.',
  explain:'⚙️ You are building a universal time machine for equations that describe how things change over time, these are called differential equations. Your job is to build two stepping engines: a simple, slightly clumsy one, called Euler, and a much smarter, four-times-per-step one, called RK4, or fourth-order Runge-Kutta, that takes tiny careful peeks ahead before committing to its next move. You will prove, with real numbers, that RK4 is dramatically more accurate, then build a smart version that automatically takes bigger steps when things are calm and smaller steps when things get chaotic.',
  firstWin:'Early win: Euler\'s clumsy guess and RK4\'s near-perfect answer, both drawn on top of the true solution so you can see the gap with your own eyes.',
  problem:'Implement euler_solve(f, y0, t0, t_end, dt) and rk4_solve(f, y0, t0, t_end, dt) as general solvers, where f(t, y) returns dy/dt (y may be a scalar or a NumPy array for systems). REQUIRED EXACT CHECK #1 (exponential decay): solve dy/dt = -y, y(0) = 1, from t=0 to t=5. The exact solution is y(t) = e^(-t), so y(5) = 0.0067379... Run both solvers at dt=0.1 and report y(5) and its absolute error against 0.0067379 for each — RK4\'s error should be dramatically smaller than Euler\'s, many orders of magnitude, at the same step size. REQUIRED EXACT CHECK #2 (convergence order): for both methods, run the same problem at dt = 0.1, 0.05, 0.025, 0.0125 and record the error in y(5) at each. Plot error versus dt on a log-log axis: Euler\'s points should lie approximately on a line of slope 1 (halving dt halves the error), RK4\'s on a line of slope 4 (halving dt shrinks the error by roughly 16 times). If your slopes are not close to these values, you have a bug and must not proceed. REQUIRED EXACT CHECK #3 (a system of two equations): solve the undamped oscillator from Stage 1 (dx/dt=v, dv/dt=-x, x(0)=1, v(0)=0) with RK4 at dt=0.01 out to t=10; x(10) should match cos(10) = -0.8390715... to at least 4 decimal places. Only once all three checks pass, implement an adaptive-step version that shrinks dt when the estimated local error is too large and grows it when the error is comfortably small, and compare, on the exponential-decay problem, how many total steps the adaptive method needs versus fixed-step RK4 to reach the same final accuracy.',
  deliverableType:'Pygame integrator race simulation', deliverableWhy:'The deliverable is a validated numerical library with convergence evidence, best communicated through error-vs-step-size plots.',
  dataSource:'None — validated entirely against ODEs with known analytical solutions (e.g. exponential decay, simple harmonic oscillator).',
  milestones:[
    'Implement Euler and RK4 as general solvers accepting an arbitrary right-hand-side function and initial condition.',
    'Test both against at least 3 ODEs (including one system of 2+ equations) with known analytical solutions.',
    'Plot error vs. step size on log-log axes for both methods and confirm their theoretical order (1 for Euler, 4 for RK4).',
    'Implement an adaptive step-size scheme that automatically shrinks/grows the step to hit a target local error tolerance.',
    'Compare total function evaluations needed by fixed-step RK4 vs. your adaptive method to hit the same overall accuracy.',
    'Build a live pygame race: two dots move along the same curve in real time, one stepped by Euler and one by RK4, chasing a faint guide line showing the true analytical solution, so you watch the Euler dot visibly drift off the guide line while the RK4 dot stays glued to it.'
  ],
  validation:['Log-log convergence plots must show the correct theoretical slope for each method — this is the core acceptance criterion.','Cross-check final results against scipy.integrate.solve_ivp for at least 2 test problems to confirm your implementation is not just "converging" but converging to the right answer.','Run the live race to t=5 on the exponential-decay check and confirm the on-screen gap between the Euler dot and the guide line is visibly larger than the gap for the RK4 dot, matching your measured error numbers.'],
  tools:['pygame','Python 3','NumPy','Matplotlib','SciPy (for final cross-validation only)'],
  extensions:['Implement an implicit method (backward Euler) and demonstrate its stability advantage on a stiff test problem.','Package the solver suite as a small reusable module you import in later projects instead of rewriting.']
},
{
  id:'s3p2', title:'Two-Body Orbital Mechanics Simulator', stage:3, domain:'Physics', difficulty:'Intermediate', time:'2–3 weeks',
  prereqs:['s3p1'],
  concepts:{math:['Vector calculus basics (position, velocity, acceleration as vectors)','Conic sections (ellipse geometry)'], physics:['Newtonian gravitation','Kepler\'s laws','Conservation of energy and angular momentum'], programming:['Applying your general ODE solver to a real physical system']},
  context:'This is the first project where your general-purpose ODE solver meets a genuinely famous physical system — one where you can check your simulation against laws that have been experimentally confirmed for centuries. It is also where energy and angular-momentum conservation become your primary validation tool, a technique you will reuse for every physical simulation afterward.',
  explain:'🪐 You are Isaac Newton with a computer. Your job is to simulate a planet orbiting a star using gravity, and prove, with your own simulation, three famous rules Johannes Kepler discovered just from watching the sky centuries ago: orbits are ellipses, planets sweep out equal areas in equal times (speeding up near the star and slowing down far away), and there is a precise relationship between how big an orbit is and how long it takes to complete, called Kepler\'s third law. Two invisible scorekeepers, energy and angular momentum, should stay perfectly constant throughout your simulation, and if they do not, you know you have a bug.',
  firstWin:'Early win: an actual planet, drawn as a dot, tracing a smooth ellipse around a star on your screen — your two-body solar system, animated and orbiting.',
  problem:'Simulate a planet of negligible mass orbiting a fixed star of mass M using Newtonian gravity, acceleration = -GM·r_hat/r^2, integrated with your Stage-3 RK4 solver. REQUIRED EXACT CHECK (circular orbit): choose units where GM=1, start the planet at position (1,0) with velocity (0,1) — the exact condition for a perfectly circular orbit of radius 1. The exact orbital period is T=2*pi*sqrt(r^3/GM)=2*pi, approximately 6.2832. Integrate for one full period with dt=0.001 and confirm: (a) the planet returns to within 1% of its starting position (1,0) at t near 6.2832; (b) its distance from the origin stays within 1% of 1.0 throughout, since a circular orbit has constant radius; and (c) total energy, E = 0.5*v^2 - GM/r in these units, stays constant to within 1% of its initial value throughout. Once the circular case passes, switch to an elliptical orbit, for example starting at (1,0) with velocity (0, 0.7) instead of (0,1), and verify Kepler\'s second law numerically: compute the area swept by the position vector during the first tenth of the orbital period and during a later tenth of the same orbit — the two swept areas must be equal, to within a few percent, even though the planet moves at very different speeds in each interval. Finally, run at least 3 different orbits with different semi-major axes, by varying the starting speed, and confirm Kepler\'s third law: a log-log plot of orbital period T versus semi-major axis a across your 3 orbits should have a slope very close to 1.5, since T^2 proportional to a^3 means T proportional to a^1.5.',
  deliverableType:'Ursina 3D orbital simulation', deliverableWhy:'An orbit is inherently a trajectory over time, and animation communicates its shape and periodicity far better than a static plot.',
  dataSource:'None required, though you may validate against real solar-system orbital parameters (NASA JPL data) as a stretch check.',
  milestones:[
    'Set up the two-body equations of motion as a first-order system and integrate with your Stage-3 RK4 solver.',
    'Confirm the orbit is a closed ellipse for bound initial conditions and measure its eccentricity from the simulated path.',
    'Verify Kepler\'s second law (equal areas in equal times) numerically by computing swept area over equal time intervals.',
    'Verify Kepler\'s third law by running simulations at several different orbital energies/semi-major axes and checking T² ∝ a³.',
    'Track total energy and angular momentum over the full simulation and quantify their numerical drift.',
    'Build this as a literal pygame program: a star and a planet rendered as circles, the planet actually orbiting live in a running pygame window with a fading trail showing its path, visibly speeding up near the star and slowing down far away — press play and watch your two-body solar system run.'
  ],
  validation:['Energy and angular momentum must remain constant to within a small, explicitly stated tolerance over the full simulated time — significant drift indicates either a bug or an inappropriate step size.','T² ∝ a³ must hold across at least 3 different simulated orbits, fit and reported with a numeric exponent close to 3/2 for a vs 1 for T (i.e., checking the actual power-law relationship).','Watch the live orbit complete one full lap and confirm, by the trail it leaves, that it closes back into the same ellipse shape each time, with the on-screen period matching your computed 2*pi for the circular case.'],
  tools:['ursina','Python 3','NumPy','Matplotlib (animation)'],
  extensions:['Extend to a restricted three-body problem and observe chaotic behavior for certain initial conditions.','Compare RK4 energy drift over long timescales against a symplectic integrator (e.g. leapfrog) and explain why symplectic methods are preferred for long-term orbital simulation.']
},
{
  id:'s3p3', title:'SEIR Epidemic Model Calibrated to a Real Outbreak', stage:3, domain:'Epidemiology', difficulty:'Intermediate', time:'3 weeks',
  prereqs:['s3p1','s2p3'],
  concepts:{math:['Nonlinear systems of ODEs','Basic reproduction number (R₀)','Parameter estimation / calibration'], physics:['None — dynamical-systems modeling applied to disease spread'], programming:['Connecting an ODE model to real time-series data via optimization']},
  context:'Compartmental epidemic models are one of the most consequential real applications of the ODE machinery you built in Stage 3 — the same equations, in more elaborate form, are what public-health agencies actually use to plan responses. Calibrating your model to a documented real outbreak, rather than inventing parameters, is what turns this from a math exercise into an epidemiological modeling exercise.',
  explain:'🦠 You are a disease detective modeling how an outbreak spreads through a population, divided into four buckets of people: Susceptible (can catch it), Exposed (infected but not yet contagious), Infectious (can spread it), and Recovered (immune now), called the SEIR model. Your job is to build this model as a set of interconnected equations, calculate a single famous number called R0 (pronounced R-naught) that tells you, on average, how many new people one sick person infects, and then calibrate your model against real reported case numbers from an actual documented outbreak to see how close your prediction gets to reality.',
  firstWin:'Early win: a real epidemic curve rising, peaking, and falling on your screen, then your simulated curve rising and falling right alongside it.',
  problem:'Implement the SEIR model as four coupled ODEs: dS/dt = -beta*S*I/N, dE/dt = beta*S*I/N - sigma*E, dI/dt = sigma*E - gamma*I, dR/dt = gamma*I, where N is total population, beta is the transmission rate, sigma is 1 divided by the incubation period, and gamma is 1 divided by the infectious period. REQUIRED EXACT CHECK: with N=1,000,000, S(0)=999,000, E(0)=0, I(0)=1,000, R(0)=0, beta=0.5, sigma=0.2 (5-day incubation), gamma=0.1 (10-day infectious period), integrate for 200 days with your Stage-3 RK4 solver. The basic reproduction number for this parameter set is exactly R0 = beta/gamma = 5.0 — this is the standard SEIR formula; use it, do not derive a different one. Confirm your simulation produces a single epidemic peak (I(t) rises then falls, never oscillates or grows forever), S(t) monotonically decreasing throughout, and that S+E+I+R stays within a small numerical tolerance of the fixed total N=1,000,000 at every time step — population conservation is a strict property of this model, and drift means a bug. Once your implementation passes this synthetic check, download a real reported daily or weekly case-count time series for one documented African outbreak from the Humanitarian Data Exchange, and calibrate beta, sigma, and gamma — or, more realistically and more simply, just beta, holding sigma and gamma fixed at literature-reported values for that disease — by trying a range of values and keeping whichever combination minimizes the sum of squared differences between your model\'s daily new cases (sigma*E(t), the rate people leave the exposed compartment) and the real reported daily new cases. Report your calibrated R0 = beta/gamma and compare it, with a citation or link, to a published R0 estimate for that specific outbreak.',
  deliverableType:'Pygame epidemic-blob simulation', deliverableWhy:'The result is a calibrated model and scenario comparison, well communicated through time-series plots rather than an interactive tool.',
  dataSource:'Humanitarian Data Exchange (data.humdata.org) outbreak case-count datasets — e.g. a documented Ebola, cholera, or COVID-19 outbreak in an African country with available time series.',
  milestones:[
    'Implement the SEIR equations and integrate them with your Stage-3 solver, confirming sensible qualitative behavior (a single epidemic peak, eventual extinction) for reasonable parameters.',
    'Obtain a real reported case-count time series for a documented outbreak.',
    'Calibrate model parameters to the real data by minimizing an error metric between simulated and reported cases (grid search or a simple optimizer).',
    'Compute R₀ from the calibrated parameters and compare it to published estimates for that outbreak, if available.',
    'Simulate a hypothetical intervention (reduced transmission rate at a given date) and quantify its effect on peak cases and total cases.',
    'Build this in the classic style of colored-blob pandemic simulations: individual blobs bouncing around a pygame window, colored blue for susceptible, red for infectious, green for recovered, changing color live on contact according to your SEIR probabilities, so the whole outbreak plays out as a watchable live scene, not a line chart.'
  ],
  validation:['Calibrated model output should visibly track the shape of the real outbreak curve, with a quantified fit error reported (not just "looks close").','Your R₀ estimate should be compared explicitly against a published value for the same outbreak, with a discussion of why they might differ (different assumptions, data quality, model simplifications).','Run the live blob simulation and confirm the moment the red-blob count visibly peaks on screen lines up with the peak day your numerical I(t) curve reports, within a few simulated days.'],
  tools:['pygame','Python 3','NumPy','SciPy (optimize)','pandas','Matplotlib'],
  extensions:['Add spatial structure (two connected regions with different parameters) instead of a single well-mixed population.','Perform a basic sensitivity analysis: which single parameter, if uncertain, changes the peak-case prediction the most?']
},
{
  id:'s3p4', title:'Predator-Prey Dynamics: Lotka-Volterra Against Real Population Data', stage:3, domain:'Biology', difficulty:'Intermediate', time:'2–3 weeks',
  prereqs:['s3p1'],
  concepts:{math:['Nonlinear coupled ODEs','Phase-plane analysis','Fixed points and stability (qualitative)'], physics:['None — ecological dynamical systems'], programming:['Phase-portrait plotting']},
  context:'The Lotka-Volterra system is the canonical example of nonlinear dynamics producing oscillation without any external periodic forcing — a genuinely different kind of behavior from anything in Stage 1 or 2. Comparing it against real historical predator-prey population records (the classic Hudson Bay Company lynx-hare dataset is public and well documented) grounds the abstract oscillation in an actual ecological argument.',
  explain:'🦊🐇 You are an ecologist watching foxes and rabbits chase each other through the seasons, in a never-ending cycle: more rabbits means more food for foxes, so foxes multiply, then too many foxes eat too many rabbits, so foxes starve and shrink back, letting rabbits recover, and the cycle repeats forever. Your job is to build this predator-prey dance as a pair of connected equations, called the Lotka-Volterra equations, find the exact balance point where both populations could stay perfectly steady forever, called a fixed point, and then test your model against real historical fox-and-rabbit-fur records to see where reality behaves differently than your tidy equations predict.',
  firstWin:'Early win: foxes and rabbits chasing each other in an endless loop on a phase-portrait plot, going round and round forever.',
  problem:'Implement the Lotka-Volterra equations dx/dt = alpha*x - beta*x*y (prey), dy/dt = delta*x*y - gamma*y (predator). REQUIRED EXACT CHECK: with alpha=1.0, beta=0.1, delta=0.075, gamma=1.5, the model has a nontrivial fixed point at exactly x* = gamma/delta = 20.0 and y* = alpha/beta = 10.0 — solve dx/dt=0 and dy/dt=0 by hand to confirm this yourself before coding; it is two lines of algebra. Starting your simulation exactly at (x,y) = (20.0, 10.0), the populations should stay constant, since this is an equilibrium — verify your integrator keeps them there, or very close, for at least 50 time units. Starting instead at (x,y) = (22, 10), slightly perturbed from equilibrium, the populations should oscillate periodically around (20, 10) without spiraling in or out — plot x versus y and confirm it looks like a closed loop, not a spiral, over at least 5 oscillation cycles. Once this check passes, obtain the Hudson Bay Company lynx-hare pelt-count time series, a well-known freely available historical ecological dataset you can find by searching for it by name, fit alpha, beta, delta, gamma to the real data, a simple grid search or scipy.optimize.least_squares against the two time series is sufficient, plot your fitted model against the real data, and report the fit error numerically. Identify and describe at least 2 specific years where the real data visibly departs from your fitted model, and offer a specific possible explanation for each, for example a disease outbreak, a change in trapping intensity, or a food-source failure — you do not need to prove the explanation, just propose a plausible, specific one.',
  deliverableType:'Pygame predator-prey simulation', deliverableWhy:'Phase portraits and time-series comparisons are the natural output; no persistent tool is needed.',
  dataSource:'The Hudson Bay Company lynx-hare pelt records (a classic, freely available ecological time series) or an alternative real predator-prey dataset you locate.',
  milestones:[
    'Implement the Lotka-Volterra equations and integrate with your Stage-3 solver.',
    'Plot both time-series and phase-portrait (predator vs. prey population) views for several parameter sets.',
    'Analytically find the model\'s fixed points and classify their stability by inspection of the linearized system (a first taste of stability analysis).',
    'Fit model parameters to the real lynx-hare (or alternative) dataset.',
    'Explicitly discuss at least 2 ways the real data deviates from the model\'s predictions and what missing physics/biology (e.g. carrying capacity, seasonality) might explain the deviation.',
    'Build a live pygame chase: rabbit-blobs multiply when food is plentiful, fox-blobs chase and remove nearby rabbit-blobs and starve and vanish when rabbits run low, all playing out in real time on screen, not just as a line graph of two populations.'
  ],
  validation:['Fixed-point locations found analytically must match where the numerically simulated trajectory\'s phase portrait actually centers its oscillation.','Report a quantitative fit error against the real dataset, and do not claim a "good fit" without that number.','Run the live chase for several cycles and confirm the on-screen rabbit and fox counts visibly rise and fall out of phase with each other, matching the oscillation pattern from your numerical Lotka-Volterra solution.'],
  tools:['pygame','Python 3','NumPy','Matplotlib'],
  extensions:['Add a carrying capacity term for the prey population and observe how it changes long-run behavior (damped oscillation vs. sustained cycles).','Extend to a three-species food web and characterize whether it remains stable or becomes chaotic.']
},
{
  id:'s3p5', title:'Optimal Sizing of a Solar-Plus-Battery System Using Real Irradiance Data', stage:3, domain:'Energy', difficulty:'Intermediate', time:'3 weeks',
  prereqs:['s2p2','s1p1'],
  concepts:{math:['Gradient descent and Newton\'s method for optimization','Constrained optimization basics (feasible region)'], physics:['Solar energy conversion, basic energy balance/storage'], programming:['Formulating a real engineering decision as an optimization problem']},
  context:'This project turns a genuinely practical African-relevant engineering question — how large a solar array and battery should a facility install, given real local solar data and a load profile — into a formal optimization problem, giving optimization theory a concrete stakes-bearing application instead of an abstract minimize-this-function exercise.',
  explain:'☀️🔋 You are an energy engineer designing a solar-and-battery power system for a real building, and you need to answer a genuinely expensive question: how big should the solar panels be, and how big should the battery be, to keep the lights on almost every single day, without spending more money than necessary? Your job is to build a simulation that tracks the battery filling up with sunshine and draining from use, hour by hour, and then build a search algorithm, an optimizer, that tries many combinations of panel size and battery size to find the cheapest one that still keeps the power reliable, using real sunlight data instead of guesses.',
  firstWin:'Early win: a battery-charge line rising and falling with the sun over a real year of weather data, right in front of you.',
  problem:'First validate your energy-balance simulator on a synthetic, hand-checkable case: a constant load of 2 kWh/day, irradiance equivalent to exactly 5 sun-hours/day (meaning the same daily energy as 5 hours of 1000 W/m^2 irradiance, a standard way solar resource is expressed), a panel rated at 1 kW (so it generates 1 kW times 5 h = 5 kWh/day under this simplification), and a battery capacity of 4 kWh starting half full at 2 kWh. By hand: each day the panel generates 5 kWh, the load consumes 2 kWh, so the battery should gain 3 kWh/day, capped at its 4 kWh capacity — energy beyond the cap is lost, not stored. Run your simulator for this exact scenario for 5 days and confirm the battery state of charge follows exactly: Day 1 end = 4.0 kWh, capped, since 2+3=5 exceeds capacity 4, and it stays at 4.0 kWh every day after, with zero unmet-load events throughout. Once this passes, download a real year of solar irradiance data, the ALLSKY_SFC_SW_DWN variable, for one location from NASA POWER, define a daily load profile of your choice and state your assumption explicitly, for example a flat 5 kWh/day or a residential profile you find and cite, and search over combinations of panel size in kW and battery size in kWh to find the lowest-cost combination, defined as panel_kW times cost_per_kW plus battery_kWh times cost_per_kWh using any reasonable published unit costs you cite, for which unmet load occurs on no more than 5% of days in the real year of data. Validate your search result against a brute-force grid search over the same panel and battery ranges — your result should find a combination whose cost is the same as, or within about 2% of, the grid search\'s best combination.',
  deliverableType:'Pygame live optimization-landscape simulation', deliverableWhy:'The output is a genuine optimization search, and a live view of a marker rolling across a colored cost landscape toward the cheapest reliable combination shows the actual method at work, not just its final answer, with the battery time-lapse as a supporting view of what that chosen combination looks like in operation.',
  dataSource:'NASA POWER API — solar irradiance (all-sky surface shortwave downward irradiance) time series for a real location.',
  milestones:[
    'Build a simple energy-balance simulation: given panel size, battery size, irradiance data, and a load profile, simulate the state of charge over time and count unmet-load events.',
    'Implement gradient descent (or another optimizer of your choice) from scratch to search over panel/battery size for minimum cost subject to the reliability constraint.',
    'Validate your optimizer against a brute-force grid search over the same parameter space to confirm it finds the same (or a comparably good) optimum.',
    'Plot the cost-reliability tradeoff curve (Pareto frontier) across a range of reliability targets.',
    'State clearly what assumptions (load shape, battery efficiency, degradation ignored, etc.) limit the real-world applicability of the result.',
    'Build a live pygame time-lapse: a battery-gauge bar that fills and drains hour by hour next to a sun icon that brightens and dims with the real irradiance data, sped up so a full year plays out in under a minute of watching.',
    'Beyond the time-lapse, render the actual optimization search live: draw a 2D grid where one axis is panel size and the other is battery size, color each point by its total cost, and animate a search marker rolling across this cost landscape toward the cheapest combination that still meets your reliability target, the same way you would watch a ball roll downhill, so the optimization itself, not just its final answer, is something you watch happen.'
  ],
  validation:['Your optimizer\'s result must match (or be demonstrably close to) the brute-force grid-search optimum on the same problem.','Sanity-check the energy-balance simulation against hand calculation for at least one simple day (e.g. constant load, known irradiance) before trusting it for optimization.','Run the live time-lapse over a real multi-day low-irradiance stretch and confirm the gauge visibly drops toward empty at the same points your numerical simulation reports unmet-load events.','Confirm the live search marker\'s final resting point matches the result of your brute-force grid search within the same tolerance you already required, and confirm, by watching the live search, that the marker visibly moves toward lower-cost regions of the landscape rather than wandering randomly.'],
  tools:['pygame','Python 3','NumPy','SciPy (optimize, for cross-validation)','Matplotlib'],
  extensions:['Add battery degradation over multi-year operation and re-optimize accounting for replacement cost.','Compare optimization results across 3 different real locations with different solar profiles.']
},

// ---------------- STAGE 4 ----------------
{
  id:'s4p1', title:'1D and 2D Heat Diffusion Solver (Finite Difference)', stage:4, domain:'Physics', difficulty:'Advanced', time:'3 weeks',
  prereqs:['s3p1','s2p1'],
  concepts:{math:['Partial differential equations (the heat/diffusion equation)','Finite-difference discretization of spatial derivatives','Numerical stability (CFL / von Neumann condition)'], physics:['Heat conduction, diffusion processes'], programming:['2D array-based simulation, stepping a field forward in time']},
  context:'This is your first PDE and your first genuine numerical-stability crisis: an explicit finite-difference heat solver becomes unstable and blows up if the time step is too large relative to the spatial grid, in a way that is qualitatively different from anything in the ODE work of Stage 3. Understanding and deriving the stability limit yourself is the actual point of the project, more than the heat equation itself.',
  explain:'🔥 You are simulating heat spreading through a metal rod, the way a hot spoon left in a pan slowly warms up along its whole length. Your job is to build a simulation that chops the rod into tiny segments and the time into tiny steps, this method is called finite differences, and prove your simulation matches a known, exact mathematical answer. The real challenge, and the whole point of this project, is discovering a hidden landmine: if your time steps are too big compared to your segment size, your simulation does not just become inaccurate, it explodes into nonsense numbers. Finding the exact safe boundary, called a stability condition, before you cross it is your mission.',
  firstWin:'Early win: a glowing hot spot visibly cooling and spreading across a 2D grid in a live animation, like watching a pan cool down.',
  problem:'Implement an explicit finite-difference solver for the 1D heat equation dT/dt = alpha*d2T/dx2 on a rod of length L with both ends held at T=0. REQUIRED EXACT CHECK: use L=1, alpha=0.01, and initial condition T(x,0) = sin(pi*x), which already satisfies the boundary conditions since sin(0)=sin(pi)=0. This specific initial condition has an exact analytical solution: T(x,t) = sin(pi*x) * e^(-alpha*pi^2*t). Using a grid of 50 points and a time step chosen to satisfy the stability condition below, run to t=2.0 and compare your numerical T(x,2.0) to the exact formula at every grid point — the maximum difference should shrink as you increase grid resolution; test at least 3 resolutions, e.g. 20, 50, 100 points, and confirm the error goes down as resolution goes up. REQUIRED EXACT CHECK (stability): this explicit scheme is only stable when alpha*dt/dx^2 <= 0.5 — the von Neumann stability condition for this equation; look it up to confirm rather than just trusting this sentence. Deliberately run with alpha*dt/dx^2 = 0.6, violating the condition, and confirm the solution visibly blows up, values growing without bound, within a small number of time steps; then fix dt to satisfy the condition and confirm the blow-up disappears. Only after both checks pass, extend to 2D, a square domain with all edges held at T=0, and animate the diffusion of an initial hot spot, for example T=100 in a small square in the center, T=0 elsewhere, toward equilibrium.',
  deliverableType:'Ursina 3D heat-landscape simulation', deliverableWhy:'A diffusing temperature field is inherently spatial and time-varying — an animation communicates the physics far better than a snapshot.',
  dataSource:'None required — validated against the known analytical solution of the heat equation for simple initial/boundary conditions.',
  milestones:[
    'Implement the 1D explicit finite-difference heat equation solver on a fixed grid.',
    'Validate against the known analytical solution for an initial delta-function or sinusoidal temperature profile.',
    'Deliberately choose a time step that violates the stability limit and observe (and document) the blow-up.',
    'Derive (or look up and then verify empirically) the CFL-type stability condition and confirm your solver is stable exactly when the condition predicts it should be.',
    'Extend to 2D and animate the diffusion of an initial hot spot.',
    'Render the rod or grid as literal colored heat cells in a pygame window, red for hot and blue for cold, redrawn live every simulated time step so you watch the hot spot visibly cool and spread in real time, like a live thermal camera.'
  ],
  validation:['1D solution must match the analytical solution to a quantified error at a fixed time, with error shrinking as grid resolution increases (a convergence check, as in Stage 1/3).','The empirically observed stability threshold must match the theoretically derived one to within numerical rounding — this is the primary acceptance criterion for the project.','Run the live simulation at a stable time step and confirm the on-screen hot region visibly shrinks and spreads smoothly, then deliberately run it at an unstable time step and confirm the live view visibly breaks into nonsense noise within a few frames.'],
  tools:['ursina','Python 3','NumPy','Matplotlib (animation)'],
  extensions:['Implement the implicit (backward Euler) scheme and show it remains stable at time steps that break the explicit scheme.','Add spatially varying thermal diffusivity (e.g. two different materials) and observe the effect at the interface.']
},
{
  id:'s4p2', title:'Groundwater Pollutant Transport Model for a Real River Basin', stage:4, domain:'Environmental Science', difficulty:'Advanced', time:'3–4 weeks',
  prereqs:['s4p1'],
  concepts:{math:['Advection-diffusion PDE','Finite-difference schemes for advection (upwind schemes)'], physics:['Fluid transport, dispersion of a contaminant'], programming:['Combining two PDE terms (advection + diffusion) into one solver','Working with real elevation/hydrology data']},
  context:'This project extends the pure-diffusion solver from the previous project with an advection (flow-driven transport) term, applied to a real environmental question: how a pollutant introduced at one point in a river or aquifer spreads downstream over time — directly relevant to water-security work in African basins.',
  explain:'🏭 You are an environmental investigator tracking a spill of pollution as a river carries it downstream while it also spreads out and thins over time, exactly like a drop of food coloring in flowing water: it drifts along with the current, called advection, while also smearing outward, called diffusion. Your job is to build a simulation of both effects at once, test it against water flowing at an exact known speed to make sure it is trustworthy, and then apply it to a real river to answer a real environmental-safety question: how far downstream, and how diluted, does a pollutant get after a day?',
  firstWin:'Early win: a pollutant pulse visibly drifting and smearing downstream in an animated plume, exactly like dye spreading in a river.',
  problem:'Implement a 1D advection-diffusion solver for dC/dt = -v*dC/dx + D*d2C/dx2, where C is concentration, v is flow velocity, and D is the diffusion coefficient. REQUIRED EXACT CHECK #1 (pure advection, D=0): release a sharp pulse, for example a narrow Gaussian bump, at x=0 with v=1 m/s, and confirm that after 10 seconds the pulse peak has moved to almost exactly x=10 m, since position = v times t, with only small numerical smearing. Use an upwind finite-difference scheme specifically for the advection term, since a naive centered-difference scheme produces unphysical oscillations here — a well-known numerical-methods trap; look up "upwind scheme" if you have not encountered it. REQUIRED EXACT CHECK #2 (advection plus diffusion, analytical solution): with the same v=1 m/s and D=0.1 m^2/s, the exact solution for an initial point release is a Gaussian whose center moves at speed v, mean position = v times t, and whose variance grows as sigma^2 = 2*D*t. At t=10 s, the exact mean position is 10 m and the exact variance is 2*0.1*10=2.0 m^2, standard deviation about 1.41 m. Compare your simulated concentration profile\'s mean and variance, computed as the first and second moments of your C(x) array, against these two exact numbers — they should agree to within about 5%. Once both checks pass, find a real flow-velocity estimate, in m/s, for a real river of your choice from a hydrological agency, government report, or documented case study, use it as your advection speed, simulate a pollutant pulse released at one point, and report how far downstream the plume travels and how much it has spread after a timeframe you choose, for example 24 hours, and justify.',
  deliverableType:'Pygame pollutant-plume simulation', deliverableWhy:'A transported, dispersing plume is best communicated as an animation of concentration over space and time.',
  dataSource:'A real river\'s flow rate/discharge data (e.g. from a national hydrological agency, HydroSHEDS, or a documented case study) to set a realistic advection velocity.',
  milestones:[
    'Implement pure advection (no diffusion) with an upwind finite-difference scheme and confirm it correctly transports an initial pulse at the expected speed.',
    'Add the diffusion term back in and combine both into a single advection-diffusion solver.',
    'Choose a real river/basin and obtain a realistic flow velocity to use as your advection speed.',
    'Simulate a pollutant pulse released at one point and track its position and spread (variance) over time.',
    'Compare your simulated plume spread against the analytical solution for pure advection-diffusion (a Gaussian plume) as a validation check.',
    'Render the river as a pygame window with a dye blob that visibly drifts downstream and smears outward live, its color fading as it dilutes, so you watch the plume travel and spread in real time rather than reading a final concentration plot.'
  ],
  validation:['Pure advection test: the pulse must travel at exactly the prescribed velocity with minimal numerical smearing — quantify the smearing and relate it to grid resolution.','Combined advection-diffusion result should match the known analytical Gaussian-plume solution (mean position and variance growth) to a stated tolerance.','Run the live plume for 10 simulated seconds and confirm its on-screen position has visibly moved to about 10 times your advection speed in pixels-per-second-equivalent, matching your v times t check.'],
  tools:['pygame','Python 3','NumPy','Matplotlib (animation)'],
  extensions:['Add a simple decay term (e.g. for a pollutant that breaks down over time) and see how it changes the plume\'s downstream reach.','Extend to 2D flow around a simple obstacle (e.g. a bend in the river).']
},
{
  id:'s4p3', title:'Agent-Based Model of Disease Spread on a Real Settlement Network', stage:4, domain:'Epidemiology', difficulty:'Advanced', time:'3–4 weeks',
  prereqs:['s3p3','s2p5'],
  concepts:{math:['Graph-based stochastic processes','Basic network topology metrics'], physics:['None — complex-systems/agent-based modeling'], programming:['Agent-based modeling architecture (many independent, interacting objects)','Working with real population-distribution data']},
  context:'Compartmental models (Stage 3) assume everyone mixes uniformly; real populations do not. This project builds a genuinely different kind of model — individual agents moving and interacting on a realistic settlement network — and compares its output against the SEIR model from Stage 3 on the same disease, showing concretely how network structure changes epidemic dynamics.',
  explain:'🏘️🦠 You already built a simple disease model that assumes everyone in a population mixes together evenly, like marbles shaken in a jar. But real people live in separate towns and only occasionally travel between them. Your job is to build a much more realistic simulation where every single person is tracked individually, called an agent-based model, living in a specific town, and only sometimes traveling to connect with other towns through a network. You must first prove that when you shrink your fancy new model down to a single town, it behaves exactly like your old simple model, and only then unleash it on a real map of African settlements to discover how disease spreads differently across a real, spread-out population.',
  firstWin:'Early win: hundreds of colored dots representing real people, changing color as disease spreads across a map of real towns.',
  problem:'Build an agent-based SEIR-style simulation: each agent has a state, S, E, I, or R, and belongs to one settlement (node) in a network; at each time step, infectious agents can infect susceptible agents in the same settlement with some probability, and agents can also travel between connected settlements according to network edge weights. REQUIRED EXACT CHECK (reduces to the simple model): configure your agent-based model with a SINGLE settlement, no network, everyone fully mixed in one place, using the same beta, sigma, gamma parameters as your Stage-3 SEIR calibration, run it with the same total population, and confirm the resulting aggregate epidemic curve, averaged over at least 20 independent stochastic runs, closely resembles the deterministic SEIR curve from Stage 3 — same rough peak timing and peak size, within the run-to-run variability you observe. This is a required check: a spatial model that does not reduce to the simple model in this trivial single-node case has a bug, not a new discovery. Once this passes, download real gridded population data for one African region of your choice from WorldPop, identify the 10 to 30 highest-population grid cells as your settlements, construct a mobility network where the connection strength between two settlements decreases with distance and increases with the product of their populations, a standard gravity model of human mobility — look up the exact functional form, or propose and justify your own reasonable version — run the epidemic simulation across this real network, again averaging at least 20 stochastic runs, and compare the resulting epidemic curve to the single-node well-mixed version with the same total population and average parameters. Identify and describe at least one specific, visible difference, for example a longer flatter epidemic, multiple distinguishable peaks, or settlements reaching their peak at different times.',
  deliverableType:'Pygame agent-based epidemic simulation', deliverableWhy:'Spatial spread across a network is best shown as an animated map, in addition to the epidemic-curve comparison plot.',
  dataSource:'WorldPop (worldpop.org) gridded population data for a real region, used to place agents and settlements realistically; a plausible mobility network can be constructed from distance-based commuting assumptions if real mobility data is unavailable.',
  milestones:[
    'Extract real population distribution data for a region and place a manageable number of agents/settlements accordingly.',
    'Construct a contact/mobility network between settlements (e.g. gravity-model-based edge weights using distance and population).',
    'Implement stochastic SEIR-like state transitions for individual agents, with transmission probability depending on local contacts.',
    'Run the simulation and produce an aggregate epidemic curve; compare it against the Stage-3 well-mixed SEIR model using matched average parameters.',
    'Identify and explain at least one qualitative difference between the network model and the well-mixed model (e.g. multiple waves, spatial heterogeneity in timing).',
    'Scale up the Stage-3 blob-epidemic style to real geography: hundreds of colored blobs clustered into settlement zones on a pygame map of your chosen region, occasionally traveling live between zones along your mobility network, changing color as disease spreads from place to place in real time.'
  ],
  validation:['At the aggregate level, with the network fully connected and homogeneous, your agent-based model should approximately reproduce the well-mixed SEIR curve — a required "does it reduce to the simpler case" check.','Run multiple stochastic realizations and report variability (not a single run presented as definitive) — a first taste of why stochastic models need ensembles.','Run the live simulation and confirm, by watching it, that outbreaks visibly start in one settlement and spread to connected settlements with a visible time lag, not simultaneously everywhere at once.'],
  tools:['pygame','Python 3','NumPy','NetworkX','Matplotlib/animation'],
  extensions:['Add a simple intervention (closing edges above a distance threshold, i.e. local travel restriction) and quantify its effect on peak timing and size.','Scale the agent count up and profile where the simulation becomes slow, as a preview of the performance work in Stage 5.']
},
{
  id:'s4p4', title:'2D Truss Structural Solver (Finite Element Basics)', stage:4, domain:'Engineering', difficulty:'Advanced', time:'3 weeks',
  prereqs:['s2p1'],
  concepts:{math:['Linear algebra applied to structural stiffness matrices','Vector decomposition of forces'], physics:['Statics, stress and strain, Hooke\'s law'], programming:['Assembling a global system from many local element equations']},
  context:'This project is a small, honest introduction to the finite element method — the technique underlying nearly all real engineering simulation software — using a 2D truss, where the "elements" are simple enough that you can compute the expected answer by hand and directly check your assembled global system against it.',
  explain:'🌉 You are a structural engineer figuring out whether a bridge or roof frame made of connected beams, called a truss, can hold up under a load without collapsing. Your job is to represent the whole structure as a giant system of equations, using a real engineering technique called the finite element method, that a computer can solve to reveal exactly how much each joint moves and how much force is pushing or pulling through each individual beam. Before trusting your code on anything complicated, you must first solve a tiny 3-beam triangle completely by hand, so you have a known correct answer to check your program against.',
  firstWin:'Early win: a simple triangle bridge visibly bending under load on screen, with color showing you exactly which beam is under the most stress.',
  problem:'Implement a 2D truss solver: given a list of nodes, each with x,y coordinates and a flag for whether it is fixed or supported, a list of members, each connecting two nodes with a given axial stiffness EA/L, and a list of applied loads at free nodes, assemble the global stiffness matrix, solve K times u = F for the displacement vector u using your Stage-2 linear solver, and recover the axial force in each member. REQUIRED EXACT CHECK: solve, by hand, this exact 3-node truss before writing any code: node 1 at (0,0) fixed, node 2 at (4,0) fixed, node 3 at (2,3) free, with a downward load of 100 N applied at node 3, and both members, 1-3 and 2-3, having the same axial stiffness EA/L = 1000 N/m. Work out the free-node displacement and both member forces using basic statics, resolving the 100 N load into components along each member\'s direction, before running your code — this by-hand solution is your test oracle. Run your solver on the identical truss and confirm your code\'s displacement and member-force outputs match your hand calculation to within numerical precision; a mismatch of a few percent likely means a units or sign-convention difference between your hand work and your code, so track it down rather than accepting it. Once this exact case passes, extend to a larger truss of your choice, for example a 5-to-8-member roof or bridge truss you design or find a diagram of, solve it with your code, identify the single most heavily loaded member, and confirm your solution satisfies static equilibrium — the sum of all forces at every free node should be zero, or extremely close to it, which is an independent check separate from matching your hand calculation.',
  deliverableType:'Ursina 3D truss simulation', deliverableWhy:'The output is a solved structural configuration with a deformation plot — no persistent tool is required for the learning goal.',
  dataSource:'None required — validated against simple truss configurations with known hand-calculated solutions (e.g. a single-triangle truss).',
  milestones:[
    'Derive (by hand, on paper) the local stiffness matrix for a single 2D truss member and its rotation into global coordinates.',
    'Implement assembly of the global stiffness matrix from multiple members and apply boundary conditions (fixed supports).',
    'Solve for nodal displacements using your Stage-2 linear solver.',
    'Recover individual member forces and stresses from the displacement solution.',
    'Validate the entire pipeline against a simple truss (e.g. a 3-member triangular truss) whose solution you compute by hand first.',
    'Render the truss as connected line segments in a pygame window that visibly bend live into their deformed shape when the load is applied, color-coded red for compression and blue for tension on each member, exaggerating the displacement so the deformation is visible to the eye.'
  ],
  validation:['Solver output (displacements and member forces) must match your independent hand calculation for at least one simple truss, to numerical precision.','Check that the solution satisfies static equilibrium at each free node (sum of forces ≈ 0) as an independent consistency check beyond just matching the hand solution.','Confirm the on-screen bend direction of every joint matches the sign of its displacement in your solved displacement vector u, and that the color of each member matches whether your code computed it as tension or compression.'],
  tools:['ursina','Python 3','NumPy','Matplotlib (deformed-shape plotting)'],
  extensions:['Extend to a larger, more realistic truss (e.g. a simple bridge or roof truss) and identify the most highly stressed member.','Add a simple factor-of-safety check against a specified material yield stress.']
},
{
  id:'s4p5', title:'Detecting Real Precipitation Trend Shifts Over East Africa (Satellite Reanalysis)', stage:4, domain:'Climate', difficulty:'Advanced', time:'3–4 weeks',
  prereqs:['s4p1','s2p3'],
  concepts:{math:['Statistical hypothesis testing (trend significance)','Spatial data handling (gridded datasets)'], physics:['Regional climate variability and change'], programming:['Working with large gridded/satellite datasets (NetCDF)']},
  context:'This project moves from single-station data (Stages 0–3) to genuine gridded satellite/reanalysis climate data — the actual data format and scale computational climate scientists work with — and asks a real, currently debated regional question: are East African rainfall patterns actually shifting, and is the shift statistically distinguishable from natural variability?',
  explain:'🛰️ You are a climate scientist with access to satellite weather data covering the entire East African region, not just one weather station, but a whole grid of thousands of locations at once. Your job is to check, for every single spot on the map, whether rainfall has been trending up or down over the past 30-plus years, and, crucially, whether that trend is real or just random noise, using an actual statistical test, called the Mann-Kendall test, to tell the difference rather than trusting your eyes. You will then compare your homemade findings against what real published climate scientists have already discovered about the region, to see if your results agree.',
  firstWin:'Early win: a real map of East Africa, color-painted with decades of rainfall trends, with the uncertain spots greyed out so you only trust what is real.',
  problem:'Download a real gridded precipitation reanalysis or satellite dataset, for example CHIRPS or ERA5, covering East Africa for at least 30 years, in NetCDF format. For every grid cell independently, fit a linear trend to the time series of annual or seasonal total precipitation using your own regression code from Stage 1, and apply the Mann-Kendall trend test, a standard nonparametric test for monotonic trend available in the pymannkendall package or implementable from its published formula, to determine whether the trend at that cell is statistically significant at the 95% confidence level (p < 0.05) — use this exact threshold, stated explicitly, rather than an unstated "looks significant." Produce a map of trend magnitude in mm per decade where cells that fail the significance test are shown in gray or otherwise visually distinguished from cells that pass, so the reader cannot mistake an insignificant trend for a real one. Pick one specific, well-studied East African sub-region, for example the Horn of Africa "long rains" region, and compare your computed trend sign and rough magnitude there against at least one published regional climate assessment you can cite, for example an IPCC regional chapter or a peer-reviewed regional study — your numbers do not need to match exactly, but you must explicitly state whether your result agrees or disagrees with the published assessment, and if it disagrees, offer a specific reason such as a different time period, dataset, or significance threshold.',
  deliverableType:'Pygame live trend-map simulation', deliverableWhy:'The scientific content justifies a short technical report alongside the maps/plots, since the significance-testing methodology needs explicit written justification, not just a figure.',
  dataSource:'NASA Earthdata or the Copernicus Climate Data Store — a gridded precipitation reanalysis product (e.g. CHIRPS, ERA5) covering East Africa over multiple decades.',
  milestones:[
    'Download and correctly load a real gridded NetCDF precipitation dataset for the target region and period.',
    'Compute a linear trend (reusing your Stage-1/2 regression code) at every grid point.',
    'Apply a statistical significance test (e.g. Mann-Kendall trend test) at each grid point to determine which trends are distinguishable from noise at a stated confidence level.',
    'Produce a map showing trend magnitude, masked to show only statistically significant regions.',
    'Write a short technical report (1–2 pages) stating your findings, their limitations, and how they relate (or do not relate) to published regional climate assessments.',
    'Before producing the final map, build a live pygame visualization of the Mann-Kendall test itself for one single grid cell: plot that cell\'s yearly values as dots along a timeline, then animate every pairwise comparison between an earlier and a later year as a connecting line, drawn green if the later value is higher and red if lower, accumulating a running sign-count live, exactly as the statistic itself accumulates evidence, so the statistical test is something you watch being computed, not a library call you trust blindly. Only after this single-cell visualization is confirmed, run it for every grid cell to produce the final trend-significance map.'
  ],
  validation:['Compare your computed trends and significance for at least one well-studied sub-region against a published climate assessment to sanity-check magnitude and sign.','Explicitly report your chosen significance threshold and how many grid points pass it — do not present raw trend magnitude alone as evidence of "real" change.','Confirm the final running green-minus-red tally in your live single-cell visualization matches the Mann-Kendall S-statistic computed by your chosen library or formula for that same cell exactly, before trusting the library\'s result for the other thousands of cells.'],
  tools:['pygame','Python 3','xarray','NumPy','SciPy (stats)','Matplotlib/Cartopy'],
  extensions:['Repeat the analysis for temperature instead of precipitation and compare spatial trend patterns.','Investigate whether the trend is driven by a change in mean rainfall or a change in rainfall variability/extremes.']
},
{
  id:'s4p6', title:'2D Acoustic Wave Propagation and Simple Seismic Imaging', stage:4, domain:'Physics', difficulty:'Advanced', time:'3 weeks',
  prereqs:['s4p1'],
  concepts:{math:['The wave equation (2nd-order PDE)','Finite-difference time-domain methods'], physics:['Wave propagation, reflection, basic seismology'], programming:['2D field simulation with source/receiver setup']},
  context:'The wave equation behaves fundamentally differently from the diffusion equation (waves propagate rather than smooth out), and this project is where that distinction becomes concrete. A simple seismic-style reflection experiment — sending a pulse into a medium with a velocity contrast and recording the reflection — is a genuine, if simplified, version of how real subsurface imaging works.',
  explain:'🌊🔊 You are a seismologist trying to figure out what is hiding underground without digging a hole, by sending a sound pulse downward and listening carefully for its echo bouncing back off a hidden boundary between two different types of rock, exactly like a submarine\'s sonar or a doctor\'s ultrasound. Your job is to build a simulation of sound waves traveling through the ground, prove it travels at exactly the correct speed, and then use the timing of the echo you record at the surface to mathematically work out how deep the hidden boundary is, without ever actually seeing it.',
  firstWin:'Early win: a sound wave visibly rippling outward and bouncing off a hidden underground layer, animated in real time on your screen.',
  problem:'Implement a 2D finite-difference time-domain solver for the acoustic wave equation d2p/dt2 = c^2 times (d2p/dx2 + d2p/dy2), where c is the, possibly spatially varying, wave speed. REQUIRED EXACT CHECK (propagation speed): in a uniform medium with c=1500 m/s, a typical value for sound in water chosen to make the numbers easy to sanity-check, place a single point-source pulse in the center of your grid, measure how many grid cells the wavefront has traveled after a known elapsed time, and confirm the measured speed, distance traveled divided by time elapsed, matches 1500 m/s to within your grid\'s spatial resolution limits. REQUIRED EXACT CHECK (stability): this wave equation has its own CFL stability condition, c*dt/dx <= 1/sqrt(2) in 2D — look this up to confirm; it is related to, but not identical to, the heat equation\'s stability condition from the previous project. Deliberately violate it and confirm the simulation blows up; fix dt and confirm it does not. Once both checks pass, build a two-layer medium: c=1500 m/s in the top half of the domain, c=3000 m/s in the bottom half, with the interface at a depth you choose and record, for example exactly 200 m below the surface. Place a source and a line of receivers at the surface, record the arrival time of the reflection off the interface at each receiver, and use the known wave speed in the top layer together with basic travel-time geometry, the reflection path is a triangle from source to interface to receiver, to estimate the interface depth from your recorded arrival times. Your estimated depth must match the true depth you specified to within about 5%, since this is a synthetic test where you already know the right answer.',
  deliverableType:'Ursina 3D wavefield simulation', deliverableWhy:'Wave propagation is fundamentally about motion through space and time — animation is the appropriate medium for both understanding and validating the physics.',
  dataSource:'None required — a synthetic subsurface velocity model with a known interface depth is appropriate here, since the goal is validating the imaging method itself.',
  milestones:[
    'Implement the 2D finite-difference wave equation solver in a uniform medium and confirm the wave propagates at the theoretically correct speed.',
    'Verify the same stability-limit analysis approach from the heat-equation project applies here (waves have their own CFL condition).',
    'Introduce a horizontal velocity discontinuity (a simple two-layer medium) and observe reflection and transmission of the wave at the interface.',
    'Place a source and a line of receivers at the surface, record the reflected arrival time, and use the known wave speed to estimate the interface depth from the travel time.',
    'Compare your depth estimate against the depth you actually specified in the model, to validate the imaging method itself.',
    'Render the wave field as a live pygame view with rippling colored rings expanding outward from the source in real time, visibly reflecting off the underground layer, like watching sonar play out on screen rather than reading a final seismogram.'
  ],
  validation:['Measured wave propagation speed in the simulation must match the speed specified by the medium\'s parameters, to numerical precision.','Depth estimated from travel-time analysis must match the true (known, since synthetic) interface depth within a stated, explained tolerance.','Watch the live ripple and confirm the reflection visibly reaches the surface receivers at the same simulated time your recorded travel-time data reports.'],
  tools:['ursina','Python 3','NumPy','Matplotlib (animation)'],
  extensions:['Add a second, deeper interface and correctly identify both reflections in the recorded signal.','Introduce more realistic wave attenuation and observe its effect on reflection amplitude.']
},

// ---------------- STAGE 5 ----------------
{
  id:'s4p7', title:'Turing Patterns: Simulating How Stripes and Spots Emerge from Chemistry', stage:4, domain:'Biology', difficulty:'Advanced', time:'3 weeks',
  prereqs:['s4p1'],
  concepts:{math:['Coupled partial differential equations','Finite-difference discretization (reused and extended from the heat equation)'], physics:['Reaction-diffusion processes','Morphogenesis: how biological patterns form'], programming:['Extending a previously built PDE solver to a coupled system','Real-time pygame rendering of a 2D scalar field as color']},
  context:'In 1952, Alan Turing showed that two simple chemicals, diffusing and reacting together, could spontaneously generate the stripes, spots, and other patterns seen across biology, from zebra stripes to leopard spots, with no blueprint and no central plan. This project takes the heat-diffusion machinery you already built in Stage 4 and extends it to two coupled, reacting chemicals, producing one of the most visually striking and scientifically important results in this curriculum: unmistakable pattern formation, emerging live on your screen from nothing but a differential equation.',
  explain:'🐆 You already know how one thing diffuses, like heat spreading through a rod. Now imagine two invisible chemicals spreading through a 2D dish at the same time, except they also react with each other: one feeds the other, and the other eats the first one back. Alan Turing, the same person famous for cracking Enigma, proved that this simple setup, two diffusing, reacting chemicals, is enough to spontaneously paint stripes and spots, the same patterns you see on a zebra or a leopard, with absolutely no blueprint telling it where to put them.<br><br><b>Quest 1, The Two-Chemical Dish:</b> extend your Stage-4 diffusion solver so it tracks two chemical concentrations at once, reacting with each other at every grid cell, not just spreading.<br><br><b>Quest 2, Watch the Painting:</b> render the two chemicals live as color in a pygame window, starting from random static, and watch, completely unscripted, stable spots or stripes emerge and settle, live, from pure chemistry.<br><br><b>The Scientist\'s Discipline:</b> different reaction rates genuinely produce different pattern families, spots versus stripes versus maze-like patterns, and your job is to map out which settings produce which family, like a real parameter study, not just admire one pretty picture.',
  firstWin:'Early win: a screen of random colored static that, completely on its own with no further input from you, calms into clean, stable leopard-like spots or zebra-like stripes, live, in front of you.',
  problem:'Implement the Gray-Scott reaction-diffusion model: two chemical concentration fields U and V on the same 2D grid you used for the Stage-4 heat equation, each diffusing at its own rate (Du and Dv) and reacting according to dU/dt = Du*Laplacian(U) - U*V^2 + f*(1-U) and dV/dt = Dv*Laplacian(V) + U*V^2 - (f+k)*V, where f (the feed rate) and k (the kill rate) are parameters you control. REQUIRED EXACT CHECK (reusing validated machinery): confirm that with V fixed at 0 everywhere and the reaction and feed terms switched off, the U field alone reduces to your already-validated Stage-4 heat-equation solver — if it does not, your coupling code has a bug, not your diffusion code. REQUIRED PARAMETER STUDY: start from a grid that is mostly U=1, V=0, with a small seeded region of V in the center plus a little random noise, run the simulation live in a pygame window with U or V mapped to a color gradient, and find, by trying at least 5 different (f, k) pairs taken from published Gray-Scott parameter tables, at least 3 visibly distinct pattern families: spots, stripes, and one other, for example a maze-like or worm-like pattern. For each, record the exact (f, k) values you used.',
  deliverableType:'Pygame reaction-diffusion simulation', deliverableWhy:'Pattern formation is a claim about what spontaneously appears on screen; there is no honest way to deliver this result as a table of numbers, since the entire scientific content, that a differential equation with no blueprint produces organized structure, is itself a visual claim that must be watched to be verified.',
  dataSource:'None required — validated against your own already-confirmed Stage-4 heat-equation solver as the reduced case, and against published Gray-Scott (f, k) parameter tables for the pattern-family exploration.',
  milestones:[
    'Extend your Stage-4 finite-difference diffusion code to track two coupled fields U and V on the same grid, with periodic or reflective boundary conditions.',
    'Implement the Gray-Scott reaction terms and confirm that with V fixed at 0 and the reaction and feed terms disabled, U reduces exactly to your validated Stage-4 heat-equation behavior.',
    'Render U or V live as a color-mapped 2D field in a pygame window, updated every simulated time step, starting from a mostly uniform field with a small seeded noise region.',
    'Run the simulation live with published spot-forming (f, k) values and confirm stable spots emerge and stop changing after enough simulated time.',
    'Repeat with published stripe-forming and maze-forming (f, k) values and confirm each produces a visibly distinct pattern family live on screen.',
    'Build a simple pygame UI, number keys or on-screen buttons, to switch between at least 5 saved (f, k) presets live without restarting, so you can compare pattern families in one sitting.'
  ],
  validation:['With V fixed at 0 and the reaction disabled, your two-chemical solver output must match your independent Stage-4 heat-equation solver output, confirming the diffusion machinery was correctly reused rather than reimplemented with a hidden bug.','Each of your at least 3 explored pattern families must visibly stabilize, stop changing shape, within your simulated run time, and must visibly match the pattern family reported for the published parameter-table entry you used.','Running the same (f, k) pair twice with different random noise seeds must give the same pattern family in a different spatial arrangement, confirming that f and k, not luck, determine the family.'],
  tools:['pygame','NumPy','Python 3'],
  extensions:['Add a live brush tool: click to inject a new burst of V into a running, already stable pattern and watch it locally disrupt and re-heal.','Render a grid of thumbnail simulations side by side showing how the pattern family changes smoothly as f and k vary.']
},
{
  id:'s5p1', title:'Profiling and Accelerating an N-Body Gravitational Simulator', stage:5, domain:'HPC', difficulty:'Advanced', time:'3 weeks',
  prereqs:['s3p2','s1p5'],
  concepts:{math:['Computational complexity (O(N²) direct summation)'], physics:['Newtonian gravity with multiple interacting bodies'], programming:['Profiling tools (cProfile, line_profiler)','Just-in-time compilation (Numba) or moving hot loops to compiled code']},
  context:'This project takes the "no interactions" particle system from Stage 1 and finally lets particles interact gravitationally — an O(N²) problem that gets slow fast — and uses that as the real, motivated reason to learn profiling and acceleration, rather than optimizing prematurely for its own sake.',
  explain:'🏎️ You already built independent flying particles, but now you are going to let them all pull on each other with real gravity, everyone tugging on everyone else at once. The problem: checking every possible pair of particles gets brutally slow as you add more particles, a slowdown called O(N-squared) complexity. Your job is to first build the simple, slow version, then use a stopwatch-like tool, called profiling, to find exactly where the slowness is hiding, and then make it dramatically faster twice in a row: first using NumPy\'s array tricks, called vectorization, then using a just-in-time compiler, called Numba, that turns your Python into near-C-speed machine code, and prove with real timing numbers exactly how much faster each upgrade made it.',
  firstWin:'Early win: hundreds of particles swirling and clumping together under real gravity, animated, after you let them finally interact.',
  problem:'Extend your Stage-1 Particle class to full gravitational N-body interaction, where every particle attracts every other particle via Newton\'s law of gravitation, computed as a direct O(N^2) double loop over all pairs. REQUIRED EXACT CHECK: simulate a simple 2-body system you can check against your Stage-3 two-body result, for example the same circular-orbit setup from Stage 3 but now going through your general N-body force calculation instead of a hardcoded two-body formula, and confirm you get the same orbit and the same energy-conservation behavior — this confirms your N-body force calculation is correct before trusting it on larger N. Then, for N = 10, 50, 100, 200, 400 particles with random initial positions and velocities, time how long one full simulation of a fixed number of steps takes using: (a) a pure-Python nested-loop force calculation, (b) the same calculation vectorized with NumPy, no explicit Python loops over particle pairs, and (c) the vectorized version further accelerated with Numba\'s @jit decorator. Report all timings in a table and on a log-log plot of time versus N, and confirm all three implementations show the same O(N^2) scaling shape — doubling N should roughly quadruple the run time for all three, even though their absolute speeds differ enormously. State the actual measured speedup factor, pure-Python time divided by accelerated time, at N=400 — do not estimate it, measure it.',
  deliverableType:'Ursina 3D N-body simulation', deliverableWhy:'The deliverable is a documented performance investigation — timing and speedup plots communicate this better than an interactive tool.',
  dataSource:'None — synthetic N-body initial conditions are appropriate for a performance study.',
  milestones:[
    'Implement a straightforward pure-Python O(N²) gravitational force calculation and integrate it with RK4 or leapfrog.',
    'Profile the pure-Python version to identify where time is actually being spent (do not assume).',
    'Vectorize the force calculation using NumPy broadcasting and measure the speedup.',
    'Accelerate further using Numba (@jit) or a small C extension, and measure the speedup again.',
    'Plot wall-clock time vs. N (number of particles) for each implementation on the same axes, confirming the O(N²) scaling is visible in all three.',
    'Extend your Stage-1 pygame particle sandbox so every particle now pulls on every other one with real gravity, live, in the same running window — watch particles visibly swirl, pair up, and clump together over time instead of drifting independently.'
  ],
  validation:['All three implementations (pure Python, vectorized, JIT/compiled) must produce the same physical trajectories (energy conservation check reused from Stage 3) — speed changes should never change the physics.','Report actual measured speedup factors with real timing data, not estimates — profiling numbers are the primary deliverable here.','Run the live simulation at N=200 or more and confirm you can visibly point to at least one clumping or close-pass event happening on screen, consistent with real gravitational attraction.'],
  tools:['ursina','Python 3','NumPy','Numba (or Cython/C extension)','cProfile / line_profiler'],
  extensions:['Implement the Barnes-Hut tree algorithm to reduce complexity to O(N log N) and compare its speed and accuracy against direct summation.','Push N high enough to require the tree algorithm for a real-time-feasible simulation, and quantify the crossover point.']
},
{
  id:'s5p2', title:'Parallel Ensemble Simulation: Uncertainty in the SEIR Model at Scale', stage:5, domain:'HPC', difficulty:'Advanced', time:'2–3 weeks',
  prereqs:['s3p3','s5p1'],
  concepts:{math:['Ensemble statistics, parameter distributions'], physics:['None directly'], programming:['Parallel computing (multiprocessing, or MPI basics)','Embarrassingly parallel workload design']},
  context:'Running one simulation with one set of parameters answers "what happens if these numbers are exactly right." Running a large ensemble with parameters drawn from realistic uncertainty ranges answers the more honest question "what is the range of plausible outcomes" — and doing that for thousands of runs is the natural, motivated reason to learn parallel computing here rather than as an abstract exercise.',
  explain:'🎲 You already built one disease-outbreak simulation, but real life is uncertain: you do not actually know the exact true infection rate, only a plausible range for it. Your job is to run your simulation not once, but hundreds of times, each time with slightly different, randomly sampled input numbers pulled from realistic ranges, called an ensemble, to see the entire spread of possible futures instead of just one guess. Since running hundreds of simulations one after another is slow, you will also learn to spread the work across every processor core in your computer at once, called parallel computing, and measure, honestly, exactly how much faster that makes things.',
  firstWin:'Early win: a shaded band of hundreds of possible epidemic futures fanning out on one plot, instead of a single falsely confident line.',
  problem:'Wrap your Stage-3 SEIR model in a single function run_seir(beta, sigma, gamma, seed) that returns the peak infection count and the day it occurs, given one sampled parameter set. Define probability distributions for at least 3 parameters, for example beta drawn from a Normal distribution centered on your calibrated value with a standard deviation equal to 20% of that value; state your chosen distributions and their parameters explicitly, justified from your Stage-3 calibration uncertainty or cited literature values. REQUIRED CHECK: run exactly 500 simulations serially, a plain loop, one at a time, with parameters sampled from your distributions, time the total wall-clock time, and record the resulting distribution, not just the mean, of peak infection counts and peak days. Then run the identical 500 simulations using Python\'s multiprocessing.Pool across all available CPU cores, confirm the resulting distribution of outcomes is statistically indistinguishable from your serial run, since it is the same random experiment just computed faster, and report the actual measured speedup, serial time divided by parallel time. If you have C cores, report how close your speedup is to C, and explain in 1 to 2 sentences why it is very unlikely to be exactly C — overhead from starting worker processes, time spent combining results, and any part of the code that still runs serially all reduce real-world speedup below the theoretical ideal. Present your final ensemble result as a histogram of peak infection counts and a percentile band, for example shading the 10th-to-90th-percentile range, around the median epidemic curve over time, not as a single line.',
  deliverableType:'Pygame ensemble-forecast visualizer', deliverableWhy:'The output is an ensemble-uncertainty analysis, appropriately shown via distribution plots; a persistent tool is not needed.',
  dataSource:'Reuse the outbreak dataset from Stage 3 as the calibration anchor for central parameter values and their plausible uncertainty ranges.',
  milestones:[
    'Confirm your SEIR simulation runs correctly as a standalone function that can be called independently many times.',
    'Define plausible probability distributions (not just point estimates) for at least 3 key parameters, justified from the literature or your Stage-3 calibration uncertainty.',
    'Run a serial ensemble of at least 500 simulations sampling from those distributions, and time it.',
    'Parallelize the ensemble across available CPU cores using multiprocessing (or MPI, if you want the added complexity) and measure real speedup.',
    'Summarize ensemble results as distributions (histograms, percentile bands over time) of peak cases and epidemic duration, not as a single number.',
    'Build a live pygame view where each completed ensemble run draws one faint, semi-transparent epidemic curve onto the same window, so as your 500 parallel runs finish you watch a cloud of possible futures visibly build up and take shape on screen.'
  ],
  validation:['Measured parallel speedup must be reported honestly, including where it falls short of ideal linear speedup, with an explanation (overhead, core count, I/O).','The ensemble distribution\'s central tendency should be consistent with your single calibrated Stage-3 run — a sanity check that the ensemble is centered where you expect.','Confirm the live cloud of curves visibly narrows in spread as more runs complete, consistent with the ensemble converging toward a stable percentile band.'],
  tools:['pygame','Python 3','multiprocessing (or mpi4py)','NumPy','Matplotlib'],
  extensions:['Add a simple sensitivity ranking (which parameter\'s uncertainty contributes most to output uncertainty) as an early preview of Stage 6\'s formal sensitivity analysis.','Scale to a cloud/cluster environment if you have access to one, and report scaling behavior beyond a single machine.']
},
{
  id:'s5p3', title:'GPU-Accelerated 2D Wave/Heat Solver at High Resolution', stage:5, domain:'HPC', difficulty:'Advanced', time:'3 weeks',
  prereqs:['s4p1','s5p1'],
  concepts:{math:['Same PDE discretization as Stage 4, now at much higher resolution'], physics:['Same physical system as the Stage 4 PDE project it extends'], programming:['GPU programming basics (Numba CUDA or an equivalent)','Memory transfer overhead between CPU and GPU']},
  context:'This project takes a PDE solver you already validated at low resolution in Stage 4 and pushes it to a grid size where a CPU implementation becomes genuinely too slow to be useful, making GPU acceleration a real necessity rather than an academic exercise — and forces you to confront the real bottleneck in GPU computing, which is usually data movement, not raw compute.',
  explain:'🎮 You already built a working heat or wave simulation, but now you want to run it at a much bigger, more detailed size, and your regular computer processor, the CPU, is simply too slow for that. Your job is to move the core repeated calculation onto your graphics card, the GPU, the same kind of chip that renders video games, since GPUs can do thousands of simple calculations at once instead of one at a time. You must first prove the GPU version gives the exact same answer as your trusted CPU version at a small size, before trusting it at a bigger size, and then honestly measure at exactly what size the GPU actually starts winning the speed race, since moving data to and from the GPU also costs time.',
  firstWin:'Early win: the exact same animated simulation you already built, now running at a resolution so detailed it looks almost photographic.',
  problem:'Take your Stage-4 heat or wave equation solver and confirm it still passes its Stage-4 analytical validation check at a small grid size, for example 100 by 100, before doing anything else — this is your correctness baseline. Increase the grid resolution, for example to 1000 by 1000 or 2000 by 2000, whatever your hardware allows, and time how long a fixed number of steps takes on the CPU alone; confirm it becomes noticeably slow, at least several seconds per run, ideally more, establishing that GPU acceleration is solving a real problem here. Port only the core per-step field-update calculation, not the whole program, to run on the GPU using Numba\'s CUDA target or an equivalent accessible framework, while keeping setup, initial conditions, and result-checking code on the CPU. REQUIRED EXACT CHECK: run the identical problem at a small enough grid size to compare directly, for example 100 by 100, for the same number of steps, and confirm the GPU version\'s final field values match the CPU version\'s to within floating-point tolerance, a relative difference smaller than about 1e-5 — a fast wrong answer is not a valid deliverable here. Once correctness is confirmed, time both versions across a range of grid sizes, including the overhead of copying data to and from the GPU, not just the compute kernel itself, and identify, with actual measured numbers, the grid size at which the GPU version becomes faster than the CPU version — report this crossover point explicitly, since at small grid sizes the GPU is very often slower once transfer overhead is included, and that is an expected, reportable result, not a failure.',
  deliverableType:'Pygame high-resolution simulation', deliverableWhy:'The deliverable is a performance and correctness comparison, best communicated with timing and (for correctness) field-difference plots.',
  dataSource:'Reuse the validated setup from your Stage-4 PDE project as the correctness reference.',
  milestones:[
    'Confirm your CPU solver from Stage 4 is correct and re-time it at increasing grid resolutions until it becomes clearly impractical.',
    'Port the core field-update step to run on a GPU using Numba CUDA (or an equivalent accessible framework).',
    'Confirm the GPU version produces results matching the CPU version to numerical tolerance on a resolution small enough to compare directly.',
    'Measure speedup as a function of grid size, including the overhead of transferring data to/from the GPU.',
    'Identify and report the resolution at which GPU acceleration actually becomes worthwhile versus where transfer overhead dominates.',
    'Re-run your Stage-4 pygame heat or wave simulation at the largest grid resolution your GPU version can sustain live, and confirm the running window looks visibly smoother and more detailed than the original low-resolution version, not just faster.'
  ],
  validation:['GPU and CPU implementations must produce matching field values (within floating-point tolerance) on the same problem — correctness is checked before speed is even discussed.','Speedup must be reported as an honest function of problem size, explicitly including the crossover point where GPU stops being worth the overhead.','Run the low-resolution and high-resolution live versions side by side at the same frame rate and confirm a visible difference in smoothness and detail, not only in speed.'],
  tools:['pygame','Python 3','NumPy','Numba (CUDA target) or an accessible GPU framework'],
  extensions:['Optimize GPU memory access patterns (e.g. shared memory tiling) and measure the additional speedup.','Combine with the Stage-4 seismic imaging project to run a much higher-resolution imaging experiment.']
},
{
  id:'s5p4', title:'Data-Driven Surrogate Model for an Expensive Simulation', stage:5, domain:'ML for Science', difficulty:'Advanced', time:'3–4 weeks',
  prereqs:['s2p3','s4p1'],
  concepts:{math:['Basic supervised learning (regression), train/test splits','Bias-variance tradeoff'], physics:['Whichever physical system the surrogate approximates'], programming:['Using a machine learning library (scikit-learn) correctly and validating it rigorously']},
  context:'This is the one project in the curriculum where machine learning is the tool, not the subject — used the way computational scientists actually use it: training a cheap, fast model to approximate the input-output behavior of an expensive physics simulation, so you can explore parameter space far more cheaply than by re-running the full solver every time.',
  explain:'🤖 You already built an expensive simulation that takes real time to run every single time you change its inputs. Your job is to train a much faster stand-in, a machine-learning model, called a surrogate, that learns to predict what your expensive simulation would say, without actually running it, by studying a few hundred examples of real simulation runs. The critical rule: you must always test your fast stand-in on examples it has never seen before, called a held-out test set, because a model that just memorizes its training examples instead of truly learning the pattern, called overfitting, will look great on paper and fail in reality.',
  firstWin:'Early win: a scatter plot where your fast fake model\'s guesses line up almost perfectly against your slow real simulation\'s true answers.',
  problem:'Choose one expensive simulation you have already built and validated, for example your Stage-4 heat-equation solver, where the expensive output might be the temperature at a specific point after a fixed simulated time, as a function of input parameters like diffusivity and initial hot-spot size. Generate a training dataset by running the real simulation at, at minimum, 200 different systematically sampled combinations of 2 or 3 input parameters, using either a grid or a Latin hypercube sample, state which and why, recording the resulting output for each. Split this dataset into a training set, 80% of points, and a held-out test set, the remaining 20%, which no model is allowed to see during training. Train two different regression models on the training set only, one simple model such as linear or low-degree polynomial regression, and one more flexible model such as a random forest or small neural network, and evaluate both on the held-out test set using root-mean-squared error in the same units as the original simulation output. REQUIRED CHECK: report both models\' training RMSE and held-out RMSE side by side; if the flexible model\'s held-out RMSE is much worse than its training RMSE while the simple model\'s two numbers stay close together, that is overfitting, and you must say so explicitly. Pick whichever model has the better held-out RMSE, then directly run your real simulation at 5 new parameter combinations the surrogate has never seen, compare the surrogate\'s predictions to the real simulation\'s actual output at those exact 5 points, and report the agreement — this final check, against freshly run ground truth, is the real test of whether the surrogate works, not the held-out RMSE alone.',
  deliverableType:'Pygame surrogate-comparison visualizer', deliverableWhy:'The scientific validity of a surrogate model depends entirely on documented validation methodology, which a short technical report communicates better than plots alone.',
  dataSource:'Self-generated, by running your own earlier simulation across a systematically sampled parameter space (this is a case where synthetic training data is the scientifically correct choice, since the "ground truth" is your own validated solver).',
  milestones:[
    'Choose the target simulation and its key scalar or low-dimensional output to predict.',
    'Design a parameter sampling strategy (e.g. Latin hypercube or grid) and generate a training dataset by running the real simulation at each sampled point.',
    'Train at least two different regression models (e.g. linear/polynomial regression and a random forest or small neural network) on the dataset.',
    'Evaluate both on a held-out test set the models never saw during training, using an appropriate error metric.',
    'Identify and characterize regions of parameter space where the surrogate performs poorly, and explain why (e.g. sparse training data, nonlinear regime).',
    'Build a live pygame view showing the real simulation\'s output and the surrogate\'s predicted output side by side, redrawn after each new batch of training points, so you watch the surrogate\'s curve or surface visibly tighten toward the real one as training data grows.'
  ],
  validation:['Held-out test error (never training error) is the required accuracy metric — report it explicitly with the metric name and units.','Directly compare at least 5 surrogate predictions against freshly run real simulations at new, unseen parameter points as a final honesty check.','Confirm the live visible gap between the two curves or surfaces shrinks across the training batches you add, matching your separately measured held-out RMSE improving.'],
  tools:['pygame','Python 3','scikit-learn','NumPy','Matplotlib'],
  extensions:['Use the surrogate to run a much larger sensitivity/optimization study than would be feasible with the real simulation, then validate the "optimal" point found by re-running the real simulation there.','Add uncertainty estimates to the surrogate\'s predictions (e.g. via a Gaussian process) rather than only point predictions.']
},
{
  id:'s5p5', title:'Crop Yield Prediction from Climate and Agricultural Data', stage:5, domain:'Agriculture', difficulty:'Advanced', time:'3–4 weeks',
  prereqs:['s4p5','s5p4'],
  concepts:{math:['Multivariate regression','Feature engineering, multicollinearity'], physics:['Basic crop-climate relationships (growing degree days, water stress)'], programming:['Merging multiple real datasets with different formats and resolutions']},
  context:'This is a genuinely high-stakes real-world African computational science problem: predicting crop yield from climate variables is directly relevant to food-security planning, and doing it honestly (with real, messy, multi-source data) is a very different and harder skill than fitting a clean synthetic dataset.',
  explain:'🌾 You are a food-security scientist trying to predict how much of a crop a country will harvest this year, based on the weather, since droughts and heat waves can devastate a harvest. Your job is to turn raw daily weather numbers into meaningful farming clues, called features, like counting how many warm growing days there were, or how much rain fell during the critical growing months, and then use those clues to predict yield. The tricky part: with only a couple dozen years of real data available, you must test your prediction method very carefully, using a technique called leave-one-year-out cross-validation, to make sure it is not secretly cheating by peeking at nearby years.',
  firstWin:'Early win: a chart of real harvest numbers with your model\'s predictions dotted right alongside them, year by year.',
  problem:'Obtain real historical crop-yield data, tonnes per hectare or the units your source provides, for one crop and one country from FAO or World Bank agricultural statistics, and real climate data, temperature, precipitation, solar radiation, for the same country and matching years from NASA POWER. From the raw daily or monthly climate data, engineer at least 3 named agronomic features per year — for example, growing degree days, the sum over the growing season of max(0, average_daily_temp minus a base temperature you choose and state, commonly 10 degrees C for many crops); total rainfall during a specific growth-stage window you define, for example months 3 to 5 of the growing season; and the number of days above a heat-stress threshold you choose and state, for example days with max temperature above 35 degrees C. Before fitting any model, compute the pairwise correlation between your engineered features — if two features have a correlation above about 0.9, that is multicollinearity, and you must either drop one or combine them, and say so explicitly. Fit a multivariate linear regression predicting yield from your engineered features, but validate it using leave-one-year-out cross-validation specifically, training on all years except one, predicting that one held-out year, repeating for every year, then looking at the errors across all held-out years together — a random train/test split is explicitly the wrong method here and must not be used, since it lets information from a nearby year leak into the test set through year-to-year correlation. REQUIRED CHECK: compute a trivial baseline, predicting every year\'s yield as simply the historical mean yield across all years, and report its leave-one-year-out error using the same procedure. Your regression model\'s leave-one-year-out RMSE must be reported side by side with this baseline\'s RMSE, and you must state explicitly whether your model actually beats the trivial baseline; if it does not, that is a real and reportable finding given how few years of data are typically available, not a failure of your work.',
  deliverableType:'Pygame crop-yield visualizer', deliverableWhy:'Combining multiple real datasets and justifying feature choices is methodology-heavy work that benefits from written documentation alongside the figures.',
  dataSource:'NASA POWER (climate variables) combined with World Bank Open Data or FAO agricultural statistics (crop yield by country/year).',
  milestones:[
    'Obtain and align historical crop-yield data with matching climate data for the same country/region and years.',
    'Engineer at least 3 agronomically meaningful features from the raw climate data (not just raw monthly averages).',
    'Check for multicollinearity among features and address it appropriately (e.g. dropping or combining correlated features).',
    'Train a regression model and validate it using a method appropriate for short time series (e.g. leave-one-year-out cross-validation, not a random split).',
    'Explicitly discuss the limitations of predicting yield with the number of years of historical data actually available.',
    'Render a small field of crop-blobs in a pygame window that grow taller or wilt live, year by year, based on real versus predicted yield side by side, so you watch your prediction visibly succeed or fail crop by crop instead of only reading an RMSE number.'
  ],
  validation:['Use leave-one-year-out (or similarly time-aware) cross-validation, not a random train/test split — random splitting on short correlated time series systematically overestimates skill, and this must be avoided and explained.','Report a baseline comparison (e.g. predicting the historical mean yield every year) and show your model\'s error is genuinely better than that trivial baseline.','Confirm the live crop-blob heights for at least 3 specific years match your underlying leave-one-year-out real and predicted yield values for those years.'],
  tools:['pygame','Python 3','pandas','scikit-learn','Matplotlib'],
  extensions:['Extend to multiple crops or multiple regions and compare which is more predictable from climate alone.','Investigate which single engineered feature contributes most to predictive skill.']
},
{
  id:'s5p6', title:'High-Resolution Flood Inundation Model for a Real River Basin', stage:5, domain:'Environmental Science', difficulty:'Advanced', time:'4 weeks',
  prereqs:['s4p2','s5p3'],
  concepts:{math:['Shallow-water-type flow approximations (simplified)','Working with digital elevation data'], physics:['Surface water flow, flood dynamics'], programming:['GIS-adjacent data handling (raster elevation data)']},
  context:'This project pulls together PDE numerical methods, real elevation data, and performance considerations from earlier in Stage 4 and 5 into a single applied problem with immediate real-world relevance in flood-prone African river basins: given a rainfall/discharge event, where does the water actually go, and which areas are at highest risk.',
  explain:'🌊🗺️ You are a disaster-response planner trying to predict which parts of a town will flood when a river rises, using real satellite elevation data of the land\'s shape, called a digital elevation model. Your job is to build a simulation where water realistically flows downhill and pools in low-lying areas, exactly the way real floodwater behaves, and prove it passes basic common-sense physics tests, like never flowing uphill, on a tiny toy valley before trusting it on real terrain. If you can find a record of a real flood that actually happened in your chosen area, you get to grade your simulation against real history.',
  firstWin:'Early win: real terrain flooding, frame by frame, as water visibly creeps across a map and pools into the lowest points of your town.',
  problem:'Obtain a real digital elevation model (DEM) for one flood-prone river basin of your choice, SRTM data via NASA Earthdata is a good source, and check it for missing or void pixels, common in SRTM data especially over water, before using it — fill small gaps by simple interpolation from neighboring valid pixels, and state how many pixels you filled. REQUIRED EXACT CHECK, before using the real DEM: build a tiny synthetic v-shaped valley elevation grid by hand, for example a 10 by 10 grid where elevation decreases linearly toward a central low line, release a large volume of water at the highest point, run your inundation model, and confirm two physically necessary properties: (a) water only ever flows from higher to lower elevation cells, never uphill, and (b) water accumulates and pools specifically along the lowest line of the valley, not scattered randomly or stuck on a local high point. If either property fails on this simple synthetic case, your model has a bug that must be fixed before touching real terrain, since real terrain will hide the same bug in more confusing ways. Once both properties are confirmed, apply your model to the real DEM with a specific discharge, flood water volume, you choose and state, and produce a time-evolving map of flooded extent. If you can find any real documented flood event and its reported extent for your chosen basin, compare your simulated extent against it using an intersection-over-union score, area where both agree divided by area where either says flooded, and report that number; if no such real validation data is available, say so explicitly and rely on the two physical-plausibility checks above as your validation instead — do not claim a validated result without either real comparison data or a clearly stated reason why none exists.',
  deliverableType:'Ursina 3D flood simulation', deliverableWhy:'Flood extent evolving across real terrain is inherently spatial and time-varying, and a map-based animation communicates both the physics and the real-world stakes.',
  dataSource:'A real digital elevation model (e.g. from NASA Earthdata / SRTM data) for a chosen basin, plus, where available, a documented real flood event and its reported extent for validation.',
  milestones:[
    'Obtain and correctly load a real DEM for the chosen basin, checking for and handling any missing/void data.',
    'Implement a simplified flow/inundation model appropriate to your numerical toolkit (e.g. a diffusive approximation building directly on your Stage-4 solver).',
    'Simulate a specified discharge event and produce a time-evolving flood-extent map.',
    'If any real documented flood-extent data exists for the chosen event/basin, compare your simulated extent against it and report the agreement/disagreement explicitly.',
    'If no real validation data is available, clearly state this limitation and instead validate the model\'s physical plausibility against basic hydrological reasoning (e.g. water should flow downhill and pool in known low-lying areas).',
    'Render the real terrain as a live pygame heightmap with blue water that visibly creeps and pools across it frame by frame as the flood simulation runs, so you watch the town flood in real time rather than viewing only a final extent map.'
  ],
  validation:['Water in the simulation must always flow toward lower elevation and never accumulate on a local high point — a basic physical-plausibility check that catches most implementation bugs.','Where real flood-extent data exists, report a quantitative overlap metric (e.g. intersection-over-union) between simulated and observed extent, not just a visual comparison.','Watch the live flood and confirm water only ever visibly spreads from higher to lower terrain on screen, never appears to climb uphill, consistent with your synthetic-valley validation check.'],
  tools:['ursina','Python 3','NumPy','rasterio or GDAL (for DEM handling)','Matplotlib/animation'],
  extensions:['Compare results across two different discharge scenarios to identify the most flood-vulnerable areas at higher return-period events.','Use your Stage-5 GPU work to run the model at a much higher spatial resolution than a CPU-only version would allow.']
},

// ---------------- STAGE 6 ----------------
{
  id:'s6p1', title:'Reproduce a Published Computational Result', stage:6, domain:'Research', difficulty:'Research', time:'4–6 weeks',
  prereqs:['s5p4'],
  concepts:{math:['Whatever the chosen paper requires — determined by your selection'], physics:['Whatever the chosen paper requires'], programming:['Reading and implementing a method from a paper\'s description alone, without existing code to copy']},
  context:'Reproducibility is the actual currency of computational science, and most students never practice the specific, humbling skill of implementing something from a paper\'s methods section rather than from a tutorial. This project is deliberately open in subject and rigid in process: choose any paper with a computational result you find genuinely interesting, and reproduce it independently.',
  explain:'📄🔬 You are stepping into the shoes of a real scientist doing something surprisingly rare and important: taking someone else\'s published scientific paper and trying to recreate their exact result yourself, using only their written description, not their original code. Your job is to read the paper\'s methods section carefully, explain it in your own words before writing a single line of code, build it yourself, and see how closely your result matches theirs. If it does not match, real detective work begins: was it an ambiguous instruction in the paper, a different default setting in some software library, or a bug in your own code? Simply shrugging and saying it did not work is not allowed here.',
  firstWin:'Early win: your own version of a real published scientist\'s chart or number, sitting side-by-side with the original for the first time.',
  problem:'Pick one published, peer-reviewed paper whose central result comes from a simulation, a dynamical model, or an algorithm you can literally run and watch, not a purely tabular statistical result, ideally in a field you have touched in this curriculum, and ideally one where the underlying data or initial conditions are openly available — check this before committing to the paper; if the data is unavailable and you cannot substitute a reasonable equivalent, pick a different paper. Read the paper\'s methods section and write, in your own words and before writing any code, a plain-language description of exactly what the authors did, step by step, as if explaining it to someone who has not read the paper. Implement that method yourself, using only your own understanding of the methods section, not the authors\' published code if any exists — you may look at their code only afterward, to debug a genuine disagreement, and you must say in your report if and when you did this. Attempt to reproduce one specific, named result from the paper, a specific number or a specific figure, using your own implementation. Compare your result to the paper\'s quantitatively — for a number, report the percent difference; for a figure, describe specifically how your version differs, a different peak value, a different shape, a shifted timing, not just that it looks similar. If your result does not match closely, you must investigate and report a specific, concrete reason, an ambiguous detail in the methods, a different software library\'s default behavior, a bug in your own code, or a parameter the paper did not fully specify — "I could not get it to match and do not know why" is not an acceptable ending for this project; genuinely digging into a mismatch is the actual skill being tested.',
  deliverableType:'Pygame live reproduction + report', deliverableWhy:'The point of this project is scientific communication and honest methodology documentation as much as the code itself — a written report is the appropriate primary deliverable, with code as a supporting artifact.',
  dataSource:'Whatever dataset the chosen paper uses, if openly available; otherwise a documented, justified substitute.',
  milestones:[
    'Select a paper with a clear, reproducible computational result and get it informally reviewed (e.g. by a mentor, or by checking it against this curriculum\'s quality bar yourself) before committing significant time to it.',
    'Read the paper thoroughly and write out, in your own words, the method as you understand it before writing any code.',
    'Implement the method independently.',
    'Attempt to reproduce the paper\'s key figure or result.',
    'Compare your result against the original, and if they differ, systematically investigate why (different software versions, ambiguous methodology, a bug in your code, or a genuine issue in the original) before concluding.',
    'Since you chose a paper whose central result is a simulation, dynamical model, or algorithm, build a live pygame rendering of your reproduction running in real time — a direct, natural rendering of that process, not an animation bolted onto a table of numbers — and place it directly alongside the original paper\'s published figure for a real side-by-side comparison.'
  ],
  validation:['Your reproduction should be compared quantitatively (not just visually) against the original result, with an explicit statement of how close it is.','If your result does not match, the report must include a genuine investigation of why, not just a note that it did not work — this investigation is the actual point of the project.','Confirm the final on-screen state of your live reproduction visually matches the shape of the original paper\'s figure, with any remaining gap explicitly called out in your written report.'],
  tools:['pygame','Whatever the paper requires — chosen and justified by you'],
  extensions:['Extend the paper\'s method to a new dataset or a slightly different parameter regime the authors did not test.','Identify one specific limitation of the original paper\'s method and propose (and if feasible, test) an improvement.']
},
{
  id:'s6p2', title:'Uncertainty Quantification and Sensitivity Analysis of Your Own Model', stage:6, domain:'Research', difficulty:'Research', time:'3–4 weeks',
  prereqs:['s5p2'],
  concepts:{math:['Variance-based sensitivity analysis (Sobol indices, or a simpler correlation-based proxy)','Probability distributions as model inputs'], physics:['Whichever model you choose to analyze'], programming:['Structuring a model to be run systematically under sampled parameter sets (extends Stage-5 ensemble work)']},
  context:'Stage 5 built an ensemble to see the range of outcomes; this project asks the sharper, more rigorous question — of all the uncertain inputs, which ones actually drive the uncertainty in the output, and by how much. This is the specific skill that separates "I ran a simulation" from "I know how much to trust this simulation and why."',
  explain:'🎚️ You already built and calibrated a real scientific model, but every model has uncertain dials, called parameters, that you are not 100% sure about. Your job is to figure out, scientifically, which single dial matters most, meaning which one, if it were slightly different, would change your model\'s final answer the most, called sensitivity analysis. You will use a real statistical method, Sobol indices, or a lighter version called the Morris method, to rank your uncertain dials by importance, and then make a specific, useful recommendation: which piece of real-world data would be most worth collecting to make your model more trustworthy.',
  firstWin:'Early win: a simple bar chart instantly revealing which single dial, out of several, actually controls your model\'s fate the most.',
  problem:'Choose one model you have already built and calibrated in an earlier stage, for example the SEIR model from Stage 3 or the solar-battery sizing model from Stage 3. Identify its 3 to 5 most uncertain input parameters, and for each, define an explicit probability distribution describing your uncertainty about its true value, for example "transmission rate beta follows a Uniform distribution between 0.4 and 0.6, based on the 95% confidence interval from my Stage-3 calibration" — every distribution must be justified with a stated source, not invented arbitrarily. Implement a variance-based sensitivity analysis using either the SALib library\'s Sobol method or, if your model runs too slowly for the thousands of runs Sobol analysis typically needs, a simpler screening method, the Morris method, also in SALib, needs far fewer runs. REQUIRED CHECK: if using Sobol indices, confirm your first-order indices are each between 0 and 1 and sum to no more than 1 across all parameters — this is a mathematical property of the method; if your numbers violate it, you have a bug in your sampling or index calculation, not a surprising scientific result. Report which single input parameter has the largest first-order sensitivity index, and cross-check that this makes physical or epidemiological sense against what you already know about the model, for example in most SEIR parameterizations the transmission rate beta typically dominates the sensitivity of peak infection count; if your top-ranked parameter is something you would not have expected, investigate further before reporting it as your finding. Conclude with a specific, actionable recommendation: which one input, if you could reduce its uncertainty through better data collection or measurement, would most improve the reliability of your model\'s key output, and say why, in terms of the sensitivity index you actually measured.',
  deliverableType:'Pygame live sensitivity-dial simulation + report', deliverableWhy:'A sensitivity analysis is a methodological result whose validity depends on documented assumptions and sampling design — this belongs in a written report, not just a chart.',
  dataSource:'Reuse the data/calibration already established for the chosen earlier project.',
  milestones:[
    'Select the model and the specific output you will analyze, and justify why its uncertainty matters (link back to the real-world decision the model informs).',
    'Define input probability distributions for each uncertain parameter, justified from prior calibration, literature, or explicit expert judgement you state clearly.',
    'Implement a sensitivity analysis method (Sobol indices via a library, or a simpler Morris/correlation-based screening method if full Sobol analysis is too costly for your model\'s runtime).',
    'Run the required number of model evaluations (this may require applying your Stage-5 parallelization) and compute sensitivity indices.',
    'Report which inputs matter most and explicitly recommend where future data-collection effort should be prioritized to reduce output uncertainty.',
    'Build a live pygame instrument panel with one slider per uncertain input parameter, all visible at once, each wired directly to your model; as you drag any single slider, the model re-runs live and a needle showing the key output swings in response immediately, so sensitivity becomes something you discover by play, watching which sliders barely move the needle and which ones swing it wildly, rather than only reading it off a bar chart after the fact.'
  ],
  validation:['Confirm the sensitivity indices are numerically consistent (e.g. first-order Sobol indices should sum to no more than the total variance) as an internal correctness check on your implementation or library usage.','Cross-check your top-ranked sensitive parameter against domain intuition or the literature — if the result is surprising, investigate rather than simply report it.','Confirm that dragging your top Sobol-ranked parameter\'s slider across its full range visibly swings the output needle further than dragging your lowest-ranked parameter\'s slider across its full range, matching the ranking your Sobol indices already reported.'],
  tools:['pygame','Python 3','SALib (sensitivity analysis library) or a custom implementation','NumPy'],
  extensions:['Compare two different sensitivity-analysis methods on the same model and discuss where they agree or disagree.','Use the sensitivity result to justify simplifying the model (fixing low-sensitivity parameters) and check that the simplified model still behaves acceptably.']
},
{
  id:'s6p3', title:'Independent Research Proposal and Pilot Study', stage:6, domain:'Research', difficulty:'Research', time:'6–8 weeks',
  prereqs:['s6p1','s6p2'],
  concepts:{math:['Whatever the chosen problem requires'], physics:['Whatever the chosen problem requires'], programming:['Whatever the chosen problem requires']},
  context:'This is the last project before the capstone, and it is deliberately structured like real research: you pick a genuinely open question (not one with a known "right" answer already published), write a short proposal the way you would for a supervisor or an application committee, and then actually execute a scaled-down pilot version of it — closing the loop from question to evidence.',
  explain:'🔭 This is your first taste of being an actual independent researcher instead of following someone else\'s assignment. Your job is to invent your own specific, narrow, answerable scientific question, one nobody has necessarily answered exactly the way you plan to, write a short proposal explaining exactly what you plan to do and how you will know if it worked, and then actually go do a smaller pilot version of it for real, with real data. You will finish by writing an honest report that says not just what you found, but whether your small pilot suggests the bigger question is even worth chasing further.',
  firstWin:'Early win: your very first real, if small, scientific finding, backed by actual data you pulled yourself, instead of a textbook answer.',
  problem:'Pick a specific, narrow, answerable computational-science question that you have not already answered somewhere else in this curriculum, and, in keeping with this curriculum\'s emphasis on watching your computation happen rather than only reading its output, whose evidence can be rendered as a live simulation, process, or progressive reveal rather than a single static number — not a broad topic like "climate change in Africa," but a specific question like "has the length of the main rainy season in [a specific region] measurably shortened over the last 20 years, using [a specific dataset]?" Write a research proposal of 2 to 3 pages containing exactly these sections: Background, what is already known, with at least 2 cited sources; Question, one or two sentences, specific enough that a yes/no or a specific number would answer it; Proposed Method, what data and computational approach you will use, reading like a condensed version of the schema used throughout this curriculum: data source, method, validation plan; Expected Challenges, at least 2 specific things you expect to be hard, and why; and a Validation Plan, exactly how you will know if your pilot result is trustworthy, decided before you have the result. Only after finishing the written proposal, execute a genuine pilot version of the study, smaller in scope than the full question would require, fewer years of data, a coarser method, a single region instead of many, you choose what to scale down and say so explicitly, but executed for real, with real data, not a simulated placeholder. Validate your pilot result using whatever method fits your specific question, comparison to an analytical expectation, comparison to independently published numbers, or a cross-check using a second, different method on the same data — "I could not validate this" is only acceptable if you explain in writing, specifically, why no validation was possible for this particular question. Write a final report containing your original proposal unchanged, a section describing what changed during execution and why, your pilot results with their validation, and an explicit final recommendation: based on what the pilot showed, is the full question worth pursuing further, and if so, what would the next concrete step be?',
  deliverableType:'Pygame live result-reveal + report', deliverableWhy:'This project is explicitly about practicing the research process end-to-end — the report, including the proposal, is the deliverable that demonstrates that process, not just the code.',
  dataSource:'Chosen and justified by you, appropriate to the question.',
  milestones:[
    'Formulate a specific, answerable research question — not just a broad topic — and write the proposal before writing any code.',
    'Identify what data or computational method the question requires and confirm it is genuinely feasible in the pilot timeframe.',
    'Execute the pilot study, keeping careful notes of decisions made and why, including changes to your original plan.',
    'Analyze the pilot results and state clearly what they do and do not tell you about the full question.',
    'Write a final report including the original proposal, what changed, the results, and a clear recommendation on whether/how to pursue the full question (this recommendation is itself a required deliverable, not optional framing).',
    'Render your pilot\'s evidence as a live pygame build-up along its natural ordering, time, region, or parameter sweep, so a viewer watches the result accumulate frame by frame in a running window rather than reading a single static table.'
  ],
  validation:['The pilot\'s results must be validated by whatever means are appropriate to the chosen question (analytical check, real data comparison, cross-method comparison) — "no validation was possible" is only acceptable if explicitly justified, not assumed.','The report must honestly distinguish what the pilot demonstrated from what it merely suggests — a common and important research-writing skill this project is specifically testing.','Confirm the final frame of your live reveal matches your reported headline result exactly, and that every intermediate frame shown is a genuine partial result, not a placeholder.'],
  tools:['pygame','Whatever the question requires — chosen and justified by you'],
  extensions:['Present the pilot study as a short talk (even to an audience of one) and treat the questions you get as informal peer review.','Use this pilot directly as a testbed for capstone direction — see the Capstone tab.']
},
];

const CAPSTONE = {
  primary:{
    title:'A Coupled Climate–Agriculture Decision-Support Tool for Smallholder Farming in East Africa',
    domain:'Climate · Agriculture · Decision Support',
    integrates:['PDE/gridded climate data handling (Stage 4)','Crop-yield modeling and real multi-source data fusion (Stage 5)','Uncertainty quantification (Stage 6)','Optimization under uncertainty (Stage 3)'],
    description:'Building directly on the crop-yield model, precipitation-trend analysis, and sensitivity-analysis skills developed across Stages 4–6, this capstone combines a real gridded seasonal climate forecast (or hindcast, if forecast data is inaccessible) with a calibrated crop-yield model to produce region-specific planting-date or crop-choice recommendations for smallholder farmers, with honestly quantified uncertainty attached to every recommendation rather than a single confident number.',
    dataSource:'NASA POWER, Copernicus Climate Data Store (seasonal forecasts/reanalysis), World Bank/FAO crop-yield statistics, and, ideally, one real regional agricultural stakeholder or dataset for grounding.',
    deliverableType:'Technical report + a small decision-support script/dashboard',
    validation:'Backtest the recommendation system against historical years: would following its advice, computed only from data available before each historical season, have actually improved outcomes compared to a naive baseline (e.g. always planting on the traditional calendar date)? Report this honestly, including years where the recommendation would have been wrong.'
  },
  alternatives:[
    {title:'Computational Outbreak-Forecasting Platform', domain:'Epidemiology · HPC',
     description:'Extend the Stage 3–5 SEIR and agent-based epidemic work into a full forecasting system for a real, currently or recently active outbreak using HDX data: a calibrated, uncertainty-quantified model producing probabilistic short-term forecasts, backtested against real historical outbreak trajectories the way epidemiological forecasting challenges (e.g. real CDC/WHO forecasting hubs) actually evaluate models.'},
    {title:'HPC-Accelerated Regional Climate Downscaling and Renewable-Siting Tool', domain:'Climate · HPC · Energy',
     description:'Combine the GPU-accelerated PDE work (Stage 5) with real gridded climate and solar-irradiance data to statistically or dynamically downscale coarse regional climate data to identify optimal solar/wind siting locations across a country, validated against any existing real installed-capacity siting decisions as a sanity check.'},
    {title:'A Pure Computational-Physics Research Project', domain:'Physics · Numerical Methods',
     description:'For a stronger pull toward physics over environmental/social applications: a substantial physics simulation (e.g. a 2D/3D N-body astrophysical simulation with a tree code, or a computational materials/statistical-mechanics project such as an Ising-model Monte Carlo study of phase transitions) built to publication-quality validation standards, reproducing a known result before extending it in a genuinely new direction.'},
  ]
};

const GUIDES = {};
/* =========================================================
   GUIDES  (helper: S = one step)
   S(title, why, doList, runCommands, seeText, hintText, codeToWrite)
   inline markup:  **bold**   {{code}}
   ========================================================= */
const S = (t, why, d, run, see, hint, code) => ({t, why, do:d||[], run:run||null, see:see||null, hint:hint||null, code:code||null});
const WIN = (title) => S('Open an empty pygame window', 'Before any physics, prove that a window opens and closes.', [
  'Open **src/main.py**.',
  'Copy the **pygame window template** from the Setup page (section "Template: a pygame window") and paste it in.',
  `Change the caption text to **${title}**.`,
  'Save the file.'], 'python -m src.main', 'A dark window opens with a green dot and the words **It works!**. Closing it ends the program with no red text.', 'If nothing happens, check that your terminal line starts with **(.venv)**.');

GUIDES.s0p1 = {
 slug:'uncertainty-sandbox', pip:['pygame'],
 files:[['src/__init__.py','empty file; lets Python import from src'],['src/units.py','unit tables, family_of(), convert()'],['src/uncertainty.py','rounding, combine(), format_measurement()'],['src/main.py','the pygame window with draggable blobs'],['tests/test_units.py','checks for units.py'],['tests/test_uncertainty.py','checks for uncertainty.py']],
 words:[['Measurement','a number plus how unsure you are, written like 12.4 ± 0.2 m/s'],['Uncertainty','the part after the ± sign: how far the true value could be from your number'],['Unit family','units that convert into each other, like length: m, km, ft'],['Propagation','working out the uncertainty of an answer from the uncertainties of what went into it'],['Significant figure','a digit worth writing down'],['Affine conversion','a conversion with an offset as well as a scale, like Celsius to Fahrenheit'],['Blob','in this project, a glowing circle that stands for one measurement']],
 steps:[
  S('Write the checks for the rounding rule','You write the checks first. They fail. Then you write the code that makes them pass.',[
    'Open **tests/test_uncertainty.py**.',
    'Write the code below exactly. Each **assert** line says: when I give this input, I expect this output.',
    'Save the file, then run the command below.'],
    'python -m pytest -q tests/test_uncertainty.py','A red message with **ImportError** or **cannot import name round_measurement**. That is correct. The function does not exist yet.',null,
`from src.uncertainty import round_measurement

def test_rounding():
    assert round_measurement(44.64, 0.72) == (44.6, 0.7)
    assert round_measurement(15.5, 0.2236) == (15.5, 0.2)
    assert round_measurement(212.0, 0.54) == (212.0, 0.5)
    assert round_measurement(-40.0, 1.8) == (-40.0, 2.0)
    assert round_measurement(1234.5, 38.0) == (1230.0, 40.0)
    assert round_measurement(7.34, 0.96) == (7.0, 1.0)
    assert round_measurement(5.123, 0.0) == (5.123, 0.0)`),
  S('Write the rounding function','The rule: round the uncertainty to ONE significant figure, then round the value to the same decimal place.',[
    'Open **src/uncertainty.py**.',
    'Write a function {{round_measurement(value, unc)}} that returns a pair {{(value_rounded, unc_rounded)}}.',
    'If {{unc}} is zero, return {{(value, 0.0)}} straight away.',
    'Otherwise, turn {{unc}} into text with one significant figure using {{f"{unc:.0e}"}}. For 0.72 that text is {{7e-01}}.',
    'The number after the letter e is the exponent. Cut it out with {{text.split("e")[1]}} and turn it into an integer with {{int(...)}}. For {{7e-01}} that is -1.',
    'The number of decimal places is minus the exponent. Here it is 1.',
    'The rounded uncertainty is {{float(text)}}. The rounded value is {{round(value, decimals)}}.'],
    'python -m pytest -q tests/test_uncertainty.py','**1 passed** in green.','Negative decimals are allowed. {{round(1234.5, -1)}} gives 1230.0.'),
  S('Write the checks for the unit tables','Same pattern again: checks first.',[
    'Open **tests/test_units.py** and write the code below.',
    'Run the command. It should fail with an import error.'],
    'python -m pytest -q tests/test_units.py','A red **ImportError** about {{family_of}}.',null,
`import pytest
from src.units import family_of, UnitError

def test_family_of():
    assert family_of("km") == "length"
    assert family_of("min") == "time"
    assert family_of("km/h") == "speed"
    assert family_of("F") == "temperature"
    assert family_of("kWh") == "energy"
    assert family_of("g") == "mass"

def test_unknown_unit():
    with pytest.raises(UnitError):
        family_of("banana")`),
  S('Write the unit tables','This is the only place in the program that knows what a unit is.',[
    'Open **src/units.py**.',
    'Define {{class UnitError(Exception): pass}}. It is your own error type.',
    'Copy the table below into the file. Each entry is {{"unit": (family, how many base units it is)}}. Base units are m, s, m/s, J and kg.',
    'Temperature is special. Add three more entries by hand: {{"C"}}, {{"F"}} and {{"K"}}, all with family {{"temperature"}} and factor {{1.0}} for now.',
    'Write {{family_of(unit)}}. It returns the family text. If the unit is not in the table, {{raise UnitError("unknown unit: " + unit)}}.',
    'Write {{units_in_family(family)}}. It returns a list of all unit names in that family. You will need it for the screen later.'],
    'python -m pytest -q tests/test_units.py','**2 passed** in green.',null,
`FACTORS = {
    "m": ("length", 1.0), "km": ("length", 1000.0), "cm": ("length", 0.01),
    "mm": ("length", 0.001), "ft": ("length", 0.3048), "mi": ("length", 1609.344),
    "s": ("time", 1.0), "min": ("time", 60.0), "hr": ("time", 3600.0),
    "m/s": ("speed", 1.0), "km/h": ("speed", 1 / 3.6), "mi/h": ("speed", 0.44704),
    "J": ("energy", 1.0), "kJ": ("energy", 1000.0), "cal": ("energy", 4.184),
    "kWh": ("energy", 3600000.0),
    "kg": ("mass", 1.0), "g": ("mass", 0.001),
}`),
  S('Write convert()','Most units only need a multiplication. Temperature needs an offset too.',[
    'Open **tests/test_units.py** and add the code below at the bottom. Add {{convert}} to the import line at the top. Run it. It fails.',
    'In **src/units.py** write {{convert(value, unc, from_unit, to_unit)}}. It returns {{(new_value, new_unc)}}.',
    'If the two families differ, {{raise UnitError("cannot convert " + family1 + " to " + family2)}}.',
    'For every family except temperature: {{new_value = value * factor_from / factor_to}}. The uncertainty uses the SAME multiplication.',
    'For temperature, first turn the value into kelvin. C to K is {{value + 273.15}}. F to K is {{(value - 32) * 5 / 9 + 273.15}}. K stays. Then turn kelvin into the target. K to C is {{k - 273.15}}. K to F is {{(k - 273.15) * 9 / 5 + 32}}.',
    'For temperature the uncertainty has NO offset. It only scales. One degree C equals 1 kelvin and 1.8 degrees F. So the scale of C is 1, of K is 1, of F is 5/9. Use {{unc * scale_from / scale_to}}.'],
    'python -m pytest -q tests/test_units.py','**4 passed** in green.','If your temperature checks fail by a tiny amount like 1e-14, the checks use {{approx}} so they should still pass. If they do not, you forgot the offset or the scale.',
`from pytest import approx

def test_convert():
    assert convert(12.4, 0.2, "m/s", "km/h") == (approx(44.64), approx(0.72))
    assert convert(100, 0.3, "C", "F") == (approx(212), approx(0.54))
    assert convert(0, 1, "C", "K") == (approx(273.15), approx(1))
    assert convert(-40, 1, "C", "F") == (approx(-40), approx(1.8))
    assert convert(1, 0.1, "mi", "km") == (approx(1.609344), approx(0.1609344))
    assert convert(1, 0, "kWh", "J") == (approx(3600000), approx(0))

def test_convert_mismatch():
    with pytest.raises(UnitError):
        convert(5, 0.1, "m", "kg")`),
  S('Write combine()','Combining two uncertain numbers. The uncertainties do not simply add.',[
    'Open **tests/test_uncertainty.py**. Add the code below at the bottom. Add the imports at the top. Run it. It fails.',
    'In **src/uncertainty.py** write {{combine(m1, m2, op)}}. Each measurement is a tuple {{(value, unc, unit)}}. It returns a tuple {{(value, unc, unit)}}.',
    'Check the families with {{family_of}}. If they differ, {{raise UnitError}}. This also applies to x and /. (Real physics allows m divided by s. We stay strict to keep the project small.)',
    'For **+** and **-**: first convert measurement 2 into the unit of measurement 1 with {{convert}}. Value is the sum or difference. Uncertainty is {{sqrt(u1**2 + u2**2)}} for BOTH. Use {{math.sqrt}}.',
    'For **x**: value is {{v1 * v2}}. Uncertainty is {{abs(value) * sqrt((u1/v1)**2 + (u2/v2)**2)}}. The unit text is {{unit1 + "*" + unit2}}.',
    'For **/**: value is {{v1 / v2}}. Uncertainty uses the same formula as x. The unit text is {{unit1 + "/" + unit2}}.'],
    'python -m pytest -q tests/test_uncertainty.py','**3 passed** in green (the rounding check plus the two new ones).','The letter **x** is the multiply symbol in this project, because it is easy to type.',
`import pytest
from pytest import approx
from src.units import UnitError
from src.uncertainty import combine

def test_combine():
    assert combine((12.4, 0.2, "m/s"), (3.1, 0.1, "m/s"), "+") == (approx(15.5), approx(0.2236, abs=0.0001), "m/s")
    assert combine((2.0, 0.1, "m"), (3.0, 0.2, "m"), "x") == (approx(6.0), approx(0.5, abs=0.001), "m*m")
    assert combine((10.0, 0.2, "s"), (4.0, 0.1, "s"), "/") == (approx(2.5), approx(0.08, abs=0.0002), "s/s")
    assert combine((1.0, 0.1, "km"), (500.0, 5.0, "m"), "+") == (approx(1.5), approx(0.1001, abs=0.0001), "km")
    assert combine((5.0, 0.3, "m"), (2.0, 0.1, "m"), "-") == (approx(3.0), approx(0.3162, abs=0.0001), "m")

def test_combine_mismatch():
    with pytest.raises(UnitError):
        combine((5, 0.1, "m"), (2, 0.1, "kg"), "+")`),
  S('Write format_measurement()','This turns numbers into the text you will see on screen.',[
    'In **tests/test_uncertainty.py** add the check below and add {{format_measurement}} to the import. Run it. It fails.',
    'In **src/uncertainty.py** write {{format_measurement(value, unc, unit)}}. It returns text.',
    'Call {{round_measurement}} first.',
    'Work out the decimal places again with the exponent trick. Use {{max(0, -exponent)}}.',
    'Build the text with an f-string: {{f"{v:.{d}f} ± {u:.{d}f} {unit}"}}. Copy the ± sign from this page.',
    'If the uncertainty is zero, just return {{f"{value} ± 0 {unit}"}}.'],
    'python -m pytest -q tests/test_uncertainty.py','**4 passed** in green.','The check expects **1230 ± 40 J** with no decimal point. With {{d = 0}}, the format {{:.0f}} gives that.',
`from src.uncertainty import format_measurement

def test_format():
    assert format_measurement(44.64, 0.72, "km/h") == "44.6 ± 0.7 km/h"
    assert format_measurement(212.0, 0.54, "F") == "212.0 ± 0.5 F"
    assert format_measurement(1234.5, 38.0, "J") == "1230 ± 40 J"
    assert format_measurement(6.0, 0.4999999, "m*m") == "6.0 ± 0.5 m*m"
    assert format_measurement(7.34, 0.96, "s") == "7 ± 1 s"`),
  WIN('Uncertainty Sandbox'),
  S('Draw six glowing blobs','Each measurement becomes a circle. The fuzzy ring around it shows how unsure you are.',[
    'At the top of **src/main.py** add the imports: {{from src.units import convert, family_of, units_in_family, UnitError}} and {{from src.uncertainty import combine, format_measurement}}.',
    'Write {{class Blob}} with {{__init__(self, value, unc, unit, x, y)}}. Store all five. Also store {{self.shown = 28.0}}, the ring size currently on screen.',
    'Add a method {{target()}} that returns {{28 + min(90, 600 * abs(self.unc / self.value))}} (or 28 if value is 0). This is the ring size. It grows with the RELATIVE uncertainty, unc divided by value.',
    'Make a list called {{blobs}} with the six blobs in the table below.',
    'Colors by family: length green (80,200,160), time blue (96,165,250), speed purple (167,139,250), temperature orange (251,146,60), energy yellow (250,204,21), mass pink (244,114,182).',
    'In the DRAW part of the loop, draw each blob: first a translucent ring, then a solid core of radius 26, then its label from {{format_measurement}} centered below it.',
    'For the translucent ring, make a surface with {{pygame.Surface((2*R, 2*R), pygame.SRCALPHA)}}, draw a circle on it with a color that has a 4th number 70 (the see-through amount), and {{screen.blit}} it at {{(x - R, y - R)}}.'],
    'python -m pytest -q\npython -m src.main','The checks still pass. The window shows six glowing circles with labels like **12.4 ± 0.2 m/s**. The **1.0 ± 0.1 km** blob has the biggest ring. The **500 ± 5 m** blob has the smallest.','Blob table (value, unc, unit, x, y):\n12.4, 0.2, m/s, 200, 200\n3.1, 0.1, m/s, 400, 200\n20, 0.5, C, 600, 200\n1.0, 0.1, km, 800, 200\n500, 5, m, 200, 350\n2.0, 0.1, kg, 400, 350'),
  S('Make the blobs draggable','Pick a blob up with the mouse and move it.',[
    'Before the loop create {{dragging = None}} and {{grab = (0, 0)}}.',
    'In the events loop, when {{event.type == pygame.MOUSEBUTTONDOWN}} and {{event.button == 1}}: check each blob in {{reversed(blobs)}}. If the mouse is within 30 pixels of its center, set {{dragging}} to it, save its start spot in {{blob.home}}, and set {{grab}} to the gap between the mouse and the center.',
    'When {{event.type == pygame.MOUSEMOTION}} and {{dragging}} is not None: set the blob x and y to the mouse position minus {{grab}}.',
    'When {{event.type == pygame.MOUSEBUTTONUP}}: set {{dragging = None}}.',
    'Distance between two points: {{math.hypot(x1 - x2, y1 - y2)}}.'],
    'python -m src.main','You can pick up any blob and move it. The others stay still. Letting go drops it.'),
  S('Add unit zones and live conversion','Drop a blob on a unit and it converts.',[
    'While a blob is being dragged, draw a row of boxes along the bottom of the window. One box for every unit in the blob family EXCEPT its current unit. Use {{units_in_family}}. Each box is 90 wide and 50 tall, starting at x = 30, y = 530.',
    'Write the unit name inside each box. Highlight the box that the mouse is over.',
    'On mouse button up, if the mouse is inside a box: {{blob.value, blob.unc = convert(blob.value, blob.unc, blob.unit, new_unit)}}, then {{blob.unit = new_unit}}. Then send the blob back to {{blob.home}}.',
    '{{pygame.Rect(x, y, w, h).collidepoint(pos)}} tells you if a point is inside a box.'],
    'python -m src.main','Drag **12.4 ± 0.2 m/s** onto **km/h**. The label becomes **44.6 ± 0.7 km/h** and the ring barely changes (same relative uncertainty). Drag **20 ± 0.5 C** onto **F**. The label becomes **68.0 ± 0.9 F** and the ring visibly SHRINKS. Same temperature, but a different relative uncertainty. That is the offset showing itself.'),
  S('Merge two blobs with an operator key','Drop one blob on another, then press an operator key.',[
    'On mouse button up, if the dragged blob is NOT over a zone but is within 40 pixels of another blob, store {{pending = (dragged, other)}}. Otherwise set {{pending = None}}.',
    'While {{pending}} is set, draw the text **Press + - x or / to merge** at the top of the window.',
    'On {{pygame.KEYDOWN}} with a pending pair, map the key to an operator: plus ({{pygame.K_PLUS}}, {{pygame.K_EQUALS}}, {{pygame.K_KP_PLUS}}) is {{"+"}}, minus is {{"-"}}, the x key is {{"x"}}, slash is {{"/"}}.',
    'Call {{combine}} on the two blobs. Remove both from {{blobs}}. Add a NEW blob at the midpoint between them with the result.',
    'Wrap the call in {{try / except UnitError}}. On an error: set {{flash = 30}} on both blobs, push one 120 pixels left and the other 120 pixels right, and clear {{pending}}.',
    'While a blob has {{flash > 0}}, draw a red ring around it and subtract 1 from {{flash}} every frame.'],
    'python -m src.main','Drop **12.4 ± 0.2 m/s** on **3.1 ± 0.1 m/s** and press **+**. They become one blob: **15.5 ± 0.2 m/s**. Drop **2.0 ± 0.1 kg** on any other blob and press **+**: both flash red and jump apart. Nothing is merged.'),
  S('Make the glow animate smoothly','Right now the ring jumps. Real instruments glide.',[
    'Each frame, before drawing, update every blob: {{blob.shown += (blob.target() - blob.shown) * 0.15}}.',
    'Draw the ring using {{blob.shown}} instead of {{blob.target()}}.',
    'Give a freshly merged blob {{shown = 28}} so its ring grows out from the core.'],
    'python -m src.main','Rings glide to their new size in about a third of a second after a conversion or a merge. They never jump.'),
 ],
 done:['{{python -m pytest -q}} prints **8 passed**.','Dragging 12.4 ± 0.2 m/s onto km/h shows **44.6 ± 0.7 km/h**.','Merging 12.4 ± 0.2 m/s with 3.1 ± 0.1 m/s using + shows **15.5 ± 0.2 m/s**.','Dragging 20 ± 0.5 C onto F shows **68.0 ± 0.9 F** and the ring shrinks.','Merging the kg blob with a m/s blob makes both flash red and jump apart.','Everything is saved with git.'],
 stuck:[['The test says **cannot import name**.','A file name or function name is spelled differently from the guide. Also check that **src/__init__.py** exists.'],['You get 44.60000000000001 instead of 44.6.','You skipped {{round_measurement}}. Every printed number must go through it.'],['The window shows no blobs.','The drawing code is outside the loop, or before {{screen.fill}}. Drawing must come after the fill.'],['Dragging picks the wrong blob.','Loop over {{reversed(blobs)}} so the blob drawn on top is picked first.'],['The ring is huge.','Use the RELATIVE uncertainty, {{abs(unc / value)}}, not the plain uncertainty.']]
};

GUIDES.s0p2 = {
 slug:'cannon-game', pip:['pygame'],
 files:[['src/__init__.py','empty file; lets Python import from src'],['src/physics.py','simulate(): the flight maths'],['src/main.py','the pygame game'],['tests/test_physics.py','checks for physics.py']],
 words:[['Trajectory','the curved path of something thrown'],['Launch angle','how steeply you fire, in degrees. 0 is flat, 90 is straight up'],['Gravity','the pull that makes things fall. On Earth it speeds a falling thing up by 9.8 meters per second every second'],['Drag','air pushing against motion. It slows the ball down'],['Time step','the tiny slice of time, here 0.01 seconds, that the simulation moves forward each turn']],
 steps:[
  S('Write the checks for the flight','Checks first. They know the right answers from school physics.',[
    'Open **tests/test_physics.py**.',
    'Write the code below.',
    'Run it. It should fail with an import error.'],
    'python -m pytest -q tests/test_physics.py','A red **ImportError** about {{simulate}}.','The school formula for range is v squared times sine of twice the angle, divided by g. For 20 m/s at 45 degrees that is 40.8 meters. The peak height is 10.2 meters.',
`from src.physics import simulate

def test_no_drag_45_degrees():
    points = simulate(20, 45)          # a list of (t, x, y)
    last = points[-1]
    peak = max(p[2] for p in points)
    assert abs(last[1] - 40.8) < 0.41   # range within about 1 percent
    assert abs(peak - 10.2) < 0.15      # peak within about 1.5 percent

def test_drag_shortens_range():
    assert simulate(20, 45, drag=0.1)[-1][1] < simulate(20, 45)[-1][1]`),
  S('Write simulate()','You move the ball a tiny bit at a time instead of using one big formula.',[
    'Open **src/physics.py**. Write {{import math}} at the top.',
    'Write {{simulate(v0, angle_deg, drag=0.0, dt=0.01, g=9.8)}}. It returns a list of {{(t, x, y)}} tuples.',
    'Start with {{x = 0}}, {{y = 0}}, {{t = 0}}. The starting speeds are {{vx = v0 * math.cos(angle)}} and {{vy = v0 * math.sin(angle)}}. First turn degrees into radians with {{math.radians}}.',
    'Put {{(0, 0, 0)}} in the list.',
    'Repeat forever, and each time do these lines IN THIS ORDER: {{ax = -drag * vx}}, {{ay = -g - drag * vy}}, {{vx += ax * dt}}, {{vy += ay * dt}}, {{x += vx * dt}}, {{y += vy * dt}}, {{t += dt}}. Then add {{(t, x, y)}} to the list.',
    'Stop the loop the moment {{y < 0}}. Return the list.'],
    'python -m pytest -q tests/test_physics.py','**2 passed** in green.','Use {{while True:}} and a {{break}} when y goes below zero.'),
  WIN('Cannon Game'),
  S('Draw the ground and make a ball fly','The first moving thing you built.',[
    'In **src/main.py** add {{from src.physics import simulate}} at the top.',
    'Before the loop: {{angle = 45}}, {{speed = 20}}, {{drag = 0.0}}, {{points = simulate(speed, angle, drag)}}, {{index = 0}}.',
    'Pick a scale: {{SCALE = 15}} pixels per meter. The ground is at screen y = 520. The cannon is at screen x = 60.',
    'To turn a flight point into a screen spot: {{screen_x = 60 + x * SCALE}} and {{screen_y = 520 - y * SCALE}}. Minus, because screen y grows DOWNWARD.',
    'In UPDATE: {{index = min(index + 2, len(points) - 1)}}.',
    'In DRAW: a green line for the ground, and a ball of radius 8 at the screen spot of {{points[index]}}.'],
    'python -m src.main','A ball flies in an arc from the left, peaks, and lands about **670 pixels** from the left edge of the window (60 + 40.7 × 15). Then it stays on the ground.'),
  S('Add controls','Make it a game.',[
    'On {{pygame.KEYDOWN}}: LEFT lowers {{angle}} by 1, RIGHT raises it by 1 (keep it between 5 and 85). DOWN lowers {{speed}} by 1, UP raises it by 1 (between 5 and 40).',
    'SPACE fires: set {{points = simulate(speed, angle, drag)}} and {{index = 0}}.',
    'The D key toggles drag between 0.0 and 0.1.',
    'Draw a line of text on screen: {{angle}}, {{speed}}, {{drag}}, and after landing the range {{points[-1][1]}} and the peak {{max(p[2] for p in points)}}. Use an f-string like {{f"range {r:.1f} m"}}.'],
    'python -m src.main','At the start the text shows **range 40.7 m** and **peak 10.1 m**. Pressing SPACE fires again. Changing the angle changes where it lands.'),
  S('Leave a trail and mark landings','You want to compare shots.',[
    'Draw small dots along the path so far: every point in {{points[:index+1]}} with an even index, radius 2, a faded color.',
    'Keep a list {{landings}}. When a shot finishes, add its landing x. Draw a small flag (a short vertical line) at each landing spot so earlier shots stay visible.'],
    'python -m src.main','Every shot leaves a dotted arc and a flag where it landed.'),
  S('Discover the secrets','Now use your game as a laboratory.',[
    'Turn drag OFF. Fire at 30, 45 and 60 degrees at speed 20. Write down each range.',
    'Turn drag ON (key D). Fire at 45 degrees. Write down the range.',
    'Still with drag ON, find the angle between 35 and 50 that goes the farthest. Try them one by one.',
    'Write your three answers in **README.md** as three sentences.'],
    null,'Expected, with small differences: 30 degrees about **35.2 m**, 45 degrees about **40.7 m**, 60 degrees about **35.2 m**. With drag 0.1 at 45 degrees about **34.0 m**. With drag the best angle is about **43 degrees**, a bit LESS than 45.','Why less than 45? Drag steals speed all along the flight. A flatter shot spends less time in the air, so it loses less.'),
 ],
 done:['{{python -m pytest -q}} prints **2 passed**.','No drag, 45 degrees, speed 20 gives **range 40.7 m** on screen.','Drag ON gives about **34.0 m**.','30 and 60 degrees give nearly the same range.','README.md contains your three sentences.','Everything is saved with git.'],
 stuck:[['The ball flies off the top of the screen.','You forgot the minus: {{520 - y * SCALE}}.'],['The test says **list index out of range**.','Your loop ended before adding any point. Add {{(0, 0, 0)}} first.'],['The ball never lands.','Check that you break when {{y < 0}} and that {{vy}} gets reduced by {{g * dt}} each step.'],['The window is slow or frozen.','The loop must call {{clock.tick(60)}} once per pass. Check the template.']]
};

GUIDES.s0p3 = {
 slug:'population-blobs', pip:['pygame','requests'],
 files:[['src/__init__.py','empty file; lets Python import from src'],['src/models.py','exponential() and logistic()'],['src/data.py','downloads real population numbers'],['src/fit.py','grid search for the best r and K'],['src/main.py','pygame window with growing dot swarms'],['tests/test_models.py','checks for models.py'],['data/','downloaded numbers are saved here']],
 words:[['Exponential growth','each year the population grows by a fixed percentage, forever'],['Logistic growth','growth that slows down as the population approaches a limit'],['Carrying capacity (K)','the most the environment can support'],['Growth rate (r)','how fast it grows, as a fraction. 0.1 means 10 percent per year'],['Grid search','trying many values of a number and keeping the one that fits best'],['Sum of squared errors','add up (model minus real) squared for every year. Smaller means a better fit']],
 steps:[
  S('Write the checks for both models','You know the right numbers by hand.',[
    'Open **tests/test_models.py** and write the code below.',
    'Run it. It fails.'],
    'python -m pytest -q tests/test_models.py','A red **ImportError**.','Exponential: each year P becomes P + r times P. With P = 100 and r = 0.1 the sequence is 100, 110, 121, 133.1 and so on. Logistic multiplies growth by (1 minus P divided by K).',
`from pytest import approx
from src.models import exponential, logistic

def test_exponential():
    seq = exponential(100, 0.1, 10)        # P0, r, number of years
    assert len(seq) == 11                  # starting value plus 10 years
    assert seq[1] == approx(110)
    assert seq[2] == approx(121)
    assert seq[10] == approx(259.37, abs=0.01)

def test_logistic():
    seq = logistic(100, 0.1, 1000, 10)     # P0, r, K, number of years
    assert seq[1] == approx(109)
    assert seq[2] == approx(118.71, abs=0.01)
    assert seq[10] == approx(226.13, abs=0.01)
    assert max(logistic(100, 0.1, 1000, 300)) <= 1000`),
  S('Write the two models','Two tiny functions.',[
    'Open **src/models.py**.',
    'Write {{exponential(p0, r, years)}}. Start a list with {{p0}}. Repeat {{years}} times: the new value is {{p + r * p}} where {{p}} is the last value. Append it. Return the list.',
    'Write {{logistic(p0, r, k, years)}}. Same, but the new value is {{p + r * p * (1 - p / k)}}.'],
    'python -m pytest -q tests/test_models.py','**2 passed** in green.'),
  WIN('Population Blobs'),
  S('Draw a swarm of dots that grows','One dot stands for ten people.',[
    'In **src/main.py** add {{import random, math}} and {{from src.models import exponential, logistic}}.',
    'Before the loop make two sequences: {{expo = exponential(100, 0.1, 60)}} and {{logi = logistic(100, 0.1, 1000, 60)}}. Set {{year = 0}} and {{frame = 0}}.',
    'Make two empty lists {{dots_a}} and {{dots_b}}. Each dot is a pair {{(x, y)}} of screen positions.',
    'Make a function {{grow(dots, target, center)}}. While {{len(dots) < target}}: pick a random angle and a random distance up to {{min(220, 16 * math.sqrt(len(dots) + 1))}}, and add a dot at the center plus that offset.',
    'The left center is {{(270, 330)}}. The right center is {{(730, 330)}}.',
    'In UPDATE: add 1 to {{frame}}. Every 24 frames add 1 to {{year}} (stop at 60) and call {{grow(dots_a, round(expo[year] / 10), left_center)}} and {{grow(dots_b, round(logi[year] / 10), right_center)}}.',
    'In DRAW: every dot as a small circle of radius 3. Left dots green, right dots blue. Draw the title text above each swarm. Also draw a thin gray circle of radius 220 around the right center. It is the carrying capacity wall.',
    'Show {{year}} and both populations as text.'],
    'python -m src.main','Both swarms start with 10 dots. Both grow at first. After about 30 years the right swarm stops growing at **100 dots** while the left one keeps exploding. By year 60 the left swarm is thousands of dots and spills past the screen edge.','The exponential swarm will reach 304,000 people by year 60. That is 30,400 dots. Draw only the first 3000 so the window stays fast.'),
  S('Download real population numbers','Real data beats invented data.',[
    'Open **src/data.py**.',
    'Write {{get_population(country_code)}}. It downloads from this address: {{https://api.worldbank.org/v2/country/RWA/indicator/SP.POP.TOTL?format=json&per_page=100}}. Replace RWA with a country code, for example KEN, UGA, NGA.',
    'Use {{requests.get(url).json()}}. The answer is a list of two things. The second item, {{[1]}}, is a list of records. Each record has {{"date"}} (the year, as text) and {{"value"}} (the population, a number or None).',
    'Skip records with value None. Return a list of {{(year_as_int, population)}} sorted from the oldest year to the newest.',
    'Save the result to **data/pop.json** with the {{json}} module, so you only download once. If the file exists, read it instead.'],
    'python -c "from src.data import get_population; d = get_population(\'RWA\'); print(len(d), d[0], d[-1])"','Something like **64 (1960, 2.8 million) (2023, 14 million)**. About 60 to 65 pairs. Years go up from the first to the last.','If you get an error about connection, check your internet. If the list is empty, check the country code.'),
  S('Fit both models to the real data','Which model describes real history better?',[
    'Open **src/fit.py**.',
    'Write {{sse(model_values, real_values)}} that adds up {{((m - r) / 1e6) ** 2}} for every pair. Dividing by a million keeps numbers small.',
    'Write {{fit_exponential(real)}}. Use the first real population as {{p0}}. Try every {{r}} from 0.001 to 0.080 in steps of 0.001 ({{r = i / 1000}} for {{i}} in {{range(1, 81)}}). For each, build {{exponential(p0, r, len(real) - 1)}} and score it with {{sse}}. Return the best {{(r, score)}}.',
    'Write {{fit_logistic(real)}}. Same idea, but ALSO try {{k}} values: {{max_pop * m}} for {{m}} in {{[1.1, 1.3, 1.6, 2, 3, 5, 8, 12]}}. Return {{(r, k, score)}}.',
    'Print both results.'],
    'python -c "from src.data import get_population; from src.fit import *; d = get_population(\'RWA\'); real = [p for _, p in d]; print(fit_exponential(real)); print(fit_logistic(real))"','Two lines. Your best **r** is a small number between **0.005 and 0.05**. The logistic **k** is a few times larger than today population. The logistic score is **equal or smaller** than the exponential score, because it has more freedom.','The logistic model can only fit equal or better, since a very large K makes it behave like the exponential. So the question is by how much.'),
  S('Show the winner on screen','See the fit with your own eyes.',[
    'In **src/main.py** press the **2** key to switch to a chart screen. Press **1** to go back to the dots.',
    'On the chart screen draw the real data as small dots, the best exponential as a green line, and the best logistic as a blue line. Map years to x and population to y with the same kind of formula as in the cannon game.',
    'Write the two scores on screen.',
    'In **README.md** write two sentences: which model fits better, and over which years the two are different.'],
    'python -m src.main','Real dots lie close to a curve. The two fitted lines may nearly touch for the early years and separate later.'),
 ],
 done:['{{python -m pytest -q}} prints **2 passed**.','The left swarm keeps growing. The right swarm stops at 100 dots.','You downloaded real population data and saved it in **data/pop.json**.','You can read both fit scores and say which model fits better.','README.md has your two sentences.','Everything is saved with git.'],
 stuck:[['**KeyError** or **TypeError** when reading World Bank data.','A record had value None. Skip it before using it.'],['The window freezes after year 30.','You are drawing too many dots. Draw only the first 3000 of each list.'],['The fit gives r = 0.001 or 0.080.','Your best value is at the edge of the search. Widen the range and try again.']]
};

GUIDES.s0p4 = {
 slug:'converging-average', pip:['pygame','requests','numpy'],
 files:[['src/__init__.py','empty file; lets Python import from src'],['src/stats.py','mean, variance, std, running_stats'],['src/nasa.py','downloads real weather'],['src/main.py','pygame window with three dials'],['tests/test_stats.py','checks for stats.py'],['data/','downloaded weather is saved here']],
 words:[['Mean','the average: add everything, divide by how many'],['Variance','how spread out the numbers are, as the average squared distance from the mean'],['Standard deviation','the square root of the variance, in the same units as your data'],['Running mean','the mean of the first 1 day, then of the first 2 days, then 3, and so on'],['Law of large numbers','the more data you add, the less your average jumps around'],['API','a web address that answers with data instead of a web page']],
 steps:[
  S('Write the checks for the statistics','The famous list 2, 4, 4, 4, 5, 5, 7, 9 has a mean of exactly 5 and a standard deviation of exactly 2.',[
    'Open **tests/test_stats.py** and write the code below.',
    'Run it. It fails.'],
    'python -m pytest -q tests/test_stats.py','A red **ImportError**.','This project uses the POPULATION formulas, which divide by N, not N minus 1.',
`import pytest
from pytest import approx
from src.stats import mean, variance, std, running_stats

DATA = [2, 4, 4, 4, 5, 5, 7, 9]

def test_basic():
    assert mean(DATA) == approx(5.0)
    assert variance(DATA) == approx(4.0)
    assert std(DATA) == approx(2.0)

def test_one_number():
    assert mean([10]) == approx(10)
    assert variance([10]) == approx(0)

def test_empty():
    with pytest.raises(ValueError):
        mean([])

def test_running():
    r = running_stats(DATA)
    assert len(r) == 8
    assert r[0] == (approx(2.0), approx(0.0))
    assert r[-1] == (approx(5.0), approx(2.0))`),
  S('Write the statistics by hand','No numpy here. You build it yourself.',[
    'Open **src/stats.py**.',
    'Write {{mean(xs)}}: add them up with a loop (or {{sum}}) and divide by {{len(xs)}}. If the list is empty, {{raise ValueError("empty list")}}.',
    'Write {{variance(xs)}}: the mean of {{(x - m) ** 2}} for every x, where {{m = mean(xs)}}.',
    'Write {{std(xs)}}: the square root of the variance. Use {{math.sqrt}}.',
    'Write {{running_stats(xs)}}: a list with one pair {{(mean, std)}} for every prefix of the list. The first pair uses only {{xs[:1]}}, the second {{xs[:2]}}, and so on.'],
    'python -m pytest -q tests/test_stats.py','**4 passed** in green.'),
  S('Download real weather from NASA','Real satellite data for any place on Earth.',[
    'Open **src/nasa.py**.',
    'Write {{fetch_daily(lat, lon, start, end)}}. Build this address: {{https://power.larc.nasa.gov/api/temporal/daily/point?parameters=T2M,PRECTOTCORR,ALLSKY_SFC_SW_DWN&community=RE&longitude=LON&latitude=LAT&start=START&end=END&format=JSON}} using an f-string. Dates look like {{20230101}}.',
    'Use {{requests.get(url, timeout=60).json()}}. The data is at {{["properties"]["parameter"]}}. It is a dictionary with three keys: {{T2M}} (temperature in C), {{PRECTOTCORR}} (rain in mm per day), {{ALLSKY_SFC_SW_DWN}} (sunlight in kWh per square meter per day).',
    'Each of those is a dictionary from a date text to a number. A value of **-999** means missing. Replace -999 with the previous good value.',
    'Return a dictionary with the same three keys, but each is a plain list of numbers in date order. Use {{sorted(d.keys())}}.',
    'Cache: save the answer in **data/** as a file named after the arguments, and read it back next time.'],
    `python -c "from src.nasa import fetch_daily; d = fetch_daily(-1.94, 30.06, '20230101', '20231231'); print(len(d['T2M']), d['T2M'][:3])"`,'**365** and three temperatures between about **14 and 24**. These are Kigali daily temperatures in degrees C.'),
  WIN('Converging Average'),
  S('Draw one dial','A dial is a half circle with a needle.',[
    'In **src/main.py** add {{import math}}, {{from src.nasa import fetch_daily}}, {{from src.stats import running_stats}}.',
    'Before the loop: {{data = fetch_daily(-1.94, 30.06, "20230101", "20231231")}}. Then {{stats = running_stats(data["T2M"])}}. Also work out {{lo = min(data["T2M"])}} and {{hi = max(data["T2M"])}}. Set {{day = 0}}.',
    'Write {{draw_dial(cx, cy, radius, fraction, color)}} that draws one needle: a line from the center to {{(cx + L * cos(a), cy - L * sin(a))}}, where {{a = math.pi - fraction * math.pi}} and {{L = radius * 0.9}}. Fraction 0 points left, fraction 1 points right.',
    'Draw a half circle outline for the dial. Use {{pygame.draw.arc}} with angles 0 to pi, or draw 40 short line pieces.',
    'The mean needle fraction is {{(mean - lo) / (hi - lo)}}. For now draw only the temperature dial at center {{(300, 400)}} with radius 220.'],
    'python -m src.main','A half circle with one needle. It points to where the average of **day 1** falls between the coldest and hottest day of the year.'),
  S('Stream the days in','Press play on a year of weather.',[
    'In UPDATE: every 3 frames add 1 to {{day}}, up to {{len(stats) - 1}}.',
    'Use {{stats[day]}} to get the current {{(mean, std)}}.',
    'Draw TWO needles on the dial: the mean needle bright, and a second fainter needle for the standard deviation. For the std needle use the fraction {{std / (hi - lo)}}.',
    'Write the numbers as text: **Day 40 of 365**, **mean 19.3**, **std 1.2**.',
    'Keys: SPACE pauses. UP makes it faster. DOWN makes it slower. R starts again.'],
    'python -m src.main','On the first days the bright needle JUMPS around wildly. By day 60 it barely moves. By the end it is almost still. That calming down is the law of large numbers.'),
  S('Add the other two dials','Three variables: temperature, rain, sunlight.',[
    'Repeat the dial for {{data["PRECTOTCORR"]}} and {{data["ALLSKY_SFC_SW_DWN"]}} with their own stats and own lo and hi.',
    'Use window width 1200. Place the three dials at x = 200, 600 and 1000. Give each a title.',
    'All three dials advance together on the same day counter.'],
    'python -m src.main','Three dials. Rain jumps the most and settles slowest, because rain is very uneven. Temperature settles fast.'),
  S('Find when each one settles and check against numpy','Turn what you see into a number.',[
    'Write a function {{settle_day(values)}} in **src/stats.py**: the last day where the running mean differs from the final mean by more than 2 percent of the full range {{max - min}}.',
    'Print it for the three variables.',
    'In **tests/test_stats.py** add one more check: for a list of 100 random numbers from {{numpy.random.default_rng(1).random(100)}}, your {{mean}} and {{std}} equal {{numpy.mean}} and {{numpy.std}} with {{approx}}.'],
    'python -m pytest -q','**5 passed**. Rain settles on a LATER day than temperature. Write the three settle days in **README.md**.'),
 ],
 done:['{{python -m pytest -q}} prints **5 passed**.','Your hand-written mean and std match numpy.','Three dials move at once with a bright mean needle and a faint std needle.','The needles clearly jump early and calm down later.','README.md lists the three settle days.','Everything is saved with git.'],
 stuck:[['**KeyError: T2M**','The download failed or the address is wrong. Print the whole answer and look for a message.'],['Every value is -999.','The location or dates are outside the data. Use dates in 2001 to last year.'],['Needle points the wrong way.','You may have used {{math.pi * fraction}}. It must be {{math.pi - fraction * math.pi}}.'],['Division by zero.','All values were equal for the first days. Guard {{hi - lo}} with {{or 1}}.']]
};

GUIDES.s1p1 = {
 slug:'climate-trend-live', pip:['pygame','requests','numpy'],
 files:[['src/__init__.py','empty file; lets Python import from src'],['src/regression.py','fit_line(), fit_line_np(), slope_std_error()'],['src/nasa.py','downloads monthly temperature'],['src/main.py','pygame window: the line fitting itself live'],['tests/test_regression.py','checks for regression.py'],['data/','downloaded numbers are saved here']],
 words:[['Trend','the direction numbers are moving over time'],['Regression line','the straight line that best fits a cloud of dots'],['Slope','how much y changes when x goes up by one. Here: degrees C per year'],['Standard error','how uncertain the slope is. Smaller means more trustworthy'],['Vectorised','doing maths on a whole array at once instead of looping'],['Residual','the gap between a real dot and the line']],
 steps:[
  S('Write the checks for the line fit','Two tiny data sets where you know the answer.',[
    'Open **tests/test_regression.py** and write the code below.',
    'Run it. It fails.'],
    'python -m pytest -q tests/test_regression.py','A red **ImportError**.','The second data set has noise, so its slope is close to 3 but not exactly 3. That is the real-life situation.',
`from pytest import approx
from src.regression import fit_line, fit_line_np, slope_std_error

X = list(range(10))

def test_perfect_line():
    y = [3 * x + 7 for x in X]
    slope, intercept = fit_line(X, y)
    assert slope == approx(3.0)
    assert intercept == approx(7.0)
    assert slope_std_error(X, y, slope, intercept) == approx(0.0, abs=1e-9)

def test_noisy_line():
    y = [7.4, 9.6, 13.3, 15.8, 19.5, 22.1, 25.4, 28.0, 31.2, 34.0]
    slope, intercept = fit_line(X, y)
    assert slope == approx(3.0030, abs=0.0001)
    assert intercept == approx(7.1164, abs=0.0001)
    assert slope_std_error(X, y, slope, intercept) == approx(0.03349, abs=0.0001)

def test_numpy_version_agrees():
    y = [7.4, 9.6, 13.3, 15.8, 19.5, 22.1, 25.4, 28.0, 31.2, 34.0]
    assert fit_line_np(X, y) == (approx(fit_line(X, y)[0]), approx(fit_line(X, y)[1]))`),
  S('Write the line fit with a loop','The formulas are short.',[
    'Open **src/regression.py**.',
    'Write {{fit_line(xs, ys)}}. Work out {{xm}}, the mean of the xs, and {{ym}}, the mean of the ys.',
    'The slope is the sum of {{(x - xm) * (y - ym)}} divided by the sum of {{(x - xm) ** 2}}.',
    'The intercept is {{ym - slope * xm}}. Return {{(slope, intercept)}}.',
    'Write {{slope_std_error(xs, ys, slope, intercept)}}. For each point the residual is {{y - (intercept + slope * x)}}. The answer is {{sqrt( (sum of residual squared / (n - 2)) / (sum of (x - xm) squared) )}}.',
    'Write {{fit_line_np(xs, ys)}}: the same as {{fit_line}} but using numpy arrays with NO loop. Make arrays with {{numpy.array}}, then use {{.mean()}} and {{.sum()}} on whole arrays.'],
    'python -m pytest -q tests/test_regression.py','**3 passed** in green.'),
  S('Prove the numpy version is faster','This is why scientists use numpy.',[
    'Make a file called **speed_test.py** in the project root.',
    'In it, create two lists of 1 million numbers: xs = {{list(range(1000000))}} and ys = twice each x plus random noise.',
    'Time {{fit_line}} and {{fit_line_np}} on them using {{import time}}, {{t0 = time.perf_counter()}} before and {{time.perf_counter() - t0}} after.',
    'Print both times and the ratio.'],
    'python speed_test.py','The numpy version is usually **20 to 100 times faster**. Write the ratio you got in README.md.'),
  S('Download 20+ years of monthly temperature','Real data for a real place.',[
    'Open **src/nasa.py**.',
    'Write {{fetch_monthly_temp(lat, lon, start_year, end_year)}} using {{https://power.larc.nasa.gov/api/temporal/monthly/point?parameters=T2M&community=RE&longitude=LON&latitude=LAT&start=YEAR1&end=YEAR2&format=JSON}}.',
    'The values are in {{["properties"]["parameter"]["T2M"]}}. Keys look like {{200101}} (year then month). Keys that END in **13** are the yearly average. SKIP those.',
    'Make two lists: {{xs}} as decimal years, {{year + (month - 0.5) / 12}}, and {{ys}} as temperatures. Skip any value of -999.',
    'Cache the answer in **data/**.'],
    `python -c "from src.nasa import fetch_monthly_temp as f; xs, ys = f(-1.29, 36.82, 2001, 2023); print(len(xs), round(xs[0], 3), round(ys[0], 1))"`,'**276 2001.042** and a temperature around 17 to 19. That is Nairobi, 23 years times 12 months.'),
  WIN('Climate Trend Live'),
  S('Draw the dots one by one while the line re-fits itself','Watch the evidence pile up.',[
    'In **src/main.py** load the data. Set {{n = 2}} (the number of dots shown).',
    'Map decimal years to screen x between 80 and 920. Map temperature to screen y between 540 and 100, using the min and max of your data.',
    'In UPDATE: every 4 frames add 1 to {{n}}, up to the total number of points.',
    'In DRAW: a dot for each of the first {{n}} points.',
    'When {{n >= 3}}, call {{fit_line_np(xs[:n], ys[:n])}} and draw the line from the first x to the last x.',
    'Draw the text: **slope in degrees C per decade** is {{slope * 10}}. And **plus or minus** twice the standard error times 10.'],
    'python -m src.main','At first the line swings wildly and the slope changes sign. After about 100 dots it settles. At the end it points gently up or down.','Slope per decade is the slope per year times 10.'),
  S('Decide: trend or noise?','A real scientist always says how sure they are.',[
    'At the end of the data, compute {{slope}}, {{se = slope_std_error(...)}} and {{abs(slope) > 2 * se}}.',
    'Draw one sentence on screen: **Likely a real trend** if that is true, otherwise **Could be noise**.',
    'Write the slope per decade, the standard error and the sentence in **README.md**.'],
    'python -m src.main','The verdict sentence appears when all dots are shown.'),
 ],
 done:['{{python -m pytest -q}} prints **3 passed**.','Your speed test shows numpy is much faster.','The dots appear one by one and the line visibly settles.','The screen shows the slope per decade and the verdict.','README.md has the slope, the error and the speed ratio.','Everything is saved with git.'],
 stuck:[['**ZeroDivisionError** at the start.','You need at least 3 points before fitting. The n minus 2 would be zero with only 2.'],['The y axis looks upside down.','Screen y grows downward. Map the highest temperature to the SMALLEST y.'],['The data has 288 points but you expected 276.','You included the **13** keys. Skip keys that end in 13.']]
};

GUIDES.s1p2 = {
 slug:'root-hunter', pip:['pygame'],
 files:[['src/__init__.py','empty file; lets Python import from src'],['src/solvers.py','bisection, newton, differences'],['src/main.py','pygame window that shows the hunt'],['tests/test_solvers.py','checks for solvers.py']],
 words:[['Root','a number x where a function gives zero. For x*x - 2 the root is the square root of 2'],['Bisection','keep cutting the search area in half'],['Newton method','jump along the tangent line to its zero crossing, again and again'],['Derivative','how steeply the function is rising at one point'],['Finite difference','estimating a derivative from two nearby points'],['Tolerance','how close is close enough']],
 steps:[
  S('Write the checks for the solvers','The root of x*x - 2 is 1.41421356...',[
    'Open **tests/test_solvers.py** and write the code below.',
    'Run it. It fails.'],
    'python -m pytest -q tests/test_solvers.py','A red **ImportError**.','Newton on x cubed minus 2x plus 2 starting at 0 jumps to 1, then back to 0, forever. That is a famous failure and the last check tests for it.',
`import math
import pytest
from pytest import approx
from src.solvers import bisection, newton, forward_diff, central_diff

def f(x): return x * x - 2
def df(x): return 2 * x

def test_bisection():
    root, count = bisection(f, 0, 2, 1e-8)
    assert root == approx(math.sqrt(2), abs=1e-8)
    assert count == 27

def test_bisection_needs_a_sign_change():
    with pytest.raises(ValueError):
        bisection(f, 2, 3)

def test_newton():
    root, count = newton(f, df, 1.0, 1e-8)
    assert root == approx(math.sqrt(2), abs=1e-8)
    assert count == 4

def test_newton_failure():
    with pytest.raises(RuntimeError):
        newton(lambda x: x**3 - 2*x + 2, lambda x: 3*x*x - 2, 0.0)

def test_differences():
    exact = math.cos(1.0)
    assert forward_diff(math.sin, 1.0, 0.001) == approx(exact, abs=5e-4)
    assert central_diff(math.sin, 1.0, 0.001) == approx(exact, abs=1e-7)`),
  S('Write bisection and Newton','Two ways to hunt a root.',[
    'Open **src/solvers.py**.',
    'Write {{bisection(f, a, b, tol=1e-8)}}. If {{f(a) * f(b) > 0}}, {{raise ValueError}}. Set {{count = 0}}. While {{(b - a) / 2 >= tol}}: take {{m = (a + b) / 2}}. If {{f(a) * f(m) <= 0}} the root is on the left, so set {{b = m}}. Otherwise set {{a = m}}. Add 1 to {{count}}. At the end return {{((a + b) / 2, count)}}.',
    'Write {{newton(f, df, x0, tol=1e-8, max_iter=50)}}. Set {{x = x0}} and {{count = 0}}. While {{abs(f(x)) > tol}}: if {{count >= max_iter}}, {{raise RuntimeError("did not converge")}}. Otherwise set {{x = x - f(x) / df(x)}} and add 1 to {{count}}. Return {{(x, count)}}.',
    'Write {{forward_diff(f, x, h)}} as {{(f(x + h) - f(x)) / h}} and {{central_diff(f, x, h)}} as {{(f(x + h) - f(x - h)) / (2 * h)}}.'],
    'python -m pytest -q tests/test_solvers.py','**5 passed** in green.','Bisection takes 27 steps. Newton takes 4. Remember those numbers.'),
  S('Measure how the errors shrink','Numerical scientists always check the error pattern.',[
    'Make a file **errors.py** in the project root.',
    'For h = 0.1, 0.01, 0.001, 0.0001 print the error of {{forward_diff}} and {{central_diff}} for {{sin}} at 1.0. Error means the absolute value of the estimate minus {{math.cos(1.0)}}.'],
    'python errors.py','A table. Forward error: about **4.3e-02, 4.2e-03, 4.2e-04, 4.2e-05**. Central error: about **9e-04, 9e-06, 9e-08, 9e-10**. Each row, the forward error is 10 times smaller. Each row, the central error is 100 times smaller.','Write one sentence in README.md about why central is better.'),
  WIN('Root Hunter'),
  S('Make the solvers yield one step at a time','The screen needs to see every step, not only the answer.',[
    'In **src/solvers.py** write {{bisection_steps(f, a, b)}}. It is like bisection but inside the loop it does {{yield (a, b, m)}}. A function with {{yield}} gives back one answer at a time. You get the next with {{next(generator)}} or a {{for}} loop.',
    'Write {{newton_steps(f, df, x0)}} that does {{yield x}} at the start and after every jump.',
    'Test it: {{list(bisection_steps(lambda x: x*x - 2, 0, 2))[:3]}} should start with {{(0, 2, 1.0)}}.'],
    'python -c "from src.solvers import bisection_steps as b; print(list(b(lambda x: x*x-2, 0, 2))[:3])"','The first entry is **(0, 2, 1.0)**. After that the interval narrows to the right half: **(1.0, 2, 1.5)**.'),
  S('Draw the function and the hunt','Watch the search.',[
    'In **src/main.py** draw the curve of {{x*x - 2}} for x from -0.5 to 2.5. Map x to screen x between 100 and 900, and y between -2.5 and 5 to screen y between 520 and 80. Draw the x axis as a line. Draw the curve with {{pygame.draw.lines}}.',
    'Keep a variable {{mode}} that is "bisection" or "newton". Key **B** starts bisection, key **N** starts Newton, key **R** resets.',
    'Bisection: on each **SPACE** press, get the next {{(a, b, m)}}. Draw a translucent blue band from a to b, and a vertical line at m. Show the step number and the width {{b - a}} as text.',
    'Newton: on each SPACE press, get the next x. Draw a dot on the curve at x, and a tangent line through it with slope {{2 * x}}. Draw a dot where the tangent crosses the axis. That is the next x.'],
    'python -m src.main','Bisection: pressing SPACE shrinks the blue band. The widths are **2, 1, 0.5, 0.25** and so on. Newton: after **4** presses the dot sits on the curve at **1.4142**. Watching both side by side shows how fast Newton is.'),
  S('Watch Newton fail on purpose','A good scientist knows when a method breaks.',[
    'Press key **F** to switch the function to {{x**3 - 2*x + 2}} with derivative {{3*x*x - 2}}. Draw it for x from -2.5 to 2.',
    'Start Newton at x = 0 and press SPACE many times.',
    'Write in README.md one sentence: what did the dot do, and why?'],
    null,'The dot jumps between **0** and **1** forever and never reaches the real root near -1.77. At x = 0 the tangent is steep and sends you to 1. At x = 1 the tangent slope is 1 and sends you back to 0.'),
 ],
 done:['{{python -m pytest -q}} prints **5 passed**.','Bisection takes 27 steps, Newton takes 4.','The error table shows the 10 times and 100 times pattern.','Bisection and Newton hunts both work on screen.','You watched Newton bounce between 0 and 1.','Everything is saved with git.'],
 stuck:[['**ZeroDivisionError** in Newton.','The derivative was zero at that point. Newton cannot go on from a flat spot.'],['Bisection count is 28 or 26.','Check the loop stop rule: {{(b - a) / 2 >= tol}}.'],['The curve is drawn upside down.','Screen y goes DOWN. Map high y values to small screen y.']]
};

GUIDES.s1p3 = {
 slug:'spring-bounce', pip:['pygame'],
 files:[['src/__init__.py','empty file; lets Python import from src'],['src/physics.py','step_euler() and energy()'],['src/main.py','pygame window with a bouncing spring'],['tests/test_physics.py','checks for physics.py']],
 words:[['Oscillation','going back and forth again and again'],['Spring constant (k)','how stiff the spring is'],['Damping (c)','friction that slowly kills the bounce'],['Driving force','a push that repeats, like pushing a swing'],['Resonance','pushing at the natural speed makes the swing grow huge'],['Euler method','move forward a tiny step using the current speeds'],['Energy','half mass times speed squared, plus half k times stretch squared. It should never change']],
 steps:[
  S('Write the checks for one Euler step','You can do the first step by hand.',[
    'Open **tests/test_physics.py** and write the code below.',
    'Run it. It fails.'],
    'python -m pytest -q tests/test_physics.py','A red **ImportError**.','Start: stretched 1 meter, not moving. The spring pulls back with force 1. In one step of 0.1 seconds the speed becomes minus 0.1 and the position stays at 1.0, because Euler uses the OLD speed (zero) to move.',
`from pytest import approx
from src.physics import step_euler, energy

def test_one_step():
    x, v = step_euler(1.0, 0.0, 0.1)           # x, v, dt
    assert x == approx(1.0)
    assert v == approx(-0.1)

def test_energy_formula():
    assert energy(1.0, 0.0) == approx(0.5)
    assert energy(0.0, 2.0) == approx(2.0)

def test_energy_after_one_step():
    x, v = step_euler(1.0, 0.0, 0.1)
    assert energy(x, v) == approx(0.505)

def test_energy_grows_over_four_periods():
    x, v = 1.0, 0.0
    for _ in range(2513):                      # about 25.13 seconds at dt 0.01
        x, v = step_euler(x, v, 0.01)
    assert energy(x, v) == approx(0.643, abs=0.005)`),
  S('Write the physics','Two small functions.',[
    'Open **src/physics.py**.',
    'Write {{step_euler(x, v, dt, m=1.0, k=1.0, c=0.0, force=0.0)}} that returns {{(new_x, new_v)}}.',
    'The acceleration is {{a = (-k * x - c * v + force) / m}}.',
    'Both new numbers use the OLD x and OLD v: {{new_x = x + dt * v}} and {{new_v = v + dt * a}}. Do not use the new x to compute the new v.',
    'Write {{energy(x, v, m=1.0, k=1.0)}} as {{0.5 * m * v**2 + 0.5 * k * x**2}}.'],
    'python -m pytest -q tests/test_physics.py','**4 passed** in green.','The last check proves something surprising: Euler makes the energy GROW. A real spring never does that. After 4 laps the energy is 0.643 instead of 0.5.'),
  WIN('Spring Bounce'),
  S('Draw a mass on a spring','Your first physics toy.',[
    'In **src/main.py** import {{step_euler}} and {{energy}}. Set {{x, v = 1.0, 0.0}}, {{dt = 0.01}}, {{t = 0.0}}.',
    'Pick 120 pixels per meter. The wall is a thick vertical line at screen x = 100. The mass is a square of 50 by 50 pixels centered at screen x = {{450 + x * 120}} and screen y = 300.',
    'Draw the spring as a zigzag: 12 line segments from the wall to the mass, alternating 15 pixels above and below y = 300. Compute the segment x positions with {{wall_x + (mass_x - wall_x) * i / 12}} for i from 0 to 12.',
    'In UPDATE call {{x, v = step_euler(x, v, dt)}} TWO times per frame. Add {{dt}} to {{t}} each time.'],
    'python -m src.main','The square slides back and forth smoothly and the zigzag stretches and squeezes. One full lap takes about **6.3 seconds**.'),
  S('Make the energy bug visible','A bug you can watch grow.',[
    'Draw the text: **time {{t}}** and **energy {{energy(x, v)}}** with 4 decimal places.',
    'Draw an energy bar at the bottom: a green rectangle whose width is {{energy * 300}} pixels. Draw a thin white line at the width of **0.5 energy**. That is the true value.',
    'Key **[** and key **]** cycle {{dt}} through 0.1, 0.01 and 0.001 and restart at x = 1.0, v = 0.',
    'Write in README.md what you see for each dt.'],
    'python -m src.main','At dt 0.01 after 25 seconds the energy is about **0.643** and the bar sticks out past the white line. At dt 0.1 after 25 seconds it is about **6.1**, which is huge. At dt 0.001 it is about **0.513**, barely visible.','The energy multiplies by (1 plus dt squared) every step. Smaller steps help but never fully fix it.'),
  S('Add damping','Friction should drain energy.',[
    'Key **D** toggles {{c}} between 0 and 0.3. Pass {{c}} into {{step_euler}}.',
    'Watch the bar.'],
    'python -m src.main','With damping ON the bounce slowly dies. The energy bar shrinks toward zero. At dt 0.01 it falls below **0.05** in about **20 seconds**.'),
  S('Push the spring and find resonance','Pushing in rhythm makes the swing grow.',[
    'Key **F** toggles a driving force {{0.5 * math.sin(w * t)}}. Pass it as {{force}}. Keep damping ON at 0.3.',
    'Keys LEFT and RIGHT change {{w}} between 0.5 and 2.0 in steps of 0.05. Show {{w}} on screen.',
    'Measure the amplitude: the biggest {{abs(x)}} during the last 15 seconds. Show it on screen.',
    'Try w = 0.5, 1.0 and 2.0. Wait 30 seconds each time. Write the three amplitudes in README.md.'],
    'python -m src.main','Roughly: w = 0.5 gives amplitude about **0.65**. w = 1.0 gives about **1.7**, the biggest. w = 2.0 gives about **0.16**. The peak is at the natural speed w = 1 because the spring constant is 1 and the mass is 1.','This peak is called resonance. It is how a child on a swing learns to pump.'),
 ],
 done:['{{python -m pytest -q}} prints **4 passed**.','The spring bounces smoothly on screen.','At dt 0.01 the energy reads about 0.643 after 25 seconds.','Damping makes the bounce die.','Driving at w = 1.0 gives the biggest swing.','Everything is saved with git.'],
 stuck:[['The mass flies off the screen at once.','Check the sign: the acceleration must be {{-k * x}}, with the minus.'],['Energy stays exactly at 0.5.','You used the NEW x to compute the new v. Use the OLD one. That is the bug that is supposed to be there.'],['The window shows nothing moving.','You update {{x, v}} but draw with old variables. Draw with the current x.']]
};

GUIDES.s1p4 = {
 slug:'boids-flock', pip:['pygame','numpy'],
 files:[['src/__init__.py','empty file; lets Python import from src'],['src/boid.py','the Boid class'],['src/rules.py','neighbors, separation, alignment, cohesion'],['src/main.py','the pygame flock'],['tests/test_rules.py','checks for the three rules']],
 words:[['Boid','one simulated bird. It only knows what is near it'],['Separation','steer away from neighbors that are too close'],['Alignment','steer to match the direction of neighbors'],['Cohesion','steer toward the middle of the neighbors'],['Emergence','a big pattern that nobody programmed, appearing from small simple rules'],['Order score','a number from 0 to 1 that says how much the boids point the same way']],
 steps:[
  S('Write the checks for the three rules','Each rule is a tiny function. You can test each one with two or three boids placed by hand.',[
    'Open **tests/test_rules.py**.','Write the code below.','Run it. It fails.'],
    'python -m pytest -q tests/test_rules.py','A red **ImportError**.',null,
`import numpy as np
from src.boid import Boid
from src.rules import neighbors, separation, alignment, cohesion

def make(x, y, vx=0.0, vy=0.0):
    return Boid(np.array([x, y], dtype=float), np.array([vx, vy], dtype=float))

def test_neighbors():
    a = make(0, 0); b = make(30, 0); c = make(100, 0)
    assert neighbors(a, [a, b, c], 60) == [b]     # not itself, not the far one

def test_separation_pushes_away():
    me = make(0, 0); other = make(10, 0)
    s = separation(me, [other], 25)
    assert s[0] < 0 and abs(s[1]) < 1e-9

def test_separation_ignores_far_boids():
    me = make(0, 0); far = make(100, 0)
    assert np.allclose(separation(me, [far], 25), [0, 0])

def test_alignment_matches_neighbor_velocity():
    me = make(0, 0, 1, 0); n1 = make(5, 0, 0, 1); n2 = make(0, 5, 0, 1)
    assert np.allclose(alignment(me, [n1, n2]), [-1, 1])

def test_cohesion_points_to_the_center():
    me = make(0, 0); n1 = make(10, 0); n2 = make(10, 20)
    assert np.allclose(cohesion(me, [n1, n2]), [10, 10])

def test_no_neighbors_gives_zero():
    me = make(3, 4, 1, 1)
    assert np.allclose(alignment(me, []), [0, 0])
    assert np.allclose(cohesion(me, []), [0, 0])
    assert np.allclose(separation(me, [], 25), [0, 0])`),
  S('Write the Boid and the three rules','Plain vectors from numpy.',[
    'Open **src/boid.py**. Write {{class Boid}} with {{__init__(self, pos, vel)}} that stores both. They are numpy arrays like {{np.array([x, y])}}.',
    'Open **src/rules.py**. Write {{neighbors(boid, flock, radius)}}: a list of the OTHER boids whose distance is less than {{radius}}. Distance is {{np.linalg.norm(a.pos - b.pos)}}. Skip the boid itself.',
    'Write {{separation(boid, near, min_dist)}}: start with a zero vector {{np.zeros(2)}}. For every neighbor closer than {{min_dist}} add {{boid.pos - other.pos}}. Return the total.',
    'Write {{alignment(boid, near)}}: if {{near}} is empty return zeros. Otherwise return the average velocity of the neighbors minus {{boid.vel}}.',
    'Write {{cohesion(boid, near)}}: if empty return zeros. Otherwise return the average position of the neighbors minus {{boid.pos}}.',
    'The average of arrays: {{np.mean([n.vel for n in near], axis=0)}}.'],
    'python -m pytest -q tests/test_rules.py','**6 passed** in green.'),
  WIN('Boids Flock'),
  S('Draw one boid and make it fly','A triangle that points where it goes.',[
    'In **src/main.py** import numpy, random and your Boid and rules.',
    'Before the loop make a list {{flock}} with ONE boid: random position in the window, random direction, speed 3. Direction: {{angle = random.random() * 2 * math.pi}}, velocity {{3 * np.array([cos(angle), sin(angle)])}}.',
    'In UPDATE: {{boid.pos = boid.pos + boid.vel}}, then wrap around the screen edges with {{% WIDTH}} and {{% HEIGHT}}.',
    'In DRAW: a triangle. Let {{d}} be the velocity divided by its length (a unit arrow). Let {{p}} be {{(-d[1], d[0])}} (turned 90 degrees). The three corners are {{pos + 10 * d}}, {{pos - 6 * d + 4 * p}} and {{pos - 6 * d - 4 * p}}. Use {{pygame.draw.polygon}}.'],
    'python -m src.main','One small triangle flies across the window in a straight line, points in its direction of travel, and reappears on the opposite edge.'),
  S('Add 100 boids and turn the rules on ONE at a time','Prove each rule alone before mixing them.',[
    'Make 100 boids with random positions and directions.',
    'Create a dictionary {{weights}} with three entries: separation 0, alignment 0, cohesion 0. Set the constants {{RADIUS = 60}} and {{MIN_DIST = 22}}.',
    'In UPDATE, for each boid: {{near = neighbors(boid, flock, RADIUS)}}. Then {{steer = w_sep * separation(boid, near, MIN_DIST) + w_ali * alignment(boid, near) + w_coh * cohesion(boid, near)}}. Then {{boid.vel = boid.vel + steer}}.',
    'Limit the speed: if the length of {{vel}} is more than 4 scale it down to 4. If it is less than 2 scale it up to 2. Then move and wrap. Update all boids using the OLD positions: first compute every steer, THEN apply them.',
    'Keys: **1** means only separation, weight 0.05. **2** means only alignment, 0.05. **3** means only cohesion, 0.01. **4** means all three at once. Restart the boids when a key is pressed.',
    'Compute the order score every frame: {{u = each velocity divided by its length}}, then {{np.linalg.norm(np.mean(u, axis=0))}}. Show it on screen. Also show the average distance to the nearest neighbor.'],
    'python -m src.main','Key 1: boids spread out and never overlap. The nearest-neighbor distance rises to about **20 pixels or more**. Key 2: the order score climbs toward **1**. All arrows end up pointing the same way. Key 3: boids pull together into one or a few tight clumps.'),
  S('Turn all three rules on together','Now watch something nobody programmed.',[
    'Press **4**. The weights are separation 0.05, alignment 0.05, cohesion 0.01.',
    'Watch for 30 seconds.',
    'Try changing one weight at a time with the keys **Q/A** (separation), **W/S** (alignment), **E/D** (cohesion). Each press changes it by 0.005 up or down. Show the weights on screen.'],
    'python -m src.main','The order score starts around **0.1** and climbs to about **0.9** in roughly 15 seconds. The nearest-neighbor distance settles near **22 pixels**. Groups form, move together, merge and split. No boid knows about the flock.','If it freezes into a ball, cohesion is too strong. If it stays chaotic, alignment is too weak.'),
  S('Add edge steering and a predator (optional but fun)','Make it a game.',[
    'Click with the mouse to add a predator at that spot. Every boid within 100 pixels adds a strong push away from it: {{boid.pos - predator}} scaled to length 0.5.',
    'Draw the predator as a red circle that chases the nearest boid at speed 3.'],
    'python -m src.main','The flock splits around the predator and joins again behind it.'),
 ],
 done:['{{python -m pytest -q}} prints **6 passed**.','Separation alone keeps boids apart.','Alignment alone makes all arrows point the same way.','Cohesion alone pulls them into clumps.','All three together give a swirling flock with order score above 0.8.','You have several git saves, not just one.'],
 stuck:[['All boids end in one pixel.','Separation is too weak or MIN_DIST is too small. Try weight 0.05 and distance 22.'],['The flock never forms.','Alignment must be about as strong as separation. Check you subtract {{boid.vel}} in alignment.'],['The boids jitter.','You apply steering to some boids with already-updated positions. Compute all steers first.'],['The program is slow.','Compute {{neighbors}} once per boid per frame, not once per rule.']]
};

GUIDES.s1p5 = {
 slug:'particle-sandbox', pip:['pygame','numpy'],
 files:[['src/__init__.py','empty file; lets Python import from src'],['src/particle.py','Particle class and force functions'],['src/simulation.py','Simulation class holding many particles'],['src/main.py','pygame window'],['tests/test_particle.py','checks']],
 words:[['Class','a blueprint for making objects'],['Object','one thing made from a class, for example one Particle'],['Force','a push or pull. Force equals mass times acceleration'],['Shared state bug','two objects secretly using the same array, so changing one changes the other'],['Drag','a force opposite to the velocity']],
 steps:[
  S('Write the checks','One falling particle for one second must drop 4.9 meters.',[
    'Open **tests/test_particle.py**. Write the code below. Run it. It fails.'],
    'python -m pytest -q tests/test_particle.py','A red **ImportError**.','Free fall: distance equals half g times t squared. Half of 9.8 times 1 times 1 is 4.9. The minus sign means downward.',
`import numpy as np
from pytest import approx
from src.particle import Particle, gravity, make_drag
from src.simulation import Simulation

def test_free_fall_one_second():
    p = Particle([0.0, 0.0], [0.0, 0.0], 1.0)
    for _ in range(1000):
        p.step(0.001, [gravity])
    assert p.pos[1] == approx(-4.9, abs=0.01)
    assert p.pos[0] == approx(0.0)

def test_drag_slows_a_moving_particle():
    p = Particle([0.0, 0.0], [10.0, 0.0], 1.0)
    p.step(0.1, [make_drag(1.0)])
    assert 0 < p.vel[0] < 10

def test_no_shared_state():
    sim = Simulation(50)
    ids = {id(p.pos) for p in sim.particles} | {id(p.vel) for p in sim.particles}
    assert len(ids) == 100          # 50 positions and 50 velocities, all different objects

def test_simulation_counts():
    assert len(Simulation(50).particles) == 50`),
  S('Write Particle, the forces and Simulation','Three small pieces.',[
    'Open **src/particle.py**. Write {{class Particle}} with {{__init__(self, pos, vel, mass)}}. Store {{self.pos = np.array(pos, dtype=float)}} and {{self.vel = np.array(vel, dtype=float)}}. The {{np.array(...)}} makes a NEW array each time. That is what prevents the shared state bug.',
    'Add {{step(self, dt, forces)}}: start with {{total = np.zeros(2)}}. For every {{f}} in {{forces}} add {{f(self)}}. Then {{self.vel = self.vel + total / self.mass * dt}} and THEN {{self.pos = self.pos + self.vel * dt}}.',
    'Write {{gravity(p)}} that returns {{np.array([0.0, -9.8 * p.mass])}}.',
    'Write {{make_drag(k)}} that returns an inner function {{drag(p)}} returning {{-k * p.vel}}. A function that makes functions is fine.',
    'Open **src/simulation.py**. Write {{class Simulation}} with {{__init__(self, n)}}. Make a list {{self.particles}} of {{n}} particles with random positions: x and y each in -10 to 10, random velocities in -5 to 5, mass 1.',
    'Add {{step(self, dt, forces)}} that steps every particle.',
    'Random numbers: {{random.uniform(-10, 10)}}.'],
    'python -m pytest -q tests/test_particle.py','**4 passed** in green.'),
  WIN('Particle Sandbox'),
  S('Draw 50 particles falling','Your first real sandbox.',[
    'In **src/main.py** import {{Simulation}}, {{gravity}}, {{make_drag}}.',
    'Make {{sim = Simulation(50)}}, {{forces = [gravity, make_drag(0.3)]}}, {{dt = 0.01}}, {{t = 0.0}}.',
    'Screen mapping: 6 pixels per meter, with world x = 0 at screen x = 500 and world y = 0 at screen y = 150. So {{sx = 500 + x * 6}} and {{sy = 150 - y * 6}}.',
    'UPDATE: {{sim.step(dt, forces)}} twice per frame. Add dt to t. When {{t > 6}}, make a new {{Simulation(50)}} and set {{t = 0}}.',
    'DRAW: every particle as a circle of radius 4 in its own random color. Store the color on the particle when you create it (add a {{color}} attribute).',
    'Keys: **D** toggles drag between 0 and 0.3. **R** restarts. **G** toggles gravity.'],
    'python -m src.main','Fifty colored dots start in a cloud near the top, spread out with their random speeds, and fall. With drag on they slow down and drift. When the 6 seconds are over, a fresh cloud appears.'),
  S('Prove the particles are independent','The most common bug hides in plain sight.',[
    'Turn gravity OFF and drag OFF. Run.',
    'Every dot must move in a straight line at its OWN speed. No two dots move together.',
    'Add one more check to the test file: change one particle position and check that no other particle changed.',
    'Write it like this: make a Simulation, copy all positions into a list of tuples, add 100 to {{sim.particles[0].pos[0]}}, then assert that particles 1 to 49 have the same positions as before.'],
    'python -m pytest -q','**5 passed**. In the window all dots fly straight and independently.'),
 ],
 done:['{{python -m pytest -q}} prints **5 passed**.','The free-fall check gives -4.9 within 0.01.','Fifty particles fall and spread out on screen.','Drag makes them slow down.','Gravity and drag toggles work.','Everything is saved with git.'],
 stuck:[['All particles move in lockstep.','Shared state. Make sure every Particle calls {{np.array(...)}} on its own inputs.'],['The test says drag made the speed negative.','Drag at k = 1 with dt = 0.1 should give a factor of 0.9. Check you multiply by dt.'],['Dots all start at the same place.','You called {{random.uniform}} once and reused it. Call it for every particle.']]
};

GUIDES.s2p1 = {
 slug:'matrix-solver', pip:['pygame','numpy'],
 files:[['src/__init__.py','empty file; lets Python import from src'],['src/solver.py','Gaussian elimination, pivoting, LU, step generator'],['src/main.py','pygame window: the matrix solving itself'],['tests/test_solver.py','checks for solver.py']],
 words:[['System of equations','several equations that must all be true at once'],['Matrix','a grid of numbers'],['Gaussian elimination','subtracting multiples of one row from the others to make zeros below the diagonal, then solving from the bottom up'],['Pivot','the number on the diagonal you divide by'],['Partial pivoting','swapping rows so the pivot is the biggest number available'],['LU decomposition','splitting a matrix into L (lower triangle) times U (upper triangle)'],['Condition number','how much a matrix magnifies tiny errors. Huge means trouble']],
 steps:[
  S('Write the checks','Four checks, including one that the naive method must FAIL.',[
    'Open **tests/test_solver.py**. Write the code below. Run it. It fails.'],
    'python -m pytest -q tests/test_solver.py','A red **ImportError**.','The test with 1e-20 shows why programmers swap rows. Dividing by a tiny number destroys the answer.',
`import numpy as np
from pytest import approx
from src.solver import gaussian_eliminate, gaussian_pivoted, lu_decompose

def test_easy_system():
    A = [[2.0, 1.0], [1.0, 3.0]]; b = [3.0, 5.0]
    assert gaussian_eliminate(A, b) == approx([0.8, 1.4])
    assert gaussian_pivoted(A, b) == approx([0.8, 1.4])

def test_pivoting_is_needed():
    A = [[1e-20, 1.0], [1.0, 1.0]]; b = [1.0, 2.0]
    bad = gaussian_eliminate(A, b)
    good = gaussian_pivoted(A, b)
    assert abs(bad[0] - 1.0) > 0.5            # the naive answer is badly wrong
    assert good == approx([1.0, 1.0], abs=1e-6)

def test_lu():
    A = [[2.0, 1.0], [1.0, 3.0]]
    L, U = lu_decompose(A)
    assert np.allclose(np.array(L) @ np.array(U), A)
    assert L[0][0] == 1 and U[1][0] == 0

def test_hilbert_8():
    n = 8
    H = [[1 / (i + j + 1) for j in range(n)] for i in range(n)]
    b = [sum(row) for row in H]               # so the true answer is all ones
    x = gaussian_pivoted(H, b)
    assert np.allclose(x, 1.0, atol=1e-5)
    assert abs(np.linalg.cond(np.array(H)) - 1.526e10) < 1e8`),
  S('Write the naive solver','Forward elimination, then back substitution.',[
    'Open **src/solver.py**. Use plain Python lists of lists, not numpy.',
    'Write {{gaussian_eliminate(A, b)}}. First make copies so you do not change the inputs: {{M = [row[:] + [bi] for row, bi in zip(A, b)]}}. Each row now ends with its right-hand side.',
    'FORWARD: for each column {{c}} from 0 to n-2, for each row {{r}} below {{c}}: {{factor = M[r][c] / M[c][c]}} and then for every column {{k}} from {{c}} to {{n}}: {{M[r][k] -= factor * M[c][k]}}.',
    'BACK: make {{x = [0.0] * n}}. Go from the last row up to the first. {{x[r] = (M[r][n] - sum of M[r][k] * x[k] for k to the right of r) / M[r][r]}}.',
    'Return {{x}}.'],
    'python -m pytest -q tests/test_solver.py','2 passed and 3 failing. The first check, {{test_easy_system}}, passes the naive half. That is fine.'),
  S('Write the pivoted solver and LU','Swap rows before dividing.',[
    'Write {{gaussian_pivoted(A, b)}}: the same as the naive one, with one extra step at the start of each column {{c}}. Find the row {{p}} from {{c}} down with the biggest {{abs(M[p][c])}}. If {{p != c}} swap the two rows: {{M[c], M[p] = M[p], M[c]}}.',
    'Write {{lu_decompose(A)}}. Start {{L}} as the identity matrix (1 on the diagonal, 0 elsewhere) and {{U}} as a copy of {{A}}. Do the same forward elimination, but store each {{factor}} into {{L[r][c]}}. Return {{(L, U)}}.'],
    'python -m pytest -q tests/test_solver.py','**4 passed** in green.','If the Hilbert test fails by a tiny amount, make sure the pivot choice uses the absolute value.'),
  S('Make a step-by-step version for the screen','The screen needs every single row operation.',[
    'Write a generator {{elimination_steps(A, b)}} in **src/solver.py**. It follows the pivoted method. Before each row operation do {{yield (copy of M, "R2 = R2 - 0.5 * R1")}}. A generator gives back one result at a time with {{yield}}.',
    'Also yield once at the very start with the message {{"start"}}, and once per row swap with a message like {{"swap R1 and R2"}}.',
    'Copy the matrix with {{[row[:] for row in M]}} so later changes do not alter earlier snapshots.'],
    `python -c "from src.solver import elimination_steps as e; s = list(e([[2.0,1.0],[1.0,3.0]], [3.0,5.0])); print(len(s)); print(s[0][1]); print(s[-1][1])"`,'A number of at least **2**, then **start**, then a message that starts with **R2 =**.'),
  WIN('Matrix Solver'),
  S('Draw the matrix as colored tiles','Numbers become colors.',[
    'In **src/main.py** import {{elimination_steps}}. Choose a 4 by 4 matrix with a right-hand side: A = {{[[2,1,1,0],[4,3,3,1],[8,7,9,5],[6,7,9,8]]}} and b = {{[1,2,3,4]}}.',
    'Make {{steps = list(elimination_steps(A, b))}} and {{i = 0}}.',
    'Tile size 90 pixels. Matrix top-left at (60, 80). Five columns (the last one is b). For each cell draw a rectangle. Color rule: zero (smaller than 1e-9) is dark gray. Positive is teal, brighter for bigger values. Negative is orange. Write the number inside with {{f"{v:.2f}"}}.',
    'Write the message of the current step at the top.',
    'Keys: RIGHT goes to the next step, LEFT goes back, R restarts.'],
    'python -m src.main','The matrix appears. Each RIGHT press does ONE row operation. The cells below the diagonal turn dark gray one by one, column by column. At the end the matrix is triangular.'),
  S('Show the solution and the naive failure','Make the bug visible.',[
    'After the last step, compute the solution with {{gaussian_pivoted}} and show it as text under the grid.',
    'Press the key **F** to switch to the failure matrix {{[[1e-20, 1], [1, 1]]}} with {{b = [1, 2]}}. Show BOTH the naive answer and the pivoted answer as text.',
    'Press **H** to load the 8 by 8 Hilbert matrix and show the condition number from {{numpy.linalg.cond}} and the largest error of your pivoted solution against all ones.'],
    'python -m src.main','The failure matrix shows the naive answer **x = 0.0** (wrong) and the pivoted answer **x = 1.0, y = 1.0**. The Hilbert screen shows a condition number of about **1.5e10** and an error around **1e-7**.'),
 ],
 done:['{{python -m pytest -q}} prints **4 passed**.','The step viewer zeroes cells below the diagonal one by one.','The failure matrix shows 0.0 from the naive solver and 1.0 from the pivoted one.','The Hilbert screen shows condition number about 1.5e10.','Everything is saved with git.'],
 stuck:[['**ZeroDivisionError** in the naive solver.','A pivot became exactly zero. That is the problem pivoting solves.'],['The step viewer shows no change.','You yielded the same list object. Yield a COPY.'],['LU check fails.','Put 1s on the diagonal of L before filling the factors in.']]
};

GUIDES.s2p2 = {
 slug:'monte-carlo-darts', pip:['pygame','numpy'],
 files:[['src/__init__.py','empty file; lets Python import from src'],['src/mc.py','pi_estimate, integrate'],['src/main.py','pygame window: darts landing'],['tests/test_mc.py','checks']],
 words:[['Random sample','a number picked by chance'],['Seed','a starting number that makes the random numbers repeat the same way every time'],['Monte Carlo method','using lots of random tries to estimate something'],['Convergence','estimates getting closer to the truth as you add data'],['Confidence interval','a range that probably contains the truth. Here: mean plus or minus 1.96 times std divided by the square root of N']],
 steps:[
  S('Write the checks','You know pi, and you know the integral of x squared from 0 to 1 is one third.',[
    'Open **tests/test_mc.py**. Write the code below. Run it. It fails.'],
    'python -m pytest -q tests/test_mc.py','A red **ImportError**.',null,
`import math
from pytest import approx
from src.mc import pi_estimate, integrate

def test_pi():
    assert abs(pi_estimate(1_000_000, seed=1) - math.pi) < 0.01

def test_error_shrinks_like_one_over_root_n():
    def mean_error(n):
        return sum(abs(pi_estimate(n, seed=s) - math.pi) for s in range(30)) / 30
    ratio = mean_error(100) / mean_error(10_000)
    assert 5 < ratio < 20          # 100 times more darts should give about 10 times less error

def test_integral_of_x_squared():
    est, half = integrate(lambda x: x * x, 0.0, 1.0, 1_000_000, seed=1)
    assert est == approx(1 / 3, abs=0.002)
    assert 0.0005 < half < 0.0007  # the 95 percent half-width is about 0.00058`),
  S('Write the functions','Random darts and random samples.',[
    'Open **src/mc.py**. {{import numpy as np}}.',
    'Write {{pi_estimate(n, seed=None)}}. Make a random generator {{rng = np.random.default_rng(seed)}}. Make {{n}} points: {{pts = rng.random((n, 2)) * 2 - 1}} gives x and y between -1 and 1. A point is inside the circle if {{x*x + y*y <= 1}}. Compute {{inside = np.sum(pts[:, 0]**2 + pts[:, 1]**2 <= 1)}}. The answer is {{4 * inside / n}}.',
    'Write {{integrate(f, a, b, n, seed=None)}}. Pick {{n}} random x values between a and b. Compute {{y = f(x)}} for them. The estimate is {{(b - a) * mean(y)}}. The half-width of the confidence interval is {{1.96 * (b - a) * std(y) / sqrt(n)}}. Return {{(estimate, half_width)}}.',
    'The function {{f}} receives a whole numpy array. {{lambda x: x * x}} works on arrays.'],
    'python -m pytest -q tests/test_mc.py','**3 passed** in green.'),
  S('Print the error table','See the one-over-root-N rule with numbers.',[
    'Make **table.py** in the project root. For N = 100, 10 thousand and 1 million, print the average absolute error of {{pi_estimate}} over 20 seeds.'],
    'python table.py','About **0.13**, **0.013** and **0.0013**. Every 100 times more darts gives 10 times less error.','Write that sentence in README.md.'),
  WIN('Monte Carlo Darts'),
  S('Throw darts live','Watch pi appear out of randomness.',[
    'In **src/main.py** draw a square of 600 by 600 pixels with its top left at (50, 0) and a circle inside it with radius 300 and center (350, 300).',
    'Keep two counters {{inside}} and {{total}}. Keep a list {{dots}} of the last 20000 darts as (x, y, inside_flag).',
    'Each frame throw {{per_frame}} darts (start with 50). A dart is {{x = random.uniform(-1, 1)}}, {{y = random.uniform(-1, 1)}}. It is inside if {{x*x + y*y <= 1}}. Convert to screen with {{350 + x * 300}} and {{300 - y * 300}}.',
    'Draw each dot as a single pixel or radius-1 circle: green inside, orange outside.',
    'Show on screen: darts thrown, the estimate {{4 * inside / total}} and the error {{abs(estimate - math.pi)}}.',
    'Keys: UP doubles the darts per frame (up to 5000), DOWN halves them, R restarts.'],
    'python -m src.main','Darts rain in. The green area makes a circle. After 1000 darts the estimate is typically **3.1 plus or minus 0.1**. After 100 thousand it is **3.14 plus or minus 0.01**. The error number visibly shrinks but never reaches zero.','Drawing 20000 dots every frame is slow. Draw onto a separate surface once and blit that surface each frame.'),
  S('Estimate a hard integral','Where Monte Carlo is useful.',[
    'In **table.py** (or a new file) estimate the integral of {{sin(x) / x}} from 0 to pi with {{integrate}} using 1 million samples. Use {{np.sinc(x / np.pi)}} as the function. It equals sin(x)/x and handles x = 0.',
    'Print the estimate and the 95 percent half-width.'],
    'python table.py','An estimate close to **1.852** (the exact answer is 1.8519) with a half-width near **0.0008**.'),
 ],
 done:['{{python -m pytest -q}} prints **3 passed**.','The error table shows 0.13, 0.013, 0.0013.','Live darts form a green circle and the estimate settles near 3.14.','The sin(x)/x estimate is near 1.852.','Everything is saved with git.'],
 stuck:[['The ratio test fails.','Check you use {{seed=s}} for each of the 30 runs so the runs differ.'],['The window is slow.','Draw dots to a persistent surface. Do not redraw them all.'],['The estimate is about 0.78.','You forgot to multiply by 4.']]
};

GUIDES.s2p3 = {
 slug:'curve-fitting-live', pip:['pygame','numpy','requests'],
 files:[['src/__init__.py','empty file; lets Python import from src'],['src/solver.py','COPIED from matrix-solver'],['src/fit.py','polynomial fit with the normal equations'],['src/data.py','downloads CO2 data'],['src/main.py','pygame window'],['tests/test_fit.py','checks'],['data/','downloaded numbers go here']],
 words:[['Polynomial','a sum of powers of x, like a + b x + c x squared'],['Degree','the highest power. Degree 1 is a straight line'],['Normal equations','a recipe that turns curve fitting into one linear system'],['RMSE','root mean squared error: the typical size of the misses'],['Overfitting','a curve that matches old dots perfectly but predicts new ones badly'],['Held-out data','dots you hide from the fit so you can test it honestly']],
 steps:[
  S('Copy your solver and write the checks','You built the solver already. Reuse it.',[
    'Copy **solver.py** from the matrix-solver project into this one. On Mac or Linux run the first command. On Windows run the second.',
    'Open **tests/test_fit.py**. Write the code below. Run it. It fails.'],
    'cp ../matrix-solver/src/solver.py src/solver.py\n# Windows instead:\nCopy-Item ..\\matrix-solver\\src\\solver.py src\\solver.py\npython -m pytest -q tests/test_fit.py','A red **ImportError** about {{src.fit}}.','Coefficients are listed lowest power first. So [5, 2] means 5 + 2x.',
`from pytest import approx
from src.fit import polyfit, polyval, rmse

X = [0, 1, 2, 3, 4, 5]

def test_line():
    c = polyfit(X, [2 * x + 5 for x in X], 1)
    assert c == approx([5.0, 2.0])

def test_parabola():
    c = polyfit(X, [x * x - 3 * x + 2 for x in X], 2)
    assert c == approx([2.0, -3.0, 1.0])

def test_polyval_and_rmse():
    assert polyval([5.0, 2.0], 3) == approx(11.0)
    assert rmse([1, 2, 3], [1, 2, 6]) == approx(3 / 3 ** 0.5)`),
  S('Write the fit','The normal equations in four lines.',[
    'Open **src/fit.py**. Import {{gaussian_pivoted}} from your solver.',
    'Write {{polyfit(xs, ys, degree)}}. Build the matrix {{V}}: one row per x, with the entries {{1, x, x**2, ..., x**degree}}.',
    'Compute {{VTV = V transposed times V}} and {{VTy = V transposed times y}}. Do it with loops or with numpy ({{np.array(V).T @ np.array(V)}}). Convert to lists for your solver with {{.tolist()}}.',
    'The answer is {{gaussian_pivoted(VTV, VTy)}}. These are the coefficients, lowest power first.',
    'Write {{polyval(coeffs, x)}}: the sum of {{c * x**i}}.',
    'Write {{rmse(actual, predicted)}}: the square root of the mean of the squared differences.'],
    'python -m pytest -q tests/test_fit.py','**3 passed** in green.'),
  S('Download real CO2 emissions','A real country over many years.',[
    'Open **src/data.py**. Write {{get_co2(country)}}.',
    'Download this file with {{requests.get(url).text}}: {{https://raw.githubusercontent.com/owid/co2-data/master/owid-co2-data.csv}}. It is a big table. Read it with the {{csv}} module: {{csv.DictReader(text.splitlines())}}.',
    'Keep rows where {{row["country"] == country}} and {{row["co2"]}} is not empty. Return a list of {{(int(row["year"]), float(row["co2"]))}} pairs. The CO2 is in million tonnes.',
    'Cache the result in **data/** so you download once.'],
    `python -c "from src.data import get_co2; d = get_co2('Kenya'); print(len(d), d[0], d[-1])"`,'About **70 to 75** pairs, for example **(1950, 0.4...)** at the start and **(2022, 18...)** at the end. Emissions rise over time.','If the list is empty, check the country spelling. The file uses names like Kenya and South Africa.'),
  WIN('Curve Fitting Live'),
  S('Show the dots and fit a curve','Hide the last 20 percent of years. Fit only the first 80 percent.',[
    'In **src/main.py** load the data. Turn the year into a small number: {{t = (year - 1950) / 10}}. This keeps the maths stable.',
    'Split: the first {{int(0.8 * n)}} points are TRAIN, the rest are TEST.',
    'Map t and co2 to the screen. Draw TRAIN dots white and TEST dots yellow.',
    'Keep {{degree = 1}}. Compute {{coeffs = polyfit(train_t, train_y, degree)}}. Draw the curve as a line: for 200 values of t across the whole range, compute {{polyval}} and join them with {{pygame.draw.lines}}.',
    'Keys 1 to 8 set the degree and refit instantly.',
    'Show the TRAIN RMSE and the TEST RMSE as text.'],
    'python -m src.main','Degree 1 is a straight line through the dots. As you press 2, 3, 4... the curve bends. The **train RMSE only goes DOWN** as the degree goes up. The **test RMSE goes down at first and then goes UP**, and by degree 7 or 8 the curve whips wildly near the edges.','The big message: a curve that fits the past perfectly can be useless for the future.'),
  S('Pick the honest winner','Test error decides, not train error.',[
    'Print a table of degrees 1 to 8 with train RMSE and test RMSE.',
    'In README.md write: the degree with the smallest TEST RMSE, and one sentence about why more wiggles are not better.'],
    null,'A table where the train column always shrinks and the test column has a smallest value at a low degree such as 1, 2 or 3.'),
 ],
 done:['{{python -m pytest -q}} prints **3 passed**.','The live window shows train dots white and test dots yellow.','Train RMSE always falls as degree rises.','Test RMSE does NOT always fall.','README.md names the best degree by test error.','Everything is saved with git.'],
 stuck:[['The fit gives nonsense at high degrees.','You are using the raw year like 1990. Use the small number {{(year - 1950) / 10}}.'],['**ZeroDivisionError** in the solver.','Too many degrees for too few points. Use at most degree 8.'],['Copy command fails.','Run it from inside this project, and make sure the other project is named **matrix-solver**.']]
};

GUIDES.s2p4 = {
 slug:'weather-swarm', pip:['pygame','numpy','requests'],
 files:[['src/__init__.py','empty file; lets Python import from src'],['src/markov.py','transition matrix, stationary distribution'],['src/nasa.py','COPIED from converging-average'],['src/main.py','pygame swarm of walkers'],['tests/test_markov.py','checks'],['data/','downloaded weather goes here']],
 words:[['State','a situation you can be in. Here: Dry, Light or Heavy rain'],['Transition matrix','a table: row = today, column = tomorrow, entry = chance'],['Markov chain','tomorrow depends only on today'],['Stationary distribution','the long-run share of days in each state'],['Eigenvector','a direction a matrix only stretches. The stationary distribution is one'],['Dry spell','a run of dry days in a row']],
 steps:[
  S('Copy the weather downloader and write the checks','A tiny two-state weather you can solve by hand.',[
    'Copy **nasa.py** from converging-average. Mac or Linux first command. Windows second.',
    'Open **tests/test_markov.py**. Write the code below. Run it. It fails.'],
    'cp ../converging-average/src/nasa.py src/nasa.py\n# Windows instead:\nCopy-Item ..\\converging-average\\src\\nasa.py src\\nasa.py\npython -m pytest -q tests/test_markov.py','A red **ImportError** about {{src.markov}}.','For P = [[0.9, 0.1], [0.5, 0.5]] solve by hand: the long-run chance of the first state is 5/6 and of the second is 1/6.',
`import numpy as np
from pytest import approx
from src.markov import classify, transition_matrix, stationary_eig, simulate, mean_dry_spell

P = np.array([[0.9, 0.1], [0.5, 0.5]])

def test_classify():
    assert classify(0.0) == 0      # dry:   less than 1 mm
    assert classify(0.99) == 0
    assert classify(1.0) == 1      # light: 1 to 10 mm
    assert classify(10.0) == 1
    assert classify(10.1) == 2     # heavy: more than 10 mm

def test_transition_matrix_counts():
    M = transition_matrix([0, 0, 1, 0, 1, 1], 2)
    assert np.allclose(M, [[1 / 3, 2 / 3], [1 / 2, 1 / 2]])

def test_stationary_by_eigenvector():
    assert stationary_eig(P) == approx([5 / 6, 1 / 6])

def test_stationary_by_simulation():
    path = simulate(P, 200_000, seed=1)
    share = [path.count(0) / len(path), path.count(1) / len(path)]
    assert share == approx([5 / 6, 1 / 6], abs=0.01)

def test_dry_spells():
    assert mean_dry_spell([0, 0, 1, 0, 0, 0, 2, 0]) == approx((2 + 3 + 1) / 3)`),
  S('Write the chain code','Five short functions.',[
    'Open **src/markov.py**.',
    'Write {{classify(mm)}}: 0 if {{mm < 1}}, 1 if {{mm <= 10}}, otherwise 2.',
    'Write {{transition_matrix(states, n)}}. Make an {{n}} by {{n}} grid of zeros. For every neighbouring pair {{(a, b)}} in the list add 1 to {{counts[a][b]}}. Divide every row by its sum.',
    'Write {{stationary_eig(P)}}. Use {{vals, vecs = np.linalg.eig(P.T)}}. Take the column whose value is closest to 1. Divide it by its sum so it adds to 1. Take the real part with {{.real}}.',
    'Write {{simulate(P, steps, seed=None, start=0)}}. Start in {{start}}. For each step choose the next state with {{rng.choice(len(P), p=P[state])}}. Return the list of visited states (as plain Python ints).',
    'Write {{mean_dry_spell(states)}}: the average length of runs of state 0. In [0,0,1,0,0,0,2,0] the runs are 2, 3 and 1.'],
    'python -m pytest -q tests/test_markov.py','**5 passed** in green.'),
  WIN('Weather Swarm'),
  S('Make a swarm of 300 walkers on a three-zone map','Each blob is one possible future.',[
    'In **src/main.py** make three zones: Dry (blue), Light (green), Heavy (purple). Each is a big circle of radius 130 centered at (200, 330), (500, 330) and (800, 330).',
    'Use the toy matrix for now: {{P = np.array([[0.8, 0.15, 0.05], [0.4, 0.4, 0.2], [0.3, 0.4, 0.3]])}}.',
    'Make 300 walkers. Each has a state (start all in state 0) and a screen position near its zone center.',
    'Every 6 frames, move every walker to a new state chosen with {{P[state]}} and glide it to a random spot inside the new zone: each frame move 10 percent of the way toward its target.',
    'Draw each walker as a circle of radius 4 in its zone color.',
    'Under each zone show how many walkers are inside and the share as a percentage.'],
    'python -m src.main','The crowd starts all in the blue zone and spreads out. After about 20 jumps the three shares stop changing much. They match {{stationary_eig(P)}}. For this toy matrix that is about **0.58, 0.28, 0.14**.'),
  S('Compare the crowd with the exact answer','The crowd is a measuring device.',[
    'Draw a thin horizontal tick above each zone at the exact stationary share ({{stationary_eig(P)}}).',
    'Show the biggest gap between the crowd share and the exact share in the corner.'],
    'python -m src.main','After 100 jumps the gap is below **0.05**. It never reaches zero because the walkers are random.'),
  S('Use REAL rainfall','Replace the toy matrix with your own.',[
    'Download daily rainfall with {{fetch_daily}} for a place and at least 5 years, for example Kigali from 20190101 to 20231231. Use the {{PRECTOTCORR}} list.',
    'Turn it into states with {{classify}} and build {{P = transition_matrix(states, 3)}}.',
    'Print {{P}}, the exact stationary shares, and the mean dry spell of the real data.',
    'Simulate 10 years of fake weather with {{simulate(P, 3650, seed=1)}}. Print its mean dry spell.',
    'Run the swarm with your real matrix.',
    'Write the two dry-spell numbers and the stationary shares in README.md.'],
    'python -m src.main','Rows of P add to 1. Dry days usually follow dry days (the top-left number is the biggest). The real and the fake mean dry spells are within about **20 percent** of each other.'),
 ],
 done:['{{python -m pytest -q}} prints **5 passed**.','The swarm settles to the exact shares within 0.05.','You built a matrix from real rainfall.','You compared real and simulated dry spells in README.md.','Everything is saved with git.'],
 stuck:[['The rows of the matrix do not add to 1.','You forgot to divide each row by its sum. Skip rows with a zero sum.'],['**eig** returns complex numbers.','Take {{.real}} of the vector. The imaginary part should be zero.'],['All walkers jump at once and look jumpy.','Glide: move only 10 percent toward the target each frame.']]
};

GUIDES.s2p5 = {
 slug:'town-network', pip:['pygame','numpy','requests'],
 files:[['src/__init__.py','empty file; lets Python import from src'],['src/graph.py','adjacency matrix, power iteration, centralities'],['src/towns.py','downloads real towns'],['src/main.py','pygame: the network and the crowd'],['tests/test_graph.py','checks'],['data/','downloaded towns go here']],
 words:[['Graph','dots (nodes) joined by lines (edges)'],['Adjacency matrix','a grid with a 1 where two nodes are joined and a 0 where they are not'],['Degree centrality','how many neighbors a node has'],['Eigenvector centrality','a node is important if it is joined to important nodes'],['Power iteration','multiply a vector by the matrix again and again, and shrink it each time. It settles on the eigenvector'],['Random walker','something that hops from a node to a random neighbor']],
 steps:[
  S('Write the checks on a four-town map','You can see the answer in a drawing.',[
    'Draw on paper: towns A, B, C, D. A-B, A-C, B-C and C-D are roads. C has three roads. D has one.',
    'Open **tests/test_graph.py**. Write the code below. Run it. It fails.'],
    'python -m pytest -q tests/test_graph.py','A red **ImportError**.','Eigenvector centrality, scaled so the biggest is 1, is A = 0.855, B = 0.855, C = 1.0, D = 0.461.',
`import numpy as np
from pytest import approx
from src.graph import degree, power_iteration, walker_visits

A = np.array([[0, 1, 1, 0],
              [1, 0, 1, 0],
              [1, 1, 0, 1],
              [0, 0, 1, 0]], dtype=float)

def test_degree():
    assert list(degree(A)) == [2, 2, 3, 1]

def test_power_iteration_matches_numpy():
    v = power_iteration(A)
    vals, vecs = np.linalg.eigh(A)
    best = np.abs(vecs[:, -1])
    assert v / v.max() == approx(best / best.max(), abs=1e-6)
    assert v / v.max() == approx([0.855, 0.855, 1.0, 0.461], abs=0.001)

def test_walkers_follow_degree_not_eigenvector():
    share = walker_visits(A, 200_000, seed=1)
    assert share == approx(degree(A) / degree(A).sum(), abs=0.01)`),
  S('Write the graph functions','Three short functions.',[
    'Open **src/graph.py**.',
    'Write {{degree(A)}}: the sum of each row, {{A.sum(axis=1)}}.',
    'Write {{power_iteration(A, steps=200)}}: start {{v = np.ones(len(A))}}. Repeat {{steps}} times: {{v = A @ v}} and then {{v = v / np.linalg.norm(v)}}. Return {{v}}.',
    'Write {{walker_visits(A, steps, seed=None)}}: one walker starts at node 0. Each step it moves to a random neighbor: {{rng.choice(np.flatnonzero(A[node]))}}. Count the visits to each node. Return the counts divided by their total.'],
    'python -m pytest -q tests/test_graph.py','**3 passed** in green.','The third check holds a surprise: a single random walker spends time in proportion to DEGREE, not eigenvector centrality. Remember that for the screen.'),
  S('Download real towns','Real cities of Kenya from the GeoNames list.',[
    'Open **src/towns.py**. Write {{get_towns(country_code, how_many)}}.',
    'Download {{https://download.geonames.org/export/dump/cities15000.zip}} with {{requests.get(url).content}}. Open it with {{zipfile.ZipFile(io.BytesIO(content))}} and read the file {{cities15000.txt}}.',
    'Every line is text with columns separated by tabs. Split with {{line.split("\\t")}}. Column 1 is the name, column 4 the latitude, column 5 the longitude, column 8 the country code, column 14 the population.',
    'Keep lines whose country code matches (for example {{"KE"}}). Sort by population, biggest first. Keep the first {{how_many}}. Return a list of {{(name, lat, lon, population)}}.',
    'Cache the unzipped lines in **data/** so you download once.'],
    `python -c "from src.towns import get_towns; t = get_towns('KE', 60); print(len(t), t[0])"`,'**60** and a first entry that starts with **Nairobi**.'),
  S('Join each town to its three nearest towns','Make the graph.',[
    'In **src/graph.py** write {{knn_adjacency(towns, k=3)}}.',
    'For every town find the {{k}} closest towns by plain distance on (lon, lat). Set {{A[i][j] = 1}} and {{A[j][i] = 1}}. The matrix must be symmetric.',
    'The diagonal stays 0.',
    'Add a check: {{np.allclose(A, A.T)}} and every row sums to at least 3.'],
    `python -c "from src.towns import get_towns; from src.graph import knn_adjacency; A = knn_adjacency(get_towns('KE', 60)); print(A.shape, A.sum(axis=1).min(), A.sum(axis=1).max())"`,'**(60, 60)**, a minimum of **at least 3**, and a maximum that is larger, maybe **7 to 12**.'),
  WIN('Town Network'),
  S('Draw the network','Towns as dots, roads as lines.',[
    'In **src/main.py** load the towns and the matrix. Map longitude to screen x between 60 and 940 and latitude to screen y between 560 and 60 (flip it).',
    'Draw every edge as a thin gray line, then every town as a circle of radius 5.',
    'Draw the name of the three biggest towns.'],
    'python -m src.main','A map of Kenya as dots joined by short lines. Nairobi and Mombasa are labelled.'),
  S('Two kinds of walkers','Discover that importance depends on how you measure it.',[
    'Mode 1 (key **M**): RANDOM WALKERS. Put 500 walkers on random towns. Every 10 frames each moves to a random neighbor. Count visits. Make each town circle grow with its visit count.',
    'Mode 2 (same key): MULTIPLYING SWARM. Each town holds a number {{c}}. Each press of SPACE does {{c = A @ c}} then {{c = c / c.max()}}. This is power iteration! Make each circle radius {{4 + 22 * c}}.',
    'Show which mode is on and the top three towns by size.',
    'In README.md write: which towns lead in each mode, and why they differ.'],
    'python -m src.main','Mode 1: the biggest circles belong to towns with MANY links (high degree). Mode 2: after about 20 presses of SPACE the sizes stop changing. The largest circles are towns joined to OTHER well-joined towns. The two top-three lists often differ.','Random walkers measure degree. A swarm that multiplies along every edge measures eigenvector centrality. That is the real lesson.'),
 ],
 done:['{{python -m pytest -q}} prints **3 passed**.','Your power iteration matches numpy.','You drew a real network of 60 Kenyan towns.','You watched both modes and wrote why they differ.','Everything is saved with git.'],
 stuck:[['The test says shapes do not match.','Return a flat 1-D array from {{power_iteration}}.'],['Towns do not show.','Longitude goes to x, latitude to y, and y must be flipped.'],['Power iteration oscillates.','Your matrix is not symmetric or not connected. Check {{np.allclose(A, A.T)}}.']]
};

GUIDES.s3p1 = {
 slug:'integrator-race', pip:['pygame','numpy'],
 files:[['src/__init__.py','empty file; lets Python import from src'],['src/solvers.py','euler_solve, rk4_solve, adaptive_rk4'],['src/main.py','pygame race'],['tests/test_solvers.py','checks']],
 words:[['Differential equation','a rule that says how fast something changes, like y changes at rate minus y'],['Step size (dt)','how far in time you jump each step'],['Euler method','one step using the slope at the start'],['RK4','Runge-Kutta 4: four slope peeks per step, blended. Far more accurate'],['Convergence order','how fast the error shrinks as dt shrinks. Euler is order 1, RK4 is order 4'],['Adaptive step','taking small steps when things change fast and big steps when they are calm']],
 steps:[
  S('Write the checks','The rule y changes at rate minus y has the exact answer e to the power minus t.',[
    'Open **tests/test_solvers.py**. Write the code below. Run it. It fails.'],
    'python -m pytest -q tests/test_solvers.py','A red **ImportError**.','e to the minus 5 is 0.0067379. With dt 0.1 Euler gives 0.9 to the power 50, which is 0.005154. That is 23 percent too low.',
`import math
import numpy as np
from pytest import approx
from src.solvers import euler_solve, rk4_solve, adaptive_rk4

def decay(t, y):
    return -y

def test_decay_values():
    ts, ys = euler_solve(decay, 1.0, 0.0, 5.0, 0.1)
    assert ys[-1] == approx(0.005154, abs=1e-5)
    ts, ys = rk4_solve(decay, 1.0, 0.0, 5.0, 0.1)
    assert ys[-1] == approx(math.exp(-5), abs=1e-7)

def test_convergence_orders():
    def err(solver, dt):
        return abs(solver(decay, 1.0, 0.0, 5.0, dt)[1][-1] - math.exp(-5))
    e = [err(euler_solve, dt) for dt in (0.1, 0.05)]
    r = [err(rk4_solve, dt) for dt in (0.1, 0.05)]
    assert 1.8 < e[0] / e[1] < 2.2       # Euler: halve dt, half the error
    assert 14 < r[0] / r[1] < 18         # RK4: halve dt, one sixteenth of the error

def test_two_equations_at_once():
    f = lambda t, y: np.array([y[1], -y[0]])
    ts, ys = rk4_solve(f, np.array([1.0, 0.0]), 0.0, 10.0, 0.01)
    assert ys[-1][0] == approx(math.cos(10), abs=1e-4)

def test_adaptive_uses_few_steps():
    ts, ys = adaptive_rk4(decay, 1.0, 0.0, 5.0, tol=1e-8)
    assert ys[-1] == approx(math.exp(-5), abs=1e-6)
    assert len(ts) < 500`),
  S('Write Euler and RK4','Both return a list of times and a list of states.',[
    'Open **src/solvers.py**.',
    'Write {{euler_solve(f, y0, t0, t_end, dt)}}. Start {{ts = [t0]}} and {{ys = [y0]}}. Number of steps: {{n = round((t_end - t0) / dt)}}. Each step: {{y = y + dt * f(t, y)}} and {{t = t + dt}}. Append both. Return {{(ts, ys)}}.',
    'Write {{rk4_solve(...)}} with the same inputs. Each step: {{k1 = f(t, y)}}, {{k2 = f(t + dt/2, y + dt/2 * k1)}}, {{k3 = f(t + dt/2, y + dt/2 * k2)}}, {{k4 = f(t + dt, y + dt * k3)}}, then {{y = y + dt/6 * (k1 + 2*k2 + 2*k3 + k4)}}.',
    'The state {{y}} can be a number OR a numpy array. The same lines work for both.'],
    'python -m pytest -q tests/test_solvers.py','3 passed and 1 failing ({{test_adaptive_uses_few_steps}}). Good progress.'),
  S('Write the adaptive solver','Spend small steps only where needed.',[
    'Write {{adaptive_rk4(f, y0, t0, t_end, tol)}}. Start with {{dt = 0.1}}.',
    'Write a small helper {{rk4_step(f, t, y, dt)}} that does one RK4 step and returns the new y. Use it in {{rk4_solve}} too if you like.',
    'In a loop until {{t >= t_end}}: do ONE step of size dt giving {{big}}. Do TWO steps of size dt/2 giving {{small}}. The error estimate is {{err = np.max(np.abs(small - big)) / 15}}.',
    'If {{err <= tol}}: accept {{small}}, add dt to t, and store. Whether or not you accepted, set {{dt = dt * min(2.0, max(0.2, 0.9 * (tol / (err + 1e-30)) ** 0.2))}}. Also never step past {{t_end}}: {{dt = min(dt, t_end - t)}}.',
    'Return {{(ts, ys)}}.'],
    'python -m pytest -q tests/test_solvers.py','**4 passed** in green.','The constant 15 comes from the fact that RK4 is a fourth-order method. Trust it for now.'),
  WIN('Integrator Race'),
  S('Race Euler against RK4','Two dots chase the true answer.',[
    'In **src/main.py** import {{euler_solve}}, {{rk4_solve}}, {{adaptive_rk4}}.',
    'Keep {{dt = 0.5}}. Compute {{eu_t, eu_y}} and {{rk_t, rk_y}} for y = -y from t = 0 to 5, and the exact curve {{math.exp(-t)}}.',
    'Plot area: t from 0 to 5 maps to screen x 80 to 920. y from 0 to 1 maps to screen y 520 to 100.',
    'Draw the exact curve as a thin white line (200 points). Draw Euler as orange dots joined by lines, RK4 as green dots joined by lines.',
    'Animate: show only the first {{k}} dots, and add 1 to {{k}} every 20 frames.',
    'Show the values at the end of the line: Euler, RK4 and exact, and the gaps.',
    'Keys: UP and DOWN change dt among 0.5, 0.25, 0.1 and restart the race. A toggles a blue adaptive trace. B draws small tick marks along the bottom at every adaptive step.'],
    'python -m src.main','At dt 0.5 the Euler dots dive far BELOW the white curve. At t = 5 Euler shows about **0.001**, RK4 about **0.0068**, exact **0.0067**. The green dots sit almost on the line. At dt 0.1 Euler is closer but still low. The adaptive ticks are close together at the start and far apart near the end.'),
  S('Draw the error picture','Order of convergence as a line.',[
    'Press **E** for a second screen. Draw a graph with both axes logarithmic: x is dt (0.1, 0.05, 0.025, 0.0125), y is the absolute error at t = 5.',
    'Plot Euler (orange) and RK4 (green). Use {{math.log10}} to map values to screen.',
    'Write the two slopes you measure on the screen: the change in log10 error divided by the change in log10 dt between the first and last points.'],
    'python -m src.main','Euler errors **1.6e-3, 8e-4, 4e-4, 2e-4**: a slope of about **1**. RK4 errors **3e-8, 2e-9, 1e-10, 7e-12**: a slope of about **4**.','Write one sentence in README.md: what does a slope of 4 mean for how much work you save?'),
 ],
 done:['{{python -m pytest -q}} prints **4 passed**.','The race shows Euler far from the curve and RK4 on it.','The error graph shows slopes about 1 and about 4.','The adaptive ticks spread out as the curve flattens.','Everything is saved with git.'],
 stuck:[['The convergence test fails for RK4.','Check the 2*k2 and 2*k3 in the final blend.'],['Adaptive loops forever.','Make sure you stop when {{t >= t_end}} and shrink dt when the error is too big.'],['Array error in the oscillator test.','Your solver turned the state into a list. Keep it as a numpy array.']]
};

GUIDES.s3p2 = {
 slug:'orbit-sim', pip:['pygame','numpy'],
 files:[['src/__init__.py','empty file; lets Python import from src'],['src/orbit.py','gravity, rk4 step, simulate, energy, period, swept area'],['src/main.py','pygame solar system'],['tests/test_orbit.py','checks']],
 words:[['Gravity','the pull between masses. It gets weaker with distance squared'],['Orbit','falling around something instead of into it'],['Ellipse','a stretched circle. Planets move on ellipses'],['Semi-major axis (a)','half of the longest width of the ellipse'],['Kepler second law','a line from the star to the planet sweeps equal areas in equal times'],['Kepler third law','period squared is proportional to a cubed'],['Conserved quantity','a number that must not change, like energy. If it drifts, you have a bug']],
 steps:[
  S('Write the checks','Units are chosen so that G times the star mass equals 1. The planet starts at (1, 0).',[
    'Open **tests/test_orbit.py**. Write the code below. Run it. It fails.'],
    'python -m pytest -q tests/test_orbit.py','A red **ImportError**.','Starting speed 1 gives a perfect circle of radius 1 and a period of 2 pi, which is 6.2832. Speed 0.7 gives a narrow ellipse. Speed 1.2 gives a wide one.',
`import math
from pytest import approx
from src.orbit import simulate, energy, orbit_period, swept_area, semi_major_axis

def test_circular_orbit_comes_back():
    states = simulate(1.0, 0.001, 6.2832)          # vy0, dt, t_end
    t, x, y, vx, vy = states[-1]
    assert x == approx(1.0, abs=0.01) and y == approx(0.0, abs=0.01)

def test_radius_stays_one_in_a_circle():
    for t, x, y, vx, vy in simulate(1.0, 0.001, 6.2832):
        assert math.hypot(x, y) == approx(1.0, abs=0.01)

def test_energy_is_conserved():
    E = [energy(s) for s in simulate(0.7, 0.001, 10.0)]
    assert max(E) - min(E) < 1e-6

def test_periods():
    assert orbit_period(1.0) == approx(6.2832, abs=0.002)
    assert orbit_period(0.7) == approx(3.386, abs=0.005)
    assert orbit_period(1.2) == approx(14.993, abs=0.02)

def test_third_law_slope():
    a = [semi_major_axis(v) for v in (0.7, 1.0, 1.2)]
    T = [orbit_period(v) for v in (0.7, 1.0, 1.2)]
    slope = (math.log(T[2]) - math.log(T[0])) / (math.log(a[2]) - math.log(a[0]))
    assert slope == approx(1.5, abs=0.01)

def test_second_law_equal_areas():
    states = simulate(0.7, 0.001, 3.386)
    n = len(states)
    first = swept_area(states, 0, n // 10)
    later = swept_area(states, 4 * n // 10, 5 * n // 10)
    assert first == approx(later, rel=0.01)`),
  S('Write the orbit code','Newton gravity and RK4 from your last project.',[
    'Open **src/orbit.py**. The state is four numbers {{(x, y, vx, vy)}}.',
    'Write {{accel(x, y)}}: with {{r = math.hypot(x, y)}} the acceleration is {{(-x / r**3, -y / r**3)}}. This is gravity with G times M equal to 1.',
    'Write {{rk4_step(state, dt)}}. The derivative of the state is {{(vx, vy, ax, ay)}}. Use the same four-slope recipe you wrote in the integrator race, but on four numbers.',
    'Write {{simulate(vy0, dt, t_end)}}. Start at {{(1.0, 0.0, 0.0, vy0)}}. Return a list of {{(t, x, y, vx, vy)}} for every step, including the first.',
    'Write {{energy(s)}} where {{s}} is one of those tuples: kinetic energy {{0.5 * (vx**2 + vy**2)}} minus {{1 / r}}.',
    'Write {{semi_major_axis(vy0)}}: first the starting energy {{E = 0.5 * vy0**2 - 1}}. Then {{a = -1 / (2 * E)}}.',
    'Write {{orbit_period(vy0, dt=0.001)}}: step forward until y goes from negative to positive again (the planet returns to its start side). Use a straight line between the last two points to find the exact crossing time: {{t = t_prev + dt * (-y_prev) / (y_now - y_prev)}}. Ignore the very first steps because y starts at 0.',
    'Write {{swept_area(states, i0, i1)}}: add up {{0.5 * abs(x1 * y2 - x2 * y1)}} for every pair of neighbouring points between the two indexes.'],
    'python -m pytest -q tests/test_orbit.py','**6 passed** in green.','If energy drifts, check that you update all four numbers at the same time from the OLD state.'),
  WIN('Orbit Sim'),
  S('Draw a star and a planet that really orbits','Your own solar system.',[
    'In **src/main.py** import {{simulate}} and make {{states = simulate(1.0, 0.001, 60)}}. Set {{i = 0}}.',
    'Scale: 150 pixels per unit. Screen center (500, 300). Screen x is {{500 + 150 * x}}, screen y is {{300 - 150 * y}}.',
    'UPDATE: {{i = (i + speed) % len(states)}} where {{speed}} starts at 10 steps per frame.',
    'DRAW: a yellow circle of radius 12 at the center (the star). A blue circle of radius 6 at the planet. A trail: keep the last 800 planet positions in a list and draw them as a faded line.',
    'Show time, distance {{r}}, speed and energy as text.'],
    'python -m src.main','The planet circles the star. The trail is a perfect circle of radius **150 pixels**. The text shows **r = 1.000**, **speed = 1.000** and an energy of **-0.500** that never changes.'),
  S('Try three orbits','Keys 1, 2 and 3.',[
    'Key **1** loads {{simulate(1.0, ...)}}, key **2** loads speed 0.7, key **3** loads speed 1.2. Restart {{i}} and clear the trail.',
    'Keys UP and DOWN change {{speed}} between 2 and 40.',
    'SPACE pauses.'],
    'python -m src.main','Key 2: an ellipse. The planet starts at the FAR end (r = 1.0) and falls in to about **r = 0.32**. Its speed rises to about **2.16** there. Key 3: a wide ellipse reaching out to **r = 2.57** where the speed is only **0.47**. Energy stays constant in all three.'),
  S('Check the two laws of Kepler on screen','Equal areas and the T and a pattern.',[
    'Press **A**: for the ellipse, shade equal-TIME wedges. For each tenth of the period, draw a polygon: the star, then all the planet positions in that tenth. Use alternating colors.',
    'The wedge near the star is long and thin. The wedge far away is short and wide. Print the area of each wedge. They match.',
    'Press **K**: draw a table of the three orbits with {{a}}, {{T}} and {{T**2 / a**3}}.',
    'Write the table and one sentence in README.md.'],
    'python -m src.main','Wedge areas all about **0.1185** for the speed-0.7 ellipse. The table: speed 0.7 gives a = 0.662 and T = 3.386, speed 1.0 gives a = 1.000 and T = 6.283, speed 1.2 gives a = 1.786 and T = 14.99. The last column is always about **39.5**, which is 4 times pi squared.'),
 ],
 done:['{{python -m pytest -q}} prints **6 passed**.','The circular orbit has r = 1.000 all the way round.','Energy never changes.','Equal-time wedges have equal areas.','T squared over a cubed is about 39.5 for all three orbits.','Everything is saved with git.'],
 stuck:[['The orbit spirals outward.','Check the sign: acceleration is minus x over r cubed, pointing at the star.'],['The planet shoots off to infinity.','You divided by r instead of r cubed.'],['Period test is off by 0.01.','Use the straight-line interpolation at the crossing.']]
};

GUIDES.s3p3 = {
 slug:'epidemic-blobs', pip:['pygame','numpy','requests'],
 files:[['src/__init__.py','empty file; lets Python import from src'],['src/solvers.py','COPIED from integrator-race'],['src/seir.py','the SEIR equations, peak, R0, fitting'],['src/blobs.py','the blob epidemic (no pygame inside)'],['src/data.py','downloads real case counts'],['src/main.py','pygame window'],['tests/test_seir.py','checks'],['data/','downloaded numbers go here']],
 words:[['SEIR','Susceptible, Exposed, Infectious, Recovered: four groups of people'],['Transmission rate (beta)','how fast infectious people infect susceptible people'],['Incubation (sigma)','1 divided by the days from catching it to being infectious'],['Recovery (gamma)','1 divided by the days someone stays infectious'],['R0','how many people one sick person infects when nobody is immune. R0 equals beta divided by gamma'],['Calibration','tuning the model so it matches real data'],['Reporting fraction','the share of real infections that appear in the official counts']],
 steps:[
  S('Copy your solver and write the checks','You already own an RK4 solver.',[
    'Copy **solvers.py** from the integrator-race project. Mac or Linux first command. Windows second.',
    'Open **tests/test_seir.py**. Write the code below. Run it. It fails.'],
    'cp ../integrator-race/src/solvers.py src/solvers.py\n# Windows instead:\nCopy-Item ..\\integrator-race\\src\\solvers.py src\\solvers.py\npython -m pytest -q tests/test_seir.py','A red **ImportError**.','With beta 0.5, sigma 0.2, gamma 0.1 and a million people, R0 is 0.5 divided by 0.1 which is exactly 5.',
`import numpy as np
from pytest import approx
from src.seir import seir_rhs, simulate_seir, peak, r0

def test_rhs_conserves_people():
    d = seir_rhs(0.0, np.array([999000.0, 0.0, 1000.0, 0.0]), 0.5, 0.2, 0.1, 1e6)
    assert sum(d) == approx(0.0, abs=1e-9)

def test_r0():
    assert r0(0.5, 0.1) == 5.0

def test_epidemic_shape():
    ts, ys = simulate_seir(0.5, 0.2, 0.1, 1e6, 1000, 200, 0.1)
    I = [y[2] for y in ys]
    top, day = peak(ts, ys)
    assert top == approx(305135, rel=0.002)
    assert day == approx(47.7, abs=0.2)
    assert all(ys[k][0] >= ys[k + 1][0] - 1e-6 for k in range(len(ys) - 1))   # S never rises
    assert max(abs(sum(y) - 1e6) for y in ys) < 1.0                          # nobody appears or vanishes
    assert I[-1] < 1000                                                       # the epidemic ends`),
  S('Write the SEIR code','Four equations.',[
    'Open **src/seir.py**.',
    'Write {{seir_rhs(t, y, beta, sigma, gamma, N)}} where {{y = [S, E, I, R]}}. With {{inf = beta * S * I / N}} the four rates are {{-inf}}, {{inf - sigma * E}}, {{sigma * E - gamma * I}} and {{gamma * I}}. Return a numpy array.',
    'Write {{simulate_seir(beta, sigma, gamma, N, I0, days, dt)}}: call {{rk4_solve}} with a lambda that fixes the parameters: {{lambda t, y: seir_rhs(t, y, beta, sigma, gamma, N)}}. The start is {{np.array([N - I0, 0.0, I0, 0.0])}}. Return {{(ts, ys)}}.',
    'Write {{peak(ts, ys)}}: the biggest I and the time it happens, as {{(max_I, day)}}.',
    'Write {{r0(beta, gamma)}}.'],
    'python -m pytest -q tests/test_seir.py','**3 passed** in green. The peak is about **305,000 infectious people around day 48**.'),
  WIN('Epidemic Blobs'),
  S('Make 400 bouncing blobs','Primer style. Every blob is a person.',[
    'Open **src/blobs.py**. No pygame in this file, only numpy, so you can test it.',
    'Write {{class Blobs}} with {{__init__(self, n=400, width=900, height=600, p=0.04, seed=None)}}. Store arrays: {{pos}} (n by 2, random), {{vel}} (n by 2, random direction, speed 2), {{state}} (all 0 for Susceptible, 1 Exposed, 2 Infectious, 3 Recovered) and {{timer}} (frames left in the current state).',
    'Set the first 4 blobs to state 2 (infectious) with a random timer drawn from {{rng.exponential(300, 4)}}.',
    'Write {{step(self)}}: 1. nudge each velocity with {{rng.normal(0, 0.3, vel.shape)}} and rescale every velocity to length 2. 2. add velocity to position. 3. bounce off the walls (flip the velocity component and clip the position). 4. infection: for every susceptible blob count how many infectious blobs are closer than 12 pixels; it becomes Exposed with probability {{1 - (1 - p) ** count}}; give it a timer from {{rng.exponential(150)}}. 5. subtract 1 from every timer; when an Exposed timer hits 0 the blob becomes Infectious with a timer from {{rng.exponential(300)}}; when an Infectious timer hits 0 it becomes Recovered.',
    'Write {{counts(self)}} returning {{(S, E, I, R)}} counts.',
    'One DAY is 30 frames. The numbers 150 and 300 are 5 days and 10 days, matching sigma 0.2 and gamma 0.1.',
    'In **src/main.py** draw each blob as a circle of radius 4: blue for S, yellow for E, red for I, green for R. Call {{blobs.step()}} each frame (twice for speed).'],
    'python -m src.main','Four red blobs among 396 blue ones. Red spreads when they bump into blue. With p = 0.04 the number of red blobs peaks around day **35 to 60** at roughly **60 to 110** blobs. By day 100 nearly everyone is green. Your numbers will differ by about 20 percent from run to run.'),
  S('Draw the chart and lay the equations over it','The ODE and the blobs together.',[
    'Draw a chart area on the right or the bottom. Plot S, E, I, R counts per day as four colored lines as the blobs run.',
    'Also compute the ODE with {{simulate_seir}} for {{N = 400}}, {{I0 = 4}} and some beta. Draw its I(t) curve as a thin white line, scaled to 400 people.',
    'Keys UP and DOWN change {{p}} (and so the blobs) and restart. Left and right change the ODE beta by 0.02.',
    'Tune until the two infectious peaks are within about 5 days of each other. Write the beta you used in README.md.'],
    'python -m src.main','Two curves with the same rough shape: rise, peak, fall. The ODE curve is smooth. The blob curve is bumpy because of chance. Running again gives a different bumpy curve.','The blobs are random. The equations are the average of infinitely many runs.'),
  S('Calibrate to a real outbreak','Fit the model to real reported cases.',[
    'Open **src/data.py**. Write {{get_cases(country)}}. Download {{https://disease.sh/v3/covid-19/historical/rwanda?lastdays=all}} (change rwanda for another country). The answer is a dictionary. The part you need is {{["timeline"]["cases"]}}: a dictionary from a date like {{"7/15/21"}} to TOTAL cases so far.',
    'Turn the totals into new cases per day: each day minus the day before. Convert the date with {{datetime.strptime(d, "%m/%d/%y")}}.',
    'Take a window: from 2021-05-15 to 2021-09-30. Smooth it with a 7-day average.',
    'Fix {{sigma = 1/5.2}} and {{gamma = 1/8}} and {{N = 13_000_000}}. Search every beta from 0.15 to 0.60 in steps of 0.01 and every starting infectious count in {{[10, 30, 100, 300, 1000, 3000]}}.',
    'For each pair run {{simulate_seir}}. The model new cases per day are {{sigma * E}} at each day. Compare with the real new cases. Real counts are only a fraction of the truth, so scale: the best scale is {{rho = sum(real * model) / sum(model * model)}}. The error is the sum of squares of {{real - rho * model}}.',
    'Keep the pair with the smallest error. Print beta, the starting count, rho and R0.',
    'In README.md write your R0 and one sentence on whether it is above or below the published value of about 5 (range 3 to 8) for the Delta variant, with one reason it might differ.'],
    `python -c "from src.data import get_cases; d = get_cases('rwanda'); print(len(d), d[-1])"`,'A list of daily new cases, about **1000 numbers long**. Then your fit prints an **R0 between about 1.5 and 8**. Rwanda took strong measures, so a number below 5 is plausible.','If the download fails, check the web address spelling and your internet.'),
 ],
 done:['{{python -m pytest -q}} prints **3 passed**.','The ODE peak is about 305,000 near day 48.','The blobs spread red and then turn green.','The blob and ODE peaks line up within about 5 days.','You printed a fitted R0 for a real outbreak.','Everything is saved with git.'],
 stuck:[['The epidemic never starts in the blobs.','Raise p, or make sure the first 4 blobs are infectious with long timers.'],['S goes up in the ODE.','A sign error in the first equation. It must be minus inf.'],['The fit picks beta at the edge.','Widen the search range.']]
};

GUIDES.s3p4 = {
 slug:'fox-rabbit-chase', pip:['pygame','numpy','scipy'],
 files:[['src/__init__.py','empty file; lets Python import from src'],['src/solvers.py','COPIED from integrator-race'],['src/lv.py','Lotka-Volterra equations'],['src/chase.py','the blob chase (no pygame inside)'],['src/data.py','the Hudson Bay numbers'],['src/main.py','pygame window'],['tests/test_lv.py','checks']],
 words:[['Predator and prey','foxes eat rabbits'],['Lotka-Volterra','two equations: prey grow and get eaten, predators eat and starve'],['Fixed point','a pair of numbers where nothing changes'],['Phase portrait','a graph of one population against the other'],['Closed loop','the path comes back to where it began'],['Rescue effect','a trickle of newcomers that stops a small population from disappearing by bad luck']],
 steps:[
  S('Copy your solver and write the checks','Pick the rates 1.0, 0.1, 0.075 and 1.5. The balance point is (20, 10).',[
    'Copy **solvers.py** from integrator-race. Mac or Linux first command. Windows second.',
    'Open **tests/test_lv.py**. Write the code below. Run it. It fails.'],
    'cp ../integrator-race/src/solvers.py src/solvers.py\n# Windows instead:\nCopy-Item ..\\integrator-race\\src\\solvers.py src\\solvers.py\npython -m pytest -q tests/test_lv.py','A red **ImportError**.','Solve by hand: prey growth stops when y = alpha / beta = 10. Predator growth stops when x = gamma / delta = 20.',
`from pytest import approx
from src.lv import simulate_lv, fixed_point, period

def test_fixed_point():
    assert fixed_point() == (20.0, 10.0)

def test_stays_at_the_balance_point():
    ts, ys = simulate_lv(20.0, 10.0, 50.0, 0.01)
    assert all(abs(y[0] - 20) < 1e-6 and abs(y[1] - 10) < 1e-6 for y in ys)

def test_oscillates_around_it():
    ts, ys = simulate_lv(22.0, 10.0, 60.0, 0.001)
    xs = [y[0] for y in ys]
    assert min(xs) == approx(18.13, abs=0.05)
    assert max(xs) == approx(22.00, abs=0.05)

def test_period():
    ts, ys = simulate_lv(22.0, 10.0, 60.0, 0.001)
    assert period(ts, ys) == approx(5.13, abs=0.05)`),
  S('Write the equations','Two lines of maths.',[
    'Open **src/lv.py**. Keep the four rates as constants {{ALPHA = 1.0}}, {{BETA = 0.1}}, {{DELTA = 0.075}}, {{GAMMA = 1.5}}.',
    'Write {{lv_rhs(t, y, a=ALPHA, b=BETA, d=DELTA, g=GAMMA)}} with {{y = (x, y)}}: it returns {{[a*x - b*x*y, d*x*y - g*y]}} as a numpy array.',
    'Write {{fixed_point()}} returning {{(GAMMA / DELTA, ALPHA / BETA)}}.',
    'Write {{simulate_lv(x0, y0, t_end, dt)}} using {{rk4_solve}}.',
    'Write {{period(ts, ys)}}: find the times of the first two local maxima of x (a point bigger than both its neighbours). Return their difference.'],
    'python -m pytest -q tests/test_lv.py','**4 passed** in green.'),
  WIN('Fox Rabbit Chase'),
  S('Draw the phase portrait','Rabbits on the x axis, foxes on the y axis.',[
    'In **src/main.py** compute {{simulate_lv(22, 10, 60, 0.01)}}. Plot area: x from 0 to 80 (rabbits) maps to screen x 60 to 460, y from 0 to 40 (foxes) maps to screen y 540 to 340.',
    'Draw the path as a growing line: show the first {{k}} points and add 5 to {{k}} each frame.',
    'Draw a small cross at the fixed point (20, 10).',
    'Keys: **1** start at (22, 10). **2** start at (40, 10). **3** start at (20, 10).'],
    'python -m src.main','Key 1: a small loop around the cross. **x runs between 18.1 and 22.0.** The line closes back on itself every lap, about every **5.1 time units**. Key 2: a much bigger loop. Key 3: the dot sits on the cross and does not move.'),
  S('Make the chase with blobs','Agents instead of equations.',[
    'Open **src/chase.py**. No pygame here. Use numpy.',
    'World 900 by 600 that wraps around. Start with 200 rabbits at random places and 6 foxes with energy 1.5 each.',
    'Every step: 1. each rabbit moves randomly: {{rng.normal(0, 1.2, 2)}}. 2. each rabbit gives birth with probability {{0.02 * max(0, 1 - n_rabbits / 600)}}; the baby appears within 6 pixels. 3. with probability 0.01 one new rabbit appears at a random place (the rescue effect). 4. each fox looks for the nearest rabbit. If it is within **40** pixels the fox moves 2.4 pixels toward it, otherwise it wanders randomly with step 1.4. If a rabbit is within **8** pixels the fox eats it: remove the rabbit and add **0.5** to its energy. 5. every fox loses **0.004** energy. 6. a fox with energy 3.0 or more splits in two and both get energy 1.5 (never more than 120 foxes). 7. a fox at 0 energy or less dies. 8. if there are fewer than 3 foxes, with probability 0.002 a new fox appears.',
    'In **src/main.py** draw rabbits as white circles of radius 3 and foxes as orange circles of radius 6. Show both counts.',
    'Draw a small chart at the bottom of the window of both counts over time.'],
    'python -m src.main','Rabbits multiply to about **600**. Foxes boom afterwards, up to **100 or more**. The rabbits crash. The foxes starve and shrink. Then rabbits recover. The cycle repeats every **10 to 20 seconds**. The two lines on the chart chase each other, with the foxes always a little behind. Numbers differ from run to run.','Without the rescue lines, real simulations of this kind often wipe out one side early. That is a real finding in ecology too.'),
  S('Fit the equations to the real Hudson Bay data','Fox and rabbit data from 1900 to 1920.',[
    'Open **src/data.py**. Paste the two lists below. They are the number of hare and lynx pelts in thousands, one value per year from 1900 to 1920.',
    'Write {{fit()}}: use {{scipy.optimize.least_squares}} with a function that returns the differences between your RK4 simulation and the data. The unknowns are alpha, beta, delta, gamma and the two starting values.',
    'Start from {{[0.5, 0.03, 0.02, 0.8, 30, 4]}}. Give bounds {{([0,0,0,0,1,1], [3,1,1,3,200,200])}}. Simulate with dt 0.05 and read the result at each whole year.',
    'In main, press **H** to show the real data as dots and your fitted curves as lines.',
    'In README.md name two years where the data and the model disagree, and one reason for each.'],
    null,'Your fit finds about **alpha 0.48, beta 0.025, delta 0.0275, gamma 0.93**, starting values about **35 hares and 4 lynx**, and an error of about **3.8** (thousand). Peaks of the curves line up with the data. The model has a regular cycle while the real one is uneven.','If the error is above 10, the fit got stuck. Try a different start such as {{[0.6, 0.025, 0.02, 0.9, 35, 4]}}.',
`HARE = [30, 47.2, 70.2, 77.4, 36.3, 20.6, 18.1, 21.4, 22, 25.4, 27.1, 40.3, 57, 76.6, 52.3, 19.5, 11.2, 7.6, 14.6, 16.2, 24.7]
LYNX = [4, 6.1, 9.8, 35.2, 59.4, 41.7, 19, 13, 8.3, 9.1, 7.4, 8, 12.3, 19.5, 45.7, 51.1, 29.7, 15.8, 9.7, 10.1, 8.6]
YEARS = list(range(1900, 1921))`),
 ],
 done:['{{python -m pytest -q}} prints **4 passed**.','The phase portrait is a closed loop around (20, 10).','The blob chase shows repeating boom and bust cycles.','Your fit error is about 4 or less.','README.md names two years where the model misses.','Everything is saved with git.'],
 stuck:[['The phase loop spirals instead of closing.','Your step is too big. Use dt 0.001 for the check, or 0.01 for drawing.'],['Both blob populations die at once.','Lower the fox speed or raise the rabbit birth rate, and keep the rescue lines.'],['The fit returns zeros.','It got stuck. Use the start values given.']]
};

GUIDES.s3p5 = {
 slug:'solar-sizer', pip:['pygame','numpy','requests'],
 files:[['src/__init__.py','empty file; lets Python import from src'],['src/nasa.py','COPIED from converging-average'],['src/energy.py','battery simulation, cost, brute force, rolling ball'],['src/main.py','pygame: the cost landscape and the battery gauge'],['tests/test_energy.py','checks'],['data/','downloaded sunshine goes here']],
 words:[['Irradiance','how much sunshine arrives. In kWh per square meter per day it is the same number as the sun-hours of full sun'],['Panel size (kW)','how much power the panels make in full sun'],['Battery (kWh)','how much energy it stores'],['State of charge','how full the battery is'],['Unmet day','a day the batteries and panels could not cover the load'],['Optimisation','finding the best choice. Here: the cheapest system that is reliable enough'],['Local minimum','a low spot that is not the lowest spot']],
 steps:[
  S('Copy the downloader and write the checks','You can do five days by hand.',[
    'Copy **nasa.py** from converging-average. Mac or Linux first command. Windows second.',
    'Open **tests/test_energy.py**. Write the code below. Run it. It fails.'],
    'cp ../converging-average/src/nasa.py src/nasa.py\n# Windows instead:\nCopy-Item ..\\converging-average\\src\\nasa.py src\\nasa.py\npython -m pytest -q tests/test_energy.py','A red **ImportError**.','By hand: a 1 kW panel with 5 hours of sun makes 5 kWh. The house uses 2 kWh. So the battery gains 3 kWh a day, but it can only hold 4, so it stops at 4.',
`from pytest import approx
from src.energy import simulate, cost, brute_force

def test_hand_case():
    soc, unmet = simulate([5] * 5, [2] * 5, 1.0, 4.0, eff=1.0, soc0=2.0)
    assert soc == approx([4, 4, 4, 4, 4])
    assert unmet == 0

def test_a_dark_stretch():
    soc, unmet = simulate([0, 0, 0], [2, 2, 2], 1.0, 4.0, eff=1.0, soc0=4.0)
    assert soc == approx([2, 0, 0])
    assert unmet == 1

def test_cost():
    assert cost(2.0, 5.0) == approx(2.0 * 700 + 5.0 * 300)

def test_brute_force_finds_a_feasible_design():
    irr = [5.0] * 50 + [1.0] * 10 + [5.0] * 50
    best = brute_force(irr, [3.0] * len(irr))
    panel, battery, c, frac = best
    assert frac <= 0.05`),
  S('Write the simulation, the cost and the brute-force search','Three functions.',[
    'Open **src/energy.py**.',
    'Write {{simulate(irr, load, panel_kw, battery_kwh, eff=0.8, soc0=None)}}. {{irr}} and {{load}} are lists with one number per day. Start {{soc}} at {{soc0}} (or half the battery if it is None). For each day: {{gen = panel_kw * irr_today * eff}}. {{soc_new = soc + gen - load_today}}. If {{soc_new > battery_kwh}} then {{soc = battery_kwh}} (the extra is wasted). If {{soc_new < 0}} then {{soc = 0}} and count one unmet day. Otherwise {{soc = soc_new}}. Collect the soc after every day. Return {{(soc_list, unmet_days)}}.',
    'Write {{cost(panel_kw, battery_kwh)}} as {{700 * panel_kw + 300 * battery_kwh}}. These are rough prices in US dollars per kW and per kWh. They are an assumption. Write that assumption in README.md.',
    'Write {{score(irr, load, panel, battery)}}: the cost plus {{1_000_000 * max(0, unmet_fraction - 0.05)}}. The unmet fraction is unmet days divided by the number of days. Over 5 percent costs a huge penalty.',
    'Write {{brute_force(irr, load)}}: try every panel from 1.0 to 12.0 in steps of 0.5 and every battery from 0 to 40 in steps of 1. Return the cheapest design that has an unmet fraction of 5 percent or less, as {{(panel, battery, cost, unmet_fraction)}}.'],
    'python -m pytest -q tests/test_energy.py','**4 passed** in green.'),
  S('Get real sunshine for a place','A full year of real data.',[
    'Use your copied {{fetch_daily}}. Download **ALLSKY_SFC_SW_DWN** for a place and for the whole of 2022: for example {{fetch_daily(-1.94, 30.06, "20220101", "20221231")}}.',
    'Set the load to a flat 5 kWh per day for 365 days. Write that assumption in README.md.',
    'Run {{brute_force}} and print the answer.'],
    `python -c "from src.nasa import fetch_daily; from src.energy import brute_force; d = fetch_daily(-1.94, 30.06, '20220101', '20221231'); print(brute_force(d['ALLSKY_SFC_SW_DWN'], [5.0] * 365))"`,'One line with four numbers: a panel size, a battery size, a cost and an unmet fraction of **0.05 or less**. Expect a panel of about **1.5 to 3.5 kW** and a battery of about **2 to 12 kWh**, costing a few thousand dollars.'),
  WIN('Solar Sizer'),
  S('Draw the cost landscape','Every possible design is one square.',[
    'In **src/main.py** compute {{score}} for every (panel, battery) pair on the grid: 23 panel sizes (1.0 to 12.0 step 0.5) by 41 battery sizes (0 to 40 step 1).',
    'Draw a grid of colored squares, 20 pixels each. Columns are panel sizes, rows are battery sizes. Color by cost: cheap is dark green and expensive is bright yellow. Squares that fail the 5 percent rule are gray.',
    'Draw a white outline around the cheapest feasible square (the brute-force answer).'],
    'python -m src.main','A grid with a gray region at the bottom left (too small to be reliable) and green to yellow towards the top right. The cheapest feasible square sits right on the edge of the gray region.'),
  S('Roll a ball downhill','Watch an optimizer work.',[
    'Write {{roll(irr, load, start)}} in **src/energy.py**. A design is {{(panel, battery)}}. At each step try the four neighbours: panel plus or minus 0.5, battery plus or minus 1, staying inside the grid. Move to the neighbour with the lowest {{score}}, but only if it is lower than where you stand. Stop when no neighbour is lower. Return the list of every position visited.',
    'In **src/main.py** key **SPACE** takes one step of the ball. Draw the ball as a red circle and the path as a red line. Key **A** runs it automatically. Key **1**, **2**, **3** pick the start corners: top right (12, 40), top left (1, 40), bottom right (12, 0).',
    'Compare the ball final cost with the brute-force cost.'],
    'python -m src.main','The ball slides toward the gray border and stops on it. From the top right corner it usually reaches a cost within **2 percent** of brute force. From other corners it may stop at a slightly worse spot. That is a local minimum.','If the ball is more than 2 percent worse from every start, write one sentence in README.md about why a ball can get stuck.'),
  S('Watch the chosen design work','A time-lapse of a year.',[
    'Press **G** for the gauge screen. Use the brute-force design. Run {{simulate}} on the real year.',
    'Draw a battery as a tall rectangle that fills to the current state of charge. Draw a sun icon whose size follows that day sunshine. Move through the days at 20 days per second.',
    'Show day number, state of charge and the count of unmet days so far.'],
    'python -m src.main','The battery fills on sunny days and drains on dull ones. At the end the counter shows **18 or fewer** unmet days (5 percent of 365). Your exact number depends on the weather in your year.'),
 ],
 done:['{{python -m pytest -q}} prints **4 passed**.','Brute force returns a design with 5 percent or fewer unmet days.','The landscape shows the gray unreliable region.','The ball stops within 2 percent of brute force, or you explained why not.','README.md lists your price and load assumptions.','Everything is saved with git.'],
 stuck:[['The test says soc is wrong on the dark stretch.','The day with load 2 and soc 0 is an unmet day and the battery stays at 0.'],['Brute force is very slow.','You recompute inside a Python loop too much. 23 times 41 designs times 365 days is fine. Check for extra loops.'],['The ball does not move.','You compare against the wrong number. Move only if the neighbour score is strictly smaller.']]
};

GUIDES.s4p1 = {
 slug:'heat-diffusion', pip:['pygame','numpy'],
 files:[['src/__init__.py','empty file; lets Python import from src'],['src/heat.py','1D and 2D heat solvers'],['src/main.py','pygame thermal camera'],['tests/test_heat.py','checks']],
 words:[['PDE','partial differential equation: a rule about change in both time and space'],['Diffusion','heat spreading from hot to cold'],['Finite differences','replacing a smooth rod with many points and using neighbours to estimate slopes'],['Grid spacing (dx)','the distance between points'],['Stability','whether small errors die out or explode'],['r number','alpha times dt divided by dx squared. It controls stability'],['Boundary condition','what happens at the edges. Here the ends stay at zero']],
 steps:[
  S('Write the checks','One special start has an exact answer.',[
    'Open **tests/test_heat.py**. Write the code below. Run it. It fails.'],
    'python -m pytest -q tests/test_heat.py','A red **ImportError**.','If the rod starts as a sine wave, it stays a sine wave and just fades. At time 2 with alpha 0.01 the peak is exp(-0.01 times pi squared times 2) = 0.8209.',
`import math
import numpy as np
from pytest import approx
from src.heat import heat1d, blow_up_step, heat2d_step, blow_up_2d

def exact(x, t, alpha=0.01):
    return np.sin(np.pi * x) * math.exp(-alpha * math.pi ** 2 * t)

def test_error_shrinks_with_resolution():
    errs = []
    for n, dt in [(20, 0.01), (50, 0.01), (100, 0.002)]:
        x, u, r = heat1d(n, dt, 0.01, 2.0)
        errs.append(np.max(np.abs(u - exact(x, 2.0))))
    assert errs[0] > errs[1] > errs[2]
    assert errs[1] < 1e-4 and errs[2] < 1e-5

def test_peak_value():
    x, u, r = heat1d(50, 0.01, 0.01, 2.0)
    assert u.max() == approx(0.8209, abs=0.001)

def test_stable_and_unstable():
    assert blow_up_step(50, 0.4) is None            # r = 0.4 is safe
    step = blow_up_step(50, 0.6)                    # r = 0.6 is too big
    assert step is not None and 100 < step < 140

def test_2d_limit_is_one_quarter():
    u = np.zeros((60, 60)); u[25:35, 25:35] = 100.0
    peaks = []
    for _ in range(100):
        u = heat2d_step(u, 0.2); peaks.append(u.max())
    assert all(peaks[k + 1] <= peaks[k] + 1e-9 for k in range(99))
    assert blow_up_2d(0.2) is None
    assert blow_up_2d(0.3) is not None and blow_up_2d(0.3) < 60`),
  S('Write the 1D solver and the blow-up detector','The whole method is one line inside a loop.',[
    'Open **src/heat.py**.',
    'Write {{heat1d(n, dt, alpha=0.01, t_end=2.0)}}. The rod runs from 0 to 1 with {{n}} points: {{x = np.linspace(0, 1, n)}}. {{dx = x[1] - x[0]}}. {{r = alpha * dt / dx**2}}. Start {{u = np.sin(np.pi * x)}}.',
    'Repeat {{round(t_end / dt)}} times: {{u[1:-1] = u[1:-1] + r * (u[2:] - 2 * u[1:-1] + u[:-2])}}, then set {{u[0] = 0}} and {{u[-1] = 0}}. Read the line as: each point moves toward the average of its two neighbours.',
    'Return {{(x, u, r)}}.',
    'Write {{blow_up_step(n, r, alpha=0.01, limit=10, max_steps=1000)}}. Make the same rod, but choose {{dt = r * dx**2 / alpha}} so that the r number is exactly what you asked for. Step until the biggest absolute value is more than {{limit}} and return that step number. If it never happens within {{max_steps}}, return {{None}}.',
    'Write {{heat2d_step(u, r)}} for a square grid: {{lap = np.roll(u,1,0) + np.roll(u,-1,0) + np.roll(u,1,1) + np.roll(u,-1,1) - 4*u}}, then {{u = u + r * lap}}, then set all four edge lines to 0. Return u.',
    'Write {{blow_up_2d(r, n=60, steps=400)}}: a hot 10 by 10 square of value 100 in the middle of a cold grid. Step until the biggest absolute value is over 1000 and return the step number, otherwise {{None}}.'],
    'python -m pytest -q tests/test_heat.py','**4 passed** in green.','The stability rule for this method is r at most 0.5 in 1D and r at most 0.25 in 2D. You just proved it with the blow-up tests.'),
  WIN('Heat Diffusion'),
  S('Draw a hot spot cooling down','A thermal camera.',[
    'In **src/main.py** make a 100 by 100 grid {{u}} of zeros and set a 10 by 10 square in the middle to 100. Set {{r = 0.2}}.',
    'Each frame call {{heat2d_step(u, r)}} 5 times.',
    'Draw the grid with 6 pixels per cell. Turn a value into a color: black at 0, then dark red, then orange, then yellow, then white at 100. A simple rule: {{red = min(255, v * 5)}}, {{green = min(255, max(0, v * 5 - 255))}}, {{blue = min(255, max(0, v * 5 - 510))}}.',
    'Faster drawing: make a numpy array of colors and use {{pygame.surfarray.make_surface}} then scale it up with {{pygame.transform.scale}}.',
    'Show the biggest value as text.'],
    'python -m src.main','A bright square slowly spreads and dims into a round glow, then fades to black. The biggest value drops from **100** to under **1** over a few hundred frames.'),
  S('Break it on purpose','Cross the stability line and watch.',[
    'Keys UP and DOWN change {{r}} by 0.02 between 0.04 and 0.34. Restart on every change. Show {{r}} on screen.',
    'Mouse click adds a 5 by 5 block of heat (100) at the mouse.',
    'Set r to 0.30 and watch. Then 0.26. Then 0.24.'],
    'python -m src.main','At **r = 0.30** the picture turns into flickering colored noise in about **25 steps** and the biggest value shoots past a thousand. At **r = 0.26** the break takes about **140 steps**. At **0.24** it stays calm. The line between calm and chaos is **0.25**.','Write one sentence in README.md: what does the r number mean in plain words?'),
  S('Print the error table','Check the solver against the exact answer.',[
    'Make **errors.py** in the project root. For the three rods in the checks print n, dt, r and the biggest error against the exact answer.'],
    'python errors.py','Three rows. The error column goes **about 2.9e-4, 2.4e-5, 2.4e-6**. It shrinks as you add points.'),
 ],
 done:['{{python -m pytest -q}} prints **4 passed**.','The thermal camera shows a hot spot cooling.','At r = 0.30 the picture explodes and at 0.24 it does not.','The error table shrinks as resolution grows.','Everything is saved with git.'],
 stuck:[['The rod test shows huge numbers.','Your r is above 0.5. Print r and shrink dt.'],['The picture is all black.','Your color rule gives values above 255 or below 0. Clamp each number.'],['The 2D hot spot never cools.','You forgot to set the edges to zero after every step.']]
};

GUIDES.s4p2 = {
 slug:'river-plume', pip:['pygame','numpy'],
 files:[['src/__init__.py','empty file; lets Python import from src'],['src/plume.py','advection plus diffusion solver'],['src/main.py','pygame river'],['tests/test_plume.py','checks']],
 words:[['Concentration','how much dye or pollutant is in each bit of water'],['Advection','being carried along by the flow'],['Diffusion','spreading out and thinning'],['Upwind scheme','for the advection term use the neighbour the water is coming FROM'],['Gaussian','a bell-shaped bump'],['Variance','how wide the bump is, squared']],
 steps:[
  S('Write the checks','Dye in a river has an exact answer: a bell that travels at the water speed and widens.',[
    'Open **tests/test_plume.py**. Write the code below. Run it. It fails.'],
    'python -m pytest -q tests/test_plume.py','A red **ImportError**.','Exact answer: the bell centre moves at speed v times t. Its variance equals the starting variance plus 2 times D times t. With v = 1, D = 1, t = 10 and a start width of 0.5 meters, the centre is at 15 and the variance is 20.25.',
`from pytest import approx
from src.plume import run, mean_and_variance

def test_pure_advection_keeps_the_shape():
    x, c = run(D=0.0)                       # defaults: v=1, dx=0.05, dt=0.001, 10 seconds
    m, var = mean_and_variance(x, c)
    assert m == approx(15.0, abs=0.05)
    assert var < 0.35                       # it started at 0.25

def test_advection_plus_diffusion():
    x, c = run(D=1.0)
    m, var = mean_and_variance(x, c)
    assert m == approx(15.0, abs=0.1)
    assert var == approx(20.25, rel=0.06)   # exact is 20.25; the scheme adds a little fake smear

def test_total_dye_is_conserved():
    x, c = run(D=1.0)
    assert c.sum() * 0.05 == approx(1.0, abs=1e-6)`),
  S('Write the solver','One loop, two terms.',[
    'Open **src/plume.py**.',
    'Write {{run(v=1.0, D=1.0, dx=0.05, length=50.0, t_end=10.0, x0=5.0, s0=0.5, dt=0.001, scheme="upwind")}}.',
    'Make {{x = np.arange(0, length, dx)}}. The starting dye is a bell: {{c = np.exp(-(x - x0)**2 / (2 * s0**2))}}. Scale it so the total is 1: {{c = c / (c.sum() * dx)}}.',
    'Repeat {{round(t_end / dt)}} times. Advection with UPWIND: {{adv = -v * (c - np.roll(c, 1)) / dx}}. Diffusion: {{dif = D * (np.roll(c, -1) - 2 * c + np.roll(c, 1)) / dx**2}}. Then {{c = c + dt * (adv + dif)}}.',
    'If {{scheme == "central"}} use {{adv = -v * (np.roll(c, -1) - np.roll(c, 1)) / (2 * dx)}} instead. This is the tempting but bad choice. You will compare later.',
    'Return {{(x, c)}}.',
    'Write {{mean_and_variance(x, c)}}: with weights {{w = c / c.sum()}} the mean is {{(x * w).sum()}} and the variance is {{((x - mean)**2 * w).sum()}}.'],
    'python -m pytest -q tests/test_plume.py','**3 passed** in green.','The time step must be small. With D = 1 and dx = 0.05, dt has to stay below about 0.0012. That is why the default is 0.001.'),
  WIN('River Plume'),
  S('Draw the river and the dye','Watch the plume travel.',[
    'In **src/main.py** run the solver step by step, not all at once. Write a {{step}} function or copy the loop so you can advance a few steps per frame.',
    'Draw a blue rectangle 1000 pixels wide and 160 tall as the river. Map x from 0 to 50 meters onto screen x 0 to 1000 (so 20 pixels per meter).',
    'Draw the dye as a column per grid cell? That is 1000 columns, fine: for every cell draw a thin vertical bar whose red color follows {{c / c.max()}}.',
    'Under the river draw the curve of {{c}} as a line graph.',
    'Show time, mean and variance as text.',
    'Keys: **D** toggles diffusion between 0 and 1. **C** toggles upwind and central. **R** restarts.'],
    'python -m src.main','The dye starts as a narrow red stripe at 5 m. It drifts right and, with diffusion on, spreads. At **t = 10 s** the centre is at **15 m** and the variance reads about **21**. With diffusion off it stays narrow, variance about **0.30**.'),
  S('See why upwind matters','The tempting scheme is wrong.',[
    'Turn diffusion off and press **C** to switch to the central scheme. Run.',
    'Write down in README.md what you see.'],
    'python -m src.main','Central differences make ripples and small negative dye values behind the pulse. Negative concentration is impossible, so the scheme is a poor choice. Upwind never goes negative.'),
  S('A real spill, in real numbers','Now a river-size answer.',[
    'Write **spill.py** in the project root. Use the same {{run}} function with {{v = 0.5}} (meters per second, typical of a river), {{D = 30}} (river dispersion is often 10 to 100), {{dx = 10}}, {{length = 100000}}, {{x0 = 10000}}, {{s0 = 100}}, {{dt = 1}} and {{t_end = 86400}} (24 hours).',
    'Print the centre and the spread (the square root of the variance) in kilometres.',
    'Work out by hand what the exact answers should be: centre = x0 + v times t, spread = square root of (s0 squared plus 2 times D times t).',
    'Write both in README.md next to your numbers.'],
    'python spill.py','The centre prints about **53.2 km** (10 km plus 0.5 m/s times 24 h = 43.2 km). The spread prints about **2.3 km**, slightly above the exact **2.28 km** because of numerical smear. This takes 10 to 30 seconds to run.'),
 ],
 done:['{{python -m pytest -q}} prints **3 passed**.','At t = 10 s with diffusion the centre is 15 and variance about 21.','The central scheme shows ripples.','The 24 hour spill reaches about 53.2 km with a spread of about 2.3 km.','Everything is saved with git.'],
 stuck:[['The numbers become huge or NaN.','dt is too big. Keep dt at or below 0.001 for dx 0.05, and dt 1 for dx 10.'],['Variance with D = 0 is much bigger than 0.35.','You used a large dt and the upwind smear grew. Keep dt small.'],['The test of conserved dye fails.','You normalised with the wrong dx. Divide by {{c.sum() * dx}}.']]
};

GUIDES.s4p3 = {
 slug:'town-epidemic', pip:['pygame','numpy','requests'],
 files:[['src/__init__.py','empty file; lets Python import from src'],['src/towns.py','COPIED from town-network'],['src/network.py','gravity-model travel network'],['src/agents.py','the agent epidemic (no pygame inside)'],['src/main.py','pygame map of towns and people'],['tests/test_agents.py','checks'],['data/','downloaded towns go here']],
 words:[['Agent','one simulated person with their own state and home town'],['Agent-based model','a simulation made of many individual agents'],['Network','towns joined by travel routes'],['Gravity model','travel between two towns grows with their populations and shrinks with distance'],['Well-mixed','a simplification where everyone meets everyone equally'],['Stochastic run','a run with chance in it. Every run is different, so you average many']],
 steps:[
  S('Copy the town downloader and write the checks','The most important check: one town must behave like your old simple model.',[
    'Copy **towns.py** from town-network. Mac or Linux first command. Windows second.',
    'Open **tests/test_agents.py**. Write the code below. Run it. It fails.'],
    'cp ../town-network/src/towns.py src/towns.py\n# Windows instead:\nCopy-Item ..\\town-network\\src\\towns.py src\\towns.py\npython -m pytest -q tests/test_agents.py','A red **ImportError**.','A single town with nobody travelling is the same as your well-mixed model. If it is not, there is a bug, not a discovery.',
`import numpy as np
from pytest import approx
from src.network import gravity_matrix
from src.agents import Epidemic

def test_gravity_matrix_shape_and_zero_diagonal():
    pops = [1000, 500, 200]; xy = [(0, 0), (1, 0), (0, 2)]
    G = gravity_matrix(pops, xy)
    assert G.shape == (3, 3) and np.allclose(np.diag(G), 0)
    assert G[0, 1] > G[0, 2]            # town 1 is bigger and closer than town 2 is to town 0

def test_rows_are_probabilities():
    G = gravity_matrix([1000, 500, 200], [(0, 0), (1, 0), (0, 2)])
    assert np.allclose(G.sum(axis=1), 1.0)

def test_one_town_matches_the_simple_model():
    peaks = []
    for seed in range(20):
        e = Epidemic([2000], np.array([[1.0]]), beta=0.5, sigma=0.2, gamma=0.1, i0=20, travel=0.0, seed=seed)
        I = [e.counts()[2]]
        for day in range(150):
            e.step_day(); I.append(e.counts()[2])
        peaks.append((max(I), I.index(max(I))))
    mean_peak = np.mean([p[0] for p in peaks]); mean_day = np.mean([p[1] for p in peaks])
    assert 0.2 * 2000 < mean_peak < 0.45 * 2000        # ODE says about 30 percent
    assert 15 < mean_day < 45`),
  S('Write the travel network','Bigger and closer towns attract more travel.',[
    'Open **src/network.py**.',
    'Write {{gravity_matrix(pops, xy)}}. For two different towns {{i}} and {{j}} the raw pull is {{pops[j] / (distance ** 2)}} where distance is the plain straight-line distance between their coordinates. The diagonal is 0.',
    'Divide each row by its sum so every row adds up to 1. Row {{i}} then gives the chance that a traveller from town {{i}} goes to each other town. Return a numpy array.'],
    'python -m pytest -q tests/test_agents.py','2 passed and 1 failing (the Epidemic one).'),
  S('Write the agent epidemic','Each person has a town and a state.',[
    'Open **src/agents.py**. No pygame here.',
    'Write {{class Epidemic}} with {{__init__(self, pops, G, beta, sigma, gamma, i0, travel, seed=None)}}. Store arrays: {{town}} (the home town of each person, built from {{pops}}), {{state}} (0 S, 1 E, 2 I, 3 R, all 0 at first) and {{where}} (the town each person is in today, equal to {{town}} at first).',
    'Make {{i0}} randomly chosen people infectious (state 2), all in the first town.',
    'Write {{step_day(self)}}. 1. TRAVEL: each person, with probability {{travel}}, picks a visiting town with {{rng.choice(len(pops), p=G[town])}}; otherwise {{where = town}}. 2. INFECTION: for each town, count the infectious people currently there ({{I}}) and everyone present ({{n}}). Each susceptible person there becomes Exposed with probability {{1 - exp(-beta * I / n)}}. 3. PROGRESS: each Exposed becomes Infectious with probability {{1 - exp(-sigma)}}. Each Infectious becomes Recovered with probability {{1 - exp(-gamma)}}.',
    'Make sure the three updates use the state from the START of the day: copy {{state}} first.',
    'Write {{counts(self)}} returning {{(S, E, I, R)}} totals, and {{counts_by_town(self)}} returning an array with one row per town.'],
    'python -m pytest -q tests/test_agents.py','**3 passed** in green. The check runs 20 epidemics of 2000 people, so it takes a few seconds.'),
  WIN('Town Epidemic'),
  S('Draw the towns and the people','Primer style, on a real map.',[
    'In **src/main.py** load real towns: {{get_towns("KE", 20)}}. Use the 20 biggest. The populations are real but millions of people cannot be drawn, so scale: 1 blob stands for 5000 people, with at least 1 blob per town.',
    'Map longitude and latitude to the window as in the town-network project.',
    'Run the epidemic with the REAL populations divided by 100 (so about 100,000 agents is too many; divide by 1000 instead). Draw one circle per town whose size shows its population.',
    'Color idea that is cheap and clear: inside each town circle draw up to 40 small dots, each dot colored by the share of the town in that state. For 40 dots, the first {{round(40 * S_share)}} are blue, the next yellow, then red, then green.',
    'Call {{step_day()}} once every 10 frames. Show the day and the total counts.',
    'Start the outbreak in the biggest town (Nairobi). Set {{travel = 0.05}}.'],
    'python -m src.main','Nairobi turns red first. A few days later nearby towns start turning red. Far towns catch it last. The peaks happen at **different times** in different towns.'),
  S('Compare with the well-mixed model','What does geography change?',[
    'Add a key **W** that runs the same total number of people as ONE town with the same beta, sigma and gamma, and shows its infectious curve next to the map curve.',
    'Draw both infectious curves (total over all towns, and the one-town version) on a chart. Run each 5 times and draw the average.',
    'In README.md write: what is different about the two curves (timing, height, shape), and why.'],
    'python -m src.main','The one-town curve peaks earlier and higher. The map curve is lower and wider, and may have a bumpy top because different towns peak at different days.'),
 ],
 done:['{{python -m pytest -q}} prints **3 passed**.','The map shows the outbreak spreading town to town.','Towns peak on different days.','You compared the map curve with the one-town curve.','README.md explains the difference.','Everything is saved with git.'],
 stuck:[['The check takes a minute.','Loop over towns, not over people, where you can. Use numpy masks.'],['The one-town test fails.','With {{travel = 0}} and one town the infection chance should be {{1 - exp(-beta * I / n)}} for everyone.'],['Nothing spreads between towns.','Travel is 0 or your rows of G do not add to 1.']]
};

GUIDES.s4p4 = {
 slug:'truss-solver', pip:['pygame','numpy'],
 files:[['src/__init__.py','empty file; lets Python import from src'],['src/truss.py','the finite element solver'],['src/main.py','pygame: the bridge bending under load'],['tests/test_truss.py','checks']],
 words:[['Truss','a frame made of straight bars joined at pins'],['Node','a joint'],['Member','one bar between two nodes'],['Tension','a bar being stretched (pulled)'],['Compression','a bar being squeezed (pushed)'],['Stiffness (k)','how much force a bar needs per metre of stretch. For a bar k equals EA divided by its length'],['Degree of freedom','one direction a node is allowed to move'],['Equilibrium','all forces on a joint add up to zero']],
 steps:[
  S('Do the hand calculation first','The answer to the first check comes from school physics. Do it before any code.',[
    'Draw this truss. Node 0 at (0, 0) pinned. Node 1 at (4, 0) pinned. Node 2 at (2, 3) free. Two bars: 0 to 2 and 1 to 2. A 100 newton load pulls node 2 straight down. Both bars have stiffness 1000 newtons per metre.',
    'By symmetry the two bars share the load equally. Each bar makes an angle with the ground. Its vertical share is 3 divided by the bar length, which is the square root of 13.',
    'Each bar force times that vertical share, times two bars, must equal 100. So each force is 100 divided by 2 times 0.8321 = 60.09 newtons, pushing (compression).',
    'Node 2 does not move sideways. It moves down by 0.0722 metres.'],
    null,'You now know: **vertical movement -0.0722 m**, **each bar -60.09 N** (the minus sign means compression). The computer must give the same answers.'),
  S('Write the checks','Two trusses. The second is a small bridge.',[
    'Open **tests/test_truss.py**. Write the code below. Run it. It fails.'],
    'python -m pytest -q tests/test_truss.py','A red **ImportError**.','Every node has two directions to move. Supports are pairs like {{(0, "xy")}} (cannot move at all) or {{(2, "y")}} (cannot move up or down, but can slide sideways).',
`import math
import numpy as np
from pytest import approx
from src.truss import solve_truss, equilibrium_error

def test_two_bar_truss():
    nodes = [(0, 0), (4, 0), (2, 3)]
    L = math.hypot(2, 3)
    members = [(0, 2, 1000.0), (1, 2, 1000.0)]          # (node, node, stiffness k = EA / L)
    fixed = [(0, "xy"), (1, "xy")]
    loads = {2: (0.0, -100.0)}
    u, forces = solve_truss(nodes, members, fixed, loads)
    assert u[2][0] == approx(0.0, abs=1e-9)
    assert u[2][1] == approx(-0.07222, abs=1e-4)
    assert forces == approx([-60.09, -60.09], abs=0.01)

def make_bridge():
    nodes = [(0, 0), (2, 0), (4, 0), (1, 1.5), (3, 1.5)]
    pairs = [(0, 1), (1, 2), (0, 3), (3, 1), (1, 4), (4, 2), (3, 4)]
    EA = 1e4
    members = [(i, j, EA / math.dist(nodes[i], nodes[j])) for i, j in pairs]
    return nodes, members, [(0, "xy"), (2, "y")], {1: (0.0, -100.0)}

def test_bridge():
    nodes, members, fixed, loads = make_bridge()
    u, forces = solve_truss(nodes, members, fixed, loads)
    assert u[1][1] == approx(-0.03937, abs=1e-4)
    assert forces == approx([33.33, 33.33, -60.09, 60.09, 60.09, -60.09, -66.67], abs=0.02)

def test_equilibrium_everywhere():
    nodes, members, fixed, loads = make_bridge()
    u, forces = solve_truss(nodes, members, fixed, loads)
    assert equilibrium_error(nodes, members, forces, loads, free_nodes=[1, 3, 4]) < 1e-6`),
  S('Write the solver','Build one big stiffness matrix.',[
    'Open **src/truss.py**.',
    'Write {{solve_truss(nodes, members, fixed, loads)}}. Make {{K = np.zeros((2n, 2n))}} where n is the number of nodes. Node {{i}} owns positions {{2i}} (sideways) and {{2i+1}} (up).',
    'For every member {{(a, b, k)}}: {{L = distance between the nodes}}, {{c = (xb - xa) / L}}, {{s = (yb - ya) / L}}. A small 2 by 2 block is {{k * [[c*c, c*s], [c*s, s*s]]}}. Add it to K at rows and columns of node a and node b: diagonal blocks get PLUS the block, the off-diagonal blocks get MINUS the block.',
    'Make the force vector {{F}} of length 2n from {{loads}}.',
    'Make a list of locked positions from {{fixed}}: "x" locks {{2i}}, "y" locks {{2i+1}}, "xy" locks both. {{free}} is everything else.',
    'Solve only the free part: {{u[free] = np.linalg.solve(K[np.ix_(free, free)], F[free])}}. (Later you can swap in your own solver.)',
    'For each member the stretch is {{(ub - ua) . (c, s)}}, that is {{(ux_b - ux_a) * c + (uy_b - uy_a) * s}}. The force is {{k * stretch}}. Positive means tension.',
    'Return {{(u_as_list_of_pairs, forces)}}. The {{u}} result must be indexable like {{u[2][1]}}.',
    'Write {{equilibrium_error(nodes, members, forces, loads, free_nodes)}}: for each free node add up the force vectors of its members pointing AWAY from that node (force times the unit vector toward the other node), plus the load. The biggest absolute total over all free nodes is the error. It should be nearly 0.'],
    'python -m pytest -q tests/test_truss.py','**3 passed** in green.','A bar in tension pulls both of its end nodes toward each other. So on node a it pushes along the unit vector toward node b.'),
  WIN('Truss Solver'),
  S('Draw the bridge and bend it','See it deform.',[
    'In **src/main.py** import {{solve_truss}} and build the bridge from the test (copy {{make_bridge}} into **src/truss.py** to share it).',
    'Scale 120 pixels per metre. Move the origin to screen (200, 450). Screen y is flipped.',
    'Draw each member as a line. Colour: blue if the force is positive (tension), red if negative (compression). Thickness: {{2 + abs(force) / 15}}.',
    'Deformation: draw the structure with every node moved by {{exaggeration * u}} where {{exaggeration = 300}} (the real movement is only millimetres). Use a factor {{t}} that rises from 0 to 1 over 60 frames so it bends smoothly.',
    'Draw nodes as circles. Draw the load as an arrow pointing down at the loaded node.',
    'Keys: LEFT and RIGHT change the load between 0 and 300 N in steps of 20 and re-solve. UP and DOWN change the exaggeration. 1 shows the two-bar truss and 2 shows the bridge.'],
    'python -m src.main','The bridge sags in the middle under the downward arrow. The two top-middle bars turn **red** (compression) and the bottom bars turn **blue** (tension). The thickest bar is the short top bar at the top, **66.67 N**. Doubling the load doubles every force.'),
  S('Name the weakest member','This is how engineers decide.',[
    'Print the member with the largest absolute force.',
    'Print the support reactions: the vertical force each support pushes up with. They should each be 50 N, half the load.',
    'Write both in README.md.'],
    null,'The largest force is member **3 to 4** (the top bar) at **-66.67 N**. Both reactions are **50 N**.'),
 ],
 done:['{{python -m pytest -q}} prints **3 passed**.','The two-bar truss gives -0.0722 m and -60.09 N.','The bridge sags with red and blue members.','Doubling the load doubles the forces.','README.md names the weakest member.','Everything is saved with git.'],
 stuck:[['The matrix is singular.','You locked too few positions, so the truss can slide or spin. The bridge needs three locks: x and y at one end, y at the other.'],['Forces have the wrong sign.','Check stretch equals the dot product of the movement difference with (c, s) from node a to node b.'],['The picture is upside down.','Screen y goes down. Subtract y from the origin height.']]
};

GUIDES.s4p5 = {
 slug:'rain-trends', pip:['pygame','numpy','requests'],
 files:[['src/__init__.py','empty file; lets Python import from src'],['src/regression.py','COPIED from climate-trend-live'],['src/mk.py','the Mann-Kendall test'],['src/nasa.py','downloads monthly rain for a grid of points'],['src/main.py','pygame: the test being computed, then the map'],['tests/test_mk.py','checks'],['data/','downloaded rain goes here']],
 words:[['Trend','rainfall going up or down over the years'],['Mann-Kendall test','compare every pair of years. Count pairs where the later year is wetter (plus) and drier (minus)'],['S','plus pairs minus minus pairs'],['Z score','S rescaled so it can be compared with a bell curve'],['p-value','the chance of seeing a trend this strong from pure luck. Below 0.05 means "probably real"'],['Significant','passed the p below 0.05 test'],['Grid','a regular lattice of places']],
 steps:[
  S('Copy your line fitter and write the checks','The test is a counting game you can do by hand.',[
    'Copy **regression.py** from climate-trend-live. Mac or Linux first command. Windows second.',
    'Open **tests/test_mk.py**. Write the code below. Run it. It fails.'],
    'cp ../climate-trend-live/src/regression.py src/regression.py\n# Windows instead:\nCopy-Item ..\\climate-trend-live\\src\\regression.py src\\regression.py\npython -m pytest -q tests/test_mk.py','A red **ImportError**.','For 1, 3, 2, 4 the pairs are: 1 to 3 up, 1 to 2 up, 1 to 4 up, 3 to 2 down, 3 to 4 up, 2 to 4 up. That is 5 up and 1 down, so S = 4.',
`from pytest import approx
from src.mk import mk_s, mk_z, mk_p

def test_s_by_hand():
    assert mk_s([1, 2, 3, 4, 5]) == 10
    assert mk_s([5, 4, 3, 2, 1]) == -10
    assert mk_s([1, 3, 2, 4]) == 4
    assert mk_s([2, 2, 2]) == 0

def test_z_and_p():
    z = mk_z([1, 2, 3, 4, 5])
    assert z == approx(2.2045, abs=0.001)
    assert mk_p(z) == approx(0.0275, abs=0.001)
    assert mk_p(0.0) == approx(1.0)

def test_no_trend_is_not_significant():
    assert mk_p(mk_z([3, 1, 4, 1, 5, 9, 2, 6, 5, 3, 5])) > 0.05`),
  S('Write the test','Counting pairs.',[
    'Open **src/mk.py**. {{import math}}.',
    'Write {{mk_s(values)}}: for every pair of positions {{i < j}} add {{+1}} if {{values[j] > values[i]}}, {{-1}} if smaller, and 0 if equal. Return the total.',
    'Write {{mk_z(values)}}: {{n = len(values)}}, {{var = n * (n - 1) * (2 * n + 5) / 18}}. If S is greater than 0 then {{z = (S - 1) / sqrt(var)}}, if S is less than 0 then {{z = (S + 1) / sqrt(var)}}, and if S is 0 then {{z = 0}}.',
    'Write {{mk_p(z)}}: the two-sided p-value {{2 * (1 - phi(abs(z)))}} where {{phi(x) = 0.5 * (1 + math.erf(x / math.sqrt(2)))}}.'],
    'python -m pytest -q tests/test_mk.py','**3 passed** in green.'),
  S('Download rain for a grid of 64 places','A small grid over East Africa.',[
    'Open **src/nasa.py**. Write {{fetch_annual_rain(lat, lon)}} using {{https://power.larc.nasa.gov/api/temporal/monthly/point?parameters=PRECTOTCORR&community=RE&longitude=LON&latitude=LAT&start=1991&end=2023&format=JSON}}.',
    'In {{["properties"]["parameter"]["PRECTOTCORR"]}} the keys that END in **13** are the yearly averages (mm per day). Collect those in year order. You should get 33 numbers.',
    'Write {{fetch_grid()}}: latitudes {{[-4, -2, 0, 2, 4, 6, 8, 10]}} and longitudes {{[30, 32, 34, 36, 38, 40, 42, 44]}}. For each of the 64 pairs call {{fetch_annual_rain}}, wait half a second with {{time.sleep(0.5)}} between calls, and save to a file in **data/** named after the pair. Skip pairs already saved.',
    'Return a dictionary from {{(lat, lon)}} to the list of 33 values.'],
    `python -c "from src.nasa import fetch_annual_rain as f; v = f(0, 34); print(len(v), round(v[0], 2))"`,'**33** and a number between about **1 and 6** (millimetres per day). The first full download of 64 places takes 1 to 3 minutes.'),
  WIN('Rain Trends'),
  S('Watch the test count its pairs on ONE place','The statistic, drawn.',[
    'In **src/main.py** load the series for one place, for example {{(0, 34)}}. 33 years gives 528 pairs.',
    'Draw the 33 yearly values as dots on a timeline (x is the year, y is the rainfall).',
    'Each frame, take the next {{5}} pairs. For each pair draw a thin line between the two dots: green if the later value is bigger, red if smaller, gray if equal.',
    'Keep counters for green, red and the running {{S = green - red}} and show them.',
    'When all 528 pairs are drawn show {{mk_z}}, {{mk_p}}, the slope per decade from {{fit_line}} (slope times 10) and the verdict **significant** or **not significant** for p below 0.05.'],
    'python -m src.main','Green and red lines pile up across the dots. If green wins, S is positive. The final S shown matches {{mk_s}}. A verdict appears. Many places say **not significant**. That is normal.'),
  S('Paint the whole map','Now all 64 places.',[
    'Press **M** to switch to the map. Draw an 8 by 8 grid of squares, 70 pixels each, north at the top (latitude 10 at the top row).',
    'For each place compute {{mk_p}} and the slope per decade. Colour a square blue if the slope is positive (getting wetter) and brown if negative (getting drier). Stronger slope means a stronger colour.',
    'If p is 0.05 or more, draw the square GRAY. Gray means the trend cannot be told from luck.',
    'Show how many of the 64 places are significant.',
    'Press **Q** to go back to the one-place view and click a square to choose that place.',
    'In README.md answer: how many places are significant? Which direction? Compare with one published statement about East African rainfall (for example the "East African climate paradox" of drying long rains and wetter short rains) and say whether you agree.'],
    'python -m src.main','Most squares are gray. A few may be coloured. If almost nothing is significant, say so honestly in README.md. Do not claim a trend your test does not support.'),
 ],
 done:['{{python -m pytest -q}} prints **3 passed**.','The one-place view counts pairs and shows S, Z and p.','The map has gray cells for non-significant places.','README.md reports the number of significant places and compares with a published statement.','Everything is saved with git.'],
 stuck:[['Only 32 or 34 values per place.','Make sure you keep ONLY keys ending in 13 and years 1991 to 2023.'],['The download is slow.','The program waits half a second per place on purpose. Let it run.'],['Every cell is gray.','That can be true. Check one place by hand with a clear trend to make sure your code works.']]
};

GUIDES.s4p6 = {
 slug:'wave-sonar', pip:['pygame','numpy'],
 files:[['src/__init__.py','empty file; lets Python import from src'],['src/wave.py','the wave solver and depth estimate'],['src/main.py','pygame: ripples and echoes'],['tests/test_wave.py','checks']],
 words:[['Wave equation','a rule that says a bump travels instead of fading'],['Wave speed (c)','how fast the wave travels. 1500 m/s in water, 3000 m/s in some rock'],['Ricker wavelet','a short pulse, a bump with two dips beside it'],['CFL condition','a time step must be small enough that a wave cannot cross more than one cell per step. In 2D the safe limit is c times dt divided by dx at most 0.7071'],['Reflection','part of a wave bouncing back from a change in the medium'],['Receiver','a point where you record the wave over time'],['Travel time','how long a wave takes to go from the source to a receiver']],
 steps:[
  S('Write the checks','The speed, the safety rule and the depth all have right answers.',[
    'Open **tests/test_wave.py**. Write the code below. Run it. It fails.'],
    'python -m pytest -q tests/test_wave.py','A red **ImportError**.','The source is at the top, column 150. The receivers are at 0, 100, 200 and 300 metres to its right. A hidden layer of fast rock lies 200 metres down.',
`import math
import numpy as np
import pytest
from pytest import approx
from src.wave import ricker, check_cfl, run_wave, direct_speed, estimate_depths

def test_ricker_peak():
    assert ricker(0.08) == approx(1.0)

def test_cfl_rule():
    check_cfl(1500, 0.001, 5.0)                    # fine
    with pytest.raises(ValueError):
        check_cfl(3000, 0.002, 5.0)                # 3000 * 0.002 / 5 = 1.2 is too big

def test_speed_in_uniform_water():
    traces = run_wave(layered=False)
    assert 1400 < direct_speed(traces) < 1600

def test_depth_from_the_echo():
    uniform = run_wave(layered=False)
    layered = run_wave(layered=True)
    for h in estimate_depths(layered, uniform):
        assert abs(h - 200) < 10                   # within 5 percent`),
  S('Write the solver','The wave equation on a grid.',[
    'Open **src/wave.py**. {{import math, numpy as np}}.',
    'Constants: {{NX = 300}}, {{NZ = 200}}, {{DX = 5.0}} metres, {{DT = 0.001}} seconds, {{F0 = 15.0}} hertz, {{T0 = 0.08}}, the source at row 2 column 150, receivers on row 2 at columns {{[150, 170, 190, 210]}} (offsets 0, 100, 200, 300 metres), interface at row 40 (200 metres), and {{OFFSETS = [0, 100, 200, 300]}}.',
    'Write {{ricker(t, f0=F0, t0=T0)}}: with {{a = (math.pi * f0 * (t - t0)) ** 2}} the value is {{(1 - 2 * a) * math.exp(-a)}}.',
    'Write {{check_cfl(c_max, dt, dx)}}: if {{c_max * dt / dx > 0.7071}} then {{raise ValueError("time step too big")}}.',
    'Write {{run_wave(layered, t_end=0.7)}}. Make {{c = np.full((NZ, NX), 1500.0)}}. If layered, set {{c[40:, :] = 3000.0}}. Call {{check_cfl}} with the biggest speed. Make {{cc = (c * DT / DX) ** 2}}. Two pressure fields {{p_old}} and {{p}} start at zero.',
    'Each step: {{lap}} is zero except inside, where it is the four neighbours added minus 4 times the centre (like the heat equation). The new field is {{p_new = 2 * p - p_old + cc * lap}}. Add the source: {{p_new[2, 150] += ricker(step * DT)}}. Set all four edge lines of {{p_new}} to 0. Then shift: {{p_old = p}} and {{p = p_new}}.',
    'After each step record the value at each receiver. Return an array of shape (4, number of steps).',
    'Write {{direct_speed(traces)}}: for receivers 1 and 3 (offsets 100 and 300), find the time of the biggest absolute value in the first 0.4 seconds. Speed is 200 metres divided by the difference of those two times.',
    'Write {{estimate_depths(layered, uniform)}}: the difference trace is {{layered - uniform}}. For each receiver find the time {{t}} of the biggest absolute value of the difference. The depth is {{0.5 * sqrt((1500 * (t - T0)) ** 2 - offset ** 2)}}. Return a list of four depths.'],
    'python -m pytest -q tests/test_wave.py','**4 passed** in green.','Subtracting the uniform run removes the direct wave and leaves only the echo. That works because the wave equation is linear.'),
  WIN('Wave Sonar'),
  S('Watch the ripple','The pulse spreads as a ring.',[
    'In **src/main.py** import what you need from **src/wave.py**. Make the solver step-by-step: put the stepping code in a small class {{Wave}} with a {{step()}} method that advances one step (reuse the code from {{run_wave}}).',
    'Window 1000 by 700. Draw the pressure field {{p}} at 3 pixels per cell starting at screen (50, 20). Colour: positive is red, negative is blue, zero is black. Scale colours by 0.02 so the pulse is visible.',
    'Use {{pygame.surfarray.make_surface}} on a colour array and {{pygame.transform.scale}}.',
    'Draw the interface as a dotted white line at row 40 (screen y = 20 + 40 * 3) when layered. Draw receivers as small white triangles along the top.',
    'Run {{steps_per_frame = 3}} steps per frame.',
    'Keys: **1** uniform water, **2** layered, **SPACE** pause, **R** restart, **UP / DOWN** change steps per frame between 1 and 10.'],
    'python -m src.main','A red ring expands from the top centre. In the layered medium, when it reaches the line at 200 m part of it bounces back as a fainter ring going up and the rest continues down faster. At t = 0.35 s the echo reaches the surface.'),
  S('Draw the seismogram and estimate the depth','Listen to the echo.',[
    'Draw a strip at the bottom of the window, 100 pixels tall, showing the live trace of receiver 0 so far: x is time, y is the recorded value.',
    'Press **D**: run both media, subtract, and print the four estimated depths on screen. Show the true depth 200 m next to them.'],
    'python -m src.main','The trace shows the direct pulse at about **0.08 s** and the echo at about **0.35 s**. The four depth estimates are all between **190 and 210 m**.'),
  S('Break the stability rule on purpose','See the CFL condition fail.',[
    'Press **X** to switch DT to 0.002 and restart in the layered medium.',
    'Watch.',
    'Press **X** again to return to 0.001.'],
    'python -m src.main','With DT = 0.002 the fast layer has c times dt divided by dx = **1.2**, above 0.7071. Within about **65 steps** the picture fills with huge red and blue noise. At DT = 0.001 it is calm.','Your {{check_cfl}} would have stopped this for you. Temporarily remove the check only for this experiment.'),
 ],
 done:['{{python -m pytest -q}} prints **4 passed**.','The measured speed in water is within 7 percent of 1500 m/s.','All four depth estimates are within 10 m of 200 m.','You saw the ring and the echo.','You saw DT = 0.002 explode.','Everything is saved with git.'],
 stuck:[['Everything is black.','The colour scale is too small. Multiply by a bigger number or print the biggest value of {{p}}.'],['The depth estimates are about 100 or 400.','Use the difference between layered and uniform, and subtract T0 before multiplying by 1500.'],['A shape error with surfarray.','The array must have shape (width, height, 3). Transpose your field with {{.T}} first.']]
};

GUIDES.s4p7 = {
 slug:'turing-patterns', pip:['pygame','numpy'],
 files:[['src/__init__.py','empty file; lets Python import from src'],['src/gray_scott.py','the two-chemical solver and presets'],['src/main.py','pygame: patterns growing live'],['tests/test_gray_scott.py','checks']],
 words:[['Reaction','chemicals turning into each other'],['Diffusion','spreading out'],['U and V','two chemicals. V eats U and makes more V'],['Feed rate (f)','how fast fresh U is added'],['Kill rate (k)','how fast V is removed'],['Turing pattern','spots or stripes that appear by themselves from diffusing, reacting chemicals'],['Laplacian','the sum of the neighbours minus the centre. It measures how different a cell is from the cells around it']],
 steps:[
  S('Write the checks','The key check: with no V, your solver must just be diffusion.',[
    'Open **tests/test_gray_scott.py**. Write the code below. Run it. It fails.'],
    'python -m pytest -q tests/test_gray_scott.py','A red **ImportError**.','The Laplacian here uses the nine-cell recipe: neighbours up, down, left, right count 0.2 each, the four diagonal neighbours count 0.05 each, and the centre counts -1.',
`import numpy as np
from pytest import approx
from src.gray_scott import gs_step, laplacian, PRESETS, new_state

def lap_reference(Z):
    n, m = Z.shape; out = np.zeros_like(Z)
    for i in range(n):
        for j in range(m):
            s = -Z[i, j]
            for di in (-1, 0, 1):
                for dj in (-1, 0, 1):
                    if di == 0 and dj == 0: continue
                    w = 0.2 if di == 0 or dj == 0 else 0.05
                    s += w * Z[(i + di) % n, (j + dj) % m]
            out[i, j] = s
    return out

def test_laplacian_matches_a_slow_loop():
    Z = np.random.default_rng(0).random((12, 12))
    assert np.allclose(laplacian(Z), lap_reference(Z))

def test_no_v_means_pure_diffusion():
    U = np.random.default_rng(1).random((12, 12)); V = np.zeros((12, 12))
    U2, V2 = gs_step(U, V, f=0.0, k=0.06)           # no feed, no V
    assert np.allclose(U2, U + 1.0 * lap_reference(U))
    assert np.allclose(V2, 0.0)

def test_empty_dish_stays_empty():
    U = np.ones((12, 12)); V = np.zeros((12, 12))
    U2, V2 = gs_step(U, V, f=0.03, k=0.06)
    assert np.allclose(U2, 1.0) and np.allclose(V2, 0.0)

def test_presets_and_start():
    assert len(PRESETS) == 6
    U, V = new_state(160, seed=0)
    assert U.shape == (160, 160) and V.max() > 0.2`),
  S('Write the solver','Two chemicals on one grid.',[
    'Open **src/gray_scott.py**. {{import numpy as np}}.',
    'Write {{laplacian(Z)}} using {{np.roll}}: {{-Z + 0.2 * (up + down + left + right) + 0.05 * (the four diagonals)}}. Up is {{np.roll(Z, 1, 0)}}, down is {{np.roll(Z, -1, 0)}}, left is {{np.roll(Z, 1, 1)}}, right is {{np.roll(Z, -1, 1)}}. A diagonal is a roll of a roll.',
    'Write {{gs_step(U, V, f, k, Du=1.0, Dv=0.5)}}. With {{uvv = U * V * V}}: {{U_new = U + Du * laplacian(U) - uvv + f * (1 - U)}} and {{V_new = V + Dv * laplacian(V) + uvv - (f + k) * V}}. The time step is 1. Return {{(U_new, V_new)}}.',
    'Write {{new_state(n, seed=None)}}: {{U}} all ones, {{V}} all zeros. In the middle, a square from {{n//2 - 14}} to {{n//2 + 14}} in both directions gets {{U = 0.5}} and {{V = 0.25}}. Then add {{0.02 * rng.random((n, n))}} to V (a little noise).',
    'Write {{PRESETS}}, a dictionary with six entries, each a pair {{(f, k)}}: "spots" 0.030 and 0.062, "stripes" 0.022 and 0.051, "coral" 0.0545 and 0.062, "rings" 0.029 and 0.057, "worms" 0.045 and 0.063, "dividing spots" 0.0367 and 0.0649.'],
    'python -m pytest -q tests/test_gray_scott.py','**4 passed** in green.'),
  WIN('Turing Patterns'),
  S('Grow a pattern live','The payoff.',[
    'In **src/main.py** import {{gs_step}}, {{new_state}}, {{PRESETS}}. Use a 160 by 160 grid. Change the window to 1000 by 640 by editing the numbers in the template (or just keep 600 high and scale to 3 pixels per cell).',
    'Start with preset "spots": {{f, k = PRESETS["spots"]}}. {{U, V = new_state(160, seed=1)}}.',
    'Each frame run {{gs_step}} 8 times.',
    'Draw V as colours: make an array of 160 by 160 by 3 from V. Simple rule: {{r = V * 600}}, {{g = V * 900}}, {{b = 150 + V * 300}}, all clipped to 0 to 255. Use {{pygame.surfarray.make_surface}} and scale it up to 4 pixels per cell.',
    'Keys 1 to 6 choose a preset and restart. R restarts with a new seed. SPACE pauses.',
    'Show the preset name, f, k and the number of steps so far.'],
    'python -m src.main','At first a small noisy square in the centre. Then waves spread out. After about **9000 steps** (roughly 20 to 40 seconds) the pattern stops changing. **Spots**: hexagonally packed dots. **Stripes**: long winding stripes. **Coral**: a branching maze. **Rings**: concentric rings around the centre. **Worms**: short wiggly pieces. **Dividing spots**: scattered separate dots.','If it is slow, lower to 4 steps per frame. If a preset dies out (all dark), press R for a new seed.'),
  S('Prove the pattern comes from f and k, not luck','A scientific control.',[
    'Pick "spots". Run it with seed 1 and note what you see. Run it again with seed 2.',
    'Count the spots in each (roughly). Write what stayed the same and what changed in README.md.',
    'Add a mouse tool: clicking adds a burst of V (a 5 by 5 block set to 0.25) at the mouse. Watch the pattern heal around it.'],
    'python -m src.main','Both seeds give the same KIND of pattern (hexagonal spots) in different positions. The click makes a new spot or a ripple that settles into the pattern again.'),
  S('Make a parameter map','A real parameter study.',[
    'Press **P**: show six small thumbnails (160 by 160 scaled down to 3 per cell) side by side, one per preset, all growing at the same time.',
    'Take a screenshot with {{pygame.image.save(screen, "presets.png")}} when the key **S** is pressed.',
    'Put the screenshot and the six f and k pairs in your README.md.'],
    'python -m src.main','Six panels growing together. Each shows a different pattern family. A picture file appears in the project folder.'),
 ],
 done:['{{python -m pytest -q}} prints **4 passed**.','Spots, stripes, coral, rings, worms and dividing spots all appear.','Two different seeds give the same pattern family.','presets.png is in your README.md with the f and k values.','Everything is saved with git.'],
 stuck:[['The screen is black from the start.','V is tiny so the colours are near zero. Multiply V by a bigger number in the colour rule.'],['All V disappears.','The seed square is too small or the preset is fragile. Use the 28 by 28 square and try another seed.'],['A shape error with surfarray.','The array must be (width, height, 3) of integers 0 to 255. Use {{.astype("uint8")}}.']]
};

GUIDES.s5p1 = {
 slug:'nbody-speed', pip:['pygame','numpy','numba'],
 files:[['src/__init__.py','empty file; lets Python import from src'],['src/gravity.py','three versions of the same force calculation'],['src/main.py','pygame swirling cloud'],['bench.py','timing table'],['tests/test_gravity.py','checks']],
 words:[['N-body','many bodies pulling on each other'],['O of N squared','the work grows with the square of the number of bodies'],['Vectorising','using whole-array maths instead of Python loops'],['JIT compiler','turns Python into fast machine code the first time a function runs'],['Softening','a tiny number that stops the force exploding when two bodies are very close'],['Leapfrog','a time-stepping method that keeps energy steady for orbits'],['Profiling','measuring where the time goes']],
 steps:[
  S('Write the checks','Three versions of the same force must agree to many decimals.',[
    'Open **tests/test_gravity.py**. Write the code below. Run it. It fails.'],
    'python -m pytest -q tests/test_gravity.py','A red **ImportError**.','Check 2 puts a tiny planet around a heavy star in units where G times the star mass is 1. After one lap it must come back.',
`import numpy as np
from pytest import approx
from src.gravity import acc_python, acc_numpy, acc_numba, leapfrog

def random_bodies(n, seed=0):
    rng = np.random.default_rng(seed)
    return rng.normal(size=(n, 3)), rng.random(n) + 0.5

def test_three_versions_agree():
    pos, mass = random_bodies(30)
    a = acc_python(pos, mass, 0.01)
    b = acc_numpy(pos, mass, 0.01)
    c = acc_numba(pos, mass, 0.01)
    assert np.allclose(a, b, rtol=1e-9, atol=1e-12)
    assert np.allclose(a, c, rtol=1e-9, atol=1e-12)

def test_planet_returns_after_one_lap():
    pos = np.array([[0.0, 0.0, 0.0], [1.0, 0.0, 0.0]])
    vel = np.array([[0.0, 0.0, 0.0], [0.0, 1.0, 0.0]])
    mass = np.array([1.0, 1e-9])
    n = 6283
    for _ in range(n):
        pos, vel = leapfrog(pos, vel, mass, 0.001, 0.0, acc_numpy)
    assert pos[1] == approx([1.0, 0.0, 0.0], abs=0.02)`),
  S('Write the three force functions','Same maths, three speeds.',[
    'Open **src/gravity.py**. {{import numpy as np}} and {{from numba import njit}}.',
    'The pull on body {{i}} from body {{j}} is {{mass[j] * (pos[j] - pos[i]) / (distance_squared + eps**2) ** 1.5}} where {{distance_squared}} is the sum of the squares of the three coordinate differences. The acceleration of body i is the sum over every {{j != i}}. Units are such that G is 1.',
    'Write {{acc_python(pos, mass, eps)}} with TWO plain {{for}} loops over {{i}} and {{j}} and an inner loop or three lines over the coordinates. Return an array of shape (N, 3). Convert lists to numpy at the end.',
    'Write {{acc_numpy(pos, mass, eps)}} with NO loops: {{d = pos[None, :, :] - pos[:, None, :]}} has shape (N, N, 3). {{r2 = (d ** 2).sum(axis=2) + eps ** 2}}. Put zeros on the diagonal of the weights: {{w = mass[None, :] / r2 ** 1.5}} then {{np.fill_diagonal(w, 0.0)}}. The answer is {{(w[:, :, None] * d).sum(axis=1)}}.',
    'Write {{acc_numba(pos, mass, eps)}}: copy {{acc_python}} exactly, put {{@njit}} on the line above it and write the array maths with numpy arrays instead of lists (make the output with {{np.zeros((n, 3))}} and fill it with the loops). The first call is slow because numba compiles the function.',
    'Write {{leapfrog(pos, vel, mass, dt, eps, acc_fn)}}: {{a = acc_fn(pos, mass, eps)}}, {{vel = vel + 0.5 * dt * a}}, {{pos = pos + dt * vel}}, {{a = acc_fn(pos, mass, eps)}}, {{vel = vel + 0.5 * dt * a}}. Return {{(pos, vel)}}.'],
    'python -m pytest -q tests/test_gravity.py','**2 passed** in green. The second check may take 5 to 20 seconds.','If numba is not installed, run {{pip install numba}} with the environment active. If it refuses your Python version, use Python 3.12.'),
  S('Measure how long each version takes','Never guess speed. Measure it.',[
    'Make **bench.py** in the project root.',
    'For N in 50, 100, 200, 400, 800: make random bodies, and for each of the three functions measure the time of one call. Run {{acc_numba}} once first to warm it up. Use {{time.perf_counter()}} before and after.',
    'For the pure Python version skip N = 800 if it takes more than a minute.',
    'Print a table: N, python seconds, numpy seconds, numba seconds, and python divided by numba.',
    'Copy the table into README.md.'],
    'python bench.py','A table. Doubling N makes **every column about 4 times slower**, because the work grows with N squared. At N = 400 the pure Python column is **hundreds of times slower** than numba. Your exact seconds depend on your computer. Write the measured ratio in README.md.','Numpy and numba times can look flat at small N because of overhead. Look at the large N rows.'),
  WIN('N-Body Speed'),
  S('Make a cloud of 300 bodies pull on each other','Primer style gravity.',[
    'In **src/main.py** make 300 bodies: positions from a flat disk (x and y random in a circle of radius 1, z = 0), masses {{1 / 300}}, velocities: each body moves around the centre with speed {{0.5 * radius ** 0.5}} counter-clockwise (the direction is {{(-y, x)}} divided by the radius).',
    'Use {{eps = 0.05}} and {{dt = 0.005}}. Take 2 leapfrog steps per frame with {{acc_numba}}.',
    'Draw the x and y of each body as a white pixel or radius-2 circle at 300 pixels per unit around the screen centre. Colour each by speed (slow blue, fast yellow).',
    'Keys: **P**, **N**, **B** switch between {{acc_python}}, {{acc_numpy}}, {{acc_numba}}. Show the name and the milliseconds per frame on screen.',
    'Key **1** starts a cold cloud with zero velocity. Key **2** starts the rotating disk. **R** restarts.'],
    'python -m src.main','Key 2: a spinning disk that develops clumps and spiral arms. Key 1: the cloud falls together into a dense knot. Switching to **P** makes the window crawl at a few frames per second. **B** is smooth.'),
 ],
 done:['{{python -m pytest -q}} prints **2 passed**.','The benchmark table is in README.md with a measured speedup.','You can switch between the three versions live and feel the difference.','The disk shows clumping.','Everything is saved with git.'],
 stuck:[['Numba says it cannot type something.','Use only numpy arrays and plain numbers inside the numba function. No lists, no dictionaries.'],['The first numba call takes seconds.','That is the compile time. Call it once before you start timing.'],['Bodies shoot away at high speed.','Two bodies came very close. Raise eps to 0.05 or lower dt.']]
};

GUIDES.s5p2 = {
 slug:'ensemble-forecast', pip:['pygame','numpy'],
 files:[['src/__init__.py','empty file; lets Python import from src'],['src/seir_fast.py','a fast SEIR run that returns the whole infection curve'],['src/ensemble.py','sampling and running many simulations'],['src/main.py','pygame fan chart growing live'],['tests/test_ensemble.py','checks']],
 words:[['Ensemble','a big set of simulations, each with slightly different inputs'],['Uncertainty','not knowing the exact value of an input'],['Parameter sample','one random choice of beta, sigma and gamma'],['Percentile','the value below which that share of results fall. The 10th and 90th percentiles bracket the middle 80 percent'],['Process','a separate copy of Python running on its own processor core'],['Speedup','serial time divided by parallel time'],['Embarrassingly parallel','a job made of many independent pieces']],
 steps:[
  S('Write the checks','The ensemble must be repeatable and parallel must give the same answers as serial.',[
    'Open **tests/test_ensemble.py**. Write the code below. Run it. It fails.'],
    'python -m pytest -q tests/test_ensemble.py','A red **ImportError**.',null,
`import numpy as np
from pytest import approx
from src.seir_fast import run_one
from src.ensemble import sample_params, run_serial, run_parallel

def test_one_run_matches_the_ode():
    peak, day, curve = run_one((0.5, 0.2, 0.1))
    assert peak == approx(0.305, abs=0.003)
    assert len(curve) == 250

def test_sampling_is_repeatable():
    a = sample_params(500, seed=0); b = sample_params(500, seed=0)
    assert np.array_equal(a, b)
    assert a[:, 0].mean() == approx(0.5, abs=0.02)

def test_parallel_equals_serial():
    params = sample_params(40, seed=1)
    s = run_serial(params)
    p = run_parallel(params, workers=2)
    assert np.allclose([r[0] for r in s], [r[0] for r in p])`),
  S('Write the fast SEIR run','Use fractions of the population, so N is 1.',[
    'Open **src/seir_fast.py**. {{import numpy as np}}.',
    'Write {{run_one(params, i0=0.001, dt=0.2, days=250)}} where {{params = (beta, sigma, gamma)}}. State is {{[S, E, I, R]}} as fractions: start {{[1 - i0, 0, i0, 0]}}.',
    'Derivatives: {{inf = beta * S * I}}, then {{[-inf, inf - sigma * E, sigma * E - gamma * I, gamma * I]}}.',
    'Use RK4 with step {{dt}}. After each whole day (every {{round(1 / dt)}} steps) store {{I}} in a list called {{curve}}.',
    'Return {{(peak, peak_day, curve)}} where {{peak = max(curve)}} and {{peak_day = curve.index(peak)}}.'],
    null,'The check for one run is about to pass. A run takes about 12 milliseconds.'),
  S('Write the sampling and the serial run','Draw random inputs from bell curves.',[
    'Open **src/ensemble.py**. {{import numpy as np}} and {{from multiprocessing import Pool}}.',
    'Write {{sample_params(n, seed)}}. Make {{rng = np.random.default_rng(seed)}}. Then {{beta = np.clip(rng.normal(0.5, 0.1, n), 0.15, None)}}, {{sigma = np.clip(rng.normal(0.2, 0.04, n), 0.08, None)}}, {{gamma = np.clip(rng.normal(0.1, 0.02, n), 0.04, None)}}. Draw them in THAT ORDER. Return {{np.column_stack([beta, sigma, gamma])}}.',
    'Write {{run_serial(params)}}: a plain loop calling {{run_one(tuple(row))}} for each row. Return the list of results.'],
    'python -m pytest -q tests/test_ensemble.py','2 passed and 1 failing (the parallel one).'),
  S('Write the parallel run','Spread the work over every core.',[
    'In **src/ensemble.py** write {{run_parallel(params, workers=None)}}: {{with Pool(workers) as pool: return pool.map(run_one, [tuple(r) for r in params])}}. Import {{run_one}} from {{src.seir_fast}} at the top of the file.',
    'IMPORTANT: on Windows and Mac, anything that starts processes must be called from code that sits under {{if __name__ == "__main__":}}. The tests already do that for you. Remember it for the next steps.'],
    'python -m pytest -q tests/test_ensemble.py','**3 passed** in green.'),
  S('Time it and look at the distribution','Measure the speedup honestly.',[
    'Make **bench.py** in the project root. Put ALL its code under {{if __name__ == "__main__":}}.',
    'Make {{params = sample_params(500, seed=0)}}. Time {{run_serial}} and then {{run_parallel}} with {{time.perf_counter()}}.',
    'Print: serial seconds, parallel seconds, the speedup, and how many cores you have ({{os.cpu_count()}}).',
    'Compute the 10th, 50th and 90th percentiles of the peaks with {{np.percentile(peaks, [10, 50, 90])}}.',
    'In README.md write the speedup and one sentence on why it is below the core count.'],
    'python bench.py','Serial takes **about 6 seconds**. Parallel takes less. On 4 cores the speedup is typically **2.5 to 3.5**, never exactly 4. The percentiles are about **0.20, 0.30, 0.40**: with these input uncertainties, between 20 and 40 percent of the population is infected at the peak.'),
  WIN('Ensemble Forecast'),
  S('Watch the cloud of futures take shape','Uncertainty, drawn.',[
    'IMPORTANT: put everything that opens a window inside {{def main():}} and call it under {{if __name__ == "__main__":}}. Otherwise each worker process opens its own window.',
    'In **src/main.py** inside {{main()}}: make {{params = sample_params(500, seed=0)}} and start {{pool = Pool()}}. Get results one at a time with {{results = pool.imap(run_one, [tuple(r) for r in params], chunksize=5)}}.',
    'Each frame take up to 10 results with {{next(results)}} (stop when it raises {{StopIteration}}). Store the curves in a list.',
    'Plot area: day 0 to 250 across screen x 80 to 920, infected fraction 0 to 0.7 up screen y 540 to 80.',
    'Draw every stored curve as a thin, see-through line (colour with alpha 30, drawn on a transparent surface).',
    'Draw the 10th to 90th percentile band so far as a filled translucent polygon, and the median as a bright line. Compute them per day with {{np.percentile(np.array(curves), [10, 50, 90], axis=0)}}.',
    'Show how many runs are done.'],
    'python -m src.main','Curves appear in a fan. The shaded band wobbles at first and then settles. After 500 runs the median peaks near **0.30** around **day 45** and the band is wide: some futures peak early and high, others late and low.'),
 ],
 done:['{{python -m pytest -q}} prints **3 passed**.','Your bench prints a real speedup and the percentiles.','The fan chart builds up live and the band settles.','README.md explains why the speedup is below the core count.','Everything is saved with git.'],
 stuck:[['Many windows open at once.','Your window code is not inside {{main()}} under the {{if __name__}} guard.'],['A pickle error.','Functions given to {{Pool}} must be defined at the top level of a file, not inside another function and not a lambda.'],['Parallel is slower than serial.','The work per run is too small, or only 1 core exists. That is a real finding. Write it down.']]
};

GUIDES.s5p3 = {
 slug:'high-res-heat', pip:['pygame','numpy','numba'],
 files:[['src/__init__.py','empty file; lets Python import from src'],['src/kernels.py','the same solver written three ways'],['src/main.py','pygame: high resolution live'],['bench.py','the timing table'],['tests/test_kernels.py','checks']],
 words:[['Resolution','how many cells your grid has. 1200 by 1200 is 1.44 million cells'],['Kernel','the small piece of code that runs on every cell'],['Vectorised','whole-array maths in numpy, with no Python loop'],['prange','a numba loop that runs on several cores at once'],['Core','one processor in your computer. Most laptops have 4 to 8'],['GPU','a graphics chip with thousands of tiny cores'],['Crossover','the problem size at which a faster method starts to win']],
 steps:[
  S('Write the checks','All versions must give the SAME numbers. Speed without correctness is worthless.',[
    'Open **tests/test_kernels.py**. Write the code below. Run it. It fails.'],
    'python -m pytest -q tests/test_kernels.py','A red **ImportError**.','This check reuses the exact same stability rule you proved in the heat-diffusion project: r must be at most 0.25 in 2D.',
`import numpy as np
from src.kernels import step_numpy, step_numba, available_backends

def start(n):
    u = np.zeros((n, n)); u[n // 3: 2 * n // 3, n // 3: 2 * n // 3] = 100.0
    return u

def test_numba_matches_numpy_exactly():
    a = start(120); b = a.copy()
    for _ in range(50):
        a = step_numpy(a, 0.2)
    b = step_numba(b, 0.2, 50)
    assert np.allclose(a, b, atol=1e-9)

def test_heat_only_spreads_and_fades():
    u = start(120); first = u.max()
    for _ in range(50):
        u = step_numpy(u, 0.2)
    assert u.max() < first and u.min() >= -1e-9

def test_backends_listed():
    b = available_backends()
    assert "numpy" in b and "numba" in b          # "cuda" only if you have an NVIDIA card`),
  S('Write the same solver three ways','One maths rule, three speeds.',[
    'Open **src/kernels.py**.',
    'Write {{step_numpy(u, r)}}: exactly the 2D step from your heat-diffusion project, using {{np.roll}}. It returns a NEW array and sets the four edges to 0.',
    'Write {{step_numba(u, r, steps)}} with {{@njit(parallel=True, fastmath=True)}} from numba. Inside: repeat {{steps}} times, loop {{for i in prange(1, n-1)}} and {{for j in range(1, m-1)}} writing into a second array {{out}}, then copy {{out}} back into {{u}}, then set the four edge lines to 0. Make {{out}} once outside the repeat loop, not inside.',
    'Write {{available_backends()}} returning a list. Always include {{"numpy"}} and {{"numba"}}. Add {{"cuda"}} only if {{from numba import cuda}} works AND {{cuda.is_available()}} is True. Wrap that in try and except so it never crashes.',
    'OPTIONAL, only if {{available_backends()}} contains "cuda": write {{step_cuda(u, r, steps)}} with a {{@cuda.jit}} kernel. Copy the array to the card ONCE with {{cuda.to_device}}, run all the steps there, and copy back ONCE at the end. Copying every step is the classic mistake and would make it slower than the CPU.'],
    'python -m pytest -q tests/test_kernels.py','**3 passed** in green. The first run is slow because numba is compiling.','**No NVIDIA graphics card? That is completely fine.** This project is about measuring where the speed comes from. The numba parallel path alone gives the full lesson. Say so in your README instead of pretending.'),
  S('Measure, do not guess','The real deliverable of this project is an honest table.',[
    'Make **bench.py** in the project root.',
    'For n = 200, 400, 800, 1200 (and 2000 if your computer copes), time 20 steps with each available backend.',
    'Warm up numba by calling it once with 1 step BEFORE timing. The first call includes compile time.',
    'Print a table: n, cells, milliseconds per step for each backend, and the speedup over numpy.',
    'Also print {{os.cpu_count()}}.'],
    'python bench.py','A table. On a 2-core machine, numpy at n = 1200 is about **11 ms per step** and numba parallel about **1.1 ms**, a speedup near **10 times**. Your numbers depend on your cores. The speedup should be at least 2 to 4 times. Copy the table into README.md.','If numba is SLOWER, you are timing the compile. Warm it up first.'),
  WIN('High Resolution Heat'),
  S('Run it live at a resolution that hurts','Feel the difference instead of reading it.',[
    'In **src/main.py** make a grid of 1200 by 1200 and set {{r = 0.2}}. Seed a hot square in the middle.',
    'Each frame advance 5 steps with the current backend.',
    'Drawing a 1200 by 1200 grid every frame is itself slow. Shrink it first: {{small = u[::3, ::3]}} gives 400 by 400, then build the colour array, {{pygame.surfarray.make_surface}}, and scale up to the window.',
    'Show the backend name, the grid size, the milliseconds per step and the frames per second.',
    'Keys: **1** numpy, **2** numba, **3** cuda if you have it. **UP and DOWN** change the grid size between 300 and 2000 and restart.'],
    'python -m src.main','At 1200 by 1200 pressing **1** (numpy) makes it crawl, a few frames per second. Pressing **2** (numba) makes it smooth again. The picture is identical either way. That is the point: same science, different speed.'),
  S('Find the crossover','Faster is not always faster.',[
    'In **bench.py** also time n = 20, 50, 100 (small grids).',
    'Find the smallest n where numba beats numpy and write it in README.md.'],
    'python bench.py','At very small n numpy can WIN, because numba has per-call overhead. The crossover is usually somewhere between **n = 50 and n = 300**. Report the number you measured, not a guess.'),
 ],
 done:['{{python -m pytest -q}} prints **3 passed** and the backends agree exactly.','bench.py prints a real timing table that is in README.md.','The live window is slow on numpy and smooth on numba at 1200 by 1200.','You reported your measured crossover size.','If you have no GPU, README.md says so plainly.','Everything is saved with git.'],
 stuck:[['Numba is slower than numpy.','You are timing the first call, which compiles. Warm it up.'],['The window is slow even with numba.','The drawing is the bottleneck now, not the maths. Shrink with {{u[::3, ::3]}} before making the surface.'],['Numba will not install.','It lags behind the newest Python. Use Python 3.12. The project still works with numpy alone; say so in README.'],['Out of memory at n = 2000.','That is 4 million cells per array. Stay at 1200.']]
};

GUIDES.s5p4 = {
 slug:'surrogate-model', pip:['pygame','numpy','scikit-learn'],
 files:[['src/__init__.py','empty file; lets Python import from src'],['src/truth.py','the slow, real simulation'],['src/dataset.py','sampling the parameter space'],['src/surrogate.py','training and scoring the fast stand-in'],['src/main.py','pygame: surrogate learning live'],['tests/test_surrogate.py','checks'],['data/','the training set is saved here']],
 words:[['Surrogate','a fast model that imitates a slow simulation'],['Training set','examples the model learns from'],['Held-out test set','examples the model has never seen, used to judge it honestly'],['Overfitting','memorising the training examples instead of learning the pattern'],['RMSE','root mean squared error: the typical size of a miss'],['Latin hypercube','a way of sampling that spreads points evenly over the space'],['Ground truth','the real answer, here from the slow simulation']],
 steps:[
  S('Write the slow simulation and the checks','You already know this solver. Now it becomes the thing being imitated.',[
    'Open **src/truth.py**. Write {{peak_temp(alpha, hot_size, steps=400, n=80)}}: a 2D heat grid of size {{n}}, with a central hot square of side {{hot_size}} (an integer from 4 to 30) set to 100. Step it {{steps}} times with {{r = 0.2}} using the alpha you are given: {{r}} is fixed at 0.2 but multiply the Laplacian term by {{alpha}} (a number from 0.2 to 1.0) so alpha controls how fast heat spreads. Return the temperature at the exact centre cell at the end.',
    'Make sure {{alpha * 0.2}} never goes above 0.25, so it stays stable.',
    'Open **tests/test_surrogate.py**. Write the code below. Run it.'],
    'python -m pytest -q tests/test_surrogate.py','A red **ImportError**.','Physics sanity: a bigger hot square leaves more heat at the centre. Faster spreading (bigger alpha) leaves less.',
`import numpy as np
from src.truth import peak_temp
from src.dataset import sample_lhs
from src.surrogate import fit_models, rmse

def test_truth_behaves_physically():
    assert peak_temp(0.5, 20) > peak_temp(0.5, 8)        # bigger hot spot, hotter centre
    assert peak_temp(0.9, 12) < peak_temp(0.3, 12)       # faster spreading, cooler centre

def test_sampling_covers_the_space():
    X = sample_lhs(200, seed=0)
    assert X.shape == (200, 2)
    assert 0.2 <= X[:, 0].min() and X[:, 0].max() <= 1.0
    assert set(np.unique(X[:, 1])) <= set(range(4, 31))
    assert len(np.unique(X[:, 1])) > 10                   # it really does spread out

def test_rmse():
    assert rmse(np.array([1.0, 2.0]), np.array([1.0, 4.0])) == np.sqrt(2.0)`),
  S('Write the sampling and build the training set','200 real runs. This is the expensive part.',[
    'Open **src/dataset.py**.',
    'Write {{sample_lhs(n, seed)}}: a Latin hypercube over two inputs. Split 0 to 1 into {{n}} equal slices, take one random point in each slice, then shuffle each column independently. Map column 0 to alpha between 0.2 and 1.0. Map column 1 to a whole number hot size between 4 and 30 with {{np.round}}. Return an array of shape (n, 2).',
    'Write {{build_dataset(n=200, seed=0)}}: sample the inputs, run {{peak_temp}} for each one, print progress every 20 runs, and save {{X}} and {{y}} to **data/train.npz** with {{np.savez}}. If the file exists, load it instead.'],
    'python -c "from src.dataset import build_dataset; X, y = build_dataset(); print(X.shape, y.min().round(2), y.max().round(2))"','**(200, 2)** and two numbers. The whole build takes **1 to 4 minutes**. It only runs once; after that it loads from the file.'),
  S('Train two models and judge them honestly','The held-out set is the referee.',[
    'Open **src/surrogate.py**.',
    'Write {{rmse(a, b)}}: the square root of the mean of the squared differences.',
    'Write {{fit_models(X, y, seed=0)}}. Split: the first 80 percent is train, the last 20 percent is test (the sampling is already random, so no extra shuffle is needed). Train TWO models from scikit-learn: {{LinearRegression()}} and {{RandomForestRegressor(n_estimators=200, random_state=seed)}}.',
    'Return a dictionary: for each model its train RMSE and its test RMSE.',
    'Print the four numbers.'],
    'python -m pytest -q\npython -c "from src.dataset import build_dataset; from src.surrogate import fit_models; X, y = build_dataset(); print(fit_models(X, y))"','**3 passed**, then four numbers. The forest has a MUCH smaller train RMSE than test RMSE: that gap is overfitting, and it is normal for a forest. The linear model has two similar numbers but both larger, because the real physics is curved. Usually the forest still wins on the TEST number. Report whichever actually wins on YOUR numbers.'),
  S('The real test: run the slow simulation at 5 new points','A held-out score can still fool you. Fresh ground truth cannot.',[
    'Write {{final_check(model, seed=99)}} in **src/surrogate.py**: pick 5 NEW random input pairs that are in neither the train nor the test set. For each, run the real {{peak_temp}} and ask the surrogate to predict. Print a small table: alpha, hot size, true, predicted, difference.',
    'Also time both: how long do 5 real runs take, and how long do 5 surrogate predictions take?'],
    null,'A five-row table where the predictions are close to the true values. The real runs take **seconds**; the surrogate takes **well under a millisecond**. Write the speed ratio in README.md. That ratio is the whole reason surrogates exist.'),
  WIN('Surrogate Model'),
  S('Watch the surrogate learn','The payoff: accuracy appearing in front of you.',[
    'In **src/main.py** load the dataset. Start with only 10 training points, and add 10 more every second.',
    'Draw a scatter plot: x is the TRUE value from the slow simulation on the test set, y is the surrogate PREDICTION. Draw the perfect line y = x in white.',
    'Every time you add points, retrain and redraw. Points should migrate toward the white line.',
    'Also draw a second panel: the input space (alpha across, hot size up), with each training point as a dot, so you watch the space fill in.',
    'Show the live test RMSE and the number of training points.'],
    'python -m src.main','With 10 points the dots scatter far from the white line and the RMSE is large. As points are added the cloud tightens onto the line and the RMSE drops, quickly at first, then slowly. It stops improving well before 160 points. Note in README.md roughly where it flattens: that is how many expensive runs you actually needed.'),
 ],
 done:['{{python -m pytest -q}} prints **3 passed**.','You built a 200-run training set from the real simulation.','You reported train AND test RMSE for both models.','The 5 fresh-ground-truth checks are in README.md with the speed ratio.','The live scatter tightens onto the y = x line as points are added.','Everything is saved with git.'],
 stuck:[['The forest test RMSE is terrible.','Check you did not shuffle y separately from X. They must stay paired.'],['Every prediction is the same number.','You trained on one column only, or y is constant. Print y.min() and y.max().'],['Building the dataset is too slow.','Lower {{steps}} to 200 in peak_temp. Keep it the same everywhere.']]
};

GUIDES.s5p5 = {
 slug:'crop-yield', pip:['pygame','numpy','requests','scikit-learn'],
 files:[['src/__init__.py','empty file; lets Python import from src'],['src/nasa.py','COPIED from converging-average'],['src/yields.py','downloads real crop yields'],['src/features.py','growing degree days and friends'],['src/model.py','leave-one-year-out testing'],['src/main.py','pygame: a field of crops, predicted against real'],['tests/test_features.py','checks'],['data/','downloads go here']],
 words:[['Yield','how much crop per hectare a country harvested'],['Feature','a number you compute from raw data to help a model, like total rain in the growing season'],['Growing degree days','a running total of how much warmer than a base temperature each day was'],['Multicollinearity','two features that say almost the same thing, which confuses a model'],['Leave-one-year-out','train on every year but one, predict that one, repeat for all years'],['Baseline','the dumbest sensible prediction. Here: always guess the average yield'],['Skill','beating the baseline. Without that, a model is useless']],
 steps:[
  S('Copy the weather code and write the checks','Features first. They are where the science lives.',[
    'Copy **nasa.py** from converging-average. Mac or Linux first command. Windows second.',
    'Open **tests/test_features.py**. Write the code below. Run it. It fails.'],
    'cp ../converging-average/src/nasa.py src/nasa.py\n# Windows instead:\nCopy-Item ..\\converging-average\\src\\nasa.py src\\nasa.py\npython -m pytest -q tests/test_features.py','A red **ImportError**.','Growing degree days: for each day add {{max(0, mean_temp - base)}}. For temperatures 5, 10, 15, 20 with base 10 that is 0 + 0 + 5 + 10 = 15.',
`import numpy as np
from pytest import approx
from src.features import growing_degree_days, season_rain, heat_stress_days, correlation_matrix

def test_gdd():
    assert growing_degree_days([5, 10, 15, 20], base=10) == approx(15.0)
    assert growing_degree_days([0, 0, 0], base=10) == approx(0.0)

def test_season_rain():
    rain = [1.0] * 365
    assert season_rain(rain, 60, 150) == approx(90.0)     # days 60 up to 150

def test_heat_stress():
    assert heat_stress_days([30, 36, 40, 35], threshold=35) == 2    # strictly above 35

def test_correlation_finds_twins():
    a = np.arange(20.0); X = np.column_stack([a, 2 * a + 1, np.sin(a)])
    C = correlation_matrix(X)
    assert C[0, 1] == approx(1.0, abs=1e-9)               # columns 0 and 1 are the same thing
    assert abs(C[0, 2]) < 0.9`),
  S('Write the features','Each one is a real agronomic idea.',[
    'Open **src/features.py**.',
    'Write {{growing_degree_days(temps, base=10)}}: add up {{max(0, t - base)}} over the list.',
    'Write {{season_rain(rain, start_day, end_day)}}: the sum of {{rain[start_day:end_day]}}.',
    'Write {{heat_stress_days(temps, threshold=35)}}: how many days are STRICTLY above the threshold.',
    'Write {{correlation_matrix(X)}}: {{np.corrcoef(X, rowvar=False)}}.',
    'Write {{build_features(daily_by_year)}}: for each year return the three features above, choosing a growing season window you decide and WRITE DOWN in README.md (for maize in East Africa, days 60 to 240 is a reasonable choice).'],
    'python -m pytest -q tests/test_features.py','**4 passed** in green.'),
  S('Download real yields and real weather','Two sources that must be lined up by year.',[
    'Open **src/yields.py**. Write {{get_yield(country)}} using the World Bank cereal yield indicator: {{https://api.worldbank.org/v2/country/KEN/indicator/AG.YLD.CREL.KG?format=json&per_page=100}}. The units are kilograms per hectare. Return {{(year, value)}} pairs, skipping None, oldest first.',
    'For weather, call your {{fetch_daily}} once per year for the country centre point, for example Kenya at latitude 0.5 and longitude 37.5. Twenty-five years means 25 calls. Pause half a second between them and cache each year in **data/**.',
    'Keep only the years that appear in BOTH sources.',
    'Print how many years you ended up with.'],
    `python -c "from src.yields import get_yield; d = get_yield('KEN'); print(len(d), d[0], d[-1])"`,'About **25 to 60** year and yield pairs, with yields in the low thousands of kg per hectare. After matching with the weather you will typically have **20 to 40** usable years. **That is a very small dataset. Remember that number.**'),
  S('Check for twin features, then test the honest way','This step is the whole scientific point.',[
    'Print the correlation matrix of your three features. If any pair is above **0.9**, drop one and say which in README.md.',
    'Open **src/model.py**. Write {{loyo(X, y)}}: leave-one-year-out. For each year {{i}}: train {{LinearRegression}} on every OTHER year, predict year {{i}}, store the error. Return the RMSE over all held-out years.',
    'Write {{baseline_loyo(y)}}: the same loop, but the prediction is simply the mean of the other years. Return its RMSE.',
    'Print both numbers.',
    'IMPORTANT: do NOT use a random train and test split here. Nearby years are similar, so a random split lets information leak and flatters your model. Leave-one-year-out is the honest test for a short time series.'],
    'python -c "from src.model import *; print(run_all())"','Two numbers. **It is entirely possible that your model does NOT beat the baseline.** With 20 to 40 years and three features that is a real and publishable-sounding finding, not a failure. Write the honest comparison in README.md either way.'),
  WIN('Crop Yield'),
  S('Grow a field of crops, one year at a time','See each prediction succeed or fail.',[
    'In **src/main.py** draw a row of plant shapes, one per year: a stem with leaves whose HEIGHT is the real yield, and right next to it a second, differently coloured plant whose height is your leave-one-year-out PREDICTION for that year.',
    'Reveal one year per second, left to right. Under each pair write the year.',
    'Colour the predicted plant green if it is within 10 percent of the real one, and orange if it is not.',
    'Show the running RMSE and the baseline RMSE on screen.'],
    'python -m src.main','Pairs of plants appear year by year. Some pairs match closely (green), others clearly miss (orange). Drought years are usually the worst misses. Note which year your model missed by the most, and what the weather did that year, in README.md.'),
 ],
 done:['{{python -m pytest -q}} prints **4 passed**.','You matched real yields with real weather, year by year.','You reported the correlation matrix and dropped any twin feature.','You compared leave-one-year-out RMSE against the mean baseline, honestly.','README.md states your growing-season window and whether you beat the baseline.','Everything is saved with git.'],
 stuck:[['The two datasets share no years.','Print both year lists. The World Bank years are text; convert with {{int}}.'],['The model is far worse than the baseline.','That is a legitimate result with this little data. Report it. Do not tune until it looks good.'],['The download takes forever.','One call per year, with a pause. Let it finish once; it is cached after that.']]
};

GUIDES.s5p6 = {
 slug:'flood-sim', pip:['pygame','numpy','requests'],
 files:[['src/__init__.py','empty file; lets Python import from src'],['src/dem.py','download and clean the elevation map'],['src/flood.py','the water model'],['src/main.py','pygame: the town flooding'],['tests/test_flood.py','checks'],['data/','elevation data goes here']],
 words:[['DEM','digital elevation model: a grid of ground heights'],['Void','a missing pixel in the elevation data'],['Inundation','land covered by water'],['Water depth','how deep the water is above the ground at a cell'],['Water surface','ground height plus water depth. Water flows from high surface to low surface'],['Mass conservation','water is neither created nor destroyed'],['Sink','a low spot where water pools']],
 steps:[
  S('Write the checks','Two physical laws any flood model must obey.',[
    'Open **tests/test_flood.py**. Write the code below. Run it. It fails.'],
    'python -m pytest -q tests/test_flood.py','A red **ImportError**.','These two checks catch almost every bug: water must never climb uphill, and water must never appear from nowhere.',
`import numpy as np
from pytest import approx
from src.flood import step, fill_voids

def v_valley(n=20):
    x = np.abs(np.arange(n) - n // 2)
    return np.tile(x, (n, 1)).astype(float)         # a V shaped valley, low in the middle

def test_water_is_conserved():
    ground = v_valley(); h = np.zeros_like(ground); h[2, 2] = 50.0
    total = h.sum()
    for _ in range(300):
        h = step(ground, h, c=0.2)
    assert h.sum() == approx(total, rel=1e-9)

def test_water_runs_downhill_into_the_valley_floor():
    ground = v_valley(); h = np.zeros_like(ground); h[5, 2] = 50.0
    for _ in range(2000):
        h = step(ground, h, c=0.2)
    middle = ground.shape[1] // 2
    assert h[:, middle - 1: middle + 2].sum() > 0.8 * h.sum()

def test_no_negative_depth():
    ground = v_valley(); h = np.zeros_like(ground); h[3, 3] = 20.0
    for _ in range(500):
        h = step(ground, h, c=0.2)
    assert h.min() >= -1e-12

def test_fill_voids():
    g = np.array([[1.0, 2.0], [-32768.0, 4.0]])
    out = fill_voids(g)
    assert out.min() > -1000 and np.isfinite(out).all()`),
  S('Write the water model','Water moves toward lower water surfaces.',[
    'Open **src/flood.py**.',
    'Write {{fill_voids(ground, nodata=-32768)}}: replace any value at or below the nodata marker, or not finite, with the average of its valid neighbours; repeat a few times; finally replace anything still missing with the overall mean. Return a float array.',
    'Write {{step(ground, h, c=0.2)}} where {{h}} is water depth. The water surface is {{w = ground + h}}.',
    'For each of the four directions, the flow to the neighbour is {{c * (w - w_neighbour)}}, but ONLY where that is positive (water goes downhill) and only up to the water actually present. Never move more than the depth you have: cap the TOTAL outflow of a cell at {{h}}.',
    'A clean way: compute the four positive differences, add them to get {{total_out}}, then scale every direction by {{min(1, h / total_out)}} where {{total_out}} is above 0.',
    'The new depth is {{h - outflow_total + inflow_from_all_four_neighbours}}. Get the inflows with {{np.roll}} of each directional outflow array.',
    'Return the new {{h}}. Because every unit that leaves one cell arrives at another, the total is conserved automatically, which is what the first check verifies.'],
    'python -m pytest -q tests/test_flood.py','**4 passed** in green.','If conservation fails, you are capping outflow per direction instead of per cell. Scale all four together.'),
  S('Download a real elevation map','Real terrain, somewhere you care about.',[
    'Open **src/dem.py**. Write {{get_dem(south, north, west, east)}} using the free Open Topo Data service: {{https://api.opentopodata.org/v1/srtm30m?locations=LAT,LON|LAT,LON|...}}. It accepts up to 100 points per call.',
    'Build a grid of, for example, 60 by 60 points across your box. That is 3600 points, so 36 calls. Pause 1 second between calls, the free service asks for that.',
    'Return a 60 by 60 numpy array of elevations in metres. Run it through {{fill_voids}}. Cache the result in **data/dem.npy** with {{np.save}}.',
    'Pick a real flood-prone area and write down the exact box in README.md. One example: part of the Nyabugogo valley in Kigali, roughly south -1.97, north -1.93, west 30.03, east 30.08.'],
    'python -c "from src.dem import get_dem; d = get_dem(-1.97, -1.93, 30.03, 30.08); print(d.shape, round(float(d.min())), round(float(d.max())))"','**(60, 60)** and two elevations in metres that differ by tens to hundreds of metres. If min equals max, your box is flat; pick a hillier one. The download takes about a minute.'),
  S('Validate on a toy valley BEFORE touching real terrain','Real terrain hides bugs. A V shaped valley does not.',[
    'Make **valley_check.py** in the project root. Build the same V shaped valley as the test, drop water at the top, run 2000 steps, and print: total water at the start and the end, and the share of water sitting in the middle three columns.',
    'Confirm by eye and by number that water flows down and pools at the bottom.'],
    'python valley_check.py','Start and end totals are **identical to many decimal places**. More than **80 percent** of the water ends up in the valley floor columns. Only now is the model allowed near real data.'),
  WIN('Flood Sim'),
  S('Flood a real town','The payoff.',[
    'In **src/main.py** load the DEM. Draw the terrain as a greyscale or green to brown map, with each cell a block of about 12 pixels.',
    'Add rain or a river source: each frame add a fixed amount of depth to the lowest-elevation cell on one edge (the river entering), or spread it over all cells (rain). Make it a key choice.',
    'Draw water on top: where depth is above a small threshold, draw blue, getting deeper blue with depth.',
    'Run several {{step}} calls per frame.',
    'Show: total water added, total water on the map (these must match), and the flooded area as a percentage of cells.',
    'Keys: **R** river mode, **N** rain mode, **C** clear the water, **UP and DOWN** change the inflow rate.'],
    'python -m src.main','Blue water creeps downhill and fills the valleys first. Hilltops stay dry no matter how long you run it. The two water totals on screen stay equal, which is your conservation check running live.'),
  S('Compare with a real flood if you can','And be honest if you cannot.',[
    'Search for a documented flood in your chosen area and any map of its extent.',
    'If you find one: mark the cells your model floods at a chosen water volume, compare with the reported extent, and report the overlap as {{cells in both divided by cells in either}}, a score between 0 and 1.',
    'If you cannot find one, say so explicitly in README.md and state that your validation rests on the two physical checks (conservation and downhill-only) plus the toy valley, not on observations.'],
    null,'Either a real overlap number, or an honest paragraph explaining that no validation data was available. Both are acceptable. Claiming a validated result without data is not.'),
 ],
 done:['{{python -m pytest -q}} prints **4 passed**.','Water is conserved to many decimal places.','Water never flows uphill, proved on the V valley first.','A real DEM floods realistically on screen, valleys first.','README.md gives your exact area box and either an overlap score or an honest statement that none was available.','Everything is saved with git.'],
 stuck:[['Water vanishes over time.','You capped outflow per direction. Scale all four directions together so the total never exceeds the depth present.'],['Water sits on a hilltop.','You compared ground heights instead of water surfaces. Use {{ground + h}}.'],['The DEM download fails.','The free service limits requests. Keep to 100 points per call and pause 1 second.'],['Everything floods instantly.','Your inflow per frame is too large. Lower it.']]
};

GUIDES.s6p1 = {
 slug:'reproduce-paper', pip:['pygame','numpy','matplotlib'],
 files:[['src/__init__.py','empty file; lets Python import from src'],['src/model.py','your own implementation, from the paper text'],['src/main.py','pygame: your version running live'],['tests/test_model.py','checks you derive from the paper'],['REPORT.md','the written deliverable'],['notes/','your reading notes and the method in your own words']],
 words:[['Reproduce','get the same result from the same method, written by you'],['Methods section','the part of a paper that says exactly what was done'],['Figure','a chart in a paper. Often the thing you try to recreate'],['Parameter','a number the method needs. Papers sometimes forget to state them all'],['Discrepancy','a difference between your result and theirs'],['Preprint','a free version of a paper, often on arXiv']],
 steps:[
  S('Choose a paper you can actually run','The choice decides whether this project succeeds.',[
    'Find a paper whose main result is a SIMULATION, a dynamical model, or an algorithm you can watch run. Not a statistical table.',
    'Good hunting grounds: **arxiv.org** (free, try q-bio.PE for epidemic models, physics.comp-ph for computational physics), **journals.plos.org/ploscompbiol**, or the model library at **comses.net**.',
    'Apply these four filters before you commit. 1. Is the method described in enough detail that you could code it without their code? 2. Are all parameter values printed somewhere in the paper? 3. Is there one specific figure or number you could try to match? 4. Could one run finish on your laptop in under a minute?',
    'Strong, safe choices if you are unsure: a Lotka-Volterra or SIR variant with stated parameters, a cellular automaton, an agent-based model from comses.net, or a classic chaos or pattern-formation result.',
    'Write in **notes/choice.md**: the full citation, a link, the exact figure or number you will target, and your answers to the four filters.'],
    null,'A notes file naming one paper and one specific target, for example "Figure 2b, the peak prevalence of 0.31 at day 48".','If you cannot answer all four filters with yes, pick a different paper. That is not failure; it is the filter working.'),
  S('Write the method in your own words BEFORE any code','This is the step most people skip, and it is the one that teaches.',[
    'Read the methods section slowly, twice.',
    'In **notes/method.md** write, in plain sentences, exactly what the authors did, step by step, as if explaining to someone who has not read the paper.',
    'Make a table of every parameter: its symbol, its value, its units, and the page or equation where you found it.',
    'Mark any parameter you could NOT find with **UNSTATED**. These are your prime suspects if your result disagrees later.',
    'Do not open their code, if any exists. You may look at it afterwards, only to explain a disagreement, and you must say in your report if you did.'],
    null,'A method file a classmate could follow, plus a parameter table where every row has a source or is marked UNSTATED.'),
  S('Turn the paper figure into a check','Make the target testable.',[
    'Open **tests/test_model.py**. Write at least two checks that encode what the paper claims: one for a specific quantity (for example "the peak is between 0.28 and 0.34") and one structural (for example "the population total is conserved" or "the system settles to a steady state").',
    'Also write a check for any exact small case the paper gives, if it gives one.',
    'Run them. They fail. That is correct.'],
    'python -m pytest -q','Red. Your checks now define what success means, decided before you saw your own result.'),
  S('Implement it and get the checks green','Your own code, from your own notes.',[
    'Write **src/model.py** from **notes/method.md**, not from the paper. If your notes are not clear enough to code from, the notes are the problem; fix them first.',
    'Reuse what you already own: your RK4 solver, your agent patterns, your grid solvers.',
    'Run the checks as you go.'],
    'python -m pytest -q','Green, OR a specific failure you can describe. Both are legitimate at this stage.'),
  WIN('Reproduce Paper'),
  S('Run your reproduction live, next to their figure','Watch the paper happen.',[
    'In **src/main.py** render the model running in real time in the style you have used all through this curriculum: agents as blobs, a field as colour, a trajectory drawing itself.',
    'Load the paper figure as an image if you can (screenshot it to **notes/target.png**) and draw it beside your live view with {{pygame.image.load}}, so the comparison is literally side by side.',
    'Show the live value of your target quantity and the paper reported value on screen.'],
    'python -m src.main','Your simulation running beside the published figure, with both numbers visible at once.'),
  S('Compare, and chase the difference','The real skill being tested.',[
    'Report the comparison as a NUMBER: percent difference for a value, or for a figure, a specific description (peak is 12 percent lower, timing is 4 days later, shape matches).',
    'If it does not match, investigate in this order and write what you find: 1. an UNSTATED parameter from your table; 2. a different default in a library (random number generator, integration step, boundary handling); 3. a bug in your own code, found by re-reading your notes against your code line by line; 4. a genuine ambiguity in the paper.',
    'Only after all four may you look at the authors code, and you must say so in the report.',
    'Write **REPORT.md** with these sections: Citation, The target, Method in my own words (link to notes), My implementation, Result and comparison, Discrepancy investigation, What I would need from the authors, What I learned.'],
    null,'A report where the comparison is a number and the discrepancy section names a specific cause. "It did not work and I do not know why" is not an acceptable ending; a named ambiguity in the paper is.'),
 ],
 done:['notes/choice.md names one paper and one specific target.','notes/method.md describes the method in your own words with a parameter table.','Your checks encode the paper claim and were written before your result.','Your live view runs beside the published figure.','REPORT.md gives a numeric comparison and a named cause for any difference.','Everything is saved with git.'],
 stuck:[['Every paper looks too hard.','Your filter is working, but aim lower. A 1990s paper with a two-equation model is a better first reproduction than a modern one.'],['You cannot find a parameter.','Mark it UNSTATED, choose a reasonable value, state your choice in the report, and show how sensitive the result is to it.'],['Your result matches suspiciously perfectly.','Check you did not accidentally hard-code the target value into your model.']]
};

GUIDES.s6p2 = {
 slug:'sensitivity-dials', pip:['pygame','numpy','SALib'],
 files:[['src/__init__.py','empty file; lets Python import from src'],['src/model.py','COPIED: whichever model you are analysing'],['src/sensitivity.py','Sobol analysis'],['src/main.py','pygame: the instrument panel'],['tests/test_sensitivity.py','checks'],['REPORT.md','the written deliverable']],
 words:[['Uncertain input','a parameter whose true value you do not know exactly'],['Sensitivity analysis','working out which inputs actually drive the output'],['Sobol index','the share of the output variance caused by one input'],['First order index (S1)','that input acting alone'],['Total index (ST)','that input alone plus all its interactions with others'],['Variance','how much a quantity varies across the whole ensemble'],['Prior','the range or distribution you believe an input lies in']],
 steps:[
  S('Install SALib and write the checks','Sobol indices have mathematical properties you can test.',[
    'With your environment active run the install command.',
    'Open **tests/test_sensitivity.py**. Write the code below. Run it. It fails.'],
    'pip install SALib\npip freeze > requirements.txt\npython -m pytest -q tests/test_sensitivity.py','A red **ImportError**.','The Ishigami function is the standard test case for sensitivity analysis. Its true first-order indices are known: about 0.31, 0.44 and 0.00.',
`import numpy as np
from pytest import approx
from src.sensitivity import run_sobol, PROBLEM, peak_fraction

def ishigami(X):
    a, b = 7.0, 0.1
    return np.sin(X[:, 0]) + a * np.sin(X[:, 1]) ** 2 + b * X[:, 2] ** 4 * np.sin(X[:, 0])

def test_against_the_known_ishigami_answer():
    problem = {"num_vars": 3, "names": ["x1", "x2", "x3"],
               "bounds": [[-np.pi, np.pi]] * 3}
    Si = run_sobol(problem, ishigami, n=1024)
    assert Si["S1"][0] == approx(0.31, abs=0.05)
    assert Si["S1"][1] == approx(0.44, abs=0.05)
    assert abs(Si["S1"][2]) < 0.05
    assert Si["ST"][2] > 0.2                     # x3 matters only through interactions

def test_indices_are_sane():
    Si = run_sobol(PROBLEM, peak_fraction, n=256)
    assert sum(Si["S1"]) <= 1.05                 # first order shares cannot exceed the whole
    assert all(st >= s1 - 0.05 for s1, st in zip(Si["S1"], Si["ST"]))`),
  S('Write the Sobol runner','SALib does the sampling; you supply the model.',[
    'Open **src/sensitivity.py**.',
    'Copy in your fast SEIR run from the ensemble project (or import it), and write {{peak_fraction(X)}}: it takes an array with one row per sample and four columns (beta, sigma, gamma, starting infected fraction) and returns an array of peak infected fractions, one per row.',
    'Define {{PROBLEM}} as a dictionary: {{num_vars}} 4, {{names}} the four names, and {{bounds}} {{[[0.3, 0.7], [0.1, 0.33], [0.07, 0.2], [0.0005, 0.005]]}}. Write in README.md where each range came from: your earlier calibration, or published values you cite.',
    'Write {{run_sobol(problem, func, n=256)}}: use {{from SALib.sample import sobol as sobol_sample}} and {{from SALib.analyze import sobol as sobol_analyze}}. Sample with {{sobol_sample.sample(problem, n, calc_second_order=False)}}, evaluate, then {{sobol_analyze.analyze(problem, Y, calc_second_order=False)}}. Return the result.',
    'Note: SALib changed its import names between versions. If you see a deprecation warning about {{saltelli}}, you are on an old version; the imports above are the current ones.'],
    'python -m pytest -q tests/test_sensitivity.py','**2 passed** in green. The Ishigami check confirms your pipeline is correct before you trust it on your own model.'),
  S('Run it on your model and rank the inputs','The scientific result.',[
    'Run {{run_sobol(PROBLEM, peak_fraction, n=256)}}. With 4 inputs and first order only this is **1536 model runs** and takes a minute or two.',
    'Print a table: name, S1, ST, for all four inputs, sorted by ST.',
    'Check the first-order indices add up to at most 1.',
    'Compare the ranking against what you expect from the epidemiology. If the top input surprises you, investigate before reporting it.'],
    'python -c "from src.sensitivity import *; Si = run_sobol(PROBLEM, peak_fraction, 256); print(list(zip(PROBLEM[\'names\'], Si[\'S1\'].round(2), Si[\'ST\'].round(2))))"','Four rows. With these ranges **gamma dominates** (S1 near 0.68), then beta (about 0.20), then sigma (about 0.09), and the starting infected fraction is essentially **0.00**. The first-order indices sum to about 0.97. Your exact numbers depend on your ranges.','Why gamma? It sets how long people stay infectious, and it appears in R0 as a divisor, so it moves the peak more than beta does over these particular ranges. Ranges change rankings: that is worth a sentence in your report.'),
  WIN('Sensitivity Dials'),
  S('Build the instrument panel','Discover sensitivity by dragging, not by reading.',[
    'In **src/main.py** draw one horizontal slider per input, labelled with its name and range, all visible at once.',
    'Draw a big dial or bar on the right showing the model output (peak infected fraction) for the current slider settings.',
    'Dragging any slider re-runs the model immediately and moves the needle. One run takes about 12 milliseconds, so this feels instant.',
    'Also draw a faint ghost needle at the output for the CENTRE of every range, so you can always see how far you have moved from the middle.',
    'Show the Sobol S1 value next to each slider, as a small bar, once you have computed them.',
    'Key **A** runs the full Sobol analysis in the background and fills in those bars when done (print progress in the terminal; it takes a minute).'],
    'python -m src.main','Four sliders and a needle. Dragging **gamma** from one end to the other swings the needle a long way. Dragging the **starting infected fraction** across its entire range barely moves it at all. That contrast, felt by hand, is what the Sobol numbers measure.'),
  S('Write the recommendation','Sensitivity analysis exists to change what you do next.',[
    'Write **REPORT.md** with: the model and output analysed; a table of every input, its range, and where the range came from; the Sobol table; the Ishigami validation; and a clear final recommendation.',
    'The recommendation must be actionable: which ONE input, if measured better, would most reduce the uncertainty in your prediction, and why, citing its index.',
    'Also state which inputs you could safely FIX at a constant value in future work, because their indices are near zero.'],
    null,'A report ending with a specific sentence such as: "Effort should go to measuring the infectious period, since gamma accounts for roughly 68 percent of the output variance, while the initial infected fraction can be fixed at any value in its range."'),
 ],
 done:['{{python -m pytest -q}} prints **2 passed**, including the Ishigami validation.','Your Sobol first-order indices sum to at most 1.','The slider panel re-runs the model live and the needle responds.','The most sensitive slider visibly swings the needle further than the least sensitive one.','REPORT.md ends with an actionable recommendation citing an index.','Everything is saved with git.'],
 stuck:[['An error about ptp inside SALib.','An old SALib with a new numpy. Run {{pip install -U SALib}}.'],['The indices are negative.','Small negatives near zero are normal numerical noise; report them as about zero. Large negatives mean too few samples: raise n.'],['It is far too slow.','Lower n to 128 for exploring, and only run the big one once for the report. Or use the Morris method, which needs far fewer runs.'],['Dragging a slider freezes the window.','Your model run is too slow for a live redraw. Use the fast fraction-based version with dt 0.2.']]
};

GUIDES.s6p3 = {
 slug:'research-pilot', pip:['pygame','numpy'],
 files:[['PROPOSAL.md','written FIRST, and never edited afterwards'],['REPORT.md','the final write-up'],['src/__init__.py','empty file; lets Python import from src'],['src/study.py','your pilot code'],['src/main.py','pygame: your evidence building up'],['tests/test_study.py','your checks'],['data/','your data']],
 words:[['Research question','a specific question that a number or a yes/no could answer'],['Proposal','what you plan to do and how you will know if it worked, written before you start'],['Pilot study','a smaller version run for real, to find out whether the full study is worth doing'],['Scope','how much you are attempting'],['Validation plan','how you will know your answer is trustworthy, decided in advance'],['Negative result','finding that the answer is no, or that the effect is not there. Still a real result']],
 steps:[
  S('Write a question narrow enough to answer','Almost every first research question is ten times too big.',[
    'Write down a topic you care about from anywhere in this curriculum.',
    'Now narrow it until it passes all four of these tests. 1. A specific NUMBER or a yes/no would answer it. 2. You can name the exact dataset or simulation that provides the evidence. 3. You have not already answered it in an earlier project. 4. Its evidence can be WATCHED building up, as a simulation, a sweep, or a progressive reveal.',
    'Too big: "How does climate change affect East African agriculture?" Better: "Between 1991 and 2023, did the start of the main rainy season at [one specific grid point] shift later, and by how many days per decade?"',
    'Too big: "Do networks change epidemics?" Better: "In my town-epidemic model, how does the peak day in the second-largest town change as travel probability goes from 0.01 to 0.20?"',
    'Write the final question as ONE sentence at the top of **PROPOSAL.md**.'],
    null,'One sentence that a single number could answer.','A question built on your own earlier model is often the strongest choice, because you already trust the tool.'),
  S('Write the whole proposal before any code','Deciding how you will judge the answer BEFORE you see it is what makes this research rather than fishing.',[
    'Finish **PROPOSAL.md** with exactly these five sections.',
    '**Background**: what is already known, with at least 2 sources you have actually read, cited with links.',
    '**Question**: your one sentence, plus what form the answer takes (a number with units, or a yes or no).',
    '**Method**: the data or simulation, the steps, and which of your existing projects you will reuse.',
    '**Expected challenges**: at least 2 specific things you expect to be hard, and what you will do about each.',
    '**Validation plan**: exactly how you will know the answer is trustworthy. Pick at least one of: comparison with an analytical result, comparison with published numbers, or a second independent method on the same data. Also state what result would make you conclude NO.',
    'Commit this file with git now, before writing code. Do not edit it afterwards. Changes go in the report instead.'],
    'git add PROPOSAL.md\ngit commit -m "Proposal, written before any code"','A committed proposal. The git history proves it came first, which is the point.'),
  S('Decide what to cut, and say so','A pilot is a deliberately smaller study, not a rushed one.',[
    'Choose your scale-down: fewer years, one region instead of many, a coarser grid, fewer ensemble runs, or a simpler model.',
    'Write in **REPORT.md** under a heading "Pilot scope": what the full study would need, what you are doing instead, and why that is still informative.',
    'Set a hard time budget, for example two weeks. Write it down.'],
    null,'A written scope. Something like: "The full study would use 64 grid points. This pilot uses 4, chosen to span the wettest and driest corners."'),
  S('Write checks before results','You have done this nine times now. Do it once more.',[
    'In **tests/test_study.py** write checks for the pieces of your pipeline: any function that transforms data, any metric you compute, with small hand-made inputs whose answers you know.',
    'If you reuse code from an earlier project, copy its tests too.'],
    'python -m pytest -q','Green on your building blocks, before you trust any result built on them.'),
  WIN('Research Pilot'),
  S('Run the pilot and watch the evidence accumulate','Your result, built in front of you.',[
    'Build **src/main.py** so the evidence appears progressively along its natural order: year by year, region by region, or across a parameter sweep.',
    'Do not reveal only a final chart. Someone watching should see your conclusion being earned.',
    'Keep a running log in **notes.md** of every decision you make while running, and why. Future you will need this for the report.'],
    'python -m src.main','A live view where your answer emerges. The final frame is your headline result.'),
  S('Validate, then write the report','The last and most important step.',[
    'Carry out the validation plan exactly as you wrote it in the proposal. If you cannot, explain specifically why.',
    'Write **REPORT.md** with: the question; the pilot scope; what CHANGED from the proposal and why; the method; the result with its validation; the limitations; and a clear recommendation.',
    'The recommendation must answer: based on this pilot, is the full question worth pursuing, and what is the next concrete step?',
    'Be careful to separate what you DEMONSTRATED from what you merely SUGGEST. Use the words "this shows" and "this suggests" deliberately and differently.',
    'If your answer is no, or the effect was not there, report that clearly. A well-run pilot with a negative result is a success, and saying so honestly is a research skill in itself.'],
    'git add .\ngit commit -m "Pilot study complete"','A report that a supervisor could read and act on. This document, with your proposal beside it, is the strongest single item in your portfolio and the thing to discuss in a graduate application.'),
 ],
 done:['PROPOSAL.md was committed to git BEFORE any code.','Your question is one sentence a number could answer.','The pilot scope is written down and justified.','You carried out your validation plan, or explained precisely why you could not.','REPORT.md separates what you showed from what you suspect, and ends with a recommendation.','Everything is saved with git, with a history that shows the order you worked in.'],
 stuck:[['Your question keeps growing.','Add a constraint: one location, one year range, one parameter. You can widen it after the pilot.'],['The result is boring.','A clear no is a result. Report it with the same care as a yes.'],['You cannot validate it.','Try a second independent method on the same data. If truly impossible, say so explicitly; that is itself a finding about the question.'],['You want to edit the proposal.','Do not. Put the change in the report under "What changed and why". That contrast is the most valuable part.']]
};

/* =========================================================
   3D REBUILDS (Ursina).  These overwrite the 2D versions
   defined earlier, because this file is loaded last.
   ========================================================= */

/* PATCH: keep the 2D (pygame) guides that the Ursina blocks below overwrite (audit item A2). */
const GUIDES_2D = {};
["s0p2", "s1p5", "s1p4", "s3p2", "s5p1", "s4p1", "s4p4", "s4p6", "s5p6"].forEach(k=>{ GUIDES_2D[k] = GUIDES[k]; });

const WIN3D = (title, extra) => S('Open an empty 3D window',
  'Before any physics, prove a 3D window opens, a camera moves, and the program closes cleanly.', [
  'Open **src/main.py**.',
  'Copy the **Ursina starter window** from the Setup page (section "Template: a 3D window") and paste it in.',
  `Change the title to **${title}**.`,
  'Save the file.'],
  'python -m src.main',
  'A 3D window opens with a dark ground plane and a blue sphere. **Left-drag** orbits the camera, **scroll** zooms, **right-drag** pans. The text in the corner updates. Pressing Escape or closing the window ends the program with no red text.',
  (extra || 'If the window opens and instantly closes, you are missing {{app.run()}} on the last line.'));

/* ---------------------------------------------------------- s0p2 */
GUIDES.s0p2 = {
 slug:'cannon-3d', pip:['ursina'],
 files:[['src/__init__.py','empty file; lets Python import from src'],['src/physics.py','simulate(): the flight maths, no graphics'],['src/main.py','the 3D game'],['tests/test_physics.py','checks for physics.py']],
 words:[['Trajectory','the curved path a thrown object follows through space'],['v₀ (v naught)','launch speed, in metres per second'],['θ (theta)','elevation angle: how steeply you fire, measured up from the ground'],['φ (phi)','azimuth angle: which compass direction you fire toward'],['g','acceleration due to gravity, 9.8 m/s² downward on Earth'],['k','drag coefficient. Air pushes back with force −k·v, opposite to the velocity'],['Δt (delta t)','the time step: the small slice of time the simulation advances each turn']],
 steps:[
  S('Write the checks','Checks first. School physics already knows the right answers.',[
    'Open **tests/test_physics.py**.','Write the code below.','Run it. It fails, because {{simulate}} does not exist yet.'],
    'python -m pytest -q tests/test_physics.py','A red **ImportError** about {{simulate}}.','The range formula is **R = v₀²·sin(2θ)/g**. For v₀ = 20 m/s and θ = 45°: R = 400 × 1.0 / 9.8 = **40.8 m**. Peak height is **H = v₀²·sin²θ/(2g)** = 400 × 0.5 / 19.6 = **10.2 m**.',
`from src.physics import simulate

def test_no_drag_45_degrees():
    points = simulate(20, 45)              # v0 = 20 m/s, theta = 45 degrees
    last = points[-1]                      # each point is (t, x, y, z)
    peak = max(p[2] for p in points)       # y is the UP axis
    assert abs(last[1] - 40.8) < 0.41      # range R within about 1 percent
    assert abs(peak - 10.2) < 0.15         # peak height H

def test_azimuth_turns_the_shot_sideways():
    straight = simulate(20, 45, phi=0)[-1]
    turned = simulate(20, 45, phi=90)[-1]
    assert abs(straight[3]) < 1e-9         # phi = 0 means no sideways motion
    assert abs(turned[3] - 40.8) < 0.41    # phi = 90 sends the whole range sideways

def test_drag_shortens_the_range():
    assert simulate(20, 45, k=0.1)[-1][1] < simulate(20, 45)[-1][1]`),
  S('Write simulate()','Step the shell forward in tiny slices of time instead of using one closed-form formula.',[
    'Open **src/physics.py** and write {{import math}}.',
    'Write {{simulate(v0, theta_deg, phi_deg=0, k=0.0, dt=0.01, g=9.8)}}. It returns a list of {{(t, x, y, z)}} tuples. **y is up**; x and z are the two ground directions. This matches Ursina, so your physics and your graphics agree.',
    'Convert the angles: {{theta = math.radians(theta_deg)}} and {{phi = math.radians(phi_deg)}}.',
    'Split v₀ into components. Upward: {{vy = v0 * math.sin(theta)}}. Along the ground: {{v_ground = v0 * math.cos(theta)}}, then {{vx = v_ground * math.cos(phi)}} and {{vz = v_ground * math.sin(phi)}}.',
    'Start at {{x = y = z = 0}} and {{t = 0}}, and put {{(0, 0, 0, 0)}} in the list.',
    'Loop forever, doing these lines **in this order**: the acceleration components are {{ax = -k * vx}}, {{ay = -g - k * vy}}, {{az = -k * vz}}. Then update the velocity: {{vx += ax * dt}} and the same for vy and vz. Then update the position: {{x += vx * dt}} and the same for y and z. Then {{t += dt}} and append {{(t, x, y, z)}}.',
    'Break out of the loop the moment {{y < 0}}, the shell has hit the ground.'],
    'python -m pytest -q tests/test_physics.py','**3 passed** in green.','{{a = F/m}}. Here the only forces are gravity (always −g on the y axis) and drag (−k·v on every axis), so the mass cancels out and never appears.'),
  WIN3D('Cannon 3D'),
  S('Put a real shell in the air','Your physics list becomes a moving object in 3D space.',[
    'In **src/main.py** add {{from src.physics import simulate}} at the top.',
    'Before {{update}}: {{theta = 45}}, {{phi = 0}}, {{v0 = 20}}, {{k = 0.0}}, then {{points = simulate(v0, theta, phi, k)}} and {{index = 0}}.',
    'Replace the template ball with {{shell = Entity(model="sphere", color=color.orange, scale=0.5)}}.',
    'Add a cannon so you can see where you are aiming: {{barrel = Entity(model="cube", color=color.gray, scale=(0.3, 0.3, 2.5))}}.',
    'Make the ground bigger: set the ground plane {{scale=120}} so a 40 m shot fits on it.',
    'In {{update}}: step the index with {{index = min(index + 2, len(points) - 1)}}, then read {{t, x, y, z = points[index]}} and set {{shell.position = Vec3(x, y, z)}}.',
    'Ursina units are metres here, one to one. No scaling maths needed, which is one real advantage over the 2D version.',
    'Point the camera somewhere useful: {{camera.position = (-25, 25, -35)}} and {{camera.look_at(Vec3(20, 0, 0))}}.'],
    'python -m src.main','An orange sphere arcs up from the cannon and lands roughly **40 metres** along the x axis. Orbit the camera with the mouse while it flies: you can see the arc from any angle, which is the whole point of doing this in 3D.'),
  S('Add a trail you can see from any angle','A line in space showing the path already flown.',[
    'Before {{update}} create {{trail = Entity(model=Mesh(vertices=[], mode="line", thickness=3), color=color.yellow)}}.',
    'In {{update}}, after moving the shell, rebuild the trail from the points flown so far: {{trail.model.vertices = [Vec3(p[1], p[2], p[3]) for p in points[:index + 1]]}} then {{trail.model.generate()}}.',
    'Rebuilding every frame is slightly wasteful but perfectly fast at these sizes. Do the simple thing first.'],
    'python -m src.main','A yellow curve traces the flight and stays on screen. Orbit the camera: the curve is a flat arc that lies in one vertical plane, because with φ = 0 nothing pushes the shell sideways.'),
  S('Add the controls','Make it a game you can actually play.',[
    'In {{update}}, read the keyboard with {{held_keys}}, which is a dictionary Ursina keeps up to date for you.',
    '{{if held_keys["up arrow"]: theta = min(85, theta + 30 * time.dt)}} and the matching {{down arrow}} with {{max(5, theta - ...)}}. Use {{global theta}} at the top of {{update}} so you can change it.',
    '{{left arrow}} and {{right arrow}} change {{phi}} by 60 degrees per second. There is no limit; it can spin all the way round.',
    'Aim the barrel to match: {{barrel.rotation = (-theta, -phi, 0)}}.',
    'Fire with a separate function: {{def input(key):}} at module level. Ursina calls it on every key press. Inside: {{if key == "space": points = simulate(v0, theta, phi, k); index = 0}} (with {{global}} for all three).',
    'In {{input}} also handle {{"d"}} to toggle {{k}} between 0.0 and 0.1, and {{"w"}} / {{"s"}} to change {{v0}} by 1 between 5 and 40.',
    'Show the numbers: {{readout.text = f"v0 = {v0:.0f} m/s   theta = {theta:.0f}   phi = {phi:.0f}   k = {k}"}}.'],
    'python -m src.main','Arrow keys swing the barrel and you can see where it points. Space fires. The shot lands where the barrel aimed. Turning φ swings the whole arc around the cannon.'),
  S('Run the experiment','Now use your game as a laboratory.',[
    'Leave drag off (k = 0). Fire at θ = 30, 45, 60 with v₀ = 20. Write down each range.',
    'Turn drag on with the **d** key. Fire at θ = 45 again and write down the range.',
    'With drag still on, hunt for the θ between 35 and 50 that flies furthest.',
    'Put your three findings in **README.md** as three sentences.'],
    null,'Expected, within a little: θ = 30 gives **35.2 m**, θ = 45 gives **40.7 m**, θ = 60 gives **35.2 m**. Notice 30 and 60 give the **same** range, because sin(2θ) is the same for both. With k = 0.1 at θ = 45 you get about **34.0 m**, and the best angle drops to about **43°**.','Why does drag lower the best angle? A steeper shot spends longer in the air, and drag removes speed for the whole time it is airborne. Flatter means less time exposed.'),
 ],
 done:['{{python -m pytest -q}} prints **3 passed**.','A shell flies in 3D and you can orbit the camera around the arc while it flies.','No drag, θ = 45°, v₀ = 20 gives a range near **40.7 m**.','Drag on gives about **34.0 m**, and θ = 30° and 60° give the same range.','README.md has your three findings.','Everything is saved with git.'],
 stuck:[['The shell goes underground.','In Ursina **y is up**. If you put the height into z you will see it fly sideways into the floor.'],['Nothing moves when you press keys.','{{update}} needs {{global theta, phi}} to change them, otherwise Python makes a new local variable each frame.'],['The trail is invisible.','A Mesh with {{mode="line"}} needs at least 2 vertices. Guard with {{if index > 1:}}.'],['The window opens and closes instantly.','{{app.run()}} must be the last line of the file.']]
};

/* ---------------------------------------------------------- s1p5 */
GUIDES.s1p5 = {
 slug:'particle-sandbox-3d', pip:['ursina','numpy'],
 files:[['src/__init__.py','empty file; lets Python import from src'],['src/particle.py','Particle class and the force functions'],['src/simulation.py','Simulation: a box full of particles'],['src/main.py','the 3D sandbox'],['tests/test_particle.py','checks']],
 words:[['Class','a blueprint for making objects'],['Object','one thing built from a class, here one Particle'],['r (position)','where a particle is, as a vector (x, y, z) in metres'],['v (velocity)','how fast and in which direction it moves, in m/s'],['m (mass)','in kilograms'],['F (force)','a push or pull, in newtons. Newton\'s second law: F = m·a'],['Shared-state bug','two objects accidentally using the SAME array, so moving one moves the other']],
 steps:[
  S('Write the checks','One particle dropped for one second must fall exactly 4.9 m.',[
    'Open **tests/test_particle.py**. Write the code below. Run it. It fails.'],
    'python -m pytest -q tests/test_particle.py','A red **ImportError**.','Free fall from rest: **y = −½·g·t²**. With g = 9.8 and t = 1 that is −4.9 m. The minus sign means downward.',
`import numpy as np
from pytest import approx
from src.particle import Particle, gravity, make_drag
from src.simulation import Simulation

def test_free_fall_for_one_second():
    p = Particle([0.0, 0.0, 0.0], [0.0, 0.0, 0.0], 1.0)
    for _ in range(1000):
        p.step(0.001, [gravity])
    assert p.r[1] == approx(-4.9, abs=0.01)      # index 1 is the y axis, which is UP
    assert p.r[0] == approx(0.0) and p.r[2] == approx(0.0)

def test_drag_slows_a_moving_particle():
    p = Particle([0, 0, 0], [10.0, 0, 0], 1.0)
    p.step(0.1, [make_drag(1.0)])
    assert 0 < p.v[0] < 10

def test_heavier_particles_fall_at_the_same_rate():
    a = Particle([0, 0, 0], [0, 0, 0], 1.0)
    b = Particle([0, 0, 0], [0, 0, 0], 50.0)
    for _ in range(100):
        a.step(0.01, [gravity]); b.step(0.01, [gravity])
    assert a.r[1] == approx(b.r[1])              # mass cancels: F = m*a with F = m*g

def test_no_shared_state():
    sim = Simulation(50)
    ids = {id(p.r) for p in sim.particles} | {id(p.v) for p in sim.particles}
    assert len(ids) == 100`),
  S('Write Particle, the forces, and Simulation','Vectors with three components now, not two.',[
    'Open **src/particle.py**. Write {{class Particle}} with {{__init__(self, r, v, m)}}. Store {{self.r = np.array(r, dtype=float)}} and {{self.v = np.array(v, dtype=float)}} and {{self.m = m}}.',
    'The {{np.array(...)}} call makes a **new** array every time. That single detail is what stops the shared-state bug the last check hunts for.',
    'Add {{step(self, dt, forces)}}: start {{F_total = np.zeros(3)}}, add {{f(self)}} for every force in the list, then {{a = F_total / self.m}}, then {{self.v = self.v + a * dt}}, and only **then** {{self.r = self.r + self.v * dt}}.',
    'Write {{gravity(p)}} returning {{np.array([0.0, -9.8 * p.m, 0.0])}}. This is **F = m·g** pointing down the y axis.',
    'Write {{make_drag(k)}} that returns an inner function {{drag(p)}} returning {{-k * p.v}}. This is **F = −k·v**: always opposite the motion.',
    'Open **src/simulation.py**. Write {{class Simulation}} with {{__init__(self, n)}}: build {{self.particles}}, {{n}} Particles with random r inside a box (each of x, y, z from −6 to 6), random v (each from −4 to 4) and m = 1.',
    'Add {{step(self, dt, forces)}} that steps every particle.'],
    'python -m pytest -q tests/test_particle.py','**4 passed** in green.'),
  WIN3D('Particle Sandbox 3D'),
  S('Fill the box with 80 particles','Your first crowd of objects in 3D.',[
    'In **src/main.py**: {{from src.simulation import Simulation}} and {{from src.particle import gravity, make_drag}}.',
    'Make {{sim = Simulation(80)}}, {{forces = [gravity, make_drag(0.3)]}}, {{dt = 0.01}}.',
    'For each particle make one Ursina sphere and keep them in a parallel list: {{spheres = [Entity(model="sphere", scale=0.3, color=color.random_color()) for p in sim.particles]}}.',
    'In {{update}}: call {{sim.step(dt, forces)}} twice, then copy the physics into the graphics with a loop: {{for p, s in zip(sim.particles, spheres): s.position = Vec3(*p.r)}}.',
    'That zip loop is the only bridge between physics and graphics. Your physics code still knows nothing about Ursina, which is why the tests can run without a window.',
    'Reset when they have fallen out of view: track {{t}}, and when {{t > 6}} build a fresh {{Simulation(80)}} and set {{t = 0}}.'],
    'python -m src.main','Eighty coloured spheres hang in a cube of space, then fall and drift apart. Orbit the camera to see it is genuinely a 3D cloud and not a flat sheet.'),
  S('Prove the particles are independent','The commonest bug in this project hides in plain sight.',[
    'Add a key to turn gravity and drag off: in {{def input(key):}} use {{"g"}} to toggle gravity and {{"d"}} to toggle drag, rebuilding the {{forces}} list.',
    'Turn both off and run.',
    'Every sphere must now drift in a straight line at its own speed. If any two move in lockstep, they are sharing an array.'],
    'python -m src.main','With no forces, all 80 spheres drift in straight lines, each at a different speed and direction, and no two move together. That is the visual version of the {{test_no_shared_state}} check.'),
 ],
 done:['{{python -m pytest -q}} prints **4 passed**.','The free-fall check gives −4.9 m within 0.01.','Eighty particles fall and drift in a 3D box you can orbit.','Heavy and light particles fall at the same rate.','With forces off, no two particles move in lockstep.','Everything is saved with git.'],
 stuck:[['Every sphere sits at the origin.','You built the spheres but never copied {{p.r}} into {{s.position}} inside {{update}}.'],['They all move identically.','Shared state. Every Particle must call {{np.array(...)}} on its own inputs.'],['Everything falls sideways.','Gravity belongs on index 1 (y), not index 2 (z).']]
};

/* ---------------------------------------------------------- s1p4 */
GUIDES.s1p4 = {
 slug:'boids-3d', pip:['ursina','numpy'],
 files:[['src/__init__.py','empty file; lets Python import from src'],['src/boid.py','the Boid class'],['src/rules.py','neighbours, separation, alignment, cohesion'],['src/main.py','the 3D flock'],['tests/test_rules.py','checks for the three rules']],
 words:[['Boid','one simulated bird. It only knows what is near it'],['Neighbourhood radius R','a boid only reacts to other boids within distance R'],['Separation','steer away from neighbours that are closer than d_min'],['Alignment','steer so your velocity matches the average velocity of your neighbours'],['Cohesion','steer toward the average position of your neighbours'],['Emergence','a large pattern nobody programmed, arising from simple local rules'],['Order parameter','a number from 0 to 1 saying how much the flock points one way. 1 means perfectly aligned']],
 steps:[
  S('Write the checks','Each rule is one small function you can test with boids placed by hand.',[
    'Open **tests/test_rules.py**. Write the code below. Run it. It fails.'],
    'python -m pytest -q tests/test_rules.py','A red **ImportError**.','Everything is a 3-component vector now. The tests place boids at exact spots so you know the right answer by hand.',
`import numpy as np
from src.boid import Boid
from src.rules import neighbours, separation, alignment, cohesion

def make(x, y, z, vx=0.0, vy=0.0, vz=0.0):
    return Boid(np.array([x, y, z], dtype=float), np.array([vx, vy, vz], dtype=float))

def test_neighbours():
    a = make(0, 0, 0); b = make(30, 0, 0); c = make(100, 0, 0)
    assert neighbours(a, [a, b, c], 60) == [b]          # not itself, not the far one

def test_separation_pushes_away():
    s = separation(make(0, 0, 0), [make(10, 0, 0)], 25)
    assert s[0] < 0 and abs(s[1]) < 1e-9 and abs(s[2]) < 1e-9

def test_separation_ignores_distant_boids():
    assert np.allclose(separation(make(0, 0, 0), [make(100, 0, 0)], 25), [0, 0, 0])

def test_alignment_matches_neighbour_velocity():
    me = make(0, 0, 0, 1, 0, 0)
    n1 = make(5, 0, 0, 0, 1, 0); n2 = make(0, 5, 0, 0, 1, 0)
    assert np.allclose(alignment(me, [n1, n2]), [-1, 1, 0])

def test_cohesion_points_at_the_centre():
    me = make(0, 0, 0)
    assert np.allclose(cohesion(me, [make(10, 0, 0), make(10, 20, 6)]), [10, 10, 3])

def test_empty_neighbourhood_gives_zero():
    me = make(3, 4, 5, 1, 1, 1)
    assert np.allclose(alignment(me, []), [0, 0, 0])
    assert np.allclose(cohesion(me, []), [0, 0, 0])
    assert np.allclose(separation(me, [], 25), [0, 0, 0])`),
  S('Write the Boid and the three rules','Identical maths to 2D, with one more component.',[
    'Open **src/boid.py**: {{class Boid}} with {{__init__(self, r, v)}} storing both as numpy arrays.',
    'Open **src/rules.py**.',
    '{{neighbours(boid, flock, R)}}: the list of **other** boids with {{np.linalg.norm(boid.r - other.r) < R}}. Skip the boid itself.',
    '{{separation(boid, near, d_min)}}: start at {{np.zeros(3)}}; for every neighbour closer than {{d_min}}, add {{boid.r - other.r}}. That vector points away from the crowd.',
    '{{alignment(boid, near)}}: if empty return zeros; otherwise the average neighbour velocity minus {{boid.v}}.',
    '{{cohesion(boid, near)}}: if empty return zeros; otherwise the average neighbour position minus {{boid.r}}.',
    'Average an array of vectors with {{np.mean([n.v for n in near], axis=0)}}. The {{axis=0}} matters: it averages down the columns, giving one vector back.'],
    'python -m pytest -q tests/test_rules.py','**6 passed** in green.'),
  WIN3D('Boids 3D'),
  S('Put 120 boids in the sky','A flock you can fly the camera through.',[
    'In **src/main.py** create 120 boids with random positions in a 40 × 40 × 40 box and random unit directions scaled to speed 3.',
    'Set the constants {{R = 8.0}} (neighbourhood radius) and {{D_MIN = 3.0}}, and a weights dictionary starting at all zeros: {{w_sep}}, {{w_ali}}, {{w_coh}}.',
    'For each boid make a cone, which shows direction far better than a sphere: {{Entity(model="cone", scale=(0.4, 0.4, 1.0), color=color.azure)}}.',
    'In {{update}}, **first** compute every steering vector using the current positions, and **only then** apply them. If you update boids one at a time, early boids see old data and late boids see new data, and the flock jitters.',
    'For each boid: {{near = neighbours(b, flock, R)}}, then {{steer = w_sep*separation(b, near, D_MIN) + w_ali*alignment(b, near) + w_coh*cohesion(b, near)}}, then {{b.v = b.v + steer}}.',
    'Clamp the speed: if {{np.linalg.norm(b.v)}} is above 6, rescale it to 6; if below 3, rescale to 3. A flock with no speed limit either freezes or explodes.',
    'Move with {{b.r = b.r + b.v * time.dt}}, then wrap each coordinate into the box with the modulo operator {{%}}.',
    'Copy into graphics: {{e.position = Vec3(*b.r)}} and point the cone where it is going with {{e.look_at(Vec3(*(b.r + b.v)))}}.'],
    'python -m src.main','120 cones drift through a cube of space, pointing where they travel, but with all weights at zero they ignore each other completely.'),
  S('Turn the rules on ONE at a time','Prove each rule alone before mixing them. This is the scientific part.',[
    'In {{def input(key):}} map keys **1**, **2**, **3**, **4** to weight sets, and restart the flock each time: **1** separation only (0.05, 0, 0), **2** alignment only (0, 0.05, 0), **3** cohesion only (0, 0, 0.01), **4** all three (0.05, 0.05, 0.01).',
    'Compute the order parameter every frame: normalise every velocity to length 1, average them, and take the length of that average. In code: {{u = np.array([b.v/np.linalg.norm(b.v) for b in flock])}} then {{order = np.linalg.norm(u.mean(axis=0))}}.',
    'Also compute the mean distance to each boid\'s nearest neighbour.',
    'Show both in {{readout.text}}, with the active mode.'],
    'python -m src.main','**Key 1**: the cones spread apart and stop overlapping; nearest-neighbour distance rises above **3**. **Key 2**: the order parameter climbs toward **1** and every cone ends up pointing the same way, but they stay scattered. **Key 3**: they clump into one tight ball. Each rule alone is clearly not flocking.'),
  S('All three together','Now watch something nobody programmed.',[
    'Press **4** and watch for 30 seconds. Fly the camera inside the flock.',
    'Add keys to tune the weights while it runs: **q/a** change w_sep, **w/s** change w_ali, **e/d** change w_coh, each by 0.005.',
    'Write in **README.md**: the order parameter you reach with all three on, and what happens if you set cohesion very high.'],
    'python -m src.main','The order parameter climbs from about **0.1** to around **0.9** in roughly 15 seconds. Nearest-neighbour distance settles near **3**. Sub-groups form, travel together, merge and split. Very high cohesion collapses the flock into a frozen ball; very low alignment leaves it as chaos.'),
 ],
 done:['{{python -m pytest -q}} prints **6 passed**.','Separation alone spreads them out; alignment alone aligns them; cohesion alone clumps them.','All three together reach an order parameter above 0.8 with visible sub-flocks.','You can fly the camera through the flock.','Everything is saved with git.'],
 stuck:[['The flock jitters violently.','You applied steering as you looped. Compute all steer vectors first, then apply them.'],['They collapse to one point.','Separation too weak or D_MIN too small. Try 0.05 and 3.0.'],['The cones all point the same way regardless.','{{look_at}} needs a target **position**, so pass {{b.r + b.v}}, not {{b.v}}.'],['It runs very slowly.','Call {{neighbours}} once per boid per frame and reuse the result for all three rules.']]
};

/* ---------------------------------------------------------- s3p2 */
GUIDES.s3p2 = {
 slug:'orbit-3d', pip:['ursina','numpy'],
 files:[['src/__init__.py','empty file; lets Python import from src'],['src/orbit.py','gravity, RK4, energy, period, swept area'],['src/main.py','the 3D solar system'],['tests/test_orbit.py','checks']],
 words:[['G','the gravitational constant. We choose units where G·M = 1, so the numbers stay small'],['M','mass of the star (at the origin). m is the mass of the planet'],['r','the position vector of the planet from the star. r = |r| is the distance'],['F = −G·M·m·r̂ / r²','Newton\'s law of gravitation. The force points back at the star and weakens with the square of the distance'],['a (semi-major axis)','half the longest width of the ellipse'],['T (period)','the time for one complete orbit'],['E (specific energy)','E = ½v² − GM/r. In a closed orbit this never changes'],['L (angular momentum)','L = r × v. Also never changes. Its direction is the axis the orbit spins around']],
 steps:[
  S('Write the checks','Three laws Kepler found by watching the sky. Your code must reproduce all of them.',[
    'Open **tests/test_orbit.py**. Write the code below. Run it. It fails.'],
    'python -m pytest -q tests/test_orbit.py','A red **ImportError**.','In these units GM = 1. Starting at r = (1, 0, 0) with v = (0, 0, 1) of magnitude 1 gives a **perfect circle** of radius 1 and period **T = 2π = 6.2832**.',
`import math
from pytest import approx
from src.orbit import simulate, energy, orbit_period, semi_major_axis, swept_area, ang_momentum

def test_circular_orbit_returns_to_its_start():
    s = simulate(1.0, 0.001, 6.2832)[-1]          # v0 = 1.0 gives a circle
    assert s[1] == approx(1.0, abs=0.01)          # x back to 1
    assert abs(s[3]) < 0.01                       # z back to 0

def test_radius_is_constant_in_a_circle():
    for t, x, y, z, vx, vy, vz in simulate(1.0, 0.001, 6.2832):
        assert math.hypot(x, y, z) == approx(1.0, abs=0.01)

def test_energy_is_conserved():
    E = [energy(s) for s in simulate(0.7, 0.001, 10.0)]
    assert max(E) - min(E) < 1e-6

def test_angular_momentum_is_conserved():
    L = [ang_momentum(s) for s in simulate(0.7, 0.001, 10.0)]
    assert max(abs(l[1] - L[0][1]) for l in L) < 1e-6

def test_keplers_third_law():
    a = [semi_major_axis(v) for v in (0.7, 1.0, 1.2)]
    T = [orbit_period(v) for v in (0.7, 1.0, 1.2)]
    assert T[0] == approx(3.386, abs=0.005)
    assert T[1] == approx(6.2832, abs=0.005)
    assert T[2] == approx(14.993, abs=0.02)
    slope = (math.log(T[2]) - math.log(T[0])) / (math.log(a[2]) - math.log(a[0]))
    assert slope == approx(1.5, abs=0.01)          # T squared is proportional to a cubed

def test_keplers_second_law_equal_areas():
    states = simulate(0.7, 0.001, 3.386)
    n = len(states)
    assert swept_area(states, 0, n // 10) == approx(swept_area(states, 4 * n // 10, 5 * n // 10), rel=0.01)`),
  S('Write the gravity and the integrator','The state is six numbers: three for position, three for velocity.',[
    'Open **src/orbit.py**. A state is the tuple {{(t, x, y, z, vx, vy, vz)}}.',
    'Write {{accel(x, y, z)}}. With {{r = math.sqrt(x*x + y*y + z*z)}}, return {{(-x/r**3, -y/r**3, -z/r**3)}}.',
    'Why **r cubed**, not squared? The force size is GM/r², and the direction is the unit vector {{(x, y, z)/r}}. Multiply them: GM·(x,y,z)/r³. With GM = 1 that is the line above. **This is the single most common bug in this project.**',
    'Write {{deriv(state)}} returning the rate of change of each of the six numbers: {{(vx, vy, vz, ax, ay, az)}}.',
    'Write {{rk4_step(state, dt)}}: the same four-slope recipe you built in the integrator race, now on six numbers. k1 = deriv(s), k2 = deriv(s + dt/2·k1), k3 = deriv(s + dt/2·k2), k4 = deriv(s + dt·k3), then {{s + dt/6·(k1 + 2k2 + 2k3 + k4)}}.',
    'Write {{simulate(v0, dt, t_end)}}: start at {{(0, 1, 0, 0, 0, 0, v0)}}, which is position (1,0,0) and velocity (0,0,v0). Return the list of all states.'],
    'python -m pytest -q tests/test_orbit.py','Two or three pass; the rest still fail until you write the measuring functions next.'),
  S('Write the measuring functions','These are what turn a simulation into evidence.',[
    '{{energy(s)}}: {{0.5*(vx**2+vy**2+vz**2) - 1/r}}. This is **E = ½v² − GM/r** with GM = 1.',
    '{{ang_momentum(s)}}: the cross product **L = r × v**, so {{(y*vz - z*vy, z*vx - x*vz, x*vy - y*vx)}}. The orbit starts in the x–z plane, so the y component carries it all.',
    '{{semi_major_axis(v0)}}: the starting energy is {{E = 0.5*v0**2 - 1}}, and then **a = −1/(2E)**.',
    '{{orbit_period(v0, dt=0.001)}}: step until z goes from negative back to positive, which means a full lap. Find the exact moment between two steps by straight-line interpolation: {{t = t_prev + dt * (-z_prev)/(z_now - z_prev)}}. Skip the first few steps, since z starts at 0.',
    '{{swept_area(states, i0, i1)}}: add {{0.5 * |r₁ × r₂|}} for each neighbouring pair of positions between the two indices. Use {{np.cross}} and {{np.linalg.norm}}.'],
    'python -m pytest -q tests/test_orbit.py','**6 passed** in green. Energy and angular momentum both constant, and the Kepler slope of 1.5.','If energy drifts, you updated some of the six numbers using already-updated values. All four k vectors must come from the OLD state.'),
  WIN3D('Orbit 3D'),
  S('Build the solar system','The flagship visual.',[
    'In **src/main.py**: {{from src.orbit import simulate, energy}}.',
    'Remove the ground plane; space has no floor.',
    '{{star = Entity(model="sphere", color=color.yellow, scale=0.35)}} at the origin. Add {{PointLight(parent=star)}} so the planet is lit from the star.',
    '{{planet = Entity(model="sphere", color=color.azure, scale=0.12)}}.',
    '{{states = simulate(1.0, 0.001, 60)}} and {{i = 0}}, {{speed = 10}}.',
    'In {{update}}: {{i = (i + speed) % len(states)}}, read the state, and set {{planet.position = Vec3(x, y, z)}}.',
    'Keep the camera fixed on the star: {{camera.position = (0, 2.5, -4)}} and {{camera.look_at(star)}}, or just leave {{EditorCamera()}} and fly it yourself.',
    'Show live numbers: distance r, speed |v|, and energy E.'],
    'python -m src.main','A blue planet circles a glowing yellow star. **r stays 1.000** and **E stays −0.500** and never drifts. Orbit the camera and look edge-on: the orbit is a flat disc, because angular momentum L fixes the orbital plane.'),
  S('Draw the orbital path and try three orbits','See the ellipse as a real shape in space.',[
    'Add {{path = Entity(model=Mesh(vertices=[], mode="line", thickness=2), color=color.gray)}} and fill it once from the whole state list: one Vec3 per state, perhaps every 5th state to keep it light.',
    'In {{def input(key):}} let **1**, **2**, **3** load {{simulate(1.0, ...)}}, {{simulate(0.7, ...)}} and {{simulate(1.2, ...)}}, rebuilding the path each time.',
    'Add **up/down** to change {{speed}}, and **space** to pause.'],
    'python -m src.main','**Key 1**: a grey circle. **Key 2**: a visible ellipse; the planet starts far out at r = 1.0, falls in to about **r = 0.32** and speeds up to about **|v| = 2.16** there, then slows as it climbs back out. **Key 3**: a wide ellipse reaching **r = 2.57** where the speed drops to **0.47**. In all three, E never changes.','This speeding up and slowing down **is** Kepler\'s second law. You are watching angular momentum stay constant.'),
  S('Tilt the orbit and prove the third law','Finish with the part only 3D can show.',[
    'Change the starting velocity to have a y component: start with {{v = (0, v0·sin(i), v0·cos(i))}} where **i** is the inclination angle. Add keys to change i by 10 degrees.',
    'Draw a faint flat disc at y = 0 as a reference plane: {{Entity(model="circle", scale=6, rotation_x=90, color=color.rgba(120,120,160,40), double_sided=True)}}.',
    'Press **k** to print a table of the three orbits: a, T, and **T²/a³**.',
    'Put the table in **README.md** with one sentence on what the last column means.'],
    'python -m src.main','The orbit visibly tilts out of the reference disc as you change i, and the path stays a closed ellipse in its own tilted plane. The table reads: v₀ = 0.7 gives a = 0.662 and T = 3.386; v₀ = 1.0 gives a = 1.000 and T = 6.283; v₀ = 1.2 gives a = 1.786 and T = 14.99. **T²/a³ is about 39.5 every time**, which is 4π².'),
 ],
 done:['{{python -m pytest -q}} prints **6 passed**.','The circular orbit keeps r = 1.000 and E = −0.500 for the whole run.','Angular momentum L is conserved, and the orbit stays in one flat plane you can see edge-on.','Equal-time wedges have equal areas.','T²/a³ is about 39.5 for all three orbits, recorded in README.md.','You can tilt the orbital plane and it stays a closed ellipse.','Everything is saved with git.'],
 stuck:[['The planet spirals away or falls in.','Almost always **r² instead of r³** in {{accel}}. Re-read that step.'],['Energy drifts upward.','Your RK4 is using partly-updated values. All four k vectors come from the old state.'],['The orbit is a flat line from the camera.','That is correct, you are looking edge-on. Orbit the camera to see the ellipse.'],['The period is off by 0.01.','Use the straight-line interpolation at the z crossing rather than the nearest step.']]
};

/* ---------------------------------------------------------- s5p1 */
GUIDES.s5p1 = {
 slug:'nbody-3d', pip:['ursina','numpy','numba'],
 files:[['src/__init__.py','empty file; lets Python import from src'],['src/gravity.py','three versions of the same force calculation'],['src/main.py','the 3D cluster'],['bench.py','the timing table'],['tests/test_gravity.py','checks']],
 words:[['N-body problem','N masses all pulling on each other at once'],['O(N²)','the work grows with the square of N. Double N, quadruple the work'],['Softening ε (epsilon)','a small number added to r² so the force never blows up when two bodies nearly touch'],['Vectorising','whole-array numpy maths instead of Python loops'],['JIT','just-in-time compiler. Numba turns your Python into machine code on first call'],['Leapfrog','an integrator that keeps orbital energy steady over long runs'],['Profiling','measuring where the time actually goes, instead of guessing']],
 steps:[
  S('Write the checks','Three implementations of one formula must agree to many decimal places.',[
    'Open **tests/test_gravity.py**. Write the code below. Run it. It fails.'],
    'python -m pytest -q tests/test_gravity.py','A red **ImportError**.','The force on body i from body j is **G·mⱼ·(rⱼ − rᵢ) / (|rⱼ − rᵢ|² + ε²)^{3/2}**, with G = 1 in our units.',
`import numpy as np
from pytest import approx
from src.gravity import acc_python, acc_numpy, acc_numba, leapfrog

def random_bodies(n, seed=0):
    rng = np.random.default_rng(seed)
    return rng.normal(size=(n, 3)), rng.random(n) + 0.5

def test_all_three_agree():
    r, m = random_bodies(30)
    a = acc_python(r, m, 0.01)
    assert np.allclose(a, acc_numpy(r, m, 0.01), rtol=1e-9, atol=1e-12)
    assert np.allclose(a, acc_numba(r, m, 0.01), rtol=1e-9, atol=1e-12)

def test_two_bodies_pull_toward_each_other():
    r = np.array([[0.0, 0, 0], [1.0, 0, 0]]); m = np.array([1.0, 1.0])
    a = acc_numpy(r, m, 0.0)
    assert a[0][0] > 0 and a[1][0] < 0          # they accelerate toward one another

def test_planet_returns_after_one_orbit():
    r = np.array([[0.0, 0, 0], [1.0, 0, 0]])
    v = np.array([[0.0, 0, 0], [0.0, 0, 1.0]])
    m = np.array([1.0, 1e-9])
    for _ in range(6283):
        r, v = leapfrog(r, v, m, 0.001, 0.0, acc_numpy)
    assert r[1] == approx([1.0, 0.0, 0.0], abs=0.02)`),
  S('Write the same force three ways','One formula, three speeds.',[
    'Open **src/gravity.py**. Import numpy and {{from numba import njit}}.',
    '{{acc_python(r, m, eps)}}: two plain Python loops over i and j (skipping i == j). Build the separation {{d = r[j] - r[i]}}, then {{r2 = d·d + eps²}}, then add {{m[j] * d / r2**1.5}} to the acceleration of body i. Return an (N, 3) array.',
    '{{acc_numpy(r, m, eps)}}: **no loops**. {{d = r[None,:,:] - r[:,None,:]}} has shape (N, N, 3) and holds every separation at once. {{r2 = (d**2).sum(axis=2) + eps**2}}. Then {{w = m[None,:] / r2**1.5}} and {{np.fill_diagonal(w, 0.0)}}, which removes the self-pull. Finally {{(w[:,:,None] * d).sum(axis=1)}}.',
    '{{acc_numba(r, m, eps)}}: copy {{acc_python}} exactly, add {{@njit}} above it, and build the output with {{np.zeros((n, 3))}}. Numba cannot handle Python lists here, only numpy arrays.',
    '{{leapfrog(r, v, m, dt, eps, acc_fn)}}: kick, drift, kick. {{a = acc_fn(r, m, eps)}}, {{v = v + 0.5*dt*a}}, {{r = r + dt*v}}, {{a = acc_fn(r, m, eps)}}, {{v = v + 0.5*dt*a}}. This symmetric order is what keeps the energy steady.'],
    'python -m pytest -q tests/test_gravity.py','**3 passed** in green. The run takes 10 to 30 seconds because numba compiles on first use.'),
  S('Measure it, do not guess','An honest timing table is the real deliverable of this project.',[
    'Make **bench.py** in the project root.',
    'For N = 50, 100, 200, 400, 800 time one call to each version. **Warm numba up first** with a throwaway call, or you will be timing the compiler.',
    'Skip pure Python at N = 800 if it takes over a minute.',
    'Print N, the three times, and the ratio python ÷ numba. Copy the table into **README.md**.'],
    'python bench.py','Doubling N roughly **quadruples** every column, which is the O(N²) scaling showing itself. At N = 400 numba is typically **hundreds of times** faster than pure Python. Report your own measured numbers.'),
  WIN3D('N-Body 3D'),
  S('Build a rotating disc of 400 bodies','This is where 3D earns its place.',[
    'Remove the ground plane. Add {{Sky(color=color.black)}} if you like.',
    'Build the initial condition: 400 bodies on a thin disc. For each, pick a random radius ρ up to 6 and a random angle, giving {{x = ρ·cos(angle)}}, {{z = ρ·sin(angle)}}, and a small random {{y}} between −0.3 and 0.3 so it is a disc, not a plane.',
    'Give each an orbital velocity so the disc holds together instead of collapsing: speed {{0.6·sqrt(ρ)}} in the direction perpendicular to its radius, which is {{(-z, 0, x)}} normalised.',
    'Masses are {{1/400}} each. Use {{eps = 0.08}} and {{dt = 0.004}}.',
    'Make 400 small spheres, scale 0.07. Colour each by speed: slow blue, fast white. {{color.rgb(t, t, 1.0)}} with t from the speed works.',
    'In {{update}}: two {{leapfrog}} steps with {{acc_numba}}, then the zip loop copying {{r}} into the sphere positions.'],
    'python -m src.main','A rotating disc of 400 points. Over 20 to 60 seconds it develops **clumps and spiral-arm structure**, entirely from gravity. Fly the camera above the disc to see the arms, then edge-on to see how thin it is. This is the picture worth putting in your portfolio.'),
  S('Switch backends live and feel the difference','Speed as something you experience, not read.',[
    'In {{def input(key):}} map **p**, **n**, **b** to {{acc_python}}, {{acc_numpy}}, {{acc_numba}}.',
    'Show the backend name and the milliseconds per frame in {{readout.text}}. Measure it with {{time.perf_counter()}} around the physics, using {{import time as pytime}} so it does not clash with Ursina\'s {{time}}.',
    'Press **1** for a cold cloud (all velocities zero) and **2** for the rotating disc.'],
    'python -m src.main','Pressing **p** drops the frame rate to a crawl. **b** makes it smooth again, with an identical picture. Key 1 shows the cold cloud collapsing inward into a dense knot, which is a completely different outcome from the rotating disc.','Why does the cold cloud collapse but the disc does not? The disc has angular momentum; the cloud has none. That is the same physics you proved in the orbit project.'),
 ],
 done:['{{python -m pytest -q}} prints **3 passed** and all three backends agree.','bench.py prints a real measured table, in README.md.','A 400-body disc develops clumps and spiral structure you can fly around.','Switching to pure Python visibly slows the window with no change to the picture.','The cold cloud collapses and the rotating disc does not.','Everything is saved with git.'],
 stuck:[['Numba refuses to compile.','Use only numpy arrays and plain numbers inside the function. No lists, no dicts.'],['Bodies shoot off at enormous speed.','Two bodies came too close. Raise {{eps}} to 0.08 or lower {{dt}}.'],['The disc flies apart immediately.','Your orbital speed is too high, or you put the velocity along the radius instead of perpendicular to it.'],['Numba looks slower than numpy.','You timed the first call, which includes compiling. Warm it up.']]
};

/* ---------------------------------------------------------- s4p1 */
GUIDES.s4p1 = {
 slug:'heat-3d', pip:['ursina','numpy'],
 files:[['src/__init__.py','empty file; lets Python import from src'],['src/heat.py','the 1D and 2D solvers, no graphics'],['src/main.py','the 3D temperature landscape'],['tests/test_heat.py','checks']],
 words:[['PDE','partial differential equation: a rule about change in both time and space'],['u(x, y, t)','the temperature at a point, at a moment'],['α (alpha)','thermal diffusivity: how fast heat spreads through the material'],['∂u/∂t = α∇²u','the heat equation. The rate of warming equals α times how much colder a point is than its neighbours'],['Δx (dx)','the spacing between grid points'],['r = α·Δt/Δx²','the stability number. This one number decides whether the simulation works or explodes'],['CFL condition','the rule that r must stay small enough. For this scheme, r ≤ 0.5 in 1D and r ≤ 0.25 in 2D']],
 steps:[
  S('Write the checks','One special starting shape has an exact answer you can check against.',[
    'Open **tests/test_heat.py**. Write the code below. Run it. It fails.'],
    'python -m pytest -q tests/test_heat.py','A red **ImportError**.','If a rod starts as **u(x,0) = sin(πx)** it stays a sine wave forever and simply fades: **u(x,t) = sin(πx)·e^(−απ²t)**. At t = 2 with α = 0.01 the peak is e^(−0.1974) = **0.8209**.',
`import math
import numpy as np
from pytest import approx
from src.heat import heat1d, blow_up_step, heat2d_step, blow_up_2d

def exact(x, t, alpha=0.01):
    return np.sin(np.pi * x) * math.exp(-alpha * math.pi ** 2 * t)

def test_error_shrinks_as_the_grid_gets_finer():
    errs = []
    for n, dt in [(20, 0.01), (50, 0.01), (100, 0.002)]:
        x, u, r = heat1d(n, dt, 0.01, 2.0)
        errs.append(np.max(np.abs(u - exact(x, 2.0))))
    assert errs[0] > errs[1] > errs[2]
    assert errs[1] < 1e-4 and errs[2] < 1e-5

def test_peak_matches_the_exact_answer():
    x, u, r = heat1d(50, 0.01, 0.01, 2.0)
    assert u.max() == approx(0.8209, abs=0.001)

def test_the_stability_limit_is_real():
    assert blow_up_step(50, 0.4) is None            # r = 0.4, safe
    step = blow_up_step(50, 0.6)                    # r = 0.6, too big
    assert step is not None and 100 < step < 140

def test_2d_limit_is_one_quarter():
    assert blow_up_2d(0.2) is None
    assert blow_up_2d(0.3) is not None and blow_up_2d(0.3) < 60`),
  S('Write the solver','The whole method is one line inside a loop.',[
    'Open **src/heat.py**.',
    '{{heat1d(n, dt, alpha=0.01, t_end=2.0)}}: a rod from 0 to 1 with {{x = np.linspace(0, 1, n)}}, {{dx = x[1]-x[0]}}, {{r = alpha*dt/dx**2}}, starting {{u = np.sin(np.pi*x)}}.',
    'Repeat {{round(t_end/dt)}} times: {{u[1:-1] = u[1:-1] + r*(u[2:] - 2*u[1:-1] + u[:-2])}}, then force {{u[0] = 0}} and {{u[-1] = 0}} (the ends are held at zero).',
    'Read that line out loud: each point moves a fraction **r** of the way toward the average of its two neighbours. That is the whole heat equation.',
    'Return {{(x, u, r)}}.',
    '{{blow_up_step(n, r, alpha=0.01, limit=10, max_steps=1000)}}: same rod, but pick {{dt = r*dx**2/alpha}} so you get exactly the r you asked for. Step until the biggest absolute value exceeds {{limit}} and return that step number, else {{None}}.',
    '{{heat2d_step(u, r)}}: on a square grid, {{lap = np.roll(u,1,0)+np.roll(u,-1,0)+np.roll(u,1,1)+np.roll(u,-1,1)-4*u}}, then {{u = u + r*lap}}, then zero all four edge lines.',
    '{{blow_up_2d(r, n=60, steps=400)}}: a hot 10×10 square of 100 in a cold grid; return the step where it passes 1000, else {{None}}.'],
    'python -m pytest -q tests/test_heat.py','**4 passed** in green. You have now **proved** the CFL limits rather than been told them.'),
  WIN3D('Heat 3D'),
  S('Turn temperature into a landscape','The thing 2D cannot do: height AND colour both carry the temperature.',[
    'In **src/main.py** make a grid {{N = 60}} and {{u = np.zeros((N, N))}} with a hot 8×8 square of 100 in the middle. Set {{r = 0.2}}.',
    'Write a function {{build(u)}} that returns {{(verts, tris, cols)}} for the surface mesh.',
    'Vertices: loop i and j over the grid and append {{Vec3(i*0.2 - 6, u[i,j]*0.04, j*0.2 - 6)}}. The **height is the temperature**, scaled by 0.04 so a 100-degree spot is 4 units tall.',
    'Colours: with {{t = min(1, u[i,j]/100)}}, use {{color.rgb(t, 0.25, 1-t)}}, so cold is blue and hot is red.',
    'Triangles: for each square cell with corners {{a = i*N+j}}, {{b = a+1}}, {{c = a+N}}, {{d = c+1}}, add the two triangles {{[a, c, b, b, c, d]}}.',
    'Create it once: {{surf = Entity(model=Mesh(vertices=v, triangles=t, colors=c), double_sided=True)}}.',
    'In {{update}}: run {{heat2d_step}} 4 times, then rebuild and push the new data: {{surf.model.vertices = v}}, {{surf.model.colors = c}}, then {{surf.model.generate()}}.',
    'Rebuild the vertex list each frame, but build the **triangle** list only once outside {{update}}; the connectivity never changes.'],
    'python -m src.main','A red mountain of heat stands on a blue plain. It **visibly sinks and spreads out** into a wide low mound, then flattens toward zero. Orbit to a low angle to watch the profile flatten, which is the sine-fade you proved in the tests, happening in 2D.'),
  S('Break it on purpose','Cross the stability line and watch the simulation destroy itself.',[
    'In {{def input(key):}} let **up/down** change {{r}} by 0.02 between 0.04 and 0.34, resetting the grid each time. Show {{r}} in the readout.',
    'Let a mouse click or the key **h** drop a fresh hot block somewhere.',
    'Set r to 0.30 and watch. Then 0.26. Then 0.24.'],
    'python -m src.main','At **r = 0.30** the smooth mountain erupts into violent spikes within about **25 steps** and the numbers run away past a thousand. At **r = 0.26** it takes roughly **140 steps**. At **r = 0.24** it stays calm forever. The boundary is exactly **0.25**, the number your test proved.','Write one sentence in README.md explaining r in plain words: how far a point is allowed to move toward its neighbours in one time step.'),
  S('Check it against the exact answer','Finish with numbers, not just a pretty surface.',[
    'Make **errors.py** in the project root. For the three rods from the tests, print n, dt, r, and the largest error against the exact formula.'],
    'python errors.py','Three rows with the error column falling roughly **2.9e-4, 2.4e-5, 2.4e-6**. Finer grid, smaller error. Put the table in README.md.'),
 ],
 done:['{{python -m pytest -q}} prints **4 passed**.','The 3D temperature landscape sinks and spreads as heat diffuses.','r = 0.30 explodes into spikes; r = 0.24 does not.','errors.py shows the error shrinking with resolution.','README.md explains r in your own words.','Everything is saved with git.'],
 stuck:[['The surface is black or invisible.','Pass {{double_sided=True}}, and make sure the colours list is the same length as the vertices list.'],['The mesh never changes.','You must call {{surf.model.generate()}} after replacing vertices and colours.'],['It runs very slowly.','N = 60 is 3600 vertices, which is fine. If you raised N, lower it, or rebuild every other frame.'],['Everything is flat.','Your height scale is too small, or {{u}} is already near zero. Print {{u.max()}}.']]
};

/* ---------------------------------------------------------- s4p4 */
GUIDES.s4p4 = {
 slug:'truss-3d', pip:['ursina','numpy'],
 files:[['src/__init__.py','empty file; lets Python import from src'],['src/truss.py','the finite element solver'],['src/main.py','the 3D bridge bending'],['tests/test_truss.py','checks']],
 words:[['Truss','a frame of straight bars joined at pins. Bars only pull or push along their own length'],['Node','a joint where bars meet'],['Member','one bar'],['Tension','a bar being stretched. We call that force positive'],['Compression','a bar being squeezed. Negative'],['k = EA/L','a bar\'s stiffness: E is the material stiffness, A the cross-section area, L the length'],['K·u = F','the whole structure as one matrix equation. K is stiffness, u is the movements, F the loads'],['Degree of freedom','one direction a node is free to move. In 3D each node has three']],
 steps:[
  S('Do the hand calculation first','Before any code, get the answer the way an engineer would on paper.',[
    'Draw this: node 0 at (0,0,0) pinned, node 1 at (4,0,0) pinned, node 2 at (2,3,0) free. Two bars: 0→2 and 1→2. Both have k = 1000 N/m. A load of **100 N pulls node 2 straight down**.',
    'Each bar has length L = √(2² + 3²) = **√13 = 3.606 m**.',
    'The vertical share of each bar\'s direction is **3/√13 = 0.8321**.',
    'By symmetry both bars carry the same force N. Vertical equilibrium at node 2 gives **2·N·0.8321 = 100**, so **N = 60.09 N**, and it is compression, so −60.09.',
    'The node moves down by **u = −0.0722 m**.'],
    null,'You now have the right answer written down: **u_y = −0.0722 m** and **both bars −60.09 N**. Your code must reproduce exactly this.'),
  S('Write the checks','Two trusses: the hand one, and a 3D bridge.',[
    'Open **tests/test_truss.py**. Write the code below. Run it. It fails.'],
    'python -m pytest -q tests/test_truss.py','A red **ImportError**.','Supports are written as {{(node, "xyz")}} to lock all three directions, or {{(node, "y")}} to lock only the vertical.',
`import math
import numpy as np
from pytest import approx
from src.truss import solve_truss, equilibrium_error

def test_the_hand_calculation():
    nodes = [(0, 0, 0), (4, 0, 0), (2, 3, 0)]
    members = [(0, 2, 1000.0), (1, 2, 1000.0)]
    u, forces = solve_truss(nodes, members, [(0, "xyz"), (1, "xyz")], {2: (0.0, -100.0, 0.0)})
    assert u[2][1] == approx(-0.07222, abs=1e-4)
    assert forces == approx([-60.09, -60.09], abs=0.01)

def make_bridge():
    nodes = [(0,0,0), (2,0,0), (4,0,0), (1,1.5,0), (3,1.5,0),
             (0,0,2), (2,0,2), (4,0,2), (1,1.5,2), (3,1.5,2)]
    pairs = [(0,1),(1,2),(0,3),(3,1),(1,4),(4,2),(3,4),
             (5,6),(6,7),(5,8),(8,6),(6,9),(9,7),(8,9),
             (0,5),(1,6),(2,7),(3,8),(4,9)]
    EA = 1e4
    members = [(i, j, EA / math.dist(nodes[i], nodes[j])) for i, j in pairs]
    fixed = [(0,"xyz"), (2,"xyz"), (5,"xyz"), (7,"xyz")]
    loads = {1: (0.0, -100.0, 0.0), 6: (0.0, -100.0, 0.0)}
    return nodes, members, fixed, loads

def test_bridge_sags_and_balances():
    nodes, members, fixed, loads = make_bridge()
    u, forces = solve_truss(nodes, members, fixed, loads)
    assert u[1][1] < 0 and u[6][1] < 0                   # the loaded nodes go DOWN
    assert equilibrium_error(nodes, members, forces, loads, [1, 3, 4, 6, 8, 9]) < 1e-6

def test_doubling_the_load_doubles_the_forces():
    nodes, members, fixed, loads = make_bridge()
    u1, f1 = solve_truss(nodes, members, fixed, loads)
    heavy = {k: (0.0, 2 * v[1], 0.0) for k, v in loads.items()}
    u2, f2 = solve_truss(nodes, members, fixed, heavy)
    assert np.allclose(np.array(f2), 2 * np.array(f1), rtol=1e-6)`),
  S('Write the solver','Build one big stiffness matrix, then solve it.',[
    'Open **src/truss.py**. With {{n}} nodes, {{K}} is a {{(3n, 3n)}} array of zeros. Node {{i}} owns rows {{3i}}, {{3i+1}}, {{3i+2}} for x, y, z.',
    'For every member {{(a, b, k)}}: compute {{L}}, then the **direction cosines** {{cx = (xb-xa)/L}}, {{cy = (yb-ya)/L}}, {{cz = (zb-za)/L}}. Put them in a vector {{c = np.array([cx, cy, cz])}}.',
    'The 3×3 block is {{kb = k * np.outer(c, c)}}. An outer product: it spreads the bar\'s stiffness across the three directions according to how the bar is angled.',
    'Add it in four places: {{K[a_rows, a_cols] += kb}}, {{K[b_rows, b_cols] += kb}}, {{K[a_rows, b_cols] -= kb}}, {{K[b_rows, a_cols] -= kb}}. Use {{np.ix_}} to index a block.',
    'Build {{F}} of length 3n from the loads dictionary.',
    'Work out which rows are locked from {{fixed}}: "x" locks {{3i}}, "y" locks {{3i+1}}, "z" locks {{3i+2}}, "xyz" locks all three. {{free}} is everything else.',
    'Solve only the free part: {{u[free] = np.linalg.solve(K[np.ix_(free, free)], F[free])}}.',
    'Member force: the stretch is {{(u_b - u_a) · c}}, and the force is {{k * stretch}}. Positive is tension.',
    '{{equilibrium_error(...)}}: at each free node, add up each attached member\'s force times the unit vector pointing from that node toward the other end, plus the applied load. Return the largest magnitude. It should be essentially zero.'],
    'python -m pytest -q tests/test_truss.py','**3 passed** in green, including the hand calculation matching exactly.','If the forces come out with the wrong sign, check that {{c}} points from node a toward node b consistently in both the assembly and the force recovery.'),
  WIN3D('Truss 3D'),
  S('Build the bridge and load it','A real 3D structure you can walk the camera around.',[
    'In **src/main.py** import {{solve_truss}} and {{make_bridge}} (move {{make_bridge}} into **src/truss.py** so both the test and the app share it).',
    'Draw each node as a small sphere, scale 0.12.',
    'Draw each member as a **cylinder** stretched between its two nodes. Helper: make {{Entity(model="cube", scale=(0.07, 0.07, L))}}, set {{position}} to the midpoint of the two ends, then {{look_at(Vec3(*end_b))}}. The cube\'s long axis is z, which is the axis {{look_at}} aims, so this works cleanly.',
    'Colour each member by its force: red for compression (negative), blue for tension (positive), and make the thickness grow with |force|.',
    'Animate the sag: let {{s}} rise from 0 to 1 over about 60 frames, and draw every node at {{position + s * EXAGGERATION * u}} with {{EXAGGERATION = 200}}, because the real movement is only millimetres.'],
    'python -m src.main','A 3D bridge, two trusses side by side joined by cross-bracing. When loaded it **visibly sags** in the middle. The top members turn red and the bottom ones blue. Fly the camera underneath and along the deck to see the whole load path.'),
  S('Find the weakest member and check the supports','The engineering answer.',[
    'In {{def input(key):}} use **left/right** to change the load between 0 and 300 N and re-solve, and **up/down** to change the exaggeration.',
    'Print the member carrying the largest |force|, and the vertical reaction at each support.',
    'The four reactions must add up to the total load applied.',
    'Put both results in **README.md**.'],
    'python -m src.main','The largest force sits in one of the top chord members. The four support reactions sum to **200 N**, exactly the two 100 N loads. Doubling the load doubles every member force, which your test already proved.'),
 ],
 done:['{{python -m pytest -q}} prints **3 passed**, including the hand calculation.','The 3D bridge sags under load with red compression and blue tension members.','Support reactions sum to the applied load.','Doubling the load doubles the forces.','README.md names the most heavily loaded member.','Everything is saved with git.'],
 stuck:[['numpy says the matrix is singular.','The structure can still slide or spin. You need enough locked directions; the bridge locks all three at four corners.'],['Members are drawn at wrong angles.','{{look_at}} aims the entity\'s **z** axis, so the cube\'s long dimension must be the third one in {{scale}}.'],['Forces have the wrong sign.','The stretch is {{(u_b - u_a) · c}} with {{c}} pointing a → b. Keep that direction consistent everywhere.'],['The sag is invisible.','The real displacement is tiny. Raise EXAGGERATION.']]
};

/* ---------------------------------------------------------- s4p6 */
GUIDES.s4p6 = {
 slug:'wave-sonar-3d', pip:['ursina','numpy'],
 files:[['src/__init__.py','empty file; lets Python import from src'],['src/wave.py','the wave solver and the depth estimate'],['src/main.py','the 3D wavefield'],['tests/test_wave.py','checks']],
 words:[['Wave equation','∂²p/∂t² = c²∇²p. Unlike heat, a disturbance travels instead of fading'],['p','pressure: how squeezed the material is at a point'],['c','wave speed. 1500 m/s in water, about 3000 m/s in hard rock'],['Ricker wavelet','a short clean pulse: one bump with a small dip on each side'],['CFL in 2D','c·Δt/Δx must be at most 1/√2 ≈ 0.7071, or the simulation explodes'],['Reflection','part of a wave bouncing back where the speed c changes suddenly'],['Two-way travel time','how long a pulse takes to go down, bounce, and come back up']],
 steps:[
  S('Write the checks','The speed, the stability rule, and the hidden depth all have exact right answers.',[
    'Open **tests/test_wave.py**. Write the code below. Run it. It fails.'],
    'python -m pytest -q tests/test_wave.py','A red **ImportError**.','The source sits at the surface. Receivers are 0, 100, 200 and 300 m to its side. A rock layer with c = 3000 m/s starts **200 m down**. Your job is to recover that 200 m from the echo alone.',
`import math
import numpy as np
import pytest
from pytest import approx
from src.wave import ricker, check_cfl, run_wave, direct_speed, estimate_depths

def test_ricker_peaks_at_t0():
    assert ricker(0.08) == approx(1.0)

def test_cfl_rule():
    check_cfl(1500, 0.001, 5.0)                  # 1500*0.001/5 = 0.3, fine
    with pytest.raises(ValueError):
        check_cfl(3000, 0.002, 5.0)              # 1.2, far too big

def test_speed_measured_in_water():
    assert 1400 < direct_speed(run_wave(layered=False)) < 1600

def test_depth_recovered_from_the_echo():
    for h in estimate_depths(run_wave(layered=True), run_wave(layered=False)):
        assert abs(h - 200) < 10                 # within 5 percent of the true 200 m`),
  S('Write the solver','A wave needs TWO past time levels, not one.',[
    'Open **src/wave.py**. Constants: {{NX = 300}}, {{NZ = 200}}, {{DX = 5.0}} m, {{DT = 0.001}} s, {{F0 = 15.0}} Hz, {{T0 = 0.08}} s, source at row 2 column 150, receivers on row 2 at columns {{[150, 170, 190, 210]}}, interface at row 40, and {{OFFSETS = [0, 100, 200, 300]}}.',
    '{{ricker(t, f0=F0, t0=T0)}}: with {{a = (math.pi*f0*(t - t0))**2}}, return {{(1 - 2*a)*math.exp(-a)}}.',
    '{{check_cfl(c_max, dt, dx)}}: raise {{ValueError}} if {{c_max*dt/dx > 0.7071}}.',
    '{{run_wave(layered, t_end=0.7)}}: build {{c}} full of 1500.0, and if layered set {{c[40:, :] = 3000.0}}. Call {{check_cfl}} with the largest c. Precompute {{cc = (c*DT/DX)**2}}.',
    'Keep two arrays, {{p_old}} and {{p}}, both starting at zero. Each step: {{lap}} is the usual four-neighbour sum minus 4·p, computed only on the interior. Then **{{p_new = 2*p - p_old + cc*lap}}**.',
    'That is the one line that makes it a wave. Heat used one past level and smoothed out; a wave uses two and so carries momentum, which is why it travels.',
    'Add the source each step: {{p_new[2, 150] += ricker(step*DT)}}. Zero the four edges. Then shift: {{p_old = p}} and {{p = p_new}}.',
    'Record all four receiver values every step. Return an array of shape (4, n_steps).',
    '{{direct_speed(traces)}}: find the time of the largest absolute value in the first 0.4 s at receivers 1 and 3, then speed = 200 m ÷ the time difference.',
    '{{estimate_depths(layered, uniform)}}: take the **difference** of the two trace sets, which cancels the direct wave and leaves only the echo. For each receiver find the time t of the biggest value, then {{h = 0.5*sqrt((1500*(t - T0))**2 - offset**2)}}.'],
    'python -m pytest -q tests/test_wave.py','**4 passed** in green, and the four recovered depths all sit within 10 m of 200 m.','Why subtracting works: the wave equation is **linear**, so the layered run equals the uniform run plus the echo. Subtract and only the echo remains. Real seismologists use the same trick.'),
  WIN3D('Wave Sonar 3D'),
  S('Make the wavefield a living surface','The pressure field becomes a sheet that ripples in 3D.',[
    'In **src/main.py** wrap the stepping code in a small {{class Wave}} with a {{step()}} method so the app can advance it one step at a time.',
    'Build a surface mesh over the (x, z) grid, but **subsample** it: take every 2nd point, giving 150 × 100 = 15000 vertices, which Ursina handles comfortably.',
    'Vertex height is the pressure: {{Vec3(i*0.1 - 7.5, p[i,j]*AMP, j*0.1 - 5)}} with {{AMP}} around 300, since pressure values are small.',
    'Colour by sign: positive pressure red, negative blue, near zero dark. {{t = clip(p*scale, -1, 1)}} then {{color.rgb(max(t,0), 0.1, max(-t,0))}}.',
    'Advance 3 steps per frame, then rebuild vertices and colours and call {{generate()}}.',
    'Draw the interface as a translucent plane at the depth of row 40 so you can see what the wave is bouncing off.'],
    'python -m src.main','A flat sheet suddenly erupts into a **ring ripple spreading outward** from the source. In the layered case you can watch part of the ring bounce off the interface plane and travel back up, while the rest speeds up below it. Fly the camera low and along the surface: this is the view a 2D version simply cannot give.'),
  S('Record the echo and recover the hidden depth','Turn the picture into a measurement.',[
    'Draw a small 2D trace panel: for receiver 0, plot the recorded value against time as a line mesh along the top of the scene.',
    'Press **d** to run both media, subtract, and print the four estimated depths next to the true 200 m.',
    'Press **1** and **2** to switch between uniform water and the layered model.'],
    'python -m src.main','The trace shows the direct pulse at about **0.08 s** and the echo at about **0.35 s**. The four depth estimates all land between **190 and 210 m**, recovering a buried boundary you never told the estimator about.'),
  S('Break the CFL rule and watch it detonate','The most dramatic failure in this whole curriculum.',[
    'Press **x** to switch {{DT}} to 0.002 and restart in the layered model. Temporarily skip the {{check_cfl}} call so it is allowed to run.',
    'Watch. Then press **x** again to go back to 0.001.'],
    'python -m src.main','At DT = 0.002 the fast rock layer has **c·Δt/Δx = 1.2**, well past 0.7071. Within about **65 steps** the smooth sheet tears itself into enormous jagged spikes and the values run away. At 0.001 it stays perfectly calm.','Note in README.md that the *fast* layer is what sets the limit: stability is decided by the **largest** c anywhere on your grid.'),
 ],
 done:['{{python -m pytest -q}} prints **4 passed**.','The measured speed in water is within 7 percent of 1500 m/s.','All four depth estimates land within 10 m of 200 m.','You watched the ring ripple and the echo in 3D.','DT = 0.002 visibly explodes; DT = 0.001 does not.','Everything is saved with git.'],
 stuck:[['The sheet stays flat.','The amplitude scale is far too small. Print {{p.max()}} and raise AMP until the ripple is visible.'],['It runs at a few frames per second.','Subsample more: take every 3rd point instead of every 2nd.'],['Depth comes out near 100 or 400.','Subtract the uniform run from the layered run, and remember to subtract T0 before multiplying by 1500.'],['Everything is NaN after a few steps.','You violated CFL, or you forgot that the wave needs {{p_old}} as well as {{p}}.']]
};

/* ---------------------------------------------------------- s5p6 */
GUIDES.s5p6 = {
 slug:'flood-3d', pip:['ursina','numpy','requests'],
 files:[['src/__init__.py','empty file; lets Python import from src'],['src/dem.py','download and clean the elevation map'],['src/flood.py','the water model'],['src/main.py','the 3D terrain flooding'],['tests/test_flood.py','checks'],['data/','elevation data is cached here']],
 words:[['DEM','digital elevation model: a grid of real ground heights, from satellite'],['Void','a missing pixel in the elevation data. Common over water'],['h','water depth above the ground at a cell, in metres'],['Water surface w','w = ground + h. Water flows from high w to low w, never from high ground to low ground'],['Mass conservation','water is neither created nor destroyed. Total in must equal total on the map'],['Sink','a low spot where water collects'],['Inundation','the area covered by water']],
 steps:[
  S('Write the checks','Two physical laws any flood model must obey, or it is worthless.',[
    'Open **tests/test_flood.py**. Write the code below. Run it. It fails.'],
    'python -m pytest -q tests/test_flood.py','A red **ImportError**.','These two checks catch nearly every possible bug: water must never climb, and water must never appear from nowhere.',
`import numpy as np
from pytest import approx
from src.flood import step, fill_voids

def v_valley(n=20):
    x = np.abs(np.arange(n) - n // 2)
    return np.tile(x, (n, 1)).astype(float)       # a V shaped valley, low down the middle

def test_water_is_conserved():
    g = v_valley(); h = np.zeros_like(g); h[2, 2] = 50.0
    total = h.sum()
    for _ in range(300):
        h = step(g, h, c=0.2)
    assert h.sum() == approx(total, rel=1e-9)

def test_water_runs_down_into_the_valley_floor():
    g = v_valley(); h = np.zeros_like(g); h[5, 2] = 50.0
    for _ in range(2000):
        h = step(g, h, c=0.2)
    mid = g.shape[1] // 2
    assert h[:, mid - 1: mid + 2].sum() > 0.8 * h.sum()

def test_depth_never_goes_negative():
    g = v_valley(); h = np.zeros_like(g); h[3, 3] = 20.0
    for _ in range(500):
        h = step(g, h, c=0.2)
    assert h.min() >= -1e-12

def test_fill_voids():
    g = np.array([[1.0, 2.0], [-32768.0, 4.0]])
    out = fill_voids(g)
    assert out.min() > -1000 and np.isfinite(out).all()`),
  S('Write the water model','Water chases the lowest water surface, not the lowest ground.',[
    'Open **src/flood.py**.',
    '{{fill_voids(ground, nodata=-32768)}}: replace any value at or below the marker, or not finite, with the mean of its valid neighbours; repeat a few times; fill anything left with the overall mean.',
    '{{step(ground, h, c=0.2)}}: first {{w = ground + h}}, the water surface.',
    'For each of the four directions compute the drop to that neighbour, but keep only the **positive** part: {{out_dir = c * np.maximum(0, w - np.roll(w, ...))}}.',
    'Add the four together into {{total_out}}. A cell cannot give away more water than it has, so compute {{scale = np.minimum(1, h / np.maximum(total_out, 1e-12))}} and multiply **all four** directions by it.',
    '**Scale all four together, not each one separately.** Capping each direction on its own is the bug that silently destroys water, and the first check will catch it.',
    'The new depth is {{h - (sum of the scaled outflows) + (sum of the matching inflows)}}. Get each inflow by rolling the corresponding outflow array the opposite way.',
    'Because every unit leaving one cell arrives in another, the total is conserved automatically. That is why the first check passes exactly rather than approximately.'],
    'python -m pytest -q tests/test_flood.py','**4 passed** in green.'),
  S('Validate on a toy valley before touching real terrain','Real terrain hides bugs that a simple shape exposes.',[
    'Make **valley_check.py** in the project root: build the same V valley, drop water at the top, run 2000 steps, print the start and end totals and the share of water in the middle three columns.'],
    'python valley_check.py','The two totals are **identical to many decimal places**, and over **80 percent** of the water sits in the valley floor. Only now is the model allowed near real data.'),
  S('Download a real elevation map','Real terrain, somewhere that actually floods.',[
    'Open **src/dem.py**. Write {{get_dem(south, north, west, east, n=70)}} using the free Open Topo Data service: {{https://api.opentopodata.org/v1/srtm30m?locations=LAT,LON|LAT,LON|...}}, at most **100 points per request**.',
    'Build an n × n grid of latitude and longitude across the box, request it in batches of 100, and pause **1 second** between batches, which the free service asks for.',
    'Return an n × n numpy array of metres, passed through {{fill_voids}}, and cache it to **data/dem.npy** with {{np.save}}.',
    'Pick a real flood-prone valley and write the exact box in **README.md**. One example: part of the Nyabugogo valley in Kigali, roughly south −1.97, north −1.93, west 30.03, east 30.08.'],
    'python -c "from src.dem import get_dem; d = get_dem(-1.97, -1.93, 30.03, 30.08); print(d.shape, round(float(d.min())), round(float(d.max())))"','**(70, 70)** and two elevations differing by tens to hundreds of metres. If min equals max your box is flat; choose a hillier one. The download takes about a minute.'),
  WIN3D('Flood 3D'),
  S('Turn the DEM into real 3D terrain','This is the project where 3D stops being a nice-to-have.',[
    'In **src/main.py** load the DEM. Normalise the heights for display: {{z = (ground - ground.min()) * VSCALE}} with {{VSCALE}} around 0.02, so a 200 m hill is 4 units tall.',
    'Build a terrain mesh exactly as in the heat project: vertices with the elevation as the **y** coordinate, two triangles per cell.',
    'Colour by elevation: low ground green, high ground brown, highest grey. Interpolate between them with the normalised height.',
    'Create it once as {{terrain = Entity(model=Mesh(...), double_sided=True)}}. The terrain never changes, so you build this mesh **once**, not every frame.',
    'Add {{DirectionalLight(y=5, z=-3)}} so the hills have visible shading, which is what makes the shape readable.'],
    'python -m src.main','Real terrain, in 3D, that you can fly around. The valleys and ridges of an actual place are immediately obvious in a way a flat colour map never manages.'),
  S('Flood it','Water creeping across real ground.',[
    'Build a **second** mesh for the water surface, with the same x and z but height {{(ground + h)*VSCALE}}, and make it semi-transparent blue: {{color=color.rgba(40, 110, 220, 160)}}.',
    'Hide any cell with no water by dropping its vertex just below the terrain, or by setting its colour alpha to 0.',
    'Each frame, run several {{step}} calls, then rebuild only the **water** mesh vertices and colours and call {{generate()}}.',
    'Add inflow: key **r** for river mode, which adds depth to the lowest cell on one edge every frame; key **n** for rain mode, which adds a little to every cell. **c** clears the water. **up/down** change the inflow rate.',
    'Show total water added and total water on the map. They must stay equal, which is your conservation check running live.'],
    'python -m src.main','Blue water pours in and **creeps downhill along the real valley floors**, pooling in the low ground first while the ridges stay dry no matter how long you run it. The two water totals on screen stay equal.'),
  S('Compare with a real flood, or say honestly that you cannot','The validation step.',[
    'Search for a documented flood in your chosen area and any map of its extent.',
    'If you find one: mark the cells your model floods at a chosen volume, and report the overlap as **cells in both ÷ cells in either**, a number between 0 and 1.',
    'If you cannot find one, write that plainly in **README.md** and state that your validation rests on the two physical checks plus the toy valley, not on observations.'],
    null,'Either a real overlap number, or an honest paragraph. Both are acceptable science. Claiming a validated result without data is not.'),
 ],
 done:['{{python -m pytest -q}} prints **4 passed**.','Water is conserved to many decimal places, live on screen.','Water never climbs uphill, proved on the toy valley before real terrain.','Real 3D terrain floods valley-first and you can fly around it.','README.md gives your exact area box and either an overlap score or an honest statement.','Everything is saved with git.'],
 stuck:[['Water slowly disappears.','You capped each direction separately. Scale all four outflows by one shared factor.'],['Water sits on a hilltop.','You compared ground heights instead of water surfaces. Use {{w = ground + h}}.'],['The terrain is a flat sheet.','VSCALE is too small, or the DEM box is genuinely flat. Print min and max.'],['It runs slowly.','You are rebuilding the terrain mesh every frame. Build it once; only the water mesh changes.'],['The DEM download fails.','Keep to 100 points per request and pause 1 second between batches.']]
};


/* =========================================================
   DOMAIN COLOR MAP
   ========================================================= */

export { STAGES, PROJECTS, CAPSTONE, GUIDES, GUIDES_2D, S };
