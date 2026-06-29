import { OCTAVES, KEY_HEIGHT, KEY_MARGIN } from './pitch-layout';

const CHROMATIC_NAMES = [
  'C',
  'C#',
  'D',
  'D#',
  'E',
  'F',
  'F#',
  'G',
  'G#',
  'A',
  'A#',
  'B',
];

function normalize(name: string): string {
  return String(name).replace('\u266f', '#').replace('\u266d', 'b').toUpperCase();
}

export interface ActiveNote {
  name: string;
  octave: number;
}

// Vertical chromatic key column. Keys are laid out top-to-bottom in the same
// order/spacing as pitch-layout's noteToY, so it lines up with the timeline.
export default function Harmonium({ activeNote }: { activeNote: ActiveNote }) {
  const activeName = normalize(activeNote.name);
  const keys: { name: string; octave: number; sharp: boolean }[] = [];
  OCTAVES.forEach((octave) => {
    CHROMATIC_NAMES.forEach((name) => {
      keys.push({ name, octave, sharp: name.includes('#') });
    });
  });

  return (
    <div>
      {keys.map((k) => {
        const isActive = k.name === activeName && k.octave === activeNote.octave;
        const bg = isActive
          ? k.sharp
            ? '#8b0000'
            : '#c62828'
          : k.sharp
          ? '#000000'
          : '#ffffff';
        const color = isActive || k.sharp ? '#ffffff' : '#37474f';
        return (
          <div
            key={`${k.name}${k.octave}`}
            className="harmonium-key"
            style={{
              height: KEY_HEIGHT,
              margin: `${KEY_MARGIN}px 2px`,
              backgroundColor: bg,
              color,
              borderColor: k.sharp ? '#111111' : '#cfd8dc',
            }}
          >
            {k.name}
            <span style={{ fontSize: 6, marginLeft: 1 }}>{k.octave}</span>
          </div>
        );
      })}
    </div>
  );
}
