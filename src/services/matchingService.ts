import type { UniversityMatch, IndustryMatch } from '../types';

export type MatchableProblem = {
  category: string;
  priorityScore?: number;
  location?: { city?: string };
};

/**
 * Simulated matching engine. Scores potential universities and industry
 * partners against a problem's requirements using weighted criteria.
 */

export interface UniversityCandidate {
  universityId: string;
  universityName: string;
  city: string;
  facultyExcellence: number;
  relevantLabs: string[];
  studentCapacity: number;
  trackRecord: number;
  proximityKm?: number;
  distanceScore: number;
}

export interface IndustryCandidate {
  industryId: string;
  industryName: string;
  sector: string;
  expertiseScore: number;
  speedScore: number;
  csrAlignment: number;
  pastCollaborations: number;
  itemType: 'cloud' | 'expertise' | 'funding' | 'logistics' | 'multiple';
}

export const UNIVERSITY_CATALOG: UniversityCandidate[] = [
  {
    universityId: 'univ-iitg', universityName: 'IIT Gandhinagar', city: 'Gandhinagar',
    facultyExcellence: 98, relevantLabs: ['HydroSense', 'Hydrology Modelling Group'], 
    studentCapacity: 88, trackRecord: 96, proximityKm: 12, distanceScore: 95,
  },
  {
    universityId: 'univ-iitb', universityName: 'IIT Bhubaneswar', city: 'Bhubaneswar',
    facultyExcellence: 95, relevantLabs: ['Ocean Engineering', 'Coastal Risk Group'], 
    studentCapacity: 82, trackRecord: 94, distanceScore: 72,
  },
  {
    universityId: 'univ-iitd', universityName: 'IIT Delhi', city: 'New Delhi',
    facultyExcellence: 96, relevantLabs: ['Structural Resilience', 'AI for Disaster Mitigation'], 
    studentCapacity: 90, trackRecord: 93, distanceScore: 78,
  },
  {
    universityId: 'univ-ahd-univ', universityName: 'Gujarat University', city: 'Ahmedabad',
    facultyExcellence: 82, relevantLabs: ['Geo-Informatics', 'Urban Planning'], 
    studentCapacity: 95, trackRecord: 74, proximityKm: 3, distanceScore: 98,
  },
  {
    universityId: 'univ-iitm', universityName: 'IIT Madras', city: 'Chennai',
    facultyExcellence: 97, relevantLabs: ['Coastal Engineering', 'Disaster Analytics'], 
    studentCapacity: 85, trackRecord: 97, distanceScore: 60,
  },
  {
    universityId: 'univ-nit-surat', universityName: 'SVNIT Surat', city: 'Surat',
    facultyExcellence: 84, relevantLabs: ['Disaster Engineering', 'Hydraulics'], 
    studentCapacity: 86, trackRecord: 80, proximityKm: 220, distanceScore: 88,
  },
];

export const INDUSTRY_CATALOG: IndustryCandidate[] = [
  {
    industryId: 'ind-tata-comm', industryName: 'Tata Communications', sector: 'Telecom & Networks',
    expertiseScore: 95, speedScore: 85, csrAlignment: 88, pastCollaborations: 85,
    itemType: 'multiple',
  },
  {
    industryId: 'ind-aws', industryName: 'AWS India', sector: 'Cloud & AI',
    expertiseScore: 95, speedScore: 90, csrAlignment: 85, pastCollaborations: 80,
    itemType: 'cloud',
  },
  {
    industryId: 'ind-larsen', industryName: 'L&T Construction', sector: 'Civil Infrastructure',
    expertiseScore: 88, speedScore: 82, csrAlignment: 92, pastCollaborations: 88,
    itemType: 'logistics',
  },
  {
    industryId: 'ind-tata-pw', industryName: 'Tata Power', sector: 'Grid & Energy',
    expertiseScore: 84, speedScore: 80, csrAlignment: 90, pastCollaborations: 82,
    itemType: 'funding',
  },
  {
    industryId: 'ind-gps', industryName: 'Gujarat Pipavav Port', sector: 'Port & Logistics',
    expertiseScore: 75, speedScore: 88, csrAlignment: 86, pastCollaborations: 70,
    itemType: 'logistics',
  },
];

