# Future AI projects

Ideas kept for later (Nov 2026). Each is an AI working inside a real scientific model, with a big live visual, aimed at real problems in Africa. None has a build guide yet; when one is picked it gets the same treatment as s5p4 and s5p5 (science checked first, reference solution, tests, a visual on every step). The app shows this list under **More → Future AI projects** (`src/content/ideas.ts`).

## Health

Illness and care, built on models you meet in Stages 3–5.

- **Cholera and the Water Network**: Contamination spreading through a town’s wells and pipes; an AI picks where to test and chlorinate first. *Science:* The SIWR cholera model (bacteria in the water, not just sick people) and flow through a pipe network. *AI:* Reinforcement learning.
- **Medical Drone Delivery**: Drones carrying blood and vaccines to rural clinics over hills, against the wind, on a limited battery (as Zipline does in Rwanda and Ghana). *Science:* Flight energy: battery, drag and wind. *AI:* Evolution for route and dispatch planning.
- **TB Hotspot Hunter**: Tuberculosis spreading quietly through a city; an AI sends mobile X-ray vans to screen people. *Science:* A TB model with a hidden latent stage. *AI:* Reinforcement learning.
- **Where to Build the Clinic**: A heat map of walking time to care, with red zones shrinking as clinics are placed. *Science:* Shortest paths over real elevation, with walking speed that slows on slopes (Tobler’s hiking function). *AI:* Evolution, compared with a classic optimisation method.
- **Beat the Superbug**: Bacteria colonies evolving drug resistance; an AI schedules which drug to give and when. *Science:* Population genetics: mutation and selection. *AI:* Reinforcement learning.
- **Malaria Defence**: A mosquito swarm around a village; an AI places bed nets and spraying on a budget. *Science:* Mosquito agents and the Ross–Macdonald malaria model. *AI:* Reinforcement learning.
- **Ambulance Placement**: Emergencies popping up across a city; ambulances repositioning so help arrives fastest. *Science:* Random arrivals and queueing theory. *AI:* Evolution and Q-learning compared.

## Agriculture and food

Farming, water and land.

- **Cassava Doctor**: A neural network that spots cassava diseases in leaf photos, and shows where on the leaf it looks. *Science:* Image recognition, and checking the network looks at the disease, not the background. *AI:* A convolutional network trained on the public cassava leaf photos collected in Uganda (Makerere University).
- **Fall Armyworm Invasion**: A pest moving through maize fields on the wind; an AI decides where to scout and spray. *Science:* Insect spread by wind and by crawling between fields. *AI:* Reinforcement learning on a limited budget.
- **Smart Irrigation**: A slice of soil soaking up real NASA rainfall while the crop above grows or wilts. *Science:* How water moves through soil and how plants take it up. *AI:* Reinforcement learning compared with a fixed watering schedule.
- **Drought Early Warning from Space**: A map of East Africa browning and greening month by month, with forecasts months ahead. *Science:* Rainfall and satellite greenness (NDVI) time series. *AI:* A forecasting network tested only on years it never saw.
- **Herds and Grassland**: Cattle moving over grass that regrows with the rain; routes that feed the herd without destroying the pasture. *Science:* Rain-driven grass growth and overgrazing. *AI:* Evolution for many herders sharing one land.
- **Locust Swarm Forecaster**: A desert locust swarm drifting over East Africa; a network predicts where it lands next. *Science:* Transport by wind plus flocking rules. *AI:* A neural network that forecasts the swarm’s path.
- **Lake Fishing Quotas**: Fish schools rising and falling; an AI sets yearly limits that feed people without a collapse. *Science:* Predator–prey (Lotka–Volterra) dynamics. *AI:* Reinforcement learning with a long-term goal.
- **Village Microgrid**: A day of real NASA sunlight powering houses and a battery; the lights stay on at night. *Science:* Solar energy and battery physics. *AI:* Reinforcement learning for when to store and when to use power.

## Safety, cities and disasters

Big visual simulations with a real job to do.

- **Wildfire Commander**: Fire racing across terrain with the wind; an AI cuts firebreaks and drops water. *Science:* Fire spread as a cellular automaton with wind and slope. *AI:* Reinforcement learning.
- **Flood Rescue Drones**: Drones searching your Stage 5 flood for stranded people as the water rises. *Science:* Shallow-water flooding and search theory. *AI:* Neuroevolution of a drone team.
- **Smart Traffic Lights**: A city grid of cars that flows or jams; AI lights learning to beat fixed timers. *Science:* The Intelligent Driver Model at intersections. *AI:* Q-learning per light, learning to cooperate.
- **Stadium Evacuation**: Thousands of people leaving a stadium; barriers and signs placed so everyone gets out faster. *Science:* The Social Force Model used in real crowd-safety studies. *AI:* Evolution of the layout.
- **Earthquake Early Warning**: Seismic waves rippling over a map, stations lighting up; the quake located in seconds. *Science:* Your Stage 4 wave solver. *AI:* A network trained on thousands of simulated quakes.
