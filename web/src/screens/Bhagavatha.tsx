import { useEffect, useRef, useState } from 'react';
import { useTheme } from '../ThemeContext';
import { keyUrl } from '../audio/paths';
import { playForDuration } from '../audio/engine';
import raagasData from '../data/raagas.json';

interface Raaga {
  up: number[];
  down: number[];
  swaraUp: string[];
  swaraDown: string[];
}

const raagas = raagasData as unknown as Record<string, Raaga>;

const RAAGA_LABELS: Record<string, string> = {
  naati: 'ನಾಟಿ (Jog)',
  kaushiki: 'ಕೌಶಿಕ್ ಧ್ವನಿ (Kaushiki)',
  hindola: 'ಹಿಂದೋಳ (Hindola)',
  madyamavati: 'ಮಧ್ಯಮಾವತಿ (Madyamavati)',
  kalyani: 'ಕಲ್ಯಾಣಿ (Kalyani)',
  abheri: 'ಅಭೇರಿ (Abheri)',
  mohana: 'ಮೋಹನ (Bhoop)',
  Shivaranjini: 'ಶಿವರಂಜಿನಿ (Shivaranjini)',
  Revathi: 'ರೇವತಿ (Revathi)',
  Shubhapantuvarali: 'ಶುಭಪಂತುವರಾಳಿ (Shubhapantuvarali)',
  Chakravaaka: 'ಚಕ್ರವಾಕ (Chakravaaka)',
  Amrithavarshini: 'ಅಮೃತವರ್ಷಿಣಿ (Amrithavarshini)',
  Charukeshi: 'ಚಾರುಕೇಶಿ (Charukeshi)',
};

const BASE_OPTIONS = [
  { value: '1', label: 'ಬಿಳಿ 1 (C)' },
  { value: '2', label: 'ಕಪ್ಪು 1 (C#)' },
  { value: '3', label: 'ಬಿಳಿ 2 (D)' },
  { value: '4', label: 'ಕಪ್ಪು 2 (D#)' },
  { value: '5', label: 'ಬಿಳಿ 3 (E)' },
  { value: '6', label: 'ಬಿಳಿ 4 (F)' },
  { value: '7', label: 'ಕಪ್ಪು 3 (F#)' },
  { value: '8', label: 'ಬಿಳಿ 5 (G)' },
  { value: '9', label: 'ಕಪ್ಪು 4 (G#)' },
  { value: '10', label: 'ಬಿಳಿ 6 (A)' },
  { value: '11', label: 'ಕಪ್ಪು 5 (A#)' },
  { value: '12', label: 'ಬಿಳಿ 7 (B)' },
];

const LAYA_OPTIONS = [
  { value: 'medium', label: 'ಮಧ್ಯಮ (Medium)' },
  { value: 'low', label: 'ಮಂದ್ರ (Low)' },
  { value: 'high', label: 'ತಾರಕ (High)' },
];

const TEMPO_OPTIONS = [
  { value: '4000', label: '1ನೇ ಕಾಲ' },
  { value: '2000', label: '2ನೇ ಕಾಲ' },
  { value: '1000', label: '3ನೇ ಕಾಲ' },
  { value: '500', label: '4ನೇ ಕಾಲ' },
];

function isUpperCase(letter: string | undefined): boolean {
  return !!letter && letter === letter.toUpperCase();
}

