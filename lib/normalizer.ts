import Papa from 'papaparse';
import { AirRecord, DataQualityReport } from './types';

// Standardized column mappings
const COLUMN_MAPPINGS: Record<string, string[]> = {
  location: ['location', 'area', 'locality', 'site', 'place', 'city', 'region', 'neighborhood', 'zone_name'],
  ward: ['ward', 'ward_no', 'ward_number', 'zone', 'sector', 'division'],
  station: ['station', 'station_id', 'sensor', 'sensor_id', 'device', 'device_id', 'monitor'],
  timestamp: ['timestamp', 'time', 'date', 'datetime', 'recorded_at', 'reading_time', 'date_time'],
  pm25: ['pm25', 'pm2.5', 'pm_25', 'pm2_5', 'fine_particulate', 'pm_2.5', 'pm2.5_ugm3', 'pm25_raw'],
  pm10: ['pm10', 'pm_10', 'coarse_particulate', 'pm10_ugm3', 'pm10_raw', 'rspm'],
  aqi: ['aqi', 'air_quality_index', 'overall_aqi', 'composite_aqi', 'sub_index'],
  no2: ['no2', 'nitrogen_dioxide', 'no_2', 'no2_ugm3', 'no2_ppb'],
  so2: ['so2', 'sulfur_dioxide', 'so_2', 'so2_ugm3', 'so2_ppb'],
  co: ['co', 'carbon_monoxide', 'co_mgm3', 'co_ppm'],
  o3: ['o3', 'ozone', 'o_3', 'o3_ugm3', 'o3_ppb'],
};

function normalizeHeader(header: string): string {
  const clean = header.trim().toLowerCase().replace(/[\s\-_.\/]+/g, '');
  for (const [canonical, aliases] of Object.entries(COLUMN_MAPPINGS)) {
    for (const alias of aliases) {
      const cleanAlias = alias.replace(/[\s\-_.\/]+/g, '');
      if (clean === cleanAlias || clean.includes(cleanAlias)) {
        return canonical;
      }
    }
  }
  return header.trim().toLowerCase();
}

function parseNumericWithUnit(
  val: any,
  pollutant: string,
  conversions: string[]
): { num: number | null; flag?: string } {
  if (val === undefined || val === null) return { num: null };
  const str = String(val).trim();
  if (str === '' || ['na', 'n/a', 'null', 'none', '-', 'nil'].includes(str.toLowerCase())) {
    return { num: null };
  }

  // Check for common sensor error flags
  const rawNum = parseFloat(str.replace(/[^0-9.-]/g, ''));
  if (isNaN(rawNum)) {
    return { num: null, flag: `Non-numeric value "${str}" in ${pollutant}` };
  }

  // Common instrument fault codes
  if (rawNum === -99 || rawNum === -999 || rawNum < 0) {
    return {
      num: null,
      flag: `Instrument negative error code (${rawNum}) flagged as invalid reading`,
    };
  }

  // Unit conversion checks
  const lower = str.toLowerCase();
  let normalizedNum = rawNum;

  // CO: ppm to mg/m3
  if (pollutant === 'co') {
    if (lower.includes('ppm') || rawNum < 15 && !lower.includes('mg')) {
      // If explicitly ppm or typical ppm range (<15)
      if (lower.includes('ppm')) {
        normalizedNum = Number((rawNum * 1.145).toFixed(2));
        conversions.push(`CO: ${rawNum} ppm -> ${normalizedNum} mg/m³ (Factor: 1.145 at NTP)`);
      }
    }
  }

  // PM2.5 unit checks: mg/m3 to ug/m3
  if (pollutant === 'pm25' || pollutant === 'pm10') {
    if (lower.includes('mg/m3') || (rawNum > 0 && rawNum < 1.0)) {
      normalizedNum = Number((rawNum * 1000).toFixed(1));
      conversions.push(`${pollutant.toUpperCase()}: ${rawNum} mg/m³ -> ${normalizedNum} µg/m³ (x1000)`);
    }
  }

  // Suspicious outlier check
  if ((pollutant === 'pm25' && normalizedNum > 750) || (pollutant === 'pm10' && normalizedNum > 1200)) {
    return {
      num: normalizedNum,
      flag: `Extreme outlier ${pollutant.toUpperCase()} = ${normalizedNum} µg/m³ (Potential sensor failure or immediate fire incident)`,
    };
  }

  // Sensor stuck code check: 999.0
  if (rawNum === 999 || rawNum === 999.9) {
    return {
      num: normalizedNum,
      flag: `Sensor pinned at saturation reading (${rawNum}) - calibration fault likely`,
    };
  }

  return { num: Number(normalizedNum.toFixed(2)) };
}

