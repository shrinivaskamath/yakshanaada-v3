import { useEffect, useMemo, useRef, useState } from 'react';
import { useTheme } from '../ThemeContext';
import { usePlayback } from '../PlaybackContext';
import { LoopPlayer } from '../audio/engine';
import { NOTE_LIST, shruthiUrl, type NoteKey } from '../audio/paths';

export default function Shruthi() {
  const { colors } = useTheme();
  const { setPlaying } = usePlayback();
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
    </div>
  );
}
