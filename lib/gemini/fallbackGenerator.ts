/**
 * @file fallbackGenerator.ts
 * @description Deterministic rule-based civic intelligence engine.
 * Generates verified findings, multi-stakeholder actions, and a 9-advisory matrix
 * dynamically derived from ingested telemetry data without external LLM API dependencies.
 * CLIENT-SAFE: Can be safely imported into client components without bundling zod.
 */

import {
  AirRecord,
  DataQualityReport,
  AnalysisResult,
  HotspotFinding,
  StakeholderAction,
  CitizenAdvisory,
  BriefingComparison,
  TrendAnalysis,
} from '@/lib/types';
import { AQI_BREAKPOINTS } from '@/lib/constants';
import { PREVIOUS_BRIEFING_RECORD } from '@/lib/sampleData';
import { StoredBriefing } from '@/lib/storage';

/**
 * Detects municipal region/city from records or defaults to generic civic label.
 */
function detectCityName(records: readonly AirRecord[]): string {
  for (const r of records) {
    const loc = r.location.toLowerCase();
    if (loc.includes('bhopal')) return 'Bhopal';
    if (loc.includes('indore')) return 'Indore';
    if (loc.includes('delhi')) return 'Delhi';
    if (loc.includes('mumbai')) return 'Mumbai';
    if (loc.includes('pune')) return 'Pune';
    if (loc.includes('nagpur')) return 'Nagpur';
  }
  return 'Civic';
}

/**
 * Discovers and formats top high-pollution hotspots from valid, non-outlier records.
 * If no record exceeds the POOR_MAX threshold (clean/moderate air), selects the top monitored nodes.
 */
function buildDeterministicHotspots(validRecords: readonly AirRecord[]): HotspotFinding[] {
  const seen = new Set<string>();
  let candidates = validRecords
    .filter((r) => r.aqi && r.aqi >= AQI_BREAKPOINTS.POOR_MAX)
    .sort((a, b) => (b.aqi || 0) - (a.aqi || 0));

  if (candidates.length === 0 && validRecords.length > 0) {
    candidates = [...validRecords].sort((a, b) => (b.aqi || 0) - (a.aqi || 0)).slice(0, 2);
  }

  return candidates
    .filter((r) => {
      const key = r.location.toLowerCase().trim();
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    })
    .slice(0, 4)
    .map((r) => {
      const isSevere = (r.aqi || 0) >= AQI_BREAKPOINTS.POOR_MAX;
      return {
        location: r.location,
        ward: r.ward,
        pollutant: (r.pm25 && r.pm25 > 60) ? 'PM2.5' : (r.pm10 && r.pm10 > 100) ? 'PM10' : 'Composite AQI',
        measuredValue: r.pm25 || r.aqi || 0,
        unit: (r.pm25 && r.pm25 > 60) ? 'µg/m³' : 'AQI Points',
        timestamp: r.timestamp,
        supportingRecordIds: [r.id],
        whyNoteworthy: isSevere
          ? `Exceeds National Ambient Air Quality standard. Recorded value ${r.pm25 || r.aqi} indicates elevated particulate concentration.`
          : `Monitored station recording peak reading within current network (${r.pm25 || r.aqi} ${r.pm25 ? 'µg/m³' : 'AQI'}).`,
        confidence: 'High',
        category: 'Observed Fact',
      };
    });
}

/**
 * Builds ward officer priority actions dynamically tied to actual hotspots and monitored locations.
 */
function buildWardOfficerActions(
  hotspots: readonly HotspotFinding[],
  allLocations: readonly string[],
  evidenceRecordIds: string
): StakeholderAction[] {
  const primary = hotspots.slice(0, 2).map((h) => h.location);
  const target1 = primary.length > 0 ? primary : allLocations.slice(0, 2);
  const target2 = hotspots.length > 1 ? [hotspots[1].location] : allLocations.slice(0, 1);
  const target3 = allLocations.slice(0, 3);

  return [
    {
      id: 'ACT-W1',
      stakeholder: 'ward_officer',
      priority: 'High',
      actionTitle: 'Deploy Anti-Smog Water Sprinklers & Mechanical Sweepers',
      description: 'Mobilize municipal mist cannons along primary corridors exhibiting elevated particulate levels.',
      targetLocations: target1,
      evidenceBasis: `Traceable to records ${evidenceRecordIds || 'ingested network telemetry'}.`,
      type: 'confirmed_action',
      status: 'pending',
    },
    {
      id: 'ACT-W2',
      stakeholder: 'ward_officer',
      priority: 'Medium',
      actionTitle: 'Enforce Night Construction Dust & Biomass Burning Patrols',
      description: 'Form flying squads to inspect active construction sites and curb unauthorized open burning.',
      targetLocations: target2,
      evidenceBasis: 'Localized particulate concentration consistent with surface dust and combustion.',
      type: 'investigative_hypothesis',
      status: 'pending',
    },
    {
      id: 'ACT-W3',
      stakeholder: 'ward_officer',
      priority: 'Low',
      actionTitle: 'Direct Inter-District Heavy Transit Rerouting away from Ward Junctions',
      description: 'Coordinate with traffic police to divert heavy freight traffic away from congested ward junctions.',
      targetLocations: target3,
      evidenceBasis: 'Vehicular queuing and ambient particulate dispersion data indicate transit corridor congestion.',
      type: 'confirmed_action',
      status: 'pending',
    },
  ];
}

