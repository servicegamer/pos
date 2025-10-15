import React from 'react';
import { View, Text } from 'react-native';
import { CartItem } from '@/types';

interface OrderSummaryProps {
  cartItems: CartItem[];
  total: number;
}

export const OrderSummary: React.FC<OrderSummaryProps> = ({ cartItems, total }) => {
  return (
    <View className="bg-white mx-4 mt-4 rounded-xl p-4">
      <Text className="text-lg font-semibold text-gray-900 mb-4">
        Order Summary
      </Text>
      
      {cartItems.map((item) => (
        <View key={item.id} className="flex-row justify-between items-center mb-2">
          <View className="flex-1">
            <Text className="text-gray-900 font-medium">
              {item.name}
            </Text>
            <Text className="text-gray-500 text-sm">
              ${item.price.toFixed(2)} × {item.quantity}
            </Text>
          </View>
          <Text className="text-gray-900 font-semibold">
            ${(item.price * item.quantity).toFixed(2)}
          </Text>
        </View>
      ))}
      
      <View className="border-t border-gray-200 pt-3 mt-3">
        <View className="flex-row justify-between items-center">
          <Text className="text-lg font-bold text-gray-900">
            Total
          </Text>
          <Text className="text-lg font-bold text-gray-900">
            ${total.toFixed(2)}
          </Text>
        </View>
      </View>
    </View>
  );
};