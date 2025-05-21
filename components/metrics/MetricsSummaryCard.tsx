'use client';

import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TestResultEntity } from '@/lib/models';
import { 
  calculateMetricStats,
  MetricStats 
} from '@/lib/utils/metrics';
import { CheckCircleIcon, XCircleIcon } from '@heroicons/react/24/outline';

type MetricsSummaryProps = {
  testResults: TestResultEntity[];
  title?: string;
};

export function MetricsSummaryCard({ testResults, title = 'Metrics Summary' }: MetricsSummaryProps) {
  // Calculate metric statistics
  const stats = useMemo(() => {
    if (!testResults || testResults.length === 0) {
      return [];
    }
    
    // Calculate overall stats for all test results
    const metricStats = calculateMetricStats(testResults);
    
    return metricStats;
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
  
  // Get status icon
  const getStatusIcon = (successRate: number) => {
    return successRate >= 0.5 ? (
      <CheckCircleIcon className="h-5 w-5 text-green-500" />
    ) : (
      <XCircleIcon className="h-5 w-5 text-red-500" />
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
                <th className="px-4 py-2 text-right">Min</th>
                <th className="px-4 py-2 text-right">Average</th>
                <th className="px-4 py-2 text-right">Max</th>
                <th className="px-4 py-2 text-right">Std Dev</th>
                <th className="px-4 py-2 text-center">Status</th>
                <th className="px-4 py-2 text-right">Success</th>
              </tr>
            </thead>
            <tbody>
              {stats.map((metric: MetricStats) => (
                <tr key={metric.name} className="border-b border-slate-200">
                  <td className="px-4 py-3 font-medium">
                    {metric.name}
                    {metric.evaluationModel && (
                      <div className="text-xs text-slate-500">
                        {metric.evaluationModel}
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right">{formatScore(metric.min)}</td>
                  <td className="px-4 py-3 text-right font-medium">{formatScore(metric.average)}</td>
                  <td className="px-4 py-3 text-right">{formatScore(metric.max)}</td>
                  <td className="px-4 py-3 text-right">{formatScore(metric.stdDev)}</td>
                  <td className="px-4 py-3 flex justify-center">
                    {getStatusIcon(metric.successRate)}
                  </td>
                  <td className="px-4 py-3 text-right">
                    {formatScore(metric.successRate * 100)}%
                    <span className="text-slate-400 ml-1">
                      ({Math.round(metric.successRate * metric.count)}/{metric.count})
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        <div className="mt-4 text-xs text-slate-500">
          <p>Based on {testResults.length} test results across all runs.</p>
        </div>
      </CardContent>
    </Card>
  );
} 