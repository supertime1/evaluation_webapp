'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { useDatasets, useGlobalDatasets } from '@/lib/hooks/useDatasetManager';
import { DatasetList } from '@/components/datasets/DatasetList';
import { DatasetCreateModal } from '@/components/datasets/DatasetCreateModal';
import { SearchAndFilter } from '@/components/shared/SearchAndFilter';
import { PlusIcon, ArrowPathIcon } from '@heroicons/react/24/outline';
import { useQueryClient } from '@tanstack/react-query';

export default function DatasetsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [showGlobal, setShowGlobal] = useState(false);
  const queryClient = useQueryClient();
  
  const { data: userDatasets, isLoading: isUserDatasetsLoading, error: userDatasetsError, refetch: refetchUserDatasets } = useDatasets();
  const { data: globalDatasets, isLoading: isGlobalDatasetsLoading, error: globalDatasetsError, refetch: refetchGlobalDatasets } = useGlobalDatasets();
  
  const isLoading = isUserDatasetsLoading || isGlobalDatasetsLoading;
  const error = userDatasetsError || globalDatasetsError;
  
  // Filter datasets based on search query
  const filteredUserDatasets = userDatasets?.filter(dataset =>
    dataset.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (dataset.description && dataset.description.toLowerCase().includes(searchQuery.toLowerCase()))
  ) || [];
  
  const filteredGlobalDatasets = globalDatasets?.filter(dataset =>
    dataset.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (dataset.description && dataset.description.toLowerCase().includes(searchQuery.toLowerCase()))
  ) || [];

  // Handle refresh functionality
  const handleRefresh = async () => {
    await Promise.all([
      refetchUserDatasets(),
      refetchGlobalDatasets()
    ]);
  };

  // Handle errors with retry functionality
  if (error && !isLoading) {
    return (
      <div className="min-h-screen bg-white p-6">
        <div className="max-w-7xl mx-auto">
          <div className="bg-red-50 border border-red-200 rounded-md p-4">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-700" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3 flex-1">
                <h3 className="text-sm font-medium text-red-700">
                  Failed to load datasets
                </h3>
                <div className="mt-2 text-sm text-red-700">
                  {error.message || 'An error occurred while loading datasets. Please try again.'}
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

  return (
    <div className="min-h-screen bg-white p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start gap-6">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold text-slate-800">Datasets</h1>
              {isLoading && (
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-slate-900"></div>
              )}
            </div>
            <p className="text-sm text-slate-500 mt-2">
              Manage your test case collections and versions
            </p>
          </div>
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={handleRefresh}
              disabled={isLoading}
              className="h-11 px-4 flex items-center gap-2"
            >
              <ArrowPathIcon className={`h-5 w-5 ${isLoading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            <DatasetCreateModal
              trigger={
                <Button className="h-11 px-4 bg-slate-900 hover:bg-slate-800 text-white rounded-md flex items-center gap-2">
                  <PlusIcon className="h-5 w-5" />
                  Create Dataset
                </Button>
              }
            />
          </div>
        </div>

        {/* Search and Filters */}
        <SearchAndFilter
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          searchPlaceholder="Search datasets..."
          filters={[
            { label: 'My Datasets', value: 'my', active: !showGlobal },
            { label: 'Global Datasets', value: 'global', active: showGlobal }
          ]}
          onFilterChange={(value) => setShowGlobal(value === 'global')}
        />

        {/* Datasets List */}
        <DatasetList
          datasets={showGlobal ? filteredGlobalDatasets : filteredUserDatasets}
          isLoading={isLoading}
          emptyStateTitle={searchQuery ? 'No datasets found' : `No ${showGlobal ? 'global ' : ''}datasets yet`}
          emptyStateDescription={
            searchQuery 
              ? 'Try adjusting your search terms'
              : `${showGlobal ? 'No global datasets are available' : 'Create your first dataset to get started'}`
          }
          showCreateButton={!showGlobal && !searchQuery}
        />
      </div>
    </div>
  );
} 