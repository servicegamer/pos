import React, { useState, useEffect } from 'react';
import { ScrollView, View, Text, ActivityIndicator, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { salesService } from '@/db/services/salesService';
import Sale from '@/db/models/sales';
import SaleItem from '@/db/models/sales_items';
import Product from '@/db/models/products';
import User from '@/db/models/users';
import Customer from '@/db/models/customers';
import Store from '@/db/models/stores';

const TransactionDetailScreen: React.FC = () => {
    const params = useLocalSearchParams();
    const transactionId = params.transactionId as string;

    const [sale, setSale] = useState<Sale | null>(null);
    const [items, setItems] = useState<Array<{ item: SaleItem; product: Product }>>([]);
    const [cashier, setCashier] = useState<User | null>(null);
    const [customer, setCustomer] = useState<Customer | null>(null);
    const [store, setStore] = useState<Store | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    const safeParsePaymentMethods = (paymentMethodsStr?: string): string[] | null => {
        if (!paymentMethodsStr) return null;
        try {
            const parsed = JSON.parse(paymentMethodsStr);
            return Array.isArray(parsed) && parsed.length > 0 ? parsed : null;
        } catch (error) {
            console.error('Error parsing payment methods:', error);
            return null;
        }
    };

    useEffect(() => {
        const fetchTransactionDetails = async () => {
            if (!transactionId) return;

            setIsLoading(true);
            try {
                const saleData = await salesService.getSaleWithItems(transactionId);
                setSale(saleData.sale);
                setItems(saleData.items);

                const saleStore = await saleData.sale.store.fetch();
                setStore(saleStore);

                const saleCashier = await saleData.sale.user.fetch();
                setCashier(saleCashier);

                if (saleData.sale.customerId) {
                    const saleCustomer = await saleData.sale.customer?.fetch();
                    setCustomer(saleCustomer || null);
                }
            } catch (error) {
                console.error('Error fetching transaction details:', error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchTransactionDetails();
    }, [transactionId]);

    if (isLoading) {
        return (
            <SafeAreaView className="flex-1 bg-white">
                <View className="flex-1 items-center justify-center">
                    <ActivityIndicator size="large" color="#000" />
                    <Text className="mt-4 text-gray-500">Loading transaction...</Text>
                </View>
            </SafeAreaView>
        );
    }

    if (!sale) {
        return (
            <SafeAreaView className="flex-1 bg-white">
                <View className="flex-1 items-center justify-center">
                    <Ionicons name="alert-circle-outline" size={48} color="#EF4444" />
                    <Text className="mt-4 text-gray-500">Transaction not found</Text>
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView className="flex-1 bg-gray-50">
            <View className="bg-white px-4 py-3 border-b border-gray-200">
                <View className="flex-row items-center">
                    <TouchableOpacity onPress={() => router.back()} className="mr-3">
                        <Ionicons name="arrow-back" size={24} color="#000" />
                    </TouchableOpacity>
                    <Text className="text-xl font-semibold">Transaction Details</Text>
                </View>
            </View>

            <ScrollView className="flex-1">
                <View className="bg-white m-4 rounded-xl p-4">
                    <Text className="text-sm text-gray-500 mb-1">Transaction ID</Text>
                    <Text className="text-lg font-semibold text-gray-900 mb-4">
                        {sale.externalId}
                    </Text>

                    <View className="flex-row justify-between items-center py-3 border-t border-gray-100">
                        <Text className="text-gray-600">Date & Time</Text>
                        <Text className="font-medium text-gray-900">
                            {new Date(sale.createdAt).toLocaleDateString()} •{' '}
                            {new Date(sale.createdAt).toLocaleTimeString([], {
                                hour: '2-digit',
                                minute: '2-digit',
                            })}
                        </Text>
                    </View>

                    <View className="flex-row justify-between items-center py-3 border-t border-gray-100">
                        <Text className="text-gray-600">Store</Text>
                        <Text className="font-medium text-gray-900">{store?.name || 'N/A'}</Text>
                    </View>

                    <View className="flex-row justify-between items-center py-3 border-t border-gray-100">
                        <Text className="text-gray-600">Cashier</Text>
                        <Text className="font-medium text-gray-900">{cashier?.name || 'N/A'}</Text>
                    </View>

                    {customer && (
                        <View className="flex-row justify-between items-center py-3 border-t border-gray-100">
                            <Text className="text-gray-600">Customer</Text>
                            <View className="items-end">
                                <Text className="font-medium text-gray-900">{customer.name}</Text>
                                <Text className="text-sm text-gray-500">{customer.phone}</Text>
                            </View>
                        </View>
                    )}

                    <View className="py-3 border-t border-gray-100">
                        <Text className="text-gray-600 mb-2">Payment Method</Text>
                        {(() => {
                            const parsedMethods = safeParsePaymentMethods(sale.paymentMethodsUsed);
                            
                            if (parsedMethods && parsedMethods.length > 0) {
                                return (
                                    <View>
                                        {parsedMethods.map((method: string, index: number) => (
                                            <View key={index} className="flex-row items-center mb-1">
                                                <View className={`w-2 h-2 rounded-full mr-2 ${
                                                    method === 'mpesa' ? 'bg-green-500' :
                                                    method === 'cash' ? 'bg-orange-500' :
                                                    method === 'store-credit' ? 'bg-blue-500' :
                                                    'bg-gray-500'
                                                }`} />
                                                <Text className="font-medium text-gray-900 capitalize flex-1">
                                                    {method === 'mpesa' ? 'M-Pesa' : 
                                                     method === 'store-credit' ? 'Store Credit' : 
                                                     method}
                                                </Text>
                                                {method === 'mpesa' && sale.mpesaAmount && sale.mpesaAmount > 0 && (
                                                    <Text className="text-green-600 font-semibold">
                                                        ${sale.mpesaAmount.toFixed(2)}
                                                    </Text>
                                                )}
                                                {method === 'cash' && sale.cashAmount && sale.cashAmount > 0 && (
                                                    <Text className="text-orange-600 font-semibold">
                                                        ${sale.cashAmount.toFixed(2)}
                                                    </Text>
                                                )}
                                                {method === 'store-credit' && sale.amountOnCredit > 0 && (
                                                    <Text className="text-blue-600 font-semibold">
                                                        ${sale.amountOnCredit.toFixed(2)}
                                                    </Text>
                                                )}
                                            </View>
                                        ))}
                                    </View>
                                );
                            }
                            
                            return (
                                <Text className="font-medium text-gray-900 capitalize">
                                    {sale.paymentMethod}
                                </Text>
                            );
                        })()}
                    </View>

                    <View className="flex-row justify-between items-center py-3 border-t border-gray-100">
                        <Text className="text-gray-600">Status</Text>
                        <View
                            className={`px-3 py-1 rounded-full ${
                                sale.status === 'completed' ? 'bg-green-100' : 'bg-yellow-100'
                            }`}
                        >
                            <Text
                                className={`text-sm font-medium ${
                                    sale.status === 'completed'
                                        ? 'text-green-700'
                                        : 'text-yellow-700'
                                }`}
                            >
                                {sale.status}
                            </Text>
                        </View>
                    </View>
                </View>

                {sale.amountOnCredit > 0 && customer && (
                    <View className="bg-orange-50 mx-4 mb-4 rounded-xl p-4 border border-orange-100">
                        <View className="flex-row items-center mb-2">
                            <Ionicons name="person" size={18} color="#C2410C" />
                            <Text className="text-orange-800 font-semibold ml-2">Credit Sale</Text>
                        </View>
                        <Text className="text-orange-900 font-medium text-base">{customer.name}</Text>
                        <Text className="text-orange-700 text-sm mt-1">Amount added to customer credit</Text>
                    </View>
                )}

                <View className="bg-white mx-4 mb-4 rounded-xl p-4">
                    <View className="flex-row items-center mb-4">
                        <Ionicons name="bag-handle-outline" size={20} color="#000" />
                        <Text className="text-lg font-semibold ml-2">Items Purchased</Text>
                    </View>
                    {items.map(({ item, product }) => (
                        <View key={item.id} className="bg-orange-50 rounded-lg p-3 mb-2">
                            <Text className="font-medium text-orange-900 text-base">{product.name}</Text>
                        </View>
                    ))}
                </View>

                <View className="bg-white mx-4 mb-4 rounded-xl p-4">
                    <Text className="text-lg font-semibold mb-4">Payment Summary</Text>
                    
                    <View className="flex-row justify-between py-2">
                        <Text className="text-gray-600">Subtotal</Text>
                        <Text className="font-medium text-gray-900">
                            ${sale.subtotal.toFixed(2)}
                        </Text>
                    </View>

                    {sale.discountAmount > 0 && (
                        <View className="flex-row justify-between py-2">
                            <Text className="text-gray-600">
                                Discount ({sale.discountPercentage}%)
                            </Text>
                            <Text className="font-medium text-red-600">
                                -${sale.discountAmount.toFixed(2)}
                            </Text>
                        </View>
                    )}

                    <View className="flex-row justify-between py-2 border-t border-gray-200 mt-2">
                        <Text className="text-lg font-semibold text-gray-900">Total</Text>
                        <Text className="text-lg font-semibold text-gray-900">
                            ${sale.totalAmount.toFixed(2)}
                        </Text>
                    </View>

                    <View className="flex-row justify-between py-2 border-t border-gray-100">
                        <Text className="text-gray-600">Amount Paid</Text>
                        <Text className="font-semibold text-green-600">
                            ${sale.amountPaid.toFixed(2)}
                        </Text>
                    </View>

                    {sale.amountOnCredit > 0 && (
                        <View className="flex-row justify-between py-2">
                            <Text className="text-gray-600">On Credit</Text>
                            <Text className="font-semibold text-orange-600">
                                ${sale.amountOnCredit.toFixed(2)}
                            </Text>
                        </View>
                    )}
                </View>
            </ScrollView>
        </SafeAreaView>
    );
};

export default TransactionDetailScreen;
