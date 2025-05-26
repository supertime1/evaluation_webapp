'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { useDatasets, useGlobalDatasets } from '@/lib/hooks/useDatasetManager';
import { formatDistanceToNow } from 'date-fns';
import { MagnifyingGlassIcon, PlusIcon } from '@heroicons/react/24/outline';

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
          <Link href="/dashboard/datasets/new">
            <Button className="h-11 px-4 bg-slate-900 hover:bg-slate-800 text-white rounded-md flex items-center gap-2">
              <PlusIcon className="h-5 w-5" />
              Create Dataset
            </Button>
          </Link>
        </div>

        {/* Search and Filters */}
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400" />
            <input
              type="text"
              placeholder="Search datasets..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-slate-500 focus:border-transparent"
            />
          </div>
          <div className="flex gap-2">
            <Button
              variant={!showGlobal ? "default" : "outline"}
              onClick={() => setShowGlobal(false)}
              className="h-10"
            >
              My Datasets
            </Button>
            <Button
              variant={showGlobal ? "default" : "outline"}
              onClick={() => setShowGlobal(true)}
              className="h-10"
            >
              Global Datasets
            </Button>
          </div>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-white border border-slate-200 rounded-lg p-6 animate-pulse">
                <div className="h-6 bg-slate-200 rounded mb-3"></div>
                <div className="h-4 bg-slate-200 rounded mb-2"></div>
                <div className="h-4 bg-slate-200 rounded w-3/4"></div>
              </div>
            ))}
          </div>
        )}

        {/* Datasets Grid */}
        {!isLoading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {(showGlobal ? filteredGlobalDatasets : filteredUserDatasets).map(dataset => (
              <Link
                key={dataset.id}
                href={`/dashboard/datasets/${dataset.id}`}
                className="block bg-white border border-slate-200 rounded-lg p-6 hover:shadow-lg transition-shadow duration-300"
              >
                <div className="flex items-start justify-between mb-3">
                  <h3 className="text-lg font-semibold text-slate-900 truncate">
                    {dataset.name}
                  </h3>
                  {dataset.is_global && (
                    <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-blue-100 text-blue-800">
                      Global
                    </span>
                  )}
                </div>
                
                {dataset.description && (
                  <p className="text-sm text-slate-600 mb-3 line-clamp-2">
                    {dataset.description}
                  </p>
                )}
                
                <div className="flex items-center text-xs text-slate-500">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Created {formatDistanceToNow(new Date(dataset.created_at), { addSuffix: true })}
                </div>
              </Link>
            ))}
          </div>
        )}

        {/* Empty State */}
        {!isLoading && (showGlobal ? filteredGlobalDatasets : filteredUserDatasets).length === 0 && (
          <div className="text-center py-12">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-slate-300 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" />
            </svg>
            <h3 className="text-lg font-medium text-slate-900 mb-2">
              {searchQuery ? 'No datasets found' : `No ${showGlobal ? 'global ' : ''}datasets yet`}
            </h3>
            <p className="text-slate-500 mb-6">
              {searchQuery 
                ? 'Try adjusting your search terms'
                : `${showGlobal ? 'No global datasets are available' : 'Create your first dataset to get started'}`
              }
            </p>
            {!showGlobal && !searchQuery && (
              <Link href="/dashboard/datasets/new">
                <Button className="h-11 px-6 bg-slate-900 hover:bg-slate-800 text-white rounded-md">
                  Create Your First Dataset
                </Button>
              </Link>
            )}
          </div>
        )}
      </div>
    </div>
  );
} 