'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { useDatasets, useGlobalDatasets } from '@/lib/hooks/useDatasetManager';
import { DatasetList } from '@/components/datasets/DatasetList';
import { DatasetCreateModal } from '@/components/datasets/DatasetCreateModal';
import { SearchAndFilter } from '@/components/shared/SearchAndFilter';
import { PlusIcon } from '@heroicons/react/24/outline';

export default function DatasetsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [showGlobal, setShowGlobal] = useState(false);
  
  const { data: userDatasets, isLoading: isUserDatasetsLoading, error: userDatasetsError } = useDatasets();
  const { data: globalDatasets, isLoading: isGlobalDatasetsLoading, error: globalDatasetsError } = useGlobalDatasets();
  
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

  if (error) {
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
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-700">
                  Failed to load datasets
                </h3>
                <div className="mt-2 text-sm text-red-700">
                  {error.message || 'An error occurred while loading datasets. Please try again.'}
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
            <h1 className="text-3xl font-bold text-slate-800">Datasets</h1>
            <p className="text-sm text-slate-500 mt-2">
              Manage your test case collections and versions
            </p>
          </div>
          <DatasetCreateModal
            trigger={
              <Button className="h-11 px-4 bg-slate-900 hover:bg-slate-800 text-white rounded-md flex items-center gap-2">
                <PlusIcon className="h-5 w-5" />
                Create Dataset
              </Button>
            }
          />
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