/**
 * @file lruCache.ts
 * @description In-memory LRU response cache with deterministic SHA-256 compact hashing and TTL eviction.
 * SERVER-SIDE ONLY: Uses Node.js crypto module for high-throughput cryptographic hashing.
 */

import crypto from 'crypto';
import { CACHE_CONSTANTS } from '@/lib/constants';
import { AirRecord, AnalysisResult } from '@/lib/types';

interface CacheEntry {
  result: AnalysisResult;
  timestamp: number;
}

const responseCache = new Map<string, CacheEntry>();

/**
 * Generates a deterministic SHA-256 cache key from a compact canonical telemetry digest.
 * Hashes an optimized fingerprint of IDs, statuses, and key numeric readings rather than full raw payloads.
 * @param records Normalized AirRecord collection
 * @returns Cryptographic cache key string
 */
export function generateDataHashKey(records: readonly AirRecord[]): string {
  // Build a compact canonical string representation
  const compactFingerprint = records
    .map((r) => `${r.id}:${r.status}:${r.aqi ?? ''}:${r.pm25 ?? ''}`)
    .join(';');

  const hash = crypto
    .createHash(CACHE_CONSTANTS.HASH_ALGORITHM)
    .update(compactFingerprint)
    .digest('hex');

  return `${CACHE_CONSTANTS.CACHE_KEY_PREFIX}_${records.length}_${hash.slice(0, 32)}`;
}

/**
 * Retrieves a valid, non-expired cached analysis result and refreshes its LRU order.
 * @param key Cache key string
 * @returns Cached AnalysisResult or null if missed/expired
 */
export function getCachedAnalysis(key: string): AnalysisResult | null {
  const entry = responseCache.get(key);
  if (!entry) return null;

  const now = Date.now();
  if (now - entry.timestamp > CACHE_TTL_MS_VALUE) {
    responseCache.delete(key);
    return null;
  }

  // Refresh position to Mark as Most Recently Used (MRU)
  responseCache.delete(key);
  responseCache.set(key, entry);
  return entry.result;
}

const CACHE_TTL_MS_VALUE = CACHE_CONSTANTS.CACHE_TTL_MS;

/**
 * Stores an analysis result in the LRU cache, evicting the oldest entry when capacity is reached.
 * @param key Cache key string
 * @param result AnalysisResult payload
 */
export function setCachedAnalysis(key: string, result: AnalysisResult): void {
  if (responseCache.size >= CACHE_CONSTANTS.MAX_CACHE_ENTRIES) {
    const oldestKey = responseCache.keys().next().value;
    if (oldestKey) responseCache.delete(oldestKey);
  }
  responseCache.set(key, { result, timestamp: Date.now() });
}
