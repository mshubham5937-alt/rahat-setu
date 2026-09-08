/**
 * Core TypeScript types for RahatSetu application
 * Based on SIH 2026 Problem Statement 26043
 */

export type Role = 'citizen' | 'university' | 'industry' | 'government';

export type ProblemCategory =
  | 'urban_flooding'
  | 'landslide'
  | 'cyclone'
  | 'earthquake'
  | 'fire'
  | 'infrastructure_collapse'
  | 'communication_blackout'
  | 'water_contamination'
  | 'epidemic'
  | 'other';

export type Severity = 'critical' | 'high' | 'medium' | 'low';

export type Urgency = 'immediate' | 'urgent' | 'high' | 'normal' | 'low';

export type ProblemStatus =
  | 'reported'
  | 'ai_analyzed'
  | 'verified'
  | 'matched'
  | 'collaborating'
  | 'prototype'
  | 'pilot'
  | 'deployed'
  | 'impact_measured'
  | 'resolved'
  | 'closed';

export type LifecycleStage =
  | 1  // Reported
  | 2  // AI Analyzed
  | 3  // Verified
  | 4  // Matched
  | 5  // Collaborating
  | 6  // Prototype
  | 7  // Pilot
  | 8  // Deployed
  | 9; // Impact Measured

export interface Location {
  latitude: number;
  longitude: number;
  address?: string;
  city?: string;
  state?: string;
  zone?: string;
  landmark?: string;
}

export interface Evidence {
  id: string;
  type: 'photo' | 'video' | 'voice' | 'document';
  url: string;
  thumbnailUrl?: string;
  caption?: string;
  timestamp: Date;
  metadata?: Record<string, unknown>;
}

export interface AIAnalysis {
  category: ProblemCategory;
  severity: Severity;
  urgency: Urgency;
  priorityScore: number; // 0-100
  confidence: number; // 0-100
  duplicateDetected: boolean;
  duplicateOf?: string; // Problem ID
  duplicateConfidence?: number;
  recommendedExpertise: string[];
  potentialImpact: {
    affectedPopulation: number;
    estimatedDamage: string;
    riskFactors: string[];
  };
  analysisTimestamp: Date;
  modelVersion: string;
}

export interface GovernmentVerification {
  verified: boolean;
  verifiedBy?: string;
  verifiedAt?: Date;
  verificationNotes?: string;
  assignedAgency?: string;
  assignedOfficer?: string;
}

export interface UniversityMatch {
  universityId: string;
  universityName: string;
  matchScore: number;
  rationale: MatchRationale[];
  facultyLead?: string;
  studentCount?: number;
  labCapabilities: string[];
  status: 'suggested' | 'contacted' | 'accepted' | 'declined' | 'active';
  contactedAt?: Date;
  acceptedAt?: Date;
}

export interface IndustryMatch {
  industryId: string;
  industryName: string;
  matchScore: number;
  rationale: MatchRationale[];
  contributionType: 'cloud' | 'expertise' | 'funding' | 'logistics' | 'multiple';
  contributions: Contribution[];
  status: 'suggested' | 'contacted' | 'committed' | 'delivered' | 'declined';
  contactedAt?: Date;
  committedAt?: Date;
}

export interface MatchRationale {
  factor: string;
  score: number; // 0-100
  description: string;
  weight: number;
}

export interface Contribution {
  type: string;
  description: string;
  quantity?: number;
  unit?: string;
  estimatedValue?: number;
  status: 'pledged' | 'delivered' | 'deployed';
}

export interface Problem {
  id: string;
  title: string;
  description: string;
  category: ProblemCategory;
  location: Location;
  severity: Severity;
  urgency: Urgency;
  priorityScore: number;
  affectedPopulation: number;
  evidence: Evidence[];
  reportedBy: string; // User ID
  reportedAt: Date;
  status: ProblemStatus;
  currentStage: LifecycleStage;
  aiAnalysis?: AIAnalysis;
  duplicateOf?: string;
  governmentVerification?: GovernmentVerification;
  universityMatches: UniversityMatch[];
  industryMatches: IndustryMatch[];
  requiredExpertise: string[];
  projectId?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface TeamMember {
  id: string;
  name: string;
  role: 'faculty_mentor' | 'ai_ml_lead' | 'tech_lead' | 'gis_lead' | 'field_ops_lead' | 'project_manager' | 'student_engineer' | 'domain_expert';
  department?: string;
  skills: string[];
  email?: string;
  phone?: string;
  avatar?: string;
}

export interface Project {
  id: string;
  problemId: string;
  title: string;
  description: string;
  status: 'forming' | 'active' | 'on_hold' | 'completed' | 'archived';
  currentStage: LifecycleStage;
  universityId?: string;
  universityName?: string;
  industryIds: string[];
  industryNames: string[];
  governmentContact?: string;
  citizenReporter?: string;
  team: TeamMember[];
  milestones: Milestone[];
  createdAt: Date;
  updatedAt: Date;
  startedAt?: Date;
  completedAt?: Date;
}

export interface Milestone {
  id: string;
  projectId: string;
  title: string;
  description: string;
  stage: LifecycleStage;
  status: 'pending' | 'in_progress' | 'completed' | 'blocked';
  dueDate?: Date;
  completedAt?: Date;
  deliverables: string[];
  assignees: string[]; // Team member IDs
}

export interface Notification {
  id: string;
  type: 'problem_analyzed' | 'problem_verified' | 'university_matched' | 'industry_joined' | 'team_created' | 'milestone_completed' | 'deployment_started' | 'pilot_completed' | 'impact_updated' | 'system';
  title: string;
  message: string;
  read: boolean;
  createdAt: Date;
  actionUrl?: string;
  actionLabel?: string;
  relatedEntityId?: string;
  relatedEntityType?: 'problem' | 'project' | 'match' | 'milestone';
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  organization?: string;
  avatar?: string;
  phone?: string;
  preferences: UserPreferences;
  createdAt: Date;
  lastActiveAt: Date;
}

export interface UserPreferences {
  notifications: boolean;
  emailUpdates: boolean;
  smsAlerts: boolean;
  offlineMode: boolean;
  language: 'en' | 'hi' | 'gu';
}

export interface DemoScenario {
  id: string;
  name: string;
  description: string;
  problemData: Partial<Problem>;
  universityMatches: Partial<UniversityMatch>[];
  industryMatches: Partial<IndustryMatch>[];
  projectData?: Partial<Project>;
}

export interface OfflineQueueItem {
  id: string;
  type: 'report_submission' | 'evidence_upload' | 'status_update' | 'comment';
  data: unknown;
  createdAt: Date;
  retries: number;
  status: 'pending' | 'syncing' | 'synced' | 'failed';
}