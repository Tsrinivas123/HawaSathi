'use client';
/**
 * @file page.tsx
 * @description Root application view for HawaSathi Civic Air Quality Briefing Studio.
 * Optimized with lazy loaded tab views, O(1) record lookup indexing, and memoized callbacks.
 */

import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
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
import {
  getStoredActions,
  saveStoredActions,
  saveBriefingToHistory,
  getStoredStakeholder,
  saveStoredStakeholder,
  getStoredLanguage,
  saveStoredLanguage,
} from '@/lib/storage';

// Clean loading placeholder for lazy-loaded tabs
const TabLoadingSkeleton = ({ title }: { title: string }) => (
  <div className="p-8 bg-white rounded-2xl border border-slate-200/90 shadow-2xs space-y-4 animate-pulse">
    <div className="h-6 w-48 bg-slate-200 rounded-lg"></div>
    <div className="h-4 w-96 bg-slate-100 rounded-lg"></div>
    <div className="h-48 w-full bg-slate-50 rounded-xl"></div>
    <span className="sr-only">Loading {title}...</span>
  </div>
);

// Code Splitting & Dynamic Loading of secondary studio tabs (with SSR enabled for full WCAG AA accessibility audit)
const DataStudioTab = dynamic(
  () => import('@/components/DataStudioTab').then((m) => m.DataStudioTab),
  { loading: () => <TabLoadingSkeleton title="Data Studio" /> }
);

const AirIntelligenceTab = dynamic(
  () => import('@/components/AirIntelligenceTab').then((m) => m.AirIntelligenceTab),
  { loading: () => <TabLoadingSkeleton title="Air Intelligence" /> }
);

const LocalActionsTab = dynamic(
  () => import('@/components/LocalActionsTab').then((m) => m.LocalActionsTab),
  { loading: () => <TabLoadingSkeleton title="Local Actions" /> }
);

const CitizenAdvisoryTab = dynamic(
  () => import('@/components/CitizenAdvisoryTab').then((m) => m.CitizenAdvisoryTab),
  { loading: () => <TabLoadingSkeleton title="Citizen Advisory" /> }
);

const ReportHistoryTab = dynamic(
  () => import('@/components/ReportHistoryTab').then((m) => m.ReportHistoryTab),
  { loading: () => <TabLoadingSkeleton title="Report History" /> }
);

const SettingsTab = dynamic(
  () => import('@/components/SettingsTab').then((m) => m.SettingsTab),
  { loading: () => <TabLoadingSkeleton title="Settings" /> }
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

  // In-flight request cancellation reference to abort stale Gemini analysis requests
  const abortControllerRef = useRef<AbortController | null>(null);

  // Clean up pending requests on unmount
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  // Preference setters with browser persistence
  const handleSetStakeholder = useCallback((s: StakeholderType) => {
    setStakeholder(s);
    saveStoredStakeholder(s);
  }, []);

  const handleSetLanguage = useCallback((l: Language) => {
    setLanguage(l);
    saveStoredLanguage(l);
  }, []);

  // O(1) indexed lookup map built whenever records change (avoids repeated array.find)
  const recordMap = useMemo(() => buildRecordLookupMap(records), [records]);

  // Execute Gemini analysis with deterministic fallback, cancellation, and historical persistence
  const runAnalysisWithRecords = useCallback(
    async (recList: AirRecord[], report: DataQualityReport) => {
      // Abort any previous in-flight analysis request
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      const controller = new AbortController();
      abortControllerRef.current = controller;

      setIsAnalyzing(true);
      try {
        const res = await fetch('/api/analyze', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          signal: controller.signal,
          body: JSON.stringify({ records: recList, qualityReport: report }),
        });

        if (!res.ok) {
          throw new Error(`API returned HTTP ${res.status}`);
        }

        const result: AnalysisResult = await res.json();

        // Restore any user-persisted action statuses
        const storedActs = getStoredActions();
        if (storedActs && storedActs.length > 0) {
          const statusMap = new Map(storedActs.map((a) => [a.id, a.status]));
          result.stakeholderActions = result.stakeholderActions.map((act) => ({
            ...act,
            status: statusMap.get(act.id) || act.status,
          }));
        }

        // Save generated briefing to persistent storage
        saveBriefingToHistory({
          id: `BRIEF-${Date.now()}`,
          timestamp: new Date().toLocaleString(),
          averageAqi: result.averageAqi,
          overallAqiCategory: result.overallAqiCategory,
          primaryPollutant: result.primaryPollutant,
          hotspots: result.hotspots,
          activeLocations: recList.map((r) => r.location),
          isAiGenerated: result.isAiGenerated,
          executiveSummary: result.executiveSummary,
        });

        setAnalysis(result);
      } catch (err: unknown) {
        // If request was intentionally aborted, exit cleanly without fallback triggering
        if (err instanceof DOMException && err.name === 'AbortError') {
          return;
        }

        // Fallback to verified deterministic reasoning engine
        // Strictly exclude outliers and duplicates from average AQI calculation
        const validRecords = recList.filter((r) => r.status === 'valid' && r.aqi !== null);
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

        // Restore any user-persisted action statuses
        const storedActs = getStoredActions();
        if (storedActs && storedActs.length > 0) {
          const statusMap = new Map(storedActs.map((a) => [a.id, a.status]));
          fallbackResult.stakeholderActions = fallbackResult.stakeholderActions.map((act) => ({
            ...act,
            status: statusMap.get(act.id) || act.status,
          }));
        }

        // Save fallback briefing to history
        saveBriefingToHistory({
          id: `BRIEF-${Date.now()}`,
          timestamp: new Date().toLocaleString(),
          averageAqi: fallbackResult.averageAqi,
          overallAqiCategory: fallbackResult.overallAqiCategory,
          primaryPollutant: fallbackResult.primaryPollutant,
          hotspots: fallbackResult.hotspots,
          activeLocations: recList.map((r) => r.location),
          isAiGenerated: false,
          executiveSummary: fallbackResult.executiveSummary,
        });

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

  // Auto-initialize with stored preferences and realistic Bhopal telemetry feed on mount
  useEffect(() => {
    const savedS = getStoredStakeholder();
    if (savedS) setStakeholder(savedS);
    const savedL = getStoredLanguage();
    if (savedL) setLanguage(savedL);

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

  // Memoized action handlers with local persistence
  const handleUpdateActionStatus = useCallback(
    (id: string, status: StakeholderAction['status']) => {
      setAnalysis((prev) => {
        if (!prev) return null;
        const updated = prev.stakeholderActions.map((act) =>
          act.id === id ? { ...act, status } : act
        );
        saveStoredActions(updated);
        return {
          ...prev,
          stakeholderActions: updated,
        };
      });
    },
    []
  );

  const handleCreateAction = useCallback((newAction: StakeholderAction) => {
    setAnalysis((prev) => {
      if (!prev) return null;
      const updated = [newAction, ...prev.stakeholderActions];
      saveStoredActions(updated);
      return {
        ...prev,
        stakeholderActions: updated,
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
        setStakeholder={handleSetStakeholder}
        language={language}
      />

      {/* Main Content Column */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Navbar (Memoized) */}
        <TopNav
          stakeholder={stakeholder}
          setStakeholder={handleSetStakeholder}
          language={language}
          setLanguage={handleSetLanguage}
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
                setLanguage={handleSetLanguage}
              />
            )}

            {activeTab === 'history' && (
              <ReportHistoryTab analysis={analysis} />
            )}

            {activeTab === 'settings' && (
              <SettingsTab
                stakeholder={stakeholder}
                setStakeholder={handleSetStakeholder}
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
