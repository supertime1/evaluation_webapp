'use client';

import { useMemo } from 'react';
import { RunEntity } from '@/lib/models';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircleIcon, ExclamationTriangleIcon, XCircleIcon } from '@heroicons/react/24/outline';

type ExperimentHealthProps = {
  runs: RunEntity[];
  className?: string;
};

type HealthStatus = {
  status: 'healthy' | 'warning' | 'critical';
  score: number;
  trend: 'improving' | 'stable' | 'declining';
  issues: string[];
};

export function ExperimentHealth({ runs, className }: ExperimentHealthProps) {
  // Calculate health status from runs
  const health = useMemo((): HealthStatus => {
    // If no runs, return warning status
    if (!runs.length) {
      return {
        status: 'warning',
        score: 0,
        trend: 'stable',
        issues: ['No evaluation runs available yet']
      };
    }
    
    // Sort runs by creation date (newest first)
    const sortedRuns = [...runs].sort((a, b) => 
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
    
    // In a real application, we would calculate metrics from actual run data
    // For demo purposes, using random data with some logic
    
    // Calculate mock average score (0.0-1.0)
    const score = 0.7 + Math.random() * 0.25; // Random score between 0.7 and 0.95
    
    // Determine status based on score
    let status: 'healthy' | 'warning' | 'critical' = 'healthy';
    if (score < 0.75) status = 'critical';
    else if (score < 0.85) status = 'warning';
    
    // Determine trend
    // In a real app, this would compare metrics across multiple runs
    const trendValue = Math.random();
    const trend = trendValue > 0.6 ? 'improving' : trendValue > 0.3 ? 'stable' : 'declining';
    
    // Generate some example issues based on status
    let issues: string[] = [];
    if (status === 'critical') {
      issues = [
        'Accuracy score below acceptable threshold',
        'Significant decline in model performance',
        'High error rate on critical test cases'
      ];
    } else if (status === 'warning') {
      issues = [
        'Completeness score declining in recent runs',
        'Performance inconsistent across test cases',
        'Some test categories show suboptimal results'
      ];
    } else {
      if (Math.random() > 0.7) {
        issues = ['Minor fluctuations in relevancy metric, but still within acceptable range'];
      }
    }
    
    return {
      status,
      score,
      trend,
      issues
    };
  }, [runs]);
  
  // Status icon based on health status
  const StatusIcon = () => {
    switch (health.status) {
      case 'healthy':
        return <CheckCircleIcon className="h-6 w-6 text-green-500" />;
      case 'warning':
        return <ExclamationTriangleIcon className="h-6 w-6 text-amber-500" />;
      case 'critical':
        return <XCircleIcon className="h-6 w-6 text-red-500" />;
    }
  };
  
  // Status colors and text based on health status
  const statusConfig = {
    healthy: {
      bgColor: 'bg-green-50',
      borderColor: 'border-green-200',
      textColor: 'text-green-700',
      title: 'Healthy',
      description: 'All metrics are within acceptable ranges'
    },
    warning: {
      bgColor: 'bg-amber-50',
      borderColor: 'border-amber-200',
      textColor: 'text-amber-700',
      title: 'Needs Attention',
      description: 'Some metrics are below optimal levels'
    },
    critical: {
      bgColor: 'bg-red-50',
      borderColor: 'border-red-200',
      textColor: 'text-red-700',
      title: 'Critical Issues',
      description: 'Multiple metrics below acceptable thresholds'
    }
  };
  
  const config = statusConfig[health.status];
  
  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>Experiment Health</CardTitle>
        <CardDescription>Overall evaluation performance</CardDescription>
      </CardHeader>
      <CardContent>
        <div className={`${config.bgColor} ${config.borderColor} border p-4 rounded-md mb-4`}>
          <div className="flex items-center">
            <StatusIcon />
            <div className="ml-3">
              <h3 className={`font-semibold ${config.textColor}`}>{config.title}</h3>
              <p className="text-sm text-slate-600">{config.description}</p>
            </div>
            
            <div className="ml-auto">
              <div className="flex items-center">
                <span className="text-2xl font-bold mr-2">
                  {Math.round(health.score * 100)}%
                </span>
                <div className="text-xs">
                  Health<br />Score
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {health.issues.length > 0 && (
          <div className="space-y-3">
            <h4 className="text-sm font-medium text-slate-700">Issues to address:</h4>
            <ul className="space-y-2">
              {health.issues.map((issue, index) => (
                <li key={index} className="text-sm text-slate-600 flex items-start">
                  <span className="inline-block h-1.5 w-1.5 rounded-full bg-slate-500 mt-1.5 mr-2"></span>
                  {issue}
                </li>
              ))}
            </ul>
          </div>
        )}
        
        {health.status === 'healthy' && health.issues.length === 0 && (
          <div className="text-sm text-slate-600">
            All metrics are within acceptable ranges. No issues detected in recent runs.
          </div>
        )}
        
        <div className="mt-4 text-xs text-slate-500 flex items-center">
          <span className="mr-1">Trend:</span>
          {health.trend === 'improving' && <span className="text-green-600">Improving</span>}
          {health.trend === 'stable' && <span className="text-blue-600">Stable</span>}
          {health.trend === 'declining' && <span className="text-amber-600">Declining</span>}
        </div>
      </CardContent>
    </Card>
  );
} 