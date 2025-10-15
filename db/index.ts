import { Database } from '@nozbe/watermelondb';
import LokiJSAdapter from '@nozbe/watermelondb/adapters/lokijs';

import Business from './models/business';
import Category from './models/categories';
import Customer from './models/customers';
import Inventory from './models/inventory';
import InventoryBatch from './models/inventory_batches';
import Product from './models/products';
import Role from './models/roles';
import Sale from './models/sales';
import SaleItem from './models/sales_items';
import Session from './models/sessions';
import Staff from './models/staff';
import Store from './models/stores';
import User from './models/users';
import schema from './schema';

export {
    Business,
    Category,
    Customer,
    Inventory,
    InventoryBatch,
    Product,
    Role,
    Sale,
    SaleItem,
    Session,
    Staff,
    Store,
    User,
};

// First, create the adapter to the underlying database:
const adapter = new LokiJSAdapter({
    schema,
    useWebWorker: false,
    useIncrementalIndexedDB: true,
    dbName: 'pos',
    onSetUpError: (error) => {
        console.error('Database setup failed', error);
    },
});

// Then, make a Watermelon database from it
export const database = new Database({
    adapter,
    modelClasses: [
        User,
        Session,
        Business,
        Store,
        Role,
        Staff,
        Category,
        Product,
        Inventory,
        InventoryBatch,
        Customer,
        Sale,
        SaleItem,
    ],
    // actionsEnabled: true,
});

export const storeCollection = database.collections.get<Store>('stores');
export const userCollection = database.collections.get<User>('users');
export const sessionCollection = database.collections.get<Session>('sessions');
export const categoriesCollection = database.collections.get<Category>('categories');
export const salesCollection = database.collections.get<Sale>('sales');
export const saleItemsCollection = database.collections.get<SaleItem>('sales_items');
export const customersCollection = database.collections.get<Customer>('customers');
export const productsCollection = database.collections.get<Product>('products');
export const inventoryCollection = database.collections.get<Inventory>('inventory');
export const inventoryBatchesCollection =
    database.collections.get<InventoryBatch>('inventory_batches');
export const staffCollection = database.collections.get<Staff>('staff');
export const businessCollection = database.collections.get<Business>('businesses');
export const roleCollection = database.collections.get<Role>('roles');
