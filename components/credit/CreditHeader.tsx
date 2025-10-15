import React from 'react';
import { View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export const CreditHeader: React.FC = () => {
	return (
		<View className='flex-row items-center px-4 py-3 border-b border-gray-200'>
			<Ionicons name='card-outline' size={24} color='#000' />
			<Text className='text-xl font-semibold ml-2'>Customer Credit</Text>
		</View>
	);
};
