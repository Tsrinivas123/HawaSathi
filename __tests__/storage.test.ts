import { describe, it, expect, beforeEach } from 'vitest';
import {
  saveBriefingToHistory,
  getStoredBriefings,
  saveStoredActions,
  getStoredActions,
  saveStoredStakeholder,
  getStoredStakeholder,
  saveStoredLanguage,
  getStoredLanguage,
  clearBriefingHistory,
  StoredBriefing,
} from '../lib/storage';
import { StakeholderAction } from '../lib/types';

describe('Browser Storage & State Persistence Suite', () => {
  beforeEach(() => {
    if (typeof window !== 'undefined') {
      window.localStorage.clear();
    }
  });

  it('should persist and retrieve briefing history correctly', () => {
    const mockBriefing: StoredBriefing = {
      id: 'TEST-BRIEF-001',
      timestamp: '2026-11-14 09:00',
      averageAqi: 245,
      overallAqiCategory: 'Very Poor',
      primaryPollutant: 'PM2.5',
      hotspots: [],
      activeLocations: ['Govindpura', 'MP Nagar'],
      isAiGenerated: true,
      executiveSummary: 'Test summary for storage persistence',
    };

    saveBriefingToHistory(mockBriefing);
    const history = getStoredBriefings();
    expect(history.length).toBeGreaterThan(0);
    expect(history[0].id).toBe('TEST-BRIEF-001');
    expect(history[0].averageAqi).toBe(245);
  });

  it('should persist and retrieve stakeholder action status updates', () => {
    const actions: StakeholderAction[] = [
      {
        id: 'ACT-01',
        stakeholder: 'ward_officer',
        priority: 'High',
        actionTitle: 'Mist cannon deployment',
        description: 'Spray arterial routes',
        targetLocations: ['MP Nagar'],
        evidenceBasis: 'REC-001 PM2.5 elevated',
        type: 'confirmed_action',
        status: 'in_progress',
      },
    ];

    saveStoredActions(actions);
    const stored = getStoredActions();
    expect(stored).toBeDefined();
    expect(stored?.[0].status).toBe('in_progress');
  });

  it('should persist preferred stakeholder persona and language', () => {
    saveStoredStakeholder('school_admin');
    expect(getStoredStakeholder()).toBe('school_admin');

    saveStoredLanguage('hi');
    expect(getStoredLanguage()).toBe('hi');
  });
});
