'use client';

import { Dataset } from '@/lib/schemas/dataset';
import { DatasetCard } from './DatasetCard';
import { DatasetCreateModal } from './DatasetCreateModal';
import { Button } from '@/components/ui/button';

interface DatasetListProps {
  datasets: Dataset[];
  isLoading?: boolean;
  showActions?: boolean;
  emptyStateTitle?: string;
  emptyStateDescription?: string;
  showCreateButton?: boolean;
  className?: string;
}

export function DatasetList({
  datasets,
  isLoading = false,
  showActions = false,
  emptyStateTitle = 'No datasets yet',
  emptyStateDescription = 'Create your first dataset to get started',
  showCreateButton = true,
  className = ''
}: DatasetListProps) {
  // Loading State
  if (isLoading) {
    return (
      <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 ${className}`}>
        {[...Array(6)].map((_, i) => (
          <div key={i} className="bg-white border border-slate-200 rounded-lg p-6 animate-pulse">
            <div className="h-6 bg-slate-200 rounded mb-3"></div>
            <div className="h-4 bg-slate-200 rounded mb-2"></div>
            <div className="h-4 bg-slate-200 rounded w-3/4 mb-4"></div>
            <div className="h-3 bg-slate-200 rounded w-1/2"></div>
          </div>
        ))}
      </div>
    );
  }

  // Empty State
  if (datasets.length === 0) {
    return (
      <div className={`text-center py-12 ${className}`}>
        <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-slate-300 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" />
        </svg>
        <h3 className="text-lg font-medium text-slate-900 mb-2">
          {emptyStateTitle}
        </h3>
        <p className="text-slate-500 mb-6 max-w-md mx-auto">
          {emptyStateDescription}
        </p>
        {showCreateButton && (
          <DatasetCreateModal
            trigger={
              <Button className="h-11 px-6 bg-slate-900 hover:bg-slate-800 text-white rounded-md">
                Create Your First Dataset
              </Button>
            }
          />
        )}
      </div>
    );
  }

  // Datasets Grid
  return (
    <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 ${className}`}>
      {datasets.map(dataset => (
        <DatasetCard
          key={dataset.id}
          dataset={dataset}
          showActions={showActions}
        />
      ))}
    </div>
  );
} 