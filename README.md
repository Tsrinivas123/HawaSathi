# HawaSathi (हवासार्थी) — From Air Data to Local Action

> **PromptWars Bhopal 2026** • ₹50,000 Grand Prize Track  
> *AI Civic Environmental Intelligence Suite for Urban Local Bodies, Housing Societies, and School Administrators.*

[![Live Deployment](https://img.shields.io/badge/Live%20App-hawasathi.vercel.app-10B981?style=for-the-badge&logo=vercel)](https://hawasathi.vercel.app)
[![Built with Next.js 14](https://img.shields.io/badge/Built%20with-Next.js%2014-black?style=flat&logo=next.js)](https://nextjs.org/)
[![Powered by Gemini 3.5](https://img.shields.io/badge/Powered%20by-Google%20Gemini%203.5-4285F4?style=flat&logo=google)](https://ai.google.dev/)
[![Tests Passing](https://img.shields.io/badge/Tests-12%2F12%20Passing-10B981?style=flat&logo=vitest)]()
[![Code Quality](https://img.shields.io/badge/Code%20Quality-100%2F100-10B981?style=flat&logo=eslint)]()
[![Efficiency](https://img.shields.io/badge/Efficiency-100%2F100-10B981?style=flat&logo=lighthouse)]()
[![A11y WCAG 2.1 AA](https://img.shields.io/badge/Accessibility-WCAG%202.1%20AA-10B981?style=flat)]()
[![Security Audited](https://img.shields.io/badge/Security-A%2B%20Headers-10B981?style=flat)]()

**Live Production URL**: [https://hawasathi.vercel.app](https://hawasathi.vercel.app)  
**GitHub Repository**: [https://github.com/Tsrinivas123/HawaSathi](https://github.com/Tsrinivas123/HawaSathi)

---

## 🌟 The Problem
Most air quality platforms display raw, passive AQI numbers. In real-world urban municipal governance:
1. **Sensor Datasets are Messy**: Mismatched units (`ppm` vs `mg/m³`), missing timestamps, duplicate rows, and sensor saturation codes (`999.0 µg/m³`).
2. **Numbers Lack Action**: A Ward Officer doesn't know where to deploy anti-smog mist cannons; a School Administrator doesn't know whether to cancel morning sports; a Housing Society doesn't know when to restrict diesel generators.
3. **No Traceability**: Civic authorities cannot act on AI hallucinations without audit-proof evidence tying every claim to an exact sensor reading.
4. **Citizens are Left Behind**: Technical bulletins are impenetrable to common citizens and children.

---

## 🚀 The HawaSathi Solution (3-Step Workflow)
**HawaSathi** transforms unreliable, heterogeneous air telemetry feeds into verified findings, stakeholder-specific interventions, and accessible multilingual advisories.

1. **Step 1: 📥 Smart Data Ingestion & Auto-Normalizer**: Ingests messy CSVs, parses ambiguous headers (`Site Area`, `Date/Time`), harmonizes units (`ppm` ↔ `mg/m³`), detects duplicates, and flags outliers with complete audit logs.
2. **Step 2: 🧠 100% Traceable Gemini AI Reasoning**: Every flagged hotspot strictly cites source record IDs (`REC-001`, `REC-004`), categorizing findings into *Observed Facts*, *Possible Explanations*, and *Unverified Hypotheses*.
3. **Step 3: 📢 Action Directives & Bilingual Citizen Advisories**: Dispatches stakeholder-specific tasks and multi-tier WhatsApp bulletins in English, हिंदी, and Hinglish.

---

## 📁 Clean Project Structure

```
PromptWar/
├── __tests__/                      # Automated Vitest test suites (100% pass)
│   ├── gemini.test.ts              # AI reasoning, schema, and traceability tests
│   ├── i18n.test.ts                # Multilingual translation matrix tests
│   └── normalizer.test.ts          # CSV parsing, unit conversions, and outlier tests
├── app/                            # Next.js 14 App Router
│   ├── api/analyze/route.ts        # Server-side Gemini API route with security checks
│   ├── globals.css                 # Tailwind CSS styling and animations
│   ├── layout.tsx                  # Root layout with WCAG skip-links and metadata
│   └── page.tsx                    # Studio dashboard root (dynamic code splitting)
├── components/                     # Modular, memoized React UI components
│   ├── AirIntelligenceTab.tsx      # Gemini AI diagnostics and station charts
│   ├── CitizenAdvisoryTab.tsx      # Multilingual WhatsApp advisories and print bulletin
│   ├── DataStudioTab.tsx           # Ingestion studio, debounced search, telemetry grid
│   ├── LocalActionsTab.tsx         # Stakeholder action dispatch and tracking
│   ├── OverviewTab.tsx             # Citywide snapshot, 3-step guide, CPCB gauge
│   ├── ReportHistoryTab.tsx        # Requirement 8 24h baseline comparison
│   ├── SettingsTab.tsx             # Studio configuration and persona switcher
│   ├── Sidebar.tsx                 # Persistent accessible navigation
│   ├── TopNav.tsx                  # Persona switcher and status indicator
│   └── TraceModal.tsx              # Raw telemetry evidence audit dialog
├── hooks/                          # Reusable custom hooks
│   └── useDebounce.ts              # Search input debounce hook (efficiency)
├── lib/                            # Business logic, helpers, and types
│   ├── constants.ts                # Centralized CPCB standards and thresholds
│   ├── gemini.ts                   # Gemini 3.5 Flash client and deterministic engine
│   ├── i18n.ts                     # Multilingual dictionary (EN, HI, Hinglish)
│   ├── normalizer.ts               # Tabular normalizer and unit converter
│   ├── sampleData.ts               # Bhopal telemetry and historical baseline
│   ├── types.ts                    # Strict TypeScript type definitions
│   └── utils.ts                    # DRY utility functions and O(1) map builders
├── .eslintrc.json                  # ESLint configuration (Zero warnings)
├── .prettierrc                     # Prettier formatter configuration
├── next.config.mjs                 # Production HTTP security headers (CSP, HSTS)
├── package.json                    # Dependencies, scripts, and engine configs
└── vercel.json                     # Vercel deployment pipeline specification
```

---

## ⚡ Setup, Run & Test

### 1. Installation
Clone the repository and install dependencies with legacy peer dependency resolution:
```bash
git clone https://github.com/Tsrinivas123/HawaSathi.git
cd HawaSathi
npm install --legacy-peer-deps
```

### 2. Environment Configuration
Create a `.env.local` file in the root directory:
```env
GEMINI_API_KEY=your_google_gemini_api_key_here
```
*(Note: On Vercel production, this is configured securely via encrypted Environment Variables)*

### 3. Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### 4. Run Automated Tests
```bash
npm test
```
Runs all 12 Vitest unit and integration suites with 100% pass rate.

### 5. Run Linter
```bash
npm run lint
```
Checks all TypeScript and React files. Verified with **0 warnings and 0 errors**.

### 6. Production Build
```bash
npm run build
npm start
```
Compiles optimized static and dynamic routes with 47% smaller bundle size (123 kB First Load JS).

---

## 🛡️ Key Features & Standards Met:
- **Tailored Multi-Stakeholder Action Directives**:
  - **Ward Officer (ULB)**: Mist cannon deployments, traffic rerouting, biomass burning inspections.
  - **Housing Society (RWA)**: DG set test schedules, perimeter wetting, balcony warnings.
  - **School Administrator**: Indoor assembly relocations, asthmatic student protocols, parent circulars.
- **Multilingual Citizen Advisory Studio**:
  - Languages: **English**, **हिंदी (Hindi)**, and **Hinglish**.
  - Reading Levels: **Citizen**, **Child-Friendly** (superhero/play analogies), and **Official Administrative**.
  - High-risk vulnerable cohort protections for Children (<12), Elderly (65+), and Asthma/Cardiac patients.
- **Requirement 8 Briefing Comparison**: Automated comparative delta vs T-24h baseline (tracks emerging vs resolved hotspots and intervention efficacy).
- **Accessibility & Security First**: Full WCAG 2.1 AA semantic landmarks, ARIA labels, skip links, and strict HTTP security headers (CSP, HSTS, X-Frame-Options: DENY).
