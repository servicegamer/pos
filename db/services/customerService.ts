import { Q } from '@nozbe/watermelondb';
import { customersCollection, database } from '..';

export const customerService = {
    async findOrCreateCustomer(data: {
        businessId: string;
        name?: string;
        phone?: string;
        email?: string;
        creditLimit?: number;
    }) {
        const searchPhone = data.phone?.trim();
        const searchEmail = data.email?.trim();

        if (searchPhone) {
            const existingCustomer = await customersCollection
                .query(
                    Q.where('business_id', data.businessId),
                    Q.where('phone', searchPhone),
                    Q.where('deleted', false),
                )
                .fetch();

            if (existingCustomer.length > 0) {
                return { customer: existingCustomer[0], isNew: false };
            }
        }

        if (searchEmail) {
            const existingCustomer = await customersCollection
                .query(
                    Q.where('business_id', data.businessId),
                    Q.where('email', searchEmail),
                    Q.where('deleted', false),
                )
                .fetch();

            if (existingCustomer.length > 0) {
                return { customer: existingCustomer[0], isNew: false };
            }
        }

        const newCustomer = await this.createCustomer({
            businessId: data.businessId,
            name: data.name || 'Walk-in Customer',
            phone: searchPhone,
            email: searchEmail,
            creditLimit: data.creditLimit,
        });

        return { customer: newCustomer, isNew: true };
    },

    async createCustomer(data: {
        businessId: string;
        name: string;
        phone?: string;
        email?: string;
        creditLimit?: number;
    }) {
        return await database.write(async () => {
            return await customersCollection.create((customer) => {
                customer.externalId = `cust_${data.name}_${Date.now()}`;
                customer.businessId = data.businessId;
                customer.name = data.name;
                customer.phone = data.phone || '';
                customer.email = data.email || '';
                customer.creditLimit = data.creditLimit || 0;
                customer.currentBalance = 0;
                customer.reputationScore = 100;
                customer.deleted = false;
            });
        });
    },

    async updateCustomer(
        customerId: string,
        updates: Partial<{
            name: string;
            phone: string;
            email: string;
            creditLimit: number;
            reputationScore: number;
        }>,
    ) {
        const customer = await customersCollection.find(customerId);

        return await database.write(async () => {
            return await customer.update((c) => {
                if (updates.name !== undefined) c.name = updates.name;
                if (updates.phone !== undefined) c.phone = updates.phone;
                if (updates.email !== undefined) c.email = updates.email;
                if (updates.creditLimit !== undefined) c.creditLimit = updates.creditLimit;
                if (updates.reputationScore !== undefined)
                    c.reputationScore = updates.reputationScore;
            });
        });
    },

    async recordPayment(customerId: string, amount: number) {
        const customer = await customersCollection.find(customerId);

        return await database.write(async () => {
            return await customer.update((c) => {
                c.currentBalance = Math.max(0, (c.currentBalance || 0) - amount);
            });
        });
    },

    async deleteCustomer(customerId: string) {
        const customer = await customersCollection.find(customerId);

        return await database.write(async () => {
            return await customer.update((c) => {
                c.deleted = true;
            });
        });
    },

    async getCustomerById(customerId: string) {
        return await customersCollection.find(customerId);
    },

    async getCustomersByBusiness(businessId: string) {
        return await customersCollection
            .query(
                Q.where('business_id', businessId),
                Q.where('deleted', false),
                Q.sortBy('name', Q.asc),
            )
            .fetch();
    },

    async searchCustomers(businessId: string, searchTerm: string) {
        return await customersCollection
            .query(
                Q.where('business_id', businessId),
                Q.where('deleted', false),
                Q.or(
                    Q.where('name', Q.like(`%${Q.sanitizeLikeString(searchTerm)}%`)),
                    Q.where('phone', Q.like(`%${Q.sanitizeLikeString(searchTerm)}%`)),
                ),
                Q.sortBy('name', Q.asc),
            )
            .fetch();
    },

    async getCustomersWithCredit(businessId: string) {
        const customers = await customersCollection
            .query(Q.where('business_id', businessId), Q.where('deleted', false))
            .fetch();

        return customers.filter((c) => (c.currentBalance || 0) > 0);
    },

    async getCustomerWithSales(customerId: string) {
        const customer = await customersCollection.find(customerId);
        const sales = await customer.sales.fetch();
        return { customer, sales };
    },
};