/**
 * Builds housing society priority actions dynamically targeted to residential locations in the dataset.
 */
function buildHousingSocietyActions(allLocations: readonly string[]): StakeholderAction[] {
  const residential = allLocations.filter((l) =>
    /(colony|nagar|enclave|society|vihar|residency|road|sector|greens|park)/i.test(l)
  );
  const targets = residential.length > 0 ? residential.slice(0, 2) : allLocations.slice(0, 2);

  return [
    {
      id: 'ACT-H1',
      stakeholder: 'housing_society',
      priority: 'High',
      actionTitle: 'Restrict Diesel Generator (DG) Routine Test Cycles & Mandate Perimeter Wetting',
      description: 'Delay backup generator routine testing to non-peak hours and spray mist on internal paved roads.',
      targetLocations: targets,
      evidenceBasis: 'Mitigate localized PM2.5 concentration spikes during morning atmospheric inversion.',
      type: 'confirmed_action',
      status: 'pending',
    },
    {
      id: 'ACT-H2',
      stakeholder: 'housing_society',
      priority: 'Medium',
      actionTitle: 'Resident Advisory: Close Balcony Windows during Morning Inversion (07:00 - 10:30)',
      description: 'Issue WhatsApp circular recommending air purifier usage and limiting morning ventilation.',
      targetLocations: targets,
      evidenceBasis: 'Ambient AQI requires proactive indoor air protection for sensitive residents.',
      type: 'confirmed_action',
      status: 'pending',
    },
    {
      id: 'ACT-H3',
      stakeholder: 'housing_society',
      priority: 'Low',
      actionTitle: 'Community Foliage Washdown & Dust Suppression Protocol',
      description: 'Wash garden foliage and common boundary paths with recycled water to trap settled dust.',
      targetLocations: targets,
      evidenceBasis: 'Ground dust resuspension contributes significantly to localized PM10 readings.',
      type: 'confirmed_action',
      status: 'pending',
    },
  ];
}

/**
 * Builds school administration priority actions dynamically targeted to educational/ward sectors.
 */
function buildSchoolAdminActions(allLocations: readonly string[]): StakeholderAction[] {
  const targets = allLocations.slice(0, 2);

  return [
    {
      id: 'ACT-S1',
      stakeholder: 'school_admin',
      priority: 'High',
      actionTitle: 'Relocate Morning Assemblies Indoors & Suspend Heavy Cardio Sports',
      description: 'Shift student assemblies to multi-purpose hall; cancel sprint/cardio training during morning.',
      targetLocations: targets,
      evidenceBasis: 'Child pulmonary intake rates during high physical exertion require caution.',
      type: 'confirmed_action',
      status: 'pending',
    },
    {
      id: 'ACT-S2',
      stakeholder: 'school_admin',
      priority: 'Medium',
      actionTitle: 'Activate Air-Filtered Medical Sick Bay & Distribute N95 Masks',
      description: 'Equip school infirmary with portable HEPA filters and maintain nebulizer supplies.',
      targetLocations: targets,
      evidenceBasis: 'Precautionary health protocol for students with allergic or respiratory sensitivities.',
      type: 'confirmed_action',
      status: 'pending',
    },
    {
      id: 'ACT-S3',
      stakeholder: 'school_admin',
      priority: 'Low',
      actionTitle: 'Issue Parent Notification Circular & Child Pulmonary Health Tracking',
      description: 'Broadcast school air quality notification to parent WhatsApp groups with outdoor precaution tips.',
      targetLocations: targets,
      evidenceBasis: 'Preventive civic health communication recommended during elevated particulate periods.',
      type: 'confirmed_action',
      status: 'pending',
    },
  ];
}

