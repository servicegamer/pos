import { appSchema, tableSchema } from '@nozbe/watermelondb';

export default appSchema({
    version: 1,
    tables: [
        tableSchema({
            name: 'sessions',
            columns: [
                { name: 'session_id', type: 'string', isIndexed: true }, // text UNIQUE
                { name: 'user_id', type: 'string', isIndexed: true }, // foreign key to users(id)
                { name: 'created_at', type: 'number' }, // session creation timestamp
                { name: 'is_active', type: 'boolean' }, // whether session is active
            ],
        }),
        tableSchema({
            name: 'users',
            columns: [
                { name: 'external_id', type: 'string', isOptional: true, isIndexed: true }, // text UNIQUE
                { name: 'email', type: 'string', isOptional: true, isIndexed: true }, // text UNIQUE
                { name: 'name', type: 'string', isOptional: true },
                { name: 'phone', type: 'string', isOptional: true },
                { name: 'password_hash', type: 'string', isOptional: true },
                { name: 'pin_hash', type: 'string', isOptional: true },
                { name: 'created_at', type: 'number' }, // store as timestamp (ms)
                { name: 'updated_at', type: 'number' }, // store as timestamp (ms)
                { name: 'deleted', type: 'boolean', isOptional: true },
                { name: 'is_owner', type: 'boolean', isOptional: true },
            ],
        }),
        tableSchema({
            name: 'businesses',
            columns: [
                { name: 'external_id', type: 'string', isOptional: true, isIndexed: true }, // text UNIQUE
                { name: 'name', type: 'string' }, // NOT NULL
                { name: 'business_type', type: 'string', isOptional: true },
                { name: 'owner_id', type: 'string', isIndexed: true }, // foreign key to app_users(id)
                { name: 'created_at', type: 'number' }, // store as timestamp (ms)
                { name: 'updated_at', type: 'number' }, // store as timestamp (ms)
                { name: 'deleted', type: 'boolean', isOptional: true },
            ],
        }),
        tableSchema({
            name: 'stores',
            columns: [
                { name: 'external_id', type: 'string', isOptional: true, isIndexed: true }, // text UNIQUE
                { name: 'business_id', type: 'string', isIndexed: true }, // foreign key to businesses(id)
                { name: 'name', type: 'string' }, // NOT NULL
                { name: 'address', type: 'string', isOptional: true },
                { name: 'phone', type: 'string', isOptional: true },
                { name: 'email', type: 'string', isOptional: true },
                { name: 'manager_id', type: 'string', isOptional: true, isIndexed: true }, // foreign key to app_users(id)
                { name: 'status', type: 'string', isOptional: true }, // default 'active' (handle in app logic)
                { name: 'currency', type: 'string', isOptional: true }, // default 'KES'
                { name: 'created_at', type: 'number' }, // timestamp (ms)
                { name: 'updated_at', type: 'number' }, // timestamp (ms)
                { name: 'deleted', type: 'boolean', isOptional: true },
            ],
        }),

        // Roles table
        tableSchema({
            name: 'roles',
            columns: [
                { name: 'external_id', type: 'string', isOptional: true, isIndexed: true }, // text UNIQUE
                { name: 'business_id', type: 'string', isIndexed: true }, // FK -> businesses(id)
                { name: 'name', type: 'string' }, // NOT NULL
                { name: 'permissions', type: 'string', isOptional: true }, // store JSON as string
                { name: 'deleted', type: 'boolean', isOptional: true },
            ],
        }),

        // Staff table
        tableSchema({
            name: 'staff',
            columns: [
                { name: 'external_id', type: 'string', isOptional: true, isIndexed: true }, // text UNIQUE
                { name: 'user_id', type: 'string', isIndexed: true }, // FK -> app_users(id)
                { name: 'store_id', type: 'string', isIndexed: true }, // FK -> stores(id)
                { name: 'role_id', type: 'string', isIndexed: true }, // FK -> roles(id)
                { name: 'assigned_at', type: 'number', isOptional: true }, // timestamp (ms)
                { name: 'deleted', type: 'boolean', isOptional: true },
            ],
        }),

        // Categories table
        tableSchema({
            name: 'categories',
            columns: [
                { name: 'external_id', type: 'string', isOptional: true, isIndexed: true }, // text UNIQUE
                { name: 'business_id', type: 'string', isIndexed: true }, // FK -> businesses(id)
                { name: 'name', type: 'string' }, // NOT NULL
                { name: 'icon', type: 'string', isOptional: true },
                { name: 'color', type: 'string', isOptional: true },
                { name: 'created_at', type: 'number' }, // timestamp (ms)
                { name: 'deleted', type: 'boolean', isOptional: true },
            ],
        }),

        // Products table
        tableSchema({
            name: 'products',
            columns: [
                { name: 'external_id', type: 'string', isOptional: true, isIndexed: true }, // text UNIQUE
                { name: 'business_id', type: 'string', isIndexed: true }, // FK -> businesses(id)
                { name: 'category_id', type: 'string', isIndexed: true }, // FK -> categories(id)
                { name: 'name', type: 'string' }, // NOT NULL
                { name: 'cost', type: 'number', isOptional: true },
                { name: 'barcode', type: 'string', isOptional: true, isIndexed: true },
                { name: 'description', type: 'string', isOptional: true },
                { name: 'unit', type: 'string', isOptional: true },
                { name: 'status', type: 'string', isOptional: true },
                { name: 'created_at', type: 'number' },
                { name: 'updated_at', type: 'number' },
                { name: 'deleted', type: 'boolean', isOptional: true },
            ],
        }),

        // Inventory table
        tableSchema({
            name: 'inventory',
            columns: [
                { name: 'external_id', type: 'string', isOptional: true, isIndexed: true }, // text UNIQUE
                { name: 'product_id', type: 'string', isIndexed: true }, // FK -> products(id)
                { name: 'store_id', type: 'string', isIndexed: true }, // FK -> stores(id)
                { name: 'quantity', type: 'number', isOptional: true },
                { name: 'min_stock', type: 'number', isOptional: true },
                { name: 'max_stock', type: 'number', isOptional: true },
                { name: 'price', type: 'number', isOptional: true },
                { name: 'whole_sale_price', type: 'number', isOptional: true },
                { name: 'weighted_avg_cost', type: 'number', isOptional: true },
                { name: 'last_purchase_price', type: 'number', isOptional: true },
                { name: 'location', type: 'string', isOptional: true },
                { name: 'last_updated', type: 'number', isOptional: true },
                { name: 'deleted', type: 'boolean', isOptional: true },
            ],
        }),

        // Customers table
        tableSchema({
            name: 'customers',
            columns: [
                { name: 'external_id', type: 'string', isOptional: true, isIndexed: true }, // text UNIQUE
                { name: 'business_id', type: 'string', isIndexed: true }, // FK -> businesses(id)
                { name: 'name', type: 'string' }, // NOT NULL
                { name: 'phone', type: 'string', isOptional: true, isIndexed: true },
                { name: 'email', type: 'string', isOptional: true },
                { name: 'credit_limit', type: 'number', isOptional: true },
                { name: 'current_balance', type: 'number', isOptional: true },
                { name: 'reputation_score', type: 'number', isOptional: true },
                { name: 'created_at', type: 'number' },
                { name: 'updated_at', type: 'number' },
                { name: 'deleted', type: 'boolean', isOptional: true },
            ],
        }),

        // Sales table
        tableSchema({
            name: 'sales',
            columns: [
                { name: 'external_id', type: 'string', isOptional: true, isIndexed: true }, // text UNIQUE
                { name: 'store_id', type: 'string', isIndexed: true }, // FK -> stores(id)
                { name: 'user_id', type: 'string', isIndexed: true }, // FK -> app_users(id)
                { name: 'customer_id', type: 'string', isOptional: true, isIndexed: true }, // FK -> customers(id)
                { name: 'total_amount', type: 'number' },
                { name: 'discount_amount', type: 'number', isOptional: true },
                { name: 'discount_percentage', type: 'number', isOptional: true },
                { name: 'subtotal', type: 'number' },
                { name: 'payment_method', type: 'string', isOptional: true },
                { name: 'on_credit', type: 'boolean', isOptional: true },
                { name: 'status', type: 'string', isOptional: true },
                { name: 'created_at', type: 'number' },
                { name: 'updated_at', type: 'number' },
            ],
        }),

        // Sales items table
        tableSchema({
            name: 'sales_items',
            columns: [
                { name: 'external_id', type: 'string', isOptional: true, isIndexed: true }, // text UNIQUE
                { name: 'sale_id', type: 'string', isIndexed: true }, // FK -> sales(id)
                { name: 'product_id', type: 'string', isIndexed: true }, // FK -> products(id)
                { name: 'quantity', type: 'number' },
                { name: 'unit_price', type: 'number' },
                { name: 'total_price', type: 'number' },
            ],
        }),

        // Inventory batches table - tracks all inventory movements
        tableSchema({
            name: 'inventory_batches',
            columns: [
                { name: 'external_id', type: 'string', isOptional: true, isIndexed: true },
                { name: 'inventory_id', type: 'string', isIndexed: true }, // FK -> inventory(id)
                { name: 'product_id', type: 'string', isIndexed: true }, // FK -> products(id)
                { name: 'store_id', type: 'string', isIndexed: true }, // FK -> stores(id)
                { name: 'user_id', type: 'string', isIndexed: true }, // FK -> users(id) - who made the change
                { name: 'quantity_change', type: 'number' }, // positive for additions, negative for deductions
                { name: 'quantity_before', type: 'number' }, // quantity before change
                { name: 'quantity_after', type: 'number' }, // quantity after change
                { name: 'cost_per_unit', type: 'number', isOptional: true }, // cost at time of batch
                { name: 'batch_type', type: 'string' }, // 'purchase', 'sale', 'adjustment', 'return', 'damage'
                { name: 'reference_id', type: 'string', isOptional: true, isIndexed: true }, // sale_id or purchase_id
                { name: 'notes', type: 'string', isOptional: true },
                { name: 'created_at', type: 'number' },
            ],
        }),
    ],
});
