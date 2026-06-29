// index.js
import 'react-native-gesture-handler'; // <- MUST be first import, before any other imports
import React from 'react';
import {AppRegistry} from 'react-native';
import {GestureHandlerRootView} from 'react-native-gesture-handler';
import App from './App';
import {name as appName} from './app.json';

const Root = () => (
  <GestureHandlerRootView style={{flex: 1}}>
    <App />
  </GestureHandlerRootView>
);

AppRegistry.registerComponent(appName, () => Root);