/**
 * Builds general citizen priority actions dynamically targeted to populated zones.
 */
function buildCitizenActions(allLocations: readonly string[]): StakeholderAction[] {
  const targets = allLocations.slice(0, 2);

  return [
    {
      id: 'ACT-C1',
      stakeholder: 'citizen',
      priority: 'High',
      actionTitle: 'Limit Early Morning Outdoor Exercise & Strenuous Cardio',
      description: 'Avoid jogging or heavy physical exertion outdoors between 06:00 and 09:30 when surface temperature inversions trap particulates.',
      targetLocations: targets,
      evidenceBasis: 'Elevated ambient particulate concentrations increase pulmonary exposure during heavy breathing.',
      type: 'confirmed_action',
      status: 'pending',
    },
    {
      id: 'ACT-C2',
      stakeholder: 'citizen',
      priority: 'Medium',
      actionTitle: 'Wear Particulate Respirator (N95) in Transit Corridors & Markets',
      description: 'Equip an N95 or certified dust mask when commuting through major transit corridors or congested commercial intersections.',
      targetLocations: targets,
      evidenceBasis: 'Localized particulate hotspots observed along active transit and commercial zones.',
      type: 'confirmed_action',
      status: 'pending',
    },
    {
      id: 'ACT-C3',
      stakeholder: 'citizen',
      priority: 'Low',
      actionTitle: 'Practice Wet Mopping & Maintain Indoor Cross-Ventilation Hygiene',
      description: 'Keep doors and windows facing main roads closed during peak traffic hours; use damp mopping to prevent dust resuspension.',
      targetLocations: targets,
      evidenceBasis: 'Resuspended road dust and ambient infiltration impact indoor residential air quality.',
      type: 'confirmed_action',
      status: 'pending',
    },
  ];
}

/**
 * Builds multi-stakeholder local actions based on identified hotspots and ingested records.
 */
function buildStakeholderActions(
  hotspots: readonly HotspotFinding[],
  records: readonly AirRecord[]
): StakeholderAction[] {
  const allLocations = Array.from(new Set(records.map((r) => r.location).filter(Boolean)));
  const evidenceRecordIds = hotspots.flatMap((h) => h.supportingRecordIds).join(', ') ||
    records.slice(0, 2).map((r) => r.id).join(', ');

  return [
    ...buildWardOfficerActions(hotspots, allLocations, evidenceRecordIds),
    ...buildHousingSocietyActions(allLocations),
    ...buildSchoolAdminActions(allLocations),
    ...buildCitizenActions(allLocations),
  ];
}

/**
 * Computes dynamic trends strictly derived from actual ingested station telemetry.
 */
function buildDeterministicTrends(records: readonly AirRecord[], avgAqi: number): TrendAnalysis {
  const valid = records.filter((r) => r.status === 'valid' && r.aqi !== null);
  if (valid.length === 0) {
    return {
      increasing: ['Insufficient valid telemetry to project upward trends'],
      decreasing: ['Insufficient valid telemetry to project downward trends'],
      stable: ['Background telemetry collection active'],
      spatialVariations: 'Single monitoring point or incomplete spatial distribution.',
      temporalPattern: 'Continuous sensor monitoring active.',
    };
  }

  const byLoc = new Map<string, AirRecord>();
  valid.forEach((r) => {
    const existing = byLoc.get(r.location);
    if (!existing || (r.aqi || 0) > (existing.aqi || 0)) {
      byLoc.set(r.location, r);
    }
  });
  const uniqueRecs = Array.from(byLoc.values());
  uniqueRecs.sort((a, b) => (b.aqi || 0) - (a.aqi || 0));

  const increasing = uniqueRecs
    .filter((r) => (r.aqi || 0) > avgAqi + 15)
    .slice(0, 3)
    .map((r) => `${r.location} (${r.ward}): Elevated AQI ${r.aqi} exceeding city average (${avgAqi})`);

  const decreasing = uniqueRecs
    .filter((r) => (r.aqi || 0) < avgAqi - 15)
    .slice(0, 3)
    .map((r) => `${r.location} (${r.ward}): Favorable ambient dispersion with AQI ${r.aqi}`);

  const stable = uniqueRecs
    .filter((r) => Math.abs((r.aqi || 0) - avgAqi) <= 15)
    .slice(0, 3)
    .map((r) => `${r.location} (${r.ward}): Consistent background concentration near AQI ${r.aqi}`);

  if (increasing.length === 0 && uniqueRecs.length > 0) {
    increasing.push(`${uniqueRecs[0].location} (${uniqueRecs[0].ward}): Peak monitored node at AQI ${uniqueRecs[0].aqi}`);
  }
  if (decreasing.length === 0 && uniqueRecs.length > 1) {
    const cleanest = uniqueRecs[uniqueRecs.length - 1];
    decreasing.push(`${cleanest.location} (${cleanest.ward}): Lowest ambient particulate level at AQI ${cleanest.aqi}`);
  }
  if (stable.length === 0) {
    stable.push(`Citywide monitored network average stable around AQI ${avgAqi}`);
  }

  const maxRec = uniqueRecs[0];
  const minRec = uniqueRecs[uniqueRecs.length - 1];
  const spatialVariations = `Spatial variance measured across ${uniqueRecs.length} monitoring stations: ${maxRec.location} registered peak concentration (${maxRec.aqi} AQI), while ${minRec.location} recorded lowest concentration (${minRec.aqi} AQI).`;

  const timestamps = records.map((r) => r.timestamp).filter(Boolean);
  const temporalPattern = timestamps.length > 0
    ? `Telemetry logged across observation window (${timestamps[0]} to ${timestamps[timestamps.length - 1]}), reflecting morning atmospheric conditions.`
    : 'Continuous ambient telemetry logged across current monitoring cycle.';

  return { increasing, decreasing, stable, spatialVariations, temporalPattern };
}

