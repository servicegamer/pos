import React from 'react';
import { View, TextInput } from 'react-native';
import { Search } from 'lucide-react-native';

interface SearchBarProps {
  placeholder?: string;
  onFocus?: () => void;
  onBlur?: () => void;
  isSearchFocused?: boolean;
  value?: string;
  onChangeText?: (text: string) => void;
}

export const SearchBar: React.FC<SearchBarProps> = ({
  placeholder = "Search products...",
  onFocus,
  onBlur,
  isSearchFocused = false,
  value,
  onChangeText
}) => {
  return (
    <View
      className={`flex-row items-center bg-white rounded-xl px-4 py-3 mb-4 ${
        isSearchFocused ? 'border border-gray-200' : 'border border-transparent'
      }`}
      style={{
        shadowColor: '#000',
        shadowOffset: {
          width: 0,
          height: isSearchFocused ? 2 : 1,
        },
        shadowOpacity: isSearchFocused ? 0.1 : 0.05,
        shadowRadius: isSearchFocused ? 4 : 2,
        elevation: isSearchFocused ? 3 : 1,
      }}
    >
      <Search size={20} color="#9CA3AF" />
      <TextInput
        placeholder={placeholder}
        className="flex-1 ml-3 text-gray-700"
        placeholderTextColor="#9CA3AF"
        onFocus={onFocus}
        onBlur={onBlur}
        value={value}
        onChangeText={onChangeText}
      />
    </View>
  );
};