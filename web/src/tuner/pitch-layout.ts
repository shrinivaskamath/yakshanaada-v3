// Shared geometry so the harmonium keyboard and the scrolling pitch timeline
// use the exact same vertical (note -> Y) coordinate system and stay aligned.
// Ported from components/tuner/pitch-layout.js.

export const OCTAVES = [2, 3, 4];
export const KEY_HEIGHT = 16;
export const KEY_MARGIN = 0.5;
export const KEY_SLOT = KEY_HEIGHT + KEY_MARGIN * 2;
export const TOTAL_KEYS = OCTAVES.length * 12;
export const TOTAL_HEIGHT = TOTAL_KEYS * KEY_SLOT;

const CHROMATIC: Record<string, number> = {
  C: 0,
  'C#': 1,
  D: 2,
  'D#': 3,
  E: 4,
  F: 5,
  'F#': 6,
  G: 7,
  'G#': 8,
  A: 9,
  'A#': 10,
  B: 11,
};

export function chromaticIndex(name: string): number {
  const key = String(name)
    .replace('\u266f', '#')
    .replace('\u266d', 'b')
    .toUpperCase();
  return CHROMATIC[key] != null ? CHROMATIC[key] : 0;
}

export function absoluteIndex(name: string, octave: number): number {
  return (octave - OCTAVES[0]) * 12 + chromaticIndex(name);
}

export function noteToY(name: string, octave: number, cents = 0): number {
  const frac = absoluteIndex(name, octave) + (cents || 0) / 100;
  return frac * KEY_SLOT + KEY_MARGIN + KEY_HEIGHT / 2;
}
