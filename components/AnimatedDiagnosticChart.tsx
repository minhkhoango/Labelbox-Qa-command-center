"use client";

import React, { useEffect, useMemo, useState } from 'react';
import {
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  ReferenceArea,
} from 'recharts';
import { motion } from 'framer-motion';
import { ProjectDataPoint } from '@/app/page';

interface AnimatedChartProps {
  data: ProjectDataPoint[];
  isDiagnosticRun: boolean;
}

interface ChartDatum {
  week: number;
  throughput: number | null; // Weekly Throughput for bars
  reworkRate: number | null; // Rework Rate (%) for line
  barValue: number; // bar value (same as throughput for uncapped bars)
}

interface Notification {
  id: string;
  week: number;
  message: string;
  isVisible: boolean;
}

// Minimal tooltip prop types compatible with Recharts runtime shape
interface TooltipItem<T> { payload: T }
interface CustomTooltipProps<T> {
  active?: boolean;
  label?: number | string;
  payload?: Array<TooltipItem<T>>;
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

function formatCompact(value: unknown): string {
  if (typeof value !== 'number' || Number.isNaN(value)) return '';
  const isInt = Math.abs(value - Math.round(value)) < 1e-6;
  return isInt ? String(Math.round(value)) : value.toFixed(1);
}

const CompactTooltip: React.FC<CustomTooltipProps<ChartDatum>> = ({ active, label, payload }) => {
  if (!active || !payload || payload.length === 0) return null;
  const weekLabel = typeof label === 'number' ? label : Number(label);
  const datum = payload[0]?.payload as ChartDatum | undefined;
  if (!datum) return null;
  return (
    <div className="bg-gray-800 border border-gray-600 rounded-md px-3 py-2 text-xs text-white">
      <div className="font-semibold text-white">Week {formatCompact(weekLabel)}</div>
      <div className="flex gap-2 mt-1">
        <span className="text-white">Throughput:</span>
        <span className="font-medium text-white">{formatCompact(datum.throughput)}</span>
      </div>
      <div className="flex gap-2">
        <span className="text-white">Rework Rate:</span>
        <span className="font-medium text-white">{formatCompact(datum.reworkRate)}%</span>
      </div>
    </div>
  );
};

const FilteredTooltip: React.FC<CustomTooltipProps<ChartDatum> & { currentWeek: number }> = (props) => {
  const wk = typeof props.label === 'number' ? props.label : Number(props.label);
  if (!Number.isFinite(wk) || wk > props.currentWeek) return null;
  return <CompactTooltip active={props.active} label={props.label} payload={props.payload} />;
};

const AnimatedDiagnosticChart: React.FC<AnimatedChartProps> = ({ data, isDiagnosticRun }) => {
  const [currentWeek, setCurrentWeek] = useState<number>(0);
  const [notifications, setNotifications] = useState<Notification[]>([
    { id: 'integration', week: 9, message: 'New annotator \'Alex\' joins.', isVisible: false },
  ]);

  // Transform incoming data into a clean numeric-week dataset
  const chartData: ChartDatum[] = useMemo(() => {
    const items: ChartDatum[] = [];
    for (let i = 0; i < data.length && i < 24; i += 1) {
      const original = data[i];
      if (!original) continue;
      const week = i + 1;
      
      // Extract Weekly Throughput for bars
      const throughputRaw = (original as unknown as Record<string, unknown>)["Weekly Throughput"];
      let throughput: number;
      if (typeof throughputRaw === 'number' && !Number.isNaN(throughputRaw)) {
        throughput = throughputRaw;
      } else {
        throughput = 4000 + Math.random() * 500; // fallback
      }
      
      // Extract Rework Rate (%) for line
      const reworkRaw = (original as unknown as Record<string, unknown>)["Rework Rate (%)"];
      let reworkRate: number;
      if (typeof reworkRaw === 'number' && !Number.isNaN(reworkRaw)) {
        reworkRate = reworkRaw;
      } else {
        reworkRate = 2 + Math.random() * 3; // fallback
      }
      
      items.push({
        week,
        throughput,
        reworkRate,
        barValue: throughput,
      });
    }
    return items;
  }, [data]);

  // Progress controller: reveal line up to currentWeek; do not remount components per tick
  const actualDataLength = chartData.length;
  useEffect(() => {
    let intervalId: ReturnType<typeof setInterval> | undefined;
    if (isDiagnosticRun) {
      setCurrentWeek(1);
      intervalId = setInterval(() => {
        setCurrentWeek((prev) => {
          if (prev >= actualDataLength) {
            if (intervalId) clearInterval(intervalId);
            return prev;
          }
          return prev + 1;
        });
      }, 200);
    } else {
      setCurrentWeek(0);
    }
    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [isDiagnosticRun, actualDataLength]);

  // Update notification visibility based on current week
  useEffect(() => {
    setNotifications(prev => prev.map(notification => ({
      ...notification,
      isVisible: currentWeek >= notification.week
    })));
  }, [currentWeek]);

  // To prevent axis flicker, we pass a consistent-length array to the chart.
  // Future scores are marked as `null` and Recharts will not draw them.
  const animatedChartData = useMemo(() => {
    if (currentWeek <= 0) {
      // Initially, render with no data visible
      return chartData.map((d) => ({ ...d, throughput: null, reworkRate: null, barValue: null }));
    }
    return chartData.map((d) => (d.week > currentWeek ? { ...d, throughput: null, reworkRate: null, barValue: null } : d));
  }, [chartData, currentWeek]);

  // Memoize the chart component to prevent unnecessary re-renders
  const chartComponent = useMemo(() => (
    <ComposedChart data={animatedChartData} margin={{ top: 8, right: 20, left: -10, bottom: 20 }}>
      {/* Health bands: 0–40, 40–70, 70–100 */}
      <ReferenceArea x1={1} x2={24} y1={0} y2={40} fill="rgba(239, 68, 68, 0.08)" stroke="none" />
      <ReferenceArea x1={1} x2={24} y1={40} y2={70} fill="rgba(245, 158, 11, 0.08)" stroke="none" />
      <ReferenceArea x1={1} x2={24} y1={70} y2={100} fill="rgba(16, 185, 129, 0.06)" stroke="none" />

      <XAxis
        type="number"
        dataKey="week"
        domain={[1, 24]}
        allowDuplicatedCategory={false}
        stroke="white"
        fontSize={12}
        tickFormatter={(week) => `W${week}`}
        ticks={[1, 4, 8, 12, 16, 20, 24]}
        tick={{ fill: 'white' }}
      />
      <YAxis 
        yAxisId="left"
        stroke="white" 
        fontSize={12} 
        tickCount={6} 
        tick={{ fill: 'white' }} 
        domain={[0, 4500]}
      />
      <YAxis 
        yAxisId="right"
        orientation="right"
        stroke="white" 
        fontSize={12} 
        tickCount={6} 
        tick={{ fill: 'white' }} 
        domain={[0, 10]}
        tickFormatter={(value) => `${value}%`}
      />

      <Tooltip content={<FilteredTooltip currentWeek={currentWeek} />} wrapperStyle={{ outline: 'none' }} cursor={{ stroke: '#9ca3af', strokeDasharray: '3 3' }} />

      {/* Bars based on Weekly Throughput */}
      <Bar
        yAxisId="left"
        dataKey="barValue"
        isAnimationActive={false}
        fill="#60A5FA"
        fillOpacity={0.6}
        stroke="#60A5FA"
        strokeOpacity={0.8}
        barSize={8}
      />

      {/* Line based on Rework Rate (%) */}
      <Line
        yAxisId="right"
        dataKey="reworkRate"
        isAnimationActive={false}
        type="monotone"
        stroke="#EF4444"
        strokeWidth={2}
        dot={false}
      />
    </ComposedChart>
  ), [animatedChartData, currentWeek]);

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }} className="relative h-full w-full">
      <ResponsiveContainer width="100%" height="100%">
        {chartComponent}
      </ResponsiveContainer>
      
      {/* Cleaner, less obstructive notifications */}
      {notifications.map((notification) => (
        notification.isVisible && (
          <motion.div
            key={notification.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            className="absolute pointer-events-none"
            style={{
              left: `${((notification.week - 1) / 23) * 100}%`,
              top: '3%',
              transform: 'translateX(-50%)',
              zIndex: 10,
            }}
          >
            <div className="bg-gray-800/90 backdrop-blur-sm border border-gray-600 text-gray-200 text-xs px-2 py-1.5 rounded-md shadow-lg max-w-40 text-center font-medium">
              {notification.message}
            </div>
          </motion.div>
        )
      ))}
    </motion.div>
  );
};

export default AnimatedDiagnosticChart;