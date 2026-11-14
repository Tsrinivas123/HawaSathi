export type StakeholderType = 'ward_officer' | 'housing_society' | 'school_admin';
export type Language = 'en' | 'hi' | 'hinglish';
export type ReadingLevel = 'citizen' | 'child' | 'official';

export interface AirRecord {
  id: string; // e.g., "REC-001"
  rawLocation: string;
  location: string;
  ward: string;
  station: string;
  timestamp: string;
  pm25: number | null;
  pm10: number | null;
  aqi: number | null;
  no2: number | null;
  so2: number | null;
  co: number | null;
  o3: number | null;
  status: 'valid' | 'suspicious' | 'missing_critical';
  flags: string[];
  conversionsApplied: string[];
}

export interface DataQualityReport {
  totalRecords: number;
  validRecords: number;
  missingReadings: number;
  duplicateRecords: number;
  invalidValues: number;
  suspiciousObservations: number;
  detectedUnits: Record<string, string>;
  dataCompletenessPct: number;
  warnings: string[];
}

export interface HotspotFinding {
  location: string;
  ward: string;
  pollutant: string;
  measuredValue: number;
  unit: string;
  timestamp: string;
  supportingRecordIds: string[];
  whyNoteworthy: string;
  confidence: 'High' | 'Medium' | 'Low';
  category: 'Observed Fact' | 'Possible Explanation' | 'Unverified Hypothesis';
}

export interface TrendAnalysis {
  increasing: string[];
  decreasing: string[];
  stable: string[];
  spatialVariations: string;
  temporalPattern: string;
}

export interface StakeholderAction {
  id: string;
  stakeholder: StakeholderType;
  priority: 'High' | 'Medium' | 'Low';
  actionTitle: string;
  description: string;
  targetLocations: string[];
  evidenceBasis: string;
  type: 'confirmed_action' | 'investigative_hypothesis';
  status: 'pending' | 'in_progress' | 'completed';
}

export interface CitizenAdvisory {
  language: Language;
  readingLevel: ReadingLevel;
  headline: string;
  summary: string;
  generalGuidance: string[];
  vulnerablePrecautions: {
    group: string;
    precaution: string;
  }[];
  dosAndDonts: {
    dos: string[];
    donts: string[];
  };
}

export interface BriefingComparison {
  previousDate: string;
  aqiDelta: number;
  aqiTrend: 'improved' | 'deteriorated' | 'stable';
  newHotspots: string[];
  resolvedHotspots: string[];
  interventionEffectiveness: string;
  narrativeDiff: string;
}

export interface AnalysisResult {
  executiveSummary: string;
  overallAqiCategory: 'Good' | 'Moderate' | 'Poor' | 'Very Poor' | 'Severe' | 'Hazardous';
  averageAqi: number;
  primaryPollutant: string;
  hotspots: HotspotFinding[];
  trends: TrendAnalysis;
  dataReliability: string;
  stakeholderActions: StakeholderAction[];
  advisories: Record<string, CitizenAdvisory>;
  comparison: BriefingComparison;
  timestamp: string;
  isAiGenerated: boolean;
}
