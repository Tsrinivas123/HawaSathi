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
  saveStoredReadingLevel,
  getStoredReadingLevel,
  clearBriefingHistory,
  StoredBriefing,
} from '../lib/storage';
import { StakeholderAction } from '../lib/types';

describe('Browser Storage & State Persistence Suite', () => {
  beforeEach(() => {
    clearBriefingHistory();
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.clear();
    }
  });

  it('should persist and retrieve briefing history correctly with first run and second run comparison', () => {
    // Initial run: exactly 1 briefing saved
    const run1: StoredBriefing = {
      id: 'TEST-BRIEF-001',
      timestamp: '2026-11-13 09:00',
      averageAqi: 211,
      overallAqiCategory: 'Poor',
      primaryPollutant: 'PM2.5',
      hotspots: [
        {
          location: 'Govindpura Industrial Complex',
          ward: 'Ward 48',
          pollutant: 'PM2.5',
          measuredValue: 185.0,
          unit: 'µg/m³',
          timestamp: '2026-11-13 08:00',
          supportingRecordIds: ['REC-001'],
          whyNoteworthy: 'Industrial fuel combustion',
          confidence: 'High',
          category: 'Observed Fact',
        },
      ],
      activeLocations: ['Govindpura Industrial Complex'],
      isAiGenerated: true,
      executiveSummary: 'Initial day baseline briefing.',
    };

    saveBriefingToHistory(run1);
    const history1 = getStoredBriefings();
    expect(history1.length).toBe(1);

    // Rule: On first run (history.length <= 1), previousBriefing is null ("No previous brief yet")
    const previousBriefingFirstRun = history1.length > 1 ? history1[1] : null;
    expect(previousBriefingFirstRun).toBeNull();

    // Second run: new briefing saved with atmospheric shift
    const run2: StoredBriefing = {
      id: 'TEST-BRIEF-002',
      timestamp: '2026-11-14 09:00',
      averageAqi: 245,
      overallAqiCategory: 'Very Poor',
      primaryPollutant: 'PM2.5',
      hotspots: [
        {
          location: 'Karond Krishi Upaj Mandi',
          ward: 'Ward 12',
          pollutant: 'PM10',
          measuredValue: 310.2,
          unit: 'µg/m³',
          timestamp: '2026-11-14 08:40',
          supportingRecordIds: ['REC-007'],
          whyNoteworthy: 'Mandi freight congestion',
          confidence: 'High',
          category: 'Observed Fact',
        },
      ],
      activeLocations: ['Karond Krishi Upaj Mandi'],
      isAiGenerated: true,
      executiveSummary: 'Subsequent day briefing with emerged hotspots.',
    };

    saveBriefingToHistory(run2);
    const history2 = getStoredBriefings();
    expect(history2.length).toBe(2);

    // Rule: On second run, history[0] is current, history[1] is previous
    const currentBriefing = history2[0];
    const previousBriefing = history2[1];
    expect(currentBriefing.id).toBe('TEST-BRIEF-002');
    expect(previousBriefing.id).toBe('TEST-BRIEF-001');

    // Real computed AQI delta
    const aqiDelta = currentBriefing.averageAqi - previousBriefing.averageAqi;
    expect(aqiDelta).toBe(34); // 245 - 211

    // Newly emerged hotspot calculation
    const prevLocations = previousBriefing.hotspots.map(h => h.location.toLowerCase());
    const newlyEmerged = currentBriefing.hotspots.filter(h => !prevLocations.includes(h.location.toLowerCase()));
    expect(newlyEmerged.length).toBe(1);
    expect(newlyEmerged[0].location).toBe('Karond Krishi Upaj Mandi');

    // Resolved hotspot calculation
    const currLocations = currentBriefing.hotspots.map(h => h.location.toLowerCase());
    const resolved = previousBriefing.hotspots.filter(h => !currLocations.includes(h.location.toLowerCase()));
    expect(resolved.length).toBe(1);
    expect(resolved[0].location).toBe('Govindpura Industrial Complex');
  });

  it('should persist and retrieve stakeholder action status updates and custom actions', () => {
    const actions: StakeholderAction[] = [
      {
        id: 'ACT-01',
        stakeholder: 'ward_officer',
        priority: 'High',
        actionTitle: 'Mist cannon deployment',
        description: 'Spray arterial routes',
        targetLocations: ['MP Nagar'],
        evidenceBasis: 'PM2.5 > 150',
        type: 'confirmed_action',
        status: 'in_progress', // Updated status
      },
      {
        id: 'CUSTOM-001',
        stakeholder: 'housing_society',
        priority: 'Medium',
        actionTitle: 'Custom Society Generator Audit',
        description: 'Verify emissions from backup generator',
        targetLocations: ['Arera Colony'],
        evidenceBasis: 'Resident noise & smoke complaints',
        type: 'confirmed_action',
        status: 'completed',
      },
    ];

    saveStoredActions(actions);
    const retrieved = getStoredActions();
    expect(retrieved).not.toBeNull();
    expect(retrieved?.length).toBe(2);
    expect(retrieved?.[0].status).toBe('in_progress');
    expect(retrieved?.[1].id).toBe('CUSTOM-001');
    expect(retrieved?.[1].status).toBe('completed');
  });

  it('should persist and retrieve active stakeholder, language, and reading level preferences', () => {
    saveStoredStakeholder('school_admin');
    expect(getStoredStakeholder()).toBe('school_admin');

    saveStoredLanguage('hi');
    expect(getStoredLanguage()).toBe('hi');

    saveStoredReadingLevel('child');
    expect(getStoredReadingLevel()).toBe('child');
  });
});
