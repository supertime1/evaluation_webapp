'use client';

import React from 'react';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useDatasetVersionRuns } from '@/lib/hooks/useRunManager';
import { useExperiment } from '@/lib/hooks/useExperimentManager';
import { formatDistanceToNow } from 'date-fns';
import { ArrowRightIcon, PlayIcon, CheckCircleIcon, XCircleIcon, ClockIcon, TrashIcon } from '@heroicons/react/24/outline';
import { runManager } from '@/lib/managers/runManager';

interface DatasetRunsUsageProps {
  datasetVersionId?: string;
  datasetName: string;
}

export function DatasetRunsUsage({ datasetVersionId, datasetName }: DatasetRunsUsageProps) {
  const { data: runs = [], isLoading, error, refetch } = useDatasetVersionRuns(datasetVersionId || '');

  // Function to clean up orphaned runs
  const cleanupOrphanedRuns = async () => {
    try {
      // Get all runs for this dataset version
      const allRuns = await runManager.getRunsByDatasetVersion(datasetVersionId || '');
      
      // Check each run's experiment and remove runs with deleted experiments
      const cleanupPromises = allRuns.map(async (run) => {
        try {
          // Try to get the experiment - if it fails with 404, the run is orphaned
          const response = await fetch(`/api/v1/experiments/${run.experiment_id}`, {
            credentials: 'include'
          });
          
          if (response.status === 404) {
            // Remove orphaned run from local cache
            await runManager.deleteRunLocal(run.id);
            return run.id; // Return the ID of cleaned up run
          }
        } catch (error: any) {
          // Network errors or other issues - skip this run for now
          console.warn(`Could not check experiment ${run.experiment_id}:`, error);
        }
        return null;
      });
      
      const cleanedRunIds = (await Promise.all(cleanupPromises)).filter(Boolean);
      
      if (cleanedRunIds.length > 0) {
        console.log(`Cleaned up ${cleanedRunIds.length} orphaned runs`);
        // Refresh the runs list
        refetch();
      }
    } catch (error) {
      console.error('Error cleaning up orphaned runs:', error);
    }
  };

  // Get status icon for run
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircleIcon className="h-4 w-4 text-green-500" />;
      case 'running':
        return <ClockIcon className="h-4 w-4 text-blue-500 animate-pulse" />;
      case 'failed':
        return <XCircleIcon className="h-4 w-4 text-red-500" />;
      default:
        return <ClockIcon className="h-4 w-4 text-slate-400" />;
    }
  };

  if (!datasetVersionId) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <PlayIcon className="h-5 w-5" />
            Runs Using This Dataset
          </CardTitle>
          <CardDescription>
            Experiments that have used this dataset for evaluation
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-slate-500">
            <p>No current version available</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <PlayIcon className="h-5 w-5" />
            Runs Using This Dataset
          </CardTitle>
          <CardDescription>
            Experiments that have used this dataset for evaluation
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="flex items-center justify-between p-4 border border-slate-200 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="h-4 w-4 bg-slate-200 rounded"></div>
                    <div className="space-y-2">
                      <div className="h-4 bg-slate-200 rounded w-32"></div>
                      <div className="h-3 bg-slate-200 rounded w-24"></div>
                    </div>
                  </div>
                  <div className="h-8 bg-slate-200 rounded w-20"></div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <PlayIcon className="h-5 w-5" />
            Runs Using This Dataset
          </CardTitle>
          <CardDescription>
            Experiments that have used this dataset for evaluation
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-sm">
            Error loading runs: {error.message}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <PlayIcon className="h-5 w-5" />
              Runs Using This Dataset
              {runs.length > 0 && <span className="text-sm font-normal text-slate-500">({runs.length})</span>}
            </CardTitle>
            <CardDescription>
              Experiments that have used this dataset for evaluation
            </CardDescription>
          </div>
          {runs.length > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={cleanupOrphanedRuns}
              className="flex items-center gap-2 text-slate-600 hover:text-slate-800"
              title="Remove runs from deleted experiments"
            >
              <TrashIcon className="h-4 w-4" />
              Cleanup
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {runs.length === 0 ? (
          <div className="text-center py-8 text-slate-500">
            <PlayIcon className="h-12 w-12 mx-auto mb-4 text-slate-300" />
            <p className="text-lg font-medium mb-2">No runs found</p>
            <p className="text-sm">
              This dataset version hasn't been used in any experiment runs yet, or the runs haven't been loaded. 
              Visit the experiments page to load run data.
            </p>
          </div>
        ) : (
          <RunsErrorBoundary>
            <div className="space-y-3">
              {runs.map((run) => (
                <SafeRunCard key={run.id} run={run} getStatusIcon={getStatusIcon} />
              ))}
            </div>
          </RunsErrorBoundary>
        )}
      </CardContent>
    </Card>
  );
}

