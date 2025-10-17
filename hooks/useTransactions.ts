import { useState, useEffect, useMemo } from 'react';
import { useBusiness } from '@/contexts/BusinessContext';
import { salesService } from '@/db/services/salesService';
import Sale from '@/db/models/sales';

export const useTransactions = () => {
    const { selectedStore } = useBusiness();
    const [transactions, setTransactions] = useState<Sale[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        const fetchTransactions = async () => {
            if (!selectedStore) {
                setTransactions([]);
                setIsLoading(false);
                return;
            }

            setIsLoading(true);
            try {
                const sales = await salesService.getSalesByStore(selectedStore.id, 200);
                setTransactions(sales);
            } catch (error) {
                console.error('Error fetching transactions:', error);
                setTransactions([]);
            } finally {
                setIsLoading(false);
            }
        };

        fetchTransactions();
    }, [selectedStore]);

    const filteredTransactions = useMemo(() => {
        if (!searchQuery.trim()) return transactions;

        const query = searchQuery.toLowerCase();
        return transactions.filter(
            (transaction) =>
                transaction.externalId.toLowerCase().includes(query) ||
                transaction.paymentMethod.toLowerCase().includes(query),
        );
    }, [transactions, searchQuery]);

    const todayTransactions = useMemo(() => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        return transactions.filter((t) => t.createdAt >= today);
    }, [transactions]);

    const totalRevenue = useMemo(() => {
        return transactions.reduce((sum, t) => sum + (t.amountPaid || 0), 0);
    }, [transactions]);

    const totalCredit = useMemo(() => {
        return transactions.reduce((sum, t) => sum + (t.amountOnCredit || 0), 0);
    }, [transactions]);

    return {
        transactions: filteredTransactions,
        allTransactions: transactions,
        todayTransactions,
        isLoading,
        searchQuery,
        setSearchQuery,
        totalRevenue,
        totalCredit,
    };
};
