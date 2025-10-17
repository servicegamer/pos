import React from 'react';
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Search, UserPlus } from 'lucide-react-native';
import Customer from '@/db/models/customers';

interface CustomerSearchSelectorProps {
    searchQuery: string;
    onSearchChange: (query: string) => void;
    searchResults: Customer[];
    selectedCustomer: Customer | null;
    onSelectCustomer: (customer: Customer | null) => void;
    isSearching: boolean;
    onAddNewCustomer?: () => void;
}

export const CustomerSearchSelector: React.FC<CustomerSearchSelectorProps> = ({
    searchQuery,
    onSearchChange,
    searchResults,
    selectedCustomer,
    onSelectCustomer,
    isSearching,
    onAddNewCustomer,
}) => {
    return (
        <View className="bg-gray-50 rounded-xl p-4">
            <View className="flex-row items-center justify-between mb-2">
                <Text className="text-sm font-medium text-gray-900">Select Customer</Text>
                {onAddNewCustomer && (
                    <TouchableOpacity
                        className="flex-row items-center bg-white border border-gray-200 rounded-lg px-2 py-1"
                        onPress={onAddNewCustomer}
                    >
                        <UserPlus size={12} color="#6B7280" />
                        <Text className="text-gray-600 text-xs font-medium ml-1">New</Text>
                    </TouchableOpacity>
                )}
            </View>

            {selectedCustomer ? (
                <View className="bg-white rounded-lg p-3 border border-green-500">
                    <View className="flex-row items-center justify-between">
                        <View className="flex-1">
                            <Text className="font-semibold text-gray-900">
                                {selectedCustomer.name}
                            </Text>
                            <Text className="text-sm text-gray-500">{selectedCustomer.phone}</Text>
                            {selectedCustomer.currentBalance > 0 && (
                                <Text className="text-xs text-orange-600 mt-1">
                                    Current balance: ${selectedCustomer.currentBalance.toFixed(2)}
                                </Text>
                            )}
                        </View>
                        <TouchableOpacity
                            onPress={() => onSelectCustomer(null)}
                            className="ml-2"
                        >
                            <Text className="text-blue-600 text-sm">Change</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            ) : (
                <View>
                    <View className="bg-white rounded-lg px-3 py-2 border border-gray-200 flex-row items-center">
                        <Search size={16} color="#9CA3AF" />
                        <TextInput
                            placeholder="Search by name or phone..."
                            className="flex-1 ml-2 text-gray-700 text-sm"
                            placeholderTextColor="#9CA3AF"
                            value={searchQuery}
                            onChangeText={onSearchChange}
                        />
                        {isSearching && <ActivityIndicator size="small" color="#9CA3AF" />}
                    </View>

                    {searchResults.length > 0 && (
                        <View className="mt-2 bg-white rounded-lg border border-gray-200 max-h-40">
                            {searchResults.map((customer) => (
                                <TouchableOpacity
                                    key={customer.id}
                                    className="p-3 border-b border-gray-100"
                                    onPress={() => onSelectCustomer(customer)}
                                >
                                    <Text className="font-medium text-gray-900">
                                        {customer.name}
                                    </Text>
                                    <Text className="text-sm text-gray-500">{customer.phone}</Text>
                                    {customer.currentBalance > 0 && (
                                        <Text className="text-xs text-orange-600 mt-1">
                                            Balance: ${customer.currentBalance.toFixed(2)}
                                        </Text>
                                    )}
                                </TouchableOpacity>
                            ))}
                        </View>
                    )}
                </View>
            )}
        </View>
    );
};
