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

// Helper function to get a color for each metric
function getMetricColor(metricName: string): string {
  // Set of predefined colors for different metrics
  const colorMap: Record<string, string> = {
    'Concision': '#3b82f6', // blue
    'Completeness': '#6366f1', // indigo
    'Relevancy': '#8b5cf6', // purple
    'Answer Relevancy': '#8b5cf6', // purple
    'Correctness': '#ec4899', // pink
    'Factual Accuracy': '#f43f5e', // rose
    'Helpfulness': '#f97316', // orange
    'Coherence': '#eab308', // yellow
    'Safety': '#10b981', // emerald
  };
  
  // Return mapped color or a default if not found
  return colorMap[metricName] || '#64748b'; // slate as default
}

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
            <thead className="text-xs uppercase text-slate-700">
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
            <tbody className="divide-y divide-slate-200">
              {stats.map((metric: MetricStats) => (
                <tr 
                  key={metric.name} 
                  className="hover:bg-slate-50"
                >
                  <td className="px-4 py-3">
                    <div className="flex items-center">
                      <div 
                        className="w-2 h-8 rounded-full mr-3" 
                        style={{ backgroundColor: getMetricColor(metric.name) }}
                      />
                      <div>
                        <div className="font-medium">{metric.name}</div>
                        {metric.evaluationModel && (
                          <div className="text-xs text-slate-500">
                            {metric.evaluationModel}
                          </div>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-right text-slate-600">{formatScore(metric.min)}</td>
                  <td className="px-4 py-3 text-right font-medium">{formatScore(metric.average)}</td>
                  <td className="px-4 py-3 text-right text-slate-600">{formatScore(metric.max)}</td>
                  <td className="px-4 py-3 text-right text-slate-600">{formatScore(metric.stdDev)}</td>
                  <td className="px-4 py-3">
                    <div className="flex justify-center">
                      {getStatusIcon(metric.successRate)}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div>
                      {formatScore(metric.successRate * 100)}%
                    </div>
                    <div className="text-xs text-slate-400">
                      ({Math.round(metric.successRate * metric.count)}/{metric.count})
                    </div>
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