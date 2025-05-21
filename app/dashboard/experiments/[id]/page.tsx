'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useExperiment } from '@/lib/hooks/useExperimentManager';
import { useExperimentRuns } from '@/lib/hooks/useRunManager';
import { ArrowLeftIcon, ClockIcon, XCircleIcon, CheckCircleIcon, ArrowPathIcon } from '@heroicons/react/24/outline';
import { formatDistanceToNow } from 'date-fns';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { MetricTrendsV2 } from '@/components/metrics/MetricTrendsV2';
import { MetricBreakdown } from '@/components/metrics/MetricBreakdown';
import { use } from 'react';

export default function ExperimentDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const resolvedParams = use(params);
  const experimentId = resolvedParams.id;
  const [activeTab, setActiveTab] = useState('overview');
  
  const { data: experiment, isLoading: isExperimentLoading, error: experimentError } = useExperiment(experimentId);
  const { data: runs, isLoading: isRunsLoading, error: runsError } = useExperimentRuns(experimentId);
  
  const isLoading = isExperimentLoading || isRunsLoading;
  const error = experimentError || runsError;
  
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
      <div className="flex h-full items-center justify-center">
        <div className="animate-spin h-10 w-10 border-4 border-blue-500 rounded-full border-t-transparent"></div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md m-6">
        Error loading experiment: {error.message}
      </div>
    );
  }
  
  if (!experiment) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 text-yellow-700 px-4 py-3 rounded-md m-6">
        Experiment not found
      </div>
    );
  }
  
  return (
    <div className="p-6 space-y-6">
      {/* Header with back button */}
      <div className="flex flex-col space-y-4">
        <div className="flex items-center">
          <Link href="/dashboard/experiments" className="text-slate-500 hover:text-slate-700 mr-4">
            <ArrowLeftIcon className="h-5 w-5" />
          </Link>
          <h1 className="text-2xl font-bold text-slate-800">{experiment.name}</h1>
          <div className="ml-auto flex space-x-2">
            <Button variant="outline" className="h-10">
              <ArrowPathIcon className="h-4 w-4 mr-2" />
              Sync
            </Button>
          </div>
        </div>
        
        <div className="flex items-center text-sm text-slate-500">
          <div className="flex items-center mr-4">
            <span>ID: {experimentId}</span>
          </div>
          <div className="flex items-center">
            <span>Created: {formatDistanceToNow(new Date(experiment.created_at), { addSuffix: true })}</span>
          </div>
        </div>
        
        {experiment.description && (
          <p className="text-sm text-slate-700">{experiment.description}</p>
        )}
      </div>
      
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
      
      {/* Overview tab content */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Metrics chart */}
          <MetricTrendsV2 runs={runs || []} experimentId={experimentId} />
          
          {/* Metrics breakdown */}
          <MetricBreakdown runs={runs || []} />
          
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
                  <Link href="/dashboard/experiments/runs-info" className="text-blue-600 hover:underline inline-block mt-2">
                    Learn how runs work
                  </Link>
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
                <Link href="/dashboard/experiments/runs-info" className="text-blue-600 hover:underline inline-block mt-2">
                  Learn how runs work
                </Link>
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
  );
} 