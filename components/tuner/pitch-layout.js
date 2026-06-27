// Shared geometry so the harmonium keyboard and the scrolling pitch timeline
// use the exact same vertical (note -> Y) coordinate system and stay aligned.

export const OCTAVES = [2, 3, 4];
export const KEY_HEIGHT = 16;
export const KEY_MARGIN = 0.5;
export const KEY_SLOT = KEY_HEIGHT + KEY_MARGIN * 2; // full height occupied by one key
export const TOTAL_KEYS = OCTAVES.length * 12;
export const TOTAL_HEIGHT = TOTAL_KEYS * KEY_SLOT;

const CHROMATIC = {
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

export function chromaticIndex(name) {
  const key = String(name).replace('\u266f', '#').replace('\u266d', 'b').toUpperCase();
  return CHROMATIC[key] != null ? CHROMATIC[key] : 0;
}

// Absolute semitone index from the top key (C of the first octave) downward.
export function absoluteIndex(name, octave) {
  return (octave - OCTAVES[0]) * 12 + chromaticIndex(name);
}

// Vertical centre (in px, measured from the top of the key column) for a note.
// `cents` (-50..+50) nudges the position within the semitone for fine tuning.
export function noteToY(name, octave, cents = 0) {
  const frac = absoluteIndex(name, octave) + (cents || 0) / 100;
  return frac * KEY_SLOT + KEY_MARGIN + KEY_HEIGHT / 2;
}
