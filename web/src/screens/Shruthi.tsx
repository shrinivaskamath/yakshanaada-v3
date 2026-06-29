import { useEffect, useMemo, useRef, useState } from 'react';
import { useTheme } from '../ThemeContext';
import { usePlayback } from '../PlaybackContext';
import { LoopPlayer, loadBuffer, prefetchUrls } from '../audio/engine';
import { NOTE_LIST, shruthiUrl, type NoteKey } from '../audio/paths';

const TOTAL_NOTES = NOTE_LIST.length;

export default function Shruthi() {
  const { colors } = useTheme();
  const { setPlaying } = usePlayback();
  const [playingNote, setPlayingNote] = useState<NoteKey>('e');
  const [isPlaying, setIsPlaying] = useState(false);
  const [loaded, setLoaded] = useState(0);
  const player = useMemo(() => new LoopPlayer(1), []);
  const playerRef = useRef(player);
  playerRef.current = player;

  useEffect(() => {
    setPlaying(isPlaying);
  }, [isPlaying, setPlaying]);

  // On open, pre-download all 12 shruthi files into the cache and decode the
  // default note, so tapping a note starts (almost) instantly.
  useEffect(() => {
    let cancelled = false;
    loadBuffer(shruthiUrl('e')).catch(() => {});
    prefetchUrls(
      NOTE_LIST.map((n) => shruthiUrl(n.key)),
      { onProgress: (done) => !cancelled && setLoaded(done) },
    );
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    return () => {
      playerRef.current.stop();
      setPlaying(false);
    };
  }, [setPlaying]);

  const playNote = async (note: NoteKey) => {
    setPlayingNote(note);
    await player.play(shruthiUrl(note));
    setIsPlaying(true);
  };

  const togglePlay = async () => {
    if (isPlaying) {
      player.stop();
      setIsPlaying(false);
    } else {
      await playNote(playingNote);
    }
  };

  return (
    <div className="center-col">
      <div className="note-grid">
        {NOTE_LIST.map((n) => {
          const active = playingNote === n.key;
          return (
            <button
              key={n.key}
              className="note-btn"
              onClick={() => playNote(n.key)}
              style={{
                backgroundColor: colors.surface,
                color: colors.textOnSurface,
                borderColor: active ? colors.border : 'transparent',
              }}
            >
              <span>{n.labelKn}</span>
              <span>{n.label}</span>
            </button>
          );
        })}
      </div>

      <button
        className="play-btn"
        onClick={togglePlay}
        style={{
          backgroundColor: colors.surface,
          borderColor: colors.border,
          color: colors.textOnSurface,
        }}
        aria-label={isPlaying ? 'Pause' : 'Play'}
      >
        {isPlaying ? '\u23F8' : '\u25B6'}
      </button>

      {loaded < TOTAL_NOTES && (
        <span style={{ fontSize: 12, opacity: 0.7, color: colors.text }}>
          ಆಡಿಯೋ ಸಿದ್ಧವಾಗುತ್ತಿದೆ… {loaded}/{TOTAL_NOTES}
        </span>
      )}
    </div>
  );
}
