'use client';

import { useState } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Dataset } from '@/lib/schemas/dataset';
import { GlobalDatasetBadge } from './GlobalDatasetBadge';
import { DatasetIdCopyButton } from './DatasetIdCopyButton';
import { DatasetCreateModal } from './DatasetCreateModal';
import { useDeleteDataset } from '@/lib/hooks/useDatasetManager';
import { useRouter } from 'next/navigation';

interface DatasetDetailHeaderProps {
  dataset: Dataset;
  className?: string;
}

export function DatasetDetailHeader({ dataset, className = '' }: DatasetDetailHeaderProps) {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const deleteMutation = useDeleteDataset();
  const router = useRouter();

  const handleDelete = async () => {
    try {
      await deleteMutation.mutateAsync(dataset.id);
      router.push('/dashboard/datasets');
    } catch (error) {
      console.error('Failed to delete dataset:', error);
    }
  };

  return (
    <div className={`bg-white border border-slate-200 rounded-lg p-6 ${className}`}>
      <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
        {/* Dataset Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start gap-3 mb-3">
            <h1 className="text-2xl font-bold text-slate-800 break-words">
              {dataset.name}
            </h1>
            <GlobalDatasetBadge isGlobal={dataset.is_global} />
          </div>
          
          {dataset.description && (
            <p className="text-sm text-slate-600 mb-4 leading-relaxed">
              {dataset.description}
            </p>
          )}
          
          <div className="space-y-2">
            <div className="flex items-center text-sm text-slate-500">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Created {formatDistanceToNow(new Date(dataset.created_at), { addSuffix: true })}
            </div>
            
            <div className="flex items-center text-sm text-slate-500">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Last updated {formatDistanceToNow(new Date(dataset.updated_at), { addSuffix: true })}
            </div>
            
            {dataset.current_version_id && (
              <div className="flex items-center text-sm text-slate-500">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                </svg>
                Current version: {dataset.current_version_id.slice(-8)}
              </div>
            )}
          </div>
          
          <div className="mt-4">
            <DatasetIdCopyButton datasetId={dataset.id} />
          </div>
        </div>
        
        {/* Actions */}
        <div className="flex flex-col sm:flex-row lg:flex-col gap-3 lg:min-w-[200px]">
          <DatasetCreateModal
            dataset={dataset}
            trigger={
              <Button variant="outline" className="h-11 px-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                Edit Dataset
              </Button>
            }
          />
          
          <Button
            variant="outline"
            onClick={() => router.push(`/dashboard/datasets/${dataset.id}/test-cases`)}
            className="h-11 px-4 text-blue-600 border-blue-200 hover:bg-blue-50"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Manage Test Cases
          </Button>
          
          <Button
            variant="outline"
            onClick={() => router.push(`/dashboard/datasets/${dataset.id}/versions`)}
            className="h-11 px-4 text-green-600 border-green-200 hover:bg-green-50"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
            </svg>
            View Versions
          </Button>
          
          {!showDeleteConfirm ? (
            <Button
              variant="outline"
              onClick={() => setShowDeleteConfirm(true)}
              className="h-11 px-4 text-red-600 border-red-200 hover:bg-red-50"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
              Delete
            </Button>
          ) : (
            <div className="space-y-2">
              <p className="text-sm text-red-600 font-medium">
                Are you sure?
              </p>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setShowDeleteConfirm(false)}
                  className="h-9 px-3 text-xs"
                >
                  Cancel
                </Button>
                <Button
                  size="sm"
                  onClick={handleDelete}
                  disabled={deleteMutation.isPending}
                  className="h-9 px-3 text-xs bg-red-600 hover:bg-red-700"
                >
                  {deleteMutation.isPending ? 'Deleting...' : 'Delete'}
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 