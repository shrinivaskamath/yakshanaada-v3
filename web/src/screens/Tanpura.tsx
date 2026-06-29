import { useEffect, useMemo, useRef, useState } from 'react';
import { useTheme } from '../ThemeContext';
import { usePlayback } from '../PlaybackContext';
import { LoopPlayer } from '../audio/engine';
import {
  NOTE_LIST,
  tanpuraUrl,
  type NoteKey,
  type TanpuraMode,
} from '../audio/paths';

export default function Tanpura() {
  const { colors } = useTheme();
  const { setPlaying } = usePlayback();
  const [mode, setMode] = useState<TanpuraMode>('ma');
  const [playingNote, setPlayingNote] = useState<NoteKey>('e');
  const [isPlaying, setIsPlaying] = useState(false);
  const player = useMemo(() => new LoopPlayer(1), []);
  const playerRef = useRef(player);
  playerRef.current = player;

  useEffect(() => {
    setPlaying(isPlaying);
  }, [isPlaying, setPlaying]);

  useEffect(() => {
    return () => {
      playerRef.current.stop();
      setPlaying(false);
    };
  }, [setPlaying]);

  const playNote = async (note: NoteKey, playMode: TanpuraMode = mode) => {
    setPlayingNote(note);
    await player.play(tanpuraUrl(note, playMode));
    setIsPlaying(true);
  };

  const selectMode = (newMode: TanpuraMode) => {
    if (newMode === mode) return;
    setMode(newMode);
    if (isPlaying) {
      playNote(playingNote, newMode);
    }
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
      <div
        className="mode-toggle"
        style={{ backgroundColor: colors.surface }}
      >
        {(['ma', 'pa'] as TanpuraMode[]).map((m) => {
          const active = mode === m;
          return (
            <button
              key={m}
              onClick={() => selectMode(m)}
              style={{
                backgroundColor: active ? colors.textOnSurface : 'transparent',
                color: active ? colors.background : colors.textOnSurface,
              }}
            >
              {m === 'ma' ? 'ತಾನ್ಪುರ ಮ (Ma)' : 'ತಾನ್ಪುರ ಪ (Pa)'}
            </button>
          );
        })}
      </div>

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
    </div>
  );
}
