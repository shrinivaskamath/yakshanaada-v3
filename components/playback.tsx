import React, {createContext, useContext, useMemo, useState} from 'react';

interface PlaybackContextValue {
  isPlaying: boolean;
  setPlaying: (playing: boolean) => void;
}

const PlaybackContext = createContext<PlaybackContextValue>({
  isPlaying: false,
  setPlaying: () => {},
});

export const PlaybackProvider = ({children}: {children: React.ReactNode}) => {
  const [isPlaying, setPlaying] = useState(false);

  const value = useMemo<PlaybackContextValue>(
    () => ({isPlaying, setPlaying}),
    [isPlaying],
  );

  return (
    <PlaybackContext.Provider value={value}>
      {children}
    </PlaybackContext.Provider>
  );
};

export const usePlayback = () => useContext(PlaybackContext);

export default PlaybackContext;
