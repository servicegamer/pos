import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Feather } from '@expo/vector-icons';

interface ProductData {
  id: string;
  name: string;
  brand: string;
  code: string;
  price: number;
  quantity: number;
  unit: string;
  isLowStock: boolean;
  isOut: boolean;
  quantityText: string;
}

interface ProductItemProps {
  item: ProductData;
  onEdit: (item: ProductData) => void;
}

export const ProductItem: React.FC<ProductItemProps> = ({ item, onEdit }) => {
  const getBorderClass = () => {
    if (item.isLowStock) return 'border-2 border-orange-400';
    if (item.isOut) return 'border border-red-300';
    return 'border border-gray-100';
  };

  return (
    <View className={`bg-white rounded-lg mx-4 mb-2 px-4 py-3 ${getBorderClass()}`}>
      <View className="flex-row justify-between items-center">
        <View className="flex-1">
          <View className="flex-row items-center mb-1">
            <Text className="text-base font-medium text-gray-900">
              {item.name}
            </Text>
            {item.isLowStock && (
              <View className="bg-orange-500 px-2 py-0.5 rounded ml-2">
                <Text className="text-white text-xs font-semibold">Low Stock</Text>
              </View>
            )}
            {item.isOut && (
              <View className="bg-red-500 px-2 py-0.5 rounded ml-2">
                <Text className="text-white text-xs font-semibold">Out of Stock</Text>
              </View>
            )}
          </View>
          <Text className="text-gray-600 text-sm">
            {item.brand} | {item.code} | ${item.price.toFixed(2)} | {item.unit}
          </Text>
        </View>
        <View className="items-end mr-3 flex-row items-center">
          <Text className={`text-xs font-bold mr-1 ${
            item.isLowStock ? 'text-orange-500' : 'text-gray-600'
          }`}>
            {item.quantity}
          </Text>
          <Text className={`text-xs ${
            item.isLowStock ? 'text-orange-500 font-medium' : 'text-gray-600'
          }`}>
            {item.quantityText}
          </Text>
        </View>
        <TouchableOpacity 
          className="w-6 h-6 bg-gray-100 rounded items-center justify-center"
          onPress={() => onEdit(item)}
        >
          <Feather name="edit" size={14} color="#6B7280" />
        </TouchableOpacity>
      </View>
    </View>
  );
};