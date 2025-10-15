import { Customer } from '@/types';

export const MOCK_CUSTOMERS: Customer[] = [
	{
		id: '1',
		firstName: 'Samuel',
		lastName: 'Kipchoge',
		amount: 35.75,
		phoneNumber: '+254712345678',
		dueDate: '2024-12-18',
		rating: 'Low',
		daysLeft: 1,
	},
	{
		id: '2',
		firstName: 'Peter',
		lastName: 'Kamau',
		amount: 42.25,
		phoneNumber: '+254723456789',
		dueDate: '2024-12-20',
		rating: 'Medium',
		daysLeft: 1,
	},
	{
		id: '3',
		firstName: 'Grace',
		lastName: 'Wanjiru',
		amount: 75.5,
		phoneNumber: '+254734567890',
		dueDate: '2024-12-22',
		rating: 'Good',
		daysLeft: 3,
	},
	{
		id: '4',
		firstName: 'Mary',
		lastName: 'Akinyi',
		amount: 120.0,
		phoneNumber: '+254745678901',
		dueDate: '2024-12-25',
		rating: 'Good',
		daysLeft: 6,
	},
];
