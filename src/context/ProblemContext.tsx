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
import { storage } from '../services/persistence';

interface ProblemContextValue {
  problems: Problem[];
  getProblemById: (id: string) => Problem | undefined;
  addProblem: (problem: Problem) => void;
  updateProblemStatus: (id: string, status: ProblemStatus) => void;
  advanceStage: (id: string) => void;
  addAIAnalysis: (id: string, analysis: AIAnalysis) => void;
  addUniversityMatch: (id: string, match: UniversityMatch) => void;
  setUniversityMatchStatus: (id: string, universityId: string, status: UniversityMatch['status']) => void;
  addIndustryMatch: (id: string, match: IndustryMatch) => void;
  setIndustryMatchStatus: (id: string, industryId: string, status: IndustryMatch['status']) => void;
  getProblemsByStatus: (status: ProblemStatus) => Problem[];
  getCriticalCount: () => number;
  getTotalAffected: () => number;
  resetDemo: () => void;
}

const ProblemContext = createContext<ProblemContextValue | null>(null);

export function ProblemProvider({ children }: { children: ReactNode }) {
  const [problems, setProblems] = useState<Problem[] | null>(null);
  const hydrated = useRef(false);

  useEffect(() => {
    if (hydrated.current) return;
    hydrated.current = true;
    (async () => {
      const saved = await storage.getAll<Problem>('problems');
      if (saved && saved.length > 0) {
        setProblems(saved);
      } else {
        setProblems(DEMO_PROBLEMS);
      }
    })();
  }, []);

  const persist = useCallback(async (next: Problem[]) => {
    setProblems(next);
    try {
      for (const p of next) {
        await storage.set('problems', p.id, p);
      }
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    const onUnload = () => {
      if (problems && freshRef.current) {
        try {
          const snapshot = JSON.stringify(freshRef.current);
          localStorage.setItem('rahatsetu_problems_snapshot', snapshot);
        } catch {
          /* ignore */
        }
      }
    };
    window.addEventListener('beforeunload', onUnload);
    return () => window.removeEventListener('beforeunload', onUnload);
  }, [problems]);

  const freshRef = useRef<Problem[]>([]);
  useEffect(() => { freshRef.current = problems || []; }, [problems]);

  const getProblemById = useCallback(
    (id: string) => (problems || []).find((p) => p.id === id),
    [problems]
  );

  const addProblem = useCallback(
    (problem: Problem) => {
      persist([...(problems || []), problem]);
    },
    [problems, persist]
  );

  const updateProblemStatus = useCallback(
    (id: string, status: ProblemStatus) => {
      if (!problems) return;
      persist(problems.map((p) => (p.id === id ? { ...p, status, updatedAt: new Date() } : p)));
    },
    [problems, persist]
  );

  const advanceStage = useCallback(
    (id: string) => {
      if (!problems) return;
      persist(
        problems.map((p) => {
          if (p.id !== id) return p;
          const nextStage = Math.min(p.currentStage + 1, 9) as LifecycleStage;
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
          return {
            ...p,
            currentStage: nextStage,
            status: stageToStatus[nextStage] || p.status,
            updatedAt: new Date(),
          };
        })
      );
    },
    [problems, persist]
  );

  const addAIAnalysis = useCallback(
    (id: string, analysis: AIAnalysis) => {
      if (!problems) return;
      persist(
        problems.map((p) =>
          p.id === id
            ? { ...p, aiAnalysis: analysis, status: 'ai_analyzed' as ProblemStatus, currentStage: 2, updatedAt: new Date() }
            : p
        )
      );
    },
    [problems, persist]
  );

  const addUniversityMatch = useCallback(
    (id: string, match: UniversityMatch) => {
      if (!problems) return;
      persist(
        problems.map((p) =>
          p.id === id ? { ...p, universityMatches: [...p.universityMatches, match], updatedAt: new Date() } : p
        )
      );
    },
    [problems, persist]
  );

  const setUniversityMatchStatus = useCallback(
    (id: string, universityId: string, status: UniversityMatch['status']) => {
      if (!problems) return;
      persist(
        problems.map((p) =>
          p.id === id
            ? {
                ...p,
                universityMatches: p.universityMatches.map((m) =>
                  m.universityId === universityId
                    ? { ...m, status, ...(status === 'accepted' || status === 'active' ? { acceptedAt: new Date() } : {}) }
                    : m
                ),
                updatedAt: new Date(),
              }
            : p
        )
      );
    },
    [problems, persist]
  );

  const addIndustryMatch = useCallback(
    (id: string, match: IndustryMatch) => {
      if (!problems) return;
      persist(
        problems.map((p) =>
          p.id === id ? { ...p, industryMatches: [...p.industryMatches, match], updatedAt: new Date() } : p
        )
      );
    },
    [problems, persist]
  );

  const setIndustryMatchStatus = useCallback(
    (id: string, industryId: string, status: IndustryMatch['status']) => {
      if (!problems) return;
      persist(
        problems.map((p) =>
          p.id === id
            ? {
                ...p,
                industryMatches: p.industryMatches.map((m) =>
                  m.industryId === industryId
                    ? { ...m, status, ...((status === 'committed' || status === 'delivered') ? { committedAt: new Date() } : {}) }
                    : m
                ),
                updatedAt: new Date(),
              }
            : p
        )
      );
    },
    [problems, persist]
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

  const resetDemo = useCallback(() => {
    setProblems(DEMO_PROBLEMS);
    (async () => {
      await storage.clear('problems');
      for (const p of DEMO_PROBLEMS) {
        await storage.set('problems', p.id, p);
      }
    })();
  }, []);

  return (
    <ProblemContext.Provider
      value={{
        problems: problems || [],
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