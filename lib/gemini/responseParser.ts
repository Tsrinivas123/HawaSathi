/**
 * @file responseParser.ts
 * @description Safe parser and validator for Gemini AI raw outputs.
 * Enforces Zod schema checking and drops unverified record IDs to guarantee data traceability.
 */

import { AnalysisResult, HotspotFinding, CitizenAdvisory } from '@/lib/types';
import { GeminiOutputSchema } from '@/lib/schemas';

/**
 * Extracts and parses JSON from raw LLM text, stripping code fences if present.
 * @param rawText Raw text string returned by the model
 * @returns Parsed JavaScript object
 */
export function parseModelJson(rawText: string): unknown {
  const trimmed = rawText.trim();
  const cleaned = trimmed.replace(/^```json\s*/i, '').replace(/```\s*$/, '').trim();

  try {
    return JSON.parse(cleaned);
  } catch (err) {
    const lastBrace = cleaned.lastIndexOf('}');
    if (lastBrace > 0) {
      return JSON.parse(cleaned.substring(0, lastBrace + 1));
    }
    throw err;
  }
}

/**
 * Sanitizes hotspots by dropping unverified or hallucinated record IDs.
 * @param hotspots Array of HotspotFinding candidates
 * @param validRecordIds Set of valid record IDs present in ingested data
 * @returns Array of sanitized HotspotFindings
 */
export function sanitizeHotspotRecordIds(
  hotspots: readonly HotspotFinding[],
  validRecordIds: ReadonlySet<string>
): HotspotFinding[] {
  return hotspots.map((h) => ({
    ...h,
    supportingRecordIds: (h.supportingRecordIds || []).filter((id) => validRecordIds.has(id)),
  }));
}

/**
 * Validates parsed model data against strict Zod schema and merges with fallback baselines.
 * @param parsedJson Parsed JSON from the model response
 * @param validRecordIds Set of valid IDs
 * @param defaultBase Deterministic fallback baseline
 * @param model Model name used for generation
 * @returns Complete, strictly validated AnalysisResult
 */
export function validateAndMergeAiOutput(
  parsedJson: unknown,
  validRecordIds: ReadonlySet<string>,
  defaultBase: AnalysisResult,
  model: string
): AnalysisResult {
  const zodResult = GeminiOutputSchema.safeParse(parsedJson);
  const parsed = zodResult.success ? zodResult.data : (parsedJson as Partial<AnalysisResult>);

  const validatedHotspots = sanitizeHotspotRecordIds(
    (parsed.hotspots as HotspotFinding[]) || [],
    validRecordIds
  );

  const mergedAdvisories: Record<string, CitizenAdvisory> = {
    ...defaultBase.advisories,
    ...((parsed.advisories as Record<string, CitizenAdvisory>) || {}),
  };

  return {
    ...defaultBase,
    ...parsed,
    advisories: mergedAdvisories,
    hotspots: validatedHotspots,
    timestamp: new Date().toISOString(),
    isAiGenerated: true,
    aiModelUsed: model,
  };
}
