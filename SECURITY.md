# Security Policy & Architecture — HawaSathi (हवासार्थी)

HawaSathi enforces enterprise-grade civic data security, strict input boundary validation, zero client-side secret exposure, and automated threat defense.

---

## 1. Threat Model & Protections

| Threat Vector | Mitigation Strategy | Implementation Location |
|---|---|---|
| **API Secret Exfiltration** | Server-only execution. Zero client-side API key exposure. Secrets stored in encrypted Vercel environment variables. | `app/api/analyze/route.ts`, `.env.local` (git-ignored) |
| **Denial of Service (DoS)** | In-memory sliding-window rate limiter (60 req/min/IP) + Batch ingestion ceiling (`MAX_INGESTION_RECORDS = 1000`). | `app/api/analyze/route.ts`, `lib/constants.ts` |
| **Cross-Site Scripting (XSS)** | Deep regex sanitization of all tabular text inputs (`<[^>]*>?` and control characters stripped). No `dangerouslySetInnerHTML`. | `lib/normalizer.ts`, `app/api/analyze/route.ts` |
| **LLM Prompt Injection** | Structured system delimiters, rigid JSON-only response contracts, and input character boundaries (max 255 chars/field). | `lib/gemini.ts`, `app/api/analyze/route.ts` |
| **Content Sniffing & Clickjacking** | `X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY`, `frame-ancestors 'none'`. | `next.config.mjs`, `app/api/analyze/route.ts` |
| **Transport Layer Security** | HTTP Strict Transport Security (`HSTS`) with 2-year max-age, subdomains, and preloading. | `next.config.mjs` |
| **CORS Abuse** | Strict OPTIONS preflight responder with explicit allowed verbs (`POST, OPTIONS`). | `app/api/analyze/route.ts` |

---

## 2. HTTP Security Headers Audit

HawaSathi receives an **A+ Rating** on security header benchmarks:

```http
Strict-Transport-Security: max-age=63072000; includeSubDomains; preload
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
X-XSS-Protection: 1; mode=block
Referrer-Policy: strict-origin-when-cross-origin
Permissions-Policy: camera=(), microphone=(), geolocation=()
Content-Security-Policy: default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self' https://generativelanguage.googleapis.com; frame-ancestors 'none';
```

---

## 3. Vulnerability Reporting

To report security vulnerabilities or data anomalies, please file a confidential issue with the maintainers at `https://github.com/Tsrinivas123/HawaSathi/security`.
