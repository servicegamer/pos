import { AuthHeader } from '@/components/auth/AuthHeader';
import { SignInForm } from '@/components/auth/SignInForm';
import { useAuth } from '@/contexts/AuthContext';
import { authenticateUser } from '@/db/services/userService';
import { AuthData } from '@/types';
import { router } from 'expo-router';
import React from 'react';
import { ScrollView, View } from 'react-native';

export default function SignInScreen() {
    const { login, isAuthenticated } = useAuth();

    // Redirect when authentication state changes
    React.useEffect(() => {
        if (isAuthenticated) {
            router.replace('/(tabs)/checkout');
        }
    }, [isAuthenticated]);

    const handleSignUp = () => {
        router.replace('/auth/signup');
    };

    const handleLogin = async (userdata: AuthData) => {
        try {
            const user = await login(userdata.email, userdata.password);
            if (!user) {
                console.log('Authentication failed');
                return;
            }
        } catch (e) {
            console.error('Login error:', e);
        }
    };

    return (
        <View className='flex-1 bg-gray-50'>
            <ScrollView className='flex-1' showsVerticalScrollIndicator={false}>
                <AuthHeader title='Welcome Back' subtitle='Sign in to your POS system' />

                <View className='px-6 pb-8'>
                    <SignInForm onSignUp={handleSignUp} login={handleLogin} />
                </View>
            </ScrollView>
        </View>
    );
}
