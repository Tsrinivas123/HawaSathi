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

    // Verify 100% traceability
    intelligence.hotspots.forEach((hotspot) => {
      expect(hotspot.supportingRecordIds.length).toBeGreaterThan(0);
      hotspot.supportingRecordIds.forEach((recId) => {
        expect(recId).toMatch(/^REC-\d+/);
      });
    });
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
    });
  });

  it('should generate localized stakeholder action directives', () => {
    const { records, qualityReport } = parseAndNormalizeData(BHOPAL_MESSY_SAMPLE_CSV);
    const intelligence = generateDeterministicIntelligence(records, qualityReport, 241, 'Very Poor');

    expect(intelligence.stakeholderActions.length).toBeGreaterThan(0);
    const targets = intelligence.stakeholderActions.map((a) => a.stakeholder);
    expect(targets).toContain('ward_officer');
    expect(targets).toContain('housing_society');
    expect(targets).toContain('school_admin');
  });

  it('should provide baseline comparison delta calculation', () => {
    const { records, qualityReport } = parseAndNormalizeData(BHOPAL_MESSY_SAMPLE_CSV);
    const intelligence = generateDeterministicIntelligence(records, qualityReport, 241, 'Very Poor');

    expect(intelligence.comparison).toBeDefined();
    expect(intelligence.comparison.aqiDelta).toBe(30); // 241 - 211
    expect(intelligence.comparison.aqiTrend).toBe('deteriorated');
  });
});
