import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useRef,
  type ReactNode,
} from 'react';
import type { Problem, ProblemStatus, LifecycleStage, AIAnalysis, UniversityMatch, IndustryMatch } from '../types';
import { DEMO_PROBLEMS } from '../data/demoData';
import { storage, offlineQueue } from '../services/persistence';
import { firestoreService } from '../services/firebase';

export type FirestoreConnectionStatus = 'connecting' | 'connected' | 'offline' | 'error';

interface ProblemContextValue {
  problems: Problem[];
  firestoreStatus: FirestoreConnectionStatus;
  firestoreError: string | null;
  getProblemById: (id: string) => Problem | undefined;
  addProblem: (problem: Problem) => Promise<void>;
  updateProblemStatus: (id: string, status: ProblemStatus) => Promise<void>;
  advanceStage: (id: string) => Promise<void>;
  addAIAnalysis: (id: string, analysis: AIAnalysis) => Promise<void>;
  addUniversityMatch: (id: string, match: UniversityMatch) => Promise<void>;
  setUniversityMatchStatus: (id: string, universityId: string, status: UniversityMatch['status']) => Promise<void>;
  addIndustryMatch: (id: string, match: IndustryMatch) => Promise<void>;
  setIndustryMatchStatus: (id: string, industryId: string, status: IndustryMatch['status']) => Promise<void>;
  getProblemsByStatus: (status: ProblemStatus) => Problem[];
  getCriticalCount: () => number;
  getTotalAffected: () => number;
  resetDemo: () => Promise<void>;
}

const ProblemContext = createContext<ProblemContextValue | null>(null);

