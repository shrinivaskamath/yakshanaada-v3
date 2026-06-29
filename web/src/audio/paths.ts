import { assetUrl } from './engine';

export type NoteKey =
  | 'c'
  | 'cs'
  | 'd'
  | 'ds'
  | 'e'
  | 'f'
  | 'fs'
  | 'g'
  | 'gs'
  | 'a'
  | 'as'
  | 'b';

export type TanpuraMode = 'ma' | 'pa';

// Notes laid out as the app shows them (two columns per row).
export const NOTE_LIST: {
  key: NoteKey;
  label: string;
  labelKn: string;
}[] = [
  { key: 'c', label: 'C', labelKn: 'ಬಿಳಿ 1' },
  { key: 'cs', label: 'C#', labelKn: 'ಕಪ್ಪು 1' },
  { key: 'd', label: 'D', labelKn: 'ಬಿಳಿ 2' },
  { key: 'ds', label: 'D#', labelKn: 'ಕಪ್ಪು 2' },
  { key: 'e', label: 'E', labelKn: 'ಬಿಳಿ 3' },
  { key: 'f', label: 'F', labelKn: 'ಬಿಳಿ 4' },
  { key: 'fs', label: 'F#', labelKn: 'ಕಪ್ಪು 3' },
  { key: 'g', label: 'G', labelKn: 'ಬಿಳಿ 5' },
  { key: 'gs', label: 'G#', labelKn: 'ಕಪ್ಪು 4' },
  { key: 'a', label: 'A', labelKn: 'ಬಿಳಿ 6' },
  { key: 'as', label: 'A#', labelKn: 'ಕಪ್ಪು 5' },
  { key: 'b', label: 'B', labelKn: 'ಬಿಳಿ 7' },
];

export function shruthiUrl(note: NoteKey): string {
  return assetUrl(`audio/shruthi/${note}.mp3`);
}

// Maps the note key to the prefix used in the tanpura file names, e.g.
// 'cs' -> 'csharp' so 'csharpshrutimatanpura.mp3'.
const TANPURA_PREFIX: Record<NoteKey, string> = {
  c: 'c',
  cs: 'csharp',
  d: 'd',
  ds: 'dsharp',
  e: 'e',
  f: 'f',
  fs: 'fsharp',
  g: 'g',
  gs: 'gsharp',
  a: 'a',
  as: 'asharp',
  b: 'b',
};

export function tanpuraUrl(note: NoteKey, mode: TanpuraMode): string {
  const prefix = TANPURA_PREFIX[note];
  return assetUrl(`audio/tanpura/${prefix}shruti${mode}tanpura.mp3`);
}

export function keyUrl(noteNumber: number): string {
  return assetUrl(`audio/keys/${noteNumber}.m4a`);
}
