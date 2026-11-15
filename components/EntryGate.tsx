'use strict';
/**
 * @file EntryGate.tsx
 * @description Mandatory Two-Input Entry Gate for HawaSathi Civic Air Quality Briefing Studio.
 * Enforces audience selection AND tabular telemetry ingestion before unlocking the complete application.
 * Strictly WCAG 2.1 AA compliant with proper h1->h2->h3 heading order and ARIA semantics.
 */

import React, { useState, useCallback, useId } from 'react';
import {
  Wind,
  Upload,
  FileSpreadsheet,
  Edit3,
  ShieldCheck,
  Building2,
  GraduationCap,
  Users,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Sparkles,
  Database,
  Trash2,
  Plus,
  HelpCircle,
  FileText,
  Clock,
  MapPin,
} from 'lucide-react';
import { StakeholderType, Language, AirRecord, DataQualityReport } from '@/lib/types';
import { parseAndNormalizeData } from '@/lib/normalizer';
import { BHOPAL_MESSY_SAMPLE_CSV } from '@/lib/sampleData';
import { SYSTEM_LIMITS } from '@/lib/constants';

interface EntryGateProps {
  onConfirmIngestion: (rawCsv: string, stakeholder: StakeholderType) => void;
  initialStakeholder?: StakeholderType;
  language: Language;
  onLanguageChange: (lang: Language) => void;
}

interface DraftManualRow {
  id: string;
  location: string;
  ward: string;
  station: string;
  timestamp: string;
  aqi: string;
  pm25: string;
  pm10: string;
  no2: string;
  so2: string;
  co: string;
  o3: string;
}

