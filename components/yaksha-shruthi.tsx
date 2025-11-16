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
import KeepAwake from 'react-native-keep-awake';
import Slider from '@react-native-community/slider'; // Volume control

Sound.setCategory('Playback');

function YakshaShruthi() {
  const [playingShruthi, setPlayingShruthi] = React.useState('e');
  const [isPlaying, setIsPlaying] = React.useState(false);
  const [isProcessing, setIsProcessing] = React.useState(false);
  const [volume, setVolume] = React.useState(1.0); // ✅ Volume state

  const sound1 = React.useRef<Sound | null>(null);
  const sound2 = React.useRef<Sound | null>(null);
  const loopTimer = React.useRef<NodeJS.Timeout | null>(null);
  const currentPlayer = React.useRef<1 | 2>(1);

  const FILE_DURATION_MS = 35000;
  const START_OVERLAP_MS = 500;

  React.useEffect(() => {
    return () => {
      stopSounds();
    };
  }, []);

  const stopSounds = () => {
    if (sound1.current) sound1.current.stop().release();
    if (sound2.current) sound2.current.stop().release();
    if (loopTimer.current) clearTimeout(loopTimer.current);
    KeepAwake.deactivate();
    setIsPlaying(false);
  };

  const playSoundInLoop = (file: string) => {
    analytics().logEvent('yaksha_shruti_playing_' + file);
    setPlayingShruthi(file);
    stopSounds();

    const source = getSound(file);

    const s1 = new Sound(source, error => {
      if (error) return;
      sound1.current = s1;
      s1.setVolume(volume);
      s1.play(() => {});
      scheduleNextPlay(file, 2);
      KeepAwake.activate();
      setIsPlaying(true);
    });

    const s2 = new Sound(source, error => {
      if (error) return;
      sound2.current = s2;
      s2.setVolume(volume);
    });
  };

  const scheduleNextPlay = (file: string, nextPlayer: 1 | 2) => {
    if (loopTimer.current) clearTimeout(loopTimer.current);

    loopTimer.current = setTimeout(() => {
      const nextSound = nextPlayer === 1 ? sound1.current : sound2.current;
      if (nextSound && nextSound.isLoaded()) {
        nextSound.stop(() => {
          nextSound.setVolume(volume);
          nextSound.play(() => {});
          currentPlayer.current = nextPlayer;
          scheduleNextPlay(file, nextPlayer === 1 ? 2 : 1);
        });
      }
    }, FILE_DURATION_MS - START_OVERLAP_MS);
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

        {/* 🔉 Volume Control Slider */}
        <View style={{marginVertical: 10, width: '95%'}}>
          <Text style={{color: 'white', textAlign: 'center', marginBottom: 3}}>
            ಧ್ವನಿ (Volume)
          </Text>
          <Slider
            value={volume}
            onValueChange={value => {
              setVolume(value);
              if (sound1.current) sound1.current.setVolume(value);
              if (sound2.current) sound2.current.setVolume(value);
            }}
            minimumValue={0.0}
            maximumValue={1.0}
            minimumTrackTintColor="#FFFFFF"
            maximumTrackTintColor="#888888"
            thumbTintColor="#FFFFFF"
          />
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

const styles = StyleSheet.create({
  safeArea: {flex: 1, backgroundColor: '#212121'},
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 10,
  },
  row: {flexDirection: 'row', justifyContent: 'space-around', marginBottom: 10},
  button: {
    backgroundColor: '#424242',
    width: 150,
    height: 70,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 5,
  },
  hilight: {borderColor: 'white', borderWidth: 2},
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 10,
  },
  stopButton: {
    backgroundColor: '#424242',
    width: 60,
    height: 60,
    borderRadius: 35,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 5, //
    borderColor: 'white',
  },
  disabledButton: {backgroundColor: '#666666'},
  buttonImageIconStyle: {width: 50, height: 50, resizeMode: 'contain'},
  text: {color: 'white', textAlign: 'center', fontSize: 15, fontWeight: '700'},
});
