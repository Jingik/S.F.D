import { useFocusEffect } from '@react-navigation/native';
import React, { useCallback, useState } from 'react';
import {
  Alert,
  BackHandler,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import styles from '@components/common/styles';

export const LoginScreen = ({ navigation }: any) => {
  const [email, onChangeEmail] = useState('');
  const [pw, onChangePw] = useState('');

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
    <View
      style={[
        styles.BGWhite,
        styles.flex,
        styles.flex1,
        styles.center,
        styles.maxWidthHeight,
      ]}
    >
      {/* 제목 */}
      <View style={[styles.flex2, styles.center]}>
        <Text style={styles.titleFont}>SFD</Text>
      </View>

      {/* 로그인 입력 창 */}
      <View style={styles.flex0_5} />
      <View style={[styles.maxWidthHeight, styles.center, styles.flex2]}>
        <TextInput
          style={[
            customStyles.input,
            customStyles.upperInput,
            styles.fontSize20,
          ]}
          onChangeText={onChangeEmail}
          value={email}
          placeholder="이메일"
          keyboardType="email-address"
        />
        <TextInput
          style={[
            customStyles.input,
            customStyles.bottomInput,
            styles.fontSize20,
          ]}
          onChangeText={onChangePw}
          value={pw}
          placeholder="비밀번호"
          secureTextEntry={true}
          keyboardType="default"
        />
      </View>
      <View style={styles.flex0_5} />

      {/* 버튼 영역 */}
      <View style={[styles.flex2, styles.center, styles.maxWidthHeight]}>
        {/* 임시로 로그인 처리 */}
        <TouchableOpacity
          onPress={() => navigation.navigate('DetectDefect')}
          style={[customStyles.loginButton, styles.flex2]}
        >
          <Text style={[styles.buttonFont]}>로그인</Text>
        </TouchableOpacity>
        <View style={styles.flex0_5} />
        <TouchableOpacity
          onPress={() => navigation.navigate('RegisterScreen')}
          style={styles.flex2}
        >
          <Text style={[customStyles.underLine, styles.fontSize20]}>
            회원가입
          </Text>
        </TouchableOpacity>
      </View>

      {/* 하단 앱 종료 버튼 */}
      <View style={styles.flex1} />
      <TouchableOpacity onPress={handleExitApp} style={customStyles.button}>
        <Text style={customStyles.text}>앱 종료</Text>
      </TouchableOpacity>
      <View style={styles.flex0_5} />
    </View>
  );
};

const customStyles = StyleSheet.create({
  loginButton: {
    justifyContent: 'center',
    alignItems: 'center',
    width: '35%',
    borderRadius: 15,
    backgroundColor: '#148EE6',
  },
  button: {
    display: 'flex',
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    width: '20%',
    borderRadius: 100,
    backgroundColor: '#E36161',
  },
  text: {
    color: 'white',
    fontWeight: '700',
    fontSize: 30,
  },
  underLine: {
    textDecorationLine: 'underline',
  },
  input: {
    borderStyle: 'solid',
    borderWidth: 1.5,
    borderColor: '#999999',
    width: '35%',
    padding: 20,
    fontWeight: '600',
  },
  upperInput: {
    borderTopRightRadius: 10,
    borderTopLeftRadius: 0,
    borderBottomRightRadius: 10,
    borderBottomLeftRadius: 0,
  },
  bottomInput: {
    borderTopRightRadius: 0,
    borderTopLeftRadius: 10,
    borderBottomRightRadius: 0,
    borderBottomLeftRadius: 10,
    borderTopWidth: 0,
  },
});
