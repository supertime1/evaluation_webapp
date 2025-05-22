'use client';

import { useMemo } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { RunEntity, TestResultEntity } from '@/lib/models';
import { extractUniqueMetricNames, calculateMetricStats } from '@/lib/utils/metrics';
import { useQuery } from '@tanstack/react-query';
import { testResultManager } from '@/lib/managers/testResultManager';
import { useRouter } from 'next/navigation';

type MetricsChartProps = {
  runs: RunEntity[];
  experimentId: string;
};

interface ChartDataPoint {
  name: string;
  runId: string;
  timestamp: number;
  [key: string]: string | number | undefined;
}

// Custom tooltip component for the chart
const CustomTooltip = ({ active, payload, label, experimentId, runs }: any) => {
  const router = useRouter();
  
  if (active && payload && payload.length) {
    // Find the run for this data point
    const runId = payload[0]?.payload?.runId;
    const run = runs.find((r: RunEntity) => r.id === runId);
    
    // Navigate to run details
    const handleViewRun = (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation(); // Prevent event bubbling
      
      if (runId && experimentId) {
        const url = `/dashboard/experiments/${experimentId}/runs/${runId}`;
        console.log("Navigating to:", url); // Debug log
        router.push(url);
      }
    };
    
    return (
      <div 
        className="bg-white p-4 border border-slate-200 rounded-md shadow-md w-72" 
        onClick={(e) => e.stopPropagation()}
        style={{ pointerEvents: 'auto' }}
      >
        <h4 className="text-sm font-semibold mb-2">
          Test Run ID: <span className="font-mono text-xs">{runId?.substring(0, 12)}...</span>
        </h4>
        
        <div className="space-y-1">
          <p className="text-xs text-slate-500">Average Metric Scores</p>
          {payload.map((entry: any, index: number) => (
            <div 
              key={`metric-${index}`}
              className="flex items-center justify-between text-sm"
            >
              <div className="flex items-center">
                <div 
                  className="w-2 h-2 rounded-full mr-2" 
                  style={{ backgroundColor: entry.color }}
                />
                <span>{entry.name}</span>
              </div>
              <span className="font-medium">{Number(entry.value).toFixed(2)}</span>
            </div>
          ))}
        </div>
        
        {run && (
          <div className="mt-3 pt-2 border-t border-slate-200 text-xs text-slate-500">
            <div className="flex justify-between mb-1">
              <span>Status:</span>
              <span className="capitalize">{run.status}</span>
            </div>
            <div className="flex justify-between">
              <span>Created:</span>
              <span>{new Date(run.created_at).toLocaleDateString()}</span>
            </div>
          </div>
        )}
        
        <button 
          onClick={handleViewRun}
          className="mt-3 block w-full text-center bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs py-1.5 px-3 rounded-md transition-colors cursor-pointer"
        >
          View Run Details
        </button>
      </div>
    );
  }
  
  return null;
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
    const chartData: ChartDataPoint[] = runs.map(run => {
      // Create a short run ID for display
      const shortId = run.id.slice(0, 6);
      
      // Default data object with run info
      const dataPoint: ChartDataPoint = {
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
          // Only add valid numeric values
          if (typeof stat.average === 'number' && !isNaN(stat.average)) {
            // Make sure we have a valid value in the range 0-1
            const validValue = Math.max(0, Math.min(1, stat.average));
            dataPoint[stat.name] = validValue;
          }
        });
      }
      
      return dataPoint;
    });
    
    // Sort by creation date (newest runs last so they appear on the right)
    chartData.sort((a, b) => a.timestamp - b.timestamp);
    
    // Filter out any metric names that don't have valid data
    const validMetricNames = uniqueMetricNames.filter(metricName => 
      chartData.some(point => 
        typeof point[metricName] === 'number' && !isNaN(point[metricName] as number)
      )
    );
    
    return { 
      chartData, 
      metricNames: validMetricNames 
    };
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
          content={<CustomTooltip experimentId={experimentId} runs={runs} />}
        />
        
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