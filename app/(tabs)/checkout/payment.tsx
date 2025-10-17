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
    const [showPartialPaymentOptions, setShowPartialPaymentOptions] = useState<'cash' | 'mpesa' | null>(null);

    const {
        selectedPaymentMethod,
        mpesaAmount,
        mpesaPhone,
        cashAmount,
        creditAmount,
        creditRemainingMethod,
        customerSearchQuery,
        selectedCustomer,
        searchResults,
        isSearching,
        isProcessing,
        requiresCustomer,
        isPartialCredit,
        isPartialCash,
        isPartialMpesa,
        remainingAmount,
        mpesaValue,
        cashValue,
        creditValue,
        selectPaymentMethod,
        switchToPartialPayment,
        setMpesaAmount,
        setCashAmount,
        setCreditAmount,
        setMpesaPhone,
        setCreditRemainingMethod,
        setCustomerSearchQuery,
        selectCustomer: setSelectedCustomer,
        createAndSelectCustomer,
        processPayment,
        canProcessPayment,
        total,
        roundedTotal,
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

    const handlePartialPaymentSelect = (fromMethod: 'cash' | 'mpesa', toMethod: 'mpesa' | 'cash' | 'store-credit') => {
        switchToPartialPayment(fromMethod, toMethod);
        setShowPartialPaymentOptions(null);
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
                    <Header title="Payment Method">
                        <BackButton onPress={() => router.back()} className="mr-4" />
                    </Header>

                    <OrderSummary cartItems={cart} total={total} />

                    <View className="px-4 py-4">
                        <TouchableOpacity
                            onPress={() => selectPaymentMethod('cash')}
                            className={`rounded-xl p-4 mb-4 border ${
                                selectedPaymentMethod === 'cash'
                                    ? 'bg-orange-50 border-orange-500'
                                    : 'bg-white border-gray-200'
                            }`}
                        >
                            <View className="flex-row items-center">
                                <View className="w-12 h-12 bg-orange-500 rounded-lg items-center justify-center mr-3">
                                    <Ionicons name="cash-outline" size={24} color="#fff" />
                                </View>
                                <View className="flex-1">
                                    <Text className="text-lg font-semibold text-gray-900">Cash</Text>
                                    <Text className="text-sm text-gray-500">Cash payment</Text>
                                </View>
                                {cashValue > 0 && selectedPaymentMethod !== 'cash' && (
                                    <View className="bg-orange-500 px-3 py-1 rounded-lg">
                                        <Text className="text-white font-semibold">
                                            ${cashValue.toFixed(2)}
                                        </Text>
                                    </View>
                                )}
                            </View>

                            {selectedPaymentMethod === 'cash' && (
                                <View className="mt-4">
                                    <Text className="text-sm font-medium text-gray-700 mb-2">
                                        Amount to pay
                                    </Text>
                                    <View className="flex-row items-center border border-gray-300 rounded-lg px-4 py-3 bg-gray-50 mb-3">
                                        <Text className="text-gray-600 mr-2">$</Text>
                                        <TextInput
                                            className="flex-1 text-base"
                                            placeholder="0.00"
                                            value={cashAmount}
                                            onChangeText={setCashAmount}
                                            keyboardType="decimal-pad"
                                        />
                                    </View>

                                    {isPartialCash && !showPartialPaymentOptions && (
                                        <TouchableOpacity
                                            onPress={() => setShowPartialPaymentOptions('cash')}
                                            className="bg-blue-500 rounded-lg py-3 mb-3"
                                        >
                                            <Text className="text-white text-center font-semibold">
                                                Partial Payments (${remainingAmount.toFixed(2)} remaining)
                                            </Text>
                                        </TouchableOpacity>
                                    )}

                                    {showPartialPaymentOptions === 'cash' && (
                                        <View className="bg-gray-100 rounded-lg p-3 mb-3">
                                            <Text className="text-sm font-medium text-gray-700 mb-2">
                                                Pay remaining ${remainingAmount.toFixed(2)} with:
                                            </Text>
                                            <View className="flex-row gap-2">
                                                <TouchableOpacity
                                                    onPress={() => handlePartialPaymentSelect('cash', 'mpesa')}
                                                    className="flex-1 bg-green-500 rounded-lg py-3"
                                                >
                                                    <Text className="text-white text-center font-medium">
                                                        M-Pesa
                                                    </Text>
                                                </TouchableOpacity>
                                                <TouchableOpacity
                                                    onPress={() => handlePartialPaymentSelect('cash', 'store-credit')}
                                                    className="flex-1 bg-blue-500 rounded-lg py-3"
                                                >
                                                    <Text className="text-white text-center font-medium">
                                                        Store Credit
                                                    </Text>
                                                </TouchableOpacity>
                                            </View>
                                        </View>
                                    )}
                                </View>
                            )}
                        </TouchableOpacity>

                        <TouchableOpacity
                            onPress={() => selectPaymentMethod('mpesa')}
                            className={`rounded-xl p-4 mb-4 border ${
                                selectedPaymentMethod === 'mpesa'
                                    ? 'bg-green-50 border-green-500'
                                    : 'bg-white border-gray-200'
                            }`}
                        >
                            <View className="flex-row items-center">
                                <View className="w-12 h-12 bg-green-500 rounded-lg items-center justify-center mr-3">
                                    <Ionicons name="phone-portrait-outline" size={24} color="#fff" />
                                </View>
                                <View className="flex-1">
                                    <Text className="text-lg font-semibold text-gray-900">M-Pesa</Text>
                                    <Text className="text-sm text-gray-500">Pay with mobile money</Text>
                                </View>
                                {mpesaValue > 0 && selectedPaymentMethod !== 'mpesa' && (
                                    <View className="bg-green-500 px-3 py-1 rounded-lg">
                                        <Text className="text-white font-semibold">
                                            ${mpesaValue.toFixed(2)}
                                        </Text>
                                    </View>
                                )}
                            </View>

                            {selectedPaymentMethod === 'mpesa' && (
                                <View className="mt-4">
                                    <Text className="text-sm font-medium text-gray-700 mb-2">
                                        Amount to pay
                                    </Text>
                                    <View className="flex-row items-center border border-gray-300 rounded-lg px-4 py-3 bg-gray-50 mb-3">
                                        <Text className="text-gray-600 mr-2">$</Text>
                                        <TextInput
                                            className="flex-1 text-base"
                                            placeholder="0.00"
                                            value={mpesaAmount}
                                            onChangeText={setMpesaAmount}
                                            keyboardType="decimal-pad"
                                        />
                                    </View>

                                    <Text className="text-sm font-medium text-gray-700 mb-2">
                                        Phone number
                                    </Text>
                                    <View className="border border-gray-300 rounded-lg px-4 py-3 bg-gray-50 mb-3">
                                        <TextInput
                                            className="text-base"
                                            placeholder="Phone number (07XX XXX XXX)"
                                            value={mpesaPhone}
                                            onChangeText={setMpesaPhone}
                                            keyboardType="phone-pad"
                                        />
                                    </View>

                                    {isPartialMpesa && !showPartialPaymentOptions && (
                                        <TouchableOpacity
                                            onPress={() => setShowPartialPaymentOptions('mpesa')}
                                            className="bg-blue-500 rounded-lg py-3 mb-3"
                                        >
                                            <Text className="text-white text-center font-semibold">
                                                Partial Payments (${remainingAmount.toFixed(2)} remaining)
                                            </Text>
                                        </TouchableOpacity>
                                    )}

                                    {showPartialPaymentOptions === 'mpesa' && (
                                        <View className="bg-gray-100 rounded-lg p-3 mb-3">
                                            <Text className="text-sm font-medium text-gray-700 mb-2">
                                                Pay remaining ${remainingAmount.toFixed(2)} with:
                                            </Text>
                                            <View className="flex-row gap-2">
                                                <TouchableOpacity
                                                    onPress={() => handlePartialPaymentSelect('mpesa', 'cash')}
                                                    className="flex-1 bg-orange-500 rounded-lg py-3"
                                                >
                                                    <Text className="text-white text-center font-medium">
                                                        Cash
                                                    </Text>
                                                </TouchableOpacity>
                                                <TouchableOpacity
                                                    onPress={() => handlePartialPaymentSelect('mpesa', 'store-credit')}
                                                    className="flex-1 bg-blue-500 rounded-lg py-3"
                                                >
                                                    <Text className="text-white text-center font-medium">
                                                        Store Credit
                                                    </Text>
                                                </TouchableOpacity>
                                            </View>
                                        </View>
                                    )}
                                </View>
                            )}
                        </TouchableOpacity>

                        <TouchableOpacity
                            onPress={() => selectPaymentMethod('store-credit')}
                            className={`rounded-xl p-4 mb-4 ${
                                selectedPaymentMethod === 'store-credit'
                                    ? 'bg-gray-900'
                                    : 'bg-gray-800'
                            }`}
                        >
                            <View className="flex-row items-center">
                                <View className="w-12 h-12 bg-blue-500 rounded-lg items-center justify-center mr-3">
                                    <Ionicons name="card-outline" size={24} color="#fff" />
                                </View>
                                <View className="flex-1">
                                    <Text className="text-lg font-semibold text-white">Store Credit</Text>
                                    <Text className="text-sm text-gray-400">Use customer credit</Text>
                                </View>
                                {creditValue > 0 && selectedPaymentMethod !== 'store-credit' && (
                                    <View className="bg-blue-500 px-3 py-1 rounded-lg">
                                        <Text className="text-white font-semibold">
                                            ${creditValue.toFixed(2)}
                                        </Text>
                                    </View>
                                )}
                            </View>

                            {selectedPaymentMethod === 'store-credit' && (
                                <View className="mt-4">
                                    <Text className="text-sm font-medium text-white mb-2">
                                        Amount to pay on credit
                                    </Text>
                                    <View className="flex-row items-center rounded-lg px-4 py-3 mb-1 bg-gray-800">
                                        <Text className="text-gray-400 mr-2">$</Text>
                                        <TextInput
                                            className="flex-1 text-base text-white"
                                            placeholder="0.00"
                                            placeholderTextColor="#9CA3AF"
                                            value={creditAmount}
                                            onChangeText={setCreditAmount}
                                            keyboardType="decimal-pad"
                                        />
                                    </View>
                                    <Text className="text-xs text-gray-400 mb-4">
                                        Maximum: ${roundedTotal.toFixed(2)}
                                    </Text>

                                    {isPartialCredit && (
                                        <View className="mb-4">
                                            <Text className="text-sm font-medium text-white mb-2">
                                                Pay remaining ${remainingAmount.toFixed(2)} with:
                                            </Text>
                                            <View className="flex-row gap-2">
                                                <TouchableOpacity
                                                    onPress={() => setCreditRemainingMethod('mpesa')}
                                                    className={`flex-1 rounded-lg py-3 px-4 border ${
                                                        creditRemainingMethod === 'mpesa'
                                                            ? 'bg-green-500 border-green-500'
                                                            : 'bg-gray-800 border-gray-700'
                                                    }`}
                                                >
                                                    <Text
                                                        className={`text-center font-medium ${
                                                            creditRemainingMethod === 'mpesa'
                                                                ? 'text-white'
                                                                : 'text-gray-400'
                                                        }`}
                                                    >
                                                        M-Pesa
                                                    </Text>
                                                </TouchableOpacity>
                                                <TouchableOpacity
                                                    onPress={() => setCreditRemainingMethod('cash')}
                                                    className={`flex-1 rounded-lg py-3 px-4 border ${
                                                        creditRemainingMethod === 'cash'
                                                            ? 'bg-orange-500 border-orange-500'
                                                            : 'bg-gray-800 border-gray-700'
                                                    }`}
                                                >
                                                    <Text
                                                        className={`text-center font-medium ${
                                                            creditRemainingMethod === 'cash'
                                                                ? 'text-white'
                                                                : 'text-gray-400'
                                                        }`}
                                                    >
                                                        Cash
                                                    </Text>
                                                </TouchableOpacity>
                                            </View>

                                            {creditRemainingMethod === 'mpesa' && (
                                                <View className="mt-3">
                                                    <Text className="text-sm font-medium text-white mb-2">
                                                        M-Pesa phone number
                                                    </Text>
                                                    <View className="rounded-lg px-4 py-3 bg-gray-800">
                                                        <TextInput
                                                            className="text-base text-white"
                                                            placeholder="Phone number (07XX XXX XXX)"
                                                            placeholderTextColor="#9CA3AF"
                                                            value={mpesaPhone}
                                                            onChangeText={setMpesaPhone}
                                                            keyboardType="phone-pad"
                                                        />
                                                    </View>
                                                </View>
                                            )}
                                        </View>
                                    )}

                                    <View className="flex-row items-center justify-between mb-3">
                                        <Text className="text-sm font-medium text-white">
                                            Search for customer
                                        </Text>
                                        <TouchableOpacity
                                            onPress={() => setShowAddCustomerModal(true)}
                                            className="flex-row items-center bg-gray-800 px-3 py-2 rounded-lg"
                                        >
                                            <Ionicons name="person-add-outline" size={16} color="#fff" />
                                            <Text className="text-white ml-1 text-sm">
                                                New Customer
                                            </Text>
                                        </TouchableOpacity>
                                    </View>

                                    <View className="rounded-lg px-4 py-3 flex-row items-center mb-2 bg-gray-800">
                                        <Ionicons name="search-outline" size={20} color="#9CA3AF" />
                                        <TextInput
                                            className="flex-1 ml-3 text-white"
                                            placeholder="Search by name or phone..."
                                            placeholderTextColor="#9CA3AF"
                                            value={customerSearchQuery}
                                            onChangeText={setCustomerSearchQuery}
                                        />
                                    </View>

                                    {searchResults.length > 0 && (
                                        <View className="border border-gray-700 rounded-lg mb-2 bg-gray-800">
                                            {searchResults.map((customer) => (
                                                <TouchableOpacity
                                                    key={customer.id}
                                                    onPress={() => setSelectedCustomer(customer)}
                                                    className="p-3 border-b border-gray-700"
                                                >
                                                    <Text className="font-medium text-white">
                                                        {customer.name}
                                                    </Text>
                                                    <Text className="text-sm text-gray-400">
                                                        {customer.phone}
                                                    </Text>
                                                </TouchableOpacity>
                                            ))}
                                        </View>
                                    )}

                                    {selectedCustomer && (
                                        <View className="bg-green-900 border border-green-500 rounded-lg p-3">
                                            <Text className="font-medium text-green-100">
                                                ✓ {selectedCustomer.name}
                                            </Text>
                                            <Text className="text-sm text-green-300">
                                                {selectedCustomer.phone}
                                            </Text>
                                        </View>
                                    )}
                                </View>
                            )}
                        </TouchableOpacity>
                    </View>

                    <View className="bg-white px-4 py-4 mt-2">
                        <TouchableOpacity
                            onPress={handleProcessPayment}
                            className={`rounded-xl py-4 ${
                                !canProcessPayment() || isProcessing ? 'bg-gray-400' : 'bg-gray-900'
                            }`}
                            disabled={!canProcessPayment() || isProcessing}
                        >
                            <Text className="text-white text-center font-semibold text-lg">
                                {isProcessing 
                                    ? 'Processing...' 
                                    : remainingAmount > 0 
                                        ? `Remaining $${remainingAmount.toFixed(2)}`
                                        : `Pay $${roundedTotal.toFixed(2)}`
                                }
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
