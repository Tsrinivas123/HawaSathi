/**
 * @file constants.ts
 * @description Centralized constants, thresholds, and limits for HawaSathi.
 * Eliminates magic numbers across normalizer, AI engines, security, cache, and UI.
 */

/**
 * National Ambient Air Quality Standards (NAAQS) and Central Pollution Control Board (CPCB)
 * 24-hour safe limits in micrograms per cubic meter (µg/m³).
 */
export const CPCB_THRESHOLDS = {
  PM25_24H_SAFE: 60,
  PM10_24H_SAFE: 100,
  NO2_24H_SAFE: 80,
  SO2_24H_SAFE: 80,
  CO_8H_SAFE_MGM3: 2.0, // 2 mg/m³
  O3_8H_SAFE_UGM3: 100,
} as const;

/**
 * Air Quality Index (AQI) categorical breakpoints according to Indian CPCB.
 */
export const AQI_BREAKPOINTS = {
  GOOD_MAX: 50,
  MODERATE_MAX: 100,
  POOR_MAX: 200,
  VERY_POOR_MAX: 300,
  SEVERE_MAX: 400,
  HAZARDOUS_MAX: 500,
} as const;

/**
 * Physicochemical unit conversion factors at Normal Temperature and Pressure (NTP: 25°C, 1 atm).
 */
export const UNIT_CONVERSIONS = {
  /** Carbon monoxide: 1 ppm = 1.145 mg/m³ at NTP */
  CO_PPM_TO_MGM3: 1.145,
  /** Milligram to microgram factor */
  MG_TO_UG_MULTIPLIER: 1000,
} as const;

/**
 * Sensor hardware failure and outlier detection thresholds.
 */
export const SENSOR_ANOMALY_CODES = {
  SATURATION_STUCK_1: 999.0,
  SATURATION_STUCK_2: 999.9,
  SATURATION_STUCK_INT: 999,
  NEGATIVE_ERROR_1: -99,
  NEGATIVE_ERROR_2: -999,
  PM25_PHYSICAL_MAX: 750,
  PM10_PHYSICAL_MAX: 1200,
} as const;

/**
 * System limits and batch processing boundaries.
 */
export const SYSTEM_LIMITS = {
  MAX_INGESTION_RECORDS: 1000,
  MAX_UPLOAD_FILE_SIZE_BYTES: 2097152, // 2MB max upload limit
  DEFAULT_DEBOUNCE_MS: 300,
  SEARCH_DEBOUNCE_MS: 250,
  MAX_PAYLOAD_SIZE_BYTES: 1048576, // 1MB body limit
  MAX_FIELD_LENGTH: 255,
  BASELINE_HISTORICAL_AQI: 211,
} as const;

/**
 * Rate limiting and network security thresholds.
 */
export const SECURITY_CONSTANTS = {
  RATE_LIMIT_WINDOW_MS: 60 * 1000, // 1 minute sliding window
  MAX_REQUESTS_PER_WINDOW: 60, // 60 requests/minute per client IP
  MAX_RATE_LIMIT_MAP_SIZE: 500, // Cap Map entries to prevent unbounded memory growth
  DEFAULT_CLIENT_IP: '127.0.0.1',
  RETRY_AFTER_SECONDS: 60,
  CORS_MAX_AGE_SECONDS: 86400,
  ALLOWED_ORIGIN_PATTERNS: ['localhost', '127.0.0.1', 'vercel.app'],
} as const;

/**
 * Cryptographic caching constants.
 */
export const CACHE_CONSTANTS = {
  CACHE_TTL_MS: 10 * 60 * 1000, // 10 minutes cache TTL
  MAX_CACHE_ENTRIES: 50,
  HASH_ALGORITHM: 'sha256',
  CACHE_KEY_PREFIX: 'hawa_sha256',
} as const;

/**
 * Gemini GenAI client parameters.
 */
export const AI_CONSTANTS = {
  GEMINI_MODELS: [
    'gemini-2.5-flash-lite',
    'gemini-2.5-flash',
    'gemini-1.5-flash',
  ] as const,
  DEFAULT_TIMEOUT_MS: 25000, // 25s timeout
  MAX_OUTPUT_TOKENS: 4096,
  TEMPERATURE: 0.15,
} as const;

/**
 * UI presentation and pagination constants.
 */
export const UI_CONSTANTS = {
  TABLE_PAGE_SIZE: 10,
  MAX_PASTED_TEXT_BYTES: 500000,
} as const;
