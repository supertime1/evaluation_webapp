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
  TooltipProps,
} from 'recharts';
import { RunEntity } from '@/lib/models';
import { useRouter } from 'next/navigation';

type MetricsChartProps = {
  runs: RunEntity[];
  experimentId?: string;
};

type MetricData = {
  name: string;
  runId: string;
  [key: string]: string | number | null;
};

const CustomTooltip = ({ active, payload, label }: TooltipProps<number, string>) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-3 border border-slate-200 shadow-md rounded-md">
        <p className="text-slate-800 font-medium mb-2">Run: {label}</p>
        {payload.map((entry, index) => (
          <div key={index} className="flex items-center text-sm mb-1">
            <div 
              className="w-3 h-3 rounded-full mr-2" 
              style={{ backgroundColor: entry.color }}
            />
            <span className="font-medium">{entry.name}: </span>
            <span className="ml-1">{Number(entry.value).toFixed(2)}</span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

export function ExperimentMetricsChart({ runs, experimentId }: MetricsChartProps) {
  const router = useRouter();
  
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
  
  // Handle click on a data point to navigate to the run details
  const handleDataPointClick = (data: MetricData) => {
    if (data && data.runId && experimentId) {
      router.push(`/dashboard/experiments/${experimentId}/runs/${data.runId}`);
    }
  };
  
  // If no data, show a placeholder message
  if (data.length === 0) {
    return (
      <div className="h-full w-full flex items-center justify-center text-slate-500">
        No metrics data available yet. Runs are automatically created by the LLM system.
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
        onClick={(props) => {
          if (props && props.activePayload && props.activePayload[0]) {
            handleDataPointClick(props.activePayload[0].payload as MetricData);
          }
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
        <Tooltip content={<CustomTooltip />} />
        <Legend 
          layout="vertical" 
          align="left"
          verticalAlign="middle"
          wrapperStyle={{ paddingRight: 20 }}
        />
        <Line
          type="monotone"
          dataKey="accuracy"
          stroke="#3b82f6"
          strokeWidth={2}
          dot={{ r: 4, cursor: 'pointer' }}
          activeDot={{ r: 6, cursor: 'pointer' }}
          name="Accuracy"
        />
        <Line
          type="monotone"
          dataKey="completeness"
          stroke="#6366f1"
          strokeWidth={2}
          dot={{ r: 4, cursor: 'pointer' }}
          activeDot={{ r: 6, cursor: 'pointer' }}
          name="Completeness"
        />
        <Line
          type="monotone"
          dataKey="relevancy"
          stroke="#8b5cf6"
          strokeWidth={2}
          dot={{ r: 4, cursor: 'pointer' }}
          activeDot={{ r: 6, cursor: 'pointer' }}
          name="Relevancy"
        />
      </LineChart>
    </ResponsiveContainer>
  );
} 