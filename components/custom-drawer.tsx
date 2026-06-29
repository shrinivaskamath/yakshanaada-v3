// CustomDrawerContent.js
import React from 'react';
import {
  DrawerContentScrollView,
  DrawerItem,
} from '@react-navigation/drawer';
import {View, StyleSheet} from 'react-native';
import {useTheme} from './theme';

const CustomDrawerContent = props => {
  const {theme, colors, toggleTheme} = useTheme();

  return (
    <DrawerContentScrollView
      {...props}
      style={[styles.container, {backgroundColor: colors.drawerBackground}]}>
      {props.state.routeNames.map((name, index) => (
        <DrawerItem
          key={index}
          label={name}
          labelStyle={[styles.labelStyle, {color: colors.drawerText}]}
          onPress={() => props.navigation.navigate(name)}
          focused={props.state.index === index}
          activeBackgroundColor={colors.drawerActiveBackground}
          style={styles.drawerItem}
        />
      ))}

      <View style={[styles.separator, {backgroundColor: colors.border}]} />

      <DrawerItem
        label={
          theme === 'dark'
            ? '\u2600\uFE0F  ಬೆಳಕು ಬರ್ಲಿ - Light theme'
            : '\u{1F319}  ಕತ್ತಲಾಗ್ಲಿ - Dark theme'
        }
        labelStyle={[styles.labelStyle, {color: colors.drawerText}]}
        onPress={toggleTheme}
        style={styles.drawerItem}
      />
    </DrawerContentScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  labelStyle: {
    fontSize: 16,
  },
  drawerItem: {},
  separator: {
    height: StyleSheet.hairlineWidth,
    marginVertical: 8,
    marginHorizontal: 16,
    opacity: 0.4,
  },
});

export default CustomDrawerContent;
