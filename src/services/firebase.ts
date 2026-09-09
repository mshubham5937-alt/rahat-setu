import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getFirestore,
  collection,
  doc,
  setDoc,
  getDocs,
  onSnapshot,
  Timestamp,
  type Unsubscribe,
} from 'firebase/firestore';
import type { Problem, Notification } from '../types';

export const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || 'AIzaSyBdNjtmkXB_giG7ruaK3hoBHfnO_yvtClM',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || 'rahat-setu.firebaseapp.com',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || 'rahat-setu',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || 'rahat-setu.firebasestorage.app',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '343606671773',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || '1:343606671773:web:1bc279075709f64a975774',
};

// Initialize Firebase App singleton
export const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
export const db = getFirestore(app);

/**
 * Strips undefined fields and converts Dates to Firestore Timestamps
 */
export function sanitizeForFirestore(obj: unknown): unknown {
  if (obj === undefined) return null;
  if (obj === null || typeof obj !== 'object') return obj;
  if (obj instanceof Date) return Timestamp.fromDate(obj);
  if (Array.isArray(obj)) {
    return obj.map(sanitizeForFirestore);
  }
  const clean: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(obj as Record<string, unknown>)) {
    if (value !== undefined) {
      clean[key] = sanitizeForFirestore(value);
    }
  }
  return clean;
}

/**
 * Recursively converts Firestore Timestamps and ISO strings into JavaScript Dates
 */
export function convertTimestamps<T>(obj: unknown): T {
  if (!obj || typeof obj !== 'object') return obj as T;
  if (obj instanceof Timestamp) return obj.toDate() as unknown as T;
  if (typeof (obj as { toDate?: unknown }).toDate === 'function') {
    return (obj as { toDate: () => Date }).toDate() as unknown as T;
  }
  if (Array.isArray(obj)) {
    return obj.map((item) => convertTimestamps(item)) as unknown as T;
  }
  const result: Record<string, unknown> = {};
  for (const [key, val] of Object.entries(obj as Record<string, unknown>)) {
    if (val && typeof val === 'object' && typeof (val as { toDate?: unknown }).toDate === 'function') {
      result[key] = (val as { toDate: () => Date }).toDate();
    } else if (
      (key.endsWith('At') || key === 'timestamp' || key === 'analysisTimestamp') &&
      typeof val === 'string'
    ) {
      const parsed = new Date(val);
      result[key] = isNaN(parsed.getTime()) ? val : parsed;
    } else if (typeof val === 'object' && val !== null) {
      result[key] = convertTimestamps(val);
    } else {
      result[key] = val;
    }
  }
  return result as T;
}

/**
 * Firestore Problem API
 */
export const firestoreService = {
  async saveProblem(problem: Problem): Promise<void> {
    const cleanData = sanitizeForFirestore(problem) as Record<string, unknown>;
    const ref = doc(db, 'problems', problem.id);
    await setDoc(ref, cleanData, { merge: true });
  },

  async updateProblem(id: string, updates: Partial<Problem>): Promise<void> {
    const cleanData = sanitizeForFirestore({ ...updates, updatedAt: new Date() }) as Record<string, unknown>;
    const ref = doc(db, 'problems', id);
    await setDoc(ref, cleanData, { merge: true });
  },

  async getAllProblems(): Promise<Problem[]> {
    const snap = await getDocs(collection(db, 'problems'));
    return snap.docs.map((docSnap) => convertTimestamps<Problem>({ ...docSnap.data(), id: docSnap.id }));
  },

  subscribeToProblems(
    onSuccess: (problems: Problem[]) => void,
    onError?: (error: Error) => void
  ): Unsubscribe {
    return onSnapshot(
      collection(db, 'problems'),
      (snap) => {
        const list = snap.docs.map((d) => convertTimestamps<Problem>({ ...d.data(), id: d.id }));
        onSuccess(list);
      },
      (err) => {
        if (onError) onError(err);
      }
    );
  },

  async seedDemoIfEmpty(demoProblems: Problem[]): Promise<boolean> {
    try {
      const snap = await getDocs(collection(db, 'problems'));
      if (snap.empty) {
        for (const p of demoProblems) {
          await this.saveProblem(p);
        }
        return true;
      }
      return false;
    } catch {
      return false;
    }
  },

  async saveNotification(notification: Notification): Promise<void> {
    const cleanData = sanitizeForFirestore(notification) as Record<string, unknown>;
    const ref = doc(db, 'notifications', notification.id);
    await setDoc(ref, cleanData, { merge: true });
  },

  subscribeToNotifications(
    onSuccess: (notifications: Notification[]) => void,
    onError?: (error: Error) => void
  ): Unsubscribe {
    return onSnapshot(
      collection(db, 'notifications'),
      (snap) => {
        const list = snap.docs.map((d) => convertTimestamps<Notification>({ ...d.data(), id: d.id }));
        // Sort newest first
        list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        onSuccess(list);
      },
      (err) => {
        if (onError) onError(err);
      }
    );
  },
};
