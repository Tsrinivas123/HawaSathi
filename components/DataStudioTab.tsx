'use strict';
import React, { useState } from 'react';
import {
  Upload,
  FileSpreadsheet,
  AlertCircle,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Sparkles,
  FileText,
  Search,
  Filter,
  Check,
  HelpCircle,
  Eye,
} from 'lucide-react';
import { AirRecord, DataQualityReport } from '@/lib/types';
import { BHOPAL_MESSY_SAMPLE_CSV, CLEAN_BENCHMARK_CSV } from '@/lib/sampleData';

interface DataStudioTabProps {
  records: AirRecord[];
  qualityReport: DataQualityReport | null;
  onDataParsed: (rawCsv: string) => void;
  onOpenTrace: (recordId: string) => void;
}

export const DataStudioTab: React.FC<DataStudioTabProps> = ({
  records,
  qualityReport,
  onDataParsed,
  onOpenTrace,
}) => {
  const [pasteMode, setPasteMode] = useState(false);
  const [pastedText, setPastedText] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'valid' | 'suspicious' | 'missing_critical'>('all');

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

  const filteredRecords = records.filter((r) => {
    const matchesSearch =
      r.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.ward.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.id.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || r.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getAqiColor = (aqi: number | null) => {
    if (aqi === null) return 'text-slate-400 bg-slate-100 border-slate-200';
    if (aqi <= 50) return 'text-emerald-700 bg-emerald-50 border-emerald-300';
    if (aqi <= 100) return 'text-lime-700 bg-lime-50 border-lime-300';
    if (aqi <= 200) return 'text-amber-700 bg-amber-50 border-amber-300';
    if (aqi <= 300) return 'text-orange-700 bg-orange-50 border-orange-300';
    if (aqi <= 400) return 'text-red-700 bg-red-50 border-red-300';
    return 'text-purple-700 bg-purple-50 border-purple-300';
  };

  return (
    <div className="space-y-6">
      {/* Ingestion & Sample Data Loader Banner */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div>
            <h2 className="text-base font-bold text-navy-900 flex items-center space-x-2">
              <FileSpreadsheet className="w-5 h-5 text-emerald-600" />
              <span>Smart Data Ingestion & Normalizer</span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Handles messy multi-format CSVs, unit discrepancies (ppm ↔ mg/m³), sensor outliers, and missing timestamps.
            </p>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => onDataParsed(BHOPAL_MESSY_SAMPLE_CSV)}
              className="px-3 py-1.5 text-xs font-semibold bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-300 rounded-lg flex items-center space-x-1.5 transition-all cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Load Bhopal Feed [DEMO DATA]</span>
            </button>
            <button
              onClick={() => onDataParsed(CLEAN_BENCHMARK_CSV)}
              className="px-3 py-1.5 text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300 rounded-lg flex items-center space-x-1.5 transition-all cursor-pointer"
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Load Clean Baseline [DEMO DATA]</span>
            </button>
          </div>
        </div>

        {/* Upload / Paste Controls */}
        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* File Upload Box */}
          <label className="border-2 border-dashed border-slate-300 hover:border-emerald-500 rounded-xl p-5 flex flex-col items-center justify-center text-center cursor-pointer bg-slate-50/50 hover:bg-emerald-50/30 transition-all">
            <Upload className="w-8 h-8 text-slate-400 mb-2" />
            <span className="text-xs font-bold text-navy-900">Upload CSV or Tabular Data File</span>
            <span className="text-[11px] text-slate-500 mt-1">
              Supports irregular column headers, missing units, and date variants
            </span>
            <input
              type="file"
              accept=".csv,.txt"
              onChange={handleFileUpload}
              className="hidden"
            />
          </label>

          {/* Paste Raw Tabular Data Box */}
          <div className="border border-slate-200 rounded-xl p-4 bg-slate-50/50 flex flex-col justify-between">
            {!pasteMode ? (
              <div className="flex flex-col items-center justify-center text-center h-full py-2">
                <FileText className="w-8 h-8 text-slate-400 mb-2" />
                <span className="text-xs font-bold text-navy-900">Paste Raw Data from Clipboard</span>
                <span className="text-[11px] text-slate-500 mt-1 mb-3">
                  Paste copied tables from spreadsheets, portals, or log streams
                </span>
                <button
                  onClick={() => setPasteMode(true)}
                  className="px-3 py-1.5 text-xs font-medium text-navy-900 bg-white hover:bg-slate-100 border border-slate-300 rounded-lg cursor-pointer"
                >
                  Open Paste Editor
                </button>
              </div>
            ) : (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-navy-900">Paste Table Text Below</span>
                  <button
                    onClick={() => setPasteMode(false)}
                    className="text-xs text-slate-500 hover:text-slate-800"
                  >
                    Cancel
                  </button>
                </div>
                <textarea
                  value={pastedText}
                  onChange={(e) => setPastedText(e.target.value)}
                  placeholder="Paste comma or tab-separated data here..."
                  className="w-full h-24 p-2 text-xs font-mono bg-white border border-slate-300 rounded-lg focus:outline-hidden focus:border-emerald-500"
                />
                <button
                  onClick={handlePasteSubmit}
                  className="w-full py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs rounded-lg transition-all cursor-pointer"
                >
                  Ingest & Normalize Pasted Data
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Data Quality Report Audit Card */}
      {qualityReport && (
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
            <div className="flex items-center space-x-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
              <h3 className="text-sm font-bold text-navy-900">
                Data Quality & Normalization Audit
              </h3>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-xs text-slate-500">Quality Completeness:</span>
              <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                {qualityReport.dataCompletenessPct}% Complete
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
              <div className="text-[11px] font-medium text-slate-500">Total Records</div>
              <div className="text-lg font-bold text-navy-900">{qualityReport.totalRecords}</div>
            </div>
            <div className="p-3 bg-emerald-50/50 rounded-lg border border-emerald-200">
              <div className="text-[11px] font-medium text-emerald-700">Valid Records</div>
              <div className="text-lg font-bold text-emerald-800">{qualityReport.validRecords}</div>
            </div>
            <div className="p-3 bg-amber-50/50 rounded-lg border border-amber-200">
              <div className="text-[11px] font-medium text-amber-700">Missing Values</div>
              <div className="text-lg font-bold text-amber-800">{qualityReport.missingReadings}</div>
            </div>
            <div className="p-3 bg-purple-50/50 rounded-lg border border-purple-200">
              <div className="text-[11px] font-medium text-purple-700">Duplicates Detected</div>
              <div className="text-lg font-bold text-purple-800">{qualityReport.duplicateRecords}</div>
            </div>
            <div className="p-3 bg-red-50/50 rounded-lg border border-red-200">
              <div className="text-[11px] font-medium text-red-700">Suspicious Outliers</div>
              <div className="text-lg font-bold text-red-800">{qualityReport.suspiciousObservations}</div>
            </div>
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
              <div className="text-[11px] font-medium text-slate-500">Units Harmonized</div>
              <div className="text-xs font-mono font-bold text-slate-700 mt-1 truncate">
                PM: µg/m³, CO: mg/m³
              </div>
            </div>
          </div>

          {/* Warnings & Conversions Log */}
          {qualityReport.warnings.length > 0 && (
            <div className="mt-4 p-3 bg-amber-50/70 border border-amber-200 rounded-lg">
              <div className="text-xs font-bold text-amber-800 flex items-center space-x-1.5 mb-1.5">
                <AlertTriangle className="w-3.5 h-3.5" />
                <span>Validation Warnings & Applied Transformations ({qualityReport.warnings.length})</span>
              </div>
              <ul className="text-[11px] text-amber-900 space-y-1 max-h-24 overflow-y-auto">
                {qualityReport.warnings.map((w, idx) => (
                  <li key={idx} className="flex items-start space-x-1.5">
                    <span className="font-bold">•</span>
                    <span>{w}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* Normalized Data Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        {/* Table Filters Header */}
        <div className="p-4 border-b border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 bg-slate-50/60">
          <div className="flex items-center space-x-2 w-full sm:w-auto">
            <div className="relative w-full sm:w-64">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
              <input
                type="text"
                placeholder="Search location, ward, or record ID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 text-xs bg-white border border-slate-300 rounded-lg focus:outline-hidden focus:border-emerald-500"
              />
            </div>
          </div>

          <div className="flex items-center space-x-2 w-full sm:w-auto justify-end">
            <span className="text-xs text-slate-500 font-medium">Filter Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="text-xs bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-slate-700 focus:outline-hidden"
            >
              <option value="all">All Records ({records.length})</option>
              <option value="valid">Valid Only</option>
              <option value="suspicious">Suspicious / Outliers</option>
              <option value="missing_critical">Missing Critical Data</option>
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-100/80 text-slate-600 font-semibold border-b border-slate-200 uppercase text-[10px] tracking-wider">
                <th className="py-2.5 px-4">Record ID</th>
                <th className="py-2.5 px-4">Location / Ward</th>
                <th className="py-2.5 px-3">Timestamp</th>
                <th className="py-2.5 px-3 text-right">PM2.5 (µg/m³)</th>
                <th className="py-2.5 px-3 text-right">PM10 (µg/m³)</th>
                <th className="py-2.5 px-3 text-center">AQI (CPCB)</th>
                <th className="py-2.5 px-3 text-right">CO (mg/m³)</th>
                <th className="py-2.5 px-3">Quality Status</th>
                <th className="py-2.5 px-4 text-center">Audit Trace</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filteredRecords.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-8 text-center text-slate-400">
                    No records found matching current query or dataset empty.
                  </td>
                </tr>
              ) : (
                filteredRecords.map((row) => (
                  <tr key={row.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-2.5 px-4 font-mono font-bold text-navy-900">
                      {row.id}
                    </td>
                    <td className="py-2.5 px-4">
                      <div className="font-semibold text-slate-800">{row.location}</div>
                      <div className="text-[10px] text-slate-400 font-mono">{row.ward}</div>
                    </td>
                    <td className="py-2.5 px-3 text-slate-500 text-[11px] whitespace-nowrap">
                      {row.timestamp}
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono font-medium">
                      {row.pm25 !== null ? row.pm25 : <span className="text-slate-400">—</span>}
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono font-medium">
                      {row.pm10 !== null ? row.pm10 : <span className="text-slate-400">—</span>}
                    </td>
                    <td className="py-2.5 px-3 text-center">
                      <span
                        className={`inline-block font-mono font-bold px-2 py-0.5 rounded text-[11px] border ${getAqiColor(
                          row.aqi
                        )}`}
                      >
                        {row.aqi !== null ? row.aqi : 'N/A'}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono">
                      {row.co !== null ? row.co : <span className="text-slate-400">—</span>}
                    </td>
                    <td className="py-2.5 px-3">
                      {row.status === 'valid' && (
                        <span className="inline-flex items-center space-x-1 text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded text-[10px] font-semibold border border-emerald-200">
                          <CheckCircle2 className="w-3 h-3" />
                          <span>Valid</span>
                        </span>
                      )}
                      {row.status === 'suspicious' && (
                        <span className="inline-flex items-center space-x-1 text-amber-700 bg-amber-50 px-2 py-0.5 rounded text-[10px] font-semibold border border-amber-200" title={row.flags.join('; ')}>
                          <AlertTriangle className="w-3 h-3" />
                          <span>Suspicious</span>
                        </span>
                      )}
                      {row.status === 'missing_critical' && (
                        <span className="inline-flex items-center space-x-1 text-red-700 bg-red-50 px-2 py-0.5 rounded text-[10px] font-semibold border border-red-200" title={row.flags.join('; ')}>
                          <AlertCircle className="w-3 h-3" />
                          <span>Missing</span>
                        </span>
                      )}
                    </td>
                    <td className="py-2.5 px-4 text-center">
                      <button
                        onClick={() => onOpenTrace(row.id)}
                        className="p-1 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded transition-all cursor-pointer"
                        title="View Raw Evidence Trace"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
