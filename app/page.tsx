'use client';
/**
 * @file page.tsx
 * @description Root application view for HawaSathi Civic Air Quality Briefing Studio.
 * Optimized with lazy loaded tab views, O(1) record lookup indexing, and memoized callbacks.
 */

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import dynamic from 'next/dynamic';
import { Sidebar } from '@/components/Sidebar';
import { TopNav } from '@/components/TopNav';
import { OverviewTab } from '@/components/OverviewTab';
import { TraceModal } from '@/components/TraceModal';
import {
  AirRecord,
  DataQualityReport,
  AnalysisResult,
  StakeholderType,
  Language,
  StakeholderAction,
} from '@/lib/types';
import { parseAndNormalizeData } from '@/lib/normalizer';
import { BHOPAL_MESSY_SAMPLE_CSV } from '@/lib/sampleData';
import { generateDeterministicIntelligence } from '@/lib/gemini';
import { buildRecordLookupMap, getAqiCategory } from '@/lib/utils';
import { SYSTEM_LIMITS } from '@/lib/constants';

// Clean loading placeholder for lazy-loaded tabs
const TabLoadingSkeleton = ({ title }: { title: string }) => (
  <div className="p-8 bg-white rounded-2xl border border-slate-200/90 shadow-2xs space-y-4 animate-pulse">
    <div className="h-6 w-48 bg-slate-200 rounded-lg"></div>
    <div className="h-4 w-96 bg-slate-100 rounded-lg"></div>
    <div className="h-48 w-full bg-slate-50 rounded-xl"></div>
    <span className="sr-only">Loading {title}...</span>
  </div>
);

// Code Splitting & Dynamic Lazy Loading of secondary studio tabs
const DataStudioTab = dynamic(
  () => import('@/components/DataStudioTab').then((m) => m.DataStudioTab),
  { loading: () => <TabLoadingSkeleton title="Data Studio" />, ssr: false }
);

const AirIntelligenceTab = dynamic(
  () => import('@/components/AirIntelligenceTab').then((m) => m.AirIntelligenceTab),
  { loading: () => <TabLoadingSkeleton title="Air Intelligence" />, ssr: false }
);

const LocalActionsTab = dynamic(
  () => import('@/components/LocalActionsTab').then((m) => m.LocalActionsTab),
  { loading: () => <TabLoadingSkeleton title="Local Actions" />, ssr: false }
);

const CitizenAdvisoryTab = dynamic(
  () => import('@/components/CitizenAdvisoryTab').then((m) => m.CitizenAdvisoryTab),
  { loading: () => <TabLoadingSkeleton title="Citizen Advisory" />, ssr: false }
);

const ReportHistoryTab = dynamic(
  () => import('@/components/ReportHistoryTab').then((m) => m.ReportHistoryTab),
  { loading: () => <TabLoadingSkeleton title="Report History" />, ssr: false }
);

const SettingsTab = dynamic(
  () => import('@/components/SettingsTab').then((m) => m.SettingsTab),
  { loading: () => <TabLoadingSkeleton title="Settings" />, ssr: false }
);

