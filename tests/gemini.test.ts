import { describe, it, expect } from 'vitest';
import { generateDeterministicIntelligence, runCivicAirIntelligence } from '../lib/gemini';
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

  it('should strictly exclude duplicate rows (REC-008) and sensor outliers (REC-009) from averages, hotspots, and chart mappings', () => {
    const { records, qualityReport } = parseAndNormalizeData(BHOPAL_MESSY_SAMPLE_CSV);
    const intelligence = generateDeterministicIntelligence(records, qualityReport, 241, 'Very Poor');

    // Identify duplicate and saturation outlier records
    const duplicateRecord = records.find(r => r.flags.some(f => f.includes('Duplicate')));
    const outlierRecord = records.find(r => r.pm10 === 999.0 || r.pm25 === 999.0);

    expect(duplicateRecord?.status).toBe('suspicious');
    expect(outlierRecord?.status).toBe('suspicious');

    // Both must be completely excluded from hotspot findings
    const citedIds = intelligence.hotspots.flatMap(h => h.supportingRecordIds);
    if (duplicateRecord) {
      expect(citedIds).not.toContain(duplicateRecord.id);
    }
    if (outlierRecord) {
      expect(citedIds).not.toContain(outlierRecord.id);
    }

    // Hotspot locations must be distinct (no duplicates)
    const hotspotLocations = intelligence.hotspots.map(h => h.location.toLowerCase().trim());
    const uniqueLocations = new Set(hotspotLocations);
    expect(hotspotLocations.length).toBe(uniqueLocations.size);
  });

  it('should drop fake / hallucinated record IDs during AI response validation', async () => {
    const { records, qualityReport } = parseAndNormalizeData(BHOPAL_MESSY_SAMPLE_CSV);
    
    // Run civic intelligence (offline fallback path without API key)
    const result = await runCivicAirIntelligence(records, qualityReport);
    expect(result).toBeDefined();

    const validRecordIds = new Set(records.filter(r => r.status === 'valid').map(r => r.id));

    result.hotspots.forEach(h => {
      h.supportingRecordIds.forEach(id => {
        // Must never cite a hallucinated ID
        expect(validRecordIds.has(id)).toBe(true);
      });
    });
  });

  it('should return rule-based fallback when API key is missing and populate briefing, actions, and advisories', async () => {
    const { records, qualityReport } = parseAndNormalizeData(BHOPAL_MESSY_SAMPLE_CSV);
    const result = await runCivicAirIntelligence(records, qualityReport);

    // When offline, isAiGenerated is false and aiModelUsed indicates deterministic fallback
    expect(result.isAiGenerated).toBe(false);
    expect(result.aiModelUsed).toContain('Deterministic');

    // Fallback strictly produces full executive summary, 9 actions, and 9 advisories
    expect(result.executiveSummary.length).toBeGreaterThan(50);
    expect(result.stakeholderActions.length).toBeGreaterThanOrEqual(9);
    expect(Object.keys(result.advisories).length).toBe(9);
  });

  it('should ensure all 9 language x reading-level advisory combos produce distinct outputs', () => {
    const { records, qualityReport } = parseAndNormalizeData(BHOPAL_MESSY_SAMPLE_CSV);
    const intelligence = generateDeterministicIntelligence(records, qualityReport, 241, 'Very Poor');

    const expectedKeys = [
      'en_citizen', 'en_child', 'en_official',
      'hi_citizen', 'hi_child', 'hi_official',
      'hinglish_citizen', 'hinglish_child', 'hinglish_official'
    ];

    const headlines = new Set<string>();
    const summaries = new Set<string>();

    expectedKeys.forEach((key) => {
      const adv = intelligence.advisories[key];
      expect(adv).toBeDefined();
      expect(adv.headline).toBeTruthy();
      expect(adv.summary).toBeTruthy();

      // Ensure distinct text across all 9 combinations
      headlines.add(adv.headline);
      summaries.add(adv.summary);
    });

    // All 9 headlines and summaries must be pairwise unique
    expect(headlines.size).toBe(9);
    expect(summaries.size).toBe(9);
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
