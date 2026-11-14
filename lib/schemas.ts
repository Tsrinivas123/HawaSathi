/**
 * @file schemas.ts
 * @description Strict Zod runtime validation schemas for Gemini generative AI outputs.
 * SERVER-SIDE ONLY: Keeps zod out of client browser bundles.
 */

import { z } from 'zod';

export const HotspotFindingSchema = z.object({
  location: z.string(),
  ward: z.string(),
  pollutant: z.string(),
  measuredValue: z.number(),
  unit: z.string(),
  timestamp: z.string(),
  supportingRecordIds: z.array(z.string()),
  whyNoteworthy: z.string(),
  confidence: z.enum(['High', 'Medium', 'Low']).default('Medium'),
  category: z.enum(['Observed Fact', 'Possible Explanation', 'Unverified Hypothesis']).default('Observed Fact'),
});

export const StakeholderActionSchema = z.object({
  id: z.string(),
  stakeholder: z.enum(['ward_officer', 'housing_society', 'school_admin']),
  priority: z.enum(['High', 'Medium', 'Low']).default('Medium'),
  actionTitle: z.string(),
  description: z.string(),
  targetLocations: z.array(z.string()),
  evidenceBasis: z.string(),
  type: z.enum(['confirmed_action', 'investigative_hypothesis']).default('confirmed_action'),
  status: z.enum(['pending', 'in_progress', 'completed']).default('pending'),
});

export const SingleAdvisorySchema = z.object({
  language: z.enum(['en', 'hi', 'hinglish']),
  readingLevel: z.enum(['citizen', 'child', 'official']),
  headline: z.string(),
  summary: z.string(),
  generalGuidance: z.array(z.string()),
  vulnerablePrecautions: z.array(
    z.object({
      group: z.string(),
      precaution: z.string(),
    })
  ),
  dosAndDonts: z.object({
    dos: z.array(z.string()),
    donts: z.array(z.string()),
  }),
});

export const GeminiOutputSchema = z.object({
  executiveSummary: z.string(),
  overallAqiCategory: z.enum(['Good', 'Moderate', 'Poor', 'Very Poor', 'Severe', 'Hazardous']).default('Moderate'),
  averageAqi: z.number(),
  primaryPollutant: z.string(),
  dataReliability: z.string(),
  hotspots: z.array(HotspotFindingSchema),
  trends: z.object({
    increasing: z.array(z.string()).default([]),
    decreasing: z.array(z.string()).default([]),
    stable: z.array(z.string()).default([]),
    spatialVariations: z.string().default(''),
    temporalPattern: z.string().default(''),
  }),
  stakeholderActions: z.array(StakeholderActionSchema),
  advisories: z.record(z.string(), SingleAdvisorySchema).optional(),
  comparison: z.object({
    previousDate: z.string().default('2026-11-13'),
    aqiDelta: z.number().default(0),
    aqiTrend: z.enum(['improved', 'deteriorated', 'stable']).default('stable'),
    newHotspots: z.array(z.string()).default([]),
    resolvedHotspots: z.array(z.string()).default([]),
    interventionEffectiveness: z.string().default(''),
    narrativeDiff: z.string().default(''),
  }).optional(),
});

export type GeminiOutput = z.infer<typeof GeminiOutputSchema>;
