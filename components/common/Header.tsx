import React from 'react';
import { View, Text } from 'react-native';

interface HeaderProps {
  title: string;
  children?: React.ReactNode;
}

export const Header: React.FC<HeaderProps> = ({ title, children }) => {
  return (
    <View className="px-4 pt-4 pb-2">
      <Text className="text-2xl font-bold text-gray-900 mb-4">
        {title}
      </Text>
      {children}
    </View>
  );
};