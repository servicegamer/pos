import Business from '@/db/models/business';
import { BusinessStoreData } from '@/types';
import { Q } from '@nozbe/watermelondb';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { distinctUntilChanged, map, shareReplay, switchMap } from 'rxjs/operators';
import { database, Store, storeCollection, userCollection } from '..';

// Holds the currently selected business id (or null)
const selectedBusinessId$ = new BehaviorSubject<string | null>(null);
export const businessCollection = database.get<Business>('businesses');

// Observable for the currently selected business (keeps reacting to DB changes)
export const selectedBusiness$: Observable<Business | null> = selectedBusinessId$.pipe(
    switchMap((id) => {
        if (!id) return of(null);
        return businessCollection.findAndObserve(id).pipe(map((b) => (b && !b.deleted ? b : null)));
    }),
    distinctUntilChanged((a, b) => a?.id === b?.id),
    shareReplay(1),
);

// Observable for all active businesses
export const activeBusinesses$: Observable<Business[]> = new Observable<Business[]>((observer) => {
    businessCollection.query(Q.where('deleted', false)).observe().subscribe(observer);
}).pipe(shareReplay(1));

// CRUD Helpers
export async function findBusinessById(id: string): Promise<Business | null> {
    try {
        return await businessCollection.find(id);
    } catch {
        return null;
    }
}

export async function createBusiness(data: {
    name: string;
    businessType?: string;
    owner?: string;
}): Promise<Business | null> {
    const user = await userCollection.find(data.owner || '');
    try {
        const b = await database.write(async () => {
            return await database.get<Business>('businesses').create((biz) => {
                biz.externalId = `biz_${Date.now()}_${Math.random().toString(36).slice(2)}`;
                biz.name = data.name;
                biz.businessType = data.businessType || '';
                // owner relation stored as owner_id field in DB - set via relation on create
                biz.owner.set(user);
                biz.deleted = false;
            });
        });
        // select the newly created business
        selectedBusinessId$.next(b.id);
        return b;
    } catch (e) {
        console.log('createBusiness error', e);
        return null;
    }
}

export async function updateBusiness(
    id: string,
    patch: Partial<{ name: string; businessType: string; deleted: boolean }>,
) {
    const b = await findBusinessById(id);
    if (!b) throw new Error('Business not found');
    await database.write(async () => {
        await b.update((row) => {
            if (patch.name !== undefined) row.name = patch.name;
            if (patch.businessType !== undefined) row.businessType = patch.businessType;
            if (patch.deleted !== undefined) row.deleted = !!patch.deleted;
        });
    });
}

export async function markBusinessDeleted(id: string) {
    await updateBusiness(id, { deleted: true });
    // if the deleted business was selected, clear selection
    if (selectedBusinessId$.value === id) selectedBusinessId$.next(null);
}

export function selectBusiness(id: string | null) {
    selectedBusinessId$.next(id);
}

export async function findByExternalId(externalId: string): Promise<Business | null> {
    const list = await businessCollection
        .query(Q.where('external_id', externalId), Q.where('deleted', false))
        .fetch();
    return list[0] || null;
}

/**
 * Create a business and an initial store in a single transaction.
 * - Creates a Business record and a Store record linked to it
 * - Marks the newly-created business as the selected business
 * - Selects the created store via the store service
 *
 * Returns the created Business and Store models, or { business: null, store: null }
 * on failure.
 */
export async function createBusinessWithStore(
    data: BusinessStoreData,
    ownerId?: string,
): Promise<{ business: Business | null; store: Store | null }> {
    try {
        const owner = await userCollection.find(ownerId || '');
        const result = await database.write(async () => {
            const createdBusiness = await businessCollection.create((biz) => {
                biz.externalId = `biz_${data.businessName}${Date.now()}_${Math.random().toString(36).slice(2)}`;
                biz.name = data.businessName;
                biz.businessType = '';
                biz.owner.set(owner);
                biz.deleted = false;
            });

            // create the primary store for this business
            const createdStore = await storeCollection.create((store) => {
                store.externalId = `str_${data.storeName}${Date.now()}_${Math.random().toString(36).slice(2)}`;
                store.business.set(createdBusiness);
                store.name = data.storeName;
                store.address = data.storeAddress || '';
                store.phone = data.storePhone || '';
                store.email = data.storeEmail || '';
                store.currency = 'Kes';
                store.status = 'active';
                store.deleted = false;
                // set manager to owner if provided
                store.manager?.set(owner);
            });

            return { createdBusiness, createdStore };
        });

        // select the newly created business and store for the app
        if (result.createdBusiness) selectedBusinessId$.next(result.createdBusiness.id);
        if (result.createdStore) {
            // Lazy-import storeService to avoid a require-cycle between
            // businessService and storeService (they reference each other).
            // Importing inside the function ensures modules finish initializing
            // before the cross-call happens.
            try {
                const { selectStore: svcSelectStore } = await import('./storeService');
                svcSelectStore(result.createdStore.id);
            } catch (e) {
                console.log('createBusinessWithStore: failed to select store', e);
            }
        }

        return { business: result.createdBusiness, store: result.createdStore };
    } catch (e) {
        console.log('createBusinessWithStore error', e);
        return { business: null, store: null };
    }
}

export default {
    selectedBusiness$,
    activeBusinesses$,
    selectBusiness,
    findBusinessById,
    createBusiness,
    updateBusiness,
    markBusinessDeleted,
    findByExternalId,
};
