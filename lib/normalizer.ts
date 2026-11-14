/**
 * @file normalizer.ts
 * @description Ingestion and normalization engine for messy environmental telemetry data.
 * Implements CPCB Indian National Ambient Air Quality Standards, unit harmonizations,
 * and sensor anomaly diagnostics.
 */

import Papa from 'papaparse';
import { AirRecord, DataQualityReport } from './types';
import { UNIT_CONVERSIONS, SENSOR_ANOMALY_CODES } from './constants';

/**
 * Standardized column mapping vocabulary for fuzzy header normalization.
 */
const COLUMN_MAPPINGS: Record<string, readonly string[]> = {
  location: ['location', 'area', 'locality', 'site', 'place', 'city', 'region', 'neighborhood', 'zone_name', 'site_location', 'site_area', 'station_name'],
  ward: ['ward', 'ward_no', 'ward_number', 'zone', 'sector', 'division', 'municipal_ward'],
  station: ['station', 'station_id', 'sensor', 'sensor_id', 'device', 'device_id', 'monitor'],
  timestamp: ['timestamp', 'time', 'date', 'datetime', 'recorded_at', 'reading_time', 'date_time', 'observed_time'],
  pm25: ['pm25', 'pm2.5', 'pm_25', 'pm2_5', 'fine_particulate', 'pm2.5_ugm3', 'pm25_raw', 'particulate_2.5', 'particulate2.5', 'particulate25', 'particulate'],
  pm10: ['pm10', 'pm_10', 'coarse_particulate', 'pm10_ugm3', 'pm10_raw', 'rspm', 'particulate_10', 'particulate10'],
  aqi: ['aqi', 'air_quality_index', 'overall_aqi', 'composite_aqi', 'sub_index', 'index_score', 'index'],
  no2: ['no2', 'nitrogen_dioxide', 'no_2', 'no2_ugm3', 'no2_ppb'],
  so2: ['so2', 'sulfur_dioxide', 'so_2', 'so2_ugm3', 'so2_ppb'],
  co: ['co', 'carbon_monoxide', 'co_mgm3', 'co_ppm'],
  o3: ['o3', 'ozone', 'o_3', 'o3_ugm3', 'o3_ppb'],
};

/**
 * Normalizes ambiguous CSV header names to internal canonical schema.
 * @param header The raw column title from the CSV header row
 */
function normalizeHeader(header: string): string {
  const clean = header.trim().toLowerCase().replace(/[\s\-_./]+/g, '');
  for (const [canonical, aliases] of Object.entries(COLUMN_MAPPINGS)) {
    for (const alias of aliases) {
      const cleanAlias = alias.replace(/[\s\-_./]+/g, '');
      if (clean === cleanAlias || clean.includes(cleanAlias)) {
        return canonical;
      }
    }
  }
  return header.trim().toLowerCase();
}

/**
 * Parses raw text cell into numeric measurement, converting units to standard CPCB metrics.
 * @param val Raw cell value (string, number, or null)
 * @param pollutant Pollutant identifier ('pm25', 'pm10', 'co', etc.)
 * @param conversions In-out array to append human-readable conversion logs
 */
function parseNumericWithUnit(
  val: unknown,
  pollutant: string,
  conversions: string[]
): { num: number | null; flag?: string } {
  if (val === undefined || val === null) return { num: null };
  const str = String(val).trim();
  if (str === '' || ['na', 'n/a', 'null', 'none', '-', 'nil'].includes(str.toLowerCase())) {
    return { num: null };
  }

  const rawNum = parseFloat(str.replace(/[^0-9.-]/g, ''));
  if (isNaN(rawNum)) {
    return { num: null, flag: `Non-numeric value "${str}" in ${pollutant}` };
  }

  // Common instrument fault codes (e.g., negative telemetry codes)
  if (rawNum === SENSOR_ANOMALY_CODES.NEGATIVE_ERROR_1 || rawNum === SENSOR_ANOMALY_CODES.NEGATIVE_ERROR_2 || rawNum < 0) {
    return {
      num: null,
      flag: `Instrument negative error code (${rawNum}) flagged as invalid reading`,
    };
  }

  const lower = str.toLowerCase();
  let normalizedNum = rawNum;

  // CO: ppm to mg/m³ unit normalization using NTP gas law factor
  if (pollutant === 'co') {
    if (lower.includes('ppm') || (rawNum < 15 && !lower.includes('mg'))) {
      if (lower.includes('ppm')) {
        normalizedNum = Number((rawNum * UNIT_CONVERSIONS.CO_PPM_TO_MGM3).toFixed(2));
        conversions.push(`CO: ${rawNum} ppm -> ${normalizedNum} mg/m³ (Factor: 1.145 at NTP)`);
      }
    }
  }

  // Particulate matter: mg/m³ to µg/m³ unit normalization
  if (pollutant === 'pm25' || pollutant === 'pm10') {
    if (lower.includes('mg/m3') || (rawNum > 0 && rawNum < 1.0)) {
      normalizedNum = Number((rawNum * UNIT_CONVERSIONS.MG_TO_UG_MULTIPLIER).toFixed(1));
      conversions.push(`${pollutant.toUpperCase()}: ${rawNum} mg/m³ -> ${normalizedNum} µg/m³ (x1000)`);
    }
  }

  // Extreme physical anomaly check
  if (
    (pollutant === 'pm25' && normalizedNum > SENSOR_ANOMALY_CODES.PM25_PHYSICAL_MAX) ||
    (pollutant === 'pm10' && normalizedNum > SENSOR_ANOMALY_CODES.PM10_PHYSICAL_MAX)
  ) {
    return {
      num: normalizedNum,
      flag: `Extreme outlier ${pollutant.toUpperCase()} = ${normalizedNum} µg/m³ (Potential sensor failure or immediate fire incident)`,
    };
  }

  // Sensor saturation stuck reading check (e.g., 999.0 stuck bit)
  if (
    rawNum === SENSOR_ANOMALY_CODES.SATURATION_STUCK_1 ||
    rawNum === SENSOR_ANOMALY_CODES.SATURATION_STUCK_2 ||
    rawNum === SENSOR_ANOMALY_CODES.SATURATION_STUCK_INT
  ) {
    return {
      num: normalizedNum,
      flag: `Sensor pinned at saturation reading (${rawNum}) - calibration fault likely`,
    };
  }

  return { num: Number(normalizedNum.toFixed(2)) };
}

