'use strict';
/**
 * @file DataStudioTab.tsx
 * @description Ingestion studio with drag-and-drop CSV upload, tabular paste editor,
 * structured manual data entry form, and traceable telemetry table.
 * Strictly WCAG 2.1 AA compliant with proper h1->h2->h3 heading hierarchy.
 */

import React, { useState, useMemo, memo } from 'react';
import {
  Upload,
  FileSpreadsheet,
  AlertCircle,
  CheckCircle2,
  AlertTriangle,
  Sparkles,
  FileText,
  Search,
  Filter,
  Check,
  Eye,
  ChevronLeft,
  ChevronRight,
  Edit3,
  Plus,
  Trash2,
  RefreshCw,
  PlusCircle,
} from 'lucide-react';
import { AirRecord, DataQualityReport } from '@/lib/types';
import { BHOPAL_MESSY_SAMPLE_CSV } from '@/lib/sampleData';
import { useDebounce } from '@/hooks/useDebounce';
import { getAqiBadgeClasses } from '@/lib/utils';
import { SYSTEM_LIMITS } from '@/lib/constants';

interface DataStudioTabProps {
  records: AirRecord[];
  qualityReport: DataQualityReport | null;
  onDataParsed: (rawCsv: string) => void;
  onOpenTrace: (recordId: string) => void;
  onResetWorkspace?: () => void;
}

const PAGE_SIZE = 10;

interface DataStudioRowProps {
  rec: AirRecord;
  onOpenTrace: (recordId: string) => void;
}

const DataStudioRow = memo(function DataStudioRow({ rec, onOpenTrace }: DataStudioRowProps) {
  return (
    <tr className="hover:bg-slate-50/80 transition-colors">
      <td className="py-3 px-4 font-mono font-bold text-slate-800">{rec.id}</td>
      <td className="py-3 px-4 font-medium text-navy-900">{rec.location}</td>
      <td className="py-3 px-4 text-slate-600">{rec.ward}</td>
      <td className="py-3 px-4 text-slate-500 font-mono text-[11px]">{rec.timestamp}</td>
      <td className="py-3 px-4 font-mono">
        {rec.pm25 !== null ? (
          <span className={rec.pm25 > 150 ? 'text-red-600 font-bold' : 'text-slate-800'}>
            {rec.pm25}
          </span>
        ) : (
          <span className="text-slate-400">N/A</span>
        )}
      </td>
      <td className="py-3 px-4 font-mono">
        {rec.pm10 !== null ? (
          <span className={rec.pm10 === 999 ? 'text-red-600 font-bold bg-red-50 px-1 rounded' : 'text-slate-800'}>
            {rec.pm10}
          </span>
        ) : (
          <span className="text-slate-400">N/A</span>
        )}
      </td>
      <td className="py-3 px-4">
        <span className={`px-2 py-0.5 rounded-full font-mono text-[11px] font-bold border ${getAqiBadgeClasses(rec.aqi)}`}>
          {rec.aqi ?? 'N/A'}
        </span>
      </td>
      <td className="py-3 px-4 font-mono text-slate-600">
        {rec.co !== null ? rec.co : 'N/A'}
      </td>
      <td className="py-3 px-4">
        {rec.status === 'valid' && (
          <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
            <Check className="w-3 h-3" aria-hidden="true" />
            <span>Valid</span>
          </span>
        )}
        {rec.status === 'suspicious' && (
          <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-amber-50 text-amber-700 border border-amber-200">
            <AlertTriangle className="w-3 h-3" aria-hidden="true" />
            <span>Suspicious</span>
          </span>
        )}
        {rec.status === 'missing_critical' && (
          <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-red-50 text-red-700 border border-red-200">
            <AlertCircle className="w-3 h-3" aria-hidden="true" />
            <span>Missing Field</span>
          </span>
        )}
      </td>
      <td className="py-3 px-4 text-right">
        <button
          type="button"
          onClick={() => onOpenTrace(rec.id)}
          aria-label={`Audit Raw Telemetry for ${rec.id} ${rec.location}`}
          className="inline-flex items-center space-x-1 text-xs font-semibold text-emerald-600 hover:text-emerald-800 hover:underline cursor-pointer"
        >
          <Eye className="w-3.5 h-3.5" aria-hidden="true" />
          <span>Audit</span>
        </button>
      </td>
    </tr>
  );
});

