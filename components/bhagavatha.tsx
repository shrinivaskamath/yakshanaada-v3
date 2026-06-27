import React, {useState, useEffect} from 'react';
import {View, Linking} from 'react-native';
import {Picker} from '@react-native-picker/picker';
import {Text, TouchableOpacity, StyleSheet} from 'react-native';
import Sound from 'react-native-sound';
import analytics from '@react-native-firebase/analytics';
import {useTheme} from './theme';

const RAAGA_LABELS: {[key: string]: string} = {
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

const Bhagavatha = () => {
  const {colors} = useTheme();
  const styles = React.useMemo(() => createStyles(colors), [colors]);
  const [base, setBase] = useState('1');
  const [raaga, setRaaga] = useState('naati');
  const [tempo, setTempo] = useState('1000');
  const [laya, setLaya] = useState('medium');
  const [blinkingIndex, setBlinkingIndex] = useState(null);
  const [updown, setUpdown] = useState();
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentSound, setCurrentSound] = useState(null);

  const sound = React.useRef<Sound | null>(null);

  const blinkBlocks = async arrow => {
    if (isPlaying) {
      return;
    }
    setIsPlaying(true);
    let index = 0;
    try {
      let raagas = readAndParseJson();
      let iBase = parseInt(base);
      let iLaya = 0;
      if (laya == 'low') {
        iLaya = -12;
      } else if (laya == 'high') {
        iLaya = 11;
      }
      let i = arrow == 'up' ? 12 + iBase + iLaya : 24 + iBase + iLaya;
      let c = 0;
      if (arrow == 'up' || arrow == 'Stop') {
        setUpdown('up');
        while (i <= 25 + iBase + iLaya) {
          await playAudio(i, c);
          i = i + raagas[raaga].up[c + 1];
          c++;
        }
        setUpdown(null);
      } else if (arrow == 'down') {
        setUpdown('down');
        c = 0;
        while (i >= 12 + iBase + iLaya) {
          await playAudio(i, c);
          i = i + raagas[raaga].down[c + 1];
          c++;
        }
        setUpdown(null);
      }
    } catch (error) {
      console.error('Error during audio playback:', error);
    } finally {
      setIsPlaying(false);
    }
  };

  const playAudio = (note, c) => {
    analytics().logEvent('Bhagavatha_playing_' + note);
    return new Promise(resolve => {
      const soundPath = getSound(note);

      const newsound = new Sound(soundPath, error => {
        if (error) {
          resolve(); // Resolve even on error to avoid blocking the loop
          return;
        }
        setCurrentSound(newsound);
        setBlinkingIndex(c);
        newsound.play(() => {});
        setTimeout(() => {
          newsound.stop(() => {
            setBlinkingIndex(null);
            setCurrentSound(null);
            newsound.release(); // Release the sound resource
            resolve(); // Resolve the promise to continue to the next sound
          });
        }, parseInt(tempo)); // Stop the sound after 'tempo' milliseconds
      });
    });
  };

  const renderUpBlocks = () => {
    const upBlocks = [];
    let raagas = readAndParseJson();
    for (let i = 0; i < 8; i++) {
      upBlocks.push(
        <View
          key={i}
          style={[
            styles.block,
            i === blinkingIndex && updown == 'up' && styles.blinkingBlock,
          ]}>
          <Text
            style={[
              styles.text,
              isUpperCase(raagas[raaga].swaraUp[i]) && styles.boldText,
            ]}>
            {i <= raagas[raaga].up.length ? raagas[raaga].swaraUp[i] : ''}
          </Text>
        </View>,
      );
    }
    return upBlocks;
  };

  const isUpperCase = letter => letter && letter === letter.toUpperCase();

  const renderDownBlocks = () => {
    const downBlocks = [];
    let raagas = readAndParseJson();
    for (let i = 0; i < 8; i++) {
      downBlocks.push(
        <View
          key={i}
          style={[
            styles.block,
            i === blinkingIndex && updown == 'down' && styles.blinkingBlock,
          ]}>
          <Text
            style={[
              styles.text,
              isUpperCase(raagas[raaga].swaraDown[i]) && styles.boldText,
            ]}>
            {i <= raagas[raaga].down.length ? raagas[raaga].swaraDown[i] : ''}
          </Text>
        </View>,
      );
    }
    return downBlocks;
  };

  const getSound = file => {
    switch (file) {
      case 1:
        return require('../assets/keys/1.m4a');
      case 2:
        return require('../assets/keys/2.m4a');
      case 3:
        return require('../assets/keys/3.m4a');
      case 4:
        return require('../assets/keys/4.m4a');
      case 5:
        return require('../assets/keys/5.m4a');
      case 6:
        return require('../assets/keys/6.m4a');
      case 7:
        return require('../assets/keys/7.m4a');
      case 8:
        return require('../assets/keys/8.m4a');
      case 9:
        return require('../assets/keys/9.m4a');
      case 10:
        return require('../assets/keys/10.m4a');
      case 11:
        return require('../assets/keys/11.m4a');
      case 12:
        return require('../assets/keys/12.m4a');
      case 13:
        return require('../assets/keys/13.m4a');
      case 14:
        return require('../assets/keys/14.m4a');
      case 15:
        return require('../assets/keys/15.m4a');
      case 16:
        return require('../assets/keys/16.m4a');
      case 17:
        return require('../assets/keys/17.m4a');
      case 18:
        return require('../assets/keys/18.m4a');
      case 19:
        return require('../assets/keys/19.m4a');
      case 20:
        return require('../assets/keys/20.m4a');
      case 21:
        return require('../assets/keys/21.m4a');
      case 22:
        return require('../assets/keys/22.m4a');
      case 23:
        return require('../assets/keys/23.m4a');
      case 24:
        return require('../assets/keys/24.m4a');
      case 25:
        return require('../assets/keys/25.m4a');
      case 26:
        return require('../assets/keys/26.m4a');
      case 27:
        return require('../assets/keys/27.m4a');
      case 28:
        return require('../assets/keys/28.m4a');
      case 29:
        return require('../assets/keys/29.m4a');
      case 30:
        return require('../assets/keys/30.m4a');
      case 31:
        return require('../assets/keys/31.m4a');
      case 32:
        return require('../assets/keys/32.m4a');
      case 33:
        return require('../assets/keys/33.m4a');
      case 34:
        return require('../assets/keys/34.m4a');
      case 35:
        return require('../assets/keys/35.m4a');
      case 36:
        return require('../assets/keys/36.m4a');
      case 37:
        return require('../assets/keys/37.m4a');
      case 38:
        return require('../assets/keys/38.m4a');
      case 39:
        return require('../assets/keys/39.m4a');
      case 40:
        return require('../assets/keys/40.m4a');
      case 41:
        return require('../assets/keys/41.m4a');
      case 42:
        return require('../assets/keys/42.m4a');
      case 43:
        return require('../assets/keys/43.m4a');
      case 44:
        return require('../assets/keys/44.m4a');
      case 45:
        return require('../assets/keys/45.m4a');
      case 46:
        return require('../assets/keys/46.m4a');
      case 47:
        return require('../assets/keys/47.m4a');
      case 48:
        return require('../assets/keys/48.m4a');
      case 49:
        return require('../assets/keys/49.m4a');
    }
  };

  const readAndParseJson = () => {
    try {
      const jsonFile = require('../assets/raagas.json');
      return JSON.parse(JSON.stringify(jsonFile));
    } catch (error) {
      console.error('Error reading or parsing JSON:', error);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.dropdownContainer}>
        <Picker
          placeHolder="Base"
          style={styles.dropdown}
          selectedValue={base}
          onValueChange={value => setBase(value)}>
          <Picker.Item
            label="ಬಿಳಿ 1 (C) "
            value="1"
            style={styles.dropdownLabel}
          />
          <Picker.Item
            label="ಕಪ್ಪು 1 (C#) "
            value="2"
            style={styles.dropdownLabel}
          />
          <Picker.Item
            label="ಬಿಳಿ 2 (D) "
            value="3"
            style={styles.dropdownLabel}
          />
          <Picker.Item
            label="ಕಪ್ಪು 2 (D#) "
            value="4"
            style={styles.dropdownLabel}
          />
          <Picker.Item
            label="ಬಿಳಿ 3 (E) "
            value="5"
            style={styles.dropdownLabel}
          />
          <Picker.Item
            label="ಬಿಳಿ 4 (F) "
            value="6"
            style={styles.dropdownLabel}
          />
          <Picker.Item
            label="ಕಪ್ಪು 3 (F#) "
            value="7"
            style={styles.dropdownLabel}
          />
          <Picker.Item
            label="ಬಿಳಿ 5 (G) "
            value="8"
            style={styles.dropdownLabel}
          />
          <Picker.Item
            label="ಕಪ್ಪು 4 (G#) "
            value="9"
            style={styles.dropdownLabel}
          />
          <Picker.Item
            label="ಬಿಳಿ 6 (A) "
            value="10"
            style={styles.dropdownLabel}
          />
          <Picker.Item
            label="ಕಪ್ಪು 5 (A#) "
            value="11"
            style={styles.dropdownLabel}
          />
          <Picker.Item
            label="ಬಿಳಿ 7 (B) "
            value="12"
            style={styles.dropdownLabel}
          />
        </Picker>
      </View>

      <View style={styles.dropdownContainer}>
        <Picker
          style={styles.dropdown}
          selectedValue={raaga}
          onValueChange={value => setRaaga(value)}>
          {Object.keys(readAndParseJson() || {}).map(key => (
            <Picker.Item
              key={key}
              label={RAAGA_LABELS[key] || key}
              value={key}
              style={styles.dropdownLabel}
            />
          ))}
        </Picker>
      </View>
      <View style={styles.dropdownContainer}>
        <Picker
          style={styles.dropdown}
          selectedValue={laya}
          onValueChange={value => setLaya(value)}>
          <Picker.Item
            label="ಮಧ್ಯಮ (Medium)"
            value="medium"
            style={styles.dropdownLabel}
          />
          <Picker.Item
            label="ಮಂದ್ರ (Low)"
            value="low"
            style={styles.dropdownLabel}
          />
          <Picker.Item
            label="ತಾರಕ (high)"
            value="high"
            style={styles.dropdownLabel}
          />
        </Picker>
      </View>
      <View style={styles.dropdownContainer}>
        <Picker
          style={styles.dropdown}
          selectedValue={tempo}
          onValueChange={value => setTempo(value)}>
          <Picker.Item
            label="1ನೇ ಕಾಲ"
            value="4000"
            style={styles.dropdownLabel}
          />
          <Picker.Item
            label="2ನೇ ಕಾಲ"
            value="2000"
            style={styles.dropdownLabel}
          />
          <Picker.Item
            label="3ನೇ ಕಾಲ"
            value="1000"
            style={styles.dropdownLabel}
          />
          <Picker.Item
            label="4ನೇ ಕಾಲ"
            value="500"
            style={styles.dropdownLabel}
          />
        </Picker>
      </View>
      <View style={styles.container}>
        <View style={styles.row}>{renderUpBlocks().slice(0, 8)}</View>
        <View style={styles.row}>{renderDownBlocks().slice(0, 8)}</View>
        <TouchableOpacity
          style={styles.playButton}
          onPress={() => blinkBlocks('up')}>
          <Text style={styles.buttonText}>{'ಆರೋಹಣ (UP)'}</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.playButton}
          onPress={() => blinkBlocks('down')}>
          <Text style={styles.buttonText}> ಅವರೋಹಣ (Down)</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const createStyles = (colors: import('./theme').ThemeColors) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
      padding: 16,
    },
    button: {
      backgroundColor: colors.surface,
      padding: 12,
      borderRadius: 8,
      marginBottom: 16,
      borderWidth: 2,
      borderColor: colors.accent,
    },
    buttonText: {
      color: colors.textOnSurface,
      fontSize: 18,
      textAlign: 'center',
    },
    dropdownContainer: {
      backgroundColor: colors.surface,
      borderRadius: 8,
      marginBottom: 16,
      height: 40,
      paddingLeft: 10,
    },
    dropdown: {
      color: colors.accent,
    },
    dropdownLabel: {
      fontSize: 15,
      color: colors.accent,
    },
    row: {
      flexDirection: 'row',
    },
    block: {
      width: 35,
      height: 35,
      margin: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: colors.blockBackground,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: colors.accent,
    },
    blinkingBlock: {
      backgroundColor: colors.accent,
    },
    playButton: {
      marginTop: 20,
      padding: 10,
      backgroundColor: colors.surface,
      borderRadius: 5,
    },
    text: {
      fontSize: 16,
      color: colors.blockText,
    },
    boldText: {
      fontWeight: 'bold',
    },
  });

export default Bhagavatha;
