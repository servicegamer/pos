import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';
import '../global.css';

import { AuthProvider } from '@/contexts/AuthContext';
import { useColorScheme } from '@/hooks/use-color-scheme';

import DatabaseProvider from '@nozbe/watermelondb/react/DatabaseProvider';
import { BusinessProvider } from '@/contexts/BusinessContext';
import { CartProvider } from '@/contexts/CartContext';
import { database } from '@/db';

export default function RootLayout() {
    const colorScheme = useColorScheme();

    return (
        <DatabaseProvider database={database}>
            <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
                <BusinessProvider>
                    <AuthProvider>
                        <CartProvider>
                            <Stack screenOptions={{ headerShown: false }}>
                                <Stack.Screen name='index' />
                                <Stack.Screen name='(tabs)' />
                                <Stack.Screen name='auth' />
                            </Stack>
                        </CartProvider>
                    </AuthProvider>
                </BusinessProvider>
                <StatusBar style='auto' />
            </ThemeProvider>
        </DatabaseProvider>
    );
}