export default function Bhagavatha() {
  const { colors } = useTheme();
  const [base, setBase] = useState('1');
  const [raaga, setRaaga] = useState('naati');
  const [tempo, setTempo] = useState('1000');
  const [laya, setLaya] = useState('medium');
  const [blinkingIndex, setBlinkingIndex] = useState<number | null>(null);
  const [updown, setUpdown] = useState<'up' | 'down' | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  const cancelRef = useRef<(() => void) | null>(null);
  const playingRef = useRef(false);

  useEffect(() => {
    return () => {
      playingRef.current = false;
      if (cancelRef.current) cancelRef.current();
    };
  }, []);

  const playAudio = (note: number, c: number) =>
    new Promise<void>((resolve) => {
      setBlinkingIndex(c);
      const { done, cancel } = playForDuration(keyUrl(note), parseInt(tempo));
      cancelRef.current = cancel;
      done.then(() => {
        setBlinkingIndex(null);
        cancelRef.current = null;
        resolve();
      });
    });

  const blinkBlocks = async (arrow: 'up' | 'down') => {
    if (playingRef.current) return;
    playingRef.current = true;
    setIsPlaying(true);

    const current = raagas[raaga];
    const iBase = parseInt(base);
    let iLaya = 0;
    if (laya === 'low') iLaya = -12;
    else if (laya === 'high') iLaya = 11;

    try {
      let c = 0;
      if (arrow === 'up') {
        setUpdown('up');
        let i = 12 + iBase + iLaya;
        while (i <= 25 + iBase + iLaya && playingRef.current) {
          await playAudio(i, c);
          i = i + current.up[c + 1];
          c++;
          if (current.up[c] == null) break;
        }
      } else {
        setUpdown('down');
        let i = 24 + iBase + iLaya;
        while (i >= 12 + iBase + iLaya && playingRef.current) {
          await playAudio(i, c);
          i = i + current.down[c + 1];
          c++;
          if (current.down[c] == null) break;
        }
      }
    } finally {
      setUpdown(null);
      setBlinkingIndex(null);
      playingRef.current = false;
      setIsPlaying(false);
    }
  };

  const current = raagas[raaga];

  const renderBlocks = (which: 'up' | 'down') => {
    const swara = which === 'up' ? current.swaraUp : current.swaraDown;
    const steps = which === 'up' ? current.up : current.down;
    const blocks = [];
    for (let i = 0; i < 8; i++) {
      const active = i === blinkingIndex && updown === which;
      const text = i <= steps.length ? swara[i] : '';
      blocks.push(
        <div
          key={i}
          className="block"
          style={{
            backgroundColor: active ? colors.accent : colors.blockBackground,
            borderColor: colors.accent,
            color: active ? '#ffffff' : colors.blockText,
          }}
        >
          <span className={isUpperCase(swara[i]) ? 'bold' : undefined}>
            {text}
          </span>
        </div>,
      );
    }
    return blocks;
  };

  const selectStyle = {
    backgroundColor: colors.surface,
    color: colors.accent,
    borderColor: colors.accent,
  };

  return (
    <div className="bhaga">
      <select
        value={base}
        onChange={(e) => setBase(e.target.value)}
        style={selectStyle}
        aria-label="Base"
      >
        {BASE_OPTIONS.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>

      <select
        value={raaga}
        onChange={(e) => setRaaga(e.target.value)}
        style={selectStyle}
        aria-label="Raaga"
      >
        {Object.keys(raagas).map((key) => (
          <option key={key} value={key}>
            {RAAGA_LABELS[key] || key}
          </option>
        ))}
      </select>

      <select
        value={laya}
        onChange={(e) => setLaya(e.target.value)}
        style={selectStyle}
        aria-label="Laya"
      >
        {LAYA_OPTIONS.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>

      <select
        value={tempo}
        onChange={(e) => setTempo(e.target.value)}
        style={selectStyle}
        aria-label="Tempo"
      >
        {TEMPO_OPTIONS.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>

      <div className="block-row">{renderBlocks('up')}</div>
      <div className="block-row">{renderBlocks('down')}</div>

      <button
        className="bhaga-btn"
        onClick={() => blinkBlocks('up')}
        disabled={isPlaying}
        style={{ backgroundColor: colors.surface, color: colors.textOnSurface }}
      >
        ಆರೋಹಣ (UP)
      </button>
      <button
        className="bhaga-btn"
        onClick={() => blinkBlocks('down')}
        disabled={isPlaying}
        style={{ backgroundColor: colors.surface, color: colors.textOnSurface }}
      >
        ಅವರೋಹಣ (Down)
      </button>
    </div>
  );
}
