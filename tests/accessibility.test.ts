import { describe, it, expect } from 'vitest';
import { getAqiBadgeClasses } from '../lib/utils';
import { UI_TRANSLATIONS } from '../lib/i18n';

describe('Accessibility & WCAG 2.1 AA Compliance Suite', () => {
  it('should generate high-contrast text and border classes for all AQI tiers', () => {
    const goodClasses = getAqiBadgeClasses(35);
    expect(goodClasses).toContain('text-emerald-700');
    expect(goodClasses).toContain('bg-emerald-50');

    const moderateClasses = getAqiBadgeClasses(80);
    expect(moderateClasses).toContain('text-amber-700');
    expect(moderateClasses).toContain('bg-amber-50');

    const poorClasses = getAqiBadgeClasses(150);
    expect(poorClasses).toContain('text-orange-700');
    expect(poorClasses).toContain('bg-orange-50');

    const severeClasses = getAqiBadgeClasses(420);
    expect(severeClasses).toContain('text-purple-700');
    expect(severeClasses).toContain('bg-purple-50');
  });

  it('should ensure all navigation items and stakeholders have accessible labels in all languages', () => {
    const languages = ['en', 'hi', 'hinglish'] as const;
    const requiredKeys = ['overview', 'data_studio', 'intelligence', 'actions', 'advisory', 'history', 'settings'];

    languages.forEach((lang) => {
      requiredKeys.forEach((key) => {
        const val = (UI_TRANSLATIONS[lang] as Record<string, string>)[key];
        expect(val).toBeDefined();
        expect(val.length).toBeGreaterThan(0);
      });
    });
  });

  it('should provide clear accessible labels for stakeholder roles', () => {
    ['en', 'hi', 'hinglish'].forEach((lang) => {
      const dict = UI_TRANSLATIONS[lang as 'en' | 'hi' | 'hinglish'];
      expect(dict.wardOfficer).toBeTruthy();
      expect(dict.housingSociety).toBeTruthy();
      expect(dict.schoolAdmin).toBeTruthy();
    });
  });
});