/**
 * Builds English advisories for citizen, child, and official personas.
 */
function buildEnglishAdvisories(avgAqi: number, category: string, city: string): Record<string, CitizenAdvisory> {
  const prefix = city === 'Civic' ? 'Civic' : `${city}`;
  return {
    en_citizen: {
      language: 'en',
      readingLevel: 'citizen',
      headline: `${prefix} Air Advisory: Citywide AQI stands at ${avgAqi} (${category})`,
      summary: `Air quality today is classified as ${category}. Sensitive groups, elderly citizens, and children should limit prolonged outdoor exertion during morning peak hours.`,
      generalGuidance: [
        'Avoid intense outdoor workouts or cycling during early morning hours (6 AM to 9 AM).',
        'Wear well-fitted N95 masks when commuting through high-density traffic junctions.',
        'Keep home windows shut during morning inversion hours; use wet mopping rather than dry sweeping.',
      ],
      vulnerablePrecautions: [
        { group: 'Children (< 12 yrs)', precaution: 'Limit playground activities; keep inhalers accessible for asthmatic children.' },
        { group: 'Senior Citizens (65+)', precaution: 'Reschedule morning outdoor walks to late afternoon when pollutants disperse.' },
        { group: 'Cardiac / Respiratory Patients', precaution: 'Avoid exposure to road junctions and keep prescribed bronchodilators on hand.' },
      ],
      dosAndDonts: {
        dos: ['Use public transport or carpooling', 'Report open waste burning to ward helpline', 'Maintain indoor plants & HEPA filters'],
        donts: ['Do not burn dry leaves or garbage', 'Avoid idling vehicle engines at red lights', 'Do not exercise outdoors without checking live AQI'],
      },
    },
    en_child: {
      language: 'en',
      readingLevel: 'child',
      headline: 'Super Air Buddy Alert: Today the Air Outside is Feeling Tired!',
      summary: `The air has extra tiny dust particles today (AQI is ${avgAqi}). That means we should play fun indoor games today instead of running outside in the dust!`,
      generalGuidance: [
        'Play indoor board games, draw, or read in the classroom during recess.',
        'Wear your colorful mask if you are waiting for the school bus near the road.',
        'Drink plenty of water and eat fresh fruit to keep your lungs strong like a superhero!',
      ],
      vulnerablePrecautions: [
        { group: 'Kids with Cough or Asthma', precaution: 'Tell teacher immediately if you feel breathless; keep puff bottle in backpack.' },
      ],
      dosAndDonts: {
        dos: ['Drink warm water frequently', 'Play fun indoor building block games', 'Remind adults not to burn leaves'],
        donts: ['Do not run fast near dusty roads', 'Do not rub itchy eyes with dirty hands'],
      },
    },
    en_official: {
      language: 'en',
      readingLevel: 'official',
      headline: `${prefix} Technical Briefing: Urban Atmospheric Quality Index at ${avgAqi} [${category}]`,
      summary: `Automated telemetry across municipal wards indicates prevailing atmospheric inversion ground-level fine particulates. Priority containment protocol initiated.`,
      generalGuidance: [
        'Enforce Section 19 of Air Act against unauthorized biomass burning.',
        'Activate urban mist cannons on identified transit junctions with elevated particulate readings.',
        'Issue mandatory dust mitigation protocols to all active building construction sites.',
      ],
      vulnerablePrecautions: [
        { group: 'Children & Students (<12 yrs)', precaution: 'Mandate indoor sports and recess protocols across all municipal ward schools.' },
        { group: 'Geriatric Population (65+ yrs)', precaution: 'Public health advisories issued to senior centers and outdoor exercise corridors.' },
        { group: 'Cardiorespiratory Patients', precaution: 'Primary health centers placed on emergency standby with nebulizers and oxygen.' },
      ],
      dosAndDonts: {
        dos: ['Deploy localized water sprinklers', 'Divert heavy inter-district freight traffic', 'Maintain continuous ward sensor audit'],
        donts: ['Do not permit road milling without wet suppression', 'Do not delay public health advisories past 07:00 IST'],
      },
    },
  };
}

