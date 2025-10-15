import { useState } from 'react';
import { CartItem } from '@/types';

export const useCheckoutLogic = (
  cartItems: CartItem[],
  selectedPaymentMethod: string,
  creditAmount: string,
  onPaymentComplete: (paymentMethod: string, amount: number) => void
) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchFocused, setIsSearchFocused] = useState(false);

  const total = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const maxCredit = total;

  const handlePay = () => {
    if (selectedPaymentMethod === 'store-credit') {
      const amount = parseFloat(creditAmount) || 0;
      if (amount > 0 && amount <= maxCredit) {
        onPaymentComplete(selectedPaymentMethod, amount);
      }
    } else {
      onPaymentComplete(selectedPaymentMethod, total);
    }
  };

  const getPayAmount = () => {
    if (selectedPaymentMethod === 'store-credit' && creditAmount) {
      return parseFloat(creditAmount);
    }
    return total;
  };

  const isPayButtonDisabled = () => {
    return selectedPaymentMethod === 'store-credit' && (!creditAmount || parseFloat(creditAmount) <= 0);
  };

  const handleSearchFocus = () => setIsSearchFocused(true);
  const handleSearchBlur = () => setIsSearchFocused(false);

  return {
    searchQuery,
    setSearchQuery,
    isSearchFocused,
    handleSearchFocus,
    handleSearchBlur,
    total,
    maxCredit,
    handlePay,
    getPayAmount,
    isPayButtonDisabled
  };
};