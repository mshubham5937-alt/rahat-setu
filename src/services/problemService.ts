import type { Problem, ProblemCategory, Location, Evidence, AIAnalysis } from '../types';
import { aiService } from './aiService';

export interface NewProblemInput {
  title: string;
  description: string;
  category: ProblemCategory;
  location: Location;
  evidence: Evidence[];
  reportedBy: string;
}

let idCounter = Date.now() % 100000;

function generateId(prefix = 'prob'): string {
  return `${prefix}-${idCounter++}`;
}

export const problemService = {
  generateId,

  createBaseProblem(input: NewProblemInput): Problem {
    const now = new Date();
    return {
      id: generateId(),
      title: input.title,
      description: input.description,
      category: input.category,
      location: input.location,
      severity: 'low',
      urgency: 'normal',
      priorityScore: 0,
      affectedPopulation: 0,
      evidence: input.evidence,
      reportedBy: input.reportedBy,
      reportedAt: now,
      status: 'reported',
      currentStage: 1,
      universityMatches: [],
      industryMatches: [],
      requiredExpertise: [],
      createdAt: now,
      updatedAt: now,
    };
  },

  /**
   * Runs a full simulated pipeline on a new report:
   * create -> AI analyze -> generate matches.
   * Returns the enriched problem (after analysis).
   */
  async runPipeline(input: NewProblemInput): Promise<{ problem: Problem; matches: { universities: number; industries: number } }> {
    const base = this.createBaseProblem(input);

    const analysis: AIAnalysis = await aiService.analyze(base.description, base.category);

    const enriched: Problem = {
      ...base,
      category: analysis.category,
      severity: analysis.severity,
      urgency: analysis.urgency,
      priorityScore: analysis.priorityScore,
      aiAnalysis: analysis,
      status: 'ai_analyzed',
      currentStage: 2,
      requiredExpertise: analysis.recommendedExpertise,
      updatedAt: new Date(),
    };

    return { problem: enriched, matches: { universities: 0, industries: 0 } };
  },
};