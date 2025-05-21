'use client';

import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TestResultEntity } from '@/lib/models';
import { 
  calculateMetricStats, 
  calculateMetricTrends,
  MetricStats 
} from '@/lib/utils/metrics';
import { 
  ArrowUpIcon, 
  ArrowDownIcon, 
  MinusIcon 
} from '@heroicons/react/24/outline';

type MetricsSummaryProps = {
  testResults: TestResultEntity[];
  title?: string;
};

export function MetricsSummaryCard({ testResults, title = 'Metrics Summary' }: MetricsSummaryProps) {
  // Calculate metric statistics and trends
  const { stats, trends } = useMemo(() => {
    if (!testResults || testResults.length === 0) {
      return { stats: [], trends: {} };
    }
    
    // Calculate overall stats for all test results
    const metricStats = calculateMetricStats(testResults);
    
    // Calculate trends by comparing the most recent results with previous ones
    // Use last 1 run as recent and 5 runs before that for comparison
    const trendData = calculateMetricTrends(testResults, 1, 5);
    
    return { stats: metricStats, trends: trendData };
  }, [testResults]);

  // If no data, show placeholder
  if (stats.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-6 text-slate-500">
            No metrics data available yet.
          </div>
        </CardContent>
      </Card>
    );
  }

  // Format a number for display
  const formatScore = (value: number): string => {
    return value.toFixed(2);
  };
  
  // Get trend direction indicator
  const getTrendIndicator = (trend: number | undefined) => {
    if (!trend || Math.abs(trend) < 0.5) {
      return (
        <span className="text-slate-400">
          <MinusIcon className="h-4 w-4" />
        </span>
      );
    }
    
    if (trend > 0) {
      return (
        <span className="text-green-500">
          <ArrowUpIcon className="h-4 w-4" />
        </span>
      );
    }
    
    return (
      <span className="text-red-500">
        <ArrowDownIcon className="h-4 w-4" />
      </span>
    );
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-xs uppercase bg-slate-50 text-slate-700">
              <tr>
                <th className="px-4 py-2 text-left">Metric</th>
                <th className="px-4 py-2 text-right">Avg. Score</th>
                <th className="px-4 py-2 text-right">Success Rate</th>
                <th className="px-4 py-2 text-center">Trend</th>
              </tr>
            </thead>
            <tbody>
              {stats.map((metric: MetricStats) => (
                <tr key={metric.name} className="border-b border-slate-200">
                  <td className="px-4 py-3 font-medium">{metric.name}</td>
                  <td className="px-4 py-3 text-right">{formatScore(metric.average)}</td>
                  <td className="px-4 py-3 text-right">
                    {formatScore(metric.successRate * 100)}%
                  </td>
                  <td className="px-4 py-3 flex justify-center">
                    {getTrendIndicator(trends[metric.name])}
                    {trends[metric.name] !== undefined && Math.abs(trends[metric.name]) >= 0.5 && (
                      <span className={trends[metric.name] > 0 ? 'text-green-600 ml-1' : 'text-red-600 ml-1'}>
                        {Math.abs(trends[metric.name]).toFixed(1)}%
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        <div className="mt-4 text-xs text-slate-500">
          <p>Based on {testResults.length} test results across all runs.</p>
          {Object.keys(trends).length > 0 && (
            <p>Trends compare the most recent run against the 5 previous runs.</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
} 