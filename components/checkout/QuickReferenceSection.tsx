import { useBusiness } from '@/contexts/BusinessContext';
import { mostSoldService } from '@/db/services/mostSoldService';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Text, View } from 'react-native';
import { SectionTitle } from '../common/SectionTitle';
import { QuickReferenceItem } from './QuickReferenceItem';

interface MostSoldItem {
    id: string;
    name: string;
    price: string;
}

export const QuickReferenceSection: React.FC = () => {
    const { selectedStore } = useBusiness();
    const [mostSoldItems, setMostSoldItems] = useState<MostSoldItem[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadMostSoldProducts = async () => {
            if (!selectedStore) {
                setLoading(false);
                return;
            }

            try {
                const products = await mostSoldService.getMostSoldProducts(selectedStore.id, 5);

                const items: MostSoldItem[] = products.map((product) => ({
                    id: product.inventoryId,
                    name: product.productName,
                    price: `$${product.price.toFixed(2)}`,
                }));

                setMostSoldItems(items);
            } catch (error) {
                console.error('Error loading most sold products:', error);
            } finally {
                setLoading(false);
            }
        };

        loadMostSoldProducts();
    }, [selectedStore]);

    if (loading) {
        return (
            <View className='px-4 mt-6 mb-6'>
                <SectionTitle title='Quick Reference - Most Sold' />
                <View className='py-4 items-center'>
                    <ActivityIndicator size='small' color='#000' />
                </View>
            </View>
        );
    }

    if (mostSoldItems.length === 0) {
        return (
            <View className='px-4 mt-6 mb-6'>
                <SectionTitle title='Quick Reference - Most Sold' />
                <Text className='text-gray-500 text-center py-4'>
                    No sales data available yet
                </Text>
            </View>
        );
    }

    return (
        <View className='px-4 mt-6 mb-6'>
            <SectionTitle title='Quick Reference - Most Sold' />
            {mostSoldItems.map((item) => (
                <QuickReferenceItem key={item.id} item={item} />
            ))}
        </View>
    );
};