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
      const val = (await db.get(store, key)) as T | undefined;
      if (val !== undefined) return val;
    } catch {
      /* Fallback to localStorage */
    }

    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        const raw = window.localStorage.getItem(`rahatsetu_${store}_${key}`);
        if (raw) return JSON.parse(raw) as T;
      }
    } catch {
      /* ignore */
    }

    return undefined;
  },

  async getAll<T>(store: 'problems' | 'projects' | 'notifications'): Promise<T[]> {
    try {
      const db = await getDb();
      const list = (await db.getAll(store)) as T[];
      if (list && list.length > 0) return list;
    } catch {
      /* Fallback to localStorage */
    }

    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        const results: T[] = [];
        const prefix = `rahatsetu_${store}_`;
        for (let i = 0; i < window.localStorage.length; i++) {
          const k = window.localStorage.key(i);
          if (k && k.startsWith(prefix)) {
            const raw = window.localStorage.getItem(k);
            if (raw) {
              try {
                results.push(JSON.parse(raw) as T);
              } catch {
                /* ignore */
              }
            }
          }
        }
        if (results.length > 0) return results;
      }
    } catch {
      /* ignore */
    }

    return [];
  },

  async set(store: 'problems' | 'projects' | 'notifications', key: string, value: unknown): Promise<void> {
    try {
      const db = await getDb();
      await db.put(store, value, key);
    } catch {
      /* IndexedDB write fallback */
    }

    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.setItem(`rahatsetu_${store}_${key}`, JSON.stringify(value));
      }
    } catch {
      /* localStorage might be full or blocked */
    }
  },

  async delete(store: 'problems' | 'projects' | 'notifications', key: string): Promise<void> {
    try {
      const db = await getDb();
      await db.delete(store, key);
    } catch {
      /* ignore */
    }

    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.removeItem(`rahatsetu_${store}_${key}`);
      }
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

    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        const prefix = `rahatsetu_${store}_`;
        const toRemove: string[] = [];
        for (let i = 0; i < window.localStorage.length; i++) {
          const k = window.localStorage.key(i);
          if (k && k.startsWith(prefix)) {
            toRemove.push(k);
          }
        }
        toRemove.forEach((k) => window.localStorage.removeItem(k));
      }
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

  async clearAll(): Promise<void> {
    try {
      const db = await getDb();
      await db.clear('offlineQueue');
    } catch {
      /* ignore */
    }
  },
};

export interface DatabaseHealthResult {
  ok: boolean;
  engine: string;
  latencyMs: number;
  problemsCount: number;
  notificationsCount: number;
  pendingSyncCount: number;
  lastChecked: Date;
  error?: string;
}

export async function testDatabaseHealth(): Promise<DatabaseHealthResult> {
  const start = performance.now();
  try {
    const testKey = `__health_check_${Date.now()}`;
    const testPayload = { check: 'ok', timestamp: Date.now() };

    // Test Write
    await storage.set('problems', testKey, testPayload);

    // Test Read
    const readBack = await storage.get<{ check: string }>('problems', testKey);

    // Test Delete Cleanup
    await storage.delete('problems', testKey);

    const latencyMs = Math.round(performance.now() - start);
    const problems = await storage.getAll('problems');
    const notifications = await storage.getAll('notifications');
    const pending = await offlineQueue.countPending();

    const ok = Boolean(readBack && readBack.check === 'ok');

    return {
      ok,
      engine: 'IndexedDB (rahatsetu) + LocalStorage Dual Layer',
      latencyMs: Math.max(latencyMs, 1),
      problemsCount: problems.length,
      notificationsCount: notifications.length,
      pendingSyncCount: pending,
      lastChecked: new Date(),
    };
  } catch (err: unknown) {
    const latencyMs = Math.round(performance.now() - start);
    return {
      ok: false,
      engine: 'LocalStorage Mirror',
      latencyMs,
      problemsCount: 0,
      notificationsCount: 0,
      pendingSyncCount: 0,
      lastChecked: new Date(),
      error: err instanceof Error ? err.message : 'Database ping failure',
    };
  }
}

export function isOnline(): boolean {
  return typeof navigator !== 'undefined' ? navigator.onLine : true;
}