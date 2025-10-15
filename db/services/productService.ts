import { Q } from '@nozbe/watermelondb';
import Product from '../models/products';
import { database, productsCollection } from '..';

export const productService = {
    async createProduct(data: {
        businessId: string;
        categoryId: string;
        name: string;
        cost?: number;
        barcode?: string;
        description?: string;
        unit?: string;
        status?: string;
    }) {
        const newProduct = await database.write(async () => {
            return await productsCollection.create((product) => {
                product.externalId = `prod_${Date.now()}`;
                product.businessId = data.businessId;
                product.categoryId = data.categoryId;
                product.name = data.name;
                // product.cost = data.cost || 0;
                product.barcode = data.barcode || '';
                product.description = data.description || '';
                product.unit = data.unit || 'pcs';
                product.status = data.status || 'active';
                product.deleted = false;
            });
        });

        console.log('New Product:', newProduct);
        return newProduct;
    },

    async updateProduct(
        productId: string,
        updates: Partial<{
            name: string;
            categoryId: string;
            cost: number;
            barcode: string;
            description: string;
            unit: string;
            status: string;
        }>,
    ) {
        const product = await database.collections.get<Product>('products').find(productId);

        return await database.write(async () => {
            return await product.update((p) => {
                if (updates.name !== undefined) p.name = updates.name;
                if (updates.categoryId !== undefined) p.categoryId = updates.categoryId;
                // if (updates.cost !== undefined) p.cost = updates.cost;
                if (updates.barcode !== undefined) p.barcode = updates.barcode;
                if (updates.description !== undefined) p.description = updates.description;
                if (updates.unit !== undefined) p.unit = updates.unit;
                if (updates.status !== undefined) p.status = updates.status;
            });
        });
    },

    async deleteProduct(productId: string) {
        const product = await productsCollection.find(productId);

        return await database.write(async () => {
            return await product.update((p) => {
                p.deleted = true;
                p.status = 'inactive';
            });
        });
    },

    async getProductById(productId: string) {
        return await productsCollection.find(productId);
    },

    async getProductsByBusiness(businessId: string) {
        return await productsCollection
            .query(
                Q.where('business_id', businessId),
                Q.where('deleted', false),
                Q.sortBy('created_at', Q.desc),
            )
            .fetch();
    },

    async getProductsByCategory(categoryId: string) {
        return await productsCollection
            .query(
                Q.where('category_id', categoryId),
                Q.where('deleted', false),
                Q.sortBy('name', Q.asc),
            )
            .fetch();
    },

    async searchProducts(businessId: string, searchTerm: string) {
        return await productsCollection
            .query(
                Q.where('business_id', businessId),
                Q.where('deleted', false),
                Q.or(
                    Q.where('name', Q.like(`%${Q.sanitizeLikeString(searchTerm)}%`)),
                    Q.where('barcode', Q.like(`%${Q.sanitizeLikeString(searchTerm)}%`)),
                ),
                Q.sortBy('name', Q.asc),
            )
            .fetch();
    },

    async getProductWithCategory(productId: string) {
        const product = await productsCollection.find(productId);
        const category = await product.category.fetch();
        return { product, category };
    },
};
