/**
 * Two Stage 5 projects redesigned at the learner's request (Nov 2026): AI that is also computational science.
 *   s5p4  Data-Driven Surrogate Model      → Moto-Taxi Rush (neuroevolution riders in a traffic simulation)
 *   s5p5  Crop Yield Prediction            → AI vs the Virus (reinforcement learning and evolution run an epidemic response)
 * The ids stay the same so links and saved progress keep working. Every number in the guides comes from
 * scripts/reference/s5p4 and s5p5, and every test runs against them (scripts/verify_guides.sh).
 */
import type { Guide, GuideStep, LegacyProject } from './legacy/curriculum.js';
import type { Visual } from './stage01';
import { MOTO_T1, MOTO_T2, MOTO_T3, MOTO_T4, MOTO_T5, MOTO_T6, VIRUS_T1, VIRUS_T2, VIRUS_T3, VIRUS_T4, VIRUS_T5 } from './redesignedTests';

const S = (t: string, why: string, d: string[], run: string | null, see: string | null, hint: string | null, code: string | null = null): GuideStep =>
  ({ t, why, do: d, run, see, hint, code });
const WIN = (title: string) => S('Open an empty pygame window', 'Before any physics, prove that a window opens and closes.', [
  'Open **src/main.py**.',
  'Copy the **pygame window template** from the Setup page (section "Template: a pygame window") and paste it in.',
  `Change the caption text to **${title}**.`,
  'Save the file.'], 'python -m src.main', 'A dark window opens with a green dot and the words **It works!**. Closing it ends the program with no red text.', 'If nothing happens, check that your terminal line starts with **(.venv)**.');

/* ================================================================== s5p4 Moto-Taxi Rush */
const MOTO: LegacyProject = {
  id: 's5p4', title: 'Moto-Taxi Rush: AI Riders That Learn to Weave Through Traffic', stage: 5, domain: 'AI for Science', difficulty: 'Advanced', time: '3–4 weeks',
  prereqs: ['s1p4', 's3p1'],
  concepts: {
    math: ['A neural network as a function: weights, sums and tanh', 'Evolution as optimisation: selection, mutation, elitism', 'Noisy fitness, and why a champion must be checked on new cases'],
    physics: ['Vehicle motion: the kinematic bicycle model', 'Tyre friction limits how tight you can turn: v²/r ≤ μg', 'Traffic flow: the Intelligent Driver Model and phantom jams'],
    programming: ['Simulating 60 agents at once with numpy arrays', 'Ray casting on a raster road map', 'Training, validation and testing for an AI that acts'],
  },
  context: 'Self-driving research and traffic engineering both start from the same two models you build here: a vehicle that obeys friction, and traffic that obeys a car-following law. Machine learning is the tool that finds a driving policy nobody wrote by hand. You also meet the most important honesty rule in AI: an agent is judged on roads and traffic it never trained on.',
  explain: '🏍️ You run a moto-taxi company with sixty riders, and none of them knows how to ride. Each rider has a tiny brain, a neural network that turns what it sees into steering and throttle. It sees with seven sensor rays, like whiskers. At first they all crash. You keep the best riders, copy them with small random changes, and try again. After a few dozen generations they weave through traffic and pick up passengers. The traffic is real science too: the cars follow the Intelligent Driver Model, and they make traffic jams on their own with no accident at all, just like in a famous experiment on a Japanese test track.',
  firstWin: 'Early win: twenty-two cars on a circle jam up with no accident at all, the real Sugiyama experiment, reproduced by your own traffic model.',
  problem: 'Build a bike with the kinematic bicycle model and a tyre friction limit, and traffic that follows the Intelligent Driver Model (IDM). Validate the bike against exact circles and the friction limit. Validate the traffic against the Sugiyama et al. (2008) experiment: 22 cars on a 230 m circle form a stop-and-go jam with no accident, while 14 cars flow smoothly. Put both on a closed three-lane road with a raster road map. Give each rider seven sensor rays, its speed, its angle to the road and the closing speed of whatever is ahead, feeding a 10 → 8 → 2 neural network. Train 60 riders by neuroevolution (elitism plus Gaussian mutation) on fitness = metres gained + 25 per passenger − a crash penalty, three traffic patterns per generation. Choose the champion on held-out traffic, then test it on a road shape and a traffic density it never saw. Finally, measure how the crash penalty changes the riders’ risk-taking.',
  deliverableType: 'Live pygame evolution viewer + tested Python modules',
  deliverableWhy: 'Watching a population learn is the whole point of the visual, but the claims (it learned, it generalises) rest on the exam table: crash rate and distance on roads and traffic it never trained on.',
  dataSource: 'Self-generated: your own bike and traffic simulation. The traffic model is checked against a published experiment (Sugiyama et al. 2008, New Journal of Physics: 22 cars on a 230 m circle).',
  milestones: [
    'Bike: kinematic bicycle model that drives exact circles at low speed and is limited by tyre friction at high speed.',
    'Traffic: the Intelligent Driver Model on a ring road, reproducing a phantom jam with 22 cars on 230 m and smooth flow with 14.',
    'A three-lane closed road with a raster road map, traffic in every lane, and seven sensor rays per rider.',
    'A neural network brain and an evolution loop: keep the best, mutate copies, repeat.',
    'Train 60 riders for 40 generations, choose the champion on held-out traffic, and watch the population learn live.',
    'Exam: crash rate and distance on a new road shape and denser traffic, plus how the crash penalty changes risk-taking.',
  ],
  validation: [
    'The bike drives a full circle of radius L / tan δ at low speed and returns to its start, and at high speed turns no faster than μg / v.',
    'The traffic model forms a phantom jam (a car stops) with 22 cars on a 230 m circle and flows smoothly (speed spread under 0.05 m/s) with 14 cars.',
    'The champion is chosen on traffic it never trained on, and its crash rate and distance are reported on a road and a traffic density it never saw.',
  ],
  tools: ['pygame', 'Python 3', 'NumPy', 'SciPy'],
  extensions: [
    'Give the cars a simple reaction to the riders, so a rider that cuts in makes the car brake, and see whether the riders become more polite.',
    'Replace evolution with a policy-gradient method (REINFORCE) and compare how many races each needs.',
    'Train on both road shapes and test on a third.',
  ],
};

