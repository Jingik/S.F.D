import React from 'react';
import { Text, TouchableOpacity } from 'react-native';

interface PropsType {
  name: string;
  nav?: string;
}

export const Button = ({ name, nav }: PropsType) => {
  return (
    <TouchableOpacity>
      <Text>{name}</Text>
    </TouchableOpacity>
  );
};
