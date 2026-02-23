/**
 * TimingPresets - Collection of classic timing patterns
 */

export interface TimingPreset {
  id: string;
  name: string;
  description: string;
  beats: number[]; // Percentages of bar (0.0 to 1.0)
  bpm: number;
}

export const TIMING_PRESETS: TimingPreset[] = [
  {
    id: 'four-four',
    name: '4/4',
    description: 'Common time - rock, pop, hip-hop',
    beats: [0, 0.25, 0.5, 0.75],
    bpm: 120,
  },
  {
    id: 'three-four',
    name: '3/4',
    description: 'Waltz time - waltzes, ballads',
    beats: [0, 0.333, 0.667],
    bpm: 120,
  },
  {
    id: 'two-four',
    name: '2/4',
    description: 'March time - quick marches',
    beats: [0, 0.5],
    bpm: 120,
  },
  {
    id: 'six-eight',
    name: '6/8',
    description: 'Compound duple - jigs, folk',
    beats: [0, 0.167, 0.333, 0.5, 0.667, 0.833],
    bpm: 120,
  },
  {
    id: 'five-four',
    name: '5/4',
    description: 'Irregular meter - progressive rock',
    beats: [0, 0.2, 0.4, 0.6, 0.8],
    bpm: 120,
  },
  {
    id: 'seven-eight',
    name: '7/8',
    description: 'Irregular meter - Eastern European',
    beats: [0, 0.143, 0.286, 0.429, 0.571, 0.714, 0.857],
    bpm: 120,
  },
  {
    id: 'twelve-eight',
    name: '12/8',
    description: 'Compound quadruple - jazz, blues',
    beats: [0, 0.083, 0.167, 0.25, 0.333, 0.417, 0.5, 0.583, 0.667, 0.75, 0.833, 0.917],
    bpm: 120,
  },
  {
    id: 'swing',
    name: 'Swing',
    description: 'Jazz swing with triplet feel',
    beats: [0, 0.333, 0.667],
    bpm: 140,
  },
  {
    id: 'samba',
    name: 'Samba',
    description: 'Brazilian rhythm',
    beats: [0, 0.167, 0.333, 0.5, 0.667, 0.833],
    bpm: 150,
  },
  {
    id: 'reggae',
    name: 'Reggae',
    description: 'Reggae offbeat',
    beats: [0, 0.5],
    bpm: 90,
  },
];

/**
 * Get a preset by ID
 */
export function getPresetById(id: string): TimingPreset | undefined {
  return TIMING_PRESETS.find((p) => p.id === id);
}

/**
 * Get all presets
 */
export function getAllPresets(): TimingPreset[] {
  return [...TIMING_PRESETS];
}
