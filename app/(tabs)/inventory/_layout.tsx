import { Stack } from 'expo-router';

export default function InventoryStack() {
    return (
        <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name='index' />
            <Stack.Screen name='category' />
        </Stack>
    );
}
