import React, { useState } from 'react';
import {
    ScrollView,
    KeyboardAvoidingView,
    Platform,
    View,
    Text,
    TouchableOpacity,
    Alert,
    TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Header } from '@/components/common/Header';
import { BackButton } from '@/components/common/BackButton';
import { OrderSummary } from '@/components/checkout/OrderSummary';
import { AddCustomerModal } from '@/components/checkout/AddCustomerModal';
import { useEnhancedCheckout } from '@/hooks/useEnhancedCheckout';
import { useCart } from '@/contexts/CartContext';

const PaymentScreen: React.FC = () => {
    const { cart, clearCart } = useCart();
    const [showAddCustomerModal, setShowAddCustomerModal] = useState(false);

    const {
        paymentSplit,
        customerSearchQuery,
        selectedCustomer,
        searchResults,
        isSearching,
        isProcessing,
        requiresCustomer,
        mpesaAmount,
        cashAmount,
        creditAmount,
        totalPaid,
        remainingBalance,
        setPaymentAmount,
        setMpesaPhone,
        setCustomerSearchQuery,
        selectCustomer: setSelectedCustomer,
        createAndSelectCustomer,
        processPayment,
        canProcessPayment,
        total,
    } = useEnhancedCheckout(cart, cart.reduce((sum, item) => sum + item.price * item.quantity, 0));

    const handleProcessPayment = async () => {
        const success = await processPayment();
        if (success) {
            Alert.alert('Success', 'Payment processed successfully!', [
                {
                    text: 'OK',
                    onPress: () => {
                        clearCart();
                        router.push('/(tabs)');
                    },
                },
            ]);
        } else {
            Alert.alert('Error', 'Failed to process payment. Please try again.');
        }
    };

    const fillRemainingWithMethod = (method: 'mpesa' | 'cash' | 'credit') => {
        if (remainingBalance > 0) {
            setPaymentAmount(method, remainingBalance.toFixed(2));
        }
    };

    return (
        <SafeAreaView className="flex-1 bg-white">
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                className="flex-1"
            >
                <ScrollView
                    className="flex-1"
                    showsVerticalScrollIndicator={false}
                    keyboardShouldPersistTaps="handled"
                >
                    <Header title="Split Payment">
                        <BackButton onPress={() => router.back()} className="mr-4" />
                    </Header>

                    <OrderSummary cartItems={cart} total={total} />

                    <View className="px-4 py-4">
                        <Text className="text-xl font-bold mb-2">Payment Methods</Text>
                        <Text className="text-sm text-gray-500 mb-4">
                            Enter amounts for each payment method
                        </Text>

                        <View className="bg-green-50 border border-green-500 rounded-lg p-4 mb-4">
                            <View className="flex-row items-center justify-between mb-3">
                                <View className="flex-row items-center">
                                    <View className="w-10 h-10 bg-green-500 rounded-lg items-center justify-center mr-3">
                                        <Ionicons name="phone-portrait-outline" size={20} color="#fff" />
                                    </View>
                                    <Text className="text-base font-semibold text-gray-900">
                                        M-Pesa
                                    </Text>
                                </View>
                                {remainingBalance > 0 && (
                                    <TouchableOpacity onPress={() => fillRemainingWithMethod('mpesa')}>
                                        <Text className="text-green-600 text-sm">
                                            Fill ${remainingBalance.toFixed(2)}
                                        </Text>
                                    </TouchableOpacity>
                                )}
                            </View>

                            <View className="flex-row items-center border border-gray-300 rounded-lg px-4 py-3 mb-3">
                                <Text className="text-gray-600 mr-2">$</Text>
                                <TextInput
                                    className="flex-1 text-base"
                                    placeholder="0.00"
                                    value={paymentSplit.mpesa}
                                    onChangeText={(text) => setPaymentAmount('mpesa', text)}
                                    keyboardType="decimal-pad"
                                />
                            </View>

                            {mpesaAmount > 0 && (
                                <View className="border border-gray-300 rounded-lg px-4 py-3">
                                    <TextInput
                                        className="text-base"
                                        placeholder="Phone number (07XX XXX XXX)"
                                        value={paymentSplit.mpesaPhone}
                                        onChangeText={setMpesaPhone}
                                        keyboardType="phone-pad"
                                    />
                                </View>
                            )}
                        </View>

                        <View className="bg-orange-50 border border-orange-500 rounded-lg p-4 mb-4">
                            <View className="flex-row items-center justify-between mb-3">
                                <View className="flex-row items-center">
                                    <View className="w-10 h-10 bg-orange-500 rounded-lg items-center justify-center mr-3">
                                        <Ionicons name="cash-outline" size={20} color="#fff" />
                                    </View>
                                    <Text className="text-base font-semibold text-gray-900">Cash</Text>
                                </View>
                                {remainingBalance > 0 && (
                                    <TouchableOpacity onPress={() => fillRemainingWithMethod('cash')}>
                                        <Text className="text-orange-600 text-sm">
                                            Fill ${remainingBalance.toFixed(2)}
                                        </Text>
                                    </TouchableOpacity>
                                )}
                            </View>

                            <View className="flex-row items-center border border-gray-300 rounded-lg px-4 py-3">
                                <Text className="text-gray-600 mr-2">$</Text>
                                <TextInput
                                    className="flex-1 text-base"
                                    placeholder="0.00"
                                    value={paymentSplit.cash}
                                    onChangeText={(text) => setPaymentAmount('cash', text)}
                                    keyboardType="decimal-pad"
                                />
                            </View>
                        </View>

                        <View className="bg-blue-50 border border-blue-500 rounded-lg p-4 mb-4">
                            <View className="flex-row items-center justify-between mb-3">
                                <View className="flex-row items-center">
                                    <View className="w-10 h-10 bg-blue-500 rounded-lg items-center justify-center mr-3">
                                        <Ionicons name="card-outline" size={20} color="#fff" />
                                    </View>
                                    <Text className="text-base font-semibold text-gray-900">
                                        Store Credit
                                    </Text>
                                </View>
                                {remainingBalance > 0 && (
                                    <TouchableOpacity onPress={() => fillRemainingWithMethod('credit')}>
                                        <Text className="text-blue-600 text-sm">
                                            Fill ${remainingBalance.toFixed(2)}
                                        </Text>
                                    </TouchableOpacity>
                                )}
                            </View>

                            <View className="flex-row items-center border border-gray-300 rounded-lg px-4 py-3 mb-3">
                                <Text className="text-gray-600 mr-2">$</Text>
                                <TextInput
                                    className="flex-1 text-base"
                                    placeholder="0.00"
                                    value={paymentSplit.credit}
                                    onChangeText={(text) => setPaymentAmount('credit', text)}
                                    keyboardType="decimal-pad"
                                />
                            </View>

                            {creditAmount > 0 && (
                                <View>
                                    <View className="flex-row items-center justify-between mb-3">
                                        <Text className="text-sm text-gray-600">Customer</Text>
                                        <TouchableOpacity
                                            onPress={() => setShowAddCustomerModal(true)}
                                            className="flex-row items-center"
                                        >
                                            <Ionicons
                                                name="person-add-outline"
                                                size={18}
                                                color="#3B82F6"
                                            />
                                            <Text className="text-blue-500 ml-1 text-sm">
                                                New Customer
                                            </Text>
                                        </TouchableOpacity>
                                    </View>

                                    <View className="border border-gray-300 rounded-lg px-4 py-3 flex-row items-center mb-2">
                                        <Ionicons name="search-outline" size={20} color="#9CA3AF" />
                                        <TextInput
                                            className="flex-1 ml-3"
                                            placeholder="Search by name or phone..."
                                            value={customerSearchQuery}
                                            onChangeText={setCustomerSearchQuery}
                                        />
                                    </View>

                                    {searchResults.length > 0 && (
                                        <View className="border border-gray-200 rounded-lg mb-2">
                                            {searchResults.map((customer) => (
                                                <TouchableOpacity
                                                    key={customer.id}
                                                    onPress={() => setSelectedCustomer(customer)}
                                                    className="p-3 border-b border-gray-100"
                                                >
                                                    <Text className="font-medium text-gray-900">
                                                        {customer.name}
                                                    </Text>
                                                    <Text className="text-sm text-gray-500">
                                                        {customer.phone}
                                                    </Text>
                                                </TouchableOpacity>
                                            ))}
                                        </View>
                                    )}

                                    {selectedCustomer && (
                                        <View className="bg-green-100 border border-green-500 rounded-lg p-3">
                                            <Text className="font-medium text-green-900">
                                                ✓ {selectedCustomer.name}
                                            </Text>
                                            <Text className="text-sm text-green-700">
                                                {selectedCustomer.phone}
                                            </Text>
                                        </View>
                                    )}
                                </View>
                            )}
                        </View>

                        <View className="bg-gray-100 rounded-lg p-4 mb-4">
                            <View className="flex-row justify-between mb-2">
                                <Text className="text-gray-600">Total</Text>
                                <Text className="font-semibold text-gray-900">
                                    ${total.toFixed(2)}
                                </Text>
                            </View>
                            <View className="flex-row justify-between mb-2">
                                <Text className="text-gray-600">Paid</Text>
                                <Text className="font-semibold text-green-600">
                                    ${(totalPaid + creditAmount).toFixed(2)}
                                </Text>
                            </View>
                            <View className="flex-row justify-between pt-2 border-t border-gray-300">
                                <Text className="font-semibold text-gray-900">Remaining</Text>
                                <Text
                                    className={`font-bold text-lg ${
                                        Math.abs(remainingBalance) < 0.01
                                            ? 'text-green-600'
                                            : 'text-red-600'
                                    }`}
                                >
                                    ${remainingBalance.toFixed(2)}
                                </Text>
                            </View>
                        </View>

                        {mpesaAmount > 0 && (
                            <View className="flex-row items-center bg-green-50 rounded-lg p-3 mb-2">
                                <Ionicons name="phone-portrait" size={16} color="#059669" />
                                <Text className="ml-2 text-green-700 text-sm">
                                    M-Pesa: ${mpesaAmount.toFixed(2)}
                                </Text>
                            </View>
                        )}
                        {cashAmount > 0 && (
                            <View className="flex-row items-center bg-orange-50 rounded-lg p-3 mb-2">
                                <Ionicons name="cash" size={16} color="#EA580C" />
                                <Text className="ml-2 text-orange-700 text-sm">
                                    Cash: ${cashAmount.toFixed(2)}
                                </Text>
                            </View>
                        )}
                        {creditAmount > 0 && (
                            <View className="flex-row items-center bg-blue-50 rounded-lg p-3 mb-2">
                                <Ionicons name="card" size={16} color="#2563EB" />
                                <Text className="ml-2 text-blue-700 text-sm">
                                    Credit: ${creditAmount.toFixed(2)}
                                </Text>
                            </View>
                        )}
                    </View>

                    <View className="bg-white px-4 py-4 mt-6">
                        <TouchableOpacity
                            onPress={handleProcessPayment}
                            className={`rounded-xl py-4 ${
                                !canProcessPayment() || isProcessing
                                    ? 'bg-gray-300'
                                    : 'bg-gray-900'
                            }`}
                            disabled={!canProcessPayment() || isProcessing}
                        >
                            <Text className="text-white text-center font-semibold text-lg">
                                {isProcessing
                                    ? 'Processing...'
                                    : Math.abs(remainingBalance) < 0.01
                                      ? `Complete Payment $${total.toFixed(2)}`
                                      : `Pay $${total.toFixed(2)}`}
                            </Text>
                        </TouchableOpacity>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>

            <AddCustomerModal
                visible={showAddCustomerModal}
                onClose={() => setShowAddCustomerModal(false)}
                onAddCustomer={(customerData) => {
                    createAndSelectCustomer(customerData);
                    setShowAddCustomerModal(false);
                }}
            />
        </SafeAreaView>
    );
};

export default PaymentScreen;
