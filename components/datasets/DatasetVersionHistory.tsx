'use client';

import { formatDistanceToNow } from 'date-fns';
import { useDatasetVersionHistory } from '@/lib/hooks/useDatasetVersionManager';
import { DatasetVersionCreateModal, DatasetVersionDetailModal, DatasetVersionIdCopyButton } from '@/components/datasets';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PlusIcon, TagIcon, CalendarIcon, DocumentTextIcon, ArrowRightIcon } from '@heroicons/react/24/outline';

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

  if (isLoading) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TagIcon className="h-5 w-5" />
            Version History
          </CardTitle>
          <CardDescription>
            Track changes to your dataset over time
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-20 bg-slate-200 rounded animate-pulse"></div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TagIcon className="h-5 w-5" />
            Version History
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <p className="text-red-600 mb-4">Failed to load version history</p>
            <Button variant="outline" onClick={() => refetch()}>
              Try Again
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TagIcon className="h-5 w-5" />
          Version History
          {versions && versions.length > 0 && <span className="text-sm font-normal text-slate-500">({versions.length})</span>}
        </CardTitle>
        <CardDescription>
          Create new versions to add or remove test cases
        </CardDescription>
      </CardHeader>

      <CardContent>
        {!versions || versions.length === 0 ? (
          <div className="text-center py-8 text-slate-500">
            <TagIcon className="h-12 w-12 mx-auto mb-4 text-slate-300" />
            <p className="text-lg font-medium mb-2">No versions yet</p>
            <p className="text-sm mb-6">
              Create your first version to start managing test cases for this dataset.
            </p>
            <DatasetVersionCreateModal
              datasetId={datasetId}
              trigger={
                <Button className="h-10 px-4 bg-slate-900 hover:bg-slate-800 text-white rounded-md">
                  Create First Version
                </Button>
              }
              onSuccess={refetch}
            />
          </div>
        ) : (
          <div className="space-y-3">
            {versions.map((version, index) => (
              <VersionCard 
                key={version.id} 
                version={version} 
                isCurrent={version.id === currentVersionId}
                isLatest={index === 0}
                datasetId={datasetId}
                onCompare={onCompare}
              />
            ))}
            
            {/* Create Version Button */}
            <div className="flex justify-center pt-4">
              <DatasetVersionCreateModal
                datasetId={datasetId}
                trigger={
                  <Button className="h-10 px-4 bg-slate-900 hover:bg-slate-800 text-white rounded-md flex items-center gap-2">
                    <PlusIcon className="h-4 w-4" />
                    Create New Version
                  </Button>
                }
                onSuccess={refetch}
              />
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

interface VersionCardProps {
  version: any;
  isCurrent: boolean;
  isLatest: boolean;
  datasetId: string;
  onCompare?: (versionId: string) => void;
}

function VersionCard({ version, isCurrent, isLatest, datasetId, onCompare }: VersionCardProps) {
  return (
    <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          {/* Timeline dot */}
          <div className={`w-3 h-3 rounded-full flex-shrink-0 ${
            isCurrent ? 'bg-green-500' : isLatest ? 'bg-blue-500' : 'bg-slate-300'
          }`}></div>
          
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${
                isCurrent 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-slate-100 text-slate-800'
              }`}>
                Version {version.version_number}
                {isCurrent && ' (Current)'}
              </span>
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
          {onCompare && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => onCompare(version.id)}
              className="h-8 px-3 text-xs"
            >
              Compare
            </Button>
          )}
          <DatasetVersionIdCopyButton versionId={version.id} />
          <DatasetVersionDetailModal
            version={version}
            isCurrent={isCurrent}
            isLatest={isLatest}
            trigger={
              <Button
                variant="outline"
                size="sm"
                className="h-8 px-3 text-xs"
              >
                View Details
              </Button>
            }
          />
        </div>
      </div>

      {/* Change Summary */}
      {version.change_summary && (
        <div className="mt-3 ml-6">
          <p className="text-sm text-slate-700 leading-relaxed">
            {version.change_summary}
          </p>
        </div>
      )}

      {/* Test Case Count and Version ID */}
      <div className="flex items-center gap-4 text-sm text-slate-500 mt-3 ml-6">
        <div className="flex items-center gap-1">
          <DocumentTextIcon className="h-4 w-4" />
          <span>{version.test_case_ids.length} test case{version.test_case_ids.length !== 1 ? 's' : ''}</span>
        </div>
        
        <div className="flex items-center gap-1">
          <TagIcon className="h-4 w-4" />
          <span className="font-mono text-xs">{version.id.slice(-8)}</span>
        </div>
      </div>
    </div>
  );
} 