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
import { RunEntity, TestResultEntity } from '@/lib/models';
import { extractUniqueMetricNames, calculateMetricStats } from '@/lib/utils/metrics';
import { useQuery } from '@tanstack/react-query';
import { testResultManager } from '@/lib/managers/testResultManager';

type MetricsChartProps = {
  runs: RunEntity[];
  experimentId: string;
};

type MetricData = {
  name: string;
  runId: string;
  [key: string]: string | number | null;
};

const COLORS = [
  '#3b82f6', // blue
  '#6366f1', // indigo
  '#8b5cf6', // purple
  '#ec4899', // pink
  '#f43f5e', // rose
  '#f97316', // orange
  '#eab308', // yellow
  '#10b981', // emerald
];

export function ExperimentMetricsChart({ runs, experimentId }: MetricsChartProps) {
  // Get all run IDs
  const runIds = runs.map(run => run.id);
  
  // Fetch test results for all runs
  const { data: allTestResults = [] } = useQuery({
    queryKey: ['testResultsForRuns', runIds],
    queryFn: async () => {
      if (runIds.length === 0) return [];
      
      // Collect all test results from all runs
      let allResults: TestResultEntity[] = [];
      
      // Process each run to get its test results
      for (const runId of runIds) {
        try {
          const runResults = await testResultManager.getTestResultsByRun(runId);
          if (runResults && runResults.length > 0) {
            allResults = [...allResults, ...runResults];
          }
        } catch (error) {
          console.error(`Error fetching test results for run ${runId}:`, error);
        }
      }
      
      return allResults;
    },
    enabled: runIds.length > 0
  });
  
  // Process data for the chart
  const { chartData, metricNames } = useMemo(() => {
    if (runs.length === 0 || !allTestResults || allTestResults.length === 0) {
      return { chartData: [], metricNames: [] };
    }
    
    // Group test results by run
    const resultsByRun: Record<string, TestResultEntity[]> = {};
    allTestResults.forEach((result: TestResultEntity) => {
      if (!resultsByRun[result.run_id]) {
        resultsByRun[result.run_id] = [];
      }
      resultsByRun[result.run_id].push(result);
    });
    
    // Get all unique metric names across all test results
    const uniqueMetricNames = extractUniqueMetricNames(allTestResults);
    
    // Create chart data for each run
    const chartData: MetricData[] = runs.map(run => {
      // Create a short run ID for display
      const shortId = run.id.slice(0, 6);
      
      // Default data object with run info
      const dataPoint: MetricData = {
        name: shortId,
        runId: run.id,
        timestamp: new Date(run.created_at).getTime(),
      };
      
      // Add metric averages if we have test results for this run
      const runResults = resultsByRun[run.id] || [];
      if (runResults.length > 0) {
        const metricStats = calculateMetricStats(runResults);
        
        // Add each metric's average to the data point
        metricStats.forEach(stat => {
          dataPoint[stat.name] = stat.average;
        });
      }
      
      return dataPoint;
    });
    
    // Sort by creation date (newest runs last so they appear on the right)
    chartData.sort((a, b) => (a.timestamp as number) - (b.timestamp as number));
    
    return { chartData, metricNames: uniqueMetricNames };
  }, [runs, allTestResults]);
  
  // If no data, show a placeholder message
  if (chartData.length === 0 || metricNames.length === 0) {
    return (
      <div className="h-full w-full flex items-center justify-center text-slate-500">
        No metrics data available yet. Runs with test results are needed to generate metrics.
      </div>
    );
  }
  
  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart
        data={chartData}
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
          formatter={(value: number) => [value !== undefined ? value.toFixed(2) : 'N/A', '']}
          labelFormatter={(label) => `Run: ${label}`}
          contentStyle={{ 
            backgroundColor: 'white',
            borderColor: '#e5e7eb',
            borderRadius: '0.375rem',
            boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)'
          }}
        />
        <Legend />
        
        {/* Dynamically generate lines for each metric */}
        {metricNames.map((metricName, index) => (
          <Line
            key={metricName}
            type="monotone"
            dataKey={metricName}
            stroke={COLORS[index % COLORS.length]}
            strokeWidth={2}
            dot={{ r: 4 }}
            activeDot={{ r: 6 }}
            name={metricName}
            connectNulls={true}
          />
        ))}
      </LineChart>
    </ResponsiveContainer>
  );
} 