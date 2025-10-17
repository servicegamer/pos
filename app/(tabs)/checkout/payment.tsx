import React, { useState } from 'react';
import { ScrollView, KeyboardAvoidingView, Platform, View, Text, TouchableOpacity, Alert, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Header } from '@/components/common/Header';
import { BackButton } from '@/components/common/BackButton';
import { OrderSummary } from '@/components/checkout/OrderSummary';
import { CustomerSearchSelector } from '@/components/checkout/CustomerSearchSelector';
import { AddCustomerModal } from '@/components/checkout/AddCustomerModal';
import { useEnhancedCheckout } from '@/hooks/useEnhancedCheckout';
import { useCart } from '@/contexts/CartContext';

const PaymentScreen: React.FC = () => {
    const { cart, clearCart } = useCart();
    const [showAddCustomerModal, setShowAddCustomerModal] = useState(false);
    const [mpesaPhoneNumber, setMpesaPhoneNumber] = useState('');

    const {
        selectedPaymentMethod,
        partialPaymentAmount,
        customerSearchQuery,
        selectedCustomer,
        searchResults,
        isSearching,
        isProcessing,
        requiresCustomer,
        selectPaymentMethod,
        setPartialPaymentAmount,
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

    const payAmount =
        selectedPaymentMethod === 'store-credit'
            ? 0
            : partialPaymentAmount
              ? total - parseFloat(partialPaymentAmount)
              : total;

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
                    <Header title="Checkout">
                        <BackButton onPress={() => router.back()} className="mr-4" />
                    </Header>

                    <OrderSummary cartItems={cart} total={total} />

                    <View className="px-4 py-4">
                        <Text className="text-xl font-bold mb-4">Payment Method</Text>

                        <TouchableOpacity
                            onPress={() => selectPaymentMethod('mpesa')}
                            className={`border rounded-lg p-4 mb-3 flex-row items-center ${
                                selectedPaymentMethod === 'mpesa'
                                    ? 'border-green-500 bg-green-50'
                                    : 'border-gray-200 bg-white'
                            }`}
                        >
                            <View className="w-12 h-12 bg-green-500 rounded-lg items-center justify-center mr-3">
                                <Ionicons name="phone-portrait-outline" size={24} color="#fff" />
                            </View>
                            <View>
                                <Text className="text-base font-semibold text-gray-900">
                                    M-Pesa
                                </Text>
                                <Text className="text-sm text-gray-500">Pay with mobile money</Text>
                            </View>
                        </TouchableOpacity>

                        {selectedPaymentMethod === 'mpesa' && (
                            <View className="mb-3 px-4">
                                <Text className="text-sm text-gray-600 mb-2">Phone Number</Text>
                                <TextInput
                                    className="border border-gray-300 rounded-lg px-4 py-3 text-base"
                                    placeholder="07XX XXX XXX"
                                    value={mpesaPhoneNumber}
                                    onChangeText={setMpesaPhoneNumber}
                                    keyboardType="phone-pad"
                                />
                            </View>
                        )}

                        <TouchableOpacity
                            onPress={() => selectPaymentMethod('store-credit')}
                            className={`rounded-lg p-4 mb-3 ${
                                selectedPaymentMethod === 'store-credit'
                                    ? 'bg-gray-900'
                                    : 'border border-gray-200 bg-white'
                            }`}
                        >
                            <View className="flex-row items-center mb-3">
                                <View
                                    className={`w-12 h-12 rounded-lg items-center justify-center mr-3 ${
                                        selectedPaymentMethod === 'store-credit'
                                            ? 'bg-blue-500'
                                            : 'bg-gray-200'
                                    }`}
                                >
                                    <Ionicons
                                        name="card-outline"
                                        size={24}
                                        color={
                                            selectedPaymentMethod === 'store-credit'
                                                ? '#fff'
                                                : '#666'
                                        }
                                    />
                                </View>
                                <View>
                                    <Text
                                        className={`text-base font-semibold ${
                                            selectedPaymentMethod === 'store-credit'
                                                ? 'text-white'
                                                : 'text-gray-900'
                                        }`}
                                    >
                                        Store Credit
                                    </Text>
                                    <Text
                                        className={`text-sm ${
                                            selectedPaymentMethod === 'store-credit'
                                                ? 'text-gray-400'
                                                : 'text-gray-500'
                                        }`}
                                    >
                                        Use customer credit
                                    </Text>
                                </View>
                            </View>

                            {selectedPaymentMethod === 'store-credit' && (
                                <View>
                                    <Text className="text-white mb-2">Amount to pay on credit</Text>
                                    <View className="bg-gray-800 rounded-lg px-4 py-3 mb-3">
                                        <Text className="text-white text-2xl">
                                            $ {total.toFixed(2)}
                                        </Text>
                                    </View>
                                    <Text className="text-gray-400 text-sm mb-3">
                                        Maximum: ${total.toFixed(2)}
                                    </Text>

                                    <View className="flex-row items-center justify-between mb-3">
                                        <Text className="text-white font-medium">
                                            Search for customer
                                        </Text>
                                        <TouchableOpacity
                                            onPress={() => setShowAddCustomerModal(true)}
                                            className="flex-row items-center"
                                        >
                                            <Ionicons
                                                name="person-add-outline"
                                                size={20}
                                                color="#fff"
                                            />
                                            <Text className="text-white ml-1">New Customer</Text>
                                        </TouchableOpacity>
                                    </View>

                                    <View className="bg-gray-800 rounded-lg px-4 py-3 flex-row items-center">
                                        <Ionicons
                                            name="search-outline"
                                            size={20}
                                            color="#9CA3AF"
                                        />
                                        <TextInput
                                            className="flex-1 ml-3 text-white"
                                            placeholder="Search by name or phone..."
                                            placeholderTextColor="#6B7280"
                                            value={customerSearchQuery}
                                            onChangeText={setCustomerSearchQuery}
                                        />
                                    </View>

                                    {searchResults.length > 0 && (
                                        <View className="mt-2 bg-gray-800 rounded-lg">
                                            {searchResults.map((customer) => (
                                                <TouchableOpacity
                                                    key={customer.id}
                                                    onPress={() => setSelectedCustomer(customer)}
                                                    className="p-3 border-b border-gray-700"
                                                >
                                                    <Text className="text-white font-medium">
                                                        {customer.name}
                                                    </Text>
                                                    <Text className="text-gray-400 text-sm">
                                                        {customer.phone}
                                                    </Text>
                                                </TouchableOpacity>
                                            ))}
                                        </View>
                                    )}

                                    {selectedCustomer && (
                                        <View className="mt-2 bg-green-900 rounded-lg p-3">
                                            <Text className="text-white font-medium">
                                                ✓ {selectedCustomer.name}
                                            </Text>
                                            <Text className="text-green-300 text-sm">
                                                {selectedCustomer.phone}
                                            </Text>
                                        </View>
                                    )}
                                </View>
                            )}
                        </TouchableOpacity>

                        <TouchableOpacity
                            onPress={() => selectPaymentMethod('cash')}
                            className={`border rounded-lg p-4 mb-3 flex-row items-center ${
                                selectedPaymentMethod === 'cash'
                                    ? 'border-orange-500 bg-orange-50'
                                    : 'border-gray-200 bg-white'
                            }`}
                        >
                            <View className="w-12 h-12 bg-orange-500 rounded-lg items-center justify-center mr-3">
                                <Ionicons name="cash-outline" size={24} color="#fff" />
                            </View>
                            <View>
                                <Text className="text-base font-semibold text-gray-900">Cash</Text>
                                <Text className="text-sm text-gray-500">Cash payment</Text>
                            </View>
                        </TouchableOpacity>

                        {selectedPaymentMethod !== 'store-credit' && (
                            <View className="mt-4 mb-4">
                                <Text className="text-sm text-gray-600 mb-2">
                                    Amount on Credit (Optional)
                                </Text>
                                <View className="flex-row items-center border border-gray-300 rounded-lg px-4 py-3">
                                    <Text className="text-gray-600 mr-2">$</Text>
                                    <TextInput
                                        className="flex-1 text-base"
                                        placeholder="0.00"
                                        value={partialPaymentAmount}
                                        onChangeText={setPartialPaymentAmount}
                                        keyboardType="decimal-pad"
                                    />
                                </View>
                                <Text className="text-gray-500 text-xs mt-1">
                                    Maximum: ${total.toFixed(2)}
                                </Text>
                            </View>
                        )}

                        {requiresCustomer && selectedPaymentMethod !== 'store-credit' && (
                            <View className="mt-4">
                                <CustomerSearchSelector
                                    searchQuery={customerSearchQuery}
                                    onSearchChange={setCustomerSearchQuery}
                                    searchResults={searchResults}
                                    selectedCustomer={selectedCustomer}
                                    onSelectCustomer={setSelectedCustomer}
                                    isSearching={isSearching}
                                    onAddNewCustomer={() => setShowAddCustomerModal(true)}
                                />
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
                                    : selectedPaymentMethod === 'store-credit'
                                      ? `Place on Credit $${total.toFixed(2)}`
                                      : `Pay $${payAmount.toFixed(2)}`}
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
