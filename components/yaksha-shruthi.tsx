import React from 'react';
import {
  Text,
  View,
  SafeAreaView,
  StyleSheet,
  TouchableOpacity,
  Image,
  Switch,
  ActivityIndicator,
} from 'react-native';
import Sound from 'react-native-sound';
import analytics from '@react-native-firebase/analytics';

Sound.setCategory('Playback');

const fadeDuration = 1000; // Duration of fade effect in milliseconds

function YakshaShruthi() {
  const [playingShruthi, setPlayingShruthi] = React.useState('e');
  const [isPlaying, setIsPlaying] = React.useState(false);
  const [fadeEnabled, setFadeEnabled] = React.useState(false); // State for fade effect switch
  const [isProcessing, setIsProcessing] = React.useState(false); // State to manage stopping process

  const sound1 = React.useRef<Sound | null>(null);
  const sound2 = React.useRef<Sound | null>(null);

  React.useEffect(() => {
    return () => {
      // Clean up sounds
      analytics().logEvent('yaksha_shruti_start');
      if (sound1.current) sound1.current.release();
      if (sound2.current) sound2.current.release();
    };
  }, []);

  const playSoundWithFadeIn = (sound: Sound | null, isSound2) => {
    if (!sound) return;

    if (!isSound2) {
      setIsProcessing(true);
    }

    sound.setVolume(0); // Start with volume 0
    sound.setNumberOfLoops(-1);

    const fadeInInterval = setInterval(() => {
      const currentVolume = sound.getVolume();
      const newVolume = Math.min(currentVolume + 3 / fadeDuration, 1);
      sound.setVolume(newVolume);
      if (newVolume >= 0.99) {
        clearInterval(fadeInInterval); // Stop when volume reaches 1
        if (isSound2) {
          setIsProcessing(false);
        }
        // setIsProcessing(false); // Stop processing
      }
    }, fadeDuration / 100);
    sound.play(); // Start playing the sound
  };

  const stopSoundWithFadeOut = (sound: Sound | null) => {
    if (!sound) return;

    setIsProcessing(true);

    const fadeOutInterval = setInterval(() => {
      const currentVolume = sound.getVolume();
      const newVolume = Math.max(currentVolume - 3 / fadeDuration, 0);
      sound.setVolume(newVolume);

      if (newVolume <= 0.1) {
        clearInterval(fadeOutInterval); // Stop when volume reaches 0
        sound.stop(() => {
          // sound.release(); // Release the sound resource
          setIsPlaying(false); // Update playing state after stopping the sound
          setIsProcessing(false); // Update stopping state
        });
      }
    }, fadeDuration / 100);
  };

  const playSoundInLoop = (file: string) => {
    analytics().logEvent('yaksha_shruti_playing_' + file);
    analytics().logEvent('yaksha_shruti_fade_enable_' + fadeEnabled);
    setPlayingShruthi(file);

    // Stop and release previous sounds if they are playing
    if (fadeEnabled) {
      if (sound1.current) {
        sound1.current.stop();
      }
      if (sound2.current) {
        sound2.current.stop();
      }
    } else {
      if (sound1.current && sound1.current.isPlaying()) {
        sound1.current.stop();
      }
      if (sound2.current && sound2.current.isPlaying()) {
        sound2.current.stop();
      }
    }

    // Initialize new sound instances
    const newSound1 = new Sound(getSound(file), (error: any) => {
      if (error) {
        return;
      }

      sound1.current = newSound1;

      // Start playing the sounds
      if (fadeEnabled) {
        playSoundWithFadeIn(sound1.current, false);
        setTimeout(() => {
          if (sound1.current?.isPlaying()) {
            playSoundWithFadeIn(sound2.current, true);
          }
        }, 4000); // Introduce a delay of 1 second before playing sound2
      } else {
        if (sound1.current) {
          sound1.current.setNumberOfLoops(-1);
          sound1.current.setVolume(0.99);
          sound1.current.play();
        }
        setTimeout(() => {
          if (sound1.current?.isPlaying() && sound2.current) {
            sound2.current.setNumberOfLoops(-1);
            sound2.current.setVolume(0.99);
            sound2.current.play();
          }
        }, 4000); // Introduce a delay of 1 second before playing sound2
      }

      setIsPlaying(true);
    });

    const newSound2 = new Sound(getSound(file), (error: any) => {
      if (error) {
        return;
      }

      sound2.current = newSound2;
    });
  };

  const playPauseClick = () => {
    if (isProcessing) {
      // If currently processing, prevent play/pause
      return;
    }

    if (!isPlaying) {
      playSoundInLoop(playingShruthi);
      return;
    }

    if (fadeEnabled) {
      if (sound1.current && sound1.current.isPlaying()) {
        stopSoundWithFadeOut(sound1.current);
      }
      if (sound2.current && sound2.current.isPlaying()) {
        stopSoundWithFadeOut(sound2.current);
      }
    } else {
      // Fade effect disabled
      if (sound1.current && sound2.current) {
        sound1.current.stop();
        sound2.current.stop();
        setIsPlaying(false);
      }
    }
  };

  const getSound = file => {
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
        return require('../assets/c.mp3');
      case 'a':
        return require('../assets/a.mp3');
      case 'b':
        return require('../assets/b.mp3');
      case 'as':
        return require('../assets/as.mp3');
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.row}>
          <TouchableOpacity
            style={[styles.button, playingShruthi === 'c' && styles.hilight]}
            onPress={() => playSoundInLoop('c')}
            disabled={isProcessing}>
            <Text style={styles.text}>ಬಿಳಿ 1</Text>
            <Text style={styles.text}>C</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.button, playingShruthi === 'cs' && styles.hilight]}
            onPress={() => playSoundInLoop('cs')}
            disabled={isProcessing}>
            <Text style={styles.text}>ಕಪ್ಪು 1</Text>
            <Text style={styles.text}>C#</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.row}>
          <TouchableOpacity
            style={[styles.button, playingShruthi === 'd' && styles.hilight]}
            onPress={() => playSoundInLoop('d')}
            disabled={isProcessing}>
            <Text style={styles.text}>ಬಿಳಿ 2</Text>
            <Text style={styles.text}>D</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.button, playingShruthi === 'ds' && styles.hilight]}
            onPress={() => playSoundInLoop('ds')}
            disabled={isProcessing}>
            <Text style={styles.text}>ಕಪ್ಪು 2</Text>
            <Text style={styles.text}>D#</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.row}>
          <TouchableOpacity
            style={[styles.button, playingShruthi === 'e' && styles.hilight]}
            onPress={() => playSoundInLoop('e')}
            disabled={isProcessing}>
            <Text style={styles.text}>ಬಿಳಿ 3</Text>
            <Text style={styles.text}>E</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.button, playingShruthi === 'f' && styles.hilight]}
            onPress={() => playSoundInLoop('f')}
            disabled={isProcessing}>
            <Text style={styles.text}>ಬಿಳಿ 4</Text>
            <Text style={styles.text}>F</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.row}>
          <TouchableOpacity
            style={[styles.button, playingShruthi === 'fs' && styles.hilight]}
            onPress={() => playSoundInLoop('fs')}
            disabled={isProcessing}>
            <Text style={styles.text}>ಕಪ್ಪು 3</Text>
            <Text style={styles.text}>F#</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.button, playingShruthi === 'g' && styles.hilight]}
            onPress={() => playSoundInLoop('g')}
            disabled={isProcessing}>
            <Text style={styles.text}>ಬಿಳಿ 5</Text>
            <Text style={styles.text}>G</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.row}>
          <TouchableOpacity
            style={[styles.button, playingShruthi === 'gs' && styles.hilight]}
            onPress={() => playSoundInLoop('gs')}
            disabled={isProcessing}>
            <Text style={styles.text}>ಕಪ್ಪು 4</Text>
            <Text style={styles.text}>G#</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.button, playingShruthi === 'a' && styles.hilight]}
            onPress={() => playSoundInLoop('a')}
            disabled={isProcessing}>
            <Text style={styles.text}>ಬಿಳಿ 6</Text>
            <Text style={styles.text}>A</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.row}>
          <TouchableOpacity
            style={[styles.button, playingShruthi === 'as' && styles.hilight]}
            onPress={() => playSoundInLoop('as')}
            disabled={isProcessing}>
            <Text style={styles.text}>ಕಪ್ಪು 5</Text>
            <Text style={styles.text}>A#</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.button, playingShruthi === 'b' && styles.hilight]}
            onPress={() => playSoundInLoop('b')}
            disabled={isProcessing}>
            <Text style={styles.text}>ಬಿಳಿ 7</Text>
            <Text style={styles.text}>B</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.switchContainer}>
          <Text style={styles.switchLabel}>ಮಸುಕು (Fade)</Text>
          <Switch
            trackColor={{false: '#767577', true: '#81b0ff'}}
            thumbColor={fadeEnabled ? '#961A1D' : '#f4f3f4'}
            ios_backgroundColor="#3e3e3e"
            onValueChange={() =>
              setFadeEnabled(previousState => !previousState)
            }
            value={fadeEnabled}
          />
        </View>
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[styles.stopButton, isProcessing && styles.disabledButton]}
            onPress={playPauseClick}
            disabled={isProcessing}>
            {isProcessing ? (
              <ActivityIndicator size="large" color="#ffffff" />
            ) : (
              <Image
                source={
                  isPlaying
                    ? require('../assets/pause.png')
                    : require('../assets/play.png')
                }
                style={styles.buttonImageIconStyle}
              />
            )}
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#212121',
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 10,
  },
  button: {
    backgroundColor: '#424242',
    width: 150,
    height: 70,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 5,
  },
  hilight: {
    borderColor: 'white',
    borderWidth: 2,
  },
  switchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  switchLabel: {
    color: 'white',
    marginRight: 10,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 10,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 20,
  },
  stopButton: {
    backgroundColor: '#424242',
    width: 70,
    height: 70,
    borderRadius: 35,
    justifyContent: 'center',
    alignItems: 'center',
  },
  disabledButton: {
    backgroundColor: '#666666',
  },
  buttonImageIconStyle: {
    width: 50,
    height: 50,
    resizeMode: 'contain',
  },
  text: {
    color: 'white',
    textAlign: 'center',
    fontSize: 15,
    fontWeight: '700',
  },
});

export default YakshaShruthi;
