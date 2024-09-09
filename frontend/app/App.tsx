// App.tsx
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';

import { MainAnimation } from '@screens/MainAnimation';
import { LoginScreen } from '@screens/LoginScreen';
import { RegisterScreen } from '@screens/RegisterScreen';
import { CameraScreen } from '@components/camera/CameraScreen';
import { View } from 'react-native';
import styles from '@/components/common/styles';

const Stack = createStackNavigator();
const EmptyHeaderLeft = () => <View style={styles.none} />;

export const App = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Home">
        <Stack.Screen
          name="Home"
          component={MainAnimation}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="LoginScreen"
          component={LoginScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="RegisterScreen"
          component={RegisterScreen}
          options={{
            headerTitle: '회원 가입',
            headerTitleAlign: 'center',
            headerStyle: {
              backgroundColor: 'white',
            },
            headerStatusBarHeight: 36,
            headerTintColor: '#333333',
            headerTitleStyle: {
              fontWeight: 'bold',
              fontSize: 36,
            },
          }}
        />
        <Stack.Screen
          name="DetectDefect"
          component={CameraScreen}
          options={{
            title: '불량 검출',
            // Header 블록에 대한 스타일
            headerStyle: {
              backgroundColor: '#555555',
            },
            // Header의 텍스트, 버튼 색상
            headerTintColor: '#ffffff',
            // 타이틀 텍스트의 스타일
            headerTitleStyle: {
              fontWeight: 'bold',
              fontSize: 20,
            },
            headerLeft: () => <EmptyHeaderLeft />,
          }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default App;
