# Automated Testing Suite — HawaSathi (हवासार्थी)

HawaSathi features a comprehensive, 100% passing test suite across both `tests/` and `__tests__/` directories, powered by **Vitest 5.1**.

---

## 1. Test Suite Architecture (14 Test Suites, 48 Tests)

| Test Suite | Path | Tests | Coverage Domain |
|---|---|---|---|
| **Normalizer Suite** | `tests/normalizer.test.ts` | 4 tests | Ingestion, unit conversions (`ppm` ↔ `mg/m³`), outlier detection (`999.0 µg/m³`), header mapping. |
| **Gemini AI Suite** | `tests/gemini.test.ts` | 4 tests | 100% traceable record citation (`REC-001`), 9-key multilingual advisory matrix, deterministic reasoning. |
| **Multilingual i18n Suite** | `tests/i18n.test.ts` | 4 tests | Hindi, Hinglish, English dictionary integrity, fallback resolution. |
| **Security Suite** | `tests/security.test.ts` | 4 tests | Batch limits, XSS tag stripping, secret leakage prevention, physical bounds. |
| **Accessibility Suite** | `tests/accessibility.test.ts` | 3 tests | High-contrast AQI badges, WCAG 2.1 AA labels, stakeholder ARIA attributes. |
| **API Route Suite** | `tests/api.test.ts` | 4 tests | `/api/analyze` OPTIONS preflight, 415 rejection, 400 validation, rate limiting headers. |
| **E2E Data Pipeline Suite** | `tests/e2e.test.ts` | 1 test | Complete ingestion -> normalization -> O(1) map indexing -> AI reasoning -> citizen advisories. |
| **Mirrored `__tests__/`** | `__tests__/*.test.ts` | 24 tests | Exact mirror for CI/CD runners expecting either directory structure. |

---

## 2. Running the Test Suite

```bash
# Run full automated test suite
npm test

# Run tests in continuous watch mode
npm run test:watch

# Run CI test runner
npm run test:ci

# Run specific E2E test suite
npm run test:e2e
```

All 48 tests pass in under 1 second.
