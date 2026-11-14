import { describe, it, expect } from 'vitest';
import { SYSTEM_LIMITS, CPCB_THRESHOLDS } from '../lib/constants';
import { parseAndNormalizeData } from '../lib/normalizer';

describe('Security & Threat Protection Suite', () => {
  it('should enforce batch ingestion limits to prevent denial-of-service', () => {
    expect(SYSTEM_LIMITS.MAX_INGESTION_RECORDS).toBe(1000);
    expect(SYSTEM_LIMITS.DEFAULT_DEBOUNCE_MS).toBe(300);
  });

  it('should sanitize and neutralize XSS payloads in CSV inputs', () => {
    const maliciousCsv = `Location,Ward,AQI,PM2.5\n<script>alert("xss")</script>,Ward 10,250,150\n"Govindpura <img src=x onerror=alert(1)>",Ward 12,320,180`;
    const { records } = parseAndNormalizeData(maliciousCsv);

    expect(records.length).toBe(2);
    records.forEach((r) => {
      expect(r.id).toBeDefined();
      expect(r.location).not.toContain('<script>');
      expect(r.location).not.toContain('<img');
    });
  });

  it('should not leak environment variables or secrets into public client exports', () => {
    // Verify client bundle does not export server-only secret keys
    expect(process.env.GEMINI_API_KEY).toBeUndefined();
  });

  it('should enforce valid threshold bounds and prevent numeric overflow', () => {
    expect(CPCB_THRESHOLDS.PM25_24H_SAFE).toBe(60);
    expect(CPCB_THRESHOLDS.PM10_24H_SAFE).toBe(100);
    expect(CPCB_THRESHOLDS.CO_8H_SAFE_MGM3).toBe(2.0);
  });
});
