'use strict';
/**
 * @file StationAqiChart.tsx
 * @description Lazily-loaded Recharts data visualization for station-wise particulate concentrations.
 * Decoupled from the primary bundle to optimize First Load JS and initial rendering efficiency.
 */

import React, { memo } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts';
import { CPCB_THRESHOLDS } from '@/lib/constants';

export interface StationChartDataPoint {
  name: string;
  fullName: string;
  pm25: number;
  pm10: number;
  aqi: number;
}

interface StationAqiChartProps {
  data: StationChartDataPoint[];
}

const StationAqiChartComponent: React.FC<StationAqiChartProps> = ({ data }) => {
  return (
    <div className="h-72 w-full" aria-label="Bar chart showing PM2.5 and PM10 concentrations across monitored stations">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 15, right: 20, left: -10, bottom: 40 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
          <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#475569' }} interval={0} angle={-25} textAnchor="end" height={60} />
          <YAxis tick={{ fontSize: 10, fill: '#475569' }} />
          <Tooltip
            contentStyle={{ backgroundColor: '#07111F', borderRadius: '12px', color: '#fff', fontSize: '11px', border: 'none' }}
            labelFormatter={(val, items) => items?.[0]?.payload?.fullName || val}
          />
          <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '15px' }} />
          <ReferenceLine
            y={CPCB_THRESHOLDS.PM25_24H_SAFE}
            stroke="#EF4444"
            strokeDasharray="4 4"
            label={{ value: `PM2.5 Safe (${CPCB_THRESHOLDS.PM25_24H_SAFE} µg/m³)`, fill: '#EF4444', fontSize: 10, position: 'top' }}
          />
          <ReferenceLine
            y={CPCB_THRESHOLDS.PM10_24H_SAFE}
            stroke="#3B82F6"
            strokeDasharray="3 3"
            label={{ value: `PM10 Safe (${CPCB_THRESHOLDS.PM10_24H_SAFE} µg/m³)`, fill: '#3B82F6', fontSize: 10, position: 'top' }}
          />
          <Bar dataKey="pm25" name="PM2.5 (µg/m³)" fill="#10B981" radius={[6, 6, 0, 0]} />
          <Bar dataKey="pm10" name="PM10 (µg/m³)" fill="#3B82F6" radius={[6, 6, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export const StationAqiChart = memo(StationAqiChartComponent);
