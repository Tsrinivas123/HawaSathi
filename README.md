# HawaSathi (हवासार्थी) — From Air Data to Local Action

> **PromptWars Bhopal 2026** • ₹50,000 Grand Prize Track  
> *AI Civic Environmental Intelligence Suite for Urban Local Bodies, Housing Societies, and School Administrators.*

[![Built with Next.js 14](https://img.shields.io/badge/Built%20with-Next.js%2014-black?style=flat&logo=next.js)](https://nextjs.org/)
[![Powered by Gemini 2.5](https://img.shields.io/badge/Powered%20by-Google%20Gemini%202.5-4285F4?style=flat&logo=google)](https://ai.google.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-38B2AC?style=flat&logo=tailwind-css)](https://tailwindcss.com/)
[![CPCB Standard Compliant](https://img.shields.io/badge/Standards-CPCB%20%26%20NAAQS-10B981?style=flat)]()

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

## 🏆 PromptWars Bhopal 2026 Pitch Script (2 Minutes)

- **0:00 - 0:25 (The Hook)**:  
  *"Respected Judges, every morning in Bhopal, millions check AQI apps and see a red number like 320. But what does a Ward Officer do with that number? Does a school cancel morning sports? HawaSathi answers this. We bridge the gap from raw air data to verified civic action."*
- **0:25 - 0:55 (The Live Demo)**:  
  *"Look at our Data Studio. We drop in a messy municipal sensor feed with inconsistent ppm units, missing values, and a sensor saturation outlier of 999. HawaSathi instantly normalizes it, flags the anomalies, and generates a 100% traceable quality audit."*
- **0:55 - 1:25 (The Intelligence & Traceability)**:  
  *"Clicking into Air Intelligence, Gemini 2.5 reveals our citywide briefing. Every single hotspot is mathematically anchored to an exact record ID like `REC-004`—zero hallucinations. And look at our Local Actions: toggle to Ward Officer for mist cannon deployment; toggle to School Admin for student respiratory advisories."*
- **1:25 - 1:45 (Citizen Inclusion & Comparison)**:  
  *"In our Citizen Advisory Studio, we generate 1-click WhatsApp bulletins in Hindi, English, and Hinglish, with dedicated tiers for young children and asthma patients. Plus, our Briefing Comparison proves whether yesterday's misting actually worked."*
- **1:45 - 2:00 (The Conclusion)**:  
  *"HawaSathi isn't another passive dashboard—it is an actionable civic environmental operating system for India's smart cities. Thank you!"*
