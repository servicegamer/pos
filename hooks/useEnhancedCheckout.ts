import { useState, useCallback, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useBusiness } from '@/contexts/BusinessContext';
import { customerService } from '@/db/services/customerService';
import { salesService } from '@/db/services/salesService';
import Customer from '@/db/models/customers';
import type { CartItem } from '@/types';

export interface EnhancedCheckoutState {
    selectedPaymentMethod: 'mpesa' | 'store-credit' | 'cash' | null;
    mpesaAmount: string;
    mpesaPhone: string;
    cashAmount: string;
    creditAmount: string;
    creditRemainingMethod: 'mpesa' | 'cash';
    customerSearchQuery: string;
    selectedCustomer: Customer | null;
    searchResults: Customer[];
    isSearching: boolean;
    isProcessing: boolean;
}

export const useEnhancedCheckout = (cartItems: CartItem[], total: number) => {
    const { user } = useAuth();
    const { selectedStore, selectedBusiness } = useBusiness();

    const [state, setState] = useState<EnhancedCheckoutState>({
        selectedPaymentMethod: null,
        mpesaAmount: '',
        mpesaPhone: '',
        cashAmount: '',
        creditAmount: '',
        creditRemainingMethod: 'cash',
        customerSearchQuery: '',
        selectedCustomer: null,
        searchResults: [],
        isSearching: false,
        isProcessing: false,
    });

    const roundToTwoDecimals = (num: number) => Math.round(num * 100) / 100;

    const mpesaValue = roundToTwoDecimals(parseFloat(state.mpesaAmount) || 0);
    const cashValue = roundToTwoDecimals(parseFloat(state.cashAmount) || 0);
    const creditValue = roundToTwoDecimals(parseFloat(state.creditAmount) || 0);
    const roundedTotal = roundToTwoDecimals(total);

    const totalPaid = roundToTwoDecimals(mpesaValue + cashValue + creditValue);
    const remainingAmount = roundToTwoDecimals(roundedTotal - totalPaid);

    const isPartialCash = state.selectedPaymentMethod === 'cash' && 
                          cashValue > 0 && 
                          remainingAmount > 0;
    
    const isPartialMpesa = state.selectedPaymentMethod === 'mpesa' && 
                           mpesaValue > 0 && 
                           remainingAmount > 0;

    const isPartialCredit = state.selectedPaymentMethod === 'store-credit' && 
                            creditValue > 0 && 
                            remainingAmount > 0;

    const requiresCustomer = state.selectedPaymentMethod === 'store-credit' && creditValue > 0;

    useEffect(() => {
        const searchCustomers = async () => {
            if (!state.customerSearchQuery.trim() || !selectedBusiness) {
                setState((prev) => ({ ...prev, searchResults: [] }));
                return;
            }

            setState((prev) => ({ ...prev, isSearching: true }));

            try {
                const results = await customerService.searchCustomers(
                    selectedBusiness.id,
                    state.customerSearchQuery,
                );
                setState((prev) => ({ ...prev, searchResults: results, isSearching: false }));
            } catch (error) {
                console.error('Error searching customers:', error);
                setState((prev) => ({ ...prev, searchResults: [], isSearching: false }));
            }
        };

        const timeoutId = setTimeout(searchCustomers, 300);
        return () => clearTimeout(timeoutId);
    }, [state.customerSearchQuery, selectedBusiness]);

    const selectPaymentMethod = useCallback((method: 'mpesa' | 'store-credit' | 'cash') => {
        const currentTotal = roundedTotal.toFixed(2);
        
        setState((prev) => ({ 
            ...prev, 
            selectedPaymentMethod: method,
            mpesaAmount: method === 'mpesa' ? currentTotal : '0',
            cashAmount: method === 'cash' ? currentTotal : '0',
            creditAmount: method === 'store-credit' ? currentTotal : '0',
        }));
    }, [roundedTotal]);

    const switchToPartialPayment = useCallback((fromMethod: 'mpesa' | 'cash', toMethod: 'mpesa' | 'cash' | 'store-credit') => {
        setState((prev) => ({
            ...prev,
            selectedPaymentMethod: toMethod,
        }));
    }, []);

    const setMpesaAmount = useCallback((amount: string) => {
        setState((prev) => ({ ...prev, mpesaAmount: amount }));
    }, []);

    const setCashAmount = useCallback((amount: string) => {
        setState((prev) => ({ ...prev, cashAmount: amount }));
    }, []);

    const setCreditAmount = useCallback((amount: string) => {
        setState((prev) => ({ ...prev, creditAmount: amount }));
    }, []);

    const setMpesaPhone = useCallback((phone: string) => {
        setState((prev) => ({ ...prev, mpesaPhone: phone }));
    }, []);

    const setCreditRemainingMethod = useCallback((method: 'mpesa' | 'cash') => {
        setState((prev) => ({ ...prev, creditRemainingMethod: method }));
    }, []);

    const setCustomerSearchQuery = useCallback((query: string) => {
        setState((prev) => ({ ...prev, customerSearchQuery: query }));
    }, []);

    const selectCustomer = useCallback((customer: Customer | null) => {
        setState((prev) => ({
            ...prev,
            selectedCustomer: customer,
            customerSearchQuery: customer ? customer.name : '',
            searchResults: [],
        }));
    }, []);

    const createAndSelectCustomer = useCallback(
        async (customerData: { name?: string; phone?: string; email?: string }) => {
            if (!selectedBusiness) return;

            try {
                const { customer } = await customerService.findOrCreateCustomer({
                    businessId: selectedBusiness.id,
                    ...customerData,
                });

                selectCustomer(customer);
            } catch (error) {
                console.error('Error creating customer:', error);
            }
        },
        [selectedBusiness, selectCustomer],
    );

    const getPaymentError = useCallback((): string | null => {
        if (!user || !selectedStore) return 'Setup Required';
        if (cartItems.length === 0) return 'Cart is Empty';
        if (roundedTotal <= 0) return 'Invalid Total';

        const totalPaidCalc = mpesaValue + cashValue + creditValue;
        const difference = roundedTotal - totalPaidCalc;
        
        if (Math.abs(difference) > 0.001) {
            if (difference > 0) {
                return `Remaining $${difference.toFixed(2)}`;
            } else {
                return `Reduce by $${Math.abs(difference).toFixed(2)}`;
            }
        }

        if (mpesaValue > 0 && !state.mpesaPhone.trim()) {
            return 'Enter M-Pesa Phone';
        }

        if (creditValue > 0 && !state.selectedCustomer) {
            return 'Select Customer';
        }

        return null;
    }, [
        selectedStore,
        user,
        cartItems,
        state.mpesaPhone,
        state.selectedCustomer,
        mpesaValue,
        cashValue,
        creditValue,
        roundedTotal,
    ]);

    const canProcessPayment = useCallback((): boolean => {
        return getPaymentError() === null;
    }, [getPaymentError]);

    const processPayment = useCallback(async (): Promise<boolean> => {
        const validationError = getPaymentError();
        if (validationError) {
            console.error('Payment validation failed:', validationError);
            return false;
        }

        if (!user || !selectedStore) {
            console.error('User or store not selected');
            return false;
        }

        if (cartItems.length === 0) {
            console.error('Cart is empty');
            return false;
        }

        if (roundedTotal <= 0) {
            console.error('Invalid total amount');
            return false;
        }

        const totalPaidCalc = mpesaValue + cashValue + creditValue;
        if (Math.abs(totalPaidCalc - roundedTotal) > 0.001) {
            console.error('Payment amounts do not match total');
            return false;
        }

        if (mpesaValue > 0 && !state.mpesaPhone.trim()) {
            console.error('M-Pesa phone number required');
            return false;
        }

        if (creditValue > 0 && !state.selectedCustomer) {
            console.error('Customer required for credit payments');
            return false;
        }

        setState((prev) => ({ ...prev, isProcessing: true }));

        try {
            let amountPaid = 0;
            let amountOnCredit = 0;
            let paymentMethod: string = state.selectedPaymentMethod || 'cash';

            if (mpesaValue > 0 && cashValue > 0) {
                amountPaid = mpesaValue + cashValue;
                paymentMethod = 'split';
            } else if (mpesaValue > 0 && creditValue > 0) {
                amountPaid = mpesaValue;
                amountOnCredit = creditValue;
                paymentMethod = 'mpesa';
            } else if (cashValue > 0 && creditValue > 0) {
                amountPaid = cashValue;
                amountOnCredit = creditValue;
                paymentMethod = 'cash';
            } else if (state.selectedPaymentMethod === 'mpesa') {
                amountPaid = mpesaValue;
                paymentMethod = 'mpesa';
            } else if (state.selectedPaymentMethod === 'cash') {
                amountPaid = cashValue;
                paymentMethod = 'cash';
            } else if (state.selectedPaymentMethod === 'store-credit') {
                amountOnCredit = creditValue;
                if (isPartialCredit) {
                    amountPaid = remainingAmount;
                    paymentMethod = state.creditRemainingMethod;
                } else {
                    paymentMethod = 'store-credit';
                }
            }

            const onCredit = amountOnCredit > 0;

            const saleData = {
                storeId: selectedStore.id,
                userId: user.id,
                customerId: state.selectedCustomer?.id,
                subtotal: total,
                discountAmount: 0,
                discountPercentage: 0,
                totalAmount: total,
                paymentMethod,
                onCredit,
                amountPaid,
                amountOnCredit,
            };

            const items = cartItems.map((item) => ({
                productId: item.id,
                quantity: item.quantity,
                unitPrice: item.price,
                totalPrice: item.price * item.quantity,
            }));

            const sale = await salesService.createSale(saleData, items);
            await salesService.completeSale(sale.id, user.id);

            setState((prev) => ({ ...prev, isProcessing: false }));
            return true;
        } catch (error) {
            console.error('Error processing payment:', error);
            setState((prev) => ({ ...prev, isProcessing: false }));
            return false;
        }
    }, [
        getPaymentError,
        user,
        selectedStore,
        state.selectedCustomer,
        state.selectedPaymentMethod,
        state.creditRemainingMethod,
        state.mpesaPhone,
        mpesaValue,
        cashValue,
        creditValue,
        isPartialCredit,
        remainingAmount,
        roundedTotal,
        total,
        cartItems,
    ]);

    return {
        ...state,
        requiresCustomer,
        isPartialCredit,
        isPartialCash,
        isPartialMpesa,
        remainingAmount,
        totalPaid,
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
        selectCustomer,
        createAndSelectCustomer,
        processPayment,
        canProcessPayment,
        getPaymentError,
        total,
        roundedTotal,
    };
};
