import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  Animated,
  Easing,
} from 'react-native';
import {useNavigation, DrawerActions} from '@react-navigation/native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {useTheme} from './theme';
import {usePlayback} from './playback';

const Header = () => {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const {colors} = useTheme();
  const {isPlaying} = usePlayback();

  // Zoom that scales up and holds while playing.
  const pulse = React.useRef(new Animated.Value(0)).current;
  // Faster side-to-side tilt that reads like the Indian head bobble.
  const nod = React.useRef(new Animated.Value(0.5)).current;

  React.useEffect(() => {
    if (isPlaying) {
      // Zoom in and stay zoomed (no pulse back out).
      const zoomIn = Animated.timing(pulse, {
        toValue: 1,
        duration: 300,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      });

      // Smooth left-right-left wobble around centre, like a head bobble.
      const nodLoop = Animated.loop(
        Animated.sequence([
          Animated.timing(nod, {
            toValue: 1,
            duration: 247,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: true,
          }),
          Animated.timing(nod, {
            toValue: 0,
            duration: 247,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: true,
          }),
          Animated.timing(nod, {
            toValue: 0.5,
            duration: 210,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: true,
          }),
        ]),
      );

      zoomIn.start();
      nodLoop.start();
      return () => {
        zoomIn.stop();
        nodLoop.stop();
      };
    }
    // Smoothly settle back to the resting state when playback stops.
    Animated.parallel([
      Animated.timing(pulse, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(nod, {
        toValue: 0.5,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start();
    return undefined;
  }, [isPlaying, pulse, nod]);

  const scale = pulse.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 1.18],
  });
  const rotate = nod.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: ['-9deg', '0deg', '9deg'],
  });

  return (
    <View
      style={[
        styles.header,
        {paddingTop: insets.top, backgroundColor: colors.headerBackground},
      ]}>
      <TouchableOpacity
        onPress={() => navigation.dispatch(DrawerActions.toggleDrawer())}
        style={styles.menuButton}>
        <Text style={[styles.menuIcon, {color: colors.headerIcon}]}>☰</Text>
      </TouchableOpacity>
      <Animated.Image
        source={require('../assets/yn-icon.png')}
        style={[styles.logo, {transform: [{scale}, {rotate}]}]}
      />
      <View style={styles.textContainer}>
        <Text style={[styles.title, {color: colors.accent}]}>ಯಕ್ಷನಾದ</Text>
        <Text style={styles.tagline}>ಯಕ್ಷಧ್ರುವ ಪಟ್ಲಾಭಿಮಾನಿ</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    minHeight: 80,
  },
  menuButton: {
    marginRight: 5,
    padding: 5,
  },
  menuIcon: {
    fontSize: 28,
    fontWeight: '300',
  },
  logo: {
    width: 80,
    height: 80,
    marginRight: 10,
  },
  textContainer: {
    flexDirection: 'column',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  tagline: {
    fontSize: 14,
    color: 'gray',
  },
});

export default Header;
