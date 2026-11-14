'use strict';
/**
 * @file DataStudioTab.tsx
 * @description Ingestion, normalizer telemetry audit, and searchable data grid.
 * Optimized with search debouncing, memoized filtering, and DRY color helpers.
 */

import React, { useState, useMemo, memo, useEffect } from 'react';
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
} from 'lucide-react';
import { AirRecord, DataQualityReport } from '@/lib/types';
import { BHOPAL_MESSY_SAMPLE_CSV } from '@/lib/sampleData';
import { useDebounce } from '@/hooks/useDebounce';
import { getAqiBadgeClasses } from '@/lib/utils';

interface DataStudioTabProps {
  records: AirRecord[];
  qualityReport: DataQualityReport | null;
  onDataParsed: (rawCsv: string) => void;
  onOpenTrace: (recordId: string) => void;
}

const PAGE_SIZE = 10;

const DataStudioTabComponent: React.FC<DataStudioTabProps> = ({
  records,
  qualityReport,
  onDataParsed,
  onOpenTrace,
}) => {
  const [pasteMode, setPasteMode] = useState(false);
  const [pastedText, setPastedText] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'valid' | 'suspicious' | 'missing_critical'>('all');
  const [currentPage, setCurrentPage] = useState(1);

  // Debounce search query to prevent high-frequency table filtering on every keystroke
  const debouncedSearch = useDebounce(searchQuery, 250);

  // Reset to first page whenever search or status filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearch, statusFilter]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      if (text) onDataParsed(text);
    };
    reader.readAsText(file);
  };

  const handlePasteSubmit = () => {
    if (pastedText.trim()) {
      onDataParsed(pastedText.trim());
      setPasteMode(false);
    }
  };

  // Performance efficiency: memoize filtered records with debounced query
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
      {/* Ingestion & Sample Data Loader Banner */}
      <section aria-label="Data Ingestion Tools" className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-2xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div>
            <h2 className="text-base font-bold text-navy-900 flex items-center space-x-2">
              <FileSpreadsheet className="w-5 h-5 text-emerald-600" aria-hidden="true" />
              <span>Smart Data Ingestion & Normalizer Studio</span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Handles messy multi-format CSVs, unit discrepancies (ppm ↔ mg/m³), sensor saturation (999.0 µg/m³), and missing readings.
            </p>
          </div>

          <div className="flex items-center space-x-2">
            <button
              type="button"
              onClick={() => onDataParsed(BHOPAL_MESSY_SAMPLE_CSV)}
              aria-label="Load Bhopal Sample Telemetry"
              className="px-3 py-1.5 text-xs font-semibold bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-300 rounded-xl flex items-center space-x-1.5 transition-all cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5 text-emerald-600" aria-hidden="true" />
              <span>Load Sample Data</span>
            </button>
          </div>
        </div>

        {/* Upload / Paste Controls */}
        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* File Upload Box */}
          <label
            htmlFor="csv-file-upload"
            className="border-2 border-dashed border-slate-300 hover:border-emerald-500 rounded-2xl p-6 flex flex-col items-center justify-center text-center cursor-pointer bg-slate-50/50 hover:bg-emerald-50/20 transition-all"
          >
            <Upload className="w-8 h-8 text-slate-400 mb-2" aria-hidden="true" />
            <span className="text-xs font-bold text-navy-900">Upload CSV or Tabular Data File</span>
            <span className="text-[11px] text-slate-500 mt-1">
              Drag & drop or click to browse (.csv, .tsv, .txt)
            </span>
            <input
              id="csv-file-upload"
              type="file"
              accept=".csv,.txt,.tsv"
              onChange={handleFileUpload}
              aria-label="Upload CSV air quality data file"
              className="sr-only"
            />
          </label>

          {/* Paste Raw Tabular Data Box */}
          <div className="border border-slate-200 rounded-2xl p-4 bg-slate-50/50 flex flex-col justify-between">
            {!pasteMode ? (
              <div className="flex flex-col items-center justify-center text-center h-full py-2">
                <FileText className="w-8 h-8 text-slate-400 mb-2" aria-hidden="true" />
                <span className="text-xs font-bold text-navy-900">Paste Raw Data from Clipboard</span>
                <span className="text-[11px] text-slate-500 mt-1 mb-3">
                  Paste copied tables from spreadsheets, portals, or log streams
                </span>
                <button
                  type="button"
                  onClick={() => setPasteMode(true)}
                  aria-label="Open clipboard text paste editor"
                  className="px-3 py-1.5 text-xs font-medium text-navy-900 bg-white hover:bg-slate-100 border border-slate-300 rounded-lg cursor-pointer"
                >
                  Open Paste Editor
                </button>
              </div>
            ) : (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label htmlFor="raw-pasted-data" className="text-xs font-bold text-navy-900">
                    Paste Table Text Below
                  </label>
                  <button
                    type="button"
                    onClick={() => setPasteMode(false)}
                    aria-label="Cancel paste mode"
                    className="text-xs text-slate-500 hover:text-slate-800"
                  >
                    Cancel
                  </button>
                </div>
                <textarea
                  id="raw-pasted-data"
                  value={pastedText}
                  onChange={(e) => setPastedText(e.target.value)}
                  placeholder="Paste comma or tab-separated data here..."
                  aria-label="Raw tabular data input"
                  className="w-full h-24 p-2 text-xs font-mono bg-white border border-slate-300 rounded-lg focus:outline-hidden focus:border-emerald-500"
                />
                <button
                  type="button"
                  onClick={handlePasteSubmit}
                  aria-label="Ingest and normalize pasted data"
                  className="w-full py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs rounded-lg transition-all cursor-pointer"
                >
                  Ingest & Normalize Pasted Data
                </button>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Data Quality Report Audit Card */}
      {qualityReport && (
        <section aria-label="Data Quality Audit" className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-2xs">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
            <div className="flex items-center space-x-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-600" aria-hidden="true" />
              <h3 className="text-sm font-bold text-navy-900">
                Data Quality & Normalization Audit
              </h3>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-xs text-slate-500">Quality Completeness:</span>
              <span className="text-xs font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                {qualityReport.dataCompletenessPct}% Complete
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
              <div className="text-[11px] font-medium text-slate-500">Total Records</div>
              <div className="text-lg font-bold text-navy-900">{qualityReport.totalRecords}</div>
            </div>
            <div className="p-3 bg-emerald-50/50 rounded-xl border border-emerald-200">
              <div className="text-[11px] font-medium text-emerald-700">Valid Records</div>
              <div className="text-lg font-bold text-emerald-800">{qualityReport.validRecords}</div>
            </div>
            <div className="p-3 bg-amber-50/50 rounded-xl border border-amber-200">
              <div className="text-[11px] font-medium text-amber-700">Missing Values</div>
              <div className="text-lg font-bold text-amber-800">{qualityReport.missingReadings}</div>
            </div>
            <div className="p-3 bg-purple-50/50 rounded-xl border border-purple-200">
              <div className="text-[11px] font-medium text-purple-700">Duplicates Detected</div>
              <div className="text-lg font-bold text-purple-800">{qualityReport.duplicateRecords}</div>
            </div>
            <div className="p-3 bg-red-50/50 rounded-xl border border-red-200">
              <div className="text-[11px] font-medium text-red-700">Suspicious Outliers</div>
              <div className="text-lg font-bold text-red-800">{qualityReport.suspiciousObservations}</div>
            </div>
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
              <div className="text-[11px] font-medium text-slate-500">Units Harmonized</div>
              <div className="text-xs font-mono font-bold text-slate-700 mt-1 truncate">
                PM: µg/m³, CO: mg/m³
              </div>
            </div>
          </div>

          {/* Warnings & Conversions Log */}
          {qualityReport.warnings.length > 0 && (
            <div className="mt-4 p-3 bg-amber-50/70 border border-amber-200 rounded-xl">
              <div className="flex items-center space-x-2 text-xs font-bold text-amber-800 mb-1">
                <AlertCircle className="w-4 h-4 text-amber-600" aria-hidden="true" />
                <span>Validation & Unit Transformation Warnings:</span>
              </div>
              <ul className="text-[11px] text-amber-900 list-disc list-inside space-y-1">
                {qualityReport.warnings.map((warn, i) => (
                  <li key={i}>{warn}</li>
                ))}
              </ul>
            </div>
          )}
        </section>
      )}

      {/* Ingested Records Table */}
      <section aria-label="Ingested Records Studio" className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs overflow-hidden">
        {/* Table Search & Filter Bar */}
        <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3 bg-slate-50/50">
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" aria-hidden="true" />
            <label htmlFor="record-search" className="sr-only">Search records</label>
            <input
              id="record-search"
              type="text"
              placeholder="Search station, ward, ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              aria-label="Search records by location, ward, or record ID"
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-white border border-slate-300 rounded-xl focus:outline-hidden focus:border-emerald-500"
            />
          </div>

          <div className="flex items-center space-x-2 w-full sm:w-auto justify-end">
            <Filter className="w-3.5 h-3.5 text-slate-500" aria-hidden="true" />
            <label htmlFor="status-filter" className="text-xs text-slate-500">Status:</label>
            <select
              id="status-filter"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as 'all' | 'valid' | 'suspicious' | 'missing_critical')}
              aria-label="Filter records by validity status"
              className="text-xs bg-white border border-slate-300 rounded-xl px-2.5 py-1.5 text-slate-700 cursor-pointer"
            >
              <option value="all">All Records ({records.length})</option>
              <option value="valid">Valid Records</option>
              <option value="suspicious">Suspicious / Outliers</option>
              <option value="missing_critical">Missing Critical</option>
            </select>
          </div>
        </div>

        {/* The Clean Tabular View */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs" aria-label="Normalized Air Quality Telemetry Records">
            <thead className="bg-slate-100/70 text-slate-600 font-semibold border-b border-slate-200">
              <tr>
                <th scope="col" className="py-3 px-4">Record ID</th>
                <th scope="col" className="py-3 px-4">Location / Station</th>
                <th scope="col" className="py-3 px-4">Ward</th>
                <th scope="col" className="py-3 px-4">Timestamp</th>
                <th scope="col" className="py-3 px-4">PM2.5 (µg/m³)</th>
                <th scope="col" className="py-3 px-4">PM10 (µg/m³)</th>
                <th scope="col" className="py-3 px-4">AQI</th>
                <th scope="col" className="py-3 px-4">CO (mg/m³)</th>
                <th scope="col" className="py-3 px-4">Data Quality Status</th>
                <th scope="col" className="py-3 px-4 text-right">Audit Trace</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {paginatedRecords.map((rec) => (
                <tr key={rec.id} className="hover:bg-slate-50/80 transition-colors">
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
                      aria-label={`Audit Trace Record ${rec.id}`}
                      className="p-1.5 hover:bg-slate-200 text-slate-600 hover:text-navy-900 rounded-lg transition-colors cursor-pointer"
                    >
                      <Eye className="w-4 h-4" aria-hidden="true" />
                      <span className="sr-only">Audit {rec.id}</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        <div className="p-3.5 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500 bg-slate-50/30">
          <div>
            Showing <span className="font-semibold text-slate-700">{(currentPage - 1) * PAGE_SIZE + 1}</span> to{' '}
            <span className="font-semibold text-slate-700">
              {Math.min(currentPage * PAGE_SIZE, filteredRecords.length)}
            </span>{' '}
            of <span className="font-semibold text-slate-700">{filteredRecords.length}</span> records
          </div>
          <div className="flex items-center space-x-2">
            <button
              type="button"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              aria-label="Previous Page"
              className={`px-2.5 py-1 rounded-lg border flex items-center space-x-1 ${
                currentPage === 1
                  ? 'border-slate-200 text-slate-300 cursor-not-allowed'
                  : 'border-slate-300 text-slate-700 hover:bg-white cursor-pointer'
              }`}
            >
              <ChevronLeft className="w-3.5 h-3.5" aria-hidden="true" />
              <span>Previous</span>
            </button>
            <span className="px-2 font-mono text-[11px] font-semibold text-slate-700">
              Page {currentPage} of {totalPages}
            </span>
            <button
              type="button"
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              aria-label="Next Page"
              className={`px-2.5 py-1 rounded-lg border flex items-center space-x-1 ${
                currentPage === totalPages
                  ? 'border-slate-200 text-slate-300 cursor-not-allowed'
                  : 'border-slate-300 text-slate-700 hover:bg-white cursor-pointer'
              }`}
            >
              <span>Next</span>
              <ChevronRight className="w-3.5 h-3.5" aria-hidden="true" />
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};

export const DataStudioTab = memo(DataStudioTabComponent);
