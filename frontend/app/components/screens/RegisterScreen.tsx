import React, { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { TextInput } from 'react-native-gesture-handler';
import { Button } from '@components/common/Button';
import styles from '@components/common/styles';
import { validateEmail, removeWhitespace } from '@components/common/util';

export const RegisterScreen = ({ navigation }: any) => {
  const [email, setEmail] = useState('');
  const [pw, onChangePw] = useState('');
  const [checkPw, onChangeCheckPw] = useState('');

  const onChangeEmail = () => {};

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
      <View style={styles.flex0_5} />

      {/* 회원정보 입력 영역 */}
      <View style={[styles.maxWidthHeight, styles.center, styles.flex4]}>
        <View style={[styles.flex1, styles.width35]}>
          <Text style={[customStyles.fontSetting, customStyles.alignSelfStart]}>
            이메일
          </Text>
          <TextInput
            style={[customStyles.input, styles.fontSize20]}
            onChangeText={onChangeEmail}
            value={email}
            placeholder="이메일"
            keyboardType="email-address"
          />
          <Text style={[customStyles.denyFontColor, customStyles.alignSelfEnd]}>
            중복체크
          </Text>
        </View>

        <View style={styles.flex1} />

        <View style={[styles.flex1, styles.width35]}>
          <Text style={[customStyles.fontSetting, customStyles.alignSelfStart]}>
            비밀번호
          </Text>
          <TextInput
            style={[customStyles.input, styles.fontSize20]}
            onChangeText={onChangePw}
            value={pw}
            placeholder="비밀번호"
            secureTextEntry={true}
            keyboardType="default"
          />
          <Text style={[customStyles.denyFontColor, customStyles.alignSelfEnd]}>
            영어 대소문자, 숫자, 특수문자 포함 10자 이상
          </Text>
        </View>

        <View style={styles.flex1} />

        <View style={[styles.flex1, styles.width35]}>
          <Text style={[customStyles.fontSetting, customStyles.alignSelfStart]}>
            비밀번호 확인
          </Text>
          <TextInput
            style={[customStyles.input, styles.fontSize20]}
            onChangeText={onChangeCheckPw}
            value={checkPw}
            placeholder="비밀번호를 한 번 더 입력해주세요"
            secureTextEntry={true}
            keyboardType="default"
          />
          <Text style={[customStyles.denyFontColor, customStyles.alignSelfEnd]}>
            비밀번호가 일치하지 않습니다
          </Text>
        </View>
      </View>

      <View style={styles.flex2} />

      <View style={[styles.flex1, styles.center, styles.maxWidthHeight]}>
        <Button
          name="회원가입"
          color="#aaaaaa"
          path="LoginScreen"
          navigation={navigation}
          isDisable={true}
        />
      </View>

      <View style={styles.flex0_5} />
    </View>
  );
};

const customStyles = StyleSheet.create({
  input: {
    borderStyle: 'solid',
    borderWidth: 1.5,
    borderColor: '#999999',
    padding: 20,
    fontWeight: '600',
    borderRadius: 10,
  },

  fontSetting: {
    color: '#333333',
    fontSize: 20,
    padding: 10,
  },
  acceptFontColor: {
    color: '#47C93C',
    padding: 5,
  },
  denyFontColor: {
    color: '#E32626',
    padding: 5,
  },

  alignSelfStart: {
    alignSelf: 'flex-start',
  },
  alignSelfEnd: {
    alignSelf: 'flex-end',
  },
});
