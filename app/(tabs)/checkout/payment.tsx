import React from 'react';
import { ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Header } from '@/components/common/Header';
import { BackButton } from '@/components/common/BackButton';
import { OrderSummary } from '@/components/checkout/OrderSummary';
import { PaymentMethodsSection } from '@/components/checkout/PaymentMethodsSection';
import { PayButton } from '@/components/checkout/PayButton';
import { usePaymentMethods } from '@/hooks/usePaymentMethods';
import { useCheckoutLogic } from '@/hooks/useCheckoutLogic';
import { useCart } from '@/contexts/CartContext';

const PaymentScreen: React.FC = () => {
        const { cart, clearCart } = useCart();

        const {
                paymentMethods,
                selectedPaymentMethod,
                showStoreCreditForm,
                creditAmount,
                setCreditAmount,
                storeCreditFormHeight,
                storeCreditOpacity,
                handlePaymentMethodSelect,
        } = usePaymentMethods();

        // Handler for payment completion
        const handlePaymentComplete = (paymentMethod: string, amount: number) => {
                console.log(`Payment: ${paymentMethod}, Amount: $${amount}`);
                clearCart();
                // Navigate back to main checkout screen
                router.push('/(tabs)/checkout/payment');
        };

        const {
                searchQuery,
                setSearchQuery,
                isSearchFocused,
                handleSearchFocus,
                handleSearchBlur,
                total,
                maxCredit,
                handlePay,
                getPayAmount,
                isPayButtonDisabled,
        } = useCheckoutLogic(cart, selectedPaymentMethod, creditAmount, handlePaymentComplete);

        return (
                <SafeAreaView className='flex-1 bg-gray-50'>
                        <KeyboardAvoidingView
                                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                                className='flex-1'>
                                <ScrollView
                                        className='flex-1'
                                        showsVerticalScrollIndicator={false}
                                        keyboardShouldPersistTaps='handled'>
                                        <Header title='Checkout'>
                                                {/* Use router.back() instead of onBack prop */}
                                                <BackButton onPress={() => router.back()} className='mr-4' />
                                        </Header>

                                        <OrderSummary cartItems={cart} total={total} />

                                        <PaymentMethodsSection
                                                paymentMethods={paymentMethods}
                                                selectedPaymentMethod={selectedPaymentMethod}
                                                onPaymentMethodSelect={handlePaymentMethodSelect}
                                                showStoreCreditForm={showStoreCreditForm}
                                                creditAmount={creditAmount}
                                                onCreditAmountChange={setCreditAmount}
                                                maxCredit={maxCredit}
                                                searchQuery={searchQuery}
                                                onSearchChange={setSearchQuery}
                                                isSearchFocused={isSearchFocused}
                                                onSearchFocus={handleSearchFocus}
                                                onSearchBlur={handleSearchBlur}
                                                storeCreditFormHeight={storeCreditFormHeight}
                                                storeCreditOpacity={storeCreditOpacity}
                                        />

                                        <PayButton
                                                onPress={handlePay}
                                                amount={getPayAmount()}
                                                disabled={isPayButtonDisabled()}
                                        />
                                </ScrollView>
                        </KeyboardAvoidingView>
                </SafeAreaView>
        );
};

export default PaymentScreen;
