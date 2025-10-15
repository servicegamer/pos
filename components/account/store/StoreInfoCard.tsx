import Business from '@/db/models/business';
import Store from '@/db/models/stores';
import { ChevronDown, Edit, Store as StoreIcon } from 'lucide-react-native';
import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';

interface StoreInfoCardProps {
    store: Store | null;
    business: Business | null;
    onStoreEditPress: (storeExternalId: string) => void;
    onSwitchStore: () => void;
}

export const StoreInfoCard: React.FC<StoreInfoCardProps> = ({
    store,
    business,
    onStoreEditPress,
    onSwitchStore,
}) => {
    if (!store || !business) return <Text>No store selected</Text>;
    return (
        <View className='mb-4 rounded-2xl bg-white p-4 shadow-sm'>
            <View className='flex-row justify-between items-center mb-3'>
                <View className='flex-row items-center'>
                    <StoreIcon size={20} color='#374151' />
                    <Text className='ml-2 font-semibold text-gray-900'>Store Information</Text>
                </View>
                <TouchableOpacity onPress={() => onStoreEditPress(store.externalId!)}>
                    <Edit size={20} color='#374151' />
                </TouchableOpacity>
            </View>

            <Text className='font-semibold text-gray-900 text-base mb-1'>{store.name}</Text>
            <Text className='text-sm text-gray-500 mb-3'>Business: {business.name}</Text>

            <TouchableOpacity
                onPress={onSwitchStore}
                className='border border-gray-200 rounded-lg p-3 flex-row justify-between items-center'>
                <Text className='text-sm text-gray-700'>Switch Store</Text>
                <View className='flex-row items-center'>
                    <Text className='text-sm text-gray-900 mr-2'>{store.name}</Text>
                    <ChevronDown size={16} color='#374151' />
                </View>
            </TouchableOpacity>
        </View>
    );
};
