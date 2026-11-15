/** Merged registry of per-stage guide upgrades. Add a stage by importing it here. */
import * as s01 from './stage01';
import * as s02 from './stage02';
import * as s03 from './stage03';
export type { Visual, AddedStep, GuidePatch } from './stage01';

const parts = [s01, s02, s03];
const merge = <T,>(pick: (m: typeof s01) => Record<string, T>): Record<string, T> => Object.assign({}, ...parts.map(m => pick(m as typeof s01)));
export const STEP_VISUALS = merge(m => m.STEP_VISUALS);
export const PATCHES = merge(m => m.PATCHES);
export const ADDED_STEPS = merge(m => m.ADDED_STEPS);
export const NEW_GUIDES = merge(m => m.NEW_GUIDES);
export const NEW_STEP_VISUALS = merge(m => m.NEW_STEP_VISUALS);
