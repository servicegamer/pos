import React, { useState } from 'react';
import { ScrollView, View, Text, TouchableOpacity, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SearchBar } from '@/components/common/SearchBar';
import { CreditTopTabs } from '@/components/credit/CreditTopTabs';
import { useTransactions } from '@/hooks/useTransactions';
import Sale from '@/db/models/sales';

const TransactionsScreen: React.FC = () => {
    const { transactions, isLoading, searchQuery, setSearchQuery, totalRevenue, totalCredit } =
        useTransactions();

    const getPaymentMethodColor = (method: string) => {
        switch (method.toLowerCase()) {
            case 'cash':
                return 'bg-green-100 text-green-700';
            case 'mpesa':
            case 'm-pesa':
                return 'bg-blue-100 text-blue-700';
            case 'store-credit':
                return 'bg-orange-100 text-orange-700';
            default:
                return 'bg-gray-100 text-gray-700';
        }
    };

    const handleTransactionPress = (transaction: Sale) => {
        router.push({
            pathname: '/credit/transaction-detail',
            params: { transactionId: transaction.id },
        });
    };

    return (
        <SafeAreaView className="flex-1 bg-white">
            <CreditTopTabs />
            <ScrollView className="flex-1">
                <View className="p-4 border-b border-gray-200">
                    <View className="flex-row justify-between mb-4">
                        <View className="flex-1 bg-green-50 rounded-lg p-3 mr-2">
                            <Text className="text-sm text-gray-600">Total Paid</Text>
                            <Text className="text-xl font-bold text-green-600">
                                ${totalRevenue.toFixed(2)}
                            </Text>
                        </View>
                        <View className="flex-1 bg-orange-50 rounded-lg p-3 ml-2">
                            <Text className="text-sm text-gray-600">On Credit</Text>
                            <Text className="text-xl font-bold text-orange-600">
                                ${totalCredit.toFixed(2)}
                            </Text>
                        </View>
                    </View>

                    <SearchBar
                        placeholder="Search transactions..."
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                    />
                </View>

                {isLoading ? (
                    <View className="flex-1 items-center justify-center py-12">
                        <ActivityIndicator size="large" color="#000" />
                        <Text className="mt-4 text-gray-500">Loading transactions...</Text>
                    </View>
                ) : transactions.length === 0 ? (
                    <View className="flex-1 items-center justify-center py-12">
                        <Ionicons name="receipt-outline" size={48} color="#9CA3AF" />
                        <Text className="mt-4 text-gray-500 text-center px-4">
                            {searchQuery
                                ? 'No transactions found matching your search'
                                : 'No transactions yet'}
                        </Text>
                    </View>
                ) : (
                    <View className="px-4">
                        {transactions.map((transaction) => (
                            <TouchableOpacity
                                key={transaction.id}
                                className="bg-white border border-gray-200 rounded-lg p-4 mb-3"
                                onPress={() => handleTransactionPress(transaction)}
                            >
                                <View className="flex-row items-center justify-between mb-2">
                                    <Text className="text-sm text-gray-500">
                                        {transaction.externalId}
                                    </Text>
                                    <View
                                        className={`px-2 py-1 rounded-full ${getPaymentMethodColor(transaction.paymentMethod)}`}
                                    >
                                        <Text className="text-xs font-medium">
                                            {transaction.paymentMethod}
                                        </Text>
                                    </View>
                                </View>

                                <View className="flex-row items-center justify-between mb-2">
                                    <Text className="text-lg font-semibold text-gray-900">
                                        ${transaction.totalAmount.toFixed(2)}
                                    </Text>
                                    <Text className="text-sm text-gray-500">
                                        {new Date(transaction.createdAt).toLocaleDateString()} •{' '}
                                        {new Date(transaction.createdAt).toLocaleTimeString([], {
                                            hour: '2-digit',
                                            minute: '2-digit',
                                        })}
                                    </Text>
                                </View>

                                {transaction.amountOnCredit > 0 && (
                                    <View className="bg-orange-50 rounded px-2 py-1">
                                        <Text className="text-xs text-orange-700">
                                            ${transaction.amountPaid.toFixed(2)} paid • $
                                            {transaction.amountOnCredit.toFixed(2)} on credit
                                        </Text>
                                    </View>
                                )}

                                <View className="flex-row items-center justify-between mt-2">
                                    <View
                                        className={`px-2 py-1 rounded ${
                                            transaction.status === 'completed'
                                                ? 'bg-green-100'
                                                : 'bg-yellow-100'
                                        }`}
                                    >
                                        <Text
                                            className={`text-xs font-medium ${
                                                transaction.status === 'completed'
                                                    ? 'text-green-700'
                                                    : 'text-yellow-700'
                                            }`}
                                        >
                                            {transaction.status}
                                        </Text>
                                    </View>
                                    <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
                                </View>
                            </TouchableOpacity>
                        ))}
                    </View>
                )}
            </ScrollView>
        </SafeAreaView>
    );
};

export default TransactionsScreen;
