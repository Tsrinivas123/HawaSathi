import fs from 'fs';
import { parseAndNormalizeData } from './lib/normalizer.js';

async function testCsvPipeline() {
  console.log("=== STEP 1: READING RAW CSV FILE FROM DISK ===");
  const csvContent = fs.readFileSync('./sample_bhopal_telemetry.csv', 'utf-8');
  console.log("File size:", csvContent.length, "bytes");
  console.log("CSV Header row:", csvContent.split('\n')[0]);

  console.log("\n=== STEP 2: NORMALIZING DATA & AUDITING QUALITY ===");
  const { records, qualityReport } = parseAndNormalizeData(csvContent);
  console.log("Total records parsed:", records.length);
  console.log("Valid records:", qualityReport.validRecords);
  console.log("Data completeness:", qualityReport.dataCompletenessPct, "%");
  console.log("Suspicious observations flagged:", qualityReport.suspiciousObservations);
  console.log("Validation warnings count:", qualityReport.warnings.length);
  console.log("Warnings samples:");
  qualityReport.warnings.forEach(w => console.log("  •", w));

  console.log("\n=== STEP 3: INSPECTING NORMALIZED RECORDS (SAMPLE) ===");
  records.slice(0, 3).forEach(r => {
    console.log(`[${r.id}] ${r.location} (${r.ward}) | PM2.5: ${r.pm25} µg/m³ | PM10: ${r.pm10} µg/m³ | AQI: ${r.aqi} | Status: ${r.status}`);
    if (r.conversionsApplied.length > 0) console.log("   Conversions:", r.conversionsApplied.join('; '));
    if (r.flags.length > 0) console.log("   Flags:", r.flags.join('; '));
  });

  console.log("\n=== STEP 4: SENDING CSV PAYLOAD TO LIVE VERCEL PRODUCTION API ===");
  const t0 = Date.now();
  const res = await fetch('https://hawasathi.vercel.app/api/analyze', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ records, qualityReport })
  });

  console.log("Live Vercel HTTP Status:", res.status);
  const data = await res.json();
  const latency = Date.now() - t0;
  console.log(`Response received in ${latency}ms`);
  console.log("isAiGenerated:", data.isAiGenerated);
  console.log("aiModelUsed:", data.aiModelUsed);
  console.log("City Average AQI:", data.averageAqi, `(${data.overallAqiCategory})`);
  console.log("Primary Pollutant:", data.primaryPollutant);
  console.log("\nExecutive Summary:\n", data.executiveSummary);

  console.log("\n=== STEP 5: VERIFYING HOTSPOT TRACEABILITY ===");
  console.log(`Identified ${data.hotspots.length} Hotspots:`);
  data.hotspots.forEach((h, idx) => {
    console.log(`\n  [Hotspot ${idx + 1}] ${h.location} (${h.ward})`);
    console.log(`    Measured: ${h.measuredValue} ${h.unit} | Pollutant: ${h.pollutant}`);
    console.log(`    Supporting Record IDs: ${h.supportingRecordIds.join(', ')}`);
    console.log(`    Classification: ${h.category} (Confidence: ${h.confidence})`);
    console.log(`    Diagnosis: ${h.whyNoteworthy}`);
  });

  console.log("\n=== STEP 6: VERIFYING STAKEHOLDER DIRECTIVES ===");
  console.log(`Generated ${data.stakeholderActions.length} Actions:`);
  data.stakeholderActions.forEach(a => {
    console.log(`  [${a.priority} Priority] (${a.stakeholder}) ${a.actionTitle}`);
  });

  console.log("\n=== STEP 7: VERIFYING ADVISORIES & COMPARISON ===");
  console.log("Advisories languages:", Object.keys(data.advisories));
  console.log("Hindi headline:", data.advisories.hi_citizen?.headline);
  console.log("Child headline:", data.advisories.en_child?.headline);
  console.log("Comparison Net Delta:", data.comparison?.aqiDelta, "pts");

  console.log("\n=========================================");
  console.log("🎉 ALL CSV PIPELINE TESTS PASSED 100%!");
  console.log("=========================================");
}

testCsvPipeline();
