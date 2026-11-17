// Animated episodes (Nova). "start" episodes are watched before Step 0;
// mid-project episodes name the step key they belong to.
export interface Episode {
  id: string; project: string; at: 'start' | { step: number };
  title: string; length: string; summary: string; file: string; poster: string;
}
export const EPISODES: Episode[] = [
  { id: 's0p1-start', project: 's0p1', at: 'start', title: 'The Uncertainty Sandbox', length: '2:39',
    summary: 'Fuzzy numbers, changing units (and the temperature trap), and why random errors combine like a triangle.',
    file: 'episodes/s0p1-start.mp4', poster: 'episodes/s0p1-start.jpg' },
];
export const startEpisode = (pid: string) => EPISODES.find(e => e.project === pid && e.at === 'start');
export const stepEpisode = (pid: string, step: number) => EPISODES.find(e => e.project === pid && typeof e.at === 'object' && e.at.step === step);