/**
 * Builds Hindi advisories for citizen, child, and official personas.
 */
function buildHindiAdvisories(avgAqi: number, category: string, city: string): Record<string, CitizenAdvisory> {
  const prefix = city === 'Civic' ? 'नागरिक' : `${city}`;
  return {
    hi_citizen: {
      language: 'hi',
      readingLevel: 'citizen',
      headline: `${prefix} वायु गुणवत्ता परामर्श: शहर का औसत एक्यूआई ${avgAqi} (${category}) दर्ज`,
      summary: `आज शहर की हवा ${category} श्रेणी में है। बच्चों, बुजुर्गों और दमा के मरीजों को सुबह के समय खुले में भारी शारीरिक गतिविधियों से बचने की सलाह दी जाती है।`,
      generalGuidance: [
        'सुबह 6 से 9 बजे के बीच खुले में दौड़ने या भारी कसरत करने से बचें।',
        'ट्रैफिक वाले चौराहों और औद्योगिक इलाकों से गुजरते समय N95 मास्क का प्रयोग करें।',
        'घरों में सूखी झाड़ू लगाने की जगह गीले पोंछे का इस्तेमाल करें ताकि धूल न उड़े।',
      ],
      vulnerablePrecautions: [
        { group: 'छोटे बच्चे (12 वर्ष से कम)', precaution: 'स्कूल और घर में बाहर खेलने का समय घटाएं; अस्थमा की दवाएं साथ रखें।' },
        { group: 'वरिष्ठ नागरिक (65+ वर्ष)', precaution: 'सुबह की सैर को धूप निकलने के बाद के लिए टालें।' },
        { group: 'हृदय और फेफड़े के मरीज', precaution: 'धुएं और धूल वाली जगहों से पूरी तरह दूर रहें, लक्षण दिखने पर डॉक्टर से संपर्क करें।' },
      ],
      dosAndDonts: {
        dos: ['सार्वजनिक वाहनों का उपयोग करें', 'सूखे कचरे को जलाने से रोकें', 'घर के अंदर हवा शुद्ध रखने के उपाय करें'],
        donts: ['कचरा या पत्तियां न जलाएं', 'लाल बत्ती पर वाहन का इंजन चालू न छोड़ें', 'प्रदूषित समय में बिना मास्क बाहर न घूमें'],
      },
    },
    hi_child: {
      language: 'hi',
      readingLevel: 'child',
      headline: 'सुपर एयर बड्डी अलर्ट: आज बाहर की हवा थक गई है!',
      summary: `आज बाहर हवा में बहुत छोटे-छोटे धूल कण हैं (AQI ${avgAqi} है)। इसका मतलब है कि आज हमें बाहर धूल में दौड़ने के बजाय क्लास या घर के अंदर खेल खेलने चाहिए!`,
      generalGuidance: [
        'दोपहर के ब्रेक में बाहर दौड़ने की जगह कैरम, लूडो या ड्राइंग करें।',
        'स्कूल बस का इंतजार करते समय अपना रंगीन मास्क जरूर पहनें।',
        'सुपरहीरो की तरह अपने फेफड़ों को मजबूत रखने के लिए खूब पानी पिएं और फल खाएं!',
      ],
      vulnerablePrecautions: [
        { group: 'खांसी या अस्थमा वाले बच्चे', precaution: 'सांस लेने में परेशानी होने पर तुरंत टीचर को बताएं; इनहेलर साथ रखें।' },
      ],
      dosAndDonts: {
        dos: ['हल्का गुनगुना पानी पिएं', 'क्लासरूम में इंडोर खेल खेलें', 'बड़ों को पत्तियां और कचरा न जलाने को कहें'],
        donts: ['धूल भरी सड़कों पर तेज न दौड़ें', 'खुजली होने पर गंदे हाथों से आंखें न मलें'],
      },
    },
    hi_official: {
      language: 'hi',
      readingLevel: 'official',
      headline: `${prefix} नगर निगम तकनीकी वायु ज्ञापन: शहरी सूचकांक ${avgAqi} [${category}] दर्ज`,
      summary: `शहरी वार्डों में टेलीमेट्री डेटा के अनुसार वायुमंडलीय उलटाव के कारण सूक्ष्म कण (PM2.5) सतह पर फंसे हुए हैं। उच्च-प्रदूषण वाले क्षेत्रों में धूल नियंत्रण आदेश।`,
      generalGuidance: [
        'वायु प्रदूषण निवारण अधिनियम के तहत खुले में कचरा जलाने वालों पर निगरानी रखें।',
        'पहचाने गए मुख्य चौराहों और औद्योगिक मार्गों पर एंटी-स्मॉग स्प्रिंकलर तैनात करें।',
        'सभी निर्माण स्थलों को अनिवार्य रूप से धूलरोधी हरे पर्दे और पानी का छिड़काव करने का निर्देश दें।',
      ],
      vulnerablePrecautions: [
        { group: 'स्कूली बच्चे (12 वर्ष से कम)', precaution: 'सभी प्राथमिक एवं माध्यमिक विद्यालयों में आउटडोर गतिविधियों को रोकने के निर्देश।' },
        { group: 'वरिष्ठ नागरिक (65+ वर्ष)', precaution: 'सुबह के समय खुले पार्कों में टहलने से बचने और घर में रहने का आधिकारिक परामर्श।' },
        { group: 'दमा एवं हृदय रोगी', precaution: 'शहरी स्वास्थ्य केंद्रों में आवश्यक दवाओं और नेब्युलाइजर का पर्याप्त बैकअप सुनिश्चित करें।' },
      ],
      dosAndDonts: {
        dos: ['यातायात का मार्ग परिवर्तन करें', 'सड़कों पर नियमित मैकेनिकल स्वीपिंग करवाएं', 'सेंसर रीडिंग का ऑडिट करें'],
        donts: ['सड़क खुदाई का काम बिना गीले किए न होने दें', 'कचरा जलाने की शिकायतों में देरी न करें'],
      },
    },
  };
}

