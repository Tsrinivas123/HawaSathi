import { describe, it, expect } from 'vitest';
import { parseAndNormalizeData } from '../lib/normalizer';
import { generateDeterministicIntelligence } from '../lib/gemini';
import { BHOPAL_MESSY_SAMPLE_CSV } from '../lib/sampleData';
import { buildRecordLookupMap } from '../lib/utils';

describe('End-to-End Civic Air Data Pipeline', () => {
  it('should execute complete pipeline: Ingestion -> Normalization -> Hotspot Traceability -> Stakeholder Directives -> WhatsApp & Briefing Export', () => {
    const { records, qualityReport } = parseAndNormalizeData(BHOPAL_MESSY_SAMPLE_CSV);
    expect(records.length).toBeGreaterThan(0);
    expect(qualityReport.totalRecords).toBe(records.length);

    const recordMap = buildRecordLookupMap(records);
    expect(recordMap.get('REC-001')).toBeDefined();
    expect(recordMap.get('REC-001')?.location).toContain('MP Nagar');

    const intelligence = generateDeterministicIntelligence(records, qualityReport, 241, 'Very Poor');
    expect(intelligence.hotspots.length).toBeGreaterThan(0);

    intelligence.hotspots.forEach((hotspot) => {
      expect(hotspot.supportingRecordIds.length).toBeGreaterThan(0);
      const verifiedRecord = recordMap.get(hotspot.supportingRecordIds[0]);
      expect(verifiedRecord).toBeDefined();
    });

    expect(intelligence.advisories['en_citizen']).toBeDefined();
    expect(intelligence.advisories['hi_citizen']).toBeDefined();
    expect(intelligence.advisories['hinglish_citizen']).toBeDefined();

    const actions = intelligence.stakeholderActions;
    expect(actions.some((a) => a.stakeholder === 'ward_officer')).toBe(true);
    expect(actions.some((a) => a.stakeholder === 'housing_society')).toBe(true);
    expect(actions.some((a) => a.stakeholder === 'school_admin')).toBe(true);

    const adv = intelligence.advisories['en_citizen'];
    const whatsAppText = `📢 *${adv.headline}*\n\n${adv.summary}\n\n🛡️ *Key Precautions:*\n${adv.generalGuidance.map((g) => `• ${g}`).join('\n')}\n\n⚠️ *Vulnerable Groups:*\n${adv.vulnerablePrecautions.map((vp) => `• *${vp.group}*: ${vp.precaution}`).join('\n')}\n\n✅ *DO's:* ${adv.dosAndDonts.dos.join(', ')}\n❌ *DON'Ts:* ${adv.dosAndDonts.donts.join(', ')}\n\n_Issued via HawaSathi Civic Environmental Intelligence_`;
    expect(whatsAppText).toContain('📢 *');
    expect(whatsAppText).toContain('Key Precautions');
    expect(whatsAppText).toContain('Vulnerable Groups');
    expect(whatsAppText).toContain("DO's");
    expect(whatsAppText).toContain("DON'Ts");

    const memoText = `OFFICIAL CIVIC AIR QUALITY INTERNAL BRIEFING MEMO\nCity AQI: ${intelligence.averageAqi} (${intelligence.overallAqiCategory})\nHeadline: ${adv.headline}\nMandatory Protocols:\n${adv.generalGuidance.map((g, i) => `[${i + 1}] ${g}`).join('\n')}`;
    expect(memoText).toContain('OFFICIAL CIVIC AIR QUALITY INTERNAL BRIEFING MEMO');
    expect(memoText).toContain('Mandatory Protocols');
  });
});
