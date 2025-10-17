import React from 'react';
import { View, Text, TextInput } from 'react-native';

interface PartialPaymentInputProps {
    amount: string;
    onAmountChange: (amount: string) => void;
    total: number;
}

export const PartialPaymentInput: React.FC<PartialPaymentInputProps> = ({
    amount,
    onAmountChange,
    total,
}) => {
    const partialAmount = amount ? parseFloat(amount) : 0;
    const remainingAmount = total - partialAmount;

    return (
        <View className="bg-gray-50 rounded-xl p-4 mt-3">
            <Text className="text-sm font-medium text-gray-900 mb-2">
                Partial Payment (Amount on credit)
            </Text>

            <View className="mb-3">
                <View className="bg-white rounded-lg px-3 py-2 mb-1 border border-gray-200">
                    <View className="flex-row items-center">
                        <Text className="text-gray-500 text-sm mr-1">$</Text>
                        <TextInput
                            value={amount}
                            onChangeText={onAmountChange}
                            placeholder="0.00"
                            placeholderTextColor="#9CA3AF"
                            keyboardType="decimal-pad"
                            className="text-lg font-medium text-gray-900 flex-1"
                        />
                    </View>
                </View>
                <Text className="text-gray-400 text-xs ml-1">Maximum: ${total.toFixed(2)}</Text>
            </View>

            {partialAmount > 0 && partialAmount <= total && (
                <View className="bg-blue-50 rounded-lg p-3">
                    <View className="flex-row justify-between mb-1">
                        <Text className="text-sm text-gray-600">Pay now:</Text>
                        <Text className="text-sm font-semibold text-gray-900">
                            ${remainingAmount.toFixed(2)}
                        </Text>
                    </View>
                    <View className="flex-row justify-between">
                        <Text className="text-sm text-gray-600">On credit:</Text>
                        <Text className="text-sm font-semibold text-orange-600">
                            ${partialAmount.toFixed(2)}
                        </Text>
                    </View>
                </View>
            )}
        </View>
    );
};
