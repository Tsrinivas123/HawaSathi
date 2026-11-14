# Security Policy & Architecture — HawaSathi (हवासार्थी)

HawaSathi enforces enterprise-grade civic data security, strict input boundary validation, zero client-side secret exposure, and automated threat defense.

---

## 1. Threat Model & Protections

| Threat Vector | Mitigation Strategy | Implementation Location |
|---|---|---|
| **API Secret Exfiltration** | Server-only execution. Zero client-side API key exposure. Secrets stored in encrypted Vercel environment variables. | `app/api/analyze/route.ts`, `.env.local` (git-ignored) |
| **Denial of Service (DoS)** | In-memory sliding-window rate limiter (60 req/min/IP) with Map size capping (max 500) and automatic expired entry eviction. Batch ingestion ceiling (`MAX_INGESTION_RECORDS = 1000`). | `app/api/analyze/route.ts`, `lib/constants.ts` |
| **IP Spoofing** | Client IP derived safely via Vercel's trusted headers (`x-real-ip`, `x-vercel-proxied-for`) before falling back to `x-forwarded-for`. | `app/api/analyze/route.ts` |
| **Cross-Site Scripting (XSS)** | Deep regex sanitization of all tabular text inputs (`<[^>]*>?` and control characters stripped). No `dangerouslySetInnerHTML`. | `lib/normalizer.ts`, `app/api/analyze/route.ts` |
| **CSV Formula Injection (DDE)** | All text and data exports neutralize formula triggers (`=`, `+`, `-`, `@`, `\t`, `\r`) by escaping with single quote prefixes. | `lib/utils.ts`, `components/CitizenAdvisoryTab.tsx` |
| **LLM Prompt Injection** | Structured system delimiters (`<untrusted_telemetry_data>`), explicit instructions commanding literal data interpretation, and strict Zod runtime schema validation (`GeminiOutputSchema`). | `lib/gemini.ts`, `app/api/analyze/route.ts` |
| **Unknown Record IDs** | Hotspot supporting record IDs are validated against genuine ingested records; fabricated or hallucinated IDs are dropped. | `lib/gemini.ts` |
| **Malicious File Uploads** | Client-side file validation enforcing `.csv` and `.txt` extensions, 2 MB max size, binary content rejection (null bytes), and 1,000 max row boundary. | `components/DataStudioTab.tsx` |
| **CORS Abuse & Origin Forgery** | Origin and Referer validation restricting CORS preflight and POST requests to authorized application domains (rejection with 403 Forbidden). | `app/api/analyze/route.ts` |
| **Payload Flooding** | Request body size strictly capped via `Content-Length` boundary checks (max 1 MB). | `app/api/analyze/route.ts`, `lib/constants.ts` |
| **Content Sniffing & Clickjacking** | `X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY`, `frame-ancestors 'none'`. | `next.config.mjs`, `app/api/analyze/route.ts` |
| **Transport Layer Security** | HTTP Strict Transport Security (`HSTS`) with 2-year max-age, subdomains, and preloading. | `next.config.mjs` |

---

## 2. HTTP Security Headers Specification

HawaSathi enforces comprehensive security headers across all edge and API routes with `'unsafe-eval'` strictly eliminated:

```http
Strict-Transport-Security: max-age=63072000; includeSubDomains; preload
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
X-XSS-Protection: 1; mode=block
Referrer-Policy: strict-origin-when-cross-origin
Permissions-Policy: camera=(), microphone=(), geolocation=()
Content-Security-Policy: default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self' https://generativelanguage.googleapis.com; frame-ancestors 'none';
```

---

## 3. Safe Error Handling & Confidentiality

- **Zero Information Leakage**: Server errors return generic, user-safe error messages with no internal stack traces, database schema, or server paths.
- **Audit-Verified Git History**: Git history contains zero committed API keys (`AIza...`) or sensitive `.env` files.
- **Serverless Resilience**: In-memory rate limiting and caching is thoroughly documented for ephemeral container lifecycles with an external Redis expansion path.

---

## 4. Vulnerability Reporting

To report security vulnerabilities or data anomalies, please file a confidential issue with the maintainers at `https://github.com/Tsrinivas123/HawaSathi/security`.
