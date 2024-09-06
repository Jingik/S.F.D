// App.tsx
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';

import { MainAnimation } from './components/screens/MainAnimation';
import { LoginScreen } from './components/screens/LoginScreen';
import { CameraScreen } from './components/camera/CameraScreen';
import { StyleSheet, View } from 'react-native';

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
          name="DefectDetect"
          component={CameraScreen}
          options={{
            title: '불량 검출',
            // Header 블록에 대한 스타일
            headerStyle: {
              backgroundColor: '#ffb625',
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

const styles = StyleSheet.create({
  none: {
    display: 'none',
  },
});

export default App;
