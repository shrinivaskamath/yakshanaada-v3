import React, {PureComponent} from 'react';
import {Text, StyleSheet, TouchableOpacity, View} from 'react-native';
import {
  OCTAVES,
  KEY_HEIGHT,
  KEY_MARGIN,
  TOTAL_HEIGHT,
} from './pitch-layout';

const KEY_WIDTH = 78;

const NATURAL_KEYS = ['C', 'D', 'E', 'F', 'G', 'A', 'B'];
const SHARP_KEYS = [
  {name: 'C♯', between: 0},
  {name: 'D♯', between: 1},
  {name: 'F♯', between: 3},
  {name: 'G♯', between: 4},
  {name: 'A♯', between: 5},
];

// Plain (non-scrolling) vertical key column. It is rendered inside a shared
// ScrollView together with the pitch timeline so both stay perfectly aligned.
export default class HarmoniumKeyboard extends PureComponent {
  static defaultProps = {
    octaves: OCTAVES,
    activeNote: {name: 'A', octave: 4},
    onKeyPress: null,
  };

  render() {
    const {activeNote, octaves} = this.props;

    const allKeys = [];
    octaves.forEach(octave => {
      NATURAL_KEYS.forEach((noteName, idx) => {
        const isActive =
          activeNote &&
          activeNote.octave === octave &&
          noteName === activeNote.name;
        allKeys.push({
          type: 'natural',
          noteName,
          octave,
          isActive,
          key: `${noteName}${octave}`,
        });

        const sharpKey = SHARP_KEYS.find(sk => sk.between === idx);
        if (sharpKey) {
          const isSharpActive =
            activeNote &&
            activeNote.octave === octave &&
            sharpKey.name === activeNote.name;
          allKeys.push({
            type: 'sharp',
            noteName: sharpKey.name,
            octave,
            isActive: isSharpActive,
            key: `${sharpKey.name}${octave}`,
          });
        }
      });
    });

    return (
      <View style={styles.container}>
        {allKeys.map(keyData => (
          <TouchableOpacity
            key={keyData.key}
            style={[
              styles.key,
              keyData.type === 'sharp' ? styles.keySharp : styles.keyNatural,
              keyData.isActive &&
                (keyData.type === 'sharp'
                  ? styles.keySharpActive
                  : styles.keyNaturalActive),
            ]}
            onPress={() => {
              if (this.props.onKeyPress) {
                this.props.onKeyPress({
                  name: keyData.noteName,
                  octave: keyData.octave,
                });
              }
            }}>
            <Text
              style={
                keyData.isActive
                  ? [styles.keyText, styles.keyTextActive]
                  : keyData.type === 'sharp'
                  ? [styles.keyText, styles.keyTextSharp]
                  : styles.keyText
              }>
              {keyData.noteName}
              <Text style={styles.octaveText}>{keyData.octave}</Text>
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    height: TOTAL_HEIGHT,
    backgroundColor: '#ffffff',
  },
  key: {
    width: KEY_WIDTH,
    height: KEY_HEIGHT,
    marginVertical: KEY_MARGIN,
    marginHorizontal: 2,
    borderRadius: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  keyNatural: {
    backgroundColor: '#ffffff',
    borderWidth: 0.5,
    borderColor: '#cfd8dc',
  },
  keySharp: {
    width: KEY_WIDTH,
    height: KEY_HEIGHT,
    backgroundColor: '#000000',
    borderWidth: 0.5,
    borderColor: '#111111',
  },
  keyNaturalActive: {
    backgroundColor: '#c62828',
    borderColor: '#b71c1c',
  },
  keySharpActive: {
    backgroundColor: '#8b0000',
    borderColor: '#b71c1c',
  },
  keyText: {
    fontSize: 9,
    color: '#37474f',
    fontWeight: '600',
  },
  keyTextActive: {
    color: '#fff',
  },
  keyTextSharp: {
    color: '#fff',
  },
  octaveText: {
    fontSize: 4,
    color: '#37474f',
    fontWeight: '600',
  },
});
