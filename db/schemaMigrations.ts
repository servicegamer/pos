import { schemaMigrations, addColumns } from '@nozbe/watermelondb/Schema/migrations';

export default schemaMigrations({
    migrations: [
        {
            toVersion: 2,
            steps: [
                addColumns({
                    table: 'sales',
                    columns: [
                        { name: 'amount_paid', type: 'number', isOptional: true },
                        { name: 'amount_on_credit', type: 'number', isOptional: true },
                    ],
                }),
            ],
        },
    ],
});
