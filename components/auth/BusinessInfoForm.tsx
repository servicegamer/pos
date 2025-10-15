import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { BusinessStoreData } from '@/types';

interface BusinessInfoFormProps {
  onBack: () => void;
  onCreateAccount: (businessStoreData: BusinessStoreData) => void;
}

export function BusinessInfoForm({ onBack, onCreateAccount }: BusinessInfoFormProps) {
  const [formData, setFormData] = useState<BusinessStoreData>({
    businessName: 'test Business',
    storeName: 'best prices',
    storeAddress: '123 Main Street, Nairobi',
    storePhone: '+254712345678',
    storeEmail: 'store@freshmart.com',
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleCreateAccount = () => {
    // Validate form data
    if (!formData.businessName || !formData.storeName || !formData.storeAddress) {
      // Handle validation error
      return;
    }
    onCreateAccount(formData);
  };

  return (
    <View>
      {/* Business Information Section */}
      <View className="mb-6">
        <View className="flex-row items-center mb-4">
          <Ionicons name="business-outline" size={20} color="#374151" />
          <Text className="text-lg font-semibold text-gray-900 ml-2">Business Information</Text>
        </View>
        
        <View className="mb-4">
          <Text className="text-sm font-medium text-gray-900 mb-2">Business Name</Text>
          <TextInput
            className="bg-gray-100 rounded-lg px-4 py-3 text-gray-900"
            placeholder="e.g., FreshMart Group"
            value={formData.businessName}
            onChangeText={(value) => handleInputChange('businessName', value)}
          />
        </View>
      </View>

      {/* First Store Information Section */}
      <View className="mb-6">
        <View className="flex-row items-center mb-4">
          <Ionicons name="location-outline" size={20} color="#374151" />
          <Text className="text-lg font-semibold text-gray-900 ml-2">First Store Information</Text>
        </View>
        
        <View className="mb-4">
          <Text className="text-sm font-medium text-gray-900 mb-2">Store Name</Text>
          <TextInput
            className="bg-gray-100 rounded-lg px-4 py-3 text-gray-900"
            placeholder="e.g., FreshMart Downtown"
            value={formData.storeName}
            onChangeText={(value) => handleInputChange('storeName', value)}
          />
        </View>

        <View className="mb-4">
          <Text className="text-sm font-medium text-gray-900 mb-2">Store Address</Text>
          <TextInput
            className="bg-gray-100 rounded-lg px-4 py-3 text-gray-900"
            placeholder="Enter store address"
            value={formData.storeAddress}
            onChangeText={(value) => handleInputChange('storeAddress', value)}
          />
        </View>

        <View className="mb-4">
          <Text className="text-sm font-medium text-gray-900 mb-2">Store Phone (Optional)</Text>
          <TextInput
            className="bg-gray-100 rounded-lg px-4 py-3 text-gray-900"
            placeholder="Enter store phone"
            value={formData.storePhone}
            onChangeText={(value) => handleInputChange('storePhone', value)}
            keyboardType="phone-pad"
          />
        </View>

        <View className="mb-6">
          <Text className="text-sm font-medium text-gray-900 mb-2">Store Email (Optional)</Text>
          <TextInput
            className="bg-gray-100 rounded-lg px-4 py-3 text-gray-900"
            placeholder="Enter store email"
            value={formData.storeEmail}
            onChangeText={(value) => handleInputChange('storeEmail', value)}
            keyboardType="email-address"
            autoCapitalize="none"
          />
        </View>
      </View>

      {/* Action Buttons */}
      <View className="flex-row space-x-3">
        <TouchableOpacity
          className="flex-1 bg-white border border-gray-300 rounded-lg py-4"
          onPress={onBack}
        >
          <Text className="text-gray-900 text-center font-semibold text-base">
            Back
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          className="flex-1 bg-gray-900 rounded-lg py-4"
          onPress={handleCreateAccount}
        >
          <Text className="text-white text-center font-semibold text-base">
            Create Account
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
