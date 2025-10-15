//NOTE: this will be updated based on the db schema

import { CategoryItem } from '@/types';

export const CATEGORIES: CategoryItem[] = [
    { id: 'beverages', name: 'Beverages', count: 8, icon: '🥤', color: 'bg-white' },
    { id: 'snacks', name: 'Snacks', count: 8, icon: '🍿', color: 'bg-white' },
    { id: 'dairy', name: 'Dairy', count: 5, icon: '🥛', color: 'bg-white' },
    { id: 'bakery', name: 'Bakery', count: 4, icon: '🍞', color: 'bg-white' },
    { id: 'fruits', name: 'Fruits', count: 5, icon: '🍎', color: 'bg-white' },
    { id: 'vegetables', name: 'Vegetables', count: 8, icon: '🥕', color: 'bg-white' },
    { id: 'meat', name: 'Meat', count: 4, icon: '🥩', color: 'bg-white' },
    { id: 'frozen', name: 'Frozen', count: 3, icon: '🧊', color: 'bg-white' },
    { id: 'household', name: 'Household', count: 6, icon: '🧽', color: 'bg-white' },
    { id: 'personal-care', name: 'Personal Care', count: 5, icon: '🧴', color: 'bg-white' },
];

export const ALL_CATEGORIES_WITH_ALL = [
    { id: 'all', name: 'All', count: 51, icon: '📋', color: 'bg-gray-600' },
    ...CATEGORIES,
];