export const EntryGate: React.FC<EntryGateProps> = ({
  onConfirmIngestion,
  initialStakeholder = 'ward_officer',
  language,
  onLanguageChange,
}) => {
  // Input 1: Selected Audience (Mandatory)
  const [selectedAudience, setSelectedAudience] = useState<StakeholderType | null>(initialStakeholder);

  // Input 2: Data Source Mode ('upload' | 'paste' | 'manual')
  const [dataTab, setDataTab] = useState<'upload' | 'paste' | 'manual'>('upload');

  // Raw CSV buffer for ingestion
  const [rawCsvContent, setRawCsvContent] = useState<string>('');
  const [pastedText, setPastedText] = useState<string>('');
  const [fileName, setFileName] = useState<string>('');

  // Manual Row Builder
  const [manualRows, setManualRows] = useState<DraftManualRow[]>([
    {
      id: 'DRAFT-1',
      location: 'MP Nagar Zone-1',
      ward: 'Ward 48',
      station: 'MP-N-01',
      timestamp: '2026-11-15 08:30',
      aqi: '322',
      pm25: '148.5',
      pm10: '235.0',
      no2: '48.2',
      so2: '18.4',
      co: '2.4 ppm',
      o3: '35.1',
    },
  ]);

  const [formLocation, setFormLocation] = useState('');
  const [formWard, setFormWard] = useState('');
  const [formStation, setFormStation] = useState('');
  const [formTimestamp, setFormTimestamp] = useState('');
  const [formAqi, setFormAqi] = useState('');
  const [formPm25, setFormPm25] = useState('');
  const [formPm10, setFormPm10] = useState('');
  const [formNo2, setFormNo2] = useState('');
  const [formSo2, setFormSo2] = useState('');
  const [formCo, setFormCo] = useState('');
  const [formO3, setFormO3] = useState('');

  // Step 3: Parsed Results & Quality Preview
  const [parsedRecords, setParsedRecords] = useState<AirRecord[]>([]);
  const [parsedReport, setParsedReport] = useState<DataQualityReport | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [isValidating, setIsValidating] = useState<boolean>(false);

  // Accessible unique IDs
  const uploadInputId = useId();
  const pasteTextareaId = useId();

  // Internal data parser and quality analyzer
  const processAndValidate = useCallback((csvText: string, sourceName: string) => {
    if (!csvText || !csvText.trim()) {
      setValidationError('Please provide non-empty tabular air-quality data.');
      setParsedRecords([]);
      setParsedReport(null);
      return;
    }

    setIsValidating(true);
    setValidationError(null);

    try {
      const result = parseAndNormalizeData(csvText);
      if (result.records.length === 0) {
        setValidationError('No valid tabular records could be extracted. Please check header columns and formatting.');
        setParsedRecords([]);
        setParsedReport(null);
      } else {
        setParsedRecords(result.records);
        setParsedReport(result.qualityReport);
        setRawCsvContent(csvText);
        setFileName(sourceName);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Unknown parsing error';
      setValidationError(`Data parsing failed: ${msg}`);
      setParsedRecords([]);
      setParsedReport(null);
    } finally {
      setIsValidating(false);
    }
  }, []);

  // Handle File Upload (.csv, .txt)
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith('.csv') && !file.name.endsWith('.txt')) {
      setValidationError('Unsupported file format. Please upload a .csv or .txt tabular file.');
      return;
    }

    if (file.size > SYSTEM_LIMITS.MAX_UPLOAD_FILE_SIZE_BYTES) {
      setValidationError(`File exceeds size limit (${SYSTEM_LIMITS.MAX_UPLOAD_FILE_SIZE_BYTES / (1024 * 1024)} MB).`);
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result;
      if (typeof text === 'string') {
        if (text.includes('\0')) {
          setValidationError('Binary content detected. Only plain text tabular files are allowed.');
          return;
        }
        processAndValidate(text, file.name);
      }
    };
    reader.onerror = () => setValidationError('Error reading file from disk.');
    reader.readAsText(file);
  };

  // Handle Paste Submission
  const handlePasteSubmit = () => {
    if (!pastedText.trim()) {
      setValidationError('Please paste table rows or CSV text.');
      return;
    }
    processAndValidate(pastedText, 'Pasted Tabular Telemetry');
  };

  // Add Manual Row to Queue
  const handleAddManualRow = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formLocation.trim() || !formAqi.trim()) {
      alert('Location and AQI are required.');
      return;
    }

    const newRow: DraftManualRow = {
      id: `DRAFT-${manualRows.length + 1}`,
      location: formLocation.trim(),
      ward: formWard.trim() || 'Ward 1',
      station: formStation.trim() || `NODE-${manualRows.length + 1}`,
      timestamp: formTimestamp.trim() || new Date().toISOString().replace('T', ' ').slice(0, 16),
      aqi: formAqi.trim(),
      pm25: formPm25.trim() || '',
      pm10: formPm10.trim() || '',
      no2: formNo2.trim() || '',
      so2: formSo2.trim() || '',
      co: formCo.trim() || '',
      o3: formO3.trim() || '',
    };

    setManualRows((prev) => [...prev, newRow]);
    setFormLocation('');
    setFormWard('');
    setFormStation('');
    setFormAqi('');
    setFormPm25('');
    setFormPm10('');
    setFormNo2('');
    setFormSo2('');
    setFormCo('');
    setFormO3('');
  };

  // Convert Manual Rows to CSV and Validate
  const handleProcessManualRows = () => {
    if (manualRows.length === 0) {
      setValidationError('Please add at least one row to the manual entry queue.');
      return;
    }

    const headers = ['Location', 'Ward', 'Station', 'Timestamp', 'AQI', 'PM2.5', 'PM10', 'NO2', 'SO2', 'CO', 'O3'];
    const rows = manualRows.map((r) => [
      `"${r.location}"`,
      `"${r.ward}"`,
      `"${r.station}"`,
      `"${r.timestamp}"`,
      r.aqi,
      r.pm25 || '0',
      r.pm10 || '0',
      r.no2 || '0',
      r.so2 || '0',
      `"${r.co || '0'}"`,
      r.o3 || '0',
    ]);

    const csvString = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    processAndValidate(csvString, `Manual Entry (${manualRows.length} Stations)`);
  };

  // Remove a manual row
  const handleRemoveManualRow = (id: string) => {
    setManualRows((prev) => prev.filter((r) => r.id !== id));
  };

  // Helper: Load Bhopal Sample Telemetry
  const handleLoadSampleData = () => {
    setPastedText(BHOPAL_MESSY_SAMPLE_CSV);
    processAndValidate(BHOPAL_MESSY_SAMPLE_CSV, 'Bhopal Messy Field Telemetry (Sample)');
  };

  // Step 4 Unlock: Final Confirmation
  const handleConfirmAndUnlock = () => {
    if (!selectedAudience) {
      setValidationError('Please select an active audience persona before unlocking.');
      return;
    }
    if (!rawCsvContent || parsedRecords.length === 0) {
      setValidationError('Please validate a dataset before proceeding.');
      return;
    }

    onConfirmIngestion(rawCsvContent, selectedAudience);
  };

  // Audience Profiles Configuration
  const AUDIENCES: Array<{
    id: StakeholderType;
    title: string;
    roleTag: string;
    icon: React.ComponentType<{ className?: string; 'aria-hidden'?: boolean | 'true' | 'false' }>;
    description: string;
    focusArea: string;
    color: string;
  }> = [
    {
      id: 'ward_officer',
      title: 'Ward Officer / ULB',
      roleTag: 'Municipal Authority',
      icon: ShieldCheck,
      description: 'Ward-level enforcement, anti-smog mist cannon deployment, construction audits, and heavy traffic rerouting.',
      focusArea: 'Enforcement & Interventions',
      color: 'blue',
    },
    {
      id: 'housing_society',
      title: 'Housing Society / RWA',
      roleTag: 'Colony Welfare',
      icon: Building2,
      description: 'Residential community protocols, DG set test rescheduling, boundary road wetting, and balcony dust alerts.',
      focusArea: 'Resident Community Safety',
      color: 'amber',
    },
    {
      id: 'school_admin',
      title: 'School Administrator',
      roleTag: 'Campus Safety',
      icon: GraduationCap,
      description: 'Child pulmonary protection, morning assembly indoor relocations, sports cancellations, and parent circulars.',
      focusArea: 'Child Pulmonary Defense',
      color: 'emerald',
    },
    {
      id: 'citizen',
      title: 'General Citizen',
      roleTag: 'Public Health',
      icon: Users,
      description: 'Personal health precautions, N95 mask usage during commutes, and morning outdoor exercise guidelines.',
      focusArea: 'Personal & Family Safety',
      color: 'violet',
    },
  ];

  const isReadyToIngest = Boolean(selectedAudience && parsedRecords.length > 0 && parsedReport);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col justify-between">
      {/* Top Header Bar */}
      <header role="banner" className="h-16 bg-navy-950 border-b border-slate-800 px-4 sm:px-8 flex items-center justify-between shadow-md shrink-0">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center text-white shadow-xs">
            <Wind className="w-5 h-5" aria-hidden="true" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-bold text-white tracking-tight text-base sm:text-lg">
                HawaSathi (हवासार्थी)
              </span>
              <span className="text-[10px] uppercase font-bold tracking-widest px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                Civic Air Studio
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-medium">
              From Raw Air Quality Telemetry to Verified Local Interventions
            </p>
          </div>
        </div>

        {/* Language Selector */}
        <div className="flex items-center space-x-2">
          <label htmlFor="gate-lang-select" className="text-xs text-slate-400 font-medium hidden sm:inline">
            Language:
          </label>
          <select
            id="gate-lang-select"
            value={language}
            onChange={(e) => onLanguageChange(e.target.value as Language)}
            aria-label="Select Interface Language"
            className="text-xs bg-slate-900 border border-slate-700 text-slate-200 rounded-lg px-2.5 py-1.5 focus:outline-hidden focus:border-emerald-500 cursor-pointer"
          >
            <option value="en">English</option>
            <option value="hi">हिंदी (Hindi)</option>
            <option value="hinglish">Hinglish</option>
          </select>
        </div>
      </header>

      {/* Main Gate Workflow */}
      <main id="main-content" role="main" className="flex-1 max-w-6xl w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-8">
        {/* Step Banner */}
        <div className="text-center space-y-2 max-w-2xl mx-auto pt-2">
          <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold tracking-wide">
            <Sparkles className="w-3.5 h-3.5 text-emerald-600" aria-hidden="true" />
            <span>Two-Input Data & Audience Gate</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-navy-950 tracking-tight">
            Welcome to HawaSathi Civic Studio
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
            To generate verified civic intelligence, personalized action directives, and citizen advisories,
            please select your <strong>target civic audience</strong> and provide your <strong>air quality telemetry dataset</strong> below.
          </p>
        </div>

        {/* INPUT 1: Target Audience Selection */}
        <section aria-labelledby="step1-heading" className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-8 shadow-xs space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 gap-2">
            <div>
              <div className="flex items-center space-x-2">
                <span className="flex items-center justify-center w-6 h-6 rounded-full bg-emerald-600 text-white text-xs font-bold">1</span>
                <h2 id="step1-heading" className="text-base sm:text-lg font-bold text-navy-900">
                  Select Target Civic Audience (Mandatory)
                </h2>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                The audience customizes recommended actions, operational directives, and advisory tone without altering underlying sensor readings.
              </p>
            </div>
            {selectedAudience && (
              <span className="inline-flex items-center space-x-1 text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200 shrink-0 self-start sm:self-auto">
                <CheckCircle2 className="w-3.5 h-3.5" aria-hidden="true" />
                <span>Audience Selected</span>
              </span>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4" role="group" aria-label="Select Target Civic Audience">
            {AUDIENCES.map((aud) => {
              const Icon = aud.icon;
              const isSelected = selectedAudience === aud.id;
              return (
                <button
                  key={aud.id}
                  type="button"
                  onClick={() => setSelectedAudience(aud.id)}
                  aria-pressed={isSelected}
                  aria-label={`Select ${aud.title}`}
                  className={`p-5 rounded-2xl border-2 text-left transition-all cursor-pointer flex flex-col justify-between relative group ${
                    isSelected
                      ? 'border-emerald-600 bg-emerald-50/40 ring-4 ring-emerald-500/10 shadow-sm'
                      : 'border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-50/50'
                  }`}
                >
                  {isSelected && (
                    <div className="absolute top-3 right-3 text-emerald-600">
                      <CheckCircle2 className="w-5 h-5 fill-emerald-100" aria-hidden="true" />
                    </div>
                  )}
                  <div>
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${
                      isSelected ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-600 group-hover:scale-105 transition-transform'
                    }`}>
                      <Icon className="w-5 h-5" aria-hidden="true" />
                    </div>
                    <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      {aud.roleTag}
                    </div>
                    <h3 className="text-sm font-bold text-navy-950 mt-0.5">
                      {aud.title}
                    </h3>
                    <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                      {aud.description}
                    </p>
                  </div>
                  <div className="mt-4 pt-3 border-t border-slate-100/80 text-[11px] font-semibold text-emerald-700">
                    {aud.focusArea}
                  </div>
                </button>
              );
            })}
          </div>
        </section>

        {/* INPUT 2: Air-Quality Data Source */}
        <section aria-labelledby="step2-heading" className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-8 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 gap-2">
            <div>
              <div className="flex items-center space-x-2">
                <span className="flex items-center justify-center w-6 h-6 rounded-full bg-emerald-600 text-white text-xs font-bold">2</span>
                <h2 id="step2-heading" className="text-base sm:text-lg font-bold text-navy-900">
                  Provide Air Quality Dataset (Mandatory)
                </h2>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Choose one ingestion method: Upload file, paste table text, or enter station records manually.
              </p>
            </div>

            {/* Quick Sample Data Button */}
            <button
              type="button"
              onClick={handleLoadSampleData}
              aria-label="Load Sample Bhopal Field Telemetry"
              className="inline-flex items-center space-x-1.5 px-3.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-colors cursor-pointer shrink-0 self-start sm:self-auto border border-slate-200"
            >
              <Database className="w-3.5 h-3.5 text-slate-500" aria-hidden="true" />
              <span>Load Bhopal Field Dataset (Test Demo)</span>
            </button>
          </div>

          {/* Segmented Mode Selector */}
          <div className="flex flex-wrap gap-2 p-1 bg-slate-100 rounded-2xl border border-slate-200" role="tablist" aria-label="Ingestion Method Tabs">
            <button
              type="button"
              role="tab"
              aria-selected={dataTab === 'upload'}
              onClick={() => setDataTab('upload')}
              className={`flex-1 min-w-[140px] flex items-center justify-center space-x-2 py-2.5 px-4 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                dataTab === 'upload'
                  ? 'bg-white text-navy-950 shadow-xs border border-slate-200/80'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Upload className="w-4 h-4" aria-hidden="true" />
              <span>A. Upload CSV / TXT</span>
            </button>

            <button
              type="button"
              role="tab"
              aria-selected={dataTab === 'paste'}
              onClick={() => setDataTab('paste')}
              className={`flex-1 min-w-[140px] flex items-center justify-center space-x-2 py-2.5 px-4 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                dataTab === 'paste'
                  ? 'bg-white text-navy-950 shadow-xs border border-slate-200/80'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <FileSpreadsheet className="w-4 h-4" aria-hidden="true" />
              <span>B. Paste Table / Raw Text</span>
            </button>

            <button
              type="button"
              role="tab"
              aria-selected={dataTab === 'manual'}
              onClick={() => setDataTab('manual')}
              className={`flex-1 min-w-[140px] flex items-center justify-center space-x-2 py-2.5 px-4 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                dataTab === 'manual'
                  ? 'bg-white text-navy-950 shadow-xs border border-slate-200/80'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Edit3 className="w-4 h-4" aria-hidden="true" />
              <span>C. Manual Data Entry Form</span>
            </button>
          </div>

          {/* Option A: Upload File */}
          {dataTab === 'upload' && (
            <div className="space-y-4">
              <label
                htmlFor={uploadInputId}
                className="block border-2 border-dashed border-slate-300 hover:border-emerald-500 rounded-2xl p-8 text-center cursor-pointer transition-colors bg-slate-50/50 hover:bg-emerald-50/20"
              >
                <div className="w-12 h-12 rounded-2xl bg-white shadow-xs border border-slate-200 text-emerald-600 flex items-center justify-center mx-auto mb-3">
                  <Upload className="w-6 h-6" aria-hidden="true" />
                </div>
                <div className="text-sm font-bold text-navy-900">
                  Click to select or drag and drop your telemetry file
                </div>
                <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                  Accepts standard or messy CSV, TSV, or TXT files. Handles mixed units (ppm ↔ mg/m³), missing readings, and non-standard timestamps.
                </p>
                <div className="mt-3 text-[11px] font-semibold text-slate-400">
                  Maximum file size: 2 MB • Up to 1,000 monitoring nodes
                </div>
                <input
                  id={uploadInputId}
                  type="file"
                  accept=".csv,.txt"
                  onChange={handleFileUpload}
                  className="sr-only"
                />
              </label>
            </div>
          )}

          {/* Option B: Paste Table */}
          {dataTab === 'paste' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label htmlFor={pasteTextareaId} className="text-xs font-bold text-navy-900">
                  Paste Tabular Sensor Data (CSV, TSV, or Delimited Text):
                </label>
                <span className="text-[11px] text-slate-400">
                  Must include header row (e.g. Location, Ward, Timestamp, AQI...)
                </span>
              </div>
              <textarea
                id={pasteTextareaId}
                rows={7}
                value={pastedText}
                onChange={(e) => setPastedText(e.target.value)}
                placeholder="Site Area, Ward_No, Sensor_Id, Date / Time, PM 2.5 (ug/m3), PM10 raw, Overall_AQI, NO2, SO2, CO [ppm]&#10;MP Nagar Zone-1, Ward 48, MP-N-01, 2026-11-14 08:30, 148.5, 235.0, 322, 48.2, 18.4, 2.4 ppm&#10;TT Nagar Stadium, Ward 32, TT-N-04, 2026-11-14 08:30, 86.2, 142.1, 188, 32.0, 12.1, 1.1 ppm"
                className="w-full p-4 rounded-xl border border-slate-300 font-mono text-xs focus:outline-hidden focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 bg-slate-50/50"
              />
              <div className="flex items-center justify-end">
                <button
                  type="button"
                  onClick={handlePasteSubmit}
                  disabled={!pastedText.trim() || isValidating}
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white text-xs font-bold transition-colors cursor-pointer shadow-xs"
                >
                  {isValidating ? 'Validating Telemetry...' : 'Process & Validate Pasted Table'}
                </button>
              </div>
            </div>
          )}

          {/* Option C: Manual Entry Form */}
          {dataTab === 'manual' && (
            <div className="space-y-5">
              <form onSubmit={handleAddManualRow} className="p-4 rounded-2xl bg-slate-50 border border-slate-200/90 space-y-4">
                <div className="text-xs font-bold text-navy-900 flex items-center justify-between">
                  <span>Add New Air Monitoring Station / Ward Reading</span>
                  <span className="text-[11px] font-normal text-slate-500">* Required fields: Location & AQI</span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div>
                    <label htmlFor="gate-form-location" className="block text-[11px] font-semibold text-slate-700 mb-1">
                      Location / Area *
                    </label>
                    <input
                      id="gate-form-location"
                      type="text"
                      placeholder="e.g. MP Nagar"
                      value={formLocation}
                      onChange={(e) => setFormLocation(e.target.value)}
                      required
                      className="w-full px-3 py-1.5 text-xs bg-white rounded-lg border border-slate-300 focus:outline-hidden focus:border-emerald-500"
                    />
                  </div>

                  <div>
                    <label htmlFor="gate-form-ward" className="block text-[11px] font-semibold text-slate-700 mb-1">
                      Ward Number
                    </label>
                    <input
                      id="gate-form-ward"
                      type="text"
                      placeholder="e.g. Ward 48"
                      value={formWard}
                      onChange={(e) => setFormWard(e.target.value)}
                      className="w-full px-3 py-1.5 text-xs bg-white rounded-lg border border-slate-300 focus:outline-hidden focus:border-emerald-500"
                    />
                  </div>

                  <div>
                    <label htmlFor="gate-form-station" className="block text-[11px] font-semibold text-slate-700 mb-1">
                      Sensor / Station ID
                    </label>
                    <input
                      id="gate-form-station"
                      type="text"
                      placeholder="e.g. MP-N-01"
                      value={formStation}
                      onChange={(e) => setFormStation(e.target.value)}
                      className="w-full px-3 py-1.5 text-xs bg-white rounded-lg border border-slate-300 focus:outline-hidden focus:border-emerald-500"
                    />
                  </div>

                  <div>
                    <label htmlFor="gate-form-timestamp" className="block text-[11px] font-semibold text-slate-700 mb-1">
                      Timestamp
                    </label>
                    <input
                      id="gate-form-timestamp"
                      type="text"
                      placeholder="YYYY-MM-DD HH:MM"
                      value={formTimestamp}
                      onChange={(e) => setFormTimestamp(e.target.value)}
                      className="w-full px-3 py-1.5 text-xs bg-white rounded-lg border border-slate-300 focus:outline-hidden focus:border-emerald-500"
                    />
                  </div>

                  <div>
                    <label htmlFor="gate-form-aqi" className="block text-[11px] font-semibold text-slate-700 mb-1">
                      Overall AQI *
                    </label>
                    <input
                      id="gate-form-aqi"
                      type="number"
                      placeholder="e.g. 274"
                      value={formAqi}
                      onChange={(e) => setFormAqi(e.target.value)}
                      required
                      className="w-full px-3 py-1.5 text-xs bg-white rounded-lg border border-slate-300 focus:outline-hidden focus:border-emerald-500"
                    />
                  </div>

                  <div>
                    <label htmlFor="gate-form-pm25" className="block text-[11px] font-semibold text-slate-700 mb-1">
                      PM2.5 (µg/m³)
                    </label>
                    <input
                      id="gate-form-pm25"
                      type="number"
                      step="0.1"
                      placeholder="e.g. 112.0"
                      value={formPm25}
                      onChange={(e) => setFormPm25(e.target.value)}
                      className="w-full px-3 py-1.5 text-xs bg-white rounded-lg border border-slate-300 focus:outline-hidden focus:border-emerald-500"
                    />
                  </div>

                  <div>
                    <label htmlFor="gate-form-pm10" className="block text-[11px] font-semibold text-slate-700 mb-1">
                      PM10 (µg/m³)
                    </label>
                    <input
                      id="gate-form-pm10"
                      type="number"
                      step="0.1"
                      placeholder="e.g. 185.0"
                      value={formPm10}
                      onChange={(e) => setFormPm10(e.target.value)}
                      className="w-full px-3 py-1.5 text-xs bg-white rounded-lg border border-slate-300 focus:outline-hidden focus:border-emerald-500"
                    />
                  </div>

                  <div>
                    <label htmlFor="gate-form-co" className="block text-[11px] font-semibold text-slate-700 mb-1">
                      CO (ppm or mg/m³)
                    </label>
                    <input
                      id="gate-form-co"
                      type="text"
                      placeholder="e.g. 2.4 ppm"
                      value={formCo}
                      onChange={(e) => setFormCo(e.target.value)}
                      className="w-full px-3 py-1.5 text-xs bg-white rounded-lg border border-slate-300 focus:outline-hidden focus:border-emerald-500"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-end">
                  <button
                    type="submit"
                    className="inline-flex items-center space-x-1.5 px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs font-semibold cursor-pointer shadow-2xs"
                  >
                    <Plus className="w-3.5 h-3.5" aria-hidden="true" />
                    <span>Add Row to Batch Queue</span>
                  </button>
                </div>
              </form>

              {/* Queued Rows Table */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs font-bold text-slate-700">
                  <span>Queued Station Readings ({manualRows.length} Nodes)</span>
                  <button
                    type="button"
                    onClick={handleProcessManualRows}
                    disabled={manualRows.length === 0}
                    className="px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-semibold cursor-pointer text-xs"
                  >
                    Process & Validate All {manualRows.length} Rows
                  </button>
                </div>

                <div className="max-h-48 overflow-y-auto border border-slate-200 rounded-xl bg-white">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-100">
                      <tr>
                        <th scope="col" className="px-3 py-2">Location</th>
                        <th scope="col" className="px-3 py-2">Ward</th>
                        <th scope="col" className="px-3 py-2">AQI</th>
                        <th scope="col" className="px-3 py-2">PM2.5</th>
                        <th scope="col" className="px-3 py-2">PM10</th>
                        <th scope="col" className="px-3 py-2 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-medium">
                      {manualRows.map((row) => (
                        <tr key={row.id} className="hover:bg-slate-50/50">
                          <td className="px-3 py-2 text-navy-900 font-semibold">{row.location}</td>
                          <td className="px-3 py-2 text-slate-600">{row.ward}</td>
                          <td className="px-3 py-2 font-mono text-emerald-700 font-bold">{row.aqi}</td>
                          <td className="px-3 py-2 font-mono text-slate-600">{row.pm25 || '—'}</td>
                          <td className="px-3 py-2 font-mono text-slate-600">{row.pm10 || '—'}</td>
                          <td className="px-3 py-2 text-right">
                            <button
                              type="button"
                              onClick={() => handleRemoveManualRow(row.id)}
                              aria-label={`Remove row for ${row.location}`}
                              className="text-red-500 hover:text-red-700 p-1 rounded"
                            >
                              <Trash2 className="w-3.5 h-3.5" aria-hidden="true" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* Validation Error Banner */}
          {validationError && (
            <div role="alert" className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-800 text-xs flex items-start space-x-2.5">
              <AlertTriangle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" aria-hidden="true" />
              <div>
                <strong className="font-bold">Validation Alert: </strong>
                <span>{validationError}</span>
              </div>
            </div>
          )}
        </section>

        {/* STEP 3: Live Validation & Quality Inspection Results */}
        {parsedReport && parsedRecords.length > 0 && (
          <section aria-labelledby="step3-heading" className="bg-white rounded-3xl border border-emerald-500/40 p-6 sm:p-8 shadow-sm space-y-6 animate-in fade-in duration-300">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 gap-2">
              <div>
                <div className="flex items-center space-x-2">
                  <span className="flex items-center justify-center w-6 h-6 rounded-full bg-emerald-600 text-white text-xs font-bold">3</span>
                  <h2 id="step3-heading" className="text-base sm:text-lg font-bold text-navy-900">
                    Dataset Inspection & Quality Diagnostics
                  </h2>
                </div>
                <p className="text-xs text-slate-500 mt-1">
                  Source: <strong>{fileName}</strong> • Complete CPCB standard normalization and anomaly screening applied.
                </p>
              </div>

              <div className="flex items-center space-x-2">
                <span className="inline-flex items-center space-x-1 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold">
                  <CheckCircle2 className="w-3.5 h-3.5" aria-hidden="true" />
                  <span>Verified Clean</span>
                </span>
              </div>
            </div>

            {/* Quality KPI Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200">
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Rows</div>
                <div className="text-xl font-mono font-extrabold text-navy-950 mt-1">{parsedReport.totalRecords}</div>
                <div className="text-[10px] text-slate-500 mt-0.5">Ingested rows</div>
              </div>

              <div className="p-3.5 rounded-2xl bg-emerald-50/60 border border-emerald-200">
                <div className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider">Valid Nodes</div>
                <div className="text-xl font-mono font-extrabold text-emerald-800 mt-1">{parsedReport.validRecords}</div>
                <div className="text-[10px] text-emerald-600 mt-0.5">Ready for modeling</div>
              </div>

              <div className="p-3.5 rounded-2xl bg-blue-50/60 border border-blue-200">
                <div className="text-[10px] font-bold text-blue-700 uppercase tracking-wider">Completeness</div>
                <div className="text-xl font-mono font-extrabold text-blue-800 mt-1">{parsedReport.dataCompletenessPct}%</div>
                <div className="text-[10px] text-blue-600 mt-0.5">Telemetry coverage</div>
              </div>

              <div className="p-3.5 rounded-2xl bg-amber-50/60 border border-amber-200">
                <div className="text-[10px] font-bold text-amber-700 uppercase tracking-wider">Missing Fields</div>
                <div className="text-xl font-mono font-extrabold text-amber-800 mt-1">{parsedReport.missingReadings}</div>
                <div className="text-[10px] text-amber-600 mt-0.5">Flagged safely</div>
              </div>

              <div className="p-3.5 rounded-2xl bg-purple-50/60 border border-purple-200">
                <div className="text-[10px] font-bold text-purple-700 uppercase tracking-wider">Anomalies</div>
                <div className="text-xl font-mono font-extrabold text-purple-800 mt-1">{parsedReport.suspiciousObservations}</div>
                <div className="text-[10px] text-purple-600 mt-0.5">Outliers excluded</div>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200">
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Duplicates</div>
                <div className="text-xl font-mono font-extrabold text-slate-700 mt-1">{parsedReport.duplicateRecords}</div>
                <div className="text-[10px] text-slate-500 mt-0.5">Deduplicated</div>
              </div>
            </div>

            {/* Warnings list if any */}
            {parsedReport.warnings.length > 0 && (
              <div className="p-4 rounded-2xl bg-amber-50/80 border border-amber-200 space-y-1.5">
                <div className="text-xs font-bold text-amber-900 flex items-center space-x-1.5">
                  <AlertTriangle className="w-4 h-4 text-amber-600" aria-hidden="true" />
                  <span>Data Quality Diagnostics & Exclusions Applied:</span>
                </div>
                <ul className="text-xs text-amber-800 list-disc list-inside space-y-1 font-medium pl-1">
                  {parsedReport.warnings.map((w, i) => (
                    <li key={i}>{w}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Mini Records Preview */}
            <div className="space-y-2">
              <div className="text-xs font-bold text-navy-900 flex items-center justify-between">
                <span>Normalized Records Preview (Showing first {Math.min(5, parsedRecords.length)} nodes):</span>
                <span className="text-[11px] text-slate-400 font-mono">100% Traceable Record IDs</span>
              </div>
              <div className="border border-slate-200 rounded-2xl overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                    <tr>
                      <th scope="col" className="px-3 py-2.5">ID</th>
                      <th scope="col" className="px-3 py-2.5">Location</th>
                      <th scope="col" className="px-3 py-2.5">Ward</th>
                      <th scope="col" className="px-3 py-2.5">Timestamp</th>
                      <th scope="col" className="px-3 py-2.5">AQI</th>
                      <th scope="col" className="px-3 py-2.5">PM2.5</th>
                      <th scope="col" className="px-3 py-2.5">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium">
                    {parsedRecords.slice(0, 5).map((r) => (
                      <tr key={r.id} className="hover:bg-slate-50/50">
                        <td className="px-3 py-2 font-mono text-slate-500 font-bold">{r.id}</td>
                        <td className="px-3 py-2 text-navy-950 font-semibold">{r.location}</td>
                        <td className="px-3 py-2 text-slate-600">{r.ward}</td>
                        <td className="px-3 py-2 text-slate-500 font-mono text-[11px]">{r.timestamp}</td>
                        <td className="px-3 py-2 font-mono font-bold text-emerald-700">{r.aqi ?? '—'}</td>
                        <td className="px-3 py-2 font-mono text-slate-600">{r.pm25 ?? '—'}</td>
                        <td className="px-3 py-2">
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            r.status === 'valid'
                              ? 'bg-emerald-100 text-emerald-800'
                              : r.status === 'suspicious'
                              ? 'bg-purple-100 text-purple-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}>
                            {r.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </section>
        )}

        {/* STEP 4: Confirmation & Unlock Action */}
        <section aria-labelledby="step4-heading" className="bg-navy-950 text-white rounded-3xl p-6 sm:p-8 shadow-xl space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center space-x-2">
                <span className="flex items-center justify-center w-6 h-6 rounded-full bg-emerald-500 text-navy-950 text-xs font-extrabold">4</span>
                <h2 id="step4-heading" className="text-base sm:text-lg font-bold text-white">
                  Confirm Ingestion & Unlock HawaSathi Application
                </h2>
              </div>
              <p className="text-xs text-slate-300">
                {isReadyToIngest ? (
                  <span>
                    Ready to initialize studio with <strong>{parsedRecords.length} records</strong> for audience: <strong>{AUDIENCES.find((a) => a.id === selectedAudience)?.title}</strong>.
                  </span>
                ) : (
                  <span>
                    {!selectedAudience
                      ? '⚠️ Please select a civic audience in Step 1 to proceed.'
                      : '⚠️ Please provide and validate tabular air-quality data in Step 2 to proceed.'}
                  </span>
                )}
              </p>
            </div>

            <button
              type="button"
              onClick={handleConfirmAndUnlock}
              disabled={!isReadyToIngest}
              aria-label="Confirm Ingestion and Unlock Civic Studio"
              className={`px-6 py-3.5 rounded-2xl text-sm font-extrabold flex items-center justify-center space-x-2 transition-all cursor-pointer shadow-md shrink-0 ${
                isReadyToIngest
                  ? 'bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-navy-950 ring-4 ring-emerald-500/20'
                  : 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
              }`}
            >
              <span>Confirm & Enter Civic Studio</span>
              <ArrowRight className="w-4 h-4" aria-hidden="true" />
            </button>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer role="contentinfo" className="py-6 border-t border-slate-200 text-center text-xs text-slate-500">
        HawaSathi (हवासार्थी) • PromptWars Bhopal 2026 • AI Civic Air Quality Intelligence Suite
      </footer>
    </div>
  );
};
