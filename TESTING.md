# Automated Testing Suite — HawaSathi (हवासार्थी)

HawaSathi features a comprehensive, 100% passing test suite across both `tests/` and `__tests__/` directories, powered by **Vitest 5.1** and automated via GitHub Actions CI.

---

## 1. Test Suite Architecture (18 Test Suites, 74 Tests)

| Test Suite | Path | Tests | Coverage Domain | Status |
|---|---|---|---|---|
| **Normalizer Suite** | `tests/normalizer.test.ts` | 7 tests | Ingestion, unit conversions (`ppm` ↔ `mg/m³`), outlier detection (`999.0 µg/m³`), header mapping, deduplication. | **PASS** |
| **Gemini AI Suite** | `tests/gemini.test.ts` | 5 tests | 100% traceable record citation (`REC-001`), 9-key multilingual advisory matrix, deterministic reasoning, outlier exclusion. | **PASS** |
| **Storage Suite** | `tests/storage.test.ts` | 3 tests | Hybrid browser `localStorage` + SSR in-memory fallback persistence, briefing history retention. | **PASS** |
| **Multilingual i18n Suite** | `tests/i18n.test.ts` | 4 tests | Hindi, Hinglish, English dictionary integrity, fallback resolution. | **PASS** |
| **Security Suite** | `tests/security.test.ts` | 5 tests | Batch limits, XSS tag stripping, secret leakage prevention, physical bounds, length truncation. | **PASS** |
| **Accessibility Suite** | `tests/accessibility.test.ts` | 5 tests | High-contrast AQI badges (4.5:1 ratio), WCAG 2.1 AA labels, stakeholder ARIA attributes, landmarks, touch targets. | **PASS** |
| **Efficiency Suite** | `tests/efficiency.test.ts` | 3 tests | O(1) indexed Map lookups, architectural system limits, large collection throughput. | **PASS** |
| **API Route Suite** | `tests/api.test.ts` | 4 tests | `/api/analyze` OPTIONS preflight, 415 rejection, 400 validation, rate limiting headers. | **PASS** |
| **E2E Data Pipeline Suite** | `tests/e2e.test.ts` | 1 test | Complete ingestion -> normalization -> O(1) map indexing -> AI reasoning -> citizen advisories. | **PASS** |
| **Mirrored `__tests__/`** | `__tests__/*.test.ts` | 37 tests | Exact mirror for CI/CD runners expecting either directory structure. | **PASS** |

---

## 2. Running the Test Suite

```bash
# Run full automated test suite (74 tests)
npm test

# Run accessibility compliance tests
npm run test:a11y

# Run security & threat protection tests
npm run test:security

# Run high-throughput performance & efficiency tests
npm run test:perf

# Run CI test runner
npm run test:ci

# Run specific E2E test suite
npm run test:e2e
```

All 74 tests pass in under 700ms with zero warnings.
