import { useState, useCallback, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useBusiness } from '@/contexts/BusinessContext';
import { customerService } from '@/db/services/customerService';
import { salesService } from '@/db/services/salesService';
import Customer from '@/db/models/customers';
import type { CartItem } from '@/types';

export interface EnhancedCheckoutState {
    selectedPaymentMethod: string;
    partialPaymentAmount: string;
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
        selectedPaymentMethod: 'cash',
        partialPaymentAmount: '',
        customerSearchQuery: '',
        selectedCustomer: null,
        searchResults: [],
        isSearching: false,
        isProcessing: false,
    });

    const requiresCustomer = state.selectedPaymentMethod === 'store-credit' || 
                             (state.partialPaymentAmount && parseFloat(state.partialPaymentAmount) > 0);

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

    const selectPaymentMethod = useCallback((method: string) => {
        setState((prev) => ({ ...prev, selectedPaymentMethod: method }));
    }, []);

    const setPartialPaymentAmount = useCallback((amount: string) => {
        setState((prev) => ({ ...prev, partialPaymentAmount: amount }));
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
            console.error('Customer required for this payment type');
            return false;
        }

        setState((prev) => ({ ...prev, isProcessing: true }));

        try {
            const partialAmount = state.partialPaymentAmount
                ? parseFloat(state.partialPaymentAmount)
                : 0;
            
            let amountPaid: number;
            let amountOnCredit: number;
            
            if (state.selectedPaymentMethod === 'store-credit') {
                amountPaid = 0;
                amountOnCredit = total;
            } else if (partialAmount > 0) {
                amountPaid = total - partialAmount;
                amountOnCredit = partialAmount;
            } else {
                amountPaid = total;
                amountOnCredit = 0;
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
                paymentMethod: state.selectedPaymentMethod,
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
    }, [user, selectedStore, state, total, cartItems, requiresCustomer]);

    const canProcessPayment = useCallback((): boolean => {
        if (!selectedStore || !user) return false;
        if (cartItems.length === 0) return false;

        if (state.selectedPaymentMethod === 'store-credit') {
            return !!state.selectedCustomer;
        }

        if (state.partialPaymentAmount) {
            const partialAmount = parseFloat(state.partialPaymentAmount);
            if (partialAmount < 0 || partialAmount > total) return false;
            if (!state.selectedCustomer) return false;
        }

        return true;
    }, [selectedStore, user, cartItems, state, total]);

    return {
        ...state,
        requiresCustomer,
        selectPaymentMethod,
        setPartialPaymentAmount,
        setCustomerSearchQuery,
        selectCustomer,
        createAndSelectCustomer,
        processPayment,
        canProcessPayment,
        total,
    };
};