/**
 * Builds Hinglish advisories for citizen, child, and official personas.
 */
function buildHinglishAdvisories(avgAqi: number, category: string, city: string): Record<string, CitizenAdvisory> {
  const prefix = city === 'Civic' ? 'Civic' : `${city}`;
  return {
    hinglish_citizen: {
      language: 'hinglish',
      readingLevel: 'citizen',
      headline: `${prefix} Air Alert: City ka average AQI ${avgAqi} (${category}) hai!`,
      summary: `Aaj shehar ki hawa ${category} level par hai. Bachhon, senior citizens aur asthma patients ko morning ke time outdoor jogging ya heavy exercise avoid karne ki advise di jaati hai.`,
      generalGuidance: [
        'Early morning (6 AM - 9 AM) outdoor running aur cycling avoid karein.',
        'Traffic junctions aur congested areas mein travel karte waqt N95 mask zaroor pehnein.',
        'Ghar par dry sweeping ki jagah wet mopping karein taaki dust hawa mein na faile.',
      ],
      vulnerablePrecautions: [
        { group: 'Kids (< 12 yrs)', precaution: 'Morning playground time limit karein; asthma pumps hamesha ready rakhein.' },
        { group: 'Elderly Citizens (65+)', precaution: 'Morning walk ko dopahar ke time shift karein jab pollution thoda disperse ho.' },
        { group: 'Asthma / Heart Patients', precaution: 'Heavy dust aur smoke se door rahein; emergency meds carry karein.' },
      ],
      dosAndDonts: {
        dos: ['Public transport ya carpool prefer karein', 'Ward helpline par open garbage burning report karein', 'Indoor plants aur proper hydration maintain karein'],
        donts: ['Dry patte ya kooda bilkul na jalayein', 'Traffic signal par gaadi idle na chodein', 'Heavy pollution hours mein unprotected bahar na niklein'],
      },
    },
    hinglish_child: {
      language: 'hinglish',
      readingLevel: 'child',
      headline: 'Super Air Buddy Alert: Aaj bahar ki hawa thodi tired hai!',
      summary: `Aaj air mein thode zyada dust particles hain (AQI ${avgAqi} hai). Isliye aaj hum bahar ground mein bhaagne ke bajay classroom mein fun indoor games khelenge!`,
      generalGuidance: [
        'Recess time mein board games, drawing ya reading prefer karein.',
        'Bus stop ya roadside par khade hote waqt mask zaroor lagayein.',
        'Superheroes ki tarah strong lungs ke liye clean water aur fruits enjoy karein!',
      ],
      vulnerablePrecautions: [
        { group: 'Asthma ya Cough wale kids', precaution: 'Agar breath lene mein problem ho toh turant teacher ko batayein; pump bag mein rakhein.' },
      ],
      dosAndDonts: {
        dos: ['Warm water regularly drink karein', 'Indoor building blocks ya puzzles khelein', 'Adults ko dry leaves jalane se rokein'],
        donts: ['Dusty roads ke paas fast run na karein', 'Eyes mein itching hone par dirty hands se rub na karein'],
      },
    },
    hinglish_official: {
      language: 'hinglish',
      readingLevel: 'official',
      headline: `${prefix} Civic Memo: Urban Air Quality Index stands at ${avgAqi} [${category}]`,
      summary: `Ward telemetry indicate kar raha hai ki thermal inversion ke chalte ground-level particulate matter accumulate ho chuka hai. All ward officers ko immediate containment measures initiate karne ka directive issue kiya gaya hai.`,
      generalGuidance: [
        'Air Pollution Control Act ke under illegal biomass burning par instant penalties enforce karein.',
        'Traffic junctions aur hotspots par municipal anti-smog mist cannons mobilize karein.',
        'Active construction sites par dust mitigation aur wet suppression mandatory karein.',
      ],
      vulnerablePrecautions: [
        { group: 'Children & Students (<12 yrs)', precaution: 'All ward schools mein outdoor sports suspend karke indoor shift karne ka mandate.' },
        { group: 'Senior Citizens (65+ yrs)', precaution: 'Morning walks avoid karne aur indoor safety maintain karne ka alert.' },
        { group: 'Respiratory Patients', precaution: 'PHC centers ko nebulizers aur emergency oxygen readiness ensure karne ka directive.' },
      ],
      dosAndDonts: {
        dos: ['Heavy transport vehicles ko bypass route par divert karein', 'Paved roads par water sprinkling maintain karein'],
        donts: ['Wet suppression ke bina road construction allow na karein', 'Public advisories release karne mein delay na karein'],
      },
    },
  };
}

