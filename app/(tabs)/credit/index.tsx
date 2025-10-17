import React, { useState } from 'react';
import { ScrollView, View, Text, TouchableOpacity, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CreditTopTabs } from '@/components/credit/CreditTopTabs';
import { CreditSummarySection } from '@/components/credit/CreditSummarySection';
import { useRealCreditData } from '@/hooks/useRealCreditData';
import Customer from '@/db/models/customers';
import { Ionicons } from '@expo/vector-icons';

const CreditScreen: React.FC = () => {
    const [showCreditRating, setShowCreditRating] = useState(true);

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

    const getRatingColor = (balance: number) => {
        if (balance > 1000) return 'bg-red-100 text-red-700';
        if (balance > 500) return 'bg-orange-100 text-orange-700';
        return 'bg-green-100 text-green-700';
    };

    return (
        <SafeAreaView className="flex-1 bg-white">
            <CreditTopTabs />

            <ScrollView className="flex-1">
                <CreditSummarySection
                    totalAmount={totalCreditAmount}
                    showCreditRating={showCreditRating}
                    onCloseCreditRating={() => setShowCreditRating(false)}
                    searchQuery={searchQuery}
                    onSearchChange={setSearchQuery}
                />

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
                    <View className="px-4">
                        {customers.map((customer) => (
                            <TouchableOpacity
                                key={customer.id}
                                className="flex-row items-center justify-between py-4 border rounded-lg px-3 mb-2 border-gray-200"
                            >
                                <View className="flex-row items-center flex-1">
                                    <View className="w-10 h-10 bg-gray-200 rounded-full items-center justify-center mr-3">
                                        <Ionicons name="person-outline" size={20} color="#666" />
                                    </View>
                                    <View className="flex-1">
                                        <View className="flex-row items-center mb-1">
                                            <Text className="font-semibold text-base mr-2">
                                                {customer.name}
                                            </Text>
                                            <View
                                                className={`px-2 py-0.5 rounded-full ${getRatingColor(customer.currentBalance)}`}
                                            >
                                                <Text className="text-xs font-medium">
                                                    {customer.reputationScore || 100}
                                                </Text>
                                            </View>
                                        </View>
                                        <Text className="text-sm text-gray-500">
                                            {customer.phone || 'No phone'}
                                        </Text>
                                    </View>
                                </View>
                                <View className="items-end">
                                    <Text className="font-semibold text-base mb-1">
                                        ${customer.currentBalance.toFixed(2)}
                                    </Text>
                                    <Text className="text-xs font-medium text-gray-500">
                                        Outstanding
                                    </Text>
                                </View>
                            </TouchableOpacity>
                        ))}
                    </View>
                )}
            </ScrollView>
        </SafeAreaView>
    );
};

export default CreditScreen;
