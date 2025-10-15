import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

export default function AuthLayout() {
    return (
        <>
            <Stack screenOptions={{ headerShown: false }}>
                <Stack.Screen
                    name='index'
                    options={{
                        title: 'LogIn',
                    }}
                />
                <Stack.Screen
                    name='signup'
                    options={{
                        title: 'Create Account',
                    }}
                />
                <Stack.Screen
                    name='account'
                    options={{
                        title: 'Account',
                    }}
                />
            </Stack>
            <StatusBar style='auto' />
        </>
    );
}
