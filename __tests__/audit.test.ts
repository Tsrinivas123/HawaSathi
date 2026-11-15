import { describe, it, expect, beforeEach } from 'vitest';
import { parseAndNormalizeData, estimateAqi } from '../lib/normalizer';
import { generateDeterministicIntelligence } from '../lib/gemini/fallbackGenerator';
import { BHOPAL_MESSY_SAMPLE_CSV } from '../lib/sampleData';
import { buildRecordLookupMap, getAqiCategory, sanitizeExportText } from '../lib/utils';
import {
  getStoredBriefings,
  saveBriefingToHistory,
  clearBriefingHistory,
  getStoredActions,
  saveStoredActions,
  getStoredStakeholder,
  saveStoredStakeholder,
  getStoredLanguage,
  saveStoredLanguage,
  getStoredReadingLevel,
  saveStoredReadingLevel,
} from '../lib/storage';

describe('Comprehensive PromptWars 10-Requirement Audit Suite', () => {
  beforeEach(() => {
    clearBriefingHistory();
  });

  it('Requirement 1 & 2: CSV upload and pasted messy data with unit conversions and timestamps', () => {
    // Dataset with brackets in headers, mixed units (ppm, mg/m3), mixed timestamps (AM/PM and ISO)
    const messyTelemetry = `Site Area,Municipal Ward,Observed Time,PM2.5 [mg/m3],Coarse Particulate,CO [ppm],Air Quality Index
Vijay Nagar Sector A,Ward 12,15/11/2026 08:30 AM,0.18 mg/m3,280,4.2 ppm,225
Palasia Commercial Hub,Ward 15,2026-11-15 09:15,160 ug/m3,240,N/A,210
Bypass Green Belt,Ward 03,15-11-2026 09:45 PM,25.0,45,0.9,45`;

    const { records, qualityReport } = parseAndNormalizeData(messyTelemetry);

    expect(records.length).toBe(3);
    expect(qualityReport.totalRecords).toBe(3);
    expect(qualityReport.validRecords).toBe(3);

    // Verify 0.18 mg/m3 -> 180 ug/m3
    expect(records[0].pm25).toBe(180);
    // Verify 4.2 ppm * 1.145 -> 4.81 mg/m3
    expect(records[0].co).toBeCloseTo(4.81, 1);
    // Verify 12h AM timestamp -> 2026-11-15 08:30
    expect(records[0].timestamp).toBe('2026-11-15 08:30');
    // Verify 12h PM timestamp -> 2026-11-15 21:45
    expect(records[2].timestamp).toBe('2026-11-15 21:45');
    // Verify column alias mapping
    expect(records[0].location).toBe('Vijay Nagar Sector A');
    expect(records[0].ward).toBe('Ward 12');
  });

  it('Requirement 3: Missing, suspicious, and unreliable reading detection with outlier exclusion', () => {
    const anomalousTelemetry = `Location,Ward,Timestamp,PM2.5,PM10,AQI
Station Alpha,Ward 01,2026-11-15 08:00,120,180,175
Station Outlier,Ward 02,2026-11-15 08:00,999.0,300,300
Station Fault,Ward 03,2026-11-15 08:00,-99.0,150,150
Station Alpha,Ward 01,2026-11-15 08:00,120,180,175
Station Missing,Ward 04,2026-11-15 08:00,--,N/A,NA`;

    const { records, qualityReport } = parseAndNormalizeData(anomalousTelemetry);

    expect(qualityReport.suspiciousObservations).toBeGreaterThanOrEqual(1);
    expect(qualityReport.duplicateRecords).toBe(1);
    expect(qualityReport.missingReadings).toBe(1);

    // Negative reading flagged
    const negRec = records.find(r => r.location === 'Station Fault');
    expect(negRec?.pm25).toBeNull();
    expect(negRec?.flags.some(f => f.includes('negative'))).toBe(true);

    // 999.0 stuck sensor flagged as suspicious
    const outlierRec = records.find(r => r.location === 'Station Outlier');
    expect(outlierRec?.status).toBe('suspicious');

    // Duplicate row flagged as suspicious
    const dupRec = records[3];
    expect(dupRec.flags.some(f => f.includes('Duplicate'))).toBe(true);
    expect(dupRec.status).toBe('suspicious');

    // Valid records exclude suspicious rows from calculations
    const validOnly = records.filter(r => r.status === 'valid' && r.aqi !== null);
    expect(validOnly.map(r => r.id)).not.toContain(outlierRec?.id);
    expect(validOnly.map(r => r.id)).not.toContain(dupRec.id);
  });

  it('Requirement 4 & 5: Hotspot and trend detection with exact source record IDs', () => {
    const customCsv = `Location,Ward,Timestamp,PM2.5,PM10,AQI
Industrial Cluster A,Ward 10,2026-11-15 08:00,185,290,240
Transit Junction B,Ward 14,2026-11-15 08:00,165,250,215
Suburban Canopy C,Ward 02,2026-11-15 08:00,35,55,50`;

    const { records, qualityReport } = parseAndNormalizeData(customCsv);
    const validRecords = records.filter(r => r.status === 'valid' && r.aqi !== null);
    const avgAqi = Math.round(validRecords.reduce((acc, r) => acc + (r.aqi || 0), 0) / validRecords.length);
    const intel = generateDeterministicIntelligence(records, qualityReport, avgAqi, 'Poor');

    expect(intel.hotspots.length).toBeGreaterThanOrEqual(2);

    // Verify 100% traceability to valid dataset records
    const recordIds = new Set(records.map(r => r.id));
    intel.hotspots.forEach(h => {
      expect(h.supportingRecordIds.length).toBeGreaterThan(0);
      h.supportingRecordIds.forEach(id => {
        expect(recordIds.has(id)).toBe(true);
      });
      // Hotspots must be from the custom dataset, NOT hardcoded Bhopal names
      expect(['Industrial Cluster A', 'Transit Junction B']).toContain(h.location);
    });

    // Trends must be derived from custom dataset
    expect(intel.trends.increasing.some(t => t.includes('Industrial Cluster A'))).toBe(true);
    expect(intel.trends.decreasing.some(t => t.includes('Suburban Canopy C'))).toBe(true);
    expect(intel.trends.spatialVariations).toContain('Industrial Cluster A');
  });

  it('Requirement 6: Stakeholder-specific recommendations targeting actual dataset locations', () => {
    const customCsv = `Location,Ward,Timestamp,PM2.5,PM10,AQI
North Industrial Estate,Ward 11,2026-11-15 08:00,190,300,245
Central Residential Vihar,Ward 05,2026-11-15 08:00,95,145,130
Model School Enclave,Ward 08,2026-11-15 08:00,120,180,165`;

    const { records, qualityReport } = parseAndNormalizeData(customCsv);
    const validRecords = records.filter(r => r.status === 'valid' && r.aqi !== null);
    const avgAqi = Math.round(validRecords.reduce((acc, r) => acc + (r.aqi || 0), 0) / validRecords.length);
    const intel = generateDeterministicIntelligence(records, qualityReport, avgAqi, 'Poor');

    const actions = intel.stakeholderActions;
    const wardActs = actions.filter(a => a.stakeholder === 'ward_officer');
    const housingActs = actions.filter(a => a.stakeholder === 'housing_society');
    const schoolActs = actions.filter(a => a.stakeholder === 'school_admin');

    expect(wardActs.length).toBeGreaterThanOrEqual(3);
    expect(housingActs.length).toBeGreaterThanOrEqual(3);
    expect(schoolActs.length).toBeGreaterThanOrEqual(3);

    // Ward officer high action targets top hotspot
    expect(wardActs[0].targetLocations).toContain('North Industrial Estate');
    expect(wardActs[0].evidenceBasis).toContain('REC-');

    // Housing society targets residential location from dataset
    expect(housingActs[0].targetLocations).toContain('Central Residential Vihar');

    // School admin targets campus/enclave from dataset
    expect(schoolActs[0].targetLocations.some(l => l.includes('School') || l.includes('Estate'))).toBe(true);
  });

  it('Requirement 7 & 8: Internal briefing note, 9 multilingual advisories, and vulnerable cohort precautions', () => {
    const { records, qualityReport } = parseAndNormalizeData(BHOPAL_MESSY_SAMPLE_CSV);
    const intel = generateDeterministicIntelligence(records, qualityReport, 241, 'Very Poor');

    const expectedKeys = [
      'en_citizen', 'en_child', 'en_official',
      'hi_citizen', 'hi_child', 'hi_official',
      'hinglish_citizen', 'hinglish_child', 'hinglish_official',
    ];

    expectedKeys.forEach(k => {
      const adv = intel.advisories[k];
      expect(adv).toBeDefined();
      expect(adv.headline.length).toBeGreaterThan(10);
      expect(adv.summary.length).toBeGreaterThan(20);
      expect(adv.generalGuidance.length).toBeGreaterThan(0);
      expect(adv.dosAndDonts.dos.length).toBeGreaterThan(0);
      expect(adv.dosAndDonts.donts.length).toBeGreaterThan(0);

      // Vulnerable cohort precautions check
      expect(adv.vulnerablePrecautions.length).toBeGreaterThan(0);
      const groups = adv.vulnerablePrecautions.map(vp => vp.group.toLowerCase());
      expect(groups.some(g => g.includes('child') || g.includes('बच्चे') || g.includes('kids'))).toBe(true);
    });

    // Verify sanitized export text generation for Internal Briefing Note
    const adv = intel.advisories['en_official'];
    const briefingText = `OFFICIAL CIVIC AIR QUALITY INTERNAL BRIEFING MEMO
City AQI: ${intel.averageAqi} (${intel.overallAqiCategory})
Headline: ${adv.headline}
Mandatory Protocols:
${adv.generalGuidance.map((g, i) => `[${i + 1}] ${g}`).join('\n')}`;

    const safeText = sanitizeExportText(briefingText);
    expect(safeText).toContain('OFFICIAL CIVIC AIR QUALITY INTERNAL BRIEFING MEMO');
    expect(safeText).not.toMatch(/^[=+@-]/m); // Formula injection neutralized
  });

  it('Requirement 9: Persistent previous briefing storage and genuine historical comparison', () => {
    clearBriefingHistory();
    expect(getStoredBriefings().length).toBe(0);

    // Initial Run (Day 1): High pollution episode
    const day1Csv = `Location,Ward,Timestamp,PM2.5,AQI
North Sector 1,Ward A,2026-11-14 08:00,180,240
North Sector 2,Ward B,2026-11-14 08:00,160,220`;

    const { records: rec1, qualityReport: q1 } = parseAndNormalizeData(day1Csv);
    const intel1 = generateDeterministicIntelligence(rec1, q1, 230, 'Very Poor');

    const day1Briefing = {
      id: 'BRIEF-DAY1',
      timestamp: '2026-11-14 08:00',
      averageAqi: intel1.averageAqi,
      overallAqiCategory: intel1.overallAqiCategory,
      primaryPollutant: intel1.primaryPollutant,
      hotspots: intel1.hotspots,
      activeLocations: rec1.map(r => r.location),
      isAiGenerated: false,
      executiveSummary: intel1.executiveSummary,
    };
    saveBriefingToHistory(day1Briefing);

    const historyAfterRun1 = getStoredBriefings();
    expect(historyAfterRun1.length).toBe(1);

    // Subsequent Run (Day 2): Interventions deployed, air improved
    const day2Csv = `Location,Ward,Timestamp,PM2.5,AQI
North Sector 1,Ward A,2026-11-15 08:00,75,115
South Sector 3,Ward C,2026-11-15 08:00,170,225`;

    const { records: rec2, qualityReport: q2 } = parseAndNormalizeData(day2Csv);
    // Pass previous briefing to intelligence engine
    const intel2 = generateDeterministicIntelligence(
      rec2,
      q2,
      170,
      'Moderate',
      historyAfterRun1[0]
    );

    // Compare with genuine historical briefing
    expect(intel2.comparison.previousDate).toBe('2026-11-14 08:00');
    // Delta: 170 - 230 = -60 AQI points
    expect(intel2.comparison.aqiDelta).toBe(-60);
    expect(intel2.comparison.aqiTrend).toBe('improved');

    // Newly emerged hotspot is South Sector 3 (not present on Day 1)
    expect(intel2.comparison.newHotspots.some(h => h.includes('South Sector 3'))).toBe(true);
    // Resolved hotspot is North Sector 2 (present on Day 1, recovered on Day 2)
    expect(intel2.comparison.resolvedHotspots.some(h => h.includes('North Sector 2'))).toBe(true);
    // Narrative diff mentions genuine delta
    expect(intel2.comparison.narrativeDiff).toContain('-60');
  });

  it('Requirement 10: End-to-end data consistency across lookup maps, preferences, and action status', () => {
    const { records } = parseAndNormalizeData(BHOPAL_MESSY_SAMPLE_CSV);
    const lookupMap = buildRecordLookupMap(records);

    // Fast O(1) trace modal lookup
    records.forEach(r => {
      const found = lookupMap.get(r.id);
      expect(found).toBeDefined();
      expect(found?.location).toBe(r.location);
    });

    // Preferences roundtrip persistence
    saveStoredStakeholder('school_admin');
    expect(getStoredStakeholder()).toBe('school_admin');

    saveStoredLanguage('hi');
    expect(getStoredLanguage()).toBe('hi');

    saveStoredReadingLevel('child');
    expect(getStoredReadingLevel()).toBe('child');

    // Action status persistence
    saveStoredActions([
      {
        id: 'ACT-W1',
        stakeholder: 'ward_officer',
        priority: 'High',
        actionTitle: 'Sprinklers',
        description: 'Test',
        targetLocations: ['Zone 1'],
        evidenceBasis: 'REC-001',
        type: 'confirmed_action',
        status: 'completed',
      },
    ]);

    const restored = getStoredActions();
    expect(restored?.[0].status).toBe('completed');
  });
});
