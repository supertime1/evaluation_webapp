'use client';

import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';
import { Dataset } from '@/lib/schemas/dataset';
import { GlobalDatasetBadge } from '@/components/datasets/GlobalDatasetBadge';
import { DatasetIdCopyButton } from '@/components/datasets/DatasetIdCopyButton';

interface DatasetCardProps {
  dataset: Dataset;
  showActions?: boolean;
  className?: string;
}

export function DatasetCard({ dataset, showActions = false, className = '' }: DatasetCardProps) {
  return (
    <div className={`bg-white border border-slate-200 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-300 ${className}`}>
      <Link href={`/dashboard/datasets/${dataset.id}`} className="block p-6">
        <div className="flex items-start justify-between mb-3">
          <h3 className="text-lg font-semibold text-slate-900 truncate pr-2">
            {dataset.name}
          </h3>
          <GlobalDatasetBadge isGlobal={dataset.is_global} />
        </div>
        
        {dataset.description && (
          <p className="text-sm text-slate-600 mb-4 line-clamp-2">
            {dataset.description}
          </p>
        )}
        
        <div className="space-y-2">
          <div className="flex items-center text-xs text-slate-500">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Created {formatDistanceToNow(new Date(dataset.created_at), { addSuffix: true })}
          </div>
          
          {dataset.current_version_id && (
            <div className="flex items-center text-xs text-slate-500">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
              </svg>
              Current version: {dataset.current_version_id.slice(-8)}
            </div>
          )}
        </div>
      </Link>
      
      {showActions && (
        <div className="border-t border-slate-200 px-6 py-3 bg-slate-50">
          <DatasetIdCopyButton datasetId={dataset.id} />
        </div>
      )}
    </div>
  );
} 