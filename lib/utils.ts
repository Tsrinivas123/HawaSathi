/**
 * @file utils.ts
 * @description Shared DRY utility functions for HawaSathi.
 * Eliminates duplicate styling and calculation logic across components.
 */

import { AQI_BREAKPOINTS } from './constants';
import { AirRecord } from './types';

export type AqiSeverity = 'Good' | 'Moderate' | 'Poor' | 'Very Poor' | 'Severe' | 'Hazardous' | 'Unknown';

/**
 * Returns the categorical CPCB severity for a given numeric AQI index.
 * @param aqi The numeric Air Quality Index (0-500)
 */
export function getAqiCategory(aqi: number | null): AqiSeverity {
  if (aqi === null || aqi === undefined) return 'Unknown';
  if (aqi <= AQI_BREAKPOINTS.GOOD_MAX) return 'Good';
  if (aqi <= AQI_BREAKPOINTS.MODERATE_MAX) return 'Moderate';
  if (aqi <= AQI_BREAKPOINTS.POOR_MAX) return 'Poor';
  if (aqi <= AQI_BREAKPOINTS.VERY_POOR_MAX) return 'Very Poor';
  if (aqi <= AQI_BREAKPOINTS.SEVERE_MAX) return 'Severe';
  return 'Hazardous';
}

/**
 * Provides standardized Tailwind color styling classes based on AQI category.
 * Unified across Overview, DataStudio, and Intelligence views.
 */
export function getAqiBadgeClasses(categoryOrAqi: string | number | null): string {
  let category: string;
  if (typeof categoryOrAqi === 'number' || categoryOrAqi === null) {
    category = getAqiCategory(categoryOrAqi);
  } else {
    category = categoryOrAqi;
  }

  switch (category) {
    case 'Good':
      return 'bg-emerald-50 text-emerald-700 border-emerald-300';
    case 'Moderate':
      return 'bg-amber-50 text-amber-700 border-amber-300';
    case 'Poor':
      return 'bg-orange-50 text-orange-700 border-orange-300';
    case 'Very Poor':
      return 'bg-red-50 text-red-700 border-red-300';
    case 'Severe':
    case 'Hazardous':
      return 'bg-purple-50 text-purple-700 border-purple-300';
    default:
      return 'bg-slate-50 text-slate-700 border-slate-300';
  }
}

/**
 * Builds an O(1) indexed Map from an array of AirRecords for ultra-efficient lookups.
 * Eliminates repeated O(N) array.find operations.
 */
export function buildRecordLookupMap(records: readonly AirRecord[]): Map<string, AirRecord> {
  const map = new Map<string, AirRecord>();
  for (let i = 0; i < records.length; i++) {
    const record = records[i];
    map.set(record.id, record);
  }
  return map;
}
