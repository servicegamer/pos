import React from 'react';
import { View, Text, FlatList } from 'react-native';
import { ProductItem } from './ProductItem';

interface ProductsListProps {
  data: any[];
  onEditProduct: (item: any) => void;
}

export const ProductsList: React.FC<ProductsListProps> = ({ data, onEditProduct }) => {
  return (
    <View className="flex-1">
      <View className="flex-row justify-between items-center px-4 py-3">
        <Text className="text-lg font-semibold text-gray-900">Products</Text>
        <Text className="text-gray-600">{data.length} products</Text>
      </View>
      
      <FlatList
        data={data}
        keyExtractor={item => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 20 }}
        renderItem={({ item }) => (
          <ProductItem item={item} onEdit={onEditProduct} />
        )}
      />
    </View>
  );
};