/**
 * Calculates Indian CPCB sub-index for PM2.5 via official linear interpolation formula.
 */
function calculatePm25SubIndex(pm25: number): number {
  if (pm25 <= 30) return (pm25 / 30) * 50;
  if (pm25 <= 60) return 50 + ((pm25 - 30) / 30) * 50;
  if (pm25 <= 90) return 100 + ((pm25 - 60) / 30) * 100;
  if (pm25 <= 120) return 200 + ((pm25 - 90) / 30) * 100;
  if (pm25 <= 250) return 300 + ((pm25 - 120) / 130) * 100;
  return 400 + Math.min(100, ((pm25 - 250) / 150) * 100);
}

/**
 * Calculates Indian CPCB sub-index for PM10 via official linear interpolation formula.
 */
function calculatePm10SubIndex(pm10: number): number {
  if (pm10 <= 50) return (pm10 / 50) * 50;
  if (pm10 <= 100) return 50 + ((pm10 - 50) / 50) * 50;
  if (pm10 <= 250) return 100 + ((pm10 - 100) / 150) * 100;
  if (pm10 <= 350) return 200 + ((pm10 - 250) / 100) * 100;
  if (pm10 <= 430) return 300 + ((pm10 - 350) / 80) * 100;
  return 400 + Math.min(100, ((pm10 - 430) / 100) * 100);
}

/**
 * Compute standard Indian CPCB composite AQI from PM2.5 and PM10 when composite AQI is missing.
 * CPCB rule: Composite AQI is the maximum of individual sub-indices.
 * @param pm25 Inhalable particulate concentration (µg/m³)
 * @param pm10 Coarse particulate concentration (µg/m³)
 */
export function estimateAqi(pm25: number | null, pm10: number | null): number | null {
  if (pm25 === null && pm10 === null) return null;

  const aqiPm25 = pm25 !== null ? calculatePm25SubIndex(pm25) : null;
  const aqiPm10 = pm10 !== null ? calculatePm10SubIndex(pm10) : null;

  if (aqiPm25 !== null && aqiPm10 !== null) return Math.round(Math.max(aqiPm25, aqiPm10));
  if (aqiPm25 !== null) return Math.round(aqiPm25);
  if (aqiPm10 !== null) return Math.round(aqiPm10);
  return null;
}

/**
 * Ingests raw tabular text (CSV, TSV, pasted lines) and outputs normalized AirRecords
 * and a rigorous DataQualityReport.
 * @param rawText Tabular data string
 */
