export type Screen = 'main' | 'checkout-category' | 'checkout' | 'inventory' | 'inventory-category'; //- suggesting a better approach

// Type definitions
export interface CartItem {
    id: string;
    name: string;
    price: number;
    quantity: number;
}

export interface PaymentMethod {
    id: string;
    name: string;
    description: string;
    icon: any;
    color: string;
    bgColor: string;
}

// Type definitions
export interface CategoryItem {
    id: string;
    name: string;
    count: number;
    icon: string;
    color: string;
}

// Compatibility alias for components that import `Category` from '@/types'
export interface Category extends CategoryItem {
    externalId?: string;
    businessId?: string;
    createdAt?: number;
    deleted?: boolean;
}

export interface StoreData {
    name: string;
    type: string;
    phone: string;
    email: string;
    address: string;
    description: string;
    businessName?: string;
    storeName?: string;
    storeAddress?: string;
    storePhone?: string;
    storeEmail?: string;
    taxId?: string;
    establishedYear?: string;
    currency?: string;
    timezone?: string;
    logoUrl?: string;
    receiptFooter?: string;
    businessType?: string;
    businessId?: string;
    storeId?: string;
    businessHours?: {
        weekdays: string;
        weekend: string;
    };
}

export interface Store {
    id?: string;
    businessId?: string;
    name?: string;
    address?: string;
    phone?: string;
    email?: string;
    managerId?: string;
    status?: string;
    currency?: string;
    createdAt?: number;
    updatedAt?: number;
    deleted?: boolean;
}

// Type definitions
export interface CategoryData {
    name: string;
    icon: string;
    color: string;
}

export interface QuickItem {
    name: string;
    price: string;
}

// ???????
export interface Product {
    // Core identification
    id: string;
    name: string;
    brand?: string;
    code?: string; // SKU/barcode
    category: string;
    type?: string; // Product type/subcategory
    price: number;
    quantity?: number;
    stock?: number; // Alias for quantity (for backward compatibility)
    unit: string; // 'pcs', 'kg', 'ltr', etc.
    lowStockThreshold?: number; // When to show low stock warning
    isLowStock?: boolean;
    isOut?: boolean;
    isOrdered?: boolean;
    quantityText?: string; // "5 pcs", "2.5 kg", etc.
    size?: string; // "500ml", "1kg", etc. - for display
    inCart?: number;
    description?: string;
    createdAt?: number;
    updatedAt?: number;
    minimumAlert?: number;
    purchasePrice?: number;
}

export interface SizeConfig {
    padding: string;
    iconSize: number;
    textSize: string;
    minWidth?: string;
    height?: string;
}

export interface VariantConfig {
    bg: string;
    bgDisabled: string;
    textColor: string;
    textColorDisabled: string;
    iconColor: string;
    iconColorDisabled: string;
    borderColor?: string;
}

export interface AnimationConfig {
    scale: number;
    tension: number;
    friction: number;
}

export type CreditRating = 'Low' | 'Medium' | 'Good';

export interface Customer {
    id: string;
    firstName: string;
    lastName: string;
    amount: number;
    phoneNumber: string;
    dueDate: string;
    rating: CreditRating;
    daysLeft: number;
}

export type FilterState = {
    Low: 'Low';
    Out: 'Out';
    All?: 'All';
    Ordered?: 'Ordered';
};

export interface ProductData {
    categoryId: string;
    name: string;
    cost: string;
    barcode: string;
    description: string;
    unit: string;
    minStock: number;
    maxStock: number;
    price: number;
    location: string;
    initialQuantity: number;
}
export interface InventoryItemData {
    // poductId: string;
    // storeId: string;
    quantity: number;
    minStock: number;
    maxStock: number;
    price: number;
    wholeSalePrice: number;
    weightedAvgCost: number;
    lastPurchasePrice: number;
    location: string;
}

// Combined view type used by inventory lists (product + inventory fields)
export interface InventoryViewItem {
    id: string; // inventory id
    productId: string;
    name: string;
    category: string;
    categoryId: string;
    categoryIcon?: string;
    categoryColor?: string;
    quantity: number;
    minStock: number;
    maxStock: number;
    price: number;
    cost?: number;
    unit: string;
    barcode?: string;
    location?: string;
    lastUpdated?: Date;
}

export interface UserData {
    externalId?: string; // Now optional - will be generated if not provided
    email: string;
    name: string;
    phone: string;
    password: string;
    pin?: string;
    isOwner?: boolean;
}
export interface AuthData {
    email: string;
    password?: string;
    pin?: string;
}

export interface BusinessStoreData {
    businessName: string;
    storeName: string;
    storeAddress?: string;
    storePhone?: string;
    storeEmail?: string;
}

export interface Business {
    externalId?: string;
    name: string;
    businessType?: string;
    ownerId: string;
    createdAt: number;
    updatedAt: number;
    deleted?: boolean;
}

export type PaymentMethodType = 'Cash' | 'M-Pesa' | 'Bank Transfer' | 'Card';

// this will be worked on - idealy use the same type

export interface User {
    externalId: string;
    name: string;
    email: string;
    role?: string;
}

export interface UserProfileData {
    firstName: string;
    lastName: string;
    role: string;
    email: string;
    phone: string;
    emergencyContact: string;
    joinDate: string;
    permissions: string[];
}

export interface TodayStats {
    revenue: number;
    orders: number;
    profit: number;
    netCredit: number;
}

export interface CreditSummary {
    totalOwed: number;
    customersWithCredit: number;
    overdueAmount: number;
}

export type TabType = 'Overview' | 'Sales' | 'History';
