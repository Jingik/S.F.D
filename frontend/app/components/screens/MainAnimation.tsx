import { useFocusEffect } from '@react-navigation/native';
import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet } from 'react-native';

export const MainAnimation = ({ navigation }: any) => {
  const [time, setTime] = useState(2500);

  useFocusEffect(
    useCallback(() => {
      setTime(2500);
      setTimeout(() => {
        navigation.navigate('LoginScreen');
      }, time);
    }, [navigation, time]),
  );

  return (
    <View style={[styles.flex, styles.setRowMiddle, styles.maxWidthHeight]}>
      <Text>메인 애니메이션</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  flex: {
    display: 'flex',
  },
  setRowMiddle: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  maxWidthHeight: {
    width: '100%',
    height: '100%',
  },
});