export const matchingService = {
  scoreUniversities(problem: MatchableProblem, limit = 4): UniversityMatch[] {
    return UNIVERSITY_CATALOG.map((u) => {
      const hasGeoCapability =
        u.relevantLabs.some((l) => /hydro|geo|coastal|flood|disaster/i.test(l)) &&
        /hydro|flood|coastal/i.test(u.relevantLabs.join(' '));
      const categoryBoost =
        problem.category === 'urban_flooding' && hasGeoCapability ? 4 : 0;

      const weights: { factor: string; score: number; description: string; weight: number }[] = [
        { factor: 'Faculty Expertise', score: u.facultyExcellence, description: 'Domain research strength match', weight: 0.35 },
        { factor: 'Proximity', score: u.distanceScore, description: u.proximityKm ? `${u.proximityKm} km from impact zone` : 'Same-state availability', weight: 0.25 },
        { factor: 'Student Capacity', score: u.studentCapacity, description: 'Engineers deployable in 48h', weight: 0.2 },
        { factor: 'Track Record', score: u.trackRecord, description: 'Past disaster deployments', weight: 0.2 },
      ];

      const total =
        weights.reduce((sum, w) => sum + w.score * w.weight, 0) + categoryBoost;
      const matchScore = Math.min(99, Math.round(total));

      return {
        universityId: u.universityId,
        universityName: u.universityName,
        matchScore,
        rationale: weights,
        labCapabilities: u.relevantLabs,
        studentCount: Math.round(u.studentCapacity / 10),
        status: 'suggested',
      } as UniversityMatch;
    })
      .sort((a, b) => b.matchScore - a.matchScore)
      .slice(0, limit);
  },

  scoreIndustries(problem: MatchableProblem, limit = 4): IndustryMatch[] {
    return INDUSTRY_CATALOG.map((i) => {
      const categoryEmergency =
        problem.category === 'urban_flooding' || problem.category === 'landslide' ? 4 : 0;

      const weights: { factor: string; score: number; description: string; weight: number }[] = [
        { factor: 'Domain Expertise', score: i.expertiseScore, description: 'Sector specialists available', weight: 0.35 },
        { factor: 'Mobilization Speed', score: i.speedScore, description: 'Days to deployment', weight: 0.25 },
        { factor: 'CSR Alignment', score: i.csrAlignment, description: 'Schedule VII eligible expenditure', weight: 0.2 },
        { factor: 'Past Collaboration', score: i.pastCollaborations, description: 'Previous gov/HEI joint deployments', weight: 0.2 },
      ];

      const total =
        weights.reduce((sum, w) => sum + w.score * w.weight, 0) + categoryEmergency;
      const matchScore = Math.min(99, Math.round(total));

      const contributionType: IndustryMatch['contributionType'] = i.itemType;

      const contributionLabels: Record<IndustryMatch['contributionType'], string> = {
        cloud: 'Cloud Credits',
        expertise: 'Expert Volunteers',
        funding: 'CSR Grant Funding',
        logistics: 'Logistics Support',
        multiple: 'Combined Support',
      };

      return {
        industryId: i.industryId,
        industryName: i.industryName,
        matchScore,
        rationale: weights,
        contributionType,
        contributions: [
          {
            type: contributionLabels[contributionType],
            description: `${i.industryName} contribution package for ${problem.location?.city || 'disaster'} response`,
            status: 'pledged',
          },
        ],
        status: 'suggested',
      } as IndustryMatch;
    })
      .sort((a, b) => b.matchScore - a.matchScore)
      .slice(0, limit);
  },
};