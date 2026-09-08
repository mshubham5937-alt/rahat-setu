import { openDB, type DBSchema, type IDBPDatabase } from 'idb';

interface RahatSetuDB extends DBSchema {
  problems: {
    key: string;
    value: unknown;
  };
  projects: {
    key: string;
    value: unknown;
  };
  notifications: {
    key: string;
    value: unknown;
  };
  offlineQueue: {
    key: string;
    value: {
      id: string;
      type: string;
      data: unknown;
      createdAt: number;
      retries: number;
      status: 'pending' | 'syncing' | 'synced' | 'failed';
    };
  };
}

let dbPromise: Promise<IDBPDatabase<RahatSetuDB>> | null = null;

function getDb(): Promise<IDBPDatabase<RahatSetuDB>> {
  if (!dbPromise) {
    dbPromise = openDB<RahatSetuDB>('rahatsetu', 1, {
      upgrade(db) {
        if (!db.objectStoreNames.contains('problems')) db.createObjectStore('problems');
        if (!db.objectStoreNames.contains('projects')) db.createObjectStore('projects');
        if (!db.objectStoreNames.contains('notifications')) db.createObjectStore('notifications');
        if (!db.objectStoreNames.contains('offlineQueue')) db.createObjectStore('offlineQueue');
      },
    });
  }
  return dbPromise;
}

export const storage = {
  async get<T>(store: 'problems' | 'projects' | 'notifications', key: string): Promise<T | undefined> {
    try {
      const db = await getDb();
      return (await db.get(store, key)) as T | undefined;
    } catch {
      return undefined;
    }
  },

  async getAll<T>(store: 'problems' | 'projects' | 'notifications'): Promise<T[]> {
    try {
      const db = await getDb();
      return (await db.getAll(store)) as T[];
    } catch {
      return [];
    }
  },

  async set(store: 'problems' | 'projects' | 'notifications', key: string, value: unknown): Promise<void> {
    try {
      const db = await getDb();
      await db.put(store, value, key);
    } catch {
      // Fall back to in-memory only; never crash the app
    }
  },

  async delete(store: 'problems' | 'projects' | 'notifications', key: string): Promise<void> {
    try {
      const db = await getDb();
      await db.delete(store, key);
    } catch {
      /* ignore */
    }
  },

  async clear(store: 'problems' | 'projects' | 'notifications'): Promise<void> {
    try {
      const db = await getDb();
      await db.clear(store);
    } catch {
      /* ignore */
    }
  },
};

export const offlineQueue = {
  async add(item: { id: string; type: string; data: unknown }): Promise<void> {
    try {
      const db = await getDb();
      await db.put('offlineQueue', {
        id: item.id,
        type: item.type,
        data: item.data,
        createdAt: Date.now(),
        retries: 0,
        status: 'pending',
      } as never);
    } catch {
      /* ignore */
    }
  },

  async getAll(): Promise<RahatSetuDB['offlineQueue']['value'][]> {
    try {
      const db = await getDb();
      return await db.getAll('offlineQueue');
    } catch {
      return [];
    }
  },

  async countPending(): Promise<number> {
    try {
      const db = await getDb();
      const all = await db.getAll('offlineQueue');
      return all.filter((i) => i.status === 'pending' || i.status === 'failed').length;
    } catch {
      return 0;
    }
  },

  async markSynced(id: string): Promise<void> {
    try {
      const db = await getDb();
      const item = await db.get('offlineQueue', id);
      if (item) {
        await db.put('offlineQueue', { ...item, status: 'synced' } as never, id);
      }
    } catch {
      /* ignore */
    }
  },

  async remove(id: string): Promise<void> {
    try {
      const db = await getDb();
      await db.delete('offlineQueue', id);
    } catch {
      /* ignore */
    }
  },
};

export function isOnline(): boolean {
  return typeof navigator !== 'undefined' ? navigator.onLine : true;
}