const MOTO_GUIDE: Guide = {
  slug: 'moto-taxi-rush', pip: ['pygame', 'numpy', 'scipy'],
  files: [['src/__init__.py', 'empty file; lets Python import from src'], ['src/bike.py', 'the bike: bicycle model and tyre grip'], ['src/traffic.py', 'the cars: Intelligent Driver Model'], ['src/world.py', 'the road, its lanes and the road map'], ['src/sensors.py', 'the seven sensor rays'], ['src/brain.py', 'the neural network and evolution'], ['src/race.py', 'one race: every rider, same traffic'], ['src/train.py', 'evolve the riders and save the champion'], ['src/exam.py', 'test the champion on new roads'], ['src/main.py', 'pygame: watch evolution happen'], ['tests/test_moto.py', 'checks'], ['data/', 'the champion is saved here']],
  words: [['Agent', 'something that sees, decides and acts, here one rider'], ['Neural network', 'a function made of weighted sums and squashing steps; its weights are its "brain"'], ['Weights', 'the numbers inside a network; changing them changes the behaviour'], ['Fitness', 'the score that decides who gets to have children'], ['Mutation', 'a small random change to a copy of the weights'], ['Elitism', 'the best few pass to the next generation unchanged'], ['Generation', 'one round: everyone races, the best breed'], ['Ray casting', 'stepping along a line until it hits something'], ['Phantom jam', 'a traffic jam that starts with no accident, from small speed changes that grow'], ['Overfitting', 'learning the training cases so well that new cases fail']],
  steps: [
    S('Write the checks for the bike', 'A rider is only as good as the physics it learns in. If the bike can turn on the spot at full speed, the AI will learn a trick that real bikes cannot do.', [
      'Open **tests/test_moto.py**. Write the code below. Run it. It fails.',
      'The model: a bike is a point with a direction θ and a speed v. The front wheel turns by an angle δ. The wheelbase L is the distance between the wheels.',
      'Two facts the checks test. Slowly, a bike with a fixed handlebar angle drives a circle of radius **L / tan δ**. Fast, the tyres can only push sideways up to **μg** (μ = 0.7 on dry tar), so the tightest circle is **v² / (μg)**.'],
      'python -m pytest -q tests/test_moto.py', 'A red **ImportError**.', 'At 12 m/s (43 km/h) the tightest turn the tyres allow is 12² / 6.87 ≈ **21 m** of radius, whatever the handlebar says.', MOTO_T1),
    S('Build the bike', 'One function moves sixty bikes at once. Arrays, not loops.', [
      'Open **src/bike.py**. Set {{L = 1.3}}, {{MU_G = 0.7 * 9.81}} and {{V_MAX = 14.0}} (about 50 km/h).',
      'Write {{step_bikes(x, y, th, v, steer, accel, dt)}}. Every argument is a numpy array with one number per bike.',
      'First the speed: {{v = np.clip(v + accel * dt, 0.0, V_MAX)}}.',
      'The curvature the rider asks for is {{k = np.tan(steer) / L}} (one over the radius). The tyres allow {{k_max = MU_G / np.maximum(v, 0.1) ** 2}}. Set {{skid = np.abs(k) > k_max}}, then {{k = np.clip(k, -k_max, k_max)}}.',
      'Move: {{x + v·cos(th)·dt}}, {{y + v·sin(th)·dt}}, then turn: {{th + v·k·dt}}. Return {{x, y, th, v, skid}}.'],
      'python -m pytest -q tests/test_moto.py', '**4 passed**.', 'If the circle test fails by a little, check that you move with the OLD heading and turn after.'),
    S('Build the traffic, and catch a phantom jam', 'Real traffic jams often start with no accident. Your car model must be able to do that, or the riders train in a fake world.', [
      'Open **src/traffic.py**. Set {{CAR = 4.5}} (car length, metres).',
      'Write {{idm_accel(v, gap, dv, v0=10.0, T=1.0, a=1.0, b=1.5, s0=2.0)}}: the Intelligent Driver Model. The wanted gap is {{s_star = s0 + max(0, v·T + v·dv / (2·sqrt(a·b)))}}. The acceleration is {{a·(1 − (v/v0)⁴ − (s_star/gap)²)}}. Use {{np.maximum(gap, 0.1)}} so you never divide by zero.',
      'In words: speed up towards v0 on an empty road; brake when the gap is smaller than the safe gap, harder if you are closing in fast ({{dv}} = your speed minus the leader’s).',
      'Write {{ring_step(s, v, length, dt, **p)}}: cars on a circle, sorted by position {{s}}. Each car follows the next one ({{np.roll(s, -1)}}), gap = {{(lead_s − s) % length − CAR}}. Update {{v}} (never below 0), then {{s}} (wrap with {{% length}}).',
      'Write {{equilibrium_gap(v, v0=10.0, T=1.0, s0=2.0)}} = {{(s0 + v·T) / sqrt(1 − (v/v0)⁴)}}: the gap at which a car at speed v neither speeds up nor slows down.',
      'Add the checks below. The last two copy a real experiment: in 2008 Sugiyama and colleagues drove 22 cars round a 230 m circle and asked the drivers to keep a steady speed. A jam formed anyway.'],
      'python -m pytest -q tests/test_moto.py', '**8 passed**. With 22 cars a car comes to a stop and the speed spread grows past 2 m/s. With 14 cars the spread stays below 0.05 m/s.', 'The jam needs the half-metre nudge. A perfectly even start stays even forever, which is exactly why real jams look like they come from nowhere.', MOTO_T2),
    WIN('Moto-Taxi Rush'),
    S('Watch the phantom jam', 'Seeing the jam travel backwards is the moment the model becomes real.', [
      'In **src/main.py** (keep the window template) make 22 cars on a 230 m circle, started like your check: equilibrium speed, one car half a metre out of place.',
      'Every frame call {{ring_step}} 4 times with {{dt = 0.1}}.',
      'Draw the circle and each car as a dot at angle {{2π·s / length}}. Colour by speed: red when stopped, green when fast.',
      'Keys: **UP** and **DOWN** add or remove a car and restart.'],
      'python -m src.main', 'After about a minute of simulated time, a red knot appears and drifts **backwards** around the circle while every car keeps moving forward. With 14 cars it never appears.', 'This viewer is replaced by the evolution viewer later. Save a copy as **src/jam.py** first if you want to keep it.'),
    S('Build the road', 'A closed road with three lanes and a map the sensors can read quickly.', [
      'Open **src/world.py**. Set {{LANE = 3.5}}, {{LANES = 3}}, {{HALF = LANE * LANES / 2}}.',
      'Write {{make_track(shape="A", n=2000)}}: a closed loop in polar form. For "A": {{r = 110·(1 + 0.15·sin 3φ + 0.05·cos 5φ)}}. For "B": {{r = 100·(1 + 0.16·sin(4φ + 1))}}. Return the points, the angle of each little segment, the distance along the road {{s}} at each point, and the total length.',
      'Write a class {{World(shape="A", cars_per_lane=12, seed=0, v0=10.0)}}. Keep the points and a {{scipy.spatial.cKDTree}} of them.',
      'Make the **road map**: a grid of 0.5 m squares covering the track plus 50 m. For every square, ask the tree for the distance to the centre line; on the road means distance ≤ {{HALF}}. This runs once and makes every later check a lookup.',
      'Write {{on_road(x, y)}}: turn x and y into grid indices and look them up (off the map counts as off the road).',
      'Traffic: for each lane put {{cars_per_lane}} cars evenly spaced with a little random jitter, at random speeds between 5 and 9 m/s. The lanes have different wanted speeds: {{v0·[0.8, 1.0, 1.2]}}, so overtaking pays.',
      'Write {{lane_offset(lane)}}, {{to_xy(s, offset)}} (a point along the road, shifted sideways), {{step(dt)}} (sort each lane and call {{ring_step}}), {{car_xy()}} and {{locate(x, y)}} (distance to the centre line and nearest index, from the tree).'],
      'python -m pytest -q tests/test_moto.py', '**9 passed**. Track A is about **735 m** long; its tightest bend has a radius of about **41 m**.', 'If the lanes are not 3.5 m apart, the sideways direction must be at right angles to the road: {{(−sin a, cos a)}}.', MOTO_T3),
    S('Give the riders eyes', 'Seven rays, like whiskers. They are all the AI knows about the world.', [
      'Open **src/sensors.py**. Set {{RAY_ANGLES = np.radians([-90, -45, -20, 0, 20, 45, 90])}}, {{RAY_MAX = 40.0}}, {{CAR_R = 2.0}} (a car counts as a circle of this radius).',
      'Write {{cast_rays(world, x, y, th, cars, step=1.0)}}: for every bike and every ray, walk out 1 m at a time. A ray stops when the point is off the road ({{world.on_road}}) or within {{CAR_R}} of a car. Return the distances, shape (bikes, 7). Rays that hit nothing return {{RAY_MAX}}.',
      'Do all bikes and all rays together with arrays: one loop over the distance only.'],
      'python -m pytest -q tests/test_moto.py', '**10 passed**. From the middle of the road both side rays read about **5 m**; a car 15 m ahead reads about **13 m**.', 'Stop a ray at its FIRST hit. Keep a mask of rays that are still flying.', MOTO_T4),
    S('Give the riders a brain, and a way to evolve', 'The brain is a function. Evolution changes its numbers.', [
      'Open **src/brain.py**. The network has 10 inputs, 8 hidden neurons and 2 outputs: {{N_IN, N_HID, N_OUT = 10, 8, 2}}. All its weights sit in one flat array of length {{N_W = 10·8 + 8 + 8·2 + 2 = 106}}.',
      'Write {{think(w, inputs)}} for many riders at once: {{w}} has shape (riders, N_W). Unpack each into W1 (10×8), b1 (8), W2 (8×2), b2 (2). Then {{h = tanh(inputs·W1 + b1)}} and {{out = tanh(h·W2 + b2)}}. Use {{np.einsum}}. The outputs are between −1 and 1.',
      'Write {{next_generation(pop, fitness, rng, elite=10, sigma=0.15)}}: sort by fitness, keep the best {{elite}} unchanged, and fill the rest with copies of random elites plus {{rng.normal(0, sigma)}} noise.',
      'Add the checks. The second one evolves numbers towards a target: no physics, just proof that selection plus mutation climbs.'],
      'python -m pytest -q tests/test_moto.py', '**12 passed**.', 'If the champion vanishes between generations, you added noise to the elites too. Only the copies get noise.', MOTO_T5),
    S('Hold a race', 'Sixty riders, one traffic pattern, no collisions between riders. That makes the race fair.', [
      'Open **src/race.py**. Write a class {{Race(pop, shape="A", seed=0, cars=12, dt=0.1, speed_cap=1.0, crash_cost=300)}}.',
      'Start every rider in the middle lane, halfway between two cars, at 5 m/s, facing along the road. Put a passenger every 120 m ahead, in a random lane.',
      'Write {{step()}}. Cast the rays. The brain’s 10 inputs are: the 7 rays divided by 40, speed divided by 14, the sine of the angle between the rider and the road, and the **closing speed** of the front ray (how fast the gap ahead shrinks, divided by 14, clipped to ±1).',
      'Outputs: steer = {{0.35 × out[0]}} radians, and the speed the rider wants, {{target = 14 × (out[1] + 1) / 2}}. Reach for it like a real rider: {{accel = clip(2 × (target − v), −6, 3)}} (brakes are stronger than the engine). Move with {{step_bikes}}.',
      'Progress: how far along the road the rider moved since last step (from the nearest centre-line point). A rider crashes when it leaves the road or comes within 2 m of a car. Crashed riders stop. A passenger counts when a rider passes within 3 m of it.',
      'Write {{fitness()}} = metres gained + 25 × passengers − {{crash_cost}} × crashed, and a function {{race(pop, …, seconds=45)}} that runs a whole race and returns fitness, crashed, metres and passengers.'],
      'python -m pytest -q tests/test_moto.py', '**13 passed**. The same brains on the same traffic always give the same result, to the last digit.', 'If two identical brains score differently, something random is happening inside the race. Every random number must come from the seed.', MOTO_T6),
    S('Train the riders', 'Forty generations. Watch the numbers before you watch the pictures.', [
      'Open **src/train.py**. Write {{train(gens=40, size=60, seeds_per_gen=3, crash_cost=300, seed=0)}}.',
      'Start with 60 random brains ({{rng.normal(0, 0.5)}}). Each generation, race them on 3 traffic patterns (seeds {{10·g}}, {{10·g + 1}}, {{10·g + 2}}) and average the fitness. Print the best, the median and the share that crashed. Then call {{next_generation}}.',
      'At the end, pick the champion honestly: the 10 elites race 5 traffic patterns nobody trained on (seeds 9000 to 9004), and the best average wins. Save it to **data/champion.npy**.'],
      'python -m src.train', 'Our run (seed 0, 40 generations, about **5 to 15 minutes**): generation 0 best **−155**, everyone crashed. By generation 2 the best rider survives (**571**). The median climbs from **−292** to above 0 around generation 9, and the share that crash falls from **100%** to about **60–70%** (most of each generation are fresh mutants, so many still crash). The best scores settle around **650–710**.', 'Generations can go backwards for a while: every generation sees new traffic, so luck moves the numbers. Look at the trend.'),
    S('Watch evolution happen', 'The payoff.', [
      'In **src/main.py** make 60 random brains and a {{Race}}. Every frame call {{step()}} once (10 times when **F** is held for fast-forward).',
      'When the race ends (45 s, or everyone crashed), compute fitness, call {{next_generation}} and start a new race with the next seed.',
      'Camera: follow the leader (the rider with the most progress still riding). Draw the road, the lane lines, the cars, the passengers and every rider. Grey out crashed riders. Draw the leader’s seven rays: red when they touch something.',
      'Show the generation, how many are still riding, and a small chart of the best fitness per generation.',
      'Key **C**: load **data/champion.npy** and watch it ride new traffic.'],
      'python -m src.main', 'Generation 0 is chaos: riders spin off the road in the first seconds. Within a few generations some ride straight; then they learn to brake behind cars and swing into another lane. The champion (key **C**) overtakes, picks up passengers, and slows for bends.', 'If everyone crashes in the first second, check the start: riders must face along the road.'),
    S('The exam: roads and traffic it never saw', 'An AI that only works on its training road has learned the road, not how to ride.', [
      'Open **src/exam.py**. Write {{exam(champ, shape="A", cars=12, speed_cap=1.0, n=12)}}: race the champion alone on 12 traffic patterns it never saw (seeds 100 to 111). Return the crash rate, the mean metres and the mean passengers.',
      'Print a table for road A and road B, with 12 and 18 cars per lane.',
      'Then the risk question: train a second champion with {{crash_cost=50}} instead of 300 (keep it in **data/risky.npy**) and put both in the table.',
      'In **README.md** write: where your champion fails, and what changing the crash penalty did to its behaviour.'],
      'python -m src.exam', 'Our champion (12 races each). Road A, 12 cars per lane (like training): **17%** crashed, **551 m**, 2.4 passengers. Road B, 12 cars: **25%**, **542 m**. Road A, 18 cars: **58%**, **356 m**. Road B, 18 cars: **83%**, **258 m**. A new road shape hurt a little; denser traffic than it ever saw hurt a lot. The risky champion (crash penalty 50) crashed **42%** of the time on road A and **50%** on road B, and went less far (**489 m** and **401 m**): when crashing is cheap, evolution breeds riders that gamble and lose.', 'Road B has tighter bends than anything in training. If the champion fails there, that is a real result: write it down and say what you would change (for example, train on both roads).'),
  ],
  done: ['{{python -m pytest -q}} prints **13 passed**.', 'Your traffic model makes a phantom jam with 22 cars on 230 m and flows with 14.', 'The training log shows the crash share falling.', 'The live viewer shows the population learning.', 'README.md has the exam table and what the crash penalty changed.', 'Everything is saved with git.'],
  stuck: [['Every rider crashes forever.', 'Check the inputs: rays divided by 40, speed by 14. Big raw numbers saturate tanh, and then every brain gives the same answer.'], ['Training is very slow.', 'Ray casting is the cost. Make sure the road check is a lookup in the road map, not a tree query, and that all bikes are done in one array.'], ['The champion is great in training and bad in the exam.', 'That is overfitting to a few traffic patterns. Use more seeds per generation, or pick the champion on more validation seeds.']],
};

