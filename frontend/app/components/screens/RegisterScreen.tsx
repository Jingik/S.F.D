import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { TextInput } from 'react-native-gesture-handler';
import { Button } from '@components/common/Button';
import styles from '@components/common/styles';
import {
  validateEmail,
  removeWhitespace,
  validatePassword,
  axiosSecurity,
} from '@components/common/util';

export const RegisterScreen = ({ navigation }: any) => {
  const [email, setEmail] = useState('');
  const [emailMessage, setEmailMessage] = useState('');
  const [pw, setPw] = useState('');
  const [pwMessage, setPwMessage] = useState('');
  const [checkPw, setCheckPw] = useState('');
  const [checkPwMessage, setCheckPwMessage] = useState('');
  const [isDisable, setIsDisable] = useState(true);

  // 이메일 입력 체크
  function onChangeEmail(value: string) {
    const trimEmail = removeWhitespace(value);
    setEmail(trimEmail);
    setEmailMessage(() => {
      if (!validateEmail(trimEmail)) {
        return '이메일 형식을 확인해주세요';
      }
      // if (checkDuplicateEmail(trimEmail)) {
      //   return '중복된 이메일입니다';
      // }
      return '사용 가능한 이메일입니다.';
    });
  }

  // 이메일 중복 체크
  function checkDuplicateEmail(trimEmail: string) {
    axiosSecurity.get('/', { email: trimEmail }).then((response: any) => {
      console.log(response);
      // return response.data;
    });
    return true;
  }

  // 비밀번호 입력 체크
  function onChangePw(value: string) {
    const trimPassWord = removeWhitespace(value);
    setPw(trimPassWord);
    setPwMessage(
      validatePassword(trimPassWord)
        ? ''
        : '영어 대소문자, 숫자, 특수문자 포함 8자 이상',
    );
  }

  // 비밀번호 확인 입력 체크
  function onChangeCheckPw(value: string) {
    const trimCheckPW = removeWhitespace(value);
    setCheckPw(trimCheckPW);
    setCheckPwMessage(() =>
      pw === trimCheckPW ? '' : '비밀번호가 일치하지 않습니다.',
    );
  }

  // 회원가입 버튼 활성화 & 비활성화 감지
  useEffect(() => {
    // 회원가입 버튼 활성화 & 비활성화
    function checkDisable() {
      if (
        emailMessage === '사용 가능한 이메일입니다.' &&
        pwMessage === '' &&
        checkPwMessage === '' &&
        email !== '' &&
        pw !== '' &&
        checkPw !== '' &&
        pw === checkPw
      ) {
        setIsDisable(false);
      } else {
        setIsDisable(true);
      }
    }

    checkDisable();
  }, [email, emailMessage, pw, pwMessage, checkPw, checkPwMessage]);

  // 서버로 회원 정보 보내기
  function onPressAction() {
    const user = {
      email: email,
      name: '',
      nickname: '',
      password: pw,
    };

    axiosSecurity
      .post('/', user)
      .then((response: any) => {
        console.log(response);
      })
      .then(navigation.navigate('LoginScreen'))
      .catch((e: any) => {
        console.error('회원 정보 보내기 에러발생: ' + e);
      });
  }

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
            {emailMessage}
          </Text>
        </View>

        <View style={styles.flex1} />

        <View style={[styles.flex1, styles.width35]}>
          <Text style={[customStyles.fontSetting, customStyles.alignSelfStart]}>
            비밀번호
          </Text>
          <TextInput
            style={[customStyles.input, styles.fontSize20]}
            secureTextEntry={true}
            onChangeText={onChangePw}
            value={pw}
            placeholder="비밀번호"
            keyboardType="default"
          />
          <Text style={[customStyles.denyFontColor, customStyles.alignSelfEnd]}>
            {pwMessage}
          </Text>
        </View>

        <View style={styles.flex1} />

        <View style={[styles.flex1, styles.width35]}>
          <Text style={[customStyles.fontSetting, customStyles.alignSelfStart]}>
            비밀번호 확인
          </Text>
          <TextInput
            style={[customStyles.input, styles.fontSize20]}
            secureTextEntry={true}
            onChangeText={onChangeCheckPw}
            value={checkPw}
            keyboardType="default"
            placeholder="비밀번호를 한 번 더 입력해주세요"
          />
          <Text style={[customStyles.denyFontColor, customStyles.alignSelfEnd]}>
            {checkPwMessage}
          </Text>
        </View>
      </View>

      <View style={styles.flex2} />

      <View style={[styles.flex1, styles.center, styles.maxWidthHeight]}>
        <TouchableOpacity
          onPress={onPressAction}
          style={
            isDisable
              ? [customStyles.backgroundDeny, customStyles.button]
              : [customStyles.backgroundAccept, customStyles.button]
          }
          disabled={isDisable}
        >
          <Text style={customStyles.text}>회원가입</Text>
        </TouchableOpacity>
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

  button: {
    display: 'flex',
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    width: '20%',
    borderRadius: 100,
  },
  text: {
    color: 'white',
    fontWeight: '700',
    fontSize: 30,
  },

  backgroundDeny: {
    backgroundColor: '#AAAAAA',
  },
  backgroundAccept: {
    backgroundColor: '#148EE6',
  },
});
