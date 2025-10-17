import { useState, useEffect, useMemo } from 'react';
import { customerService } from '@/db/services/customerService';
import { useBusiness } from '@/contexts/BusinessContext';
import Customer from '@/db/models/customers';

export const useRealCreditData = () => {
    const { selectedBusiness } = useBusiness();
    const [customers, setCustomers] = useState<Customer[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
    const [paymentAmount, setPaymentAmount] = useState('');

    useEffect(() => {
        const fetchCustomersWithCredit = async () => {
            if (!selectedBusiness) {
                setCustomers([]);
                setIsLoading(false);
                return;
            }

            setIsLoading(true);
            try {
                const customersWithCredit = await customerService.getCustomersWithCredit(
                    selectedBusiness.id,
                );
                setCustomers(customersWithCredit);
            } catch (error) {
                console.error('Error fetching customers with credit:', error);
                setCustomers([]);
            } finally {
                setIsLoading(false);
            }
        };

        fetchCustomersWithCredit();
    }, [selectedBusiness]);

    const filteredCustomers = useMemo(() => {
        if (!searchQuery.trim()) return customers;

        const query = searchQuery.toLowerCase();
        return customers.filter(
            (customer) =>
                customer.name.toLowerCase().includes(query) ||
                customer.phone?.toLowerCase().includes(query) ||
                customer.email?.toLowerCase().includes(query),
        );
    }, [customers, searchQuery]);

    const totalCreditAmount = useMemo(() => {
        return customers.reduce((sum, customer) => sum + (customer.currentBalance || 0), 0);
    }, [customers]);

    const handleRecordPayment = async () => {
        if (!selectedCustomer || !paymentAmount) {
            console.error('Customer and payment amount required');
            return;
        }

        try {
            const amount = parseFloat(paymentAmount);
            if (amount <= 0 || amount > selectedCustomer.currentBalance) {
                console.error('Invalid payment amount');
                return;
            }

            await customerService.recordPayment(selectedCustomer.id, amount);

            const updatedCustomers = customers.map((c) =>
                c.id === selectedCustomer.id
                    ? {
                          ...c,
                          currentBalance: Math.max(0, c.currentBalance - amount),
                      }
                    : c,
            );
            setCustomers(updatedCustomers as Customer[]);

            setSelectedCustomer(null);
            setPaymentAmount('');
        } catch (error) {
            console.error('Error recording payment:', error);
        }
    };

    return {
        customers: filteredCustomers,
        allCustomers: customers,
        isLoading,
        searchQuery,
        setSearchQuery,
        totalCreditAmount,
        selectedCustomer,
        setSelectedCustomer,
        paymentAmount,
        setPaymentAmount,
        handleRecordPayment,
    };
};
