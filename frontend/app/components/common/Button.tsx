import React from 'react';
import { StyleSheet, Text, TouchableOpacity } from 'react-native';

interface PropsType {
  name: string;
  color: string;
  path?: string;
  navigation?: any;
  isDisable?: boolean;
}

export const Button = ({
  name,
  color,
  path,
  navigation,
  isDisable,
}: PropsType) => {
  return (
    <TouchableOpacity
      onPress={() => {
        if (path && navigation) {
          return navigation.navigate(path);
        }
      }}
      style={[customStyles.button, { backgroundColor: color }]}
      disabled={isDisable}
    >
      <Text style={customStyles.text}>{name}</Text>
    </TouchableOpacity>
  );
};

const customStyles = StyleSheet.create({
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
});
