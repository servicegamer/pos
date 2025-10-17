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
        setState((prev) => ({ 
            ...prev, 
            selectedPaymentMethod: method,
        }));
    }, []);

    const switchToPartialPayment = useCallback((fromMethod: 'mpesa' | 'cash', toMethod: 'mpesa' | 'cash' | 'store-credit') => {
        const remaining = remainingAmount;
        
        setState((prev) => ({
            ...prev,
            selectedPaymentMethod: toMethod,
            mpesaAmount: toMethod === 'mpesa' ? remaining.toFixed(2) : prev.mpesaAmount,
            cashAmount: toMethod === 'cash' ? remaining.toFixed(2) : prev.cashAmount,
            creditAmount: toMethod === 'store-credit' ? remaining.toFixed(2) : prev.creditAmount,
        }));
    }, [remainingAmount]);

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

    const processPayment = useCallback(async (): Promise<boolean> => {
        if (!user || !selectedStore) {
            console.error('User or store not selected');
            return false;
        }

        if (requiresCustomer && !state.selectedCustomer) {
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
        user,
        selectedStore,
        state.selectedCustomer,
        state.selectedPaymentMethod,
        state.creditRemainingMethod,
        mpesaValue,
        cashValue,
        creditValue,
        isPartialCredit,
        remainingAmount,
        total,
        cartItems,
        requiresCustomer,
    ]);

    const canProcessPayment = useCallback((): boolean => {
        if (!selectedStore || !user) return false;
        if (cartItems.length === 0) return false;

        const totalPaid = mpesaValue + cashValue + creditValue;
        
        if (Math.abs(totalPaid - roundedTotal) > 0.001) return false;

        if (mpesaValue > 0 && !state.mpesaPhone.trim()) return false;

        if (creditValue > 0 && !state.selectedCustomer) return false;

        return true;
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
        total,
        roundedTotal,
    };
};
