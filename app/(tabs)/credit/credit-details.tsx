import React, { useState, useEffect } from 'react';
import { ScrollView, View, Text, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { CustomerDetailHeader } from '@/components/credit/details/CustomerDetailHeader';
import { CreditOverviewCard } from '@/components/credit/details/CreditOverviewCard';
import { TransactionHistory } from '@/components/credit/transaction/TransactionHistory';
import { database } from '@/db';
import { Q } from '@nozbe/watermelondb';
import Customer from '@/db/models/customers';
import Sale from '@/db/models/sales';

const CustomerCreditDetailScreen: React.FC = () => {
        const params = useLocalSearchParams();
        const [customer, setCustomer] = useState<Customer | null>(null);
        const [transactions, setTransactions] = useState<any[]>([]);
        const [isLoading, setIsLoading] = useState(true);

        useEffect(() => {
                const fetchCustomerData = async () => {
                        try {
                                const customerId = params.customerId as string;
                                const customersCollection = database.get<Customer>('customers');
                                const customerData = await customersCollection.find(customerId);
                                setCustomer(customerData);

                                const salesCollection = database.get<Sale>('sales');
                                const customerSales = await salesCollection
                                        .query(
                                                Q.where('customer_id', customerId),
                                                Q.sortBy('created_at', Q.desc)
                                        )
                                        .fetch();

                                const formattedTransactions = customerSales.map(sale => ({
                                        id: sale.id,
                                        type: sale.amountOnCredit > 0 ? 'Purchase' : 'Purchase',
                                        date: sale.createdAt.toISOString().split('T')[0],
                                        amount: -sale.amountOnCredit,
                                        isPurchase: true,
                                }));

                                setTransactions(formattedTransactions);
                        } catch (error) {
                                console.error('Error fetching customer data:', error);
                        } finally {
                                setIsLoading(false);
                        }
                };

                fetchCustomerData();
        }, [params.customerId]);

        const getCreditRating = (balance: number): 'Good' | 'Medium' | 'Low' => {
                if (balance > 100) return 'Low';
                if (balance > 50) return 'Medium';
                return 'Good';
        };

        const totalCredits = transactions
                .filter((t) => t.amount < 0)
                .reduce((sum, t) => sum + Math.abs(t.amount), 0);

        const totalPayments = transactions
                .filter((t) => t.amount > 0)
                .reduce((sum, t) => sum + t.amount, 0);

        const dueDate = new Date();
        dueDate.setDate(dueDate.getDate() + 7);

        const getDaysLeft = () => {
                const today = new Date();
                const diffTime = dueDate.getTime() - today.getTime();
                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                return diffDays;
        };

        const handleBack = () => {
                router.back();
        };

        const handleDelete = async () => {
                if (customer) {
                        await customer.markAsDeleted();
                        router.back();
                }
        };

        const handleTransactionPress = (transaction: any) => {
                router.push({
                        pathname: '/credit/transaction-detail',
                        params: {
                                transactionId: transaction.id,
                        },
                });
        };

        if (isLoading) {
                return (
                        <SafeAreaView className="flex-1 bg-gray-50">
                                <View className="flex-1 items-center justify-center">
                                        <ActivityIndicator size="large" color="#000" />
                                        <Text className="mt-4 text-gray-500">Loading customer details...</Text>
                                </View>
                        </SafeAreaView>
                );
        }

        if (!customer) {
                return (
                        <SafeAreaView className="flex-1 bg-gray-50">
                                <View className="flex-1 items-center justify-center">
                                        <Text className="text-gray-500">Customer not found</Text>
                                </View>
                        </SafeAreaView>
                );
        }

        return (
                <SafeAreaView className='flex-1 bg-gray-50'>
                        <CustomerDetailHeader
                                customerName={customer.name}
                                phoneNumber={customer.phone || 'No phone'}
                                rating={getCreditRating(customer.currentBalance)}
                                onBack={handleBack}
                                onDelete={handleDelete}
                        />

                        <ScrollView className='flex-1'>
                                <CreditOverviewCard
                                        currentBalance={customer.currentBalance}
                                        totalCredits={totalCredits}
                                        totalPayments={totalPayments}
                                        dueDate={dueDate.toISOString().split('T')[0]}
                                        daysLeft={getDaysLeft()}
                                />

                                <TransactionHistory
                                        transactions={transactions}
                                        onTransactionPress={handleTransactionPress}
                                />
                        </ScrollView>
                </SafeAreaView>
        );
};

export default CustomerCreditDetailScreen;
