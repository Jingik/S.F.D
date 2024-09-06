import React from 'react';
import {
  Alert,
  BackHandler,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

export const RegisterScreen = ({ navigation }: any) => {
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
