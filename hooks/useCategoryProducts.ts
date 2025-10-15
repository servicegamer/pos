import { FilterState } from '@/types';
import { useMemo, useState } from 'react';

export const useCategoryProducts = (categoryName: string, allInventoryData: any[]) => {
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedFilter, setSelectedFilter] = useState<keyof FilterState>('All');
    const [isSearchFocused, setIsSearchFocused] = useState(false);

    // Filter products by category
    const categoryProducts = useMemo(
        () => allInventoryData.filter((item) => item.category === categoryName),
        [allInventoryData, categoryName],
    );

    // Apply search and filters
    const filteredData = useMemo(() => {
        return categoryProducts.filter((item) => {
            const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase());

            let matchesFilter = true;
            if (selectedFilter === 'Low') {
                matchesFilter = item.isLowStock;
            } else if (selectedFilter === 'Out') {
                matchesFilter = item.isOut;
            }

            return matchesSearch && matchesFilter;
        });
    }, [categoryProducts, searchQuery, selectedFilter]);

    // Calculate stats
    const stats = useMemo(
        () => ({
            totalItems: categoryProducts.length,
            lowStockItems: categoryProducts.filter((item) => item.isLowStock).length,
            outOfStockItems: categoryProducts.filter((item) => item.isOut).length,
        }),
        [categoryProducts],
    );

    const toggleFilter = (filter: keyof FilterState) => {
        setSelectedFilter(selectedFilter === filter ? 'All' : filter);
    };

    return {
        searchQuery,
        setSearchQuery,
        selectedFilter,
        toggleFilter,
        isSearchFocused,
        setIsSearchFocused,
        filteredData,
        stats,
    };
};
