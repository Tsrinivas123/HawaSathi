# HawaSathi (हवासार्थी) — From Air Data to Local Action

> **PromptWars Bhopal 2026** • ₹50,000 Grand Prize Track  
> *AI Civic Environmental Intelligence Suite for Urban Local Bodies, Housing Societies, and School Administrators.*

[![Live Deployment](https://img.shields.io/badge/Live%20App-hawasathi.vercel.app-10B981?style=for-the-badge&logo=vercel)](https://hawasathi.vercel.app)
[![Built with Next.js 14](https://img.shields.io/badge/Built%20with-Next.js%2014-black?style=flat&logo=next.js)](https://nextjs.org/)
[![Powered by Gemini 3.5](https://img.shields.io/badge/Powered%20by-Google%20Gemini%203.5-4285F4?style=flat&logo=google)](https://ai.google.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-38B2AC?style=flat&logo=tailwind-css)](https://tailwindcss.com/)
[![CPCB Standard Compliant](https://img.shields.io/badge/Standards-CPCB%20%26%20NAAQS-10B981?style=flat)]()

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

## 🚀 The HawaSathi Solution
**HawaSathi** transforms unreliable, heterogeneous air telemetry feeds into verified findings, stakeholder-specific interventions, and accessible multilingual advisories.

### Core Differentiators & Requirements Met:
- **Smart Data Ingestion & Auto-Normalizer**: Ingests messy CSVs, parses ambiguous headers (`Site Area`, `Date/Time`), harmonizes units (`ppm` ↔ `mg/m³`), detects duplicates, and flags outliers with complete audit logs.
- **100% Traceable Hotspot Diagnostics**: Every flagged hotspot strictly cites source record IDs (`REC-001`, `REC-004`), categorizing findings into *Observed Facts*, *Possible Explanations*, and *Unverified Hypotheses*.
- **Generative AI Air Intelligence**: Powered by **Google Gemini 2.5 Flash** server-side for executive briefings, spatial trend analysis, and atmospheric inversion modeling.
- **Tailored Multi-Stakeholder Action Directives**:
  - **Ward Officer (ULB)**: Mist cannon deployments, traffic rerouting, biomass burning inspections.
  - **Housing Society (RWA)**: DG set test schedules, perimeter wetting, balcony warnings.
  - **School Administrator**: Indoor assembly relocations, asthmatic student protocols, parent circulars.
- **Multilingual Citizen Advisory Studio**:
  - Languages: **English**, **हिंदी (Hindi)**, and **Hinglish**.
  - Reading Levels: **Citizen**, **Child-Friendly** (superhero/play analogies), and **Official Administrative**.
  - High-risk vulnerable cohort protections for Children (<12), Elderly (65+), and Asthma/Cardiac patients.
- **Requirement 8 Briefing Comparison**: Automated comparative delta vs T-24h baseline (tracks emerging vs resolved hotspots and intervention efficacy).

---

## 🛠️ Technology Stack
- **Frontend & App Framework**: Next.js 14 (App Router), React 18, TypeScript (Strict)
- **Styling & UI**: Tailwind CSS, Lucide React icons, Glassmorphic Navy & Emerald theme (`#07111F`, `#10B981`)
- **Data Visualization**: Recharts (Station-wise particulate loading vs CPCB 60 µg/m³ standards)
- **Data Parsing & Harmonization**: PapaParse with custom fuzzy header and unit normalizer
- **GenAI Brain**: Google Gemini 2.5 Flash API (Server-side runtime with deterministic fallback guarantees)
- **Deployment**: Vercel

---

## ⚡ Quick Start (Local Run)

1. Clone or extract repository:
   ```bash
   git clone <repo-url>
   cd PromptWar
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Configure environment variable (`.env.local`):
   ```env
   GEMINI_API_KEY=your_google_gemini_api_key
   ```
4. Run production build & start:
   ```bash
   npm run build
   npm run start
   ```
5. Open [http://localhost:3000](http://localhost:3000)

---