/* ================================================================== s5p5 AI vs the Virus */
const VIRUS: LegacyProject = {
  id: 's5p5', title: 'AI vs the Virus: Training an AI to Run an Epidemic Response', stage: 5, domain: 'AI for Science', difficulty: 'Advanced', time: '3–4 weeks',
  prereqs: ['s4p3', 's5p4'],
  concepts: {
    math: ['Reinforcement learning: states, actions, rewards, Q-learning', 'Discounting future rewards', 'Neuroevolution of a shared policy'],
    physics: ['SEIR epidemics in many towns joined by gravity-model travel', 'Early growth rate of an epidemic from β, σ and γ'],
    programming: ['Building a simulation that an AI can play, one week at a time', 'Comparing agents fairly on held-out scenarios'],
  },
  context: 'During COVID-19, governments and research groups used epidemic models to compare interventions, and several used reinforcement learning to search for lockdown and testing schedules. This project builds that pipeline at a size you can understand: a model you can trust, a score you choose, AIs that learn to play, and an exam on outbreaks they never saw.',
  explain: '🦠 A new virus lands in one town of a country with twelve towns. You are not the doctor; you are the AI that advises the government. Every week, for every town, it can do nothing, test and isolate, lock down, or (once the vaccine arrives in week 10) vaccinate. Lockdowns stop the virus but hurt people’s income, so every choice has a price. Two AIs learn this game: one learns a table of good moves from experience (Q-learning), the other is evolved like your moto-taxi riders. Then they face outbreaks they have never seen.',
  firstWin: 'Early win: your epidemic grows at exactly the rate theory predicts, and a map of twelve towns lights up as the virus travels.',
  problem: 'Build a metapopulation SEIR model: twelve towns, each with S, E, I, R, joined by gravity-model travel (reuse gravity_matrix from the town-epidemic project). Check it: people are conserved, and the early growth rate matches r = (−(σ+γ) + √((σ−γ)² + 4σβ)) / 2. Add four weekly actions per town (nothing, test, lockdown, vaccinate from week 10) with effects on transmission and travel and a cost per person. Score each week as − (% of the country newly infected) − λ × (cost per person). Compare a do-nothing policy, a hand-written rule, a tabular Q-learning agent (72 states, local rewards) and a neural network (5 → 8 → 4) evolved on the national score. Test all of them on new R₀ values, new starting towns and a new country, then show how the AI’s strategy changes with λ. Finally run the trained AI on real towns from GeoNames.',
  deliverableType: 'Live pygame split screen (no AI vs AI) + tested Python modules',
  deliverableWhy: 'The split screen makes the difference visible, but the result is the comparison table on held-out outbreaks, and the honest statement that the AI is only as good as the model it learned in.',
  dataSource: 'A made-up 12-town country for training and checks; real town names, positions and populations from GeoNames (the file you downloaded in the town-network project) for the final run.',
  milestones: [
    'A twelve-town SEIR model with gravity travel that conserves people and grows at the theoretical rate.',
    'Four actions with effects and costs, a vaccine that arrives in week 10, and a weekly score.',
    'Baselines: do nothing, and a hand-written rule.',
    'A Q-learning agent and an evolved neural network, trained on three R₀ values and three starting towns.',
    'A fair comparison on outbreaks none of them trained on, and in a new country.',
    'A study of how the price of lockdown (λ) changes the AI’s strategy, and a split-screen pygame view.',
  ],
  validation: [
    'People are conserved to rounding error and the early growth rate is within 2% of the formula.',
    'Every AI is compared with the hand rule and with doing nothing on R₀ values, starting towns and a country it never trained on.',
    'The report says plainly that the strategies are only as good as the model: real lockdowns, tests and vaccines do not work exactly as assumed here.',
  ],
  tools: ['pygame', 'Python 3', 'NumPy'],
  extensions: [
    'Give the AI a weekly budget it cannot exceed, and see which towns it protects first.',
    'Add delays: the AI sees last week’s numbers, not this week’s. Does its strategy survive?',
    'Train on random countries every generation and test on Kenya and Rwanda.',
  ],
};

