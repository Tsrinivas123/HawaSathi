import { Language } from './types';

export const UI_TRANSLATIONS: Record<Language, Record<string, string>> = {
  en: {
    // Brand
    brandName: 'HawaSathi',
    tagline: 'Air Data to Local Action',
    edition: 'PromptWars 2026 Bhopal',
    
    // Nav
    overview: 'Overview',
    data_studio: 'Data Studio',
    intelligence: 'Air Intelligence',
    actions: 'Local Actions',
    advisory: 'Citizen Advisory',
    history: 'Report History',
    settings: 'Settings',
    studioNavigation: 'Studio Navigation',
    activeStakeholder: 'Active Stakeholder',

    // Roles
    wardOfficer: 'Ward Officer (ULB)',
    housingSociety: 'Housing Society (RWA)',
    schoolAdmin: 'School Administrator',

    // TopNav
    recordsActive: 'Records Active',
    generateBriefing: 'Generate AI Briefing',
    analyzingData: 'Analyzing Air Data...',
    geminiActive: 'Gemini 3.5 Flash Active',

    // Overview KPIs
    citywideAqi: 'Citywide Average AQI',
    cpcbScale: 'CPCB Scale',
    vsBaseline: 'vs 24h baseline',
    primaryPollutant: 'Primary Pollutant Burden',
    fineParticles: 'Fine Inhalable Respirable Particles',
    activeHotspots: 'Active High-Pollution Nodes',
    exceedsWho: 'Exceeds WHO 24h Ambient Standard',
    dataCompleteness: 'Dataset Completeness',
    auditPassed: 'Audit Passed',
    traceableRecords: '100% Traceable',

    // Actions & Buttons
    viewActions: 'View Stakeholder Actions',
    openDataStudio: 'Open Data Studio',
    loadDemoData: 'Load Sample Telemetry Data',
    loadCleanData: 'Load Benchmark Baseline',
    dispatchNewAction: 'Dispatch New Action',
    printBulletin: 'Print Bulletin',
    copyWhatsApp: 'Copy WhatsApp Bulletin',
    downloadInternalMemo: 'Internal Briefing (.txt)',
    auditTrace: 'Audit Trace',
  },
  hi: {
    // Brand
    brandName: 'हवासार्थी (HawaSathi)',
    tagline: 'वायु डेटा से स्थानीय कार्रवाई',
    edition: 'प्रॉम्प्टवार्स 2026 भोपाल संस्करण',

    // Nav
    overview: 'अवलोकन (Overview)',
    data_studio: 'डेटा स्टूडियो (Data Studio)',
    intelligence: 'वायु बुद्धिमत्ता (Air Intelligence)',
    actions: 'स्थानीय कार्ययोजना (Local Actions)',
    advisory: 'नागरिक परामर्श (Citizen Advisory)',
    history: 'रिपोर्ट इतिहास (Report History)',
    settings: 'सेटिंग्स (Settings)',
    studioNavigation: 'स्टूडियो नेविगेशन',
    activeStakeholder: 'सक्रिय हितधारक (Active Role)',

    // Roles
    wardOfficer: 'वार्ड अधिकारी (नगर निगम)',
    housingSociety: 'आवास समिति (RWA)',
    schoolAdmin: 'स्कूल प्रशासक (School Admin)',

    // TopNav
    recordsActive: 'सक्रिय रिकॉर्ड्स',
    generateBriefing: 'एआई ब्रीफिंग बनाएं',
    analyzingData: 'डेटा का विश्लेषण जारी...',
    geminiActive: 'जेमिनी 3.5 फ्लैश सक्रिय',

    // Overview KPIs
    citywideAqi: 'शहर का औसत एक्यूआई (AQI)',
    cpcbScale: 'केंद्रीय प्रदूषण बोर्ड पैमाना',
    vsBaseline: '24 घंटे के आधार पर',
    primaryPollutant: 'प्रमुख वायु प्रदूषक',
    fineParticles: 'अति सूक्ष्म धूल कण (PM2.5 / PM10)',
    activeHotspots: 'सक्रिय गंभीर प्रदूषण केंद्र',
    exceedsWho: 'विश्व स्वास्थ्य संगठन मानक से अधिक',
    dataCompleteness: 'डेटा पूर्णता प्रतिशत',
    auditPassed: 'सत्यापित ऑडिट',
    traceableRecords: '100% प्रमाणित रिकॉर्ड',

    // Actions & Buttons
    viewActions: 'कार्ययोजना देखें',
    openDataStudio: 'डेटा स्टूडियो खोलें',
    loadDemoData: 'भोपाल डेटा लोड करें [डेमो]',
    loadCleanData: 'स्वच्छ डेटा लोड करें [डेमो]',
    dispatchNewAction: 'नया कार्य आदेश जारी करें',
    printBulletin: 'बुलेटिन प्रिंट करें',
    copyWhatsApp: 'व्हाट्सएप संदेश कॉपी करें',
    downloadInternalMemo: 'आधिकारिक ज्ञापन डाउनलोड (.txt)',
    auditTrace: 'प्रमाणित ऑडिट देखें',
  },
  hinglish: {
    // Brand
    brandName: 'HawaSathi',
    tagline: 'Air Data se Local Action tak',
    edition: 'PromptWars 2026 Bhopal Edition',

    // Nav
    overview: 'Overview Dashboard',
    data_studio: 'Data Studio',
    intelligence: 'Air Intelligence (AI)',
    actions: 'Local Actions',
    advisory: 'Citizen Advisory',
    history: 'Report History',
    settings: 'Settings & Config',
    studioNavigation: 'Main Navigation',
    activeStakeholder: 'Selected Role',

    // Roles
    wardOfficer: 'Ward Officer (Nagar Nigam)',
    housingSociety: 'Housing Society (RWA)',
    schoolAdmin: 'School Administrator',

    // TopNav
    recordsActive: 'Records Ingested',
    generateBriefing: 'Generate AI Briefing',
    analyzingData: 'Analyzing Air Data...',
    geminiActive: 'Gemini 3.5 Live',

    // Overview KPIs
    citywideAqi: 'City Average AQI',
    cpcbScale: 'CPCB Scale',
    vsBaseline: 'yesterday ke mukable',
    primaryPollutant: 'Main Pollutant Burden',
    fineParticles: 'Fine Dust & Smoke Particles',
    activeHotspots: 'Active Pollution Hotspots',
    exceedsWho: 'Safe Limit se kaafi zyada',
    dataCompleteness: 'Data Completeness %',
    auditPassed: 'Audit Verified',
    traceableRecords: '100% Traceable to Sensors',

    // Actions & Buttons
    viewActions: 'View Action Plan',
    openDataStudio: 'Open Data Studio',
    loadDemoData: 'Load Sample Telemetry Data',
    loadCleanData: 'Load Benchmark Baseline',
    dispatchNewAction: 'Dispatch New Action Order',
    printBulletin: 'Print Advisory',
    copyWhatsApp: 'Copy WhatsApp Message',
    downloadInternalMemo: 'Internal Briefing (.txt)',
    auditTrace: 'View Sensor Trace',
  },
};

export function getTranslation(lang: Language, key: string, fallback?: string): string {
  return UI_TRANSLATIONS[lang]?.[key] || UI_TRANSLATIONS.en[key] || fallback || key;
}