export function parseAndNormalizeData(rawText: string): {
  records: AirRecord[];
  qualityReport: DataQualityReport;
} {
  const parsed = Papa.parse<Record<string, unknown>>(rawText.trim(), {
    header: true,
    skipEmptyLines: 'greedy',
    dynamicTyping: false,
  });

  if (!parsed.data || parsed.data.length === 0) {
    throw new Error('No valid tabular data could be parsed from the provided input.');
  }

  const rawHeaders = parsed.meta.fields || [];
  const headerMap: Record<string, string> = {};
  rawHeaders.forEach((h) => {
    headerMap[h] = normalizeHeader(h);
  });

  const records: AirRecord[] = [];
  const seenKeys = new Set<string>();
  let duplicateCount = 0;
  let missingFieldCount = 0;
  const invalidValueCount = 0;
  let suspiciousCount = 0;
  const warnings: string[] = [];

  const detectedUnits: Record<string, string> = {
    pm25: 'µg/m³',
    pm10: 'µg/m³',
    aqi: 'Index (0-500)',
    no2: 'µg/m³',
    so2: 'µg/m³',
    co: 'mg/m³',
    o3: 'µg/m³',
  };

  parsed.data.forEach((row, index) => {
    const id = `REC-${String(index + 1).padStart(3, '0')}`;
    const mapped: Record<string, unknown> = {};

    Object.entries(row).forEach(([col, val]) => {
      const canonical = headerMap[col] || col;
      mapped[canonical] = val;
    });

    const conversions: string[] = [];
    const flags: string[] = [];

    // Sanitize text inputs against HTML tags, script injection, control characters, and length overflow
    const sanitizeText = (val: string): string =>
      val.replace(/<[^>]*>?/gm, '').replace(/[\x00-\x1F\x7F]/g, '').slice(0, 255).trim();

    const rawLoc = sanitizeText(String(mapped.location || mapped.ward || mapped.station || `Zone-${index + 1}`));
    const location = sanitizeText(rawLoc.replace(/^(Ward\s*\d+[\s:-]*)/i, '') || rawLoc);
    const ward = sanitizeText(String(mapped.ward || (rawLoc.match(/Ward\s*\d+/i)?.[0] ?? 'General Ward')));
    const station = sanitizeText(String(mapped.station || `Station-${(index % 4) + 1}`));
    const timestamp = sanitizeText(String(mapped.timestamp || new Date().toISOString().replace('T', ' ').substring(0, 16)));

    // Deduplication check
    const dedupKey = `${location.toLowerCase()}_${timestamp.toLowerCase()}`;
    if (seenKeys.has(dedupKey)) {
      duplicateCount++;
      flags.push('Duplicate row: same location & timestamp');
    } else {
      seenKeys.add(dedupKey);
    }

    // Parse each pollutant
    const pm25Res = parseNumericWithUnit(mapped.pm25, 'pm25', conversions);
    if (pm25Res.flag) {
      flags.push(pm25Res.flag);
      suspiciousCount++;
    }

    const pm10Res = parseNumericWithUnit(mapped.pm10, 'pm10', conversions);
    if (pm10Res.flag) {
      flags.push(pm10Res.flag);
      suspiciousCount++;
    }

    const no2Res = parseNumericWithUnit(mapped.no2, 'no2', conversions);
    if (no2Res.flag) flags.push(no2Res.flag);

    const so2Res = parseNumericWithUnit(mapped.so2, 'so2', conversions);
    if (so2Res.flag) flags.push(so2Res.flag);

    const coRes = parseNumericWithUnit(mapped.co, 'co', conversions);
    if (coRes.flag) flags.push(coRes.flag);

    const o3Res = parseNumericWithUnit(mapped.o3, 'o3', conversions);
    if (o3Res.flag) flags.push(o3Res.flag);

    const aqiRes = parseNumericWithUnit(mapped.aqi, 'aqi', conversions);
    if (aqiRes.flag) flags.push(aqiRes.flag);

    // Auto-calculate AQI if missing but particulate data is present
    let computedAqi = aqiRes.num;
    if (computedAqi === null && (pm25Res.num !== null || pm10Res.num !== null)) {
      computedAqi = estimateAqi(pm25Res.num, pm10Res.num);
      if (computedAqi !== null) {
        conversions.push(`Derived AQI (${computedAqi}) calculated from particulate readings via CPCB standards`);
      }
    }

    // Missing critical telemetry check
    if (pm25Res.num === null && pm10Res.num === null && computedAqi === null) {
      missingFieldCount++;
      flags.push('Missing critical particulate & AQI data');
    }

    let status: AirRecord['status'] = 'valid';
    if (flags.some((f) => f.includes('outlier') || f.includes('saturation') || f.includes('Duplicate'))) {
      status = 'suspicious';
    } else if (pm25Res.num === null && computedAqi === null) {
      status = 'missing_critical';
    }

    if (conversions.length > 0) {
      warnings.push(`Record ${id} (${location}): Applied conversions -> ${conversions.join('; ')}`);
    }

    records.push({
      id,
      rawLocation: rawLoc,
      location,
      ward,
      station,
      timestamp,
      pm25: pm25Res.num,
      pm10: pm10Res.num,
      aqi: computedAqi,
      no2: no2Res.num,
      so2: so2Res.num,
      co: coRes.num,
      o3: o3Res.num,
      status,
      flags,
      conversionsApplied: conversions,
    });
  });

  const totalRecords = records.length;
  const validRecords = records.filter((r) => r.status === 'valid').length;
  const dataCompletenessPct = totalRecords > 0
    ? Math.round((records.filter((r) => r.pm25 !== null && r.aqi !== null).length / totalRecords) * 100)
    : 0;

  if (duplicateCount > 0) warnings.unshift(`Detected ${duplicateCount} duplicate entries with identical timestamp & location.`);
  if (missingFieldCount > 0) warnings.unshift(`${missingFieldCount} records lack critical PM2.5 and AQI values.`);
  if (suspiciousCount > 0) warnings.unshift(`${suspiciousCount} readings have extreme outlier values or sensor saturation flags.`);

  const qualityReport: DataQualityReport = {
    totalRecords,
    validRecords,
    missingReadings: missingFieldCount,
    duplicateRecords: duplicateCount,
    invalidValues: invalidValueCount,
    suspiciousObservations: suspiciousCount,
    detectedUnits,
    dataCompletenessPct,
    warnings,
  };

  return { records, qualityReport };
}
