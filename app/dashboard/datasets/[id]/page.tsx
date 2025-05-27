'use client';

import { useParams } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';
import { useDataset } from '@/lib/hooks/useDatasetManager';
import { DatasetDetailHeader, DatasetVersionHistory } from '@/components/datasets';

export default function DatasetDetailPage() {
  const params = useParams();
  const datasetId = params.id as string;
  
  
  const { data: dataset, isLoading, error } = useDataset(datasetId);

  if (error) {
    return (
      <div className="min-h-screen bg-white p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center gap-4 mb-8">
            <Link href="/dashboard/datasets">
              <Button variant="outline" size="sm" className="flex items-center gap-2">
                <ArrowLeftIcon className="h-4 w-4" />
                Back to Datasets
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
                  Failed to load dataset
                </h3>
                <div className="mt-2 text-sm text-red-700">
                  {error.message || 'An error occurred while loading the dataset.'}
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

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white p-6">
        <div className="max-w-7xl mx-auto space-y-8">
          <div className="flex items-center gap-4">
            <Link href="/dashboard/datasets">
              <Button variant="outline" size="sm" className="flex items-center gap-2">
                <ArrowLeftIcon className="h-4 w-4" />
                Back to Datasets
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
            
            <div className="space-y-4">
              <div className="h-6 bg-slate-200 rounded w-48"></div>
              {[...Array(3)].map((_, i) => (
                <div key={i} className="bg-white border border-slate-200 rounded-lg p-4">
                  <div className="h-5 bg-slate-200 rounded w-24 mb-3"></div>
                  <div className="h-4 bg-slate-200 rounded w-full mb-2"></div>
                  <div className="h-4 bg-slate-200 rounded w-3/4"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!dataset) {
    return (
      <div className="min-h-screen bg-white p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center gap-4 mb-8">
            <Link href="/dashboard/datasets">
              <Button variant="outline" size="sm" className="flex items-center gap-2">
                <ArrowLeftIcon className="h-4 w-4" />
                Back to Datasets
              </Button>
            </Link>
          </div>
          
          <div className="text-center py-12">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-slate-300 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" />
            </svg>
            <h1 className="text-2xl font-bold text-slate-900 mb-4">Dataset not found</h1>
            <p className="text-slate-500 mb-6">
              The dataset you're looking for doesn't exist or you don't have permission to view it.
            </p>
            <Link href="/dashboard/datasets">
              <Button variant="outline">Back to Datasets</Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Navigation */}
        <div className="flex items-center gap-4">
          <Link href="/dashboard/datasets">
            <Button variant="outline" size="sm" className="flex items-center gap-2">
              <ArrowLeftIcon className="h-4 w-4" />
              Back to Datasets
            </Button>
          </Link>
        </div>

        {/* Dataset Header */}
        <DatasetDetailHeader dataset={dataset} />

        {/* Version History */}
        <DatasetVersionHistory
          datasetId={datasetId}
          currentVersionId={dataset.current_version_id}
        />
      </div>
    </div>
  );
} 