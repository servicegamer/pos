import React from 'react';
import { View, Text } from 'react-native';
import { Receipt, ShoppingCart } from 'lucide-react-native';

interface TransactionDetailsCardProps {
	amount: number;
	date: string;
	items: string[];
}

export const TransactionDetailsCard: React.FC<TransactionDetailsCardProps> = ({
	amount,
	date,
	items,
}) => {
	const isCredit = amount < 0;

	return (
		<View className='mx-4 mt-4 bg-white rounded-xl p-4 shadow-sm'>
			<View className='flex-row items-center justify-between mb-4 pb-4 border-b border-gray-200'>
				<View className='flex-row items-center'>
					<Receipt size={20} color='#000' />
					<Text className='text-base font-semibold ml-2'>
						{isCredit ? 'Credit' : 'Payment'}
					</Text>
				</View>
				<Text
					className={`text-2xl font-bold ${isCredit ? 'text-red-600' : 'text-green-600'}`}>
					{isCredit ? '-' : '+'}${Math.abs(amount).toFixed(2)}
				</Text>
			</View>

			<View className='flex-row items-center justify-between mb-4'>
				<Text className='text-sm text-gray-600 mb-1'>Date:</Text>
				<Text className='text-base font-medium'>{date}</Text>
			</View>

			{items.length > 0 && (
				<View>
					<View className='flex-row items-center mb-3'>
						<ShoppingCart size={18} color='#000' />
						<Text className='text-base font-semibold ml-2'>Items Purchased</Text>
					</View>
					{items.map((item, index) => (
						<View key={index} className='bg-red-50 rounded-lg px-4 py-3 mb-2'>
							<Text className='text-base text-gray-800'>{item}</Text>
						</View>
					))}
				</View>
			)}
		</View>
	);
};
