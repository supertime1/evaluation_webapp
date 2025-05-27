'use client';

import { useState } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { useCompareDatasetVersions } from '@/lib/hooks/useDatasetVersionManager';
import { VersionBadge } from '@/components/shared/VersionBadge';
import { Button } from '@/components/ui/button';
import { DatasetVersionEntity } from '@/lib/models';

interface DatasetVersionComparisonProps {
  fromVersionId: string;
  toVersionId: string;
  fromVersion?: DatasetVersionEntity;
  toVersion?: DatasetVersionEntity;
  className?: string;
}

export function DatasetVersionComparison({
  fromVersionId,
  toVersionId,
  fromVersion,
  toVersion,
  className = ''
}: DatasetVersionComparisonProps) {
  const [showDetails, setShowDetails] = useState(false);
  const { data: comparison, isLoading, error } = useCompareDatasetVersions(fromVersionId, toVersionId);

  if (error) {
    return (
      <div className={`bg-red-50 border border-red-200 rounded-md p-4 ${className}`}>
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-red-700" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-red-700">
              Failed to compare versions
            </h3>
            <div className="mt-2 text-sm text-red-700">
              {error.message || 'An error occurred while comparing versions.'}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className={`space-y-4 ${className}`}>
        <div className="h-6 bg-slate-200 rounded animate-pulse"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white border border-slate-200 rounded-lg p-4 animate-pulse">
            <div className="h-5 bg-slate-200 rounded mb-3"></div>
            <div className="h-4 bg-slate-200 rounded mb-2"></div>
            <div className="h-4 bg-slate-200 rounded w-3/4"></div>
          </div>
          <div className="bg-white border border-slate-200 rounded-lg p-4 animate-pulse">
            <div className="h-5 bg-slate-200 rounded mb-3"></div>
            <div className="h-4 bg-slate-200 rounded mb-2"></div>
            <div className="h-4 bg-slate-200 rounded w-3/4"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!comparison) {
    return (
      <div className={`text-center py-8 text-slate-500 ${className}`}>
        <p>No comparison data available</p>
      </div>
    );
  }

  const { from_version, to_version, added_test_cases, removed_test_cases, unchanged_test_cases } = comparison;

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Comparison Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-slate-900">Version Comparison</h3>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowDetails(!showDetails)}
          className="h-8 px-3 text-xs"
        >
          {showDetails ? 'Hide Details' : 'Show Details'}
        </Button>
      </div>

      {/* Version Headers */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* From Version */}
        <div className="bg-white border border-slate-200 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <VersionBadge version={from_version.version_number} />
            <span className="text-sm text-slate-500">From</span>
          </div>
          <p className="text-sm text-slate-500 mb-2">
            Created {formatDistanceToNow(new Date(from_version.created_at), { addSuffix: true })}
          </p>
          {from_version.change_summary && (
            <p className="text-sm text-slate-700">{from_version.change_summary}</p>
          )}
          <div className="mt-3 text-sm text-slate-500">
            {from_version.test_case_ids.length} test case{from_version.test_case_ids.length !== 1 ? 's' : ''}
          </div>
        </div>

        {/* To Version */}
        <div className="bg-white border border-slate-200 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <VersionBadge version={to_version.version_number} />
            <span className="text-sm text-slate-500">To</span>
          </div>
          <p className="text-sm text-slate-500 mb-2">
            Created {formatDistanceToNow(new Date(to_version.created_at), { addSuffix: true })}
          </p>
          {to_version.change_summary && (
            <p className="text-sm text-slate-700">{to_version.change_summary}</p>
          )}
          <div className="mt-3 text-sm text-slate-500">
            {to_version.test_case_ids.length} test case{to_version.test_case_ids.length !== 1 ? 's' : ''}
          </div>
        </div>
      </div>

      {/* Changes Summary */}
      <div className="bg-white border border-slate-200 rounded-lg p-4">
        <h4 className="text-base font-medium text-slate-900 mb-4">Changes Summary</h4>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Added */}
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600 mb-1">
              +{added_test_cases.length}
            </div>
            <div className="text-sm text-slate-600">
              Test case{added_test_cases.length !== 1 ? 's' : ''} added
            </div>
          </div>

          {/* Removed */}
          <div className="text-center">
            <div className="text-2xl font-bold text-red-600 mb-1">
              -{removed_test_cases.length}
            </div>
            <div className="text-sm text-slate-600">
              Test case{removed_test_cases.length !== 1 ? 's' : ''} removed
            </div>
          </div>

          {/* Unchanged */}
          <div className="text-center">
            <div className="text-2xl font-bold text-slate-600 mb-1">
              {unchanged_test_cases.length}
            </div>
            <div className="text-sm text-slate-600">
              Test case{unchanged_test_cases.length !== 1 ? 's' : ''} unchanged
            </div>
          </div>
        </div>
      </div>

      {/* Detailed Changes */}
      {showDetails && (
        <div className="space-y-4">
          {/* Added Test Cases */}
          {added_test_cases.length > 0 && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <h5 className="text-sm font-medium text-green-800 mb-3">
                Added Test Cases ({added_test_cases.length})
              </h5>
              <div className="space-y-2">
                {added_test_cases.map((testCaseId) => (
                  <div key={testCaseId} className="flex items-center gap-2 text-sm">
                    <div className="w-2 h-2 bg-green-500 rounded-full flex-shrink-0"></div>
                    <span className="font-mono text-green-700">{testCaseId.slice(-8)}</span>
                    <span className="text-green-600">Added</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Removed Test Cases */}
          {removed_test_cases.length > 0 && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <h5 className="text-sm font-medium text-red-800 mb-3">
                Removed Test Cases ({removed_test_cases.length})
              </h5>
              <div className="space-y-2">
                {removed_test_cases.map((testCaseId) => (
                  <div key={testCaseId} className="flex items-center gap-2 text-sm">
                    <div className="w-2 h-2 bg-red-500 rounded-full flex-shrink-0"></div>
                    <span className="font-mono text-red-700">{testCaseId.slice(-8)}</span>
                    <span className="text-red-600">Removed</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Unchanged Test Cases */}
          {unchanged_test_cases.length > 0 && (
            <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
              <h5 className="text-sm font-medium text-slate-800 mb-3">
                Unchanged Test Cases ({unchanged_test_cases.length})
              </h5>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {unchanged_test_cases.slice(0, 20).map((testCaseId) => (
                  <div key={testCaseId} className="flex items-center gap-2 text-sm">
                    <div className="w-2 h-2 bg-slate-400 rounded-full flex-shrink-0"></div>
                    <span className="font-mono text-slate-600">{testCaseId.slice(-8)}</span>
                  </div>
                ))}
                {unchanged_test_cases.length > 20 && (
                  <div className="text-sm text-slate-500 col-span-full">
                    ... and {unchanged_test_cases.length - 20} more
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
} 