export interface Concepts { math: string[]; physics: string[]; programming: string[] }
export interface LegacyProject {
  id: string; title: string; stage: number; domain: string; difficulty: string; time: string;
  prereqs: string[]; concepts: Concepts; context: string; explain: string; firstWin: string; problem: string;
  deliverableType: string; deliverableWhy: string; dataSource: string; milestones: string[]; validation: string[];
  tools: string[]; extensions: string[];
}
export interface LegacyStage { id: number; name: string; tagline: string; summary: string }
export interface GuideStep { t: string; why?: string | null; do: string[]; run: string | null; see: string | null; hint: string | null; code: string | null; top?: string; tree?: string }
export interface Guide { slug: string; pip: string[]; files: [string, string][]; words?: [string, string][]; steps: GuideStep[]; done?: string[]; stuck?: [string, string][] }
export interface Capstone {
  primary: { title: string; domain: string; integrates: string[]; description: string; dataSource: string; deliverableType: string; validation: string };
  alternatives: { title: string; domain: string; description: string }[];
}
export const STAGES: LegacyStage[];
export const PROJECTS: LegacyProject[];
export const CAPSTONE: Capstone;
export const GUIDES: Record<string, Guide>;
export const GUIDES_2D: Record<string, Guide>;
export function S(...a: unknown[]): GuideStep;
