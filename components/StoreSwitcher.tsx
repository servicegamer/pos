import { useBusiness } from '@/contexts/BusinessContext';
import React from 'react';
import { FlatList, Text, TouchableOpacity, View } from 'react-native';

const StoreSwitcher: React.FC = () => {
    const { stores, selectedStore, selectStore } = useBusiness();

    if (!stores || stores.length === 0) {
        return (
            <View>
                <Text className='text-gray-500'>No stores available</Text>
            </View>
        );
    }

    return (
        <View>
            <Text className='text-lg font-semibold mb-2'>Active Stores</Text>
            <FlatList
                data={stores}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => {
                    const isSelected = selectedStore?.id === item.id;
                    return (
                        <TouchableOpacity
                            className={`p-3 rounded-lg mb-2 ${isSelected ? 'bg-blue-50' : 'bg-white'}`}
                            onPress={() => selectStore(item.id)}>
                            <Text
                                className={`text-sm ${isSelected ? 'text-blue-600 font-semibold' : 'text-gray-800'}`}>
                                {item.displayName}
                            </Text>
                            {item.address ? (
                                <Text className='text-xs text-gray-500'>{item.address}</Text>
                            ) : null}
                        </TouchableOpacity>
                    );
                }}
            />
        </View>
    );
};

export default StoreSwitcher;
