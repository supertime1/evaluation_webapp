'use client';

import { formatDistanceToNow } from 'date-fns';
import { useDatasetVersionHistory } from '@/lib/hooks/useDatasetVersionManager';
import { DatasetVersionCreateModal } from '@/components/datasets/DatasetVersionCreateModal';
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
            Track changes and evolution of this dataset
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="flex items-center justify-between p-4 border border-slate-200 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="h-4 w-4 bg-slate-200 rounded"></div>
                    <div className="space-y-2">
                      <div className="h-4 bg-slate-200 rounded w-32"></div>
                      <div className="h-3 bg-slate-200 rounded w-24"></div>
                    </div>
                  </div>
                  <div className="h-8 bg-slate-200 rounded w-20"></div>
                </div>
              </div>
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
          <CardDescription>
            Track changes and evolution of this dataset
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-sm">
            Error loading version history: {error.message}
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
          {versions && versions.length > 0 && (
            <span className="text-sm font-normal text-slate-500">({versions.length})</span>
          )}
        </CardTitle>
        <CardDescription>
          Track changes and evolution of this dataset
        </CardDescription>
      </CardHeader>
      <CardContent>
        {!versions || versions.length === 0 ? (
          <div className="text-center py-8 text-slate-500">
            <TagIcon className="h-12 w-12 mx-auto mb-4 text-slate-300" />
            <p className="text-lg font-medium mb-2">No versions yet</p>
            <p className="text-sm mb-4">
              Create your first version to start tracking changes to this dataset.
            </p>
            <DatasetVersionCreateModal
              datasetId={datasetId}
              trigger={
                <Button className="h-10 px-4 bg-slate-900 hover:bg-slate-800 text-white rounded-md">
                  Create First Version
                </Button>
              }
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
            <div className="pt-3 border-t border-slate-200">
              <DatasetVersionCreateModal
                datasetId={datasetId}
                trigger={
                  <Button variant="outline" className="w-full flex items-center gap-2">
                    <PlusIcon className="h-4 w-4" />
                    Create New Version
                  </Button>
                }
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
    <div className="flex items-center justify-between p-4 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors">
      <div className="flex items-center space-x-3">
        <TagIcon className="h-4 w-4 text-slate-400" />
        <div>
          <div className="flex items-center gap-2">
            <span className="font-medium text-slate-900">
              Version {version.version_number}
            </span>
            {isCurrent && (
              <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded">
                Current
              </span>
            )}
            {isLatest && (
              <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded">
                Latest
              </span>
            )}
          </div>
          <div className="flex items-center gap-4 text-sm text-slate-500 mt-1">
            <span className="flex items-center gap-1">
              <DocumentTextIcon className="h-3 w-3" />
              {version.test_case_ids?.length || 0} test cases
            </span>
            <span className="flex items-center gap-1">
              <CalendarIcon className="h-3 w-3" />
              {formatDistanceToNow(new Date(version.created_at), { addSuffix: true })}
            </span>
          </div>
          {version.change_summary && (
            <div className="text-sm text-slate-600 mt-2 italic">
              "{version.change_summary}"
            </div>
          )}
        </div>
      </div>
      <div className="flex items-center gap-2">
        {onCompare && (
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => onCompare(version.id)}
          >
            Compare
          </Button>
        )}
        <Button variant="outline" size="sm">
          View Details
          <ArrowRightIcon className="h-4 w-4 ml-2" />
        </Button>
      </div>
    </div>
  );
} 