const VIRUS_GUIDE: Guide = {
  slug: 'ai-vs-virus', pip: ['pygame', 'numpy', 'requests'],
  files: [['src/__init__.py', 'empty file; lets Python import from src'], ['src/towns.py', 'COPIED from town-network'], ['src/network.py', 'COPIED from town-epidemic'], ['src/outbreak.py', 'SEIR in every town, one week at a time'], ['src/country.py', 'the made-up country and the real one'], ['src/play.py', 'the score, a game, and two simple players'], ['src/qlearn.py', 'Q-learning'], ['src/evolve.py', 'the evolved brain'], ['src/train.py', 'train both AIs'], ['src/compare.py', 'the fair fight'], ['src/main.py', 'pygame: split screen'], ['tests/test_virus.py', 'checks'], ['data/', 'trained AIs and downloads go here']],
  words: [['Reinforcement learning', 'learning what to do from rewards, by trying'], ['State', 'what the AI knows when it decides'], ['Action', 'what it can do: nothing, test, lockdown, vaccinate'], ['Reward', 'the score for one week'], ['Policy', 'the rule from state to action: the AI itself'], ['Q-value', 'how good an action is in a state, counting the future too'], ['Discount', 'how much less a reward next week is worth than one now'], ['Exploration', 'sometimes trying a random action to find out what it does'], ['Held-out', 'cases the AI never trained on, used to judge it honestly']],
  steps: [
    S('Copy the travel model and write the checks', 'The AI will believe everything this model says. So the model is checked first.', [
      'Copy **towns.py** from town-network and **network.py** from town-epidemic. Mac or Linux first commands. Windows second.',
      'Open **tests/test_virus.py**. Write the code below. Run it. It fails.',
      'The third check is real theory. Early in an outbreak, numbers grow like e^(rt). For SEIR, r is the positive root of r² + (σ + γ)r + σ(γ − β) = 0.'],
      'cp ../town-network/src/towns.py src/towns.py\ncp ../town-epidemic/src/network.py src/network.py\n# Windows instead:\nCopy-Item ..\\town-network\\src\\towns.py src\\towns.py\nCopy-Item ..\\town-epidemic\\src\\network.py src\\network.py\npython -m pytest -q tests/test_virus.py',
      'A red **ImportError**.', 'With R₀ = 2.5, an infectious time of 6 days (γ = 1/6) and an incubation of 4 days (σ = 1/4), r ≈ **0.117 per day**: cases double about every 6 days.', VIRUS_T1),
    S('Build the outbreak', 'Twelve towns, each its own SEIR model, joined by people who travel.', [
      'Open **src/outbreak.py**. Write {{growth_rate(beta, sigma, gamma)}} from the formula above.',
      'Write a class {{Outbreak(pops, G, R0=2.5, sigma=1/4, gamma=1/6, seed_town=0, seed_cases=20, travel=0.02, substeps=10, vaccine_week=10)}}. Keep arrays S, E, I, R (one number per town). {{beta = R0 · gamma}}. Put 20 infectious people in the seed town.',
      'Write {{week(actions)}}: 7 days in steps of {{h = 1/substeps}} days. Each step: {{frac = I / N}}; what a resident of town i meets is {{(1 − m)·frac_i + m·(G @ frac)_i}}, with {{m = travel}}. New infections {{β·S·seen·h}}, then E → I at {{σ·E·h}} and I → R at {{γ·I·h}}. Add up the new infections per town and return them (and a cost, next step).',
      'Open **src/country.py**. Write {{demo_country(n=12, seed=3, steep=1.1)}}: populations {{round(2 000 000 / k^steep, −2)}} for k = 1…n, positions uniform in a 400 km square from {{np.random.default_rng(seed)}}, and the gravity matrix. Return pops, xy, G.'],
      'python -m pytest -q tests/test_virus.py', '**3 passed**. Measured r is **0.1162**, the formula gives **0.1171**: 0.7% apart. The small gap is the time step; 10 steps a day is plenty.', 'If people are not conserved, an amount left one box and did not arrive in the next. Every flow must be subtracted once and added once.'),
    S('Give the government four buttons', 'Each action changes the model and costs something. That tension is the whole game.', [
      'In **src/outbreak.py** make a table {{ACTIONS}}: for each action, a multiplier on transmission, a multiplier on travel, a share of S vaccinated per day, and a cost per person per week.',
      'Nothing: 1, 1, 0, 0. Test and isolate: 0.7, 1, 0, 0.2. Lockdown: 0.3, 0.2, 0, 1.0. Vaccinate: 1, 1, 0.005, 0.4.',
      'Use them inside {{week}}: transmission {{β·bmul}}, travel {{m = travel·tmul}}, vaccination moves {{vacc·S·h}} from S to R each step. The cost per town is the action’s cost × the town’s population.',
      'The vaccine arrives in week 10: before that, a vaccinate action counts as nothing. Keep a week counter.',
      'Write {{features()}}: for each town, [share infectious, growth = log((I + 1)/(I last week + 1)), pressure = G @ share infectious, share immune, vaccine available (0 or 1)]. This is all the AI will ever see.'],
      'python -m pytest -q tests/test_virus.py', '**5 passed**.', 'These numbers are made up but sensible. Write them in README.md: the AI’s strategy depends on them, so anyone reading your results must know them.', VIRUS_T2),
    S('Keep score, and meet the first two players', 'The score is the most important decision in reinforcement learning: the AI will chase exactly what you reward.', [
      'Open **src/play.py**. Write {{score(new, cost, pops, lam)}} = − 100 × (new infections) / (total people) − lam × (cost) / (total people).',
      'Write {{play(policy, pops, G, lam=1.0, R0=2.5, seed_town=0, weeks=26, log=False)}}: run 26 weeks; each week call {{policy(features)}} to get one action per town. Return the total score, the % infected and the total cost (and each week’s actions if {{log}}).',
      'Write two players: {{do_nothing}} (always 0), and {{hand_rule}}: lock down where more than 0.5% are infectious, test where more than 0.1%.',
      'Print both on R₀ = 2.5 starting in town 0.'],
      'python -m pytest -q tests/test_virus.py', '**6 passed**. Doing nothing: **89%** of the country infected, score **−89.3**. The hand rule: **11%** infected, cost **10.7**, score **−21.8**.', 'Try "lock down everywhere, always": nobody gets infected, but the cost is 26 and the score −26. Locking everything is not the best answer at this price.', VIRUS_T3),
    WIN('AI vs the Virus'),
    S('Watch the hand rule play', 'Before any AI, see the game.', [
      'In **src/main.py** draw the 12 towns as circles: size by population, colour from dark to red by the share infectious.',
      'Every 0.4 seconds run one week with {{hand_rule}}. Write a letter on each town that acts: **T** blue, **L** red, **V** green.',
      'Show the week, the % infected so far and the score.'],
      'python -m src.main', 'The first town turns red, then its neighbours. The **T** letters appear first, then **L** where things get bad. The outbreak is slowed, not stopped.', null),
    S('The first AI: Q-learning', 'A table of how good each action is in each situation, learned from experience.', [
      'Open **src/qlearn.py**. Write {{bucket(f)}}: cut each town’s features into boxes: share infectious into 4 (edges 0.0001, 0.001, 0.005), growth into 3 (−0.1, 0.1), pressure into 3 (0.0001, 0.001), vaccine 2. That is {{4·3·3·2 = 72}} states.',
      'Write {{q_update(Q, s, a, r, s2, alpha=0.1, gamma=0.9)}}: {{Q[s, a] += alpha·(r + gamma·max Q[s2] − Q[s, a])}}. Use {{np.add.at}} so many towns can update at once.',
      'Write {{train_q(pops, G, episodes=400, lam=1.0, eps=0.2)}}. Each episode picks a random R₀ from 2.0, 2.5, 3.0 and a random start town from 0, 1, 2. Each week every town picks the best action from the table, or a random one with chance {{eps}}. Each town’s reward is its OWN score per person. Update, repeat.',
      'Write {{q_policy(Q)}} that returns a player: the best action in the table for each town.',
      'Add the checks. The first teaches Q-learning on a tiny game with a known answer.'],
      'python -m pytest -q tests/test_virus.py', '**8 passed**. Training takes about **10 seconds**. On R₀ = 2.5 from town 0 Q-learning scores about **−17**, better than the hand rule’s −21.8.', 'Q-learning here is selfish: each town is rewarded only for itself. Keep that in mind for the next step.', VIRUS_T4),
    S('The second AI: an evolved brain', 'The same trick as your moto-taxi riders, now scored on the whole country.', [
      'Open **src/evolve.py**. The brain is a small network, 5 → 8 → 4, shared by every town: each town feeds in its own 5 features and gets 4 numbers; the biggest wins.',
      'Scale the inputs first: share infectious × 100, pressure × 100, the rest as they are.',
      'Write {{net_policy(w)}} and {{next_generation}} (copy it from your moto-taxi project: keep the best 8, mutate the rest with sigma 0.2).',
      'Write {{train_evo(pops, G, gens=20, size=30, lam=1.0)}}: fitness = the mean score over 9 outbreaks (R₀ 2.0, 2.5, 3.0 × start towns 0, 1, 2), scored on the WHOLE country.',
      'Open **src/train.py**: train both AIs and save them to **data/qtable.npy** and **data/brain.npy**.'],
      'python -m pytest -q tests/test_virus.py\npython -m src.train', '**9 passed**. Then the training log: the best brain climbs from about **−18.6** to about **−12.3** over 20 generations (2 to 4 minutes).', 'If every brain picks the same action everywhere, the inputs are not scaled: a share infectious of 0.001 is invisible to tanh until you multiply it by 100.', VIRUS_T5),
    S('The fair fight', 'Every player on outbreaks none of them trained on.', [
      'Open **src/compare.py**. Load both AIs. Make a table of scores for: R₀ 1.8 from town 5, 2.5 from 8, 3.5 from 3, 3.5 from 0, 2.2 from 11. Columns: nothing, hand rule, Q-learning, evolved. Add the mean.',
      'Then a country they have never seen: {{demo_country(n=20, seed=7, steep=0.6)}} (more towns, more even sizes), with three outbreaks.'],
      'python -m src.compare', 'Our means on the new outbreaks: nothing **−81.8**, hand rule **−23.2**, Q-learning **−17.9**, evolved **−15.0**. In the new country: **−80.9**, **−18.4**, **−14.4**, **−10.7**. The order holds everywhere: evolved, then Q-learning, then the rule.', 'Your numbers will differ a little if your random seeds differ. The order is the result; check yours.'),
    S('What did it learn, and what does it cost?', 'An AI’s strategy is a scientific result. Describe it, then test it.', [
      'Run the evolved brain on R₀ = 2.5 from town 0 with {{log=True}} and print one line per week: one letter per town (. T L V).',
      'Describe the strategy in **README.md**. Ours tests almost everywhere, and switches lockdowns on and off in the worst towns from week to week. It never vaccinates. Is that a discovery or a flaw? (Hint: compare the price and the effect of vaccinating with testing.)',
      'Now change the price of lockdown: train a brain with {{lam=0.5}} and one with {{lam=2.0}}. For each, count the town-weeks of lockdown and the % infected.'],
      null, 'Ours, on R₀ = 2.5 from town 0: at **λ = 1** the brain locked down **82** town-weeks and **0.8%** were infected. At **λ = 2** (lockdown twice as costly) it locked down only **59** town-weeks, tested more, and **2.5%** were infected. At **λ = 0.5** it locked down **78** town-weeks with **0.7%** infected: almost the same as λ = 1, because evolution is noisy and the extra lockdowns gained little. None of the three ever vaccinated.', 'This is the honest lesson of the project: the AI optimises the score you wrote down, with the effects you assumed. Change the assumptions and the "best" strategy changes.'),
    S('Run it on a real country', 'Real towns, real distances, real populations.', [
      'In **src/country.py** write {{real_country(towns)}}: from {{get_towns}} rows (name, lat, lon, population) make km coordinates ({{x = (lon − mean)·111.32·cos(mean lat)}}, {{y = (lat − mean)·110.57}}) and the gravity matrix.',
      'Load {{get_towns("KE", 20)}} (or your own country) and run nothing, the hand rule and both AIs, starting in the biggest town, with R₀ = 2.5.',
      'The AIs never saw this country. Write their scores in **README.md**, and say whether the order from the fair fight still holds.'],
      'python -c "from src.towns import get_towns; from src.country import real_country; n, p, xy, G = real_country(get_towns(\'KE\', 20)); print(n[:3], p.sum())"',
      'Three town names starting with **Nairobi** and the total population of the 20 towns. Your scores depend on the country; we could not download GeoNames from our test machine, so there is no reference number here.', 'Real countries are much less even than the made-up one. If the AI does strange things in one huge city, that city may be bigger than anything it trained on.'),
    S('The split screen', 'The visual that makes the result obvious.', [
      'Make **src/main.py** show two maps side by side, the same outbreak in both: left, nobody in charge; right, an AI.',
      'Keys: **1** hand rule, **2** Q-learning, **3** evolved brain on the right. **UP** and **DOWN** change R₀. **SPACE** pauses, **R** restarts.',
      'Under each map: the week, the % infected and the score.'],
      'python -m src.main', 'On the left the country turns red within a few months. On the right a few towns flicker red and calm down, with **T** and **L** letters switching week by week. The scores at the bottom say the same thing as your table.', null),
  ],
  done: ['{{python -m pytest -q}} prints **9 passed**.', 'Your model grows at the theoretical rate and conserves people.', 'The comparison table on held-out outbreaks and a new country is in README.md.', 'README.md describes the evolved strategy and how it changes with the price of lockdown.', 'The split screen runs.', 'Everything is saved with git.'],
  stuck: [['The AI locks down everything all the time.', 'Then lockdown is too cheap at your λ, or the cost is not reaching the score. Print the cost each week.'], ['Q-learning never improves.', 'Check the state boxes: if nearly every town lands in the same box, the table cannot tell situations apart. Print {{np.bincount(bucket(f))}}.'], ['Training takes forever.', 'Run fewer substeps while training (5), but always report scores with 10.']],
};