interface DraftManualRow {
  location: string;
  ward: string;
  timestamp: string;
  aqi: string;
  pm25: string;
  pm10: string;
  no2: string;
  so2: string;
  co: string;
}

const DEFAULT_MANUAL_ROW: DraftManualRow = {
  location: '',
  ward: '',
  timestamp: new Date().toISOString().slice(0, 16).replace('T', ' '),
  aqi: '',
  pm25: '',
  pm10: '',
  no2: '',
  so2: '',
  co: '',
};

export const DataStudioTab: React.FC<DataStudioTabProps> = ({
  records,
  qualityReport,
  onDataParsed,
  onOpenTrace,
  onResetWorkspace,
}) => {
  const [activeMode, setActiveMode] = useState<'upload' | 'paste' | 'manual'>('upload');
  const [pastedText, setPastedText] = useState('');
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);

  // Manual Entry Form State
  const [manualForm, setManualForm] = useState<DraftManualRow>(DEFAULT_MANUAL_ROW);
  const [draftBatch, setDraftBatch] = useState<DraftManualRow[]>([]);

  const debouncedSearch = useDebounce(searchQuery, SYSTEM_LIMITS.SEARCH_DEBOUNCE_MS);

  // Handle file upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUploadError(null);
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.name.toLowerCase().endsWith('.csv') && !file.name.toLowerCase().endsWith('.txt')) {
      setUploadError('Invalid file type. Please upload a .csv or .txt file.');
      return;
    }

    if (file.size > SYSTEM_LIMITS.MAX_UPLOAD_FILE_SIZE_BYTES) {
      setUploadError('File exceeds 2MB limit. Please upload a smaller dataset.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result;
      if (typeof content === 'string') {
        const rowCount = content.split(/\r\n|\r|\n/).filter((l) => l.trim().length > 0).length;
        if (rowCount > SYSTEM_LIMITS.MAX_INGESTION_RECORDS) {
          setUploadError(
            `Record limit exceeded. File has ${rowCount} rows (maximum permitted is ${SYSTEM_LIMITS.MAX_INGESTION_RECORDS}).`
          );
          return;
        }
        onDataParsed(content);
      }
    };
    reader.onerror = () => {
      setUploadError('Failed to read the selected file.');
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  // Handle pasted table ingestion
  const handleIngestPasted = () => {
    setUploadError(null);
    const trimmed = pastedText.trim();
    if (!trimmed) {
      setUploadError('Pasted text is empty. Please enter or paste tabular air quality readings.');
      return;
    }

    const rowCount = trimmed.split(/\r\n|\r|\n/).filter((l) => l.trim().length > 0).length;
    if (rowCount > SYSTEM_LIMITS.MAX_INGESTION_RECORDS) {
      setUploadError(
        `Record limit exceeded. Pasted data has ${rowCount} rows (maximum permitted is ${SYSTEM_LIMITS.MAX_INGESTION_RECORDS}).`
      );
      return;
    }

    onDataParsed(trimmed);
    setPastedText('');
  };

  // Manual Entry row adder
  const handleAddManualRow = () => {
    setUploadError(null);
    if (!manualForm.location.trim()) {
      setUploadError('Location / Station name is required.');
      return;
    }
    if (!manualForm.pm25.trim() && !manualForm.aqi.trim() && !manualForm.pm10.trim()) {
      setUploadError('Please provide at least one measurement (AQI, PM2.5, or PM10).');
      return;
    }

    setDraftBatch((prev) => [...prev, { ...manualForm }]);
    setManualForm({
      ...DEFAULT_MANUAL_ROW,
      timestamp: new Date().toISOString().slice(0, 16).replace('T', ' '),
    });
  };

  // Pre-fill sample row for quick testing
  const handlePreFillSampleRow = () => {
    setManualForm({
      location: 'MP Nagar Zone-II',
      ward: 'Ward 45',
      timestamp: new Date().toISOString().slice(0, 16).replace('T', ' '),
      aqi: '245',
      pm25: '168.4',
      pm10: '280.0',
      no2: '48.2',
      so2: '16.5',
      co: '1.8',
    });
  };

  // Ingest drafted batch
  const handleIngestDraftBatch = () => {
    if (draftBatch.length === 0) {
      setUploadError('No draft rows to ingest. Add at least one row first.');
      return;
    }

    const csvHeader = 'Location,Ward,Timestamp,AQI,PM2.5,PM10,NO2,SO2,CO\n';
    const csvRows = draftBatch
      .map(
        (r) =>
          `"${r.location.replace(/"/g, '""')}","${r.ward.replace(/"/g, '""')}","${r.timestamp}",${r.aqi || ''},${r.pm25 || ''},${r.pm10 || ''},${r.no2 || ''},${r.so2 || ''},${r.co || ''}`
      )
      .join('\n');

    onDataParsed(csvHeader + csvRows);
    setDraftBatch([]);
    setActiveMode('upload');
  };

  // Filtered and paginated records
  const filteredRecords = useMemo(() => {
    const q = debouncedSearch.toLowerCase().trim();
    return records.filter((r) => {
      const matchesSearch =
        q === '' ||
        r.location.toLowerCase().includes(q) ||
        r.ward.toLowerCase().includes(q) ||
        r.id.toLowerCase().includes(q);
      const matchesStatus = statusFilter === 'all' || r.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [records, debouncedSearch, statusFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredRecords.length / PAGE_SIZE));
  const paginatedRecords = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return filteredRecords.slice(start, start + PAGE_SIZE);
  }, [filteredRecords, currentPage]);

  return (
    <div className="space-y-6">
      {/* Studio Header & Ingestion Controller */}
      <section aria-label="Data Ingestion Tools" className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-2xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-navy-900 flex items-center space-x-2">
              <FileSpreadsheet className="w-6 h-6 text-emerald-600" aria-hidden="true" />
              <span>Smart Data Ingestion & Normalizer Studio</span>
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Harmonizes multi-format CSV/TXT feeds, converts mixed units (ppm ↔ mg/m³), and flags sensor errors (999.0 µg/m³).
            </p>
          </div>

          <div className="flex items-center space-x-2 shrink-0">
            {records.length > 0 && onResetWorkspace && (
              <button
                type="button"
                onClick={onResetWorkspace}
                aria-label="Remove dataset and reset workspace"
                className="px-3 py-1.5 text-xs font-semibold bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 rounded-xl flex items-center space-x-1.5 transition-all cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5 text-red-600" aria-hidden="true" />
                <span>Reset Dataset</span>
              </button>
            )}

            <button
              type="button"
              onClick={() => onDataParsed(BHOPAL_MESSY_SAMPLE_CSV)}
              aria-label="Load Bhopal Demo Dataset"
              className="px-3 py-1.5 text-xs font-semibold bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-300 rounded-xl flex items-center space-x-1.5 transition-all cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5 text-emerald-600" aria-hidden="true" />
              <span>Load Demo Dataset</span>
            </button>
          </div>
        </div>

        {/* Validation Error Alert */}
        {uploadError && (
          <div
            role="alert"
            className="mt-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center justify-between"
          >
            <div className="flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0" aria-hidden="true" />
              <span className="font-medium">{uploadError}</span>
            </div>
            <button
              type="button"
              onClick={() => setUploadError(null)}
              aria-label="Dismiss error notification"
              className="text-red-500 hover:text-red-700 text-xs font-semibold px-2 py-0.5 cursor-pointer"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Ingestion Mode Toggle Tabs */}
        <div className="flex items-center space-x-2 mt-5 border-b border-slate-100 pb-3">
          <button
            type="button"
            onClick={() => setActiveMode('upload')}
            aria-label="Switch to CSV file upload"
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors flex items-center space-x-1.5 cursor-pointer ${
              activeMode === 'upload'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            <Upload className="w-3.5 h-3.5" aria-hidden="true" />
            <span>Upload CSV / TXT</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveMode('paste')}
            aria-label="Switch to table paste editor"
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors flex items-center space-x-1.5 cursor-pointer ${
              activeMode === 'paste'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            <FileText className="w-3.5 h-3.5" aria-hidden="true" />
            <span>Paste Table</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveMode('manual')}
            aria-label="Switch to structured manual row entry"
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors flex items-center space-x-1.5 cursor-pointer ${
              activeMode === 'manual'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            <Edit3 className="w-3.5 h-3.5" aria-hidden="true" />
            <span>Enter Data Manually</span>
          </button>
        </div>

        {/* Mode 1: File Upload */}
        {activeMode === 'upload' && (
          <div className="mt-5 p-6 rounded-2xl border-2 border-dashed border-slate-200 hover:border-emerald-400 bg-slate-50/50 hover:bg-emerald-50/10 transition-all text-center">
            <Upload className="w-8 h-8 text-emerald-600 mx-auto mb-2" aria-hidden="true" />
            <h2 className="text-sm font-bold text-navy-900">Drag & drop air quality telemetry file</h2>
            <p className="text-xs text-slate-500 mt-1 mb-4">
              Supports .csv and .txt up to 2MB (Max 500 rows per analysis batch).
            </p>
            <label
              htmlFor="telemetry-file-upload"
              className="inline-flex items-center space-x-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-xl shadow-xs cursor-pointer transition-colors"
            >
              <span>Browse File</span>
              <input
                id="telemetry-file-upload"
                type="file"
                accept=".csv,.txt"
                onChange={handleFileUpload}
                className="sr-only"
              />
            </label>
          </div>
        )}

        {/* Mode 2: Paste Table */}
        {activeMode === 'paste' && (
          <div className="mt-5 space-y-3">
            <label htmlFor="csv-paste-area" className="text-xs font-semibold text-slate-700 block">
              Paste Raw Tabular Data (CSV, TSV, or Comma/Tab Delimited)
            </label>
            <textarea
              id="csv-paste-area"
              rows={6}
              value={pastedText}
              onChange={(e) => setPastedText(e.target.value)}
              placeholder="Location,Ward,Timestamp,AQI,PM2.5,PM10,CO&#10;MP Nagar,Ward 45,2026-11-15 10:00,245,168.4 ug/m3,280,1.8 ppm"
              aria-describedby="csv-paste-hint"
              className="w-full p-3 font-mono text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
            />
            <div id="csv-paste-hint" className="text-[11px] text-slate-400">
              Paste header row followed by telemetry rows. Non-standard headers and units will be auto-mapped.
            </div>
            <div className="flex justify-end space-x-2">
              <button
                type="button"
                onClick={() => setPastedText('')}
                aria-label="Clear pasted content"
                className="px-3 py-1.5 text-xs text-slate-600 hover:text-slate-800"
              >
                Clear
              </button>
              <button
                type="button"
                onClick={handleIngestPasted}
                aria-label="Ingest Pasted Telemetry"
                className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-xl shadow-xs transition-colors cursor-pointer"
              >
                Ingest Pasted Data
              </button>
            </div>
          </div>
        )}

        {/* Mode 3: Structured Manual Row Entry Form */}
        {activeMode === 'manual' && (
          <div className="mt-5 space-y-4">
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                  Add Sensor Monitoring Record
                </h2>
                <button
                  type="button"
                  onClick={handlePreFillSampleRow}
                  aria-label="Pre-fill sample data row"
                  className="text-[11px] font-semibold text-emerald-600 hover:text-emerald-800 cursor-pointer"
                >
                  + Pre-fill Sample Row
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 text-xs">
                <div>
                  <label htmlFor="manual-location" className="font-semibold text-slate-700 block mb-1">
                    Location / Station *
                  </label>
                  <input
                    id="manual-location"
                    type="text"
                    value={manualForm.location}
                    onChange={(e) => setManualForm({ ...manualForm, location: e.target.value })}
                    placeholder="e.g. MP Nagar Zone-II"
                    className="w-full p-2 border border-slate-300 rounded-lg text-xs"
                  />
                </div>

                <div>
                  <label htmlFor="manual-ward" className="font-semibold text-slate-700 block mb-1">
                    Ward
                  </label>
                  <input
                    id="manual-ward"
                    type="text"
                    value={manualForm.ward}
                    onChange={(e) => setManualForm({ ...manualForm, ward: e.target.value })}
                    placeholder="e.g. Ward 45"
                    className="w-full p-2 border border-slate-300 rounded-lg text-xs"
                  />
                </div>

                <div>
                  <label htmlFor="manual-timestamp" className="font-semibold text-slate-700 block mb-1">
                    Timestamp
                  </label>
                  <input
                    id="manual-timestamp"
                    type="text"
                    value={manualForm.timestamp}
                    onChange={(e) => setManualForm({ ...manualForm, timestamp: e.target.value })}
                    placeholder="YYYY-MM-DD HH:mm"
                    className="w-full p-2 border border-slate-300 rounded-lg text-xs font-mono"
                  />
                </div>

                <div>
                  <label htmlFor="manual-aqi" className="font-semibold text-slate-700 block mb-1">
                    AQI (0-500)
                  </label>
                  <input
                    id="manual-aqi"
                    type="number"
                    value={manualForm.aqi}
                    onChange={(e) => setManualForm({ ...manualForm, aqi: e.target.value })}
                    placeholder="e.g. 245"
                    className="w-full p-2 border border-slate-300 rounded-lg text-xs font-mono"
                  />
                </div>

                <div>
                  <label htmlFor="manual-pm25" className="font-semibold text-slate-700 block mb-1">
                    PM2.5 (µg/m³) *
                  </label>
                  <input
                    id="manual-pm25"
                    type="number"
                    step="0.1"
                    value={manualForm.pm25}
                    onChange={(e) => setManualForm({ ...manualForm, pm25: e.target.value })}
                    placeholder="e.g. 168.4"
                    className="w-full p-2 border border-slate-300 rounded-lg text-xs font-mono"
                  />
                </div>

                <div>
                  <label htmlFor="manual-pm10" className="font-semibold text-slate-700 block mb-1">
                    PM10 (µg/m³)
                  </label>
                  <input
                    id="manual-pm10"
                    type="number"
                    step="0.1"
                    value={manualForm.pm10}
                    onChange={(e) => setManualForm({ ...manualForm, pm10: e.target.value })}
                    placeholder="e.g. 280.0"
                    className="w-full p-2 border border-slate-300 rounded-lg text-xs font-mono"
                  />
                </div>

                <div>
                  <label htmlFor="manual-no2" className="font-semibold text-slate-700 block mb-1">
                    NO2 (µg/m³)
                  </label>
                  <input
                    id="manual-no2"
                    type="number"
                    step="0.1"
                    value={manualForm.no2}
                    onChange={(e) => setManualForm({ ...manualForm, no2: e.target.value })}
                    placeholder="e.g. 48.2"
                    className="w-full p-2 border border-slate-300 rounded-lg text-xs font-mono"
                  />
                </div>

                <div>
                  <label htmlFor="manual-so2" className="font-semibold text-slate-700 block mb-1">
                    SO2 (µg/m³)
                  </label>
                  <input
                    id="manual-so2"
                    type="number"
                    step="0.1"
                    value={manualForm.so2}
                    onChange={(e) => setManualForm({ ...manualForm, so2: e.target.value })}
                    placeholder="e.g. 16.5"
                    className="w-full p-2 border border-slate-300 rounded-lg text-xs font-mono"
                  />
                </div>

                <div>
                  <label htmlFor="manual-co" className="font-semibold text-slate-700 block mb-1">
                    CO (mg/m³)
                  </label>
                  <input
                    id="manual-co"
                    type="number"
                    step="0.1"
                    value={manualForm.co}
                    onChange={(e) => setManualForm({ ...manualForm, co: e.target.value })}
                    placeholder="e.g. 1.8"
                    className="w-full p-2 border border-slate-300 rounded-lg text-xs font-mono"
                  />
                </div>

                <div className="flex items-end">
                  <button
                    type="button"
                    onClick={handleAddManualRow}
                    aria-label="Add row to draft batch"
                    className="w-full py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-lg font-semibold text-xs transition-colors flex items-center justify-center space-x-1 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" aria-hidden="true" />
                    <span>Add Row</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Draft Batch Table Preview */}
            {draftBatch.length > 0 && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold text-slate-800">
                    Draft Batch Queue ({draftBatch.length} {draftBatch.length === 1 ? 'Record' : 'Records'})
                  </h3>
                  <button
                    type="button"
                    onClick={handleIngestDraftBatch}
                    aria-label="Confirm and Ingest Draft Records"
                    className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold shadow-xs transition-colors cursor-pointer"
                  >
                    Confirm & Ingest ({draftBatch.length} Records)
                  </button>
                </div>

                <div className="border border-slate-200 rounded-xl overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-100 text-slate-700 font-semibold border-b border-slate-200">
                      <tr>
                        <th className="py-2 px-3">Location</th>
                        <th className="py-2 px-3">Ward</th>
                        <th className="py-2 px-3">Timestamp</th>
                        <th className="py-2 px-3">AQI</th>
                        <th className="py-2 px-3">PM2.5</th>
                        <th className="py-2 px-3">PM10</th>
                        <th className="py-2 px-3 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {draftBatch.map((row, idx) => (
                        <tr key={idx} className="hover:bg-slate-50">
                          <td className="py-2 px-3 font-medium text-navy-900">{row.location}</td>
                          <td className="py-2 px-3 text-slate-600">{row.ward || 'N/A'}</td>
                          <td className="py-2 px-3 font-mono text-[11px] text-slate-500">{row.timestamp}</td>
                          <td className="py-2 px-3 font-mono">{row.aqi || 'N/A'}</td>
                          <td className="py-2 px-3 font-mono">{row.pm25 || 'N/A'}</td>
                          <td className="py-2 px-3 font-mono">{row.pm10 || 'N/A'}</td>
                          <td className="py-2 px-3 text-right">
                            <button
                              type="button"
                              onClick={() => setDraftBatch((prev) => prev.filter((_, i) => i !== idx))}
                              aria-label={`Remove row ${idx + 1}`}
                              className="text-red-500 hover:text-red-700 text-xs font-medium cursor-pointer"
                            >
                              Remove
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}
      </section>

      {/* Quality Audit Report Summary Cards */}
      {qualityReport && (
        <section aria-label="Ingestion Audit Report" className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          <div className="p-4 bg-white rounded-2xl border border-slate-200/90 shadow-2xs">
            <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1">Total Rows</div>
            <div className="text-2xl font-black text-navy-900 font-mono">{qualityReport.totalRecords}</div>
            <div className="text-[11px] text-slate-400 mt-0.5">Raw Telemetry Entries</div>
          </div>

          <div className="p-4 bg-white rounded-2xl border border-slate-200/90 shadow-2xs">
            <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1">Valid Records</div>
            <div className="text-2xl font-black text-emerald-600 font-mono">{qualityReport.validRecords}</div>
            <div className="text-[11px] text-emerald-700 mt-0.5 font-medium">Passed Sanity Check</div>
          </div>

          <div className="p-4 bg-white rounded-2xl border border-slate-200/90 shadow-2xs">
            <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1">Sensor Saturation</div>
            <div className="text-2xl font-black text-amber-600 font-mono">{qualityReport.invalidValues + qualityReport.suspiciousObservations}</div>
            <div className="text-[11px] text-amber-700 mt-0.5 font-medium">Isolated from Averages</div>
          </div>

          <div className="p-4 bg-white rounded-2xl border border-slate-200/90 shadow-2xs">
            <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1">Duplicates Dropped</div>
            <div className="text-2xl font-black text-blue-600 font-mono">{qualityReport.duplicateRecords}</div>
            <div className="text-[11px] text-blue-700 mt-0.5 font-medium">Deduplicated</div>
          </div>

          <div className="p-4 bg-white rounded-2xl border border-slate-200/90 shadow-2xs col-span-2 sm:col-span-1">
            <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1">Units Harmonized</div>
            <div className="text-2xl font-black text-emerald-600 font-mono">100%</div>
            <div className="text-[11px] text-slate-400 mt-0.5">ppm ↔ mg/m³ converted</div>
          </div>
        </section>
      )}

      {/* Telemetry Data Grid */}
      <section aria-label="Ingested Telemetry Grid" className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-sm font-bold text-navy-900 flex items-center space-x-2">
              <span>Ingested Telemetry Records ({filteredRecords.length})</span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Verified records with exact IDs, sensor coordinates, and CPCB status categories.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Search Input */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" aria-hidden="true" />
              <input
                type="text"
                placeholder="Search location, ward, or ID..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
                aria-label="Filter records by location, ward, or record ID"
                className="pl-8 pr-3 py-1.5 rounded-xl border border-slate-200 text-xs text-slate-800 placeholder-slate-400 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden w-56"
              />
            </div>

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setCurrentPage(1);
              }}
              aria-label="Filter by verification status"
              className="py-1.5 px-3 rounded-xl border border-slate-200 text-xs text-slate-700 bg-white focus:outline-hidden cursor-pointer"
            >
              <option value="all">All Records</option>
              <option value="valid">Valid Only</option>
              <option value="suspicious">Suspicious</option>
              <option value="missing_critical">Missing Critical</option>
            </select>
          </div>
        </div>

        {/* Data Table */}
        {filteredRecords.length === 0 ? (
          <div className="p-12 text-center text-slate-400 text-xs">
            {records.length === 0
              ? 'No telemetry records ingested yet. Upload a CSV file or enter data above to get started.'
              : 'No records matching the filter query.'}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-200">
                <tr>
                  <th scope="col" className="py-3 px-4">Record ID</th>
                  <th scope="col" className="py-3 px-4">Location</th>
                  <th scope="col" className="py-3 px-4">Ward</th>
                  <th scope="col" className="py-3 px-4">Timestamp</th>
                  <th scope="col" className="py-3 px-4">PM2.5 (µg/m³)</th>
                  <th scope="col" className="py-3 px-4">PM10 (µg/m³)</th>
                  <th scope="col" className="py-3 px-4">AQI</th>
                  <th scope="col" className="py-3 px-4">CO (mg/m³)</th>
                  <th scope="col" className="py-3 px-4">Status</th>
                  <th scope="col" className="py-3 px-4 text-right">Audit</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {paginatedRecords.map((rec) => (
                  <DataStudioRow key={rec.id} rec={rec} onOpenTrace={onOpenTrace} />
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Footer */}
        {filteredRecords.length > PAGE_SIZE && (
          <div className="p-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>
              Showing {(currentPage - 1) * PAGE_SIZE + 1} to{' '}
              {Math.min(currentPage * PAGE_SIZE, filteredRecords.length)} of {filteredRecords.length} records
            </span>
            <div className="flex items-center space-x-1">
              <button
                type="button"
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                aria-label="Previous Page"
                className="p-1.5 rounded-lg border border-slate-200 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50 cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" aria-hidden="true" />
              </button>
              <span className="px-2 font-medium text-slate-700">
                {currentPage} / {totalPages}
              </span>
              <button
                type="button"
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                aria-label="Next Page"
                className="p-1.5 rounded-lg border border-slate-200 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50 cursor-pointer"
              >
                <ChevronRight className="w-4 h-4" aria-hidden="true" />
              </button>
            </div>
          </div>
        )}
      </section>
    </div>
  );
};
