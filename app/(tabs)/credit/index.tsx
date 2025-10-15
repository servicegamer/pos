import React from 'react';
import { ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CreditHeader } from '@/components/credit/CreditHeader';
import { CreditSummarySection } from '@/components/credit/CreditSummarySection';
import { CustomerCreditItem } from '@/components/credit/CustomerCreditItem';
import { useCreditManagement } from '@/hooks/useCreditManagement';
import { Customer } from '@/types';
import { RecordPaymentForm } from '@/components/credit/forms/RecordPaymentForm';
import { MOCK_CUSTOMERS } from '@/constants/credit';
import { router } from 'expo-router';

const CreditScreen: React.FC = () => {
	const {
		customerName,
		amountPaid,
		setAmountPaid,
		showSuggestions,
		searchQuery,
		setSearchQuery,
		showCreditRating,
		setShowCreditRating,
		totalAmount,
		filteredCustomers,
		suggestedCustomers,
		handleCustomerNameChange,
		handleSelectCustomer,
		handleRecordPayment,
	} = useCreditManagement(MOCK_CUSTOMERS);

	const handleCustomerPress = (customer: Customer) => {
		console.log(customer);
		router.push({
			pathname: '/credit/credit-details',
			params: {
				customerId: customer.id,
				firstName: customer.firstName,
				lastName: customer.lastName,
				phoneNumber: customer.phoneNumber,
				amount: customer.amount.toString(),
				dueDate: customer.dueDate,
				rating: customer.rating,
				daysLeft: customer.daysLeft.toString(),
			},
		});
	};

	return (
		<SafeAreaView className='flex-1 bg-white'>
			<CreditHeader />

			<ScrollView className='flex-1'>
				<RecordPaymentForm
					customerName={customerName}
					onCustomerNameChange={handleCustomerNameChange}
					amountPaid={amountPaid}
					onAmountPaidChange={setAmountPaid}
					showSuggestions={showSuggestions}
					suggestedCustomers={suggestedCustomers}
					onSelectCustomer={handleSelectCustomer}
					onRecord={handleRecordPayment}
				/>

				<CreditSummarySection
					totalAmount={totalAmount}
					showCreditRating={showCreditRating}
					onCloseCreditRating={() => setShowCreditRating(false)}
					searchQuery={searchQuery}
					onSearchChange={setSearchQuery}
				/>

				{/* Customer List */}
				<View className='px-4'>
					{filteredCustomers.map((customer) => (
						<CustomerCreditItem
							key={customer.id}
							customer={customer}
							onPress={handleCustomerPress}
						/>
					))}
				</View>
			</ScrollView>
		</SafeAreaView>
	);
};

export default CreditScreen;
