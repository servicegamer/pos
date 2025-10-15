import React from 'react';
import { ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { TransactionDetailHeader } from '@/components/credit/transaction/TransactionDetailHeader';
import { TransactionDetailsCard } from '@/components/credit/transaction/TransactionDetailsCard';
import { useTransactionPayment } from '@/hooks/useTransactionPayment';
import { MakePaymentForm } from '@/components/credit/transaction/forms/MakePaymentForm';

export const TransactionDetailScreen: React.FC = () => {
	// Get transaction data from route params
	const params = useLocalSearchParams();

	const transactionId = params.transactionId as string;
	const transactionType = params.type as 'Purchase' | 'Payment';
	const date = params.date as string;
	const amount = parseFloat(params.amount as string);
	const customerId = params.customerId as string;
	const customerName = params.customerName as string;

	// Mock items - in real app, fetch by transaction ID
	const itemsPurchased = transactionType === 'Purchase' ? ['Soap', 'Toothpaste', 'Shampoo'] : [];

	const { paymentAmount, setPaymentAmount, paymentMethod, setPaymentMethod, handleSubmit } =
		useTransactionPayment();

	const handleBack = () => {
		router.back();
	};

	const handlePayment = () => {
		handleSubmit();
		// After successful payment, navigate back
		router.back();
	};

	return (
		<SafeAreaView className='flex-1 bg-gray-50'>
			<TransactionDetailHeader
				customerName={customerName}
				transactionType={transactionType}
				onBack={handleBack}
			/>

			<ScrollView className='flex-1'>
				<TransactionDetailsCard amount={amount} date={date} items={itemsPurchased} />

				{/* Only show payment form for credit transactions */}
				{transactionType === 'Purchase' && amount < 0 && (
					<MakePaymentForm
						paymentAmount={paymentAmount}
						onPaymentAmountChange={setPaymentAmount}
						paymentMethod={paymentMethod}
						onPaymentMethodChange={setPaymentMethod}
						onSubmit={handlePayment}
					/>
				)}
			</ScrollView>
		</SafeAreaView>
	);
};

export default TransactionDetailScreen;
