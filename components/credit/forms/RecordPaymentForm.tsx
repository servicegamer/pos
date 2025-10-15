import React from 'react';
import { View, Text, TextInput, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { CustomerSuggestionDropdown } from '../CustomerSuggestionDropdown';
import { ActionButton } from '@/components/ui/ActionButton';
import { CheckCircle } from 'lucide-react-native';

interface RecordPaymentFormProps {
	customerName: string;
	onCustomerNameChange: (name: string) => void;
	amountPaid: string;
	onAmountPaidChange: (amount: string) => void;
	showSuggestions: boolean;
	suggestedCustomers: any[];
	onSelectCustomer: (customer: any) => void;
	onRecord: () => void;
}

export const RecordPaymentForm: React.FC<RecordPaymentFormProps> = ({
	customerName,
	onCustomerNameChange,
	amountPaid,
	onAmountPaidChange,
	showSuggestions,
	suggestedCustomers,
	onSelectCustomer,
	onRecord,
}) => {
	return (
		<View className='p-4 border-b border-gray-200'>
			<Text className='text-lg font-semibold mb-4'>Record Paid Credit</Text>
			<View className='flex-row justify-between mb-4'>
				<View className='flex-1 mr-2'>
					<Text className='text-sm text-gray-600 mb-2'>Customer Name</Text>
					<View className='relative'>
						<View className='flex-row items-center bg-gray-100 rounded-lg px-3 py-3'>
							<Ionicons name='person-outline' size={18} color='#666' />
							<TextInput
								className='flex-1 ml-2 text-base'
								placeholder='Sam'
								value={customerName}
								onChangeText={onCustomerNameChange}
							/>
						</View>

						{showSuggestions && customerName && (
							<CustomerSuggestionDropdown
								customers={suggestedCustomers}
								onSelectCustomer={onSelectCustomer}
							/>
						)}
					</View>
				</View>

				<View className='flex-1 ml-2'>
					<Text className='text-sm text-gray-600 mb-2'>Amount Paid</Text>
					<View className='flex-row items-center bg-gray-100 rounded-lg px-3 py-3'>
						<Text className='text-gray-600'>$</Text>
						<TextInput
							className='flex-1 ml-2 text-base'
							placeholder='20'
							value={amountPaid}
							onChangeText={onAmountPaidChange}
							keyboardType='numeric'
						/>
					</View>
				</View>
			</View>

			{amountPaid && (
				<ActionButton
					text='Record'
					icon={CheckCircle}
					onPress={onRecord}
					variant='primary'
					size='md'
					fullWidth
				/>
			)}
		</View>
	);
};
