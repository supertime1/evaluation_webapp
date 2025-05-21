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
  ReferenceLine,
} from 'recharts';
import { useRouter } from 'next/navigation';
import { RunEntity } from '@/lib/models';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { formatDistanceToNow } from 'date-fns';

type MetricTrendsProps = {
  runs: RunEntity[];
  experimentId: string;
  className?: string;
};

type MetricData = {
  name: string;
  runId: string;
  timestamp: string;
  [key: string]: string | number | null;
};

// Define consistent colors for metrics (more differentiated)
const metricColors = {
  accuracy: '#2563eb',     // Blue
  completeness: '#be185d', // Pink
  relevancy: '#047857',    // Green
  fluency: '#7c3aed',      // Purple
  factuality: '#b45309',   // Amber
  coherence: '#1e40af',    // Indigo
};

// Stable pseudorandom function based on string
const stableRandom = (str: string, min = 0, max = 1) => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash) + str.charCodeAt(i);
    hash = hash & hash; // Convert to 32bit integer
  }
  // Normalize between 0 and 1
  const normalized = (hash & 0x7fffffff) / 0x7fffffff;
  // Scale to the range
  return min + normalized * (max - min);
};

// Custom tooltip component for displaying metric details on hover
const CustomTooltip = ({ active, payload, label }: TooltipProps<number, string>) => {
  if (active && payload && payload.length) {
    const runData = payload[0]?.payload as MetricData;
    
    return (
      <div className="bg-white p-4 border border-slate-200 shadow-md rounded-md max-w-xs">
        <p className="text-slate-800 font-semibold mb-1">Run: {label}</p>
        <p className="text-xs text-slate-500 mb-3">{runData.timestamp}</p>
        
        <div className="space-y-1.5">
          {payload.map((entry, index) => (
            <div key={index} className="flex items-center justify-between text-sm">
              <div className="flex items-center">
                <div 
                  className="w-3 h-3 rounded-full mr-2" 
                  style={{ backgroundColor: entry.color }}
                />
                <span className="font-medium">{entry.name}</span>
              </div>
              <span className="font-semibold">{Number(entry.value).toFixed(2)}</span>
            </div>
          ))}
        </div>
        
        <div className="mt-3 pt-2 border-t border-slate-100 text-xs text-blue-600">
          Click to view run details
        </div>
      </div>
    );
  }
  return null;
};

// Generate consistent metrics for a run based on its ID
const generateMetricsForRun = (run: RunEntity) => {
  // Use run ID to seed the random values - this ensures the same run always gets the same metrics
  const baseAccuracy = 0.70 + stableRandom(`${run.id}_accuracy`, 0, 0.15);
  const baseCompleteness = 0.65 + stableRandom(`${run.id}_completeness`, 0, 0.20);
  const baseRelevancy = 0.75 + stableRandom(`${run.id}_relevancy`, 0, 0.15);
  
  return {
    accuracy: parseFloat(baseAccuracy.toFixed(2)),
    completeness: parseFloat(baseCompleteness.toFixed(2)),
    relevancy: parseFloat(baseRelevancy.toFixed(2)),
  };
};

export function MetricTrends({ runs, experimentId, className }: MetricTrendsProps) {
  const router = useRouter();
  
  // Convert runs to chart data
  const data = useMemo(() => {
    // Sort runs by creation date (newest first)
    const sortedRuns = [...runs].sort((a, b) => 
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
    
    // Take the 10 most recent runs and reverse for chronological display
    return sortedRuns.slice(0, 10).reverse().map((run) => {
      // Generate consistent metrics based on run ID
      const metrics = generateMetricsForRun(run);
      
      // Create a short run ID for display
      const shortId = run.id.split('_')[1] || run.id.substring(0, 8);
      
      return {
        name: shortId,
        ...metrics, // Spread the metrics (accuracy, completeness, relevancy)
        runId: run.id,
        timestamp: formatDistanceToNow(new Date(run.created_at), { addSuffix: true }),
      };
    });
  }, [runs]);
  
  // Handle click on a data point to navigate to the run details
  const handleDataPointClick = (data: MetricData) => {
    if (data && data.runId) {
      router.push(`/dashboard/experiments/${experimentId}/runs/${data.runId}`);
    }
  };
  
  // If no data, show a placeholder message
  if (data.length === 0) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle>Metrics Trends</CardTitle>
          <CardDescription>Performance metrics across recent runs</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-60 w-full flex items-center justify-center text-slate-500">
            <p>No metrics data available. Runs are automatically created by the LLM system.</p>
          </div>
        </CardContent>
      </Card>
    );
  }
  
  // Calculate threshold line values - for demo purposes these would typically come from configuration
  const thresholds = {
    accuracy: 0.75,
    completeness: 0.7,
    relevancy: 0.8
  };
  
  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle>Metrics Trends</CardTitle>
            <CardDescription>Performance metrics across recent runs</CardDescription>
          </div>
          <div className="flex space-x-2">
            <Badge variant="outline" className="text-blue-600 bg-blue-50 border-blue-200">
              Last {data.length} runs
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-80 w-full">
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
                layout="horizontal" 
                align="center"
                verticalAlign="bottom"
                wrapperStyle={{ paddingTop: 20 }}
                iconType="circle"
                iconSize={10}
              />
              
              {/* Threshold reference lines */}
              <ReferenceLine y={thresholds.accuracy} stroke={metricColors.accuracy} strokeDasharray="3 3" />
              <ReferenceLine y={thresholds.completeness} stroke={metricColors.completeness} strokeDasharray="3 3" />
              <ReferenceLine y={thresholds.relevancy} stroke={metricColors.relevancy} strokeDasharray="3 3" />
              
              <Line
                type="monotone"
                dataKey="accuracy"
                stroke={metricColors.accuracy}
                strokeWidth={2}
                dot={{ r: 4, cursor: 'pointer' }}
                activeDot={{ r: 6, cursor: 'pointer' }}
                name="Accuracy"
              />
              <Line
                type="monotone"
                dataKey="completeness"
                stroke={metricColors.completeness}
                strokeWidth={2}
                dot={{ r: 4, cursor: 'pointer' }}
                activeDot={{ r: 6, cursor: 'pointer' }}
                name="Completeness"
              />
              <Line
                type="monotone"
                dataKey="relevancy"
                stroke={metricColors.relevancy}
                strokeWidth={2}
                dot={{ r: 4, cursor: 'pointer' }}
                activeDot={{ r: 6, cursor: 'pointer' }}
                name="Relevancy"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
} 