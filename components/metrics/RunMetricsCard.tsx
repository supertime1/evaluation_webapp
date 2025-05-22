'use client';

import { useMemo } from 'react';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle, 
  CardDescription 
} from '@/components/ui/card';
import { RunEntity, TestResultEntity } from '@/lib/models';
import { CheckCircleIcon, XCircleIcon } from '@heroicons/react/24/outline';
import { formatDistanceToNow } from 'date-fns';

type RunMetricsCardProps = {
  run: RunEntity;
  testResults: TestResultEntity[];
};

export function RunMetricsCard({ run, testResults }: RunMetricsCardProps) {
  // Calculate success metrics
  const metrics = useMemo(() => {
    // If no test results, return empty state
    if (!testResults || testResults.length === 0) {
      return {
        successCount: 0,
        totalCount: 0,
        successRate: 0,
        metricsData: [],
        evaluationModels: new Set<string>()
      };
    }
    
    // Extract all metrics from all test results
    const allMetrics: Array<{
      name: string;
      score: number;
      success: boolean;
      threshold?: number;
      evaluationModel?: string;
    }> = [];
    
    const evaluationModels = new Set<string>();
    
    testResults.forEach(result => {
      result.metrics_data.forEach(metric => {
        allMetrics.push({
          name: metric.name,
          score: metric.score,
          success: metric.success,
          threshold: metric.threshold,
          evaluationModel: metric.evaluation_model
        });
        
        if (metric.evaluation_model) {
          evaluationModels.add(metric.evaluation_model);
        }
      });
    });
    
    // Group metrics by name
    const metricsMap = new Map<string, typeof allMetrics>();
    
    allMetrics.forEach(metric => {
      if (!metricsMap.has(metric.name)) {
        metricsMap.set(metric.name, []);
      }
      metricsMap.get(metric.name)!.push(metric);
    });
    
    // Calculate success rate
    const successMetrics = allMetrics.filter(m => m.success);
    const successRate = allMetrics.length > 0 
      ? successMetrics.length / allMetrics.length 
      : 0;
      
    // Create an array of summarized metrics for display
    const metricsData = Array.from(metricsMap.entries()).map(([name, metrics]) => {
      const totalCount = metrics.length;
      const successCount = metrics.filter(m => m.success).length;
      const averageScore = metrics.reduce((sum, m) => sum + m.score, 0) / totalCount;
      
      // Most common threshold if available
      const thresholds = metrics
        .filter(m => m.threshold !== undefined)
        .map(m => m.threshold!);
      
      const threshold = thresholds.length > 0 
        ? thresholds.reduce((sum, t) => sum + t, 0) / thresholds.length 
        : undefined;
        
      return {
        name,
        averageScore,
        successCount,
        totalCount,
        successRate: successCount / totalCount,
        threshold
      };
    });
    
    // Sort by name
    metricsData.sort((a, b) => a.name.localeCompare(b.name));
    
    return {
      successCount: successMetrics.length,
      totalCount: allMetrics.length,
      successRate,
      metricsData,
      evaluationModels
    };
  }, [testResults]);
  
  // Format percentage
  const formatPercent = (value: number): string => {
    return `${(value * 100).toFixed(1)}%`;
  };
  
  // Format score
  const formatScore = (value: number): string => {
    return value.toFixed(3);
  };
  
  // If no test results, show placeholder
  if (testResults.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Run Metrics</CardTitle>
          <CardDescription>
            Run: {run.id.slice(0, 8)}
            {run.created_at && (
              <> - {formatDistanceToNow(new Date(run.created_at), { addSuffix: true })}</>
            )}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-6 text-slate-500">
            No metrics data available for this run.
          </div>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          Run Metrics
          <span className={`ml-2 text-sm px-2 py-0.5 rounded-full ${
            metrics.successRate > 0.9 
              ? 'bg-green-100 text-green-800' 
              : metrics.successRate > 0.7 
                ? 'bg-yellow-100 text-yellow-800' 
                : 'bg-red-100 text-red-800'
          }`}>
            {formatPercent(metrics.successRate)} pass rate
          </span>
        </CardTitle>
        <CardDescription>
          Run ID: {run.id.slice(0, 8)}
          {run.created_at && (
            <> - {formatDistanceToNow(new Date(run.created_at), { addSuffix: true })}</>
          )}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-xs uppercase bg-slate-50 text-slate-700">
              <tr>
                <th className="px-4 py-2 text-left">Metric</th>
                <th className="px-4 py-2 text-right">Score</th>
                <th className="px-4 py-2 text-right">Threshold</th>
                <th className="px-4 py-2 text-center">Status</th>
                <th className="px-4 py-2 text-right">Success Rate</th>
              </tr>
            </thead>
            <tbody>
              {metrics.metricsData.map((metric) => (
                <tr key={metric.name} className="border-b border-slate-200">
                  <td className="px-4 py-3 font-medium">{metric.name}</td>
                  <td className="px-4 py-3 text-right">{formatScore(metric.averageScore)}</td>
                  <td className="px-4 py-3 text-right">
                    {metric.threshold !== undefined 
                      ? formatScore(metric.threshold) 
                      : 'N/A'}
                  </td>
                  <td className="px-4 py-3 flex justify-center">
                    {metric.successRate >= 0.5 ? (
                      <CheckCircleIcon className="h-5 w-5 text-green-500" />
                    ) : (
                      <XCircleIcon className="h-5 w-5 text-red-500" />
                    )}
                  </td>
                  <td className="px-4 py-3 text-right">
                    {formatPercent(metric.successRate)}
                    <span className="text-slate-400 ml-1">
                      ({metric.successCount}/{metric.totalCount})
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        <div className="mt-4 text-xs text-slate-500">
          <p>Based on {testResults.length} test results for this run.</p>
          {metrics.evaluationModels.size > 0 && (
            <p>
              Evaluation models: {Array.from(metrics.evaluationModels).join(', ')}
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
} 