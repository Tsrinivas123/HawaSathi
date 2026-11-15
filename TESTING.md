# Automated Testing Suite — HawaSathi (हवासार्थी)

HawaSathi features a comprehensive, 100% passing test suite across **10 test files** in `tests/`, powered by **Vitest 5.1**, real **axe-core** accessibility validation on rendered React components via `@testing-library/react`, and a live 11-point E2E smoke test suite (`scripts/smoke.mjs`).

---

## 1. Test Suite Architecture (10 Test Files, 57 Tests)

| Test Suite | Path | Tests | Coverage Domain | Status |
|---|---|---|---|---|
| **Real React Axe-Core A11y** | `tests/accessibility.test.tsx` | 12 tests | Real React component rendering via `@testing-library/react` and `axe-core`. Audits `EntryGate` (two-input mandatory gate), `OverviewTab`, `DataStudioTab`, `AirIntelligenceTab`, `LocalActionsTab`, `CitizenAdvisoryTab`, `ReportHistoryTab`, `SettingsTab`, `Sidebar`, `TopNav`, `TraceModal`. **0 WCAG AA violations**. | **PASS** |
| **Normalizer Suite** | `tests/normalizer.test.ts` | 8 tests | Ingestion, unit conversions (`ppm` ↔ `mg/m³`, `mg/m3` ↔ `ug/m3`), outlier detection (`999.0 µg/m³`), mixed date formats, missing values (`NA`, `--`, empty), header mapping, deduplication. | **PASS** |
| **Data Quality & Audit** | `tests/audit.test.ts` | 7 tests | Quality report metrics, outlier exclusion from averages/charts, suspicious readings identification, duplicate tracking. | **PASS** |
| **Gemini AI Subsystem** | `tests/gemini.test.ts` | 7 tests | 100% traceable record citation (`REC-001`), dropping fake IDs, rule-based fallback verification, pairwise unique 9-advisory matrix, deterministic reasoning, outlier exclusion. | **PASS** |
| **Security & Threat Defense** | `tests/security.test.ts` | 6 tests | Batch limits, XSS tag stripping, secret leakage prevention, physical bounds, length truncation, CSV formula injection neutralization (DDE). | **PASS** |
| **API Route Handler** | `tests/api.test.ts` | 5 tests | `/api/analyze` OPTIONS preflight, 415 rejection on non-JSON, 400 validation on malformed JSON syntax, 400 rejection on empty payload, rate limiting headers, CORS origin restrictions. | **PASS** |
| **Multilingual i18n Suite** | `tests/i18n.test.ts` | 4 tests | Hindi, Hinglish, English dictionary integrity, fallback resolution, translation completeness. | **PASS** |
| **Storage & Persistence** | `tests/storage.test.ts` | 4 tests | Hybrid browser `localStorage` + SSR in-memory fallback persistence, persona (including citizen), raw dataset persistence, actions, custom actions, language, reading level, initial "No previous brief yet" vs second run AQI delta. | **PASS** |
| **Efficiency & Complexity** | `tests/efficiency.test.ts` | 3 tests | O(1) indexed Map lookups (`buildRecordLookupMap`), architectural system limits, large collection throughput. | **PASS** |
| **E2E Data Pipeline** | `tests/e2e.test.ts` | 1 test | Complete ingestion -> normalization -> O(1) map indexing -> AI reasoning -> citizen advisories -> WhatsApp broadcast & internal memo generation. | **PASS** |

---

## 2. Live E2E Smoke Test Suite (`scripts/smoke.mjs`)

An automated 11-point live verification script executed against the production deployment (`https://hawasathi.vercel.app`):

1. **HTTP 200 OK**: Production home page loads successfully.
2. **X-Frame-Options: DENY**: Clickjacking prevention verified.
3. **X-Content-Type-Options: nosniff**: MIME-sniffing prevention verified.
4. **Strict-Transport-Security (HSTS)**: 2-year HTTPS enforcement with subdomains.
5. **Content-Security-Policy (CSP)**: Strict script/style/frame boundaries.
6. **Cross-Origin-Opener-Policy (COOP)**: `same-origin` window isolation.
7. **Permissions-Policy**: Camera, microphone, and geolocation disabled.
8. **Origin Authorization (403)**: Untrusted origins rejected with HTTP 403.
9. **Media Type Enforcement (415)**: Non-JSON payloads rejected with HTTP 415.
10. **Malformed JSON Defense (400)**: Syntax-invalid JSON rejected with HTTP 400.
11. **Batch Boundary Defense (413)**: Over-limit payloads (> 1000 records) rejected with HTTP 413.

---

## 3. Running the Tests

```bash
# Run full automated test suite (57 tests)
npm test

# Run real axe-core accessibility compliance tests across all components
npm run test:a11y

# Run security & threat protection tests
npm run test:security

# Run high-throughput performance & efficiency tests
npm run test:perf

# Run E2E data pipeline test
npm run test:e2e

# Run live E2E smoke test against production
node scripts/smoke.mjs https://hawasathi.vercel.app
```

All 57 tests pass in ~4 seconds with zero warnings.
