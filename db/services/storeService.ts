import { Q } from '@nozbe/watermelondb';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { distinctUntilChanged, map, shareReplay, switchMap } from 'rxjs/operators';
import { database, storeCollection, User } from '..';
import Store from '../models/stores';
import { businessCollection } from './businessService';

// Holds the currently selected store id
const selectedStoreId$ = new BehaviorSubject<string | null>(null);

async function initSelectedStore() {
    try {
        const stores = await storeCollection
            .query(Q.where('deleted', false), Q.where('status', 'active'))
            .fetch();
        if (stores.length > 0) selectedStoreId$.next(stores[0].id);
    } catch (e) {
        console.log('storeService init error', e);
        selectedStoreId$.next(null);
    }
}

initSelectedStore();

export const selectedStore$: Observable<Store | null> = selectedStoreId$.pipe(
    switchMap((id) => {
        if (!id) return of(null);
        return storeCollection.findAndObserve(id).pipe(map((s) => (s && s.isActive ? s : null)));
    }),
    distinctUntilChanged((a, b) => a?.id === b?.id),
    shareReplay(1),
);

export const activeStores$: Observable<Store[]> = new Observable<Store[]>((observer) => {
    storeCollection
        .query(Q.where('deleted', false), Q.where('status', 'active'))
        .observe()
        .subscribe(observer);
}).pipe(shareReplay(1));

export async function findStoreById(id: string): Promise<Store | null> {
    try {
        return await storeCollection.find(id);
    } catch {
        return null;
    }
}

export async function createStore(data: {
    name: string;
    businessId: string;
    address?: string;
    phone?: string;
    email?: string;
    managerId?: string;
    currency?: string;
    status?: string;
}) {
    try {
        const s = await database.write(async () => {
            const biz = await businessCollection.find(data.businessId);
            return await storeCollection.create((store) => {
                store.externalId = `str_${data.name}${Date.now()}_${Math.random().toString(36).slice(2)}`;
                // relation id fields are not typed on the Model class here, cast to `any` to set them
                store.business.set(biz);
                store.name = data.name;
                store.address = data.address || '';
                store.phone = data.phone || '';
                store.email = data.email || '';
                (store as any).managerId = data.managerId || '';
                store.currency = data.currency || '';
                store.status = data.status || 'active';
                store.deleted = false;
            });
        });
        selectedStoreId$.next(s.id);
        return s;
    } catch (e) {
        console.log('createStore error', e);
        return null;
    }
}

export async function updateStore(
    id: string,
    patch: Partial<{
        name: string;
        address: string;
        phone: string;
        email: string;
        managerId: string;
        currency: string;
        status: string;
        deleted: boolean;
    }>,
) {
    const s = await findStoreById(id);
    const user = await User.findByUserById(patch.managerId || '');
    if (!s) throw new Error('Store not found');
    await database.write(async () => {
        await s.update((row) => {
            if (patch.name !== undefined) row.name = patch.name;
            if (patch.address !== undefined) row.address = patch.address;
            if (patch.phone !== undefined) row.phone = patch.phone;
            if (patch.email !== undefined) row.email = patch.email;
            if (patch.managerId !== undefined) row.manager.set(user);
            if (patch.currency !== undefined) row.currency = patch.currency;
            if (patch.status !== undefined) row.status = patch.status;
            if (patch.deleted !== undefined) row.deleted = !!patch.deleted;
        });
    });
}

export async function markStoreDeleted(id: string) {
    await updateStore(id, { deleted: true, status: 'inactive' });
    if (selectedStoreId$.value === id) selectedStoreId$.next(null);
}

export function selectStore(id: string | null) {
    selectedStoreId$.next(id);
}

export async function findByExternalId(externalId: string) {
    const list = await storeCollection
        .query(Q.where('external_id', externalId), Q.where('deleted', false))
        .fetch();
    return list[0] || null;
}

export default {
    selectedStore$,
    activeStores$,
    selectStore,
    findStoreById,
    createStore,
    updateStore,
    markStoreDeleted,
    findByExternalId,
};
