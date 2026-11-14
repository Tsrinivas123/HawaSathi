import { describe, it, expect } from 'vitest';
import { parseAndNormalizeData } from '../lib/normalizer';
import { BHOPAL_MESSY_SAMPLE_CSV } from '../lib/sampleData';

describe('Data Normalization & Cleaning Engine', () => {
  it('should parse messy Bhopal CSV telemetry and extract records with unique IDs', () => {
    const { records, qualityReport } = parseAndNormalizeData(BHOPAL_MESSY_SAMPLE_CSV);
    
    expect(records.length).toBeGreaterThan(0);
    expect(qualityReport.totalRecords).toBeGreaterThan(0);
    expect(records[0].id).toBe('REC-001');
  });

  it('should detect and flag sensor saturation outliers (e.g., PM10 = 999.0 ug/m3 in Govindpura)', () => {
    const { records, qualityReport } = parseAndNormalizeData(BHOPAL_MESSY_SAMPLE_CSV);
    
    const outlierRecord = records.find(r => r.pm10 === 999.0);
    expect(outlierRecord).toBeDefined();
    expect(outlierRecord?.status).toBe('suspicious');
    expect(qualityReport.suspiciousObservations).toBeGreaterThan(0);
  });

  it('should convert units correctly (e.g. CO in ppm to mg/m3)', () => {
    const csvWithPpm = `Location,Ward,Sensor_Id,Date / Time,Overall_AQI,CO [ppm]\nTest Ward,Ward 01,TST-01,2026-11-14 08:00,120,4.5 ppm`;
    const { records } = parseAndNormalizeData(csvWithPpm);
    
    expect(records[0]).toBeDefined();
    // 4.5 ppm * 1.145 = 5.15 mg/m3
    expect(records[0].co).toBeCloseTo(5.15, 1);
  });

  it('should calculate data completeness accurately and detect units', () => {
    const { qualityReport } = parseAndNormalizeData(BHOPAL_MESSY_SAMPLE_CSV);
    
    expect(qualityReport.dataCompletenessPct).toBeGreaterThan(50);
    expect(qualityReport.dataCompletenessPct).toBeLessThanOrEqual(100);
    expect(qualityReport.detectedUnits['aqi']).toBe('Index (0-500)');
  });

  it('should handle text in numeric fields gracefully without crashing', () => {
    const messyNumericCsv = `Site Area,Ward,AQI,PM2.5,PM10\nZone A,Ward 10,Offline,Faulty Sensor,N/A\nZone B,Ward 11,180,95.5,140`;
    const { records, qualityReport } = parseAndNormalizeData(messyNumericCsv);

    expect(records.length).toBe(2);
    expect(records[0].aqi).toBeNull();
    expect(records[0].pm25).toBeNull();
    expect(records[1].aqi).toBe(180);
    expect(records[1].pm25).toBe(95.5);
    expect(qualityReport.missingReadings).toBeGreaterThan(0);
  });

  it('should flag duplicate records with identical location and timestamp', () => {
    const duplicateCsv = `Location,Ward,Date / Time,AQI\nStation 1,Ward 01,2026-11-14 08:00,150\nStation 1,Ward 01,2026-11-14 08:00,150`;
    const { records, qualityReport } = parseAndNormalizeData(duplicateCsv);

    expect(records.length).toBe(2);
    expect(qualityReport.duplicateRecords).toBe(1);
    expect(records[1].flags.some(f => f.includes('Duplicate'))).toBe(true);
  });

  it('should normalize heterogeneous column header variants', () => {
    const aliasCsv = `Site Location,Municipal Ward,Observed Time,Particulate 2.5,Index Score\nBhopal North,Ward 33,2026-11-14 07:30,110.2,210`;
    const { records } = parseAndNormalizeData(aliasCsv);

    expect(records.length).toBe(1);
    expect(records[0].location).toContain('Bhopal North');
    expect(records[0].ward).toContain('Ward 33');
    expect(records[0].pm25).toBe(110.2);
    expect(records[0].aqi).toBe(210);
  });
});
