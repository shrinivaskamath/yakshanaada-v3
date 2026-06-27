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
import {startPlaybackService, stopPlaybackService} from './audio-service';
import {useTheme} from './theme';
import {usePlayback} from './playback';

Sound.setCategory('Playback');

type TanpuraMode = 'ma' | 'pa';

function Tanpura() {
  const {colors} = useTheme();
  const {setPlaying} = usePlayback();
  const styles = React.useMemo(() => createStyles(colors), [colors]);
  const [mode, setMode] = React.useState<TanpuraMode>('ma');
  const [playingShruthi, setPlayingShruthi] = React.useState('e');
  const [isPlaying, setIsPlaying] = React.useState(false);
  const [isProcessing, setIsProcessing] = React.useState(false);

  React.useEffect(() => {
    setPlaying(isPlaying);
  }, [isPlaying, setPlaying]);

  React.useEffect(() => () => setPlaying(false), [setPlaying]);

  const sound1 = React.useRef<Sound | null>(null);
  const sound2 = React.useRef<Sound | null>(null);
  const loadedCount = React.useRef<number>(0);
  // Delays creating the new players until the previous ones have been torn
  // down, so switching Ma/Pa (or shruthi) while playing reliably swaps audio.
  const startTimer = React.useRef<ReturnType<typeof setTimeout> | null>(null);
  // Real file length, measured on load via getDuration() (works for any length).
  const durationMs = React.useRef<number>(25000);

  // Fallback only, used if the real duration can't be read. Tanpura files ~25s.
  const FILE_DURATION_MS = 25000;

  React.useEffect(() => {
    return () => {
      stopSounds();
    };
  }, []);

  const stopSounds = () => {
    loadedCount.current = 0;
    if (startTimer.current) {
      clearTimeout(startTimer.current);
      startTimer.current = null;
    }
    if (sound1.current) sound1.current.stop().release();
    if (sound2.current) sound2.current.stop().release();
    sound1.current = null;
    sound2.current = null;
    stopPlaybackService();
    setIsPlaying(false);
  };

  const selectMode = (newMode: TanpuraMode) => {
    if (newMode === mode || isProcessing) return;
    setMode(newMode);
    // If something is already playing, switch it live to the other tanpura.
    if (isPlaying) {
      playSoundInLoop(playingShruthi, newMode);
    }
  };

  const playSoundInLoop = (file: string, playMode: TanpuraMode = mode) => {
    analytics().logEvent('tanpura_' + playMode + '_playing_' + file);
    setPlayingShruthi(file);
    stopSounds();
    startPlaybackService();

    const source = getSound(file, playMode);

    // Defer creation so the players just released in stopSounds() are fully torn
    // down before the new ones start (Android won't reliably start a new
    // MediaPlayer while the previous one is still being released).
    startTimer.current = setTimeout(() => {
      startTimer.current = null;

      // Two copies that both loop natively and are phase-offset by half the file,
      // so their loop boundaries never align (each covers the other's gap).
      const s1 = new Sound(source, (error: any) => {
        if (error) return;
        sound1.current = s1;
        const seconds = s1.getDuration();
        if (seconds && seconds > 0) {
          durationMs.current = seconds * 1000;
        }
        onSoundLoaded();
      });

      const s2 = new Sound(source, (error: any) => {
        if (error) return;
        sound2.current = s2;
        onSoundLoaded();
      });
    }, 120);
  };

  // Starts both copies once both are loaded, offsetting the second by half the
  // file length. No JS timer keeps the loop going, so it continues screen-off.
  const onSoundLoaded = () => {
    loadedCount.current += 1;
    if (loadedCount.current < 2) return;

    const s1 = sound1.current;
    const s2 = sound2.current;
    if (!s1 || !s2) return;

    const offsetSec = (durationMs.current || FILE_DURATION_MS) / 1000 / 2;

    s1.setNumberOfLoops(-1);
    s1.setVolume(1);
    s1.play(() => {});

    s2.setNumberOfLoops(-1);
    s2.setVolume(1);
    s2.play(() => {});
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

  const getSound = (file: string, playMode: TanpuraMode) => {
    if (playMode === 'pa') {
      switch (file) {
        case 'c':
          return require('../assets/tanpura/cshrutipatanpura.mp3');
        case 'cs':
          return require('../assets/tanpura/csharpshrutipatanpura.mp3');
        case 'd':
          return require('../assets/tanpura/dshrutipatanpura.mp3');
        case 'ds':
          return require('../assets/tanpura/dsharpshrutipatanpura.mp3');
        case 'e':
          return require('../assets/tanpura/eshrutipatanpura.mp3');
        case 'f':
          return require('../assets/tanpura/fshrutipatanpura.mp3');
        case 'fs':
          return require('../assets/tanpura/fsharpshrutipatanpura.mp3');
        case 'g':
          return require('../assets/tanpura/gshrutipatanpura.mp3');
        case 'gs':
          return require('../assets/tanpura/gsharpshrutipatanpura.mp3');
        case 'a':
          return require('../assets/tanpura/ashrutipatanpura.mp3');
        case 'as':
          return require('../assets/tanpura/asharpshrutipatanpura.mp3');
        case 'b':
          return require('../assets/tanpura/bshrutipatanpura.mp3');
      }
    } else {
      switch (file) {
        case 'c':
          return require('../assets/tanpura/cshrutimatanpura.mp3');
        case 'cs':
          return require('../assets/tanpura/csharpshrutimatanpura.mp3');
        case 'd':
          return require('../assets/tanpura/dshrutimatanpura.mp3');
        case 'ds':
          return require('../assets/tanpura/dsharpshrutimatanpura.mp3');
        case 'e':
          return require('../assets/tanpura/eshrutimatanpura.mp3');
        case 'f':
          return require('../assets/tanpura/fshrutimatanpura.mp3');
        case 'fs':
          return require('../assets/tanpura/fsharpshrutimatanpura.mp3');
        case 'g':
          return require('../assets/tanpura/gshrutimatanpura.mp3');
        case 'gs':
          return require('../assets/tanpura/gsharpshrutimatanpura.mp3');
        case 'a':
          return require('../assets/tanpura/ashrutimatanpura.mp3');
        case 'as':
          return require('../assets/tanpura/asharpshrutimatanpura.mp3');
        case 'b':
          return require('../assets/tanpura/bshrutimatanpura.mp3');
      }
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
        {/* Ma / Pa toggle */}
        <View style={styles.toggleContainer}>
          <TouchableOpacity
            style={[styles.toggle, mode === 'ma' && styles.toggleActive]}
            onPress={() => selectMode('ma')}
            disabled={isProcessing}>
            <Text
              style={[
                styles.toggleText,
                mode === 'ma' && styles.toggleTextActive,
              ]}>
              ತಾನ್ಪುರ ಮ (Ma)
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.toggle, mode === 'pa' && styles.toggleActive]}
            onPress={() => selectMode('pa')}
            disabled={isProcessing}>
            <Text
              style={[
                styles.toggleText,
                mode === 'pa' && styles.toggleTextActive,
              ]}>
              ತಾನ್ಪುರ ಪ (Pa)
            </Text>
          </TouchableOpacity>
        </View>

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
    toggleContainer: {
      flexDirection: 'row',
      backgroundColor: colors.surface,
      borderRadius: 10,
      padding: 4,
      marginBottom: 20,
    },
    toggle: {
      paddingVertical: 10,
      paddingHorizontal: 20,
      borderRadius: 8,
      marginHorizontal: 2,
    },
    toggleActive: {
      backgroundColor: colors.textOnSurface,
    },
    toggleText: {
      color: colors.textOnSurface,
      fontSize: 15,
      fontWeight: '700',
    },
    toggleTextActive: {
      color: colors.background,
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

export default Tanpura;
