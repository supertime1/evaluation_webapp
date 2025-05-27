'use client';

import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { useDatasetVersionRuns } from '@/lib/hooks/useRunManager';
import { useExperiment } from '@/lib/hooks/useExperimentManager';
import { formatDistanceToNow } from 'date-fns';
import { ArrowRightIcon, CheckCircleIcon, XCircleIcon, ClockIcon } from '@heroicons/react/24/outline';

interface DatasetRunsUsageProps {
  datasetVersionId?: string;
  datasetName: string;
}

export function DatasetRunsUsage({ datasetVersionId, datasetName }: DatasetRunsUsageProps) {
  const { data: runs = [], isLoading, error } = useDatasetVersionRuns(datasetVersionId || '');

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
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h3 className="text-lg font-semibold text-slate-900">Runs Using This Dataset</h3>
            <p className="text-sm text-slate-500 mt-1">
              No current version available
            </p>
          </div>
        </div>
        
        <div className="text-center py-8">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-slate-300 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
          <h4 className="text-lg font-medium text-slate-900 mb-2">
            No version selected
          </h4>
          <p className="text-slate-500">
            Select a dataset version to see which runs have used it.
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-md p-4">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-red-700" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3 flex-1">
            <h3 className="text-sm font-medium text-red-700">
              Failed to load runs
            </h3>
            <div className="mt-2 text-sm text-red-700">
              {error.message || 'An error occurred while loading runs.'}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold text-slate-900">Runs Using This Dataset</h3>
          <div className="h-4 w-16 bg-slate-200 rounded animate-pulse"></div>
        </div>
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="bg-white border border-slate-200 rounded-lg shadow-sm p-4 animate-pulse">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full bg-slate-200"></div>
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
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold text-slate-900">Runs Using This Dataset</h3>
          <p className="text-sm text-slate-500 mt-1">
            {runs.length} run{runs.length !== 1 ? 's' : ''} found
          </p>
        </div>
      </div>

      {/* Run Timeline */}
      {runs.length > 0 ? (
        <div className="space-y-4">
          {runs.map((run, index) => (
            <div key={run.id} className="relative">
              {/* Timeline connector */}
              {index < runs.length - 1 && (
                <div className="absolute left-6 top-16 bottom-0 w-px bg-slate-200"></div>
              )}
              
              {/* Run card */}
              <RunCard run={run} getStatusIcon={getStatusIcon} />
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-8">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-slate-300 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
          <h4 className="text-lg font-medium text-slate-900 mb-2">
            No runs found
          </h4>
          <p className="text-slate-500 mb-4">
            This dataset version hasn't been used in any experiment runs yet, or the runs haven't been loaded. 
            Visit the experiments page to load run data.
          </p>
        </div>
      )}
    </div>
  );
}

interface RunCardProps {
  run: any;
  getStatusIcon: (status: string) => React.ReactNode;
}

function RunCard({ run, getStatusIcon }: RunCardProps) {
  const { data: experiment } = useExperiment(run.experiment_id);

  // Get status color for timeline dot
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-500';
      case 'running':
        return 'bg-blue-500';
      case 'failed':
        return 'bg-red-500';
      default:
        return 'bg-slate-300';
    }
  };

  return (
    <div className="bg-white border border-slate-200 rounded-lg shadow-sm">
      <div className="p-4">
        {/* Run Header */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3">
            {/* Timeline dot */}
            <div className={`w-3 h-3 rounded-full flex-shrink-0 ${getStatusColor(run.status)}`}></div>
            
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="font-medium text-slate-900">
                  {experiment?.name || 'Loading...'}
                </span>
                <div className="flex items-center gap-1">
                  {getStatusIcon(run.status)}
                  <span className="text-sm text-slate-500 capitalize">{run.status}</span>
                </div>
              </div>
              <p className="text-sm text-slate-500">
                Run {run.id.slice(-8)} • {formatDistanceToNow(new Date(run.created_at), { addSuffix: true })}
              </p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            <Link href={`/dashboard/experiments/${run.experiment_id}/runs/${run.id}`}>
              <Button
                variant="outline"
                size="sm"
                className="h-8 px-3 text-xs flex items-center gap-1"
              >
                View Details
                <ArrowRightIcon className="h-3 w-3" />
              </Button>
            </Link>
          </div>
        </div>

        {/* Run Details */}
        <div className="flex items-center gap-4 text-sm text-slate-500">
          {run.git_commit && (
            <div className="flex items-center gap-1">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
              </svg>
              <span className="font-mono text-xs">{run.git_commit.substring(0, 8)}</span>
            </div>
          )}
          
          <div className="flex items-center gap-1">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3a4 4 0 118 0v4m-4 6v6m-4-6h8m-8 0a2 2 0 00-2 2v6a2 2 0 002 2h8a2 2 0 002-2v-6a2 2 0 00-2-2" />
            </svg>
            <span className="font-mono text-xs">{run.id.slice(-8)}</span>
          </div>
        </div>
      </div>
    </div>
  );
} 