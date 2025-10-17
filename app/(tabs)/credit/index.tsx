import React, { useState } from 'react';
import { ScrollView, View, Text, TouchableOpacity, ActivityIndicator, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { CreditTopTabs } from '@/components/credit/CreditTopTabs';
import { RecordPaymentForm } from '@/components/credit/forms/RecordPaymentForm';
import { useRealCreditData } from '@/hooks/useRealCreditData';
import Customer from '@/db/models/customers';
import { Ionicons } from '@expo/vector-icons';
import { CreditRatingBadge } from '@/components/credit/CreditRatingBadge';

const CreditScreen: React.FC = () => {
    const [showCreditRating, setShowCreditRating] = useState(true);
    const [customerSearchQuery, setCustomerSearchQuery] = useState('');
    const [amountPaid, setAmountPaid] = useState('');

    const {
        customers,
        isLoading,
        searchQuery,
        setSearchQuery,
        totalCreditAmount,
        selectedCustomer,
        setSelectedCustomer,
        paymentAmount,
        setPaymentAmount,
        handleRecordPayment,
    } = useRealCreditData();

    const getCreditRating = (balance: number): 'Good' | 'Medium' | 'Low' => {
        if (balance > 100) return 'Low';
        if (balance > 50) return 'Medium';
        return 'Good';
    };

    const getDaysStatus = (dueDate: Date) => {
        const today = new Date();
        const diffTime = dueDate.getTime() - today.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        if (diffDays < 0) {
            return { text: `${Math.abs(diffDays)} days overdue`, color: 'text-red-500' };
        }
        return { text: `${diffDays} days left`, color: 'text-green-500' };
    };

    const suggestedCustomers = customers.filter((c) =>
        c.name.toLowerCase().includes(customerSearchQuery.toLowerCase())
    );

    const handleSelectCustomer = (customer: Customer) => {
        setSelectedCustomer(customer);
        setCustomerSearchQuery(customer.name);
        setAmountPaid(customer.currentBalance.toFixed(2));
    };

    const handleRecordPress = async () => {
        if (selectedCustomer && amountPaid) {
            setPaymentAmount(amountPaid);
            await handleRecordPayment();
            setCustomerSearchQuery('');
            setAmountPaid('');
        }
    };

    const handleCustomerPress = (customer: Customer) => {
        router.push({
            pathname: '/credit/credit-details',
            params: {
                customerId: customer.id,
                name: customer.name,
                phone: customer.phone,
                currentBalance: customer.currentBalance.toString(),
            },
        });
    };

    return (
        <SafeAreaView className="flex-1 bg-white">
            <CreditTopTabs />

            <ScrollView className="flex-1">
                <RecordPaymentForm
                    customerName={customerSearchQuery}
                    onCustomerNameChange={setCustomerSearchQuery}
                    amountPaid={amountPaid}
                    onAmountPaidChange={setAmountPaid}
                    showSuggestions={customerSearchQuery.length > 0 && !selectedCustomer}
                    suggestedCustomers={suggestedCustomers}
                    onSelectCustomer={handleSelectCustomer}
                    onRecord={handleRecordPress}
                />

                <View className="p-4 border-b border-gray-200">
                    <View className="flex-row justify-between items-center mb-3">
                        <Text className="text-lg font-semibold">Credit</Text>
                        <Text className="text-base text-gray-600">
                            Total Amount: <Text className="font-semibold">${totalCreditAmount.toFixed(2)}</Text>
                        </Text>
                    </View>

                    <View className="mb-3">
                        <View className="flex-row items-center bg-gray-100 rounded-lg px-3 py-3">
                            <Ionicons name="search-outline" size={18} color="#666" />
                            <TextInput
                                className="flex-1 ml-2 text-base"
                                placeholder="Search customers..."
                                value={searchQuery}
                                onChangeText={setSearchQuery}
                            />
                        </View>
                    </View>
                </View>

                {isLoading ? (
                    <View className="flex-1 items-center justify-center py-12">
                        <ActivityIndicator size="large" color="#000" />
                        <Text className="mt-4 text-gray-500">Loading customers...</Text>
                    </View>
                ) : customers.length === 0 ? (
                    <View className="flex-1 items-center justify-center py-12">
                        <Ionicons name="people-outline" size={48} color="#9CA3AF" />
                        <Text className="mt-4 text-gray-500 text-center px-4">
                            {searchQuery
                                ? 'No customers found matching your search'
                                : 'No customers with outstanding credit'}
                        </Text>
                    </View>
                ) : (
                    <View className="px-4 pb-4">
                        {customers.map((customer) => {
                            const rating = getCreditRating(customer.currentBalance);
                            const dueDate = new Date();
                            dueDate.setDate(dueDate.getDate() + 7);
                            const daysStatus = getDaysStatus(dueDate);

                            return (
                                <TouchableOpacity
                                    key={customer.id}
                                    onPress={() => handleCustomerPress(customer)}
                                    className="flex-row items-center justify-between py-3 border-b border-gray-100"
                                >
                                    <View className="flex-row items-center flex-1">
                                        <View className="w-10 h-10 bg-gray-100 rounded-full items-center justify-center mr-3">
                                            <Ionicons name="person-outline" size={20} color="#666" />
                                        </View>
                                        <View className="flex-1">
                                            <View className="flex-row items-center gap-2 mb-1">
                                                <Text className="font-semibold text-base">
                                                    {customer.name}
                                                </Text>
                                                <CreditRatingBadge rating={rating} size="sm" />
                                            </View>
                                            <Text className="text-sm text-gray-500 mb-0.5">
                                                Due: {dueDate.toISOString().split('T')[0]}
                                            </Text>
                                            <Text className={`text-xs ${daysStatus.color}`}>
                                                {daysStatus.text}
                                            </Text>
                                        </View>
                                    </View>
                                    <View className="items-end">
                                        <Text className="font-semibold text-base mb-1">
                                            ${customer.currentBalance.toFixed(2)}
                                        </Text>
                                    </View>
                                </TouchableOpacity>
                            );
                        })}
                    </View>
                )}
            </ScrollView>
        </SafeAreaView>
    );
};

export default CreditScreen;
