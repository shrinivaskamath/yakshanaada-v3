import React, {Component} from 'react';
import {
  View,
  Text,
  StatusBar,
  StyleSheet,
  PermissionsAndroid,
} from 'react-native';
import Tuner from './tuner';
import Note from './note';
import Meter from './meter';
import analytics from '@react-native-firebase/analytics';

export default class PitchDetector extends Component {
  state = {
    note: {
      name: 'A',
      octave: 4,
      frequency: 440,
    },
  };

  _update(note) {
    this.setState({note});
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

  render() {
    return (
      <View style={style.container}>
        <View style={style.body}>
          <StatusBar backgroundColor="#000" />
          <Meter cents={this.state.note.cents} />
          <Note {...this.state.note} />
          <Text style={style.frequency}>
            {this.state.note.frequency.toFixed(1)} Hz
          </Text>
        </View>
      </View>
    );
  }
}

const style = StyleSheet.create({
  body: {
    flex: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  frequency: {
    fontSize: 28,
    color: '#37474f',
  },
  container: {
    flex: 1,
    padding: 16,
  },
});
