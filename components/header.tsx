import React from 'react';
import {View, Text, StyleSheet, Image, TouchableOpacity} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import Svg, {Path} from 'react-native-svg';

const Header = () => {
  const navigation = useNavigation();

  return (
    <View style={styles.header}>
      <TouchableOpacity
        onPress={() => navigation.toggleDrawer()}
        style={styles.menuButton}>
        <Svg
          width="30"
          height="30"
          viewBox="0 0 24 24"
          fill="none"
          stroke="white"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round">
          <Path d="M3 12h18M3 6h18M3 18h18" />
        </Svg>
      </TouchableOpacity>
      <Image source={require('../assets/yn-icon.png')} style={styles.logo} />
      <View style={styles.textContainer}>
        <Text style={styles.title}>ಯಕ್ಷನಾದ</Text>
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
    backgroundColor: '#000',
    height: 80, // Adjusted height to accommodate the tagline
  },
  menuButton: {
    marginRight: 5,
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
    color: '#961A1D',
  },
  tagline: {
    fontSize: 14,
    color: 'gray',
  },
});

export default Header;
