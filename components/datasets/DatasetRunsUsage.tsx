'use client';

import React from 'react';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useDatasetVersionRuns } from '@/lib/hooks/useRunManager';
import { useExperiment } from '@/lib/hooks/useExperimentManager';
import { formatDistanceToNow } from 'date-fns';
import { ArrowRightIcon, PlayIcon, CheckCircleIcon, XCircleIcon, ClockIcon } from '@heroicons/react/24/outline';

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
        <CardTitle className="flex items-center gap-2">
          <PlayIcon className="h-5 w-5" />
          Runs Using This Dataset
          {runs.length > 0 && <span className="text-sm font-normal text-slate-500">({runs.length})</span>}
        </CardTitle>
        <CardDescription>
          Experiments that have used this dataset for evaluation
        </CardDescription>
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
          <div className="space-y-3">
            {runs.map((run) => (
              <RunCard key={run.id} run={run} getStatusIcon={getStatusIcon} />
            ))}
          </div>
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
  const { data: experiment } = useExperiment(run.experiment_id);

  return (
    <div className="flex items-center justify-between p-4 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors">
      <div className="flex items-center space-x-3">
        {getStatusIcon(run.status)}
        <div>
          <div className="font-medium text-slate-900">
            {experiment?.name || 'Loading...'}
          </div>
          <div className="text-sm text-slate-500">
            Run {run.id.slice(-8)} • {formatDistanceToNow(new Date(run.created_at), { addSuffix: true })}
          </div>
        </div>
      </div>
      <Link href={`/dashboard/experiments/${run.experiment_id}/runs/${run.id}`}>
        <Button variant="outline" size="sm">
          View Details
          <ArrowRightIcon className="h-4 w-4 ml-2" />
        </Button>
      </Link>
    </div>
  );
} 