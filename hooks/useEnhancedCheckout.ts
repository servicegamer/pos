import { useState, useCallback, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useBusiness } from '@/contexts/BusinessContext';
import { customerService } from '@/db/services/customerService';
import { salesService } from '@/db/services/salesService';
import Customer from '@/db/models/customers';
import type { CartItem } from '@/types';

export interface PaymentSplit {
    mpesa: string;
    cash: string;
    credit: string;
    mpesaPhone: string;
}

export interface EnhancedCheckoutState {
    paymentSplit: PaymentSplit;
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
        paymentSplit: {
            mpesa: '',
            cash: '',
            credit: '',
            mpesaPhone: '',
        },
        customerSearchQuery: '',
        selectedCustomer: null,
        searchResults: [],
        isSearching: false,
        isProcessing: false,
    });

    const mpesaAmount = parseFloat(state.paymentSplit.mpesa) || 0;
    const cashAmount = parseFloat(state.paymentSplit.cash) || 0;
    const creditAmount = parseFloat(state.paymentSplit.credit) || 0;
    const totalPaid = mpesaAmount + cashAmount;
    const remainingBalance = total - totalPaid - creditAmount;

    const requiresCustomer = creditAmount > 0;

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

    const setPaymentAmount = useCallback((method: 'mpesa' | 'cash' | 'credit', amount: string) => {
        setState((prev) => ({
            ...prev,
            paymentSplit: {
                ...prev.paymentSplit,
                [method]: amount,
            },
        }));
    }, []);

    const setMpesaPhone = useCallback((phone: string) => {
        setState((prev) => ({
            ...prev,
            paymentSplit: {
                ...prev.paymentSplit,
                mpesaPhone: phone,
            },
        }));
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
            const amountPaid = mpesaAmount + cashAmount;
            const amountOnCredit = creditAmount;

            let paymentMethod = 'cash';
            if (mpesaAmount > 0 && cashAmount > 0) {
                paymentMethod = 'split';
            } else if (mpesaAmount > 0) {
                paymentMethod = 'mpesa';
            } else if (creditAmount > 0 && amountPaid === 0) {
                paymentMethod = 'store-credit';
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
        mpesaAmount,
        cashAmount,
        creditAmount,
        total,
        cartItems,
        requiresCustomer,
    ]);

    const canProcessPayment = useCallback((): boolean => {
        if (!selectedStore || !user) return false;
        if (cartItems.length === 0) return false;

        if (mpesaAmount < 0 || cashAmount < 0 || creditAmount < 0) return false;

        if (Math.abs(remainingBalance) > 0.01) return false;

        if (mpesaAmount > 0 && !state.paymentSplit.mpesaPhone.trim()) return false;

        if (creditAmount > 0 && !state.selectedCustomer) return false;

        if (mpesaAmount === 0 && cashAmount === 0 && creditAmount === 0) return false;

        return true;
    }, [
        selectedStore,
        user,
        cartItems,
        mpesaAmount,
        cashAmount,
        creditAmount,
        remainingBalance,
        state.paymentSplit.mpesaPhone,
        state.selectedCustomer,
    ]);

    return {
        ...state,
        requiresCustomer,
        mpesaAmount,
        cashAmount,
        creditAmount,
        totalPaid,
        remainingBalance,
        setPaymentAmount,
        setMpesaPhone,
        setCustomerSearchQuery,
        selectCustomer,
        createAndSelectCustomer,
        processPayment,
        canProcessPayment,
        total,
    };
};
