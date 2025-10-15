import React from 'react';
import { ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { Customer } from '@/types';

import { MOCK_TRANSACTIONS } from '@/constants/transactions';
import { CustomerDetailHeader } from '@/components/credit/details/CustomerDetailHeader';
import { CreditOverviewCard } from '@/components/credit/details/CreditOverviewCard';
import { TransactionHistory } from '@/components/credit/transaction/TransactionHistory';

const CustomerCreditDetailScreen: React.FC = () => {
	// Get customer data from route params
	const params = useLocalSearchParams();

	// Parse customer data from params
	const customer: Customer = {
		id: params.customerId as string,
		firstName: params.firstName as string,
		lastName: params.lastName as string,
		phoneNumber: params.phoneNumber as string,
		amount: parseFloat(params.amount as string),
		dueDate: params.dueDate as string,
		rating: params.rating as 'Low' | 'Medium' | 'Good',
		daysLeft: parseInt(params.daysLeft as string),
	};

	const fullName = `${customer.firstName} ${customer.lastName}`;

	// Calculate totals from transactions
	const totalCredits = MOCK_TRANSACTIONS.filter((t) => t.amount < 0).reduce(
		(sum, t) => sum + Math.abs(t.amount),
		0,
	);

	const totalPayments = MOCK_TRANSACTIONS.filter((t) => t.amount > 0).reduce(
		(sum, t) => sum + t.amount,
		0,
	);

	const handleBack = () => {
		router.back();
	};

	const handleDelete = () => {
		console.log('Delete customer:', customer.id);
		// Show confirmation dialog, then delete
		// TODO: Implement delete logic
		router.back();
	};

	const handleTransactionPress = (transaction: any) => {
		// Navigate to transaction detail screen
		router.push({
			pathname: '/credit/credit-transaction',
			params: {
				transactionId: transaction.id,
				type: transaction.type,
				date: transaction.date,
				amount: transaction.amount.toString(),
				customerId: customer.id,
				customerName: fullName,
			},
		});
	};

	return (
		<SafeAreaView className='flex-1 bg-gray-50'>
			<CustomerDetailHeader
				customerName={fullName}
				phoneNumber={customer.phoneNumber}
				rating={customer.rating}
				onBack={handleBack}
				onDelete={handleDelete}
			/>

			<ScrollView className='flex-1'>
				<CreditOverviewCard
					currentBalance={customer.amount}
					totalCredits={totalCredits}
					totalPayments={totalPayments}
					dueDate={customer.dueDate}
					daysLeft={customer.daysLeft}
				/>

				<TransactionHistory
					transactions={MOCK_TRANSACTIONS}
					onTransactionPress={handleTransactionPress}
				/>
			</ScrollView>
		</SafeAreaView>
	);
};

export default CustomerCreditDetailScreen;
