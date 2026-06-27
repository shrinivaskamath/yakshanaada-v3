import * as React from 'react';
import {
  Text,
  View,
  SafeAreaView,
  StyleSheet,
  TouchableOpacity,
  Image,
} from 'react-native';
import Sound from 'react-native-sound';
import analytics from '@react-native-firebase/analytics';
import Slider from '@react-native-community/slider'; // Volume control
import {startPlaybackService, stopPlaybackService} from './audio-service';
import {useTheme} from './theme';
import {usePlayback} from './playback';

Sound.setCategory('Playback');

function YakshaShruthi() {
  const {colors} = useTheme();
  const {setPlaying} = usePlayback();
  const styles = React.useMemo(() => createStyles(colors), [colors]);
  const [playingShruthi, setPlayingShruthi] = React.useState('e');
  const [isPlaying, setIsPlaying] = React.useState(false);
  const [isProcessing, setIsProcessing] = React.useState(false);
  const [volume, setVolume] = React.useState(1.0); // ✅ Volume state

  React.useEffect(() => {
    setPlaying(isPlaying);
  }, [isPlaying, setPlaying]);

  React.useEffect(() => () => setPlaying(false), [setPlaying]);

  const sound1 = React.useRef<Sound | null>(null);
  const sound2 = React.useRef<Sound | null>(null);
  const loadedCount = React.useRef<number>(0);
  // Real file length, measured from the loaded sound (works for any file
  // length, e.g. the ~8 minute shruti files). Updated on load via getDuration().
  const durationMs = React.useRef<number>(480000);

  // Fallback only, used in the rare case the real duration can't be read.
  // Set to roughly the length of your audio files (~8 minutes here).
  const FILE_DURATION_MS = 480000;

  React.useEffect(() => {
    return () => {
      stopSounds();
    };
  }, []);

  const stopSounds = () => {
    loadedCount.current = 0;
    if (sound1.current) sound1.current.stop().release();
    if (sound2.current) sound2.current.stop().release();
    sound1.current = null;
    sound2.current = null;
    stopPlaybackService();
    setIsPlaying(false);
  };

  const playSoundInLoop = (file: string) => {
    analytics().logEvent('yaksha_shruti_playing_' + file);
    setPlayingShruthi(file);
    stopSounds();
    startPlaybackService();

    const source = getSound(file);

    // Two copies of the same file both loop NATIVELY forever (no JS timers, so
    // it keeps going with the screen off). They are phase-offset by half the
    // file length, so each copy's loop-boundary gap is covered by the other
    // copy playing in its full-volume steady region.
    const s1 = new Sound(source, error => {
      if (error) return;
      sound1.current = s1;
      const seconds = s1.getDuration();
      if (seconds && seconds > 0) {
        durationMs.current = seconds * 1000;
      }
      onSoundLoaded();
    });

    const s2 = new Sound(source, error => {
      if (error) return;
      sound2.current = s2;
      onSoundLoaded();
    });
  };

  // Starts both copies once they are both loaded, with a half-file phase offset.
  const onSoundLoaded = () => {
    loadedCount.current += 1;
    if (loadedCount.current < 2) return;

    const s1 = sound1.current;
    const s2 = sound2.current;
    if (!s1 || !s2) return;

    const offsetSec = (durationMs.current || FILE_DURATION_MS) / 1000 / 2;

    s1.setVolume(volume);
    s1.setNumberOfLoops(-1);
    s1.setCurrentTime(0);
    s1.play(() => {});

    s2.setVolume(volume);
    s2.setNumberOfLoops(-1);
    s2.play(() => {});
    // Seek the second copy to the middle so its loop boundary never lines up
    // with the first copy's boundary.
    s2.setCurrentTime(offsetSec);

    setIsPlaying(true);
  };

  const playPauseClick = () => {
    if (isProcessing) return;
    if (!isPlaying) {
      playSoundInLoop(playingShruthi);
    } else {
      stopSounds();
    }
  };

  const getSound = (file: string) => {
    switch (file) {
      case 'c':
        return require('../assets/c.mp3');
      case 'cs':
        return require('../assets/cs.mp3');
      case 'd':
        return require('../assets/d.mp3');
      case 'ds':
        return require('../assets/ds.mp3');
      case 'e':
        return require('../assets/e.mp3');
      case 'f':
        return require('../assets/f.mp3');
      case 'fs':
        return require('../assets/fs.mp3');
      case 'g':
        return require('../assets/g.mp3');
      case 'gs':
        return require('../assets/gs.mp3');
      case 'a':
        return require('../assets/a.mp3');
      case 'as':
        return require('../assets/as.mp3');
      case 'b':
        return require('../assets/b.mp3');
    }
  };

  function ShruthiButton({
    label,
    labelKn,
    shruthi,
  }: {
    label: string;
    labelKn: string;
    shruthi: string;
  }) {
    return (
      <TouchableOpacity
        style={[styles.button, playingShruthi === shruthi && styles.hilight]}
        onPress={() => playSoundInLoop(shruthi)}
        disabled={isProcessing}>
        <Text style={styles.text}>{labelKn}</Text>
        <Text style={styles.text}>{label}</Text>
      </TouchableOpacity>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.row}>
          <ShruthiButton label="C" labelKn="ಬಿಳಿ 1" shruthi="c" />
          <ShruthiButton label="C#" labelKn="ಕಪ್ಪು 1" shruthi="cs" />
        </View>
        <View style={styles.row}>
          <ShruthiButton label="D" labelKn="ಬಿಳಿ 2" shruthi="d" />
          <ShruthiButton label="D#" labelKn="ಕಪ್ಪು 2" shruthi="ds" />
        </View>
        <View style={styles.row}>
          <ShruthiButton label="E" labelKn="ಬಿಳಿ 3" shruthi="e" />
          <ShruthiButton label="F" labelKn="ಬಿಳಿ 4" shruthi="f" />
        </View>
        <View style={styles.row}>
          <ShruthiButton label="F#" labelKn="ಕಪ್ಪು 3" shruthi="fs" />
          <ShruthiButton label="G" labelKn="ಬಿಳಿ 5" shruthi="g" />
        </View>
        <View style={styles.row}>
          <ShruthiButton label="G#" labelKn="ಕಪ್ಪು 4" shruthi="gs" />
          <ShruthiButton label="A" labelKn="ಬಿಳಿ 6" shruthi="a" />
        </View>
        <View style={styles.row}>
          <ShruthiButton label="A#" labelKn="ಕಪ್ಪು 5" shruthi="as" />
          <ShruthiButton label="B" labelKn="ಬಿಳಿ 7" shruthi="b" />
        </View>

        {/* ▶️ / ⏸ Button */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[styles.stopButton, isProcessing && styles.disabledButton]}
            onPress={playPauseClick}
            disabled={isProcessing}>
            <Image
              source={
                isPlaying
                  ? require('../assets/pauseNew.png')
                  : require('../assets/playNew.png')
              }
              style={styles.buttonImageIconStyle}
            />
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const createStyles = (colors: import('./theme').ThemeColors) =>
  StyleSheet.create({
    safeArea: {flex: 1, backgroundColor: colors.background},
    container: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      padding: 10,
    },
    row: {
      flexDirection: 'row',
      justifyContent: 'space-around',
      marginBottom: 10,
    },
    button: {
      backgroundColor: colors.surface,
      width: 150,
      height: 70,
      borderRadius: 10,
      justifyContent: 'center',
      alignItems: 'center',
      marginHorizontal: 5,
    },
    hilight: {borderColor: colors.border, borderWidth: 2},
    buttonContainer: {
      flexDirection: 'row',
      justifyContent: 'center',
      marginTop: 10,
    },
    stopButton: {
      backgroundColor: colors.surface,
      width: 60,
      height: 60,
      borderRadius: 35,
      justifyContent: 'center',
      alignItems: 'center',
      borderWidth: 5,
      borderColor: colors.border,
    },
    disabledButton: {backgroundColor: colors.disabled},
    buttonImageIconStyle: {
      width: 50,
      height: 50,
      resizeMode: 'contain',
      tintColor: colors.textOnSurface,
    },
    text: {
      color: colors.textOnSurface,
      textAlign: 'center',
      fontSize: 15,
      fontWeight: '700',
    },
  });

export default YakshaShruthi;
