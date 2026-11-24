/** Future AI + computational-science projects the learner chose to keep (Nov 2026). No guides yet:
 *  each one gets a checked design, reference solution and guide when it is picked to be built. */
export interface Idea { title: string; watch: string; science: string; ai: string }
export interface IdeaGroup { name: string; blurb: string; ideas: Idea[] }

export const IDEA_GROUPS: IdeaGroup[] = [
  { name: 'Health', blurb: 'Illness and care, built on models you meet in Stages 3–5.', ideas: [
    { title: 'Cholera and the Water Network', watch: 'Contamination spreading through a town’s wells and pipes; an AI picks where to test and chlorinate first.', science: 'The SIWR cholera model (bacteria in the water, not just sick people) and flow through a pipe network.', ai: 'Reinforcement learning.' },
    { title: 'Medical Drone Delivery', watch: 'Drones carrying blood and vaccines to rural clinics over hills, against the wind, on a limited battery (as Zipline does in Rwanda and Ghana).', science: 'Flight energy: battery, drag and wind.', ai: 'Evolution for route and dispatch planning.' },
    { title: 'TB Hotspot Hunter', watch: 'Tuberculosis spreading quietly through a city; an AI sends mobile X-ray vans to screen people.', science: 'A TB model with a hidden latent stage.', ai: 'Reinforcement learning.' },
    { title: 'Where to Build the Clinic', watch: 'A heat map of walking time to care, with red zones shrinking as clinics are placed.', science: 'Shortest paths over real elevation, with walking speed that slows on slopes (Tobler’s hiking function).', ai: 'Evolution, compared with a classic optimisation method.' },
    { title: 'Beat the Superbug', watch: 'Bacteria colonies evolving drug resistance; an AI schedules which drug to give and when.', science: 'Population genetics: mutation and selection.', ai: 'Reinforcement learning.' },
    { title: 'Malaria Defence', watch: 'A mosquito swarm around a village; an AI places bed nets and spraying on a budget.', science: 'Mosquito agents and the Ross–Macdonald malaria model.', ai: 'Reinforcement learning.' },
    { title: 'Ambulance Placement', watch: 'Emergencies popping up across a city; ambulances repositioning so help arrives fastest.', science: 'Random arrivals and queueing theory.', ai: 'Evolution and Q-learning compared.' },
  ] },
  { name: 'Agriculture and food', blurb: 'Farming, water and land.', ideas: [
    { title: 'Cassava Doctor', watch: 'A neural network that spots cassava diseases in leaf photos, and shows where on the leaf it looks.', science: 'Image recognition, and checking the network looks at the disease, not the background.', ai: 'A convolutional network trained on the public cassava leaf photos collected in Uganda (Makerere University).' },
    { title: 'Fall Armyworm Invasion', watch: 'A pest moving through maize fields on the wind; an AI decides where to scout and spray.', science: 'Insect spread by wind and by crawling between fields.', ai: 'Reinforcement learning on a limited budget.' },
    { title: 'Smart Irrigation', watch: 'A slice of soil soaking up real NASA rainfall while the crop above grows or wilts.', science: 'How water moves through soil and how plants take it up.', ai: 'Reinforcement learning compared with a fixed watering schedule.' },
    { title: 'Drought Early Warning from Space', watch: 'A map of East Africa browning and greening month by month, with forecasts months ahead.', science: 'Rainfall and satellite greenness (NDVI) time series.', ai: 'A forecasting network tested only on years it never saw.' },
    { title: 'Herds and Grassland', watch: 'Cattle moving over grass that regrows with the rain; routes that feed the herd without destroying the pasture.', science: 'Rain-driven grass growth and overgrazing.', ai: 'Evolution for many herders sharing one land.' },
    { title: 'Locust Swarm Forecaster', watch: 'A desert locust swarm drifting over East Africa; a network predicts where it lands next.', science: 'Transport by wind plus flocking rules.', ai: 'A neural network that forecasts the swarm’s path.' },
    { title: 'Lake Fishing Quotas', watch: 'Fish schools rising and falling; an AI sets yearly limits that feed people without a collapse.', science: 'Predator–prey (Lotka–Volterra) dynamics.', ai: 'Reinforcement learning with a long-term goal.' },
    { title: 'Village Microgrid', watch: 'A day of real NASA sunlight powering houses and a battery; the lights stay on at night.', science: 'Solar energy and battery physics.', ai: 'Reinforcement learning for when to store and when to use power.' },
  ] },
  { name: 'Safety, cities and disasters', blurb: 'Big visual simulations with a real job to do.', ideas: [
    { title: 'Wildfire Commander', watch: 'Fire racing across terrain with the wind; an AI cuts firebreaks and drops water.', science: 'Fire spread as a cellular automaton with wind and slope.', ai: 'Reinforcement learning.' },
    { title: 'Flood Rescue Drones', watch: 'Drones searching your Stage 5 flood for stranded people as the water rises.', science: 'Shallow-water flooding and search theory.', ai: 'Neuroevolution of a drone team.' },
    { title: 'Smart Traffic Lights', watch: 'A city grid of cars that flows or jams; AI lights learning to beat fixed timers.', science: 'The Intelligent Driver Model at intersections.', ai: 'Q-learning per light, learning to cooperate.' },
    { title: 'Stadium Evacuation', watch: 'Thousands of people leaving a stadium; barriers and signs placed so everyone gets out faster.', science: 'The Social Force Model used in real crowd-safety studies.', ai: 'Evolution of the layout.' },
    { title: 'Earthquake Early Warning', watch: 'Seismic waves rippling over a map, stations lighting up; the quake located in seconds.', science: 'Your Stage 4 wave solver.', ai: 'A network trained on thousands of simulated quakes.' },
  ] },
];
