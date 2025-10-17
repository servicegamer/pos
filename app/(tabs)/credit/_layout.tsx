import { Stack } from 'expo-router';

export default function CreditLayout() {
    return (
        <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="index" />
            <Stack.Screen name="transactions" />
            <Stack.Screen name="credit-details" />
            <Stack.Screen name="credit-transaction" />
            <Stack.Screen name="transaction-detail" />
        </Stack>
    );
}
