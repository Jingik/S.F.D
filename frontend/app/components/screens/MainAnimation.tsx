import { useFocusEffect } from '@react-navigation/native';
import React, { useState, useCallback } from 'react';
import { View, Text } from 'react-native';
import styles from '@/components/common/styles';

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
    <View
      style={[
        styles.BGWhite,
        styles.flex,
        styles.row,
        styles.between,
        styles.maxWidthHeight,
      ]}
    >
      <Text>메인 애니메이션</Text>
    </View>
  );
};
