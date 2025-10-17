# POS (Point of Sale) - Expo React Native App

## Overview
This is an Expo-based Point of Sale (POS) application built with React Native, supporting web, iOS, and Android platforms. The app uses WatermelonDB for local data persistence and includes features for inventory management, checkout, credit transactions, and account management.

## Project Setup - Replit Environment

### Date: October 15, 2025

### Technology Stack
- **Framework**: Expo SDK 54
- **React**: v19.1.0
- **React Native**: v0.81.4
- **Database**: WatermelonDB with platform-specific adapters
  - Web: LokiJS (IndexedDB)
  - Native: SQLite
- **Styling**: NativeWind (Tailwind CSS for React Native)
- **Routing**: Expo Router v6
- **Language**: TypeScript v5.9

### Key Configuration Changes for Replit

1. **Node.js Version**: Upgraded to Node.js 22 (required by React Native 0.81.4 and Metro bundler)

2. **TypeScript Configuration** (`tsconfig.json`):
   - Added `useDefineForClassFields: false` to support WatermelonDB decorators
   - This prevents TypeScript/Babel conflicts with class field initialization

3. **Babel Configuration** (`babel.config.js`):
   - Added `@babel/plugin-proposal-class-properties` with `{ loose: true }`
   - Maintained `@babel/plugin-proposal-decorators` with `{ legacy: true }`
   - Both plugins required for WatermelonDB decorator support

4. **Platform-Specific Database Adapters**:
   - Created `db/index.web.ts` - Uses LokiJS adapter for web (IndexedDB)
   - Created `db/index.native.ts` - Uses SQLite adapter for native platforms
   - This prevents bundler errors trying to import native SQLite modules on web

5. **Metro Configuration** (`metro.config.js`):
   - Configured with NativeWind integration
   - Added CORS headers for development

### Running the Project

The app runs on **port 5000** and is configured to work with Replit's proxy environment.

**Start Command**: `bash start-web.sh`

The workflow is configured as:
- Name: Web Server
- Command: `bash start-web.sh`
- Port: 5000
- Output: webview

### Known Issues & Warnings

1. **Require Cycles**: There are circular dependencies between database models and the index file. These are allowed but may cause initialization issues in some cases.

2. **Missing Default Exports**: 
   - `./(tabs)/account/sales.tsx`
   - `./(tabs)/account/settings.tsx`
   These routes need default React component exports.

3. **Package Versions**: Some Expo packages are slightly behind the recommended versions for SDK 54:
   - expo@54.0.10 (recommended: 54.0.13)
   - expo-font@14.0.8 (recommended: ~14.0.9)
   - expo-image@3.0.8 (recommended: ~3.0.9)
   - expo-router@6.0.8 (recommended: ~6.0.12)
   - expo-web-browser@15.0.7 (recommended: ~15.0.8)

### Project Structure

```
/
├── app/              # Expo Router pages
│   ├── (tabs)/      # Tab-based navigation
│   │   ├── account/ # Account management
│   │   ├── checkout/# Checkout flow
│   │   ├── credit/  # Credit management
│   │   └── inventory/# Inventory management
│   └── auth/        # Authentication screens
├── components/      # Reusable UI components
├── contexts/        # React contexts (Auth, Business)
├── db/              # WatermelonDB setup
│   ├── models/     # Database models
│   ├── services/   # Database services
│   ├── index.web.ts    # Web database config (LokiJS)
│   └── index.native.ts # Native database config (SQLite)
├── hooks/          # Custom React hooks
└── utils/          # Utility functions
```

### Database Schema

The app uses WatermelonDB with the following main models:
- User
- Session
- Business
- Store
- Role
- Staff
- Category
- Product
- Inventory
- InventoryBatch (NEW - tracks all inventory movements)
- Customer
- Sale
- SaleItem

**Schema Version**: 1 (no migrations - fresh development setup)

⚠️ **Important**: The current schema includes all tables at version 1 without migrations. This is suitable for fresh development installations. For production deployments, proper WatermelonDB migrations should be implemented to handle schema upgrades safely.

### POS Features Implemented

