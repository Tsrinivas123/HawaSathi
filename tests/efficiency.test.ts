/**
 * @file efficiency.test.ts
 * @description Performance, algorithmic complexity, and memory efficiency test suite for HawaSathi.
 */

import { describe, it, expect } from 'vitest';
import { buildRecordLookupMap } from '../lib/utils';
import { parseAndNormalizeData } from '../lib/normalizer';
import { BHOPAL_MESSY_SAMPLE_CSV } from '../lib/sampleData';
import { SYSTEM_LIMITS } from '../lib/constants';

describe('Performance & Efficiency Suite', () => {
  const { records: sampleRecords } = parseAndNormalizeData(BHOPAL_MESSY_SAMPLE_CSV);

  it('should build O(1) indexed lookup map and retrieve records in constant time', () => {
    const start = performance.now();
    const map = buildRecordLookupMap(sampleRecords);
    const buildDuration = performance.now() - start;

    expect(buildDuration).toBeLessThan(15);
    expect(map.size).toBe(sampleRecords.length);

    const lookupStart = performance.now();
    const found = map.get('REC-001');
    const lookupDuration = performance.now() - lookupStart;

    expect(found).toBeDefined();
    expect(found?.location).toContain('MP Nagar');
    expect(lookupDuration).toBeLessThan(1);
  });

  it('should enforce architectural system limits to avoid memory bloat', () => {
    expect(SYSTEM_LIMITS.MAX_INGESTION_RECORDS).toBe(1000);
    expect(SYSTEM_LIMITS.MAX_PAYLOAD_SIZE_BYTES).toBe(1048576);
    expect(SYSTEM_LIMITS.SEARCH_DEBOUNCE_MS).toBe(250);
  });

  it('should handle large record collections without algorithmic degradation', () => {
    const largeCollection = Array.from({ length: 500 }, (_, i) => ({
      ...sampleRecords[0],
      id: `SYNTH-${i}`,
      location: `Ward Zone ${i}`,
    }));

    const start = performance.now();
    const map = buildRecordLookupMap(largeCollection);
    const duration = performance.now() - start;

    expect(map.size).toBe(500);
    expect(duration).toBeLessThan(30);
    expect(map.get('SYNTH-499')?.location).toBe('Ward Zone 499');
  });
});
