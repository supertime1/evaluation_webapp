'use client';

import React, { useMemo, useState } from 'react';
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
import { 
  metricColors, 
  metricThresholds, 
  generateMetricsForRun,
  getAvailableMetrics
} from '@/lib/utils/metrics';
import { CheckIcon } from '@heroicons/react/24/outline';

type MetricTrendsV2Props = {
  runs: RunEntity[];
  experimentId: string;
  className?: string;
  initialMetrics?: string[]; // Initial metrics to display
  maxVisibleMetrics?: number; // Maximum number of metrics to show at once
};

type MetricData = {
  name: string;
  runId: string;
  timestamp: string;
  [key: string]: string | number | null;
};

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

export function MetricTrendsV2({ 
  runs, 
  experimentId, 
  className,
  initialMetrics = ['accuracy', 'completeness', 'relevancy'],
  maxVisibleMetrics = 5
}: MetricTrendsV2Props) {
  const router = useRouter();
  
  // All available metrics
  const allMetrics = useMemo(() => getAvailableMetrics(), []);
  
  // State for which metrics to display
  const [selectedMetrics, setSelectedMetrics] = useState<string[]>(
    initialMetrics.filter(m => allMetrics.includes(m))
  );
  
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
        ...metrics, // Spread the metrics 
        runId: run.id,
        timestamp: formatDistanceToNow(new Date(run.created_at), { addSuffix: true }),
      };
    });
  }, [runs]);
  
  // Handle metric selection
  const toggleMetric = (metric: string) => {
    setSelectedMetrics(current => {
      if (current.includes(metric)) {
        // Remove the metric if it's already selected
        return current.filter(m => m !== metric);
      } else if (current.length < maxVisibleMetrics) {
        // Add the metric if we haven't reached the maximum
        return [...current, metric];
      } else {
        // Replace the first metric with the new one if we've reached the maximum
        return [...current.slice(1), metric];
      }
    });
  };
  
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
        
        {/* Metric selector */}
        <div className="mt-4">
          <div className="text-xs text-slate-500 mb-2">Select metrics to display (max {maxVisibleMetrics}):</div>
          <div className="flex flex-wrap gap-2">
            {allMetrics.map(metric => (
              <Badge
                key={metric}
                variant={selectedMetrics.includes(metric) ? "default" : "outline"}
                className={`
                  cursor-pointer capitalize 
                  ${selectedMetrics.includes(metric) 
                    ? `bg-${metric in metricColors ? metricColors[metric as keyof typeof metricColors].replace('#', '') : 'slate-700'}/20`
                    : ''
                  }
                `}
                style={{
                  borderColor: selectedMetrics.includes(metric) 
                    ? (metric in metricColors ? metricColors[metric as keyof typeof metricColors] : '#e5e7eb')
                    : '#e5e7eb',
                  color: selectedMetrics.includes(metric) 
                    ? (metric in metricColors ? metricColors[metric as keyof typeof metricColors] : '#374151')
                    : '#374151',
                }}
                onClick={() => toggleMetric(metric)}
              >
                <span className="flex items-center">
                  {selectedMetrics.includes(metric) && (
                    <CheckIcon className="h-3 w-3 mr-1" />
                  )}
                  {metric}
                </span>
              </Badge>
            ))}
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
                bottom: 40,
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
              
              {/* Only render selected metrics */}
              {selectedMetrics.map(metric => (
                <React.Fragment key={metric}>
                  {/* Threshold reference line */}
                  {metric in metricThresholds && (
                    <ReferenceLine 
                      y={metricThresholds[metric as keyof typeof metricThresholds]} 
                      stroke={metricColors[metric as keyof typeof metricColors] || '#9ca3af'} 
                      strokeDasharray="3 3" 
                    />
                  )}
                  
                  {/* Data line */}
                  <Line
                    type="monotone"
                    dataKey={metric}
                    stroke={metricColors[metric as keyof typeof metricColors] || '#9ca3af'}
                    strokeWidth={2}
                    dot={{ r: 4, cursor: 'pointer' }}
                    activeDot={{ r: 6, cursor: 'pointer' }}
                    name={metric.charAt(0).toUpperCase() + metric.slice(1)} // Capitalize first letter
                  />
                </React.Fragment>
              ))}
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
} 