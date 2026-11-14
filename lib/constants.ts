/**
 * @file constants.ts
 * @description Centralized constants and environmental standards for HawaSathi.
 * Eliminates magic numbers across normalizer, AI engines, and UI rendering.
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
  DEFAULT_DEBOUNCE_MS: 300,
  BASELINE_HISTORICAL_AQI: 211,
} as const;
