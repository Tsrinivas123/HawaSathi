import { describe, it, expect } from 'vitest';
import { generateDeterministicIntelligence } from '../lib/gemini';
import { parseAndNormalizeData } from '../lib/normalizer';
import { BHOPAL_MESSY_SAMPLE_CSV } from '../lib/sampleData';

describe('AI Intelligence & Verification Engine', () => {
  it('should generate verifiable intelligence with 100% traceable record IDs', () => {
    const { records, qualityReport } = parseAndNormalizeData(BHOPAL_MESSY_SAMPLE_CSV);
    const intelligence = generateDeterministicIntelligence(records, qualityReport, 241, 'Very Poor');

    expect(intelligence).toBeDefined();
    expect(intelligence.averageAqi).toBe(241);
    expect(intelligence.overallAqiCategory).toBe('Very Poor');
    expect(intelligence.hotspots.length).toBeGreaterThan(0);

    const recordIdSet = new Set(records.map(r => r.id));

    // Verify 100% traceability to valid dataset records (zero hallucinated IDs)
    intelligence.hotspots.forEach((hotspot) => {
      expect(hotspot.supportingRecordIds.length).toBeGreaterThan(0);
      hotspot.supportingRecordIds.forEach((recId) => {
        expect(recId).toMatch(/^REC-\d+/);
        expect(recordIdSet.has(recId)).toBe(true);
      });
    });
  });

  it('should strictly exclude flagged outliers (e.g. REC-009) from hotspot discoveries', () => {
    const { records, qualityReport } = parseAndNormalizeData(BHOPAL_MESSY_SAMPLE_CSV);
    const intelligence = generateDeterministicIntelligence(records, qualityReport, 241, 'Very Poor');

    const outlierRecord = records.find(r => r.pm10 === 999.0);
    expect(outlierRecord?.status).toBe('suspicious');

    // Outlier must not be included as a valid hotspot finding
    const citedIds = intelligence.hotspots.flatMap(h => h.supportingRecordIds);
    if (outlierRecord) {
      expect(citedIds).not.toContain(outlierRecord.id);
    }
  });

  it('should populate all 9 citizen advisory combinations (3 languages x 3 reading levels)', () => {
    const { records, qualityReport } = parseAndNormalizeData(BHOPAL_MESSY_SAMPLE_CSV);
    const intelligence = generateDeterministicIntelligence(records, qualityReport, 241, 'Very Poor');

    const expectedKeys = [
      'en_citizen', 'en_child', 'en_official',
      'hi_citizen', 'hi_child', 'hi_official',
      'hinglish_citizen', 'hinglish_child', 'hinglish_official'
    ];

    expectedKeys.forEach((key) => {
      expect(intelligence.advisories[key]).toBeDefined();
      expect(intelligence.advisories[key].headline).toBeTruthy();
      expect(intelligence.advisories[key].summary).toBeTruthy();
      expect(intelligence.advisories[key].vulnerablePrecautions.length).toBeGreaterThan(0);
      expect(intelligence.advisories[key].dosAndDonts.dos.length).toBeGreaterThan(0);
      expect(intelligence.advisories[key].dosAndDonts.donts.length).toBeGreaterThan(0);
    });
  });

  it('should generate at least 3 prioritized actions per persona (High, Medium, Low for Ward, Housing, School)', () => {
    const { records, qualityReport } = parseAndNormalizeData(BHOPAL_MESSY_SAMPLE_CSV);
    const intelligence = generateDeterministicIntelligence(records, qualityReport, 241, 'Very Poor');

    expect(intelligence.stakeholderActions.length).toBeGreaterThanOrEqual(9);

    const wardActions = intelligence.stakeholderActions.filter(a => a.stakeholder === 'ward_officer');
    const housingActions = intelligence.stakeholderActions.filter(a => a.stakeholder === 'housing_society');
    const schoolActions = intelligence.stakeholderActions.filter(a => a.stakeholder === 'school_admin');

    expect(wardActions.length).toBeGreaterThanOrEqual(3);
    expect(housingActions.length).toBeGreaterThanOrEqual(3);
    expect(schoolActions.length).toBeGreaterThanOrEqual(3);

    expect(wardActions.some(a => a.priority === 'High')).toBe(true);
    expect(housingActions.some(a => a.priority === 'High')).toBe(true);
    expect(schoolActions.some(a => a.priority === 'High')).toBe(true);
  });

  it('should provide baseline comparison delta calculation', () => {
    const { records, qualityReport } = parseAndNormalizeData(BHOPAL_MESSY_SAMPLE_CSV);
    const intelligence = generateDeterministicIntelligence(records, qualityReport, 241, 'Very Poor');

    expect(intelligence.comparison).toBeDefined();
    expect(intelligence.comparison.aqiDelta).toBe(30); // 241 - 211
    expect(intelligence.comparison.aqiTrend).toBe('deteriorated');
  });
});