/* ================================================================== visuals */
const V = (widget: string, caption: string, preset?: Record<string, number>): Visual => (preset ? { widget, caption, preset } : { widget, caption });
export const REDESIGNED_STEP_VISUALS: Record<string, Record<number, Visual>> = {
  s5p4: {
    0: V('bikegrip', 'What the checks test: slowly, the bike drives the circle the handlebars ask for. Fast, the tyres decide.', { v: 12, steer: 0.2 }),
    1: V('bikegrip', 'Slide the speed up with the same handlebar angle: the real circle (solid) grows past the asked one (dashed).'),
    2: V('ringjam', 'Sugiyama’s circle: 22 cars, all at the same steady speed, one nudged half a metre. Watch a jam form with no accident.'),
    3: V('win2d', 'The empty window for your traffic and riders.'),
    4: V('ringjam', 'Change the number of cars: 14 flow forever, 22 jam. The jam drifts backwards while every car drives forwards.'),
    5: V('motoevo', 'Three lanes with different speeds, so overtaking pays. Here the road is straight; yours is a closed loop with bends.'),
    6: V('motoevo', 'The leader’s seven rays: cyan when clear, red when they touch a car or the road edge.'),
    7: V('motoevo', 'Evolution in your browser: every generation the best 6 of 30 survive and the rest are mutated copies.'),
    8: V('motoevo', 'One race: every rider on the same traffic, so the comparison is fair.'),
    9: V('motoevo', 'Turn up the sim speed and watch the best fitness per generation climb, with setbacks when the traffic is unlucky.', { speed: 8 }),
    10: V('motoevo', 'What your live viewer shows: the leader’s rays, crashed riders in grey, the fitness chart in the corner.'),
    11: V('bikegrip', 'Why a new road is hard: a tighter bend needs a lower speed, and the champion never practised it.', { v: 13, steer: 0.06 }),
  },
  s5p5: {
    0: V('outbreakmap', 'The country your checks use: twelve towns. Set “who decides” to do nothing and watch the virus travel.', { policy: 0 }),
    1: V('outbreakmap', 'SEIR in every town, joined by travel. Start the outbreak in a small town and see how long it takes to reach the capital.', { policy: 0, town: 9 }),
    2: V('outbreakmap', 'The four buttons in action: T test, L lockdown, V vaccinate (from week 10).', { policy: 1 }),
    3: V('outbreakmap', 'The hand rule: lockdown above 0.5% infectious, testing above 0.1%. Compare its score with doing nothing.', { policy: 1 }),
    4: V('win2d', 'The empty window for your map.'),
    5: V('outbreakmap', 'What your window will show: towns glowing as the virus spreads, letters where the government acts.', { policy: 1 }),
    6: V('outbreakmap', 'Q-learning learns a table of moves. Here is the rule it has to beat.', { policy: 1, R0: 3 }),
    7: V('outbreakmap', 'The evolved brain from our reference run, playing live. Its weights are the ones in the guide’s numbers.', { policy: 2 }),
    8: V('outbreakmap', 'Held-out cases: try R₀ = 3.5, or a start town the AIs never trained on (3 to 11).', { policy: 2, R0: 3.5, town: 3 }),
    9: V('outbreakmap', 'Watch the strategy: testing almost everywhere, lockdowns that switch on and off week by week, no vaccine.', { policy: 2 }),
    10: V('outbreakmap', 'The made-up country; yours will be real towns. The method is the same.', { policy: 2, town: 1 }),
    11: V('outbreakmap', 'Flip “who decides” between do nothing and the evolved AI: that is your split screen.', { policy: 2 }),
  },
};

export const REDESIGNED_HERO: Record<string, [string, string]> = {
  s5p4: ['motoevo', 'Play with the idea first: thirty riders with tiny neural-network brains, evolving in your browser. Generation 0 crashes; watch what happens next.'],
  s5p5: ['outbreakmap', 'Play with the idea first: twelve towns, one virus, and an AI that has to choose lockdowns, testing and vaccines every week. Switch between nobody in charge, a simple rule and the evolved AI.'],
};

export const REDESIGNED_PROJECTS: Record<string, LegacyProject> = { s5p4: MOTO, s5p5: VIRUS };
export const REDESIGNED_GUIDES: Record<string, Guide> = { s5p4: MOTO_GUIDE, s5p5: VIRUS_GUIDE };