export function ProblemProvider({ children }: { children: ReactNode }) {
  const [problems, setProblems] = useState<Problem[] | null>(null);
  const [firestoreStatus, setFirestoreStatus] = useState<FirestoreConnectionStatus>('connecting');
  const [firestoreError, setFirestoreError] = useState<string | null>(null);
  const isHydrated = useRef(false);

  // Synchronize offline queue when reconnected
  useEffect(() => {
    const syncOfflineQueue = async () => {
      try {
        const pending = await offlineQueue.getAll();
        for (const item of pending) {
          if ((item.status === 'pending' || item.status === 'failed') && item.data) {
            await firestoreService.saveProblem(item.data as Problem);
            await offlineQueue.markSynced(item.id);
          }
        }
      } catch {
        /* will retry on next connection event */
      }
    };

    window.addEventListener('online', syncOfflineQueue);
    return () => window.removeEventListener('online', syncOfflineQueue);
  }, []);

  // Primary data subscription via Firestore with IndexedDB fallback
  useEffect(() => {
    let isSubscribed = true;

    // Load local IndexedDB cache first for instant render
    (async () => {
      try {
        const cached = await storage.getAll<Problem>('problems');
        if (isSubscribed && cached && cached.length > 0) {
          setProblems((prev) => (prev && prev.length > 0 ? prev : cached));
        }
      } catch {
        /* ignore */
      }
    })();

    // Subscribe to Firestore live collection
    const unsubscribe = firestoreService.subscribeToProblems(
      async (liveProblems) => {
        if (!isSubscribed) return;

        if (liveProblems.length > 0) {
          setProblems(liveProblems);
          setFirestoreStatus('connected');
          setFirestoreError(null);
          // Update local cache
          for (const p of liveProblems) {
            await storage.set('problems', p.id, p);
          }
        } else {
          // If Firestore is empty, seed it with DEMO_PROBLEMS so user has instant data
          if (!isHydrated.current) {
            isHydrated.current = true;
            try {
              for (const p of DEMO_PROBLEMS) {
                await firestoreService.saveProblem(p);
                await storage.set('problems', p.id, p);
              }
              setProblems(DEMO_PROBLEMS);
              setFirestoreStatus('connected');
              setFirestoreError(null);
            } catch (err: unknown) {
              const msg = err instanceof Error ? err.message : 'Error seeding Firestore';
              setFirestoreError(msg);
              setProblems(DEMO_PROBLEMS);
            }
          } else {
            setProblems([]);
            setFirestoreStatus('connected');
          }
        }
      },
      async (err) => {
        if (!isSubscribed) return;
        console.warn('Firestore subscription notice (using local offline cache):', err.message);
        setFirestoreStatus('error');
        setFirestoreError(err.message);

        // Fall back to IndexedDB or DEMO_PROBLEMS
        const cached = await storage.getAll<Problem>('problems');
        if (cached && cached.length > 0) {
          setProblems(cached);
        } else {
          setProblems(DEMO_PROBLEMS);
        }
      }
    );

    return () => {
      isSubscribed = false;
      unsubscribe();
    };
  }, []);

  const getProblemById = useCallback(
    (id: string) => (problems || []).find((p) => p.id === id),
    [problems]
  );

  const addProblem = useCallback(
    async (problem: Problem) => {
      // Optimistic update
      setProblems((prev) => [problem, ...(prev || [])]);
      // Cache locally
      await storage.set('problems', problem.id, problem);

      try {
        await firestoreService.saveProblem(problem);
      } catch (err) {
        console.warn('Could not sync problem to Firestore immediately, saved locally/queue:', err);
        await offlineQueue.add({ id: problem.id, type: 'report_submission', data: problem });
      }
    },
    []
  );

  const updateProblemStatus = useCallback(
    async (id: string, status: ProblemStatus) => {
      const updatedAt = new Date();
      setProblems((prev) =>
        (prev || []).map((p) => (p.id === id ? { ...p, status, updatedAt } : p))
      );

      try {
        await firestoreService.updateProblem(id, { status, updatedAt });
      } catch (err) {
        console.warn('Firestore update delayed:', err);
      }
    },
    []
  );

  const advanceStage = useCallback(
    async (id: string) => {
      let updatedProblem: Problem | null = null;
      const stageToStatus: Record<number, ProblemStatus> = {
        1: 'reported',
        2: 'ai_analyzed',
        3: 'verified',
        4: 'matched',
        5: 'collaborating',
        6: 'prototype',
        7: 'pilot',
        8: 'deployed',
        9: 'impact_measured',
      };

      setProblems((prev) =>
        (prev || []).map((p) => {
          if (p.id !== id) return p;
          const nextStage = Math.min(p.currentStage + 1, 9) as LifecycleStage;
          const nextStatus = stageToStatus[nextStage] || p.status;
          updatedProblem = {
            ...p,
            currentStage: nextStage,
            status: nextStatus,
            updatedAt: new Date(),
          };
          return updatedProblem;
        })
      );

      if (updatedProblem) {
        try {
          await firestoreService.saveProblem(updatedProblem);
        } catch (err) {
          console.warn('Firestore stage advance delayed:', err);
        }
      }
    },
    []
  );

  const addAIAnalysis = useCallback(
    async (id: string, analysis: AIAnalysis) => {
      let updatedProblem: Problem | null = null;
      setProblems((prev) =>
        (prev || []).map((p) => {
          if (p.id !== id) return p;
          updatedProblem = {
            ...p,
            aiAnalysis: analysis,
            status: 'ai_analyzed' as ProblemStatus,
            currentStage: 2,
            updatedAt: new Date(),
          };
          return updatedProblem;
        })
      );

      if (updatedProblem) {
        try {
          await firestoreService.saveProblem(updatedProblem);
        } catch (err) {
          console.warn('Firestore AI analysis sync delayed:', err);
        }
      }
    },
    []
  );

  const addUniversityMatch = useCallback(
    async (id: string, match: UniversityMatch) => {
      let updatedProblem: Problem | null = null;
      setProblems((prev) =>
        (prev || []).map((p) => {
          if (p.id !== id) return p;
          updatedProblem = {
            ...p,
            universityMatches: [...p.universityMatches, match],
            updatedAt: new Date(),
          };
          return updatedProblem;
        })
      );

      if (updatedProblem) {
        try {
          await firestoreService.saveProblem(updatedProblem);
        } catch (err) {
          console.warn('Firestore university match sync delayed:', err);
        }
      }
    },
    []
  );

  const setUniversityMatchStatus = useCallback(
    async (id: string, universityId: string, status: UniversityMatch['status']) => {
      let updatedProblem: Problem | null = null;
      setProblems((prev) =>
        (prev || []).map((p) => {
          if (p.id !== id) return p;
          updatedProblem = {
            ...p,
            universityMatches: p.universityMatches.map((m) =>
              m.universityId === universityId
                ? { ...m, status, ...(status === 'accepted' || status === 'active' ? { acceptedAt: new Date() } : {}) }
                : m
            ),
            updatedAt: new Date(),
          };
          return updatedProblem;
        })
      );

      if (updatedProblem) {
        try {
          await firestoreService.saveProblem(updatedProblem);
        } catch (err) {
          console.warn('Firestore university status update delayed:', err);
        }
      }
    },
    []
  );

  const addIndustryMatch = useCallback(
    async (id: string, match: IndustryMatch) => {
      let updatedProblem: Problem | null = null;
      setProblems((prev) =>
        (prev || []).map((p) => {
          if (p.id !== id) return p;
          updatedProblem = {
            ...p,
            industryMatches: [...p.industryMatches, match],
            updatedAt: new Date(),
          };
          return updatedProblem;
        })
      );

      if (updatedProblem) {
        try {
          await firestoreService.saveProblem(updatedProblem);
        } catch (err) {
          console.warn('Firestore industry match sync delayed:', err);
        }
      }
    },
    []
  );

  const setIndustryMatchStatus = useCallback(
    async (id: string, industryId: string, status: IndustryMatch['status']) => {
      let updatedProblem: Problem | null = null;
      setProblems((prev) =>
        (prev || []).map((p) => {
          if (p.id !== id) return p;
          updatedProblem = {
            ...p,
            industryMatches: p.industryMatches.map((m) =>
              m.industryId === industryId
                ? {
                    ...m,
                    status,
                    ...(status === 'committed' || status === 'delivered' ? { committedAt: new Date() } : {}),
                  }
                : m
            ),
            updatedAt: new Date(),
          };
          return updatedProblem;
        })
      );

      if (updatedProblem) {
        try {
          await firestoreService.saveProblem(updatedProblem);
        } catch (err) {
          console.warn('Firestore industry status update delayed:', err);
        }
      }
    },
    []
  );

  const getProblemsByStatus = useCallback(
    (status: ProblemStatus) => (problems || []).filter((p) => p.status === status),
    [problems]
  );

  const getCriticalCount = useCallback(
    () => (problems || []).filter((p) => p.severity === 'critical' || p.severity === 'high').length,
    [problems]
  );

  const getTotalAffected = useCallback(
    () => (problems || []).reduce((sum, p) => sum + p.affectedPopulation, 0),
    [problems]
  );

  const resetDemo = useCallback(async () => {
    setProblems(DEMO_PROBLEMS);
    await storage.clear('problems');
    for (const p of DEMO_PROBLEMS) {
      await storage.set('problems', p.id, p);
      try {
        await firestoreService.saveProblem(p);
      } catch {
        /* ignore */
      }
    }
  }, []);

  return (
    <ProblemContext.Provider
      value={{
        problems: problems || [],
        firestoreStatus,
        firestoreError,
        getProblemById,
        addProblem,
        updateProblemStatus,
        advanceStage,
        addAIAnalysis,
        addUniversityMatch,
        setUniversityMatchStatus,
        addIndustryMatch,
        setIndustryMatchStatus,
        getProblemsByStatus,
        getCriticalCount,
        getTotalAffected,
        resetDemo,
      }}
    >
      {children}
    </ProblemContext.Provider>
  );
}

export function useProblems() {
  const ctx = useContext(ProblemContext);
  if (!ctx) throw new Error('useProblems must be used within ProblemProvider');
  return ctx;
}
