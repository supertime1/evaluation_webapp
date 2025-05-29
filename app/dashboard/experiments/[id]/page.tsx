'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useExperiment } from '@/lib/hooks/useExperimentManager';
import { useExperimentRuns } from '@/lib/hooks/useRunManager';
import { ArrowLeftIcon, ClockIcon, XCircleIcon, CheckCircleIcon, ArrowPathIcon, ArrowUpIcon, ArrowDownIcon, MinusIcon } from '@heroicons/react/24/outline';
import { formatDistanceToNow } from 'date-fns';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ExperimentMetricsChart, MetricsSummaryCard } from '@/components/metrics';
import { ExperimentDetailHeader } from '@/components/experiments';
import { useQuery } from '@tanstack/react-query';
import { testResultManager } from '@/lib/managers/testResultManager';
import { TestResultEntity } from '@/lib/models';
import { calculateMetricStats, calculateMetricTrends, calculateTwoRunComparison, MetricStats } from '@/lib/utils/metrics';
import { use } from 'react';

// Helper function to get a color for a metric based on its name
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

export default function ExperimentDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const resolvedParams = use(params);
  const experimentId = resolvedParams.id;
  const [activeTab, setActiveTab] = useState('overview');
  
  const { data: experiment, isLoading: isExperimentLoading, error: experimentError } = useExperiment(experimentId);
  const { data: runs, isLoading: isRunsLoading, error: runsError } = useExperimentRuns(experimentId);
  
  const isLoading = isExperimentLoading || isRunsLoading;
  const error = experimentError || runsError;
  
  // Fetch all test results for this experiment's runs
  const runIds = runs?.map(run => run.id) || [];
  const { data: allTestResults = [] } = useQuery({
    queryKey: ['testResultsForExperiment', experimentId],
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
  
  // Get status icon for run
  const getRunStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircleIcon className="h-5 w-5 text-green-500" />;
      case 'running':
        return <ClockIcon className="h-5 w-5 text-blue-500 animate-pulse" />;
      case 'failed':
        return <XCircleIcon className="h-5 w-5 text-red-500" />;
      default:
        return <ClockIcon className="h-5 w-5 text-slate-400" />;
    }
  };
  
  // Handle navigation to run details
  const handleRunClick = (runId: string) => {
    router.push(`/dashboard/experiments/${experimentId}/runs/${runId}`);
  };
  
  if (isLoading) {
    return (
      <div className="min-h-screen bg-white p-6">
        <div className="max-w-7xl mx-auto space-y-8">
          <div className="flex items-center gap-4">
            <Link href="/dashboard/experiments">
              <Button variant="outline" size="sm" className="flex items-center gap-2">
                <ArrowLeftIcon className="h-4 w-4" />
                Back to Experiments
              </Button>
            </Link>
          </div>
          
          {/* Loading skeleton */}
          <div className="animate-pulse">
            <div className="bg-white border border-slate-200 rounded-lg p-6 mb-8">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="h-8 bg-slate-200 rounded w-64 mb-4"></div>
                  <div className="h-4 bg-slate-200 rounded w-full mb-2"></div>
                  <div className="h-4 bg-slate-200 rounded w-3/4 mb-4"></div>
                  <div className="space-y-2">
                    <div className="h-3 bg-slate-200 rounded w-48"></div>
                    <div className="h-3 bg-slate-200 rounded w-52"></div>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="h-10 bg-slate-200 rounded w-32"></div>
                  <div className="h-10 bg-slate-200 rounded w-32"></div>
                  <div className="h-10 bg-slate-200 rounded w-32"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-white p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center gap-4 mb-8">
            <Link href="/dashboard/experiments">
              <Button variant="outline" size="sm" className="flex items-center gap-2">
                <ArrowLeftIcon className="h-4 w-4" />
                Back to Experiments
              </Button>
            </Link>
          </div>
          
          <div className="bg-red-50 border border-red-200 rounded-md p-4">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-700" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3 flex-1">
                <h3 className="text-sm font-medium text-red-700">
                  Failed to load experiment
                </h3>
                <div className="mt-2 text-sm text-red-700">
                  {error.message || 'An error occurred while loading the experiment.'}
                </div>
                <div className="mt-3">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => window.location.reload()}
                    className="text-red-700 border-red-300 hover:bg-red-100"
                  >
                    Try Again
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!experiment) {
    return (
      <div className="min-h-screen bg-white p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center gap-4 mb-8">
            <Link href="/dashboard/experiments">
              <Button variant="outline" size="sm" className="flex items-center gap-2">
                <ArrowLeftIcon className="h-4 w-4" />
                Back to Experiments
              </Button>
            </Link>
          </div>
          
          <div className="text-center py-12">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-slate-300 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
            <h1 className="text-2xl font-bold text-slate-900 mb-4">Experiment not found</h1>
            <p className="text-slate-500 mb-6">
              The experiment you're looking for doesn't exist or you don't have permission to view it.
            </p>
            <Link href="/dashboard/experiments">
              <Button variant="outline">Back to Experiments</Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Navigation */}
        <div className="flex items-center gap-4">
          <Link href="/dashboard/experiments">
            <Button variant="outline" size="sm" className="flex items-center gap-2">
              <ArrowLeftIcon className="h-4 w-4" />
              Back to Experiments
            </Button>
          </Link>
        </div>

        {/* Experiment Header */}
        <ExperimentDetailHeader experiment={experiment} />

        {/* Tabs navigation */}
        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="mb-4">
            <TabsTrigger 
              value="overview" 
              onClick={() => setActiveTab('overview')}
              active={activeTab === 'overview'}
              className="px-4 py-2"
            >
              Overview
            </TabsTrigger>
            <TabsTrigger
              value="runs"
              onClick={() => setActiveTab('runs')}
              active={activeTab === 'runs'}
              className="px-4 py-2"
            >
              Runs
            </TabsTrigger>
            <TabsTrigger
              value="settings"
              onClick={() => setActiveTab('settings')}
              active={activeTab === 'settings'}
              className="px-4 py-2"
            >
              Settings
            </TabsTrigger>
          </TabsList>
        </Tabs>

        {/* Tab content */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Metrics grid: summary and trend cards */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Metrics chart in the larger space */}
              <div className="lg:col-span-2">
                <Card>
                  <CardHeader>
                    <CardTitle>Metric Data</CardTitle>
                    <CardDescription>Using evaluation data from {runs?.length || 0} displayed test runs (error bar = 1 SD)</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-80 w-full">
                      <ExperimentMetricsChart runs={runs || []} experimentId={experimentId} />
                    </div>
                  </CardContent>
                </Card>
              </div>
              
              {/* Metrics trend card */}
              <div>
                <Card className="h-full">
                  <CardHeader>
                    <CardTitle>Metric Trends</CardTitle>
                    <CardDescription>
                      {(() => {
                        const comparison = calculateTwoRunComparison(allTestResults, runs || []);
                        if (comparison.comparisonCount < 2) {
                          return `Need at least 2 runs for comparison (${comparison.comparisonCount} available)`;
                        }
                        return `Comparing the 2 most recent test runs`;
                      })()}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {(() => {
                      const comparison = calculateTwoRunComparison(allTestResults, runs || []);
                      
                      if (comparison.comparisonCount < 2) {
                        return (
                          <div className="text-center py-10 text-slate-500">
                            <div className="mb-2">Not enough runs for comparison</div>
                            <div className="text-sm">Create more runs to see metric trends</div>
                          </div>
                        );
                      }
                      
                      if (Object.keys(comparison.trends).length === 0) {
                        return (
                          <div className="text-center py-10 text-slate-500">
                            No comparable metric data between runs
                          </div>
                        );
                      }
                      
                      return (
                        <div className="space-y-4">
                          {/* Run comparison header */}
                          <div className="bg-slate-50 rounded-lg p-3 space-y-2">
                            <div className="text-xs font-medium text-slate-600 uppercase tracking-wide">
                              Comparing Runs
                            </div>
                            <div className="space-y-2">
                              <div className="flex items-center justify-between text-sm">
                                <div className="flex-1">
                                  <div className="text-slate-700">
                                    Most Recent: <span className="font-mono font-medium">{comparison.mostRecentRun?.id.slice(-8)}</span>
                                  </div>
                                  <div className="text-xs text-slate-500">
                                    {formatDistanceToNow(new Date(comparison.mostRecentRun?.created_at), { addSuffix: true })}
                                  </div>
                                </div>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="h-7 px-3 text-xs"
                                  onClick={() => handleRunClick(comparison.mostRecentRun?.id)}
                                >
                                  View Details
                                </Button>
                              </div>
                              <div className="flex items-center justify-between text-sm">
                                <div className="flex-1">
                                  <div className="text-slate-700">
                                    Previous: <span className="font-mono font-medium">{comparison.previousRun?.id.slice(-8)}</span>
                                  </div>
                                  <div className="text-xs text-slate-500">
                                    {formatDistanceToNow(new Date(comparison.previousRun?.created_at), { addSuffix: true })}
                                  </div>
                                </div>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="h-7 px-3 text-xs"
                                  onClick={() => handleRunClick(comparison.previousRun?.id)}
                                >
                                  View Details
                                </Button>
                              </div>
                            </div>
                          </div>
                          
                          {/* Metrics comparison */}
                          <div className="space-y-3">
                            {calculateMetricStats(allTestResults).map((metric, index) => {
                              const trendValue = comparison.trends[metric.name];
                              if (trendValue === undefined || isNaN(trendValue)) return null;
                              
                              const isUp = trendValue > 0;
                              const isSignificant = Math.abs(trendValue) >= 0.5;
                              const color = getMetricColor(metric.name);
                              
                              return (
                                <div 
                                  key={metric.name}
                                  className="bg-slate-50 hover:bg-slate-100 rounded-lg p-4 flex items-center justify-between transition-colors cursor-pointer"
                                  onMouseEnter={() => {
                                    // This is where you'd highlight the corresponding line in the chart
                                    // This would require a shared state between components
                                  }}
                                >
                                  <div className="flex items-center">
                                    <div
                                      className="w-3 h-3 rounded-full mr-3 flex-shrink-0" 
                                      style={{ backgroundColor: color }}
                                    />
                                    <div>
                                      <div className="font-medium">{metric.name}</div>
                                      {metric.evaluationModel && (
                                        <div className="text-xs text-slate-500">
                                          ({metric.evaluationModel})
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                  <div className="flex items-center">
                                    {isSignificant ? (
                                      isUp ? (
                                        <span className="flex items-center text-green-600">
                                          <ArrowUpIcon className="h-3.5 w-3.5 mr-1" />
                                          +{Math.abs(trendValue).toFixed(2)}%
                                        </span>
                                      ) : (
                                        <span className="flex items-center text-red-600">
                                          <ArrowDownIcon className="h-3.5 w-3.5 mr-1" />
                                          -{Math.abs(trendValue).toFixed(2)}%
                                        </span>
                                      )
                                    ) : (
                                      <span className="flex items-center text-slate-500">
                                        <MinusIcon className="h-3.5 w-3.5 mr-1" />
                                        {trendValue >= 0 ? '+' : ''}{trendValue.toFixed(2)}%
                                      </span>
                                    )}
                                  </div>
                                </div>
                              );
                            }).filter(Boolean)}
                          </div>
                        </div>
                      );
                    })()}
                  </CardContent>
                </Card>
              </div>
            </div>
            
            {/* Metrics summary */}
            <MetricsSummaryCard 
              testResults={allTestResults} 
              title="Metrics Summary" 
            />
            
            {/* Recent runs */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Runs</CardTitle>
                <CardDescription>Latest evaluation runs for this experiment</CardDescription>
              </CardHeader>
              <CardContent>
                {runs && runs.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                      <thead className="text-xs uppercase bg-slate-50 text-slate-700">
                        <tr>
                          <th className="px-6 py-3">ID</th>
                          <th className="px-6 py-3">Git Commit</th>
                          <th className="px-6 py-3">Status</th>
                          <th className="px-6 py-3">Created</th>
                          <th className="px-6 py-3">Metrics</th>
                        </tr>
                      </thead>
                      <tbody>
                        {runs.slice(0, 5).map((run) => (
                          <tr 
                            key={run.id}
                            className="border-b border-slate-200 hover:bg-slate-50 cursor-pointer"
                            onClick={() => handleRunClick(run.id)}
                          >
                            <td className="px-6 py-4 font-medium">{run.id}</td>
                            <td className="px-6 py-4 font-mono text-xs">{run.git_commit?.substring(0, 8) || 'N/A'}</td>
                            <td className="px-6 py-4">
                              <div className="flex items-center">
                                {getRunStatusIcon(run.status)}
                                <span className="ml-2 capitalize">{run.status}</span>
                              </div>
                            </td>
                            <td className="px-6 py-4">{formatDistanceToNow(new Date(run.created_at), { addSuffix: true })}</td>
                            <td className="px-6 py-4">
                              <div className="flex items-center">
                                <span className="h-2 w-2 rounded-full bg-green-500 mr-2"></span>
                                <span>Passing</span>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    
                    {runs.length > 5 && (
                      <div className="flex justify-center mt-4">
                        <Button 
                          variant="outline" 
                          className="text-sm"
                          onClick={() => setActiveTab('runs')}
                        >
                          View all runs
                        </Button>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-10 text-slate-500">
                    <p>No runs available. Runs are automatically created by the LLM system.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}
        
        {/* Runs tab content */}
        {activeTab === 'runs' && (
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>All Runs</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              {runs && runs.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm text-left">
                    <thead className="text-xs uppercase bg-slate-50 text-slate-700">
                      <tr>
                        <th className="px-6 py-3">ID</th>
                        <th className="px-6 py-3">Git Commit</th>
                        <th className="px-6 py-3">Status</th>
                        <th className="px-6 py-3">Created</th>
                        <th className="px-6 py-3">Started</th>
                        <th className="px-6 py-3">Finished</th>
                        <th className="px-6 py-3">Metrics</th>
                      </tr>
                    </thead>
                    <tbody>
                      {runs.map((run) => (
                        <tr 
                          key={run.id}
                          className="border-b border-slate-200 hover:bg-slate-50 cursor-pointer"
                          onClick={() => handleRunClick(run.id)}
                        >
                          <td className="px-6 py-4 font-medium">{run.id}</td>
                          <td className="px-6 py-4 font-mono text-xs">{run.git_commit?.substring(0, 8) || 'N/A'}</td>
                          <td className="px-6 py-4">
                            <div className="flex items-center">
                              {getRunStatusIcon(run.status)}
                              <span className="ml-2 capitalize">{run.status}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4">{formatDistanceToNow(new Date(run.created_at), { addSuffix: true })}</td>
                          <td className="px-6 py-4">{run.started_at ? formatDistanceToNow(new Date(run.started_at), { addSuffix: true }) : 'N/A'}</td>
                          <td className="px-6 py-4">{run.finished_at ? formatDistanceToNow(new Date(run.finished_at), { addSuffix: true }) : 'N/A'}</td>
                          <td className="px-6 py-4">
                            <div className="flex items-center">
                              <span className="h-2 w-2 rounded-full bg-green-500 mr-2"></span>
                              <span>Passing</span>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-10 text-slate-500">
                  <p>No runs available. Runs are automatically created by the LLM system.</p>
                </div>
              )}
            </CardContent>
          </Card>
        )}
        
        {/* Settings tab content - placeholder for now */}
        {activeTab === 'settings' && (
          <Card>
            <CardHeader>
              <CardTitle>Experiment Settings</CardTitle>
              <CardDescription>Manage experiment configuration</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-slate-700">Settings content coming soon.</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
} 