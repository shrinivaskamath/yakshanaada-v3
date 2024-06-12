import React, {useEffect} from 'react';
import 'react-native-gesture-handler';
import {NavigationContainer} from '@react-navigation/native';
import {createDrawerNavigator} from '@react-navigation/drawer';
import {enableScreens} from 'react-native-screens';
import YakshaShruthi from './components/yaksha-shruthi';
import TanpuraP from './components/tanpura-p';
import TanpuraM from './components/tanpura-m';
import Bhagavatha from './components/bhagavatha';
import PitchDetector from './components/tuner/pitchdetector';
import Header from './components/header';
import firebase from '@react-native-firebase/app';
import analytics from '@react-native-firebase/analytics';
import CustomDrawerContent from './components/custom-drawer'; // Import Custom Drawer

enableScreens();

const Drawer = createDrawerNavigator();

export const DarkTheme = {
  dark: true,
  colors: {
    primary: 'gray',
    background: '#121212',
    card: '#1f1f1f',
    text: '#ffffff',
    border: '#272727',
    notification: '#ff453a',
  },
};

function MyDrawer() {
  return (
    <Drawer.Navigator
      initialRouteName="Home"
      drawerContent={props => <CustomDrawerContent {...props} />}>
      <Drawer.Screen
        name="ಯಕ್ಷಶ್ರುತಿ - Yaksha Shruthi"
        component={YakshaShruthi}
        options={{header: props => <Header {...props} />}}
      />
      <Drawer.Screen
        name="ತಾನ್ಪುರ ಮ - Tanpura Ma"
        component={TanpuraM}
        options={{header: props => <Header {...props} />}}
      />
      <Drawer.Screen
        name="ತಾನ್ಪುರ ಪ - Tanpura Pa"
        component={TanpuraP}
        options={{header: props => <Header {...props} />}}
      />
      <Drawer.Screen
        name="ಯಕ್ಷ ಭಾಗವತ - Bhagavatha"
        component={Bhagavatha}
        options={{header: props => <Header {...props} />}}
      />
      <Drawer.Screen
        name="ಶೃತಿ ಪರೀಕ್ಷೆ- Pitch detector"
        component={PitchDetector}
        options={{header: props => <Header {...props} />}}
      />
    </Drawer.Navigator>
  );
}

export default function App() {
  useEffect(() => {
    try {
      if (!firebase.apps.length) {
        firebase.initializeApp({
          apiKey: 'AIzaSyBbGz5q9sSf-l93jpvjqa8yZC-44ZmkvpQ',
          projectId: 'yakshanaadav3',
          storageBucket: 'yakshanaadav3.appspot.com',
          appId: '1:720971405897:android:49ee553f1377da731f3d98',
        });
      } else {
        // firebase.app(); // if already initialized, use that one
      }
      // Log an event to test the setup
      analytics().logEvent('app_open', {
        /* custom event parameters */
      });
    } catch (error) {
      console.error('Firebase initialization error:', error);
    }
  }, []);

  return (
    <NavigationContainer theme={DarkTheme}>
      <MyDrawer />
    </NavigationContainer>
  );
}
