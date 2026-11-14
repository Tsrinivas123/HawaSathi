'use strict';
import React from 'react';
import {
  X,
  FileCheck2,
  AlertTriangle,
  CheckCircle2,
  MapPin,
  Clock,
  Cpu,
  Layers,
} from 'lucide-react';
import { AirRecord } from '@/lib/types';

interface TraceModalProps {
  record: AirRecord | null;
  onClose: () => void;
}

export const TraceModal: React.FC<TraceModalProps> = ({ record, onClose }) => {
  if (!record) return null;

  return (
    <div className="fixed inset-0 z-50 bg-navy-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-lg w-full overflow-hidden">
        {/* Modal Header */}
        <div className="p-5 bg-gradient-to-r from-navy-900 to-navy-850 text-white flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center">
              <FileCheck2 className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-mono font-bold text-sm">{record.id}</span>
                <span
                  className={`text-[10px] px-2 py-0.5 rounded font-semibold uppercase ${
                    record.status === 'valid'
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                      : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                  }`}
                >
                  {record.status}
                </span>
              </div>
              <p className="text-[11px] text-slate-300">Raw Data Evidence & Normalization Trace</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-all cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-5 space-y-4 max-h-[80vh] overflow-y-auto text-xs">
          {/* Spatial & Temporal Metadata */}
          <div className="grid grid-cols-2 gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200">
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400">Location</span>
              <div className="font-bold text-navy-900 text-xs mt-0.5">{record.location}</div>
              <div className="text-[10px] text-slate-500 font-mono">Raw: "{record.rawLocation}"</div>
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400">Ward & Station</span>
              <div className="font-bold text-navy-900 text-xs mt-0.5">{record.ward}</div>
              <div className="text-[10px] text-slate-500 font-mono">Sensor ID: {record.station}</div>
            </div>
            <div className="col-span-2 pt-2 border-t border-slate-200/60 flex items-center space-x-1.5 text-slate-600">
              <Clock className="w-3.5 h-3.5 text-slate-400" />
              <span>Timestamp: <strong className="font-mono">{record.timestamp}</strong></span>
            </div>
          </div>

          {/* Measured & Normalized Pollutants Grid */}
          <div>
            <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-2">
              Harmonized Pollutant Readings
            </h4>
            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200">
                <span className="text-[10px] text-slate-400">PM2.5</span>
                <div className="font-mono font-bold text-navy-900 text-sm mt-0.5">
                  {record.pm25 !== null ? `${record.pm25} µg/m³` : 'N/A'}
                </div>
              </div>
              <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200">
                <span className="text-[10px] text-slate-400">PM10</span>
                <div className="font-mono font-bold text-navy-900 text-sm mt-0.5">
                  {record.pm10 !== null ? `${record.pm10} µg/m³` : 'N/A'}
                </div>
              </div>
              <div className="p-2.5 bg-emerald-50 rounded-lg border border-emerald-200">
                <span className="text-[10px] text-emerald-700 font-semibold">CPCB AQI</span>
                <div className="font-mono font-bold text-emerald-900 text-sm mt-0.5">
                  {record.aqi !== null ? record.aqi : 'N/A'}
                </div>
              </div>
              <div className="p-2 bg-slate-50 rounded-lg border border-slate-200">
                <span className="text-[10px] text-slate-400">NO2</span>
                <div className="font-mono text-slate-700 text-xs mt-0.5">
                  {record.no2 !== null ? `${record.no2} µg/m³` : '—'}
                </div>
              </div>
              <div className="p-2 bg-slate-50 rounded-lg border border-slate-200">
                <span className="text-[10px] text-slate-400">SO2</span>
                <div className="font-mono text-slate-700 text-xs mt-0.5">
                  {record.so2 !== null ? `${record.so2} µg/m³` : '—'}
                </div>
              </div>
              <div className="p-2 bg-slate-50 rounded-lg border border-slate-200">
                <span className="text-[10px] text-slate-400">CO</span>
                <div className="font-mono text-slate-700 text-xs mt-0.5">
                  {record.co !== null ? `${record.co} mg/m³` : '—'}
                </div>
              </div>
            </div>
          </div>

          {/* Conversions Applied */}
          {record.conversionsApplied.length > 0 && (
            <div className="p-3 bg-blue-50/70 border border-blue-200 rounded-xl space-y-1">
              <span className="text-[10px] uppercase font-bold text-blue-800 flex items-center space-x-1">
                <Cpu className="w-3.5 h-3.5 text-blue-600" />
                <span>Unit & Standard Conversions Logged</span>
              </span>
              <ul className="text-[11px] text-blue-900 space-y-1">
                {record.conversionsApplied.map((c, i) => (
                  <li key={i} className="flex items-start space-x-1.5">
                    <span className="font-bold">•</span>
                    <span>{c}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Validation Flags & Anomalies */}
          {record.flags.length > 0 && (
            <div className="p-3 bg-amber-50/70 border border-amber-200 rounded-xl space-y-1">
              <span className="text-[10px] uppercase font-bold text-amber-800 flex items-center space-x-1">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                <span>Data Quality Flags</span>
              </span>
              <ul className="text-[11px] text-amber-900 space-y-1">
                {record.flags.map((f, i) => (
                  <li key={i} className="flex items-start space-x-1.5">
                    <span className="font-bold">•</span>
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Trace Guarantee Note */}
          <div className="p-3 bg-slate-50 rounded-xl text-[11px] text-slate-500 border border-slate-200 flex items-start space-x-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <span>
              This record is mathematically anchored to the raw uploaded dataset. Any AI hotspot citing this record is verifiable under audit.
            </span>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-navy-900 hover:bg-navy-850 text-white rounded-lg text-xs font-semibold cursor-pointer"
          >
            Close Audit Trace
          </button>
        </div>
      </div>
    </div>
  );
};