// Compute standard Indian CPCB AQI from PM2.5 and PM10 if AQI is missing
export function estimateAqi(pm25: number | null, pm10: number | null): number | null {
  if (pm25 === null && pm10 === null) return null;
  
  let aqiPm25: number | null = null;
  if (pm25 !== null) {
    if (pm25 <= 30) aqiPm25 = (pm25 / 30) * 50;
    else if (pm25 <= 60) aqiPm25 = 50 + ((pm25 - 30) / 30) * 50;
    else if (pm25 <= 90) aqiPm25 = 100 + ((pm25 - 60) / 30) * 100;
    else if (pm25 <= 120) aqiPm25 = 200 + ((pm25 - 90) / 30) * 100;
    else if (pm25 <= 250) aqiPm25 = 300 + ((pm25 - 120) / 130) * 100;
    else aqiPm25 = 400 + Math.min(100, ((pm25 - 250) / 150) * 100);
  }

  let aqiPm10: number | null = null;
  if (pm10 !== null) {
    if (pm10 <= 50) aqiPm10 = (pm10 / 50) * 50;
    else if (pm10 <= 100) aqiPm10 = 50 + ((pm10 - 50) / 50) * 50;
    else if (pm10 <= 250) aqiPm10 = 100 + ((pm10 - 100) / 150) * 100;
    else if (pm10 <= 350) aqiPm10 = 200 + ((pm10 - 250) / 100) * 100;
    else if (pm10 <= 430) aqiPm10 = 300 + ((pm10 - 350) / 80) * 100;
    else aqiPm10 = 400 + Math.min(100, ((pm10 - 430) / 100) * 100);
  }

  if (aqiPm25 !== null && aqiPm10 !== null) return Math.round(Math.max(aqiPm25, aqiPm10));
  if (aqiPm25 !== null) return Math.round(aqiPm25);
  if (aqiPm10 !== null) return Math.round(aqiPm10);
  return null;
}

export function parseAndNormalizeData(rawText: string): {
  records: AirRecord[];
  qualityReport: DataQualityReport;
} {
  const parsed = Papa.parse<Record<string, any>>(rawText.trim(), {
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
  let invalidValueCount = 0;
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
    const mapped: Record<string, any> = {};

    Object.entries(row).forEach(([col, val]) => {
      const canonical = headerMap[col] || col;
      mapped[canonical] = val;
    });

    const conversions: string[] = [];
    const flags: string[] = [];

    const rawLoc = String(mapped.location || mapped.ward || mapped.station || `Zone-${index + 1}`).trim();
    const location = rawLoc.replace(/^(Ward\s*\d+[\s:-]*)/i, '').trim() || rawLoc;
    const ward = String(mapped.ward || (rawLoc.match(/Ward\s*\d+/i)?.[0] ?? 'General Ward')).trim();
    const station = String(mapped.station || `Station-${(index % 4) + 1}`).trim();
    const timestamp = String(mapped.timestamp || new Date().toISOString().replace('T', ' ').substring(0, 16)).trim();

    // Check duplicate
    const dedupKey = `${location.toLowerCase()}_${timestamp.toLowerCase()}`;
    if (seenKeys.has(dedupKey)) {
      duplicateCount++;
      flags.push('Duplicate row: same location & timestamp');
    } else {
      seenKeys.add(dedupKey);
    }

    // Parse pollutants
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

    let aqiRes = parseNumericWithUnit(mapped.aqi, 'aqi', conversions);
    if (aqiRes.flag) flags.push(aqiRes.flag);

    // Auto-calculate AQI if missing but PM2.5 or PM10 exists
    let computedAqi = aqiRes.num;
    if (computedAqi === null && (pm25Res.num !== null || pm10Res.num !== null)) {
      computedAqi = estimateAqi(pm25Res.num, pm10Res.num);
      if (computedAqi !== null) {
        conversions.push(`Derived AQI (${computedAqi}) calculated from particulate readings via CPCB standards`);
      }
    }

    // Missing critical check
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

  const validRecords = records.filter((r) => r.status === 'valid').length;
  const totalRecords = records.length;
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