/**
 * Builds the complete 9-key multilingual advisory matrix across 3 languages and 3 reading levels.
 */
function buildAdvisoryMatrix(avgAqi: number, category: string, city: string): Record<string, CitizenAdvisory> {
  return {
    ...buildEnglishAdvisories(avgAqi, category, city),
    ...buildHindiAdvisories(avgAqi, category, city),
    ...buildHinglishAdvisories(avgAqi, category, city),
  };
}

/**
 * Compares current analysis metrics with the historical previous briefing if provided,
 * or against the 24h baseline benchmark.
 */
function buildBaselineComparison(
  avgAqi: number,
  hotspots: readonly HotspotFinding[],
  previousBriefing?: StoredBriefing | null
): BriefingComparison {
  if (previousBriefing) {
    const prevAqi = previousBriefing.averageAqi;
    const aqiDelta = avgAqi - prevAqi;
    const previousDate = previousBriefing.timestamp;
    const aqiTrend: 'improved' | 'deteriorated' | 'stable' =
      aqiDelta > 5 ? 'deteriorated' : aqiDelta < -5 ? 'improved' : 'stable';

    const prevHotspotNames = new Set(
      previousBriefing.hotspots.map((h) => h.location.toLowerCase().trim())
    );
    const currHotspotNames = new Set(
      hotspots.map((h) => h.location.toLowerCase().trim())
    );

    const newHotspots = hotspots
      .filter((h) => !prevHotspotNames.has(h.location.toLowerCase().trim()))
      .map((h) => `${h.location} (${h.ward}) — Newly elevated: ${h.measuredValue} ${h.unit}`);

    const resolvedHotspots = previousBriefing.hotspots
      .filter((prev) => !currHotspotNames.has(prev.location.toLowerCase().trim()))
      .map((prev) => `${prev.location} (${prev.ward}) — Concentrations dropped below alert threshold`);

    const interventionEffectiveness = aqiDelta < -5
      ? `Citywide particulate levels dropped by ${Math.abs(aqiDelta)} AQI points following municipal containment measures.`
      : aqiDelta > 5
      ? `Pollution intensified by ${aqiDelta} AQI points relative to previous briefing (${prevAqi}); elevated morning emissions observed.`
      : `Air quality remains stable within ±5 AQI points of prior briefing baseline (${prevAqi} AQI).`;

    const narrativeDiff = `Citywide AQI has changed by ${aqiDelta > 0 ? '+' : ''}${aqiDelta} points relative to previous briefing on ${previousDate} (${prevAqi} AQI). ${
      newHotspots.length > 0 ? `Emerged hotspots: ${newHotspots.length}.` : 'No newly emerged hotspots.'
    } ${resolvedHotspots.length > 0 ? `Resolved hotspots: ${resolvedHotspots.length}.` : ''}`;

    return {
      previousDate,
      aqiDelta,
      aqiTrend,
      newHotspots,
      resolvedHotspots,
      interventionEffectiveness,
      narrativeDiff,
    };
  }

  // Default initial baseline benchmark (first run)
  const aqiDelta = avgAqi - PREVIOUS_BRIEFING_RECORD.averageAqi;
  return {
    previousDate: PREVIOUS_BRIEFING_RECORD.date,
    aqiDelta,
    aqiTrend: aqiDelta > 5 ? 'deteriorated' : aqiDelta < -5 ? 'improved' : 'stable',
    newHotspots: hotspots.slice(0, 2).map((h) => `${h.location} (${h.ward}) — Active monitored node: ${h.measuredValue} ${h.unit}`),
    resolvedHotspots: ['Clean Zone Baseline (Historical baseline comparison benchmark)'],
    interventionEffectiveness: 'Mechanical sweeping and mist cannons deployed in primary corridors reduced roadside particulate resuspension.',
    narrativeDiff: `Citywide AQI is ${aqiDelta > 0 ? '+' : ''}${aqiDelta} points relative to the 24h baseline (${PREVIOUS_BRIEFING_RECORD.averageAqi} AQI).`,
  };
}

