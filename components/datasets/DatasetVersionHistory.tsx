'use client';

import { formatDistanceToNow } from 'date-fns';
import { useDatasetVersionHistory } from '@/lib/hooks/useDatasetVersionManager';
import { DatasetVersionCard } from '@/components/datasets/DatasetVersionCard';
import { DatasetVersionCreateModal } from '@/components/datasets/DatasetVersionCreateModal';
import { Button } from '@/components/ui/button';
import { PlusIcon } from '@heroicons/react/24/outline';

interface DatasetVersionHistoryProps {
  datasetId: string;
  currentVersionId?: string;
  onCompare?: (versionId: string) => void;
  className?: string;
}

export function DatasetVersionHistory({ 
  datasetId, 
  currentVersionId, 
  onCompare,
  className = '' 
}: DatasetVersionHistoryProps) {
  const { data: versions, isLoading, error, refetch } = useDatasetVersionHistory(datasetId);

  if (error) {
    return (
      <div className={`bg-red-50 border border-red-200 rounded-md p-4 ${className}`}>
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-red-700" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3 flex-1">
            <h3 className="text-sm font-medium text-red-700">
              Failed to load version history
            </h3>
            <div className="mt-2 text-sm text-red-700">
              {error.message || 'An error occurred while loading version history.'}
            </div>
            <div className="mt-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() => refetch()}
                className="text-red-700 border-red-300 hover:bg-red-100"
              >
                Try Again
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className={`space-y-4 ${className}`}>
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold text-slate-900">Version History</h3>
          <div className="h-10 w-32 bg-slate-200 rounded animate-pulse"></div>
        </div>
        {[...Array(3)].map((_, i) => (
          <div key={i} className="bg-white border border-slate-200 rounded-lg p-4 animate-pulse">
            <div className="flex justify-between items-start mb-3">
              <div className="h-5 bg-slate-200 rounded w-24"></div>
              <div className="h-4 bg-slate-200 rounded w-16"></div>
            </div>
            <div className="h-4 bg-slate-200 rounded w-full mb-2"></div>
            <div className="h-4 bg-slate-200 rounded w-3/4"></div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold text-slate-900">Version History</h3>
          <p className="text-sm text-slate-500 mt-1">
            {versions?.length || 0} version{versions?.length !== 1 ? 's' : ''}
          </p>
        </div>
        <DatasetVersionCreateModal
          datasetId={datasetId}
          trigger={
            <Button className="h-10 px-4 bg-slate-900 hover:bg-slate-800 text-white rounded-md flex items-center gap-2">
              <PlusIcon className="h-4 w-4" />
              Create Version
            </Button>
          }
        />
      </div>

      {/* Version Timeline */}
      {versions && versions.length > 0 ? (
        <div className="space-y-4">
          {versions.map((version, index) => (
            <div key={version.id} className="relative">
              {/* Timeline connector */}
              {index < versions.length - 1 && (
                <div className="absolute left-6 top-16 bottom-0 w-px bg-slate-200"></div>
              )}
              
                             {/* Version card */}
               <DatasetVersionCard
                 version={version}
                 isCurrent={version.id === currentVersionId}
                 isLatest={index === 0}
                 datasetId={datasetId}
                 showComparison={!!onCompare}
                 onCompare={onCompare}
               />
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-8">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-slate-300 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
          </svg>
          <h4 className="text-lg font-medium text-slate-900 mb-2">
            No versions yet
          </h4>
          <p className="text-slate-500 mb-4">
            Create your first version to start tracking changes to this dataset.
          </p>
          <DatasetVersionCreateModal
            datasetId={datasetId}
            trigger={
              <Button className="h-10 px-4 bg-slate-900 hover:bg-slate-800 text-white rounded-md">
                Create First Version
              </Button>
            }
          />
        </div>
      )}
    </div>
  );
} 