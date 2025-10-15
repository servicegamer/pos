import { Stack } from 'expo-router';

export default function CreditStack() {
	return (
		<Stack screenOptions={{ headerShown: false }}>
			<Stack.Screen name='index' />
			<Stack.Screen name='credit-details' />
			<Stack.Screen name='credit-transaction' />
		</Stack>
	);
}
