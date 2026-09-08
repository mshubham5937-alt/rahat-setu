import type { AIAnalysis, ProblemCategory } from '../types';

/**
 * Simulated AI analysis for the SIH prototype.
 *
 * Uses keyword + context heuristics to produce a realistic triage result
 * without requiring an external ML service. The interface mirrors a real
 * model so it can be swapped for an actual endpoint later.
 */

const KEYWORD_SCORES: { category: ProblemCategory; keywords: string[]; base: number }[] = [
  { category: 'urban_flooding', keywords: ['flood', 'waterlog', 'drain', 'inundat', 'underpass', 'breach', 'rain', 'pump'], base: 84 },
  { category: 'landslide', keywords: ['landslide', 'slope', 'mud', 'rock fall', 'hill', 'soil'], base: 86 },
  { category: 'cyclone', keywords: ['cyclone', 'storm', 'hurricane', 'wind', 'landfall'], base: 90 },
  { category: 'earthquake', keywords: ['earthquake', 'quake', 'tremor', 'aftershock'], base: 92 },
  { category: 'fire', keywords: ['fire', 'blaze', 'smoke', 'burning'], base: 88 },
  { category: 'infrastructure_collapse', keywords: ['collapse', 'crack', 'bridge', 'building fell', 'girders'], base: 87 },
  { category: 'communication_blackout', keywords: ['communication', 'blackout', 'network down', 'no signal', 'tower'], base: 82 },
  { category: 'water_contamination', keywords: ['contaminat', 'cholera', 'drinking water', 'sewage', 'polluted'], base: 83 },
  { category: 'epidemic', keywords: ['epidemic', 'outbreak', 'dengue', 'malaria', 'cases'], base: 89 },
];

const SEVERITY_WORDS: { words: string[]; weight: number }[] = [
  { words: ['critical', 'severe', 'life threatening', 'trapped', 'injured', 'collapse', 'roof', 'drowning'], weight: 30 },
  { words: ['high', 'danger', 'urgent', 'flooding', 'rising', 'immediate', 'evacuat'], weight: 20 },
  { words: ['water', 'blocked', 'affected', 'stuck', 'damage'], weight: 10 },
];

const URGENCY_WORDS: { words: string[]; weight: number }[] = [
  { words: ['now', 'immediately', 'minutes', 'tonight', 'trapped', 'rising'], weight: 25 },
  { words: ['today', 'few hours', 'soon', 'evacuat', 'warning'], weight: 15 },
];

export const aiService = {
  /**
   * Run simulated analysis on a problem report.
   * Returns a promise so the UI can show a realistic "analyzing" state.
   */
  analyze(description: string, categoryHint?: ProblemCategory): Promise<AIAnalysis> {
    return new Promise((resolve) => {
      const start = Date.now();
      const delay = 900 + Math.random() * 1200;

      setTimeout(() => {
        const text = description.toLowerCase();

        // Category detection
        let category: ProblemCategory = categoryHint || 'other';
        let bestScore = 0;
        for (const c of KEYWORD_SCORES) {
          const hits = c.keywords.filter((k) => text.includes(k)).length;
          const score = hits > 0 ? c.base + hits * 2 : 0;
          if (score > bestScore) {
            bestScore = score;
            category = c.category;
          }
        }
        if (bestScore === 0 && categoryHint) category = categoryHint;

        // Severity scoring
        let severityPoints = 40;
        for (const s of SEVERITY_WORDS) {
          if (s.words.some((w) => text.includes(w))) severityPoints += s.weight;
        }

        let urgencyPoints = 40;
        for (const u of URGENCY_WORDS) {
          if (u.words.some((w) => text.includes(w))) urgencyPoints += u.weight;
        }

        const severity = (severityPoints >= 75 ? 'critical' : severityPoints >= 60 ? 'high' : severityPoints >= 45 ? 'medium' : 'low') as AIAnalysis['severity'];
        const urgency = (urgencyPoints >= 70 ? 'immediate' : urgencyPoints >= 55 ? 'urgent' : urgencyPoints >= 40 ? 'high' : 'normal') as AIAnalysis['urgency'];

        const priorityScore = Math.min(
          99,
          Math.round(
            (severityPoints * 0.6 + urgencyPoints * 0.4) + Math.random() * 5
          )
        );
        const confidence = Math.min(99.5, Math.round((88 + Math.random() * 8) * 10) / 10);

        const recommendedExpertise = buildExpertise(category);

        resolve({
          category,
          severity,
          urgency,
          priorityScore,
          confidence,
          duplicateDetected: Math.random() < 0.15,
          recommendedExpertise,
          potentialImpact: {
            affectedPopulation: Math.round((500 + Math.random() * 15000) / 50) * 50,
            estimatedDamage: `₹${(0.5 + Math.random() * 12).toFixed(1)} Cr (est.)`,
            riskFactors: [
              'Monsoon intensity elevated',
              'Low-lying population vulnerable',
              'Emergency route congestion',
              'Utility infrastructure at risk',
            ],
          },
          analysisTimestamp: new Date(Date.now() - (Date.now() - start)),
          modelVersion: 'RahatSetu-AI v4.2 (Hydro-Net + Civic-BERT)',
        });
      }, delay);
    });
  },
};

function buildExpertise(category: ProblemCategory): string[] {
  const map: Record<ProblemCategory, string[]> = {
    urban_flooding: ['GIS & Hydrological Modelling', 'Flood-Risk Analytics', 'Emergency Communications', 'Civil Engineering'],
    landslide: ['Geotechnical Engineering', 'Early Warning Research', 'Rapid Risk Assessment', 'Slope Stabilization'],
    cyclone: ['Meteorology', 'Structural Engineering', 'Emergency Operations', 'Coastal Modelling'],
    earthquake: ['Structural Engineering', 'Search & Rescue Ops', 'Damage Assessment', 'Crisis Coordination'],
    fire: ['Chemical Engineering', 'Fire Dynamics', 'Emergency Operations', 'HVAC Systems'],
    infrastructure_collapse: ['Structural Resilience', 'Civil Engineering', 'Rapid Damage Assessment', 'Geotechnical'],
    communication_blackout: ['RF Engineering', 'Satellite Communications', 'Mesh Networks', 'Emergency Operations'],
    water_contamination: ['Water Chemistry', 'Field Sampling', 'Public Health', 'Filtration Systems'],
    epidemic: ['Epidemiology', 'Telemedicine', 'Data Science', 'Public Health Systems'],
    other: ['Multi-Disciplinary Response', 'Emergency Operations', 'Data Science', 'Logistics'],
  };
  return map[category];
}