interface RunCardProps {
  run: any;
  getStatusIcon: (status: string) => React.ReactNode;
}

function RunCard({ run, getStatusIcon }: RunCardProps) {
  const { data: experiment, error: experimentError } = useExperiment(run.experiment_id);

  // Handle deleted or inaccessible experiments
  const experimentName = experimentError 
    ? `Experiment ${run.experiment_id.slice(-8)} (deleted)` 
    : experiment?.name || 'Loading...';

  const isExperimentDeleted = experimentError && (
    experimentError.message?.includes('404') || 
    experimentError.message?.includes('not found') ||
    experimentError.name === 'ExperimentNotFound' ||
    experimentError.response?.status === 404
  );

  return (
    <div className="flex items-center justify-between p-4 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors">
      <div className="flex items-center space-x-3">
        {getStatusIcon(run.status)}
        <div>
          <div className="font-medium text-slate-900">
            {experimentName}
            {isExperimentDeleted && (
              <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-800">
                Deleted
              </span>
            )}
          </div>
          <div className="text-sm text-slate-500">
            Run {run.id.slice(-8)} • {formatDistanceToNow(new Date(run.created_at), { addSuffix: true })}
          </div>
        </div>
      </div>
      {!isExperimentDeleted ? (
        <Link href={`/dashboard/experiments/${run.experiment_id}/runs/${run.id}`}>
          <Button variant="outline" size="sm">
            View Details
            <ArrowRightIcon className="h-4 w-4 ml-2" />
          </Button>
        </Link>
      ) : (
        <Button variant="outline" size="sm" disabled className="opacity-50">
          Unavailable
        </Button>
      )}
    </div>
  );
}

// Safe wrapper for individual run cards
function SafeRunCard({ run, getStatusIcon }: RunCardProps) {
  try {
    return <RunCard run={run} getStatusIcon={getStatusIcon} />;
  } catch (error) {
    console.error('Error rendering run card for run:', run.id, error);
    return (
      <div className="flex items-center justify-between p-4 border border-red-200 bg-red-50 rounded-lg">
        <div className="flex items-center space-x-3">
          <XCircleIcon className="h-4 w-4 text-red-500" />
          <div>
            <div className="font-medium text-red-700">
              Run {run.id.slice(-8)} (Error loading)
            </div>
            <div className="text-sm text-red-500">
              Experiment may have been deleted
            </div>
          </div>
        </div>
        <Button variant="outline" size="sm" disabled className="opacity-50">
          Unavailable
        </Button>
      </div>
    );
  }
}

// Simple error boundary component
class RunsErrorBoundary extends React.Component<
  { children: React.ReactNode; fallback?: React.ReactNode },
  { hasError: boolean; error?: Error }
> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Runs component error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-sm">
          <p className="font-medium">Error loading experiment data</p>
          <p className="text-xs mt-1">
            Some experiments may have been deleted. Try using the "Cleanup" button to remove orphaned runs.
          </p>
        </div>
      );
    }

    return this.props.children;
  }
} 