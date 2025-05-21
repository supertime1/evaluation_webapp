'use client';

import { useMemo } from 'react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, TooltipProps } from 'recharts';
import { RunEntity } from '@/lib/models';
import { 
  metricColors,
  generateMetricsForRun,
  calculateAggregateScore
} from '@/lib/utils/metrics';

type MiniMetricsChartProps = {
  runs: RunEntity[];
  className?: string;
  height?: number;
};

type MiniChartData = {
  name: string;
  value: number;
  runId: string;
};

const CustomTooltip = ({ active, payload, label }: TooltipProps<number, string>) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-2 text-xs border border-slate-200 shadow-sm rounded-sm">
        <p className="font-medium">{label}</p>
        <p>Score: {payload[0].value}</p>
      </div>
    );
  }
  return null;
};

export function MiniMetricsChart({ runs, className = '', height = 40 }: MiniMetricsChartProps) {
  // Generate simplified chart data
  const data = useMemo(() => {
    if (!runs.length) return [];
    
    // Sort runs by creation date (oldest first)
    const sortedRuns = [...runs].sort((a, b) => 
      new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
    );
    
    // Take at most the last 5 runs
    const recentRuns = sortedRuns.slice(-5);
    
    // Generate consistent aggregate metrics for each run
    return recentRuns.map((run, index) => {
      // Generate consistent metrics for this run
      const metrics = generateMetricsForRun(run);
      
      // Calculate an aggregate score (average of all metrics)
      const score = calculateAggregateScore(metrics);
      
      return {
        name: `Run ${index + 1}`,
        value: score,
        runId: run.id,
      };
    });
  }, [runs]);
  
  // If no data, show a simple placeholder
  if (data.length === 0) {
    return (
      <div className={`h-${height} w-full flex items-center justify-center ${className}`}>
        <div className="text-xs text-slate-400">No metric data</div>
      </div>
    );
  }
  
  return (
    <div className={`h-${height} w-full ${className}`}>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={data}
          margin={{ top: 0, right: 0, left: 0, bottom: 0 }}
        >
          <defs>
            <linearGradient id="miniChartGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={metricColors.accuracy} stopOpacity={0.2} />
              <stop offset="95%" stopColor={metricColors.accuracy} stopOpacity={0} />
            </linearGradient>
          </defs>
          <XAxis dataKey="name" hide={true} />
          <YAxis domain={[0, 1]} hide={true} />
          <Tooltip content={<CustomTooltip />} />
          <Area 
            type="monotone" 
            dataKey="value" 
            stroke={metricColors.accuracy} 
            fillOpacity={1} 
            fill="url(#miniChartGradient)" 
            strokeWidth={1.5}
            dot={{ r: 2, strokeWidth: 1 }}
            activeDot={{ r: 3, strokeWidth: 2 }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
} 