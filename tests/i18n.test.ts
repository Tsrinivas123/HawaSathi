import { describe, it, expect } from 'vitest';
import { UI_TRANSLATIONS, getTranslation } from '../lib/i18n';

describe('Multilingual i18n Matrix', () => {
  it('should support English, Hindi and Hinglish languages', () => {
    expect(UI_TRANSLATIONS['en']).toBeDefined();
    expect(UI_TRANSLATIONS['hi']).toBeDefined();
    expect(UI_TRANSLATIONS['hinglish']).toBeDefined();
  });

  it('should return correct Hindi translations', () => {
    expect(getTranslation('hi', 'brandName', 'HawaSathi')).toContain('हवासार्थी');
    expect(getTranslation('hi', 'wardOfficer', 'Ward Officer')).toContain('वार्ड अधिकारी');
    expect(getTranslation('hi', 'overview', 'Overview')).toContain('अवलोकन');
  });

  it('should return correct Hinglish translations', () => {
    expect(getTranslation('hinglish', 'wardOfficer', 'Ward Officer')).toContain('Ward Officer (Nagar Nigam)');
    expect(getTranslation('hinglish', 'housingSociety', 'Housing Society')).toContain('Housing Society');
  });

  it('should fall back gracefully to default text for unknown keys', () => {
    const fallback = getTranslation('en', 'nonExistentKey' as any, 'Default Fallback');
    expect(fallback).toBe('Default Fallback');
  });
});
