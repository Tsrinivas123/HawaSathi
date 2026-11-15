/**
 * @file storage.ts
 * @description Safe browser storage helpers for persisting briefing history, local actions, and user preferences.
 * Implements universal hybrid persistence (localStorage with in-memory fallback for SSR/testing).
 */

import { StakeholderAction, StakeholderType, Language, ReadingLevel, HotspotFinding } from '@/lib/types';

export interface StoredBriefing {
  id: string;
  timestamp: string;
  averageAqi: number;
  overallAqiCategory: string;
  primaryPollutant: string;
  hotspots: HotspotFinding[];
  activeLocations: string[];
  isAiGenerated: boolean;
  executiveSummary: string;
}

const STORAGE_KEYS = {
  ACTIONS: 'hawasathi_actions_v1',
  BRIEFINGS: 'hawasathi_briefing_history_v1',
  STAKEHOLDER: 'hawasathi_active_stakeholder_v1',
  LANGUAGE: 'hawasathi_active_language_v1',
  READING_LEVEL: 'hawasathi_active_reading_level_v1',
  DATASET: 'hawasathi_active_dataset_v1',
} as const;

// In-memory fallback map for Node/SSR environments
const memoryStore = new Map<string, string>();

function getItem(key: string): string | null {
  if (typeof window !== 'undefined' && window.localStorage) {
    try {
      const val = window.localStorage.getItem(key);
      if (val !== null) return val;
    } catch {
      // Fall through to memoryStore
    }
  }
  return memoryStore.get(key) || null;
}

function setItem(key: string, val: string): void {
  if (typeof window !== 'undefined' && window.localStorage) {
    try {
      window.localStorage.setItem(key, val);
    } catch {
      // Fall through to memoryStore
    }
  }
  memoryStore.set(key, val);
}

function removeItem(key: string): void {
  if (typeof window !== 'undefined' && window.localStorage) {
    try {
      window.localStorage.removeItem(key);
    } catch {
      // Fall through to memoryStore
    }
  }
  memoryStore.delete(key);
}

/**
 * Retrieve saved stakeholder actions
 */
export function getStoredActions(): StakeholderAction[] | null {
  try {
    const raw = getItem(STORAGE_KEYS.ACTIONS);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

/**
 * Save stakeholder actions to browser storage
 */
export function saveStoredActions(actions: StakeholderAction[]): void {
  try {
    setItem(STORAGE_KEYS.ACTIONS, JSON.stringify(actions));
  } catch {
    // Fail-safe
  }
}

/**
 * Retrieve all saved briefings
 */
export function getStoredBriefings(): StoredBriefing[] {
  try {
    const raw = getItem(STORAGE_KEYS.BRIEFINGS);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

/**
 * Save a newly generated briefing to historical log
 */
export function saveBriefingToHistory(briefing: StoredBriefing): StoredBriefing[] {
  try {
    const existing = getStoredBriefings();
    // Prepend new briefing, keep up to 20 historical reports
    const updated = [briefing, ...existing.filter((b) => b.id !== briefing.id)].slice(0, 20);
    setItem(STORAGE_KEYS.BRIEFINGS, JSON.stringify(updated));
    return updated;
  } catch {
    return [briefing];
  }
}

/**
 * Clear briefing history (for testing or reset)
 */
export function clearBriefingHistory(): void {
  try {
    removeItem(STORAGE_KEYS.BRIEFINGS);
  } catch {
    // Fail-safe
  }
}

/**
 * Get preferred stakeholder persona
 */
export function getStoredStakeholder(): StakeholderType | null {
  try {
    const val = getItem(STORAGE_KEYS.STAKEHOLDER);
    if (val === 'ward_officer' || val === 'housing_society' || val === 'school_admin' || val === 'citizen') {
      return val;
    }
    return null;
  } catch {
    return null;
  }
}

/**
 * Save preferred stakeholder persona
 */
export function saveStoredStakeholder(stakeholder: StakeholderType): void {
  try {
    setItem(STORAGE_KEYS.STAKEHOLDER, stakeholder);
  } catch {
    // Fail-safe
  }
}

/**
 * Retrieve saved active raw dataset
 */
export function getStoredDataset(): string | null {
  try {
    const val = getItem(STORAGE_KEYS.DATASET);
    return val && val.trim().length > 0 ? val : null;
  } catch {
    return null;
  }
}

/**
 * Save active raw dataset to browser storage
 */
export function saveStoredDataset(csv: string): void {
  try {
    setItem(STORAGE_KEYS.DATASET, csv);
  } catch {
    // Fail-safe
  }
}

/**
 * Clear stored active dataset
 */
export function clearStoredDataset(): void {
  try {
    removeItem(STORAGE_KEYS.DATASET);
  } catch {
    // Fail-safe
  }
}

/**
 * Get preferred language
 */
export function getStoredLanguage(): Language | null {
  try {
    const val = getItem(STORAGE_KEYS.LANGUAGE);
    if (val === 'en' || val === 'hi' || val === 'hinglish') {
      return val;
    }
    return null;
  } catch {
    return null;
  }
}

/**
 * Save preferred language
 */
export function saveStoredLanguage(lang: Language): void {
  try {
    setItem(STORAGE_KEYS.LANGUAGE, lang);
  } catch {
    // Fail-safe
  }
}

/**
 * Get preferred reading level
 */
export function getStoredReadingLevel(): ReadingLevel | null {
  try {
    const val = getItem(STORAGE_KEYS.READING_LEVEL);
    if (val === 'citizen' || val === 'child' || val === 'official') {
      return val;
    }
    return null;
  } catch {
    return null;
  }
}

/**
 * Save preferred reading level
 */
export function saveStoredReadingLevel(level: ReadingLevel): void {
  try {
    setItem(STORAGE_KEYS.READING_LEVEL, level);
  } catch {
    // Fail-safe
  }
}
