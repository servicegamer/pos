import { CategoryItem as CategoryType, InventoryViewItem } from '@/types';
import { Feather } from '@expo/vector-icons';
import React, { useState } from 'react';
import { Text, TouchableOpacity, View } from 'react-native';

interface InventoryItemProps {
    item: InventoryViewItem;
    onSave: (updatedItem: any) => void;
    onDelete: (itemId: string) => void;
    availableCategories: CategoryType[];
    addCategory?: (newCategoryData: any) => Promise<any>;
    loadingCategories?: boolean;
    refreshCategories?: () => Promise<void>;
}

// this should be the main item :
export const InventoryItem: React.FC<InventoryItemProps> = ({
    item,
    onSave,
    onDelete,
    availableCategories,
    addCategory,
    loadingCategories,
    refreshCategories,
}) => {
    const getBorderClass = () => {
        // derive stock states from quantity/minStock
        if (item.quantity <= 0) return 'border border-red-300';
        if (item.quantity <= item.minStock) return 'border-2 border-orange-400';
        return 'border border-gray-100';
    };

    const [showEditModal, setShowEditModal] = useState(false);

    const handleSave = (updatedItem: any) => {
        onSave(updatedItem);
        setShowEditModal(false);
    };

    const handleDelete = (itemId: string) => {
        onDelete(itemId);
        setShowEditModal(false);
    };

    return (
        <>
            <View className={`bg-white rounded-lg mx-4 mb-2 px-4 py-3 ${getBorderClass()}`}>
                <View className='flex-row justify-between items-center'>
                    <View className='flex-1 flex-row items-center'>
                        <Text className='text-base font-medium text-gray-900'>{item.name}</Text>
                        {item.quantity <= item.minStock && (
                            <View className='bg-red-500 px-2 py-1 rounded ml-2'>
                                <Text className='text-white text-xs font-medium'>Low Stock</Text>
                            </View>
                        )}
                    </View>
                    <View className='mr-3 flex-row items-center'>
                        <Text className='text-xs font-bold mr-1 text-gray-600'>
                            {item.quantity}
                        </Text>
                        <Text className='text-xs text-gray-600'>{item.unit}</Text>
                    </View>
                    <TouchableOpacity
                        className='w-6 h-6 bg-gray-100 rounded items-center justify-center'
                        onPress={() => {
                            setShowEditModal(true);
                        }}>
                        <Feather name='edit' size={14} color='#6B7280' />
                    </TouchableOpacity>
                </View>
                <Text className='text-gray-600 text-sm mt-1'>
                    {item.category} | ${item.price.toFixed(2)} | {item.unit}
                </Text>
            </View>
        </>
    );
};
