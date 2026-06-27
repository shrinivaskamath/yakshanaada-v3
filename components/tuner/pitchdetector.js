import React, {Component} from 'react';
import {
  View,
  Text,
  StatusBar,
  StyleSheet,
  PermissionsAndroid,
  Platform,
  ScrollView,
} from 'react-native';
import Tuner from './tuner';
import HarmoniumKeyboard from './harmonium';
import PitchTimeline from './pitch-timeline';
import analytics from '@react-native-firebase/analytics';
import ThemeContext from '../theme';

export default class PitchDetector extends Component {
  static contextType = ThemeContext;

  state = {
    note: {
      name: 'A',
      octave: 4,
      frequency: 440,
      cents: 0,
    },
    lastDetected: 0,
  };

  _update(note) {
    this.setState({note, lastDetected: Date.now()});
  }

  getShruthiKannada(name) {
    const normalized = String(name)
      .replace('♯', '#')
      .replace('♭', 'b')
      .toUpperCase();
    const mapping = {
      C: 'ಬಿಳಿ 1',
      'C#': 'ಕಪ್ಪು 1',
      D: 'ಬಿಳಿ 2',
      'D#': 'ಕಪ್ಪು 2',
      E: 'ಬಿಳಿ 3',
      F: 'ಬಿಳಿ 4',
      'F#': 'ಕಪ್ಪು 3',
      G: 'ಬಿಳಿ 5',
      'G#': 'ಕಪ್ಪು 4',
      A: 'ಬಿಳಿ 6',
      'A#': 'ಕಪ್ಪು 5',
      B: 'ಬಿಳಿ 7',
    };
    return mapping[normalized] || name;
  }

  getOctaveKannada(octave) {
    const mapping = {
      2: 'ಮಂದ್ರ',
      3: 'ಮಧ್ಯಮ',
      4: 'ತಾರಕ',
    };
    return mapping[octave] || String(octave);
  }

  async componentDidMount() {
    analytics().logEvent('Shruti_check_start');
    if (Platform.OS === 'android') {
      await PermissionsAndroid.requestMultiple([
        PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
      ]);
    }

    const tuner = new Tuner();
    tuner.start();
    tuner.onNoteDetected = note => {
      if (this._lastNoteName === note.name) {
        this._update(note);
      } else {
        this._lastNoteName = note.name;
      }
    };
  }

  componentWillUnmount() {
    // No orientation unlocking needed since we didn't lock it
  }

  render() {
    const {name, octave, frequency} = this.state.note;
    const shruthi = this.getShruthiKannada(name);
    const octaveText = this.getOctaveKannada(octave);
    const labelText = `${name} (${octave}) - ${shruthi} - ${octaveText}`;
    const colors = this.context.colors;
    const style = createStyles(colors);

    return (
      <View style={style.container}>
        <StatusBar backgroundColor={colors.statusBar} />
        <View style={style.labelSection}>
          <Text style={style.labelText}>
            <Text style={style.labelRed}>{labelText}</Text>
            <Text style={style.labelFrequency}>
              {' '}
              - {frequency.toFixed(1)} Hz
            </Text>
          </Text>
        </View>
        <ScrollView
          style={style.monitorScroll}
          contentContainerStyle={style.monitorContent}
          showsVerticalScrollIndicator={false}>
          <View style={style.monitorRow}>
            <View style={style.timelineSection}>
              <PitchTimeline
                note={this.state.note}
                lastDetected={this.state.lastDetected}
              />
            </View>
            <View style={style.keyboardSection}>
              <HarmoniumKeyboard activeNote={this.state.note} />
            </View>
          </View>
        </ScrollView>
      </View>
    );
  }
}

const createStyles = colors =>
  StyleSheet.create({
    container: {
      flex: 1,
      flexDirection: 'column',
      backgroundColor: colors.background,
      paddingHorizontal: 0,
      paddingVertical: 8,
    },
    labelSection: {
      height: 50,
      justifyContent: 'center',
      alignItems: 'center',
      paddingVertical: 8,
    },
    labelText: {
      fontSize: 14,
      fontWeight: '600',
      textAlign: 'center',
    },
    labelRed: {
      color: colors.accent,
    },
    labelFrequency: {
      color: colors.text,
    },
    monitorScroll: {
      flex: 1,
    },
    monitorContent: {
      flexGrow: 1,
    },
    monitorRow: {
      flexDirection: 'row',
      alignItems: 'flex-start',
    },
    timelineSection: {
      flex: 1,
    },
    keyboardSection: {
      width: 90,
      alignItems: 'center',
      borderLeftWidth: 1,
      borderLeftColor: colors.border,
      paddingHorizontal: 2,
    },
  });