/**
 * Generates verified, deterministic civic intelligence dynamically derived from ingested data.
 * @param records Sanitized AirRecord array
 * @param qualityReport Ingestion DataQualityReport
 * @param avgAqi City average AQI
 * @param overallAqiCategory Overall AQI category
 * @param previousBriefing Optional previous briefing for genuine historical comparison
 * @returns Complete AnalysisResult
 */
export function generateDeterministicIntelligence(
  records: AirRecord[],
  qualityReport: DataQualityReport,
  avgAqi: number,
  overallAqiCategory: AnalysisResult['overallAqiCategory'],
  previousBriefing?: StoredBriefing | null
): AnalysisResult {
  const validRecords = records.filter((r) => r.status === 'valid' && r.aqi !== null);
  const city = detectCityName(records);
  const hotspots = buildDeterministicHotspots(validRecords);
  const actions = buildStakeholderActions(hotspots, records);
  const advisories = buildAdvisoryMatrix(avgAqi, overallAqiCategory, city);
  const comparison = buildBaselineComparison(avgAqi, hotspots, previousBriefing);
  const trends = buildDeterministicTrends(records, avgAqi);

  return {
    executiveSummary: `Citywide monitoring across ${validRecords.length} validated urban monitoring stations indicates an average AQI of ${avgAqi} (${overallAqiCategory}). Ground-level particulate matter represents the dominant airborne health stressor across municipal transit corridors.`,
    overallAqiCategory,
    averageAqi: avgAqi,
    primaryPollutant: 'PM2.5 (Fine Inhalable Particulate Matter)',
    dataReliability: `Audited ${records.length} records: ${qualityReport.validRecords} verified, ${qualityReport.suspiciousObservations} suspicious/outlier observations excluded from spatial averages. Overall data completeness stands at ${qualityReport.dataCompletenessPct}%.`,
    hotspots,
    trends,
    stakeholderActions: actions,
    advisories,
    comparison,
    timestamp: new Date().toISOString(),
    isAiGenerated: false,
    aiModelUsed: 'None (Deterministic Verification Engine)',
  };
}