#### 1. Inventory Management
- **Add Products Modal** (`components/inventory/modal/productModal.tsx`)
  - Modal-based product creation (replaces separate page navigation)
  - Dynamic category loading from database
  - Create products with name, SKU, price, category, and initial stock
  - Automatic inventory record creation on product creation
  - Form validation and error handling
  - Real-time inventory refresh after adding products

- **Edit Product Modal** (`components/inventory/modal/EditProductModal.tsx`)
  - Modal for editing existing products and inventory
  - Update product details (name, category, barcode, description, unit)
  - Update inventory pricing (retail, wholesale, cost)
  - Update stock levels (min/max alerts) and location
  - Category selection and creation UI (same as Add Products Modal)
  - Proper number handling to support zero values
  - Form validation with explicit TypeScript types
  - Uses productService.updateProduct and inventoryService.updateInventoryPricing
  
- **Inventory List** (`app/(tabs)/inventory/index.tsx`)
  - Database-backed inventory loading via `useInventoryData` hook
  - Real-time product filtering by category and search
  - Low stock and out-of-stock indicators
  - Edit and delete product functionality
  
- **Manage Categories** (`app/(tabs)/inventory/manage-categories.tsx`)
  - Add, edit, and delete product categories
  - Real-time category list updates
  - Confirmation dialogs for deletions

- **Adjust Inventory** (`app/(tabs)/inventory/adjust-inventory.tsx`)
  - Manual stock adjustments (add/remove inventory)
  - Batch type tracking (purchase, return, adjustment, damage, expired, transfer)
  - Reason tracking for all inventory changes
  - Automatic inventory batch record creation

#### 2. Checkout/Sales Flow
- **Category-Based Checkout** (`app/(tabs)/checkout/category.tsx`)
  - Database-backed product loading via `useCheckoutProducts` hook
  - Products filtered by category from inventory
  - Real-time cart state management with proper ID handling
  - Cart persistence across category navigation
  - Search and filter products within category
  
- **Complete Sale** (`app/(tabs)/checkout/complete-sale.tsx`)
  - Cash, card, and mobile payment methods
  - Credit sale support with customer selection
  - Discount application
  - Automatic inventory deduction on sale completion
  - Customer balance updates for credit sales
  - Sale and sale item record creation

#### 3. Database Services
All services are located in `db/services/`:

- **productService.ts**: Product CRUD operations
  - Create products with initial inventory
  - Search products by name, SKU, or barcode
  - Get products by category or business

- **categoryService.ts**: Category management
  - Create, update, delete categories
  - Get categories by business

- **inventoryService.ts**: Inventory tracking with batch support
  - Adjust inventory quantities with batch recording
  - Track inventory movements (purchase, return, adjustment, damage, expired, transfer)
  - Get current inventory levels by product/store

- **salesService.ts**: Sales transaction processing
  - Complete sales (cash and credit)
  - Automatic inventory deduction
  - Customer balance updates for credit sales
  - Sale and sale item creation

- **customerService.ts**: Customer management
  - Create and update customers
  - Track customer balances for credit sales
  - Get customers by business

#### 4. Custom Hooks
- **useInventoryData.ts**: Manages inventory state with real-time WatermelonDB observables
  - Loads inventory data by store
  - Fetches related product and category information
  - Provides refresh functionality for real-time updates
  
- **useCheckoutProducts.ts**: Database-backed checkout product management
  - Loads products from inventory by category
  - Maintains cart state with proper product ID handling
  - Syncs with global cart for checkout flow
  - Prevents cart regression by using consistent product IDs
  
- **useCheckoutData.ts**: Manages checkout flow state (not yet used, prepared for future enhancements)

### Development Notes

- The web version uses IndexedDB for storage via LokiJS adapter
- Native versions (iOS/Android) use SQLite via JSI for better performance
- The app supports dark mode with automatic theme switching
- Authentication context provides user management
- Business context manages multi-store POS operations
- All inventory movements are tracked via inventory_batches table
- Credit sales automatically update customer balances
- Inventory is automatically deducted when sales are completed

### Recent Updates

