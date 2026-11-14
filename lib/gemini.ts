/**
 * @file gemini.ts
 * @description Gemini AI client orchestrator for HawaSathi Civic Environmental Intelligence.
 * Coordinates prompt generation, resilient model cascading, schema validation, and fallback generation.
 */

import { AirRecord, DataQualityReport, AnalysisResult } from './types';
import { getAqiCategory } from './utils';
import { AI_CONSTANTS, SYSTEM_LIMITS } from './constants';
import { buildCivicIntelligencePrompt } from './gemini/promptBuilder';
import { parseModelJson, validateAndMergeAiOutput } from './gemini/responseParser';
import { generateDeterministicIntelligence } from './gemini/fallbackGenerator';

export { generateDeterministicIntelligence };

/**
 * Calculates city average AQI and category strictly excluding outliers.
 */
function computeIngestionSummary(records: readonly AirRecord[]): {
  validRecords: AirRecord[];
  avgAqi: number;
  overallAqiCategory: AnalysisResult['overallAqiCategory'];
  validRecordIds: Set<string>;
} {
  const validRecords = records.filter((r) => r.status === 'valid' && r.aqi !== null);
  const avgAqi = validRecords.length > 0
    ? Math.round(validRecords.reduce((acc, r) => acc + (r.aqi || 0), 0) / validRecords.length)
    : SYSTEM_LIMITS.BASELINE_HISTORICAL_AQI;

  const rawCat = getAqiCategory(avgAqi);
  const overallAqiCategory = rawCat === 'Unknown' ? 'Moderate' : (rawCat as AnalysisResult['overallAqiCategory']);
  const validRecordIds = new Set(validRecords.map((r) => r.id));

  return { validRecords, avgAqi, overallAqiCategory, validRecordIds };
}

/**
 * Executes a single HTTP request to Gemini API with an isolated timeout signal.
 */
async function callGeminiApi(
  model: string,
  apiKey: string,
  prompt: string,
  parentSignal?: AbortSignal
): Promise<Response> {
  const timeoutController = new AbortController();
  const timeoutId = setTimeout(() => timeoutController.abort(), AI_CONSTANTS.DEFAULT_TIMEOUT_MS);
  const effectiveSignal = parentSignal || timeoutController.signal;

  try {
    return await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: effectiveSignal,
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: AI_CONSTANTS.TEMPERATURE,
            maxOutputTokens: AI_CONSTANTS.MAX_OUTPUT_TOKENS,
            responseMimeType: 'application/json',
          },
        }),
      }
    );
  } finally {
    clearTimeout(timeoutId);
  }
}

/**
 * Attempts AI generation through cascaded models, returning null on total network/model failure.
 */
async function tryCascadedModels(
  models: readonly string[],
  apiKey: string,
  prompt: string,
  validRecordIds: ReadonlySet<string>,
  fallbackBase: AnalysisResult,
  parentSignal?: AbortSignal
): Promise<AnalysisResult | null> {
  for (const model of models) {
    try {
      const response = await callGeminiApi(model, apiKey, prompt, parentSignal);
      if (!response.ok) continue;

      const data = await response.json();
      const rawContent = data.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!rawContent) continue;

      const parsedJson = parseModelJson(rawContent);
      return validateAndMergeAiOutput(parsedJson, validRecordIds, fallbackBase, model);
    } catch {
      // Continue to next cascaded model candidate
    }
  }
  return null;
}

/**
 * Main entry point: Runs civic air quality intelligence analysis via Gemini AI or deterministic fallback.
 * @param records Sanitized AirRecord array
 * @param qualityReport DataQualityReport audit
 * @param parentSignal Optional AbortSignal for user cancellation
 * @returns Fully populated, validated AnalysisResult
 */
export async function runCivicAirIntelligence(
  records: AirRecord[],
  qualityReport: DataQualityReport,
  parentSignal?: AbortSignal
): Promise<AnalysisResult> {
  const apiKey = process.env.GEMINI_API_KEY || '';
  const { validRecords, avgAqi, overallAqiCategory, validRecordIds } = computeIngestionSummary(records);
  const fallback = generateDeterministicIntelligence(records, qualityReport, avgAqi, overallAqiCategory);

  if (!apiKey || validRecords.length === 0) {
    return fallback;
  }

  const prompt = buildCivicIntelligencePrompt(records, qualityReport, avgAqi, overallAqiCategory);
  const aiResult = await tryCascadedModels(
    AI_CONSTANTS.GEMINI_MODELS,
    apiKey,
    prompt,
    validRecordIds,
    fallback,
    parentSignal
  );

  return aiResult || fallback;
}
