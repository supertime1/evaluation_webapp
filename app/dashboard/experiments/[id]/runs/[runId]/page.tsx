'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useExperiment } from '@/lib/hooks/useExperimentManager';
import { useRun, useRunWithResults } from '@/lib/hooks/useRunManager';
import { useTestCase } from '@/lib/hooks/useTestCaseManager';
import { ArrowLeftIcon, ClockIcon, XCircleIcon, CheckCircleIcon, ArrowPathIcon, FunnelIcon } from '@heroicons/react/24/outline';
import { formatDistanceToNow } from 'date-fns';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { use } from 'react';
import { MetricData } from '@/lib/schemas/testResult';
import { TestResultDetailModal } from '@/components/test-results/TestResultDetailModal';
import { TestResult } from '@/lib/schemas/testResult';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { RunDatasetInfo } from '@/components/datasets/RunDatasetInfo';
import { RunDetailHeader } from '@/components/runs';

export default function RunDetailPage({ params }: { params: Promise<{ id: string; runId: string }> }) {
  const router = useRouter();
  const resolvedParams = use(params);
  const experimentId = resolvedParams.id;
  const runId = resolvedParams.runId;
  const [activeTab, setActiveTab] = useState('results');
  
  // State for test result modal
  const [selectedTestResult, setSelectedTestResult] = useState<TestResult | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // State for filter: showOnlyFailed
  const [showOnlyFailed, setShowOnlyFailed] = useState(false);
  
  const { data: experiment, isLoading: isExperimentLoading, error: experimentError } = useExperiment(experimentId);
  const { data: runWithResults, isLoading: isRunLoading, error: runError } = useRunWithResults(runId);
  
  const isLoading = isExperimentLoading || isRunLoading;
  const error = experimentError || runError;
  
  // Get status icon for run
  const getStatusIcon = (status: string) => {
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
  
  // Create a function to render test case result statuses
  const getTestResultStatusIcon = (success: boolean) => {
    return success ? 
      <CheckCircleIcon className="h-5 w-5 text-green-500" /> : 
      <XCircleIcon className="h-5 w-5 text-red-500" />;
  };

  // Get a metric badge component based on success status
  const getMetricBadge = (metric: MetricData) => {
    const bgColor = metric.success ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800';
    return (
      <span className={`${bgColor} text-xs font-medium px-2.5 py-0.5 rounded mr-1 mb-1 inline-block`}>
        {metric.name}: {metric.score.toFixed(2)}
      </span>
    );
  };
  
  // Handle clicking on a test result row
  const handleTestResultClick = (testResult: TestResult) => {
    setSelectedTestResult(testResult);
    setIsModalOpen(true);
  };
  
  // Handle closing the modal
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedTestResult(null);
  };
  
  // Toggle the filter for failed test cases
  const toggleFailedFilter = () => {
    setShowOnlyFailed(!showOnlyFailed);
  };
  
  if (isLoading) {
    return (
      <div className="min-h-screen bg-white p-6">
        <div className="max-w-7xl mx-auto space-y-8">
          <div className="flex items-center gap-4">
            <Link href={`/dashboard/experiments/${experimentId}`}>
              <Button variant="outline" size="sm" className="flex items-center gap-2">
                <ArrowLeftIcon className="h-4 w-4" />
                Back to Experiment
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
            <Link href={`/dashboard/experiments/${experimentId}`}>
              <Button variant="outline" size="sm" className="flex items-center gap-2">
                <ArrowLeftIcon className="h-4 w-4" />
                Back to Experiment
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
                  Failed to load run details
                </h3>
                <div className="mt-2 text-sm text-red-700">
                  {error.message || 'An error occurred while loading the run details.'}
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
  
  if (!experiment || !runWithResults) {
    return (
      <div className="min-h-screen bg-white p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center gap-4 mb-8">
            <Link href={`/dashboard/experiments/${experimentId}`}>
              <Button variant="outline" size="sm" className="flex items-center gap-2">
                <ArrowLeftIcon className="h-4 w-4" />
                Back to Experiment
              </Button>
            </Link>
          </div>
          
          <div className="text-center py-12">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-slate-300 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <h1 className="text-2xl font-bold text-slate-900 mb-4">Run not found</h1>
            <p className="text-slate-500 mb-6">
              The run you're looking for doesn't exist or you don't have permission to view it.
            </p>
            <Link href={`/dashboard/experiments/${experimentId}`}>
              <Button variant="outline">Back to Experiment</Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }
  
  // Filter test results if showOnlyFailed is true
  const filteredTestResults = showOnlyFailed 
    ? runWithResults.test_results?.filter(test => !test.success) || []
    : runWithResults.test_results || [];
  
  const totalTests = runWithResults.test_results?.length || 0;
  const passingTests = runWithResults.test_results?.filter(test => test.success).length || 0;
  const failingTests = totalTests - passingTests;
  const passRate = totalTests > 0 ? (passingTests / totalTests) * 100 : 0;
  
  return (
    <div className="min-h-screen bg-white p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Navigation */}
        <div className="flex items-center gap-4">
          <Link href={`/dashboard/experiments/${experimentId}`}>
            <Button variant="outline" size="sm" className="flex items-center gap-2">
              <ArrowLeftIcon className="h-4 w-4" />
              Back to Experiment
            </Button>
          </Link>
        </div>

        {/* Run Header */}
        <RunDetailHeader 
          run={runWithResults} 
          experiment={experiment} 
          totalTests={totalTests}
          passingTests={passingTests}
        />

        {/* Dataset Information */}
        <RunDatasetInfo datasetVersionId={(runWithResults as any).dataset_version_id} />
        
        {/* Tabs navigation */}
        <Tabs defaultValue="results" className="w-full">
          <TabsList className="mb-4">
            <TabsTrigger 
              value="results" 
              onClick={() => setActiveTab('results')}
              active={activeTab === 'results'}
              className="px-4 py-2"
            >
              Test Results
            </TabsTrigger>
            <TabsTrigger
              value="metrics"
              onClick={() => setActiveTab('metrics')}
              active={activeTab === 'metrics'}
              className="px-4 py-2"
            >
              Metrics
            </TabsTrigger>
            <TabsTrigger
              value="hyperparameters"
              onClick={() => setActiveTab('hyperparameters')}
              active={activeTab === 'hyperparameters'}
              className="px-4 py-2"
            >
              Hyperparameters
            </TabsTrigger>
          </TabsList>
        </Tabs>

        {/* Tab content */}
        {activeTab === 'results' && (
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <div>
                <CardTitle>Test Case Results</CardTitle>
                <CardDescription>Individual results from running test cases</CardDescription>
              </div>
              <div className="flex items-center space-x-2">
                <Label htmlFor="failed-filter" className="text-sm cursor-pointer flex items-center text-slate-700">
                  <FunnelIcon className="h-4 w-4 mr-1 text-slate-500" />
                  Failed only 
                  {failingTests > 0 && <span className="ml-1 text-red-500">({failingTests})</span>}
                </Label>
                <Switch 
                  id="failed-filter" 
                  checked={showOnlyFailed} 
                  onCheckedChange={toggleFailedFilter}
                />
              </div>
            </CardHeader>
            <CardContent>
              {filteredTestResults.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm text-left">
                    <thead className="text-xs uppercase bg-slate-50 text-slate-700">
                      <tr>
                        <th className="px-6 py-3">Status</th>
                        <th className="px-6 py-3">ID</th>
                        <th className="px-6 py-3">Input</th>
                        <th className="px-6 py-3">Expected</th>
                        <th className="px-6 py-3">Actual</th>
                        <th className="px-6 py-3">Metrics</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredTestResults.map(result => (
                        <tr 
                          key={result.id} 
                          className="border-b border-slate-200 hover:bg-slate-50 cursor-pointer"
                          onClick={() => handleTestResultClick(result)}
                        >
                          <td className="px-6 py-4">
                            <span className="flex items-center">
                              {getTestResultStatusIcon(result.success)}
                            </span>
                          </td>
                          <td className="px-6 py-4 font-medium">{result.id}</td>
                          <td className="px-6 py-4 max-w-xs truncate">
                            {typeof result.input === 'string' ? result.input : JSON.stringify(result.input)}
                          </td>
                          <td className="px-6 py-4">{result.expected_output}</td>
                          <td className="px-6 py-4 max-w-xs truncate">
                            {typeof result.actual_output === 'string' ? result.actual_output : JSON.stringify(result.actual_output)}
                          </td>
                          <td className="px-6 py-4 flex flex-wrap">
                            {result.metrics_data && result.metrics_data.length > 0 ? (
                              result.metrics_data.map((metric, index) => (
                                <span key={index}>
                                  {getMetricBadge(metric)}
                                </span>
                              ))
                            ) : (
                              <span className="text-slate-400">No metrics</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-10 text-slate-500">
                  {showOnlyFailed 
                    ? 'No failed test results in this run. All tests have passed!'
                    : 'No test results available for this run'}
                </div>
              )}
            </CardContent>
          </Card>
        )}
        
        {/* Metrics tab content */}
        {activeTab === 'metrics' && (
          <Card>
            <CardHeader>
              <CardTitle>Performance Metrics</CardTitle>
              <CardDescription>Overall metrics for this evaluation run</CardDescription>
            </CardHeader>
            <CardContent>
              {runWithResults.test_results && runWithResults.test_results.some(result => result.metrics_data && result.metrics_data.length > 0) ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Group and aggregate metrics from all test results */}
                  {(() => {
                    // Extract all metrics from test results
                    const allMetrics: MetricData[] = [];
                    runWithResults.test_results.forEach(result => {
                      if (result.metrics_data) {
                        allMetrics.push(...result.metrics_data);
                      }
                    });
                    
                    // Group metrics by name
                    const metricsByName: Record<string, MetricData[]> = {};
                    allMetrics.forEach(metric => {
                      if (!metricsByName[metric.name]) {
                        metricsByName[metric.name] = [];
                      }
                      metricsByName[metric.name].push(metric);
                    });
                    
                    // Calculate averages for each metric type
                    return Object.entries(metricsByName).map(([name, metrics]) => {
                      const totalScore = metrics.reduce((sum, metric) => sum + metric.score, 0);
                      const avgScore = totalScore / metrics.length;
                      const successCount = metrics.filter(m => m.success).length;
                      const successRate = (successCount / metrics.length) * 100;
                      // Use threshold from first metric (assuming all thresholds are the same for a metric type)
                      const threshold = metrics[0]?.threshold || 0;
                      
                      return (
                        <Card key={name} className={`border-l-4 ${successRate >= 50 ? 'border-l-green-500' : 'border-l-red-500'}`}>
                          <CardHeader className="pb-2">
                            <CardTitle className="text-lg">{name}</CardTitle>
                            <CardDescription>
                              {metrics.length} test cases | Threshold: {threshold.toFixed(2)}
                            </CardDescription>
                          </CardHeader>
                          <CardContent>
                            <div className="text-3xl font-bold">
                              {avgScore.toFixed(2)}
                            </div>
                            <div className="mt-2 h-2 w-full bg-slate-200 rounded-full overflow-hidden">
                              <div 
                                className={`h-full ${successRate >= 50 ? 'bg-green-500' : 'bg-red-500'}`}
                                style={{ width: `${avgScore * 100}%` }}
                              ></div>
                            </div>
                            <div className="mt-1 text-sm text-slate-500">
                              {successCount} of {metrics.length} passed ({successRate.toFixed(1)}%)
                            </div>
                          </CardContent>
                        </Card>
                      );
                    });
                  })()}
                </div>
              ) : (
                <div className="text-center py-10 text-slate-500">
                  <p>No metrics data available for this run</p>
                </div>
              )}
            </CardContent>
          </Card>
        )}
        
        {/* Hyperparameters tab content */}
        {activeTab === 'hyperparameters' && (
          <Card>
            <CardHeader>
              <CardTitle>Run Configuration</CardTitle>
              <CardDescription>Hyperparameters used for this run</CardDescription>
            </CardHeader>
            <CardContent>
              {runWithResults.hyperparameters && Object.keys(runWithResults.hyperparameters).length > 0 ? (
                <div className="bg-slate-50 p-4 rounded-md font-mono text-sm">
                  <pre className="whitespace-pre-wrap">
                    {JSON.stringify(runWithResults.hyperparameters, null, 2)}
                  </pre>
                </div>
              ) : (
                <div className="text-center py-10 text-slate-500">
                  <p>No hyperparameters defined for this run</p>
                </div>
              )}
            </CardContent>
          </Card>
        )}
        
        {/* Test Result Detail Modal */}
        <TestResultDetailModal 
          testResult={selectedTestResult}
          isOpen={isModalOpen}
          onClose={handleCloseModal}
        />
      </div>
    </div>
  );
} 