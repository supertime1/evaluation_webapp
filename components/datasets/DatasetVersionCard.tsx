'use client';

import { useState } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { Button } from '@/components/ui/button';
import { VersionBadge } from '@/components/shared/VersionBadge';
import { DatasetVersionEntity } from '@/lib/models';
import { useDatasetVersionTestCases } from '@/lib/hooks/useDatasetVersionManager';

interface DatasetVersionCardProps {
  version: DatasetVersionEntity;
  isCurrent?: boolean;
  isLatest?: boolean;
  datasetId: string;
  showComparison?: boolean;
  onCompare?: (versionId: string) => void;
  className?: string;
}

export function DatasetVersionCard({
  version,
  isCurrent = false,
  isLatest = false,
  datasetId,
  showComparison = false,
  onCompare,
  className = ''
}: DatasetVersionCardProps) {
  const [showDetails, setShowDetails] = useState(false);
  const { data: testCases, isLoading: isLoadingTestCases } = useDatasetVersionTestCases(
    showDetails ? version.id : ''
  );

  const handleViewTestCases = () => {
    setShowDetails(!showDetails);
  };

  return (
    <div className={`bg-white border border-slate-200 rounded-lg shadow-sm ${className}`}>
      <div className="p-4">
        {/* Version Header */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3">
            {/* Timeline dot */}
            <div className={`w-3 h-3 rounded-full flex-shrink-0 ${
              isCurrent ? 'bg-green-500' : isLatest ? 'bg-blue-500' : 'bg-slate-300'
            }`}></div>
            
            <div>
              <div className="flex items-center gap-2 mb-1">
                <VersionBadge version={version.version_number} isCurrent={isCurrent} />
                {isLatest && !isCurrent && (
                  <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-blue-100 text-blue-800">
                    Latest
                  </span>
                )}
              </div>
              <p className="text-sm text-slate-500">
                Created {formatDistanceToNow(new Date(version.created_at), { addSuffix: true })}
              </p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            {showComparison && onCompare && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => onCompare(version.id)}
                className="h-8 px-3 text-xs"
              >
                Compare
              </Button>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={handleViewTestCases}
              className="h-8 px-3 text-xs"
            >
              {showDetails ? 'Hide Details' : 'View Details'}
            </Button>
          </div>
        </div>

        {/* Change Summary */}
        {version.change_summary && (
          <div className="mb-3">
            <p className="text-sm text-slate-700 leading-relaxed">
              {version.change_summary}
            </p>
          </div>
        )}

        {/* Test Case Count */}
        <div className="flex items-center gap-4 text-sm text-slate-500">
          <div className="flex items-center gap-1">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <span>{version.test_case_ids.length} test case{version.test_case_ids.length !== 1 ? 's' : ''}</span>
          </div>
          
          <div className="flex items-center gap-1">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3a4 4 0 118 0v4m-4 6v6m-4-6h8m-8 0a2 2 0 00-2 2v6a2 2 0 002 2h8a2 2 0 002-2v-6a2 2 0 00-2-2" />
            </svg>
            <span className="font-mono text-xs">{version.id.slice(-8)}</span>
          </div>
        </div>

        {/* Expanded Details */}
        {showDetails && (
          <div className="mt-4 pt-4 border-t border-slate-200">
            <h5 className="text-sm font-medium text-slate-900 mb-3">Test Cases</h5>
            
            {isLoadingTestCases ? (
              <div className="space-y-2">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="h-4 bg-slate-200 rounded animate-pulse"></div>
                ))}
              </div>
            ) : testCases && testCases.length > 0 ? (
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {testCases.map((testCase) => (
                  <div key={testCase.id} className="flex items-center justify-between p-2 bg-slate-50 rounded text-sm">
                                         <div className="flex-1 min-w-0">
                       <p className="font-medium text-slate-900 truncate">{testCase.name}</p>
                       <p className="text-slate-500 text-xs truncate">
                         {Array.isArray(testCase.input) 
                           ? `${testCase.input.length} input items`
                           : testCase.input || 'No input'
                         }
                       </p>
                     </div>
                    <span className="ml-2 px-2 py-1 bg-slate-200 text-slate-700 text-xs rounded font-mono">
                      {testCase.id.slice(-8)}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-slate-500 italic">No test cases found</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
} 