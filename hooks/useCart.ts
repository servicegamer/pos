import { CartItem } from '@/types';
import { useState } from 'react';

export const useCart = () => {
    const [globalCart, setGlobalCart] = useState<CartItem[]>([]);

    const totalCartItems = globalCart.reduce((sum, item) => sum + item.quantity, 0);
    const totalCartPrice = globalCart.reduce((sum, item) => sum + item.price * item.quantity, 0);

    const updateGlobalCart = (cartItems: CartItem[]) => {
        setGlobalCart(cartItems);
    };

    const clearCart = () => {
        setGlobalCart([]);
    };

    const addToCart = (item: CartItem) => {
        setGlobalCart((prevCart) => {
            const existingItem = prevCart.find((cartItem) => cartItem.id === item.id);
            if (existingItem) {
                return prevCart.map((cartItem) =>
                    cartItem.id === item.id
                        ? { ...cartItem, quantity: cartItem.quantity + item.quantity }
                        : cartItem,
                );
            }
            return [...prevCart, item];
        });
    };

    const removeFromCart = (itemId: string) => {
        setGlobalCart((prevCart) => prevCart.filter((item) => item.id !== itemId));
    };

    const updateQuantity = (itemId: string, quantity: number) => {
        if (quantity <= 0) {
            removeFromCart(itemId);
            return;
        }

        setGlobalCart((prevCart) =>
            prevCart.map((item) => (item.id === itemId ? { ...item, quantity } : item)),
        );
    };

    return {
        globalCart,
        totalCartItems,
        totalCartPrice,
        updateGlobalCart,
        clearCart,
        addToCart,
        removeFromCart,
        updateQuantity,
    };
};
