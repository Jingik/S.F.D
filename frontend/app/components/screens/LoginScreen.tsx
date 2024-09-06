import { useFocusEffect } from '@react-navigation/native';
import React, { useCallback } from 'react';
import {
  Alert,
  BackHandler,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

export const LoginScreen = ({ navigation }: any) => {
  const handleExitApp = () => {
    Alert.alert(
      '앱 종료',
      '앱을 종료하시겠습니까?',
      [
        {
          text: '취소',
          onPress: () => {
            // Do nothing
          },
          style: 'cancel',
        },
        { text: '종료', onPress: () => BackHandler.exitApp() },
      ],
      { cancelable: false },
    );
  };

  useFocusEffect(
    useCallback(() => {
      const onBackPress = () => {
        Alert.alert(
          '앱 종료',
          '앱을 종료하시겠습니까?',
          [
            {
              text: '취소',
              onPress: () => {
                // Do nothing
              },
              style: 'cancel',
            },
            { text: '종료', onPress: () => BackHandler.exitApp() },
          ],
          { cancelable: true },
        );

        // 뒤로 가기 기본 동작을 막음
        return true;
      };

      // 뒤로가기 버튼 이벤트 리스너 등록
      const backHandler = BackHandler.addEventListener(
        'hardwareBackPress',
        onBackPress,
      );

      // 포커스가 해제되면 리스너 제거
      return () => backHandler.remove();
    }, []),
  );

  return (
    <View style={[styles.flex, styles.center, styles.maxWidthHeight]}>
      <Text>로그인 화면</Text>
      {/* 임시로 로그인 처리 */}
      <TouchableOpacity onPress={() => navigation.navigate('DefectDetect')}>
        <Text>로그인</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => navigation.navigate('Register')}>
        <Text>회원가입</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={handleExitApp}>
        <Text>앱 종료</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  flex: {
    display: 'flex',
  },
  center: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  row: {
    flexDirection: 'row',
  },
  maxWidthHeight: {
    width: '100%',
    height: '100%',
  },
});
