import { useEffect, useRef, useState } from 'react';
import { useTheme } from '../ThemeContext';
import { WebTuner, type DetectedNote } from '../tuner/WebTuner';
import Harmonium from '../tuner/Harmonium';
import PitchTimeline from '../tuner/PitchTimeline';

const SHRUTHI_KANNADA: Record<string, string> = {
  C: 'ಬಿಳಿ 1',
  'C#': 'ಕಪ್ಪು 1',
  D: 'ಬಿಳಿ 2',
  'D#': 'ಕಪ್ಪು 2',
  E: 'ಬಿಳಿ 3',
  F: 'ಬಿಳಿ 4',
  'F#': 'ಕಪ್ಪು 3',
  G: 'ಬಿಳಿ 5',
  'G#': 'ಕಪ್ಪು 4',
  A: 'ಬಿಳಿ 6',
  'A#': 'ಕಪ್ಪು 5',
  B: 'ಬಿಳಿ 7',
};

const OCTAVE_KANNADA: Record<number, string> = {
  2: 'ಮಂದ್ರ',
  3: 'ಮಧ್ಯಮ',
  4: 'ತಾರಕ',
};

function shruthiKannada(name: string): string {
  const normalized = String(name)
    .replace('\u266f', '#')
    .replace('\u266d', 'b')
    .toUpperCase();
  return SHRUTHI_KANNADA[normalized] || name;
}

const INITIAL_NOTE: DetectedNote = {
  name: 'A',
  octave: 4,
  frequency: 440,
  cents: 0,
  value: 69,
};

export default function Tuner({ active }: { active: boolean }) {
  const { colors } = useTheme();
  const [note, setNote] = useState<DetectedNote>(INITIAL_NOTE);
  const [lastDetected, setLastDetected] = useState(0);
  const [listening, setListening] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const tunerRef = useRef<WebTuner | null>(null);
  const lastNameRef = useRef<string | null>(null);

  const stop = () => {
    if (tunerRef.current) {
      tunerRef.current.stop();
      tunerRef.current = null;
    }
    setListening(false);
  };

  const start = async () => {
    setError(null);
    try {
      const tuner = new WebTuner();
      tuner.onNoteDetected = (n) => {
        // Require two consecutive frames of the same note before showing it,
        // matching the native debounce, to suppress jitter.
        if (lastNameRef.current === n.name) {
          setNote(n);
          setLastDetected(Date.now());
        } else {
          lastNameRef.current = n.name;
        }
      };
      await tuner.start();
      tunerRef.current = tuner;
      setListening(true);
    } catch (e) {
      setError(
        'Microphone access is required for the pitch detector. Please allow it and try again.',
      );
      // eslint-disable-next-line no-console
      console.error(e);
    }
  };

  // Stop the mic whenever this screen is hidden or unmounted.
  useEffect(() => {
    if (!active) stop();
    return () => stop();
  }, [active]);

  const shruthi = shruthiKannada(note.name);
  const octaveText = OCTAVE_KANNADA[note.octave] || String(note.octave);
  const labelText = `${note.name} (${note.octave}) - ${shruthi} - ${octaveText}`;

  return (
    <div className="tuner">
      <div className="tuner-label">
        {!listening ? (
          <button
            className="start-btn"
            onClick={start}
            style={{
              backgroundColor: colors.surface,
              color: colors.textOnSurface,
              borderColor: colors.accent,
            }}
          >
            ಶೃತಿ ಪರೀಕ್ಷೆ ಪ್ರಾರಂಭಿಸಿ (Start mic)
          </button>
        ) : (
          <span>
            <span style={{ color: colors.accent }}>{labelText}</span>
            <span style={{ color: colors.text }}>
              {' '}
              - {note.frequency.toFixed(1)} Hz
            </span>
          </span>
        )}
      </div>

      {error && (
        <div className="notice" style={{ color: colors.accent }}>
          {error}
        </div>
      )}

      {listening && (
        <div className="tuner-monitor">
          <PitchTimeline note={note} lastDetected={lastDetected} />
          <div
            className="tuner-keyboard"
            style={{ borderColor: colors.border, backgroundColor: '#ffffff' }}
          >
            <Harmonium activeNote={{ name: note.name, octave: note.octave }} />
          </div>
        </div>
      )}
    </div>
  );
}