export default function Home() {
  const [activeTab, setActiveTab] = useState<string>('overview');
  const [stakeholder, setStakeholder] = useState<StakeholderType>('ward_officer');
  const [language, setLanguage] = useState<Language>('en');

  const [records, setRecords] = useState<AirRecord[]>([]);
  const [qualityReport, setQualityReport] = useState<DataQualityReport | null>(null);
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [traceRecord, setTraceRecord] = useState<AirRecord | null>(null);

  // O(1) indexed lookup map built whenever records change (avoids repeated array.find)
  const recordMap = useMemo(() => buildRecordLookupMap(records), [records]);

  // Execute Gemini analysis with deterministic fallback
  const runAnalysisWithRecords = useCallback(
    async (recList: AirRecord[], report: DataQualityReport) => {
      setIsAnalyzing(true);
      try {
        const res = await fetch('/api/analyze', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ records: recList, qualityReport: report }),
        });

        if (!res.ok) {
          throw new Error(`API returned HTTP ${res.status}`);
        }

        const result: AnalysisResult = await res.json();
        setAnalysis(result);
      } catch (_err) {
        // Fallback to verified deterministic reasoning engine
        const validRecords = recList.filter((r) => r.aqi !== null);
        const avgAqi =
          validRecords.length > 0
            ? Math.round(validRecords.reduce((acc, r) => acc + (r.aqi || 0), 0) / validRecords.length)
            : SYSTEM_LIMITS.BASELINE_HISTORICAL_AQI;

        const category = getAqiCategory(avgAqi);
        const fallbackResult = generateDeterministicIntelligence(
          recList,
          report,
          avgAqi,
          category === 'Unknown' ? 'Very Poor' : (category as AnalysisResult['overallAqiCategory'])
        );
        setAnalysis(fallbackResult);
      } finally {
        setIsAnalyzing(false);
      }
    },
    []
  );

  // Parse raw text into structured telemetry
  const handleDataParsed = useCallback(
    (rawCsv: string) => {
      try {
        const { records: parsedRecords, qualityReport: parsedReport } =
          parseAndNormalizeData(rawCsv);
        setRecords(parsedRecords);
        setQualityReport(parsedReport);
        runAnalysisWithRecords(parsedRecords, parsedReport);
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'Unknown parsing error';
        alert(`Error parsing tabular data: ${message}`);
      }
    },
    [runAnalysisWithRecords]
  );

  // Auto-initialize with realistic Bhopal telemetry feed on mount
  useEffect(() => {
    try {
      const { records: parsedRecords, qualityReport: parsedReport } =
        parseAndNormalizeData(BHOPAL_MESSY_SAMPLE_CSV);
      setRecords(parsedRecords);
      setQualityReport(parsedReport);
      runAnalysisWithRecords(parsedRecords, parsedReport);
    } catch (_err) {
      // Handled cleanly
    }
  }, [runAnalysisWithRecords]);

  // Fast O(1) trace modal lookup
  const handleOpenTrace = useCallback(
    (recordId: string) => {
      const target = recordMap.get(recordId);
      setTraceRecord(target || records[0] || null);
    },
    [recordMap, records]
  );

  // Memoized action handlers
  const handleUpdateActionStatus = useCallback(
    (id: string, status: StakeholderAction['status']) => {
      setAnalysis((prev) => {
        if (!prev) return null;
        return {
          ...prev,
          stakeholderActions: prev.stakeholderActions.map((act) =>
            act.id === id ? { ...act, status } : act
          ),
        };
      });
    },
    []
  );

  const handleCreateAction = useCallback((newAction: StakeholderAction) => {
    setAnalysis((prev) => {
      if (!prev) return null;
      return {
        ...prev,
        stakeholderActions: [newAction, ...prev.stakeholderActions],
      };
    });
  }, []);

  const handleTriggerAnalysis = useCallback(() => {
    if (qualityReport && records.length > 0) {
      runAnalysisWithRecords(records, qualityReport);
    }
  }, [qualityReport, records, runAnalysisWithRecords]);

  return (
    <div className="flex h-screen bg-[#F5F8FA] overflow-hidden">
      {/* Sidebar Navigation (Memoized) */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        stakeholder={stakeholder}
        setStakeholder={setStakeholder}
        language={language}
      />

      {/* Main Content Column */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Navbar (Memoized) */}
        <TopNav
          stakeholder={stakeholder}
          setStakeholder={setStakeholder}
          language={language}
          setLanguage={setLanguage}
          onRunAnalysis={handleTriggerAnalysis}
          isAnalyzing={isAnalyzing}
          hasData={records.length > 0}
          recordCount={records.length}
          onToggleGuide={() => setActiveTab('overview')}
        />

        {/* Tab Content Container */}
        <main
          id="main-content"
          role="main"
          tabIndex={-1}
          className="flex-1 overflow-y-auto p-4 sm:p-6 outline-hidden"
        >
          <div className="max-w-7xl mx-auto">
            {activeTab === 'overview' && (
              <OverviewTab
                analysis={analysis}
                records={records}
                qualityReport={qualityReport}
                stakeholder={stakeholder}
                setActiveTab={setActiveTab}
                onOpenTrace={handleOpenTrace}
                onLoadSample={() => handleDataParsed(BHOPAL_MESSY_SAMPLE_CSV)}
                language={language}
              />
            )}

            {activeTab === 'data_studio' && (
              <DataStudioTab
                records={records}
                qualityReport={qualityReport}
                onDataParsed={handleDataParsed}
                onOpenTrace={handleOpenTrace}
              />
            )}

            {activeTab === 'intelligence' && (
              <AirIntelligenceTab
                analysis={analysis}
                records={records}
                onOpenTrace={handleOpenTrace}
                onRunAnalysis={handleTriggerAnalysis}
                isAnalyzing={isAnalyzing}
              />
            )}

            {activeTab === 'actions' && (
              <LocalActionsTab
                actions={analysis?.stakeholderActions || []}
                currentStakeholder={stakeholder}
                onUpdateActionStatus={handleUpdateActionStatus}
                onCreateAction={handleCreateAction}
              />
            )}

            {activeTab === 'advisory' && (
              <CitizenAdvisoryTab
                analysis={analysis}
                language={language}
                setLanguage={setLanguage}
              />
            )}

            {activeTab === 'history' && (
              <ReportHistoryTab analysis={analysis} />
            )}

            {activeTab === 'settings' && (
              <SettingsTab
                stakeholder={stakeholder}
                setStakeholder={setStakeholder}
              />
            )}
          </div>
        </main>
      </div>

      {/* Traceability Audit Modal (Memoized) */}
      <TraceModal record={traceRecord} onClose={() => setTraceRecord(null)} />
    </div>
  );
}
