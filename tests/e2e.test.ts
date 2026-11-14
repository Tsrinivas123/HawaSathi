import { describe, it, expect } from 'vitest';
import { parseAndNormalizeData } from '../lib/normalizer';
import { generateDeterministicIntelligence } from '../lib/gemini';
import { BHOPAL_MESSY_SAMPLE_CSV } from '../lib/sampleData';
import { buildRecordLookupMap } from '../lib/utils';

describe('End-to-End Civic Air Data Pipeline', () => {
  it('should execute complete pipeline: Ingestion -> Normalization -> Hotspot Traceability -> Stakeholder Directives', () => {
    // 1. Ingestion & Normalization
    const { records, qualityReport } = parseAndNormalizeData(BHOPAL_MESSY_SAMPLE_CSV);
    expect(records.length).toBeGreaterThan(0);
    expect(qualityReport.totalRecords).toBe(records.length);

    // 2. High-performance O(1) Lookup Indexing
    const recordMap = buildRecordLookupMap(records);
    expect(recordMap.get('REC-001')).toBeDefined();
    expect(recordMap.get('REC-001')?.location).toContain('MP Nagar');

    // 3. AI Reasoning & Hotspot Discovery
    const intelligence = generateDeterministicIntelligence(records, qualityReport, 241, 'Very Poor');
    expect(intelligence.hotspots.length).toBeGreaterThan(0);

    // 4. Verify 100% Traceability to Source Records
    intelligence.hotspots.forEach((hotspot) => {
      expect(hotspot.supportingRecordIds.length).toBeGreaterThan(0);
      const verifiedRecord = recordMap.get(hotspot.supportingRecordIds[0]);
      expect(verifiedRecord).toBeDefined();
    });

    // 5. Verify Multilingual Advisory Coverage
    expect(intelligence.advisories['en_citizen']).toBeDefined();
    expect(intelligence.advisories['hi_citizen']).toBeDefined();
    expect(intelligence.advisories['hinglish_citizen']).toBeDefined();

    // 6. Verify 3 Stakeholder Interventions
    const actions = intelligence.stakeholderActions;
    expect(actions.some((a) => a.stakeholder === 'ward_officer')).toBe(true);
    expect(actions.some((a) => a.stakeholder === 'housing_society')).toBe(true);
    expect(actions.some((a) => a.stakeholder === 'school_admin')).toBe(true);
  });
});
