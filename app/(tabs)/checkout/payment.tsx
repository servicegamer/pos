import React, { useState } from 'react';
import { ScrollView, KeyboardAvoidingView, Platform, View, Text, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Header } from '@/components/common/Header';
import { BackButton } from '@/components/common/BackButton';
import { OrderSummary } from '@/components/checkout/OrderSummary';
import { PaymentMethodsSection } from '@/components/checkout/PaymentMethodsSection';
import { CustomerSearchSelector } from '@/components/checkout/CustomerSearchSelector';
import { PartialPaymentInput } from '@/components/checkout/PartialPaymentInput';
import { AddCustomerModal } from '@/components/checkout/AddCustomerModal';
import { usePaymentMethods } from '@/hooks/usePaymentMethods';
import { useEnhancedCheckout } from '@/hooks/useEnhancedCheckout';
import { useCart } from '@/contexts/CartContext';

const PaymentScreen: React.FC = () => {
    const { cart, clearCart } = useCart();
    const [showPartialPayment, setShowPartialPayment] = useState(false);
    const [showAddCustomerModal, setShowAddCustomerModal] = useState(false);

    const {
        paymentMethods,
        selectedPaymentMethod,
        handlePaymentMethodSelect,
    } = usePaymentMethods();

    const {
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

    const handlePaymentMethodChange = (methodId: string) => {
        handlePaymentMethodSelect(methodId);
        selectPaymentMethod(methodId);
    };

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
        selectedPaymentMethod === 'store-credit' || partialPaymentAmount
            ? total - (parseFloat(partialPaymentAmount) || 0)
            : total;

    return (
        <SafeAreaView className="flex-1 bg-gray-50">
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

                    <PaymentMethodsSection
                        paymentMethods={paymentMethods}
                        selectedPaymentMethod={selectedPaymentMethod}
                        onPaymentMethodSelect={handlePaymentMethodChange}
                        showStoreCreditForm={false}
                        creditAmount=""
                        onCreditAmountChange={() => {}}
                        maxCredit={total}
                        searchQuery=""
                        onSearchChange={() => {}}
                        isSearchFocused={false}
                        onSearchFocus={() => {}}
                        onSearchBlur={() => {}}
                        storeCreditFormHeight={new (require('react-native').Animated.Value)(0)}
                        storeCreditOpacity={new (require('react-native').Animated.Value)(0)}
                    />

                    {selectedPaymentMethod !== 'store-credit' && (
                        <View className="mx-4 mt-3">
                            <TouchableOpacity
                                onPress={() => setShowPartialPayment(!showPartialPayment)}
                                className="bg-blue-50 border border-blue-200 rounded-lg p-3"
                            >
                                <Text className="text-blue-700 font-medium text-center">
                                    {showPartialPayment ? 'Remove' : 'Add'} Partial Payment
                                </Text>
                            </TouchableOpacity>
                        </View>
                    )}

                    {showPartialPayment && selectedPaymentMethod !== 'store-credit' && (
                        <View className="mx-4">
                            <PartialPaymentInput
                                amount={partialPaymentAmount}
                                onAmountChange={setPartialPaymentAmount}
                                total={total}
                            />
                        </View>
                    )}

                    {requiresCustomer && (
                        <View className="mx-4 mt-4">
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
