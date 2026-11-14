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
});
