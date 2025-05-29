'use client';

import { formatDistanceToNow } from 'date-fns';
import { Button } from '@/components/ui/button';
import { RunEntity, ExperimentEntity } from '@/lib/models';
import { RunIdCopyButton } from '@/components/runs/RunIdCopyButton';
import { ClockIcon, XCircleIcon, CheckCircleIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';

interface RunDetailHeaderProps {
  run: RunEntity;
  experiment: ExperimentEntity;
  totalTests?: number;
  passingTests?: number;
  className?: string;
}

export function RunDetailHeader({ 
  run, 
  experiment, 
  totalTests = 0, 
  passingTests = 0, 
  className = '' 
}: RunDetailHeaderProps) {
  const passRate = totalTests > 0 ? (passingTests / totalTests) * 100 : 0;
  const failingTests = totalTests - passingTests;

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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'running':
        return 'bg-blue-100 text-blue-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-slate-100 text-slate-600';
    }
  };

  return (
    <div className={`bg-white border border-slate-200 rounded-lg p-6 ${className}`}>
      <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
        {/* Run Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start gap-3 mb-3">
            <h1 className="text-2xl font-bold text-slate-800 break-words">
              Run Details
            </h1>
            <span className={`px-2 py-1 text-xs font-medium rounded flex items-center gap-1 ${getStatusColor(run.status)}`}>
              {getStatusIcon(run.status)}
              {run.status.charAt(0).toUpperCase() + run.status.slice(1)}
            </span>
          </div>
          
          <div className="mb-4">
            <div className="flex items-center text-sm text-slate-600 mb-2">
              <span>Experiment: </span>
              <Link 
                href={`/dashboard/experiments/${run.experiment_id}`}
                className="ml-1 text-blue-600 hover:text-blue-800 font-medium"
              >
                {experiment.name}
              </Link>
            </div>
            
            {run.git_commit && (
              <div className="flex items-center text-sm text-slate-600 mb-2">
                <span>Git Commit: </span>
                <code className="ml-1 font-mono text-xs bg-slate-100 px-1 py-0.5 rounded">
                  {run.git_commit.substring(0, 8)}
                </code>
              </div>
            )}
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center text-sm text-slate-500">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Created {formatDistanceToNow(new Date(run.created_at), { addSuffix: true })}
            </div>
            
            {run.started_at && (
              <div className="flex items-center text-sm text-slate-500">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1m4 0h1m-6 4h1m4 0h1m6-10V7a3 3 0 11-6 0V4a2 2 0 012-2h2a2 2 0 012 2v3.001z" />
                </svg>
                Started {formatDistanceToNow(new Date(run.started_at), { addSuffix: true })}
              </div>
            )}
            
            {run.finished_at && (
              <div className="flex items-center text-sm text-slate-500">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Finished {formatDistanceToNow(new Date(run.finished_at), { addSuffix: true })}
              </div>
            )}
          </div>
          
          <div className="mt-4">
            <RunIdCopyButton runId={run.id} />
          </div>
        </div>
        
        {/* Test Results Summary & Actions */}
        <div className="flex flex-col sm:flex-row lg:flex-col gap-3 lg:min-w-[200px]">
          {/* Test Results Summary */}
          {totalTests > 0 && (
            <div className="bg-slate-50 rounded-lg p-4 mb-3">
              <div className="text-sm text-slate-600 mb-2">Test Results</div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Total:</span>
                  <span className="font-medium">{totalTests}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Passing:</span>
                  <span className="font-medium text-green-600">{passingTests}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Failing:</span>
                  <span className="font-medium text-red-600">{failingTests}</span>
                </div>
                <div className="flex justify-between text-sm border-t border-slate-200 pt-2">
                  <span>Pass Rate:</span>
                  <span className="font-medium">{passRate.toFixed(1)}%</span>
                </div>
              </div>
            </div>
          )}
          
          {/* Action Buttons */}
          <Button
            variant="outline"
            className="h-11 px-4"
            onClick={() => window.location.reload()}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Sync Results
          </Button>
          
          <Button
            variant="outline"
            onClick={() => window.open(`/dashboard/experiments/${run.experiment_id}/runs/${run.id}/export`, '_blank')}
            className="h-11 px-4"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Export Results
          </Button>
          
        </div>
      </div>
    </div>
  );
} 