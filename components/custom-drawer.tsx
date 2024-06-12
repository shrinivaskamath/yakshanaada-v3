// CustomDrawerContent.js
import React from 'react';
import {
  DrawerContentScrollView,
  DrawerItemList,
  DrawerItem,
} from '@react-navigation/drawer';
import {View, Text, StyleSheet} from 'react-native';

const CustomDrawerContent = props => (
  <DrawerContentScrollView {...props} style={styles.container}>
    {/* <View style={styles.header}>
      <Text style={styles.headerText}>ಯಕ್ಷನಾದ</Text>
    </View> */}
    {/* <DrawerItemList {...props} labelStyle={styles.labelStyle} /> */}
    {props.state.routeNames.map((name, index) => (
      <DrawerItem
        key={index}
        label={name}
        labelStyle={styles.labelStyle}
        onPress={() => props.navigation.navigate(name)}
        focused={props.state.index === index}
        style={styles.drawerItem}
      />
    ))}
  </DrawerContentScrollView>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
  },
  labelStyle: {
    color: '#ffffff',
    fontSize: 16,
  },
});

export default CustomDrawerContent;
