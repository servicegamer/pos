# POS (Point of Sale) - Expo React Native App

## Overview
This is an Expo-based Point of Sale (POS) application built with React Native, supporting web, iOS, and Android platforms. The app uses WatermelonDB for local data persistence and includes features for inventory management, checkout, credit transactions, and account management.

## Project Setup - Replit Environment

### Date: October 13, 2025

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
- **Add Products Modal** (`components/inventory/AddProductModal.tsx`)
  - Modal-based product creation (replaces separate page navigation)
  - Dynamic category loading from database
  - Create products with name, SKU, price, category, and initial stock
  - Automatic inventory record creation on product creation
  - Form validation and error handling
  - Real-time inventory refresh after adding products
  
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

### Recent Updates (October 13, 2025)

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
