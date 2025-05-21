'use client';

import { useMemo } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { RunEntity } from '@/lib/models';

type MetricsChartProps = {
  runs: RunEntity[];
};

type MetricData = {
  name: string;
  [key: string]: string | number | null;
};

export function ExperimentMetricsChart({ runs }: MetricsChartProps) {
  // Convert runs to chart data
  const data = useMemo(() => {
    // For demo, generate some fake metrics data since we don't have real metrics yet
    return runs.map((run, index) => {
      // Simulate metric scores with slight variations
      const baseAccuracy = 0.75 + Math.random() * 0.1;
      const baseCompleteness = 0.7 + Math.random() * 0.15;
      const baseRelevancy = 0.8 + Math.random() * 0.1;
      
      // Create a short run ID for display
      const shortId = run.id.split('_')[1] || run.id;
      
      return {
        name: shortId,
        accuracy: parseFloat(baseAccuracy.toFixed(2)),
        completeness: parseFloat(baseCompleteness.toFixed(2)),
        relevancy: parseFloat(baseRelevancy.toFixed(2)),
        runId: run.id,
      };
    }).reverse(); // Show most recent runs first
  }, [runs]);
  
  // If no data, show a placeholder message
  if (data.length === 0) {
    return (
      <div className="h-full w-full flex items-center justify-center text-slate-500">
        No metrics data available yet. Create runs to generate metrics.
      </div>
    );
  }
  
  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart
        data={data}
        margin={{
          top: 20,
          right: 30,
          left: 20,
          bottom: 20,
        }}
      >
        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
        <XAxis 
          dataKey="name" 
          tick={{ fontSize: 12 }}
          tickLine={{ stroke: '#9ca3af' }}
        />
        <YAxis 
          domain={[0, 1]}
          tickFormatter={(value) => `${value.toFixed(2)}`}
          tick={{ fontSize: 12 }}
          tickLine={{ stroke: '#9ca3af' }}
        />
        <Tooltip 
          formatter={(value: number) => [value.toFixed(2), '']}
          labelFormatter={(label) => `Run: ${label}`}
          contentStyle={{ 
            backgroundColor: 'white',
            borderColor: '#e5e7eb',
            borderRadius: '0.375rem',
            boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)'
          }}
        />
        <Legend />
        <Line
          type="monotone"
          dataKey="accuracy"
          stroke="#3b82f6"
          strokeWidth={2}
          dot={{ r: 4 }}
          activeDot={{ r: 6 }}
          name="Accuracy"
        />
        <Line
          type="monotone"
          dataKey="completeness"
          stroke="#6366f1"
          strokeWidth={2}
          dot={{ r: 4 }}
          activeDot={{ r: 6 }}
          name="Completeness"
        />
        <Line
          type="monotone"
          dataKey="relevancy"
          stroke="#8b5cf6"
          strokeWidth={2}
          dot={{ r: 4 }}
          activeDot={{ r: 6 }}
          name="Relevancy"
        />
      </LineChart>
    </ResponsiveContainer>
  );
} 