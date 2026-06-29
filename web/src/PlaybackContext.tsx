import {
  createContext,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

interface PlaybackContextValue {
  isPlaying: boolean;
  setPlaying: (playing: boolean) => void;
}

const PlaybackContext = createContext<PlaybackContextValue>({
  isPlaying: false,
  setPlaying: () => {},
});

export function PlaybackProvider({ children }: { children: ReactNode }) {
  const [isPlaying, setPlaying] = useState(false);
  const value = useMemo(() => ({ isPlaying, setPlaying }), [isPlaying]);
  return (
    <PlaybackContext.Provider value={value}>
      {children}
    </PlaybackContext.Provider>
  );
}

export const usePlayback = () => useContext(PlaybackContext);

export default PlaybackContext;
