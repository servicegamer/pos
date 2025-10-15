import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { CreditRatingBadge } from './CreditRatingBadge';
import { Customer } from '@/types';

interface CustomerCreditItemProps {
	customer: Customer;
	onPress?: (customer: Customer) => void;
}

export const CustomerCreditItem: React.FC<CustomerCreditItemProps> = ({ customer, onPress }) => {
	const getDaysLeftColor = (daysLeft: number) => {
		if (daysLeft <= 1) return 'text-red-500';
		if (daysLeft <= 3) return 'text-orange-500';
		return 'text-green-500';
	};

	const fullName = `${customer.firstName} ${customer.lastName}`;

	return (
		<TouchableOpacity
			className='flex-row items-center justify-between py-4 border rounded-lg px-3 mb-2 border-gray-200'
			onPress={() => onPress?.(customer)}>
			<View className='flex-row items-center flex-1'>
				<View className='w-10 h-10 bg-gray-200 rounded-full items-center justify-center mr-3'>
					<Ionicons name='person-outline' size={20} color='#666' />
				</View>
				<View className='flex-1'>
					<View className='flex-row items-center mb-1'>
						<Text className='font-semibold text-base mr-2'>{fullName}</Text>
						<CreditRatingBadge rating={customer.rating} />
					</View>
					<Text className='text-sm text-gray-500'>Due: {customer.dueDate}</Text>
				</View>
			</View>
			<View className='items-end'>
				<Text className='font-semibold text-base mb-1'>${customer.amount.toFixed(2)}</Text>
				<Text className={`text-xs font-medium ${getDaysLeftColor(customer.daysLeft)}`}>
					{customer.daysLeft} day{customer.daysLeft !== 1 ? 's' : ''} left
				</Text>
			</View>
		</TouchableOpacity>
	);
};