#### October 17, 2025
- **Enhanced Payment System with Split Payments**
  - **Payment Methods Tracking**
    - Added `payment_methods_used` field to sales table (JSON array of methods used)
    - Added `mpesa_amount` and `cash_amount` fields to track individual payment amounts
    - System now saves all payment methods used in a transaction (e.g., ["mpesa", "cash", "store-credit"])
    
  - **Partial Payment Improvements**
    - Fixed issue where typing in partial payment method would auto-fill and override user input
    - Removed auto-fill behavior when switching to partial payment method
    - Users can now freely type amounts in each payment method
    - Payment methods array properly tracks all methods used in split payments
    
  - **Credit Balance Management**
    - Credit amount is automatically added to customer's current balance when sale completes
    - Partial payments properly track amount paid vs amount on credit
    - Customer balance updates happen in completeSale transaction
    
  - **Schema Update**
    - Database schema version updated to 3
    - Added new fields: payment_methods_used, mpesa_amount, cash_amount
    - Note: This is a breaking change for existing data (development environment)

#### October 16, 2025
- **Checkout System Refactoring - WatermelonDB Integration**
  - **CartContext Implementation**
    - Created global `CartContext` (`contexts/CartContext.tsx`) for persistent cart state across all screens
    - Cart now persists when navigating between categories and screens
    - Replaced local cart management with context-based approach
    - Integrated into app root layout for app-wide availability
  
  - **WatermelonDB Checkout Integration**
    - Created `useCheckoutData` hook to observe categories and inventory from WatermelonDB in real-time
    - Checkout screens now use live database data with automatic updates
    - Categories and products are loaded from inventory with proper observation patterns
    - All product data synchronized with inventory database
  
  - **Most Sold Products Feature**
    - Implemented `mostSoldService` to calculate most sold products based on sales data
    - Quick Reference section now displays top 5 most sold products (last 30 days)
    - Products ranked by quantity sold with revenue tracking
    - Falls back to "No sales data" when no sales exist
  
  - **Type Safety Improvements**
    - Removed all `any` types from checkout-related code
    - Created explicit interfaces for all data structures
    - `CheckoutCategoryItem` and `CheckoutInventoryItem` interfaces for type safety
  
  - **Updated Screens**
    - `app/(tabs)/checkout/index.tsx`: Uses WatermelonDB categories with observation
    - `app/(tabs)/checkout/category.tsx`: Uses WatermelonDB inventory with persistent cart
    - `app/(tabs)/checkout/payment.tsx`: Updated to use CartContext
    - `components/checkout/QuickReferenceSection.tsx`: Displays most sold products
    - `components/checkout/QuickReferenceItem.tsx`: Uses CartContext for cart operations

#### October 15, 2025
- **Edit Product Modal Implementation**
  - Created `EditProductModal.tsx` with proper TypeScript types (no 'any' types)
  - Category selection and creation UI matching ProductModal
  - Product update functionality using productService.updateProduct
  - Inventory update functionality using inventoryService.updateInventoryPricing
  - Robust number handling to support zero values (wholesale price, min/max stock)
  - Form validation and error handling
  - Connected to product update button in inventory list
  - Fixed category update issue by implementing proper inventory data refresh in useInventoryData hook

#### October 13, 2025

#### Modal-Based Product Addition
- Converted add-product page to a modal component (`AddProductModal.tsx`)
- Modal opens from the main inventory screen
- Integrated with database services for real-time category loading
- Automatic inventory refresh after product creation

#### Database-Backed Checkout
- Created `useCheckoutProducts` hook for loading products from database
- Products are now loaded from inventory instead of mock data
- Fixed cart state regression by ensuring consistent product ID usage
- Cart items properly persist across category navigation
- Products added to inventory immediately appear in checkout

#### Type System Updates
- Enhanced `Product` interface with additional fields:
  - `inventoryId`: Reference to inventory record
  - `productId`: Reference to product record
  - `categoryId`, `categoryIcon`, `categoryColor`: Category metadata
  - `cost`, `barcode`, `location`, `minStock`, `maxStock`: Inventory fields
- Ensures type safety across inventory and checkout flows
