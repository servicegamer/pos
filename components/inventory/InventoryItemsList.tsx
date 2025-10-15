import { CategoryItem, InventoryViewItem } from '@/types';
import React from 'react';
import { FlatList, Text, View } from 'react-native';
import { InventoryItem } from './InventoryItem';

interface InventoryListProps {
    data: InventoryViewItem[];
    filterText: string | undefined;
    onSave: (updatedItem: any) => void;
    onDelete: (itemId: string) => void;
    availableCategories: CategoryItem[];
}

export const InventoryList: React.FC<InventoryListProps> = ({
    data,
    filterText,
    onSave,
    onDelete,
    availableCategories,
}) => {
    return (
        <View className='flex-1'>
            <View className='flex-row justify-between items-center px-4 py-3'>
                <Text className='text-lg font-semibold text-gray-900'>Inventory Items</Text>
                <Text className='text-gray-600'>{filterText}</Text>
            </View>

            <FlatList
                data={data}
                keyExtractor={(item) => item.id}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom: 20 }}
                renderItem={({ item }) => (
                    <InventoryItem
                        item={item}
                        onSave={onSave}
                        onDelete={onDelete}
                        availableCategories={availableCategories}
                    />
                )}
            />
        </View>
    );
};
