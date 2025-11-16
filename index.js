// index.js (temporary safe debug version)
import {AppRegistry} from 'react-native';
import App from './App';
import TrackPlayer from 'react-native-track-player';
import {name as appName} from './app.json';

// register app first so a failed module doesn't block this step
AppRegistry.registerComponent(appName, () => App);

// Debug — print what TrackPlayer exports
try {
  console.log('--- TRACKPLAYER DEBUG START ---');
  console.log('TrackPlayer is', !!TrackPlayer);
  console.log('TrackPlayer keys:', Object.keys(TrackPlayer || {}));
  console.log(
    'typeof TrackPlayer.registerPlaybackService =',
    typeof (TrackPlayer && TrackPlayer.registerPlaybackService),
  );
  console.log('--- TRACKPLAYER DEBUG END ---');
} catch (e) {
  console.error('Error while introspecting TrackPlayer:', e);
}

// Only call registerPlaybackService if it exists
try {
  if (
    TrackPlayer &&
    typeof TrackPlayer.registerPlaybackService === 'function'
  ) {
    TrackPlayer.registerPlaybackService(() => require('./trackPlayerService'));
    console.log('registerPlaybackService called OK');
  } else {
    console.warn(
      'registerPlaybackService NOT available — skipping registration.',
    );
  }
} catch (err) {
  console.error('Error calling registerPlaybackService:', err);
}
