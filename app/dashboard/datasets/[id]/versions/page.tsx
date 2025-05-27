'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';
import { useDataset } from '@/lib/hooks/useDatasetManager';
import { DatasetVersionHistory, DatasetVersionComparison } from '@/components/datasets';

export default function DatasetVersionsPage() {
  const params = useParams();
  const datasetId = params.id as string;
  const [compareVersions, setCompareVersions] = useState<{ from: string; to: string } | null>(null);
  
  const { data: dataset, isLoading: isDatasetLoading } = useDataset(datasetId);

  const handleCompare = (versionId: string) => {
    if (!compareVersions) {
      setCompareVersions({ from: versionId, to: '' });
    } else if (!compareVersions.to) {
      setCompareVersions({ ...compareVersions, to: versionId });
    } else {
      setCompareVersions({ from: versionId, to: '' });
    }
  };

  const clearComparison = () => {
    setCompareVersions(null);
  };

  if (isDatasetLoading) {
    return (
      <div className="min-h-screen bg-white p-6">
        <div className="max-w-4xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-slate-200 rounded w-64 mb-6"></div>
            <div className="h-6 bg-slate-200 rounded w-48 mb-8"></div>
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-32 bg-slate-200 rounded"></div>
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
        <div className="max-w-4xl mx-auto">
          <div className="text-center py-12">
            <h1 className="text-2xl font-bold text-slate-900 mb-4">Dataset not found</h1>
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
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Link 
            href={`/dashboard/datasets/${datasetId}`}
            className="text-slate-500 hover:text-slate-700"
          >
            <ArrowLeftIcon className="h-5 w-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">
              {dataset.name} - Versions
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              Manage and compare dataset versions
            </p>
          </div>
        </div>

        {/* Comparison Mode */}
        {compareVersions && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-medium text-blue-900">Comparison Mode</h3>
                <p className="text-sm text-blue-700 mt-1">
                  {compareVersions.from && compareVersions.to 
                    ? `Comparing versions ${compareVersions.from.slice(-8)} and ${compareVersions.to.slice(-8)}`
                    : compareVersions.from 
                      ? `Selected ${compareVersions.from.slice(-8)}, select another version to compare`
                      : 'Select two versions to compare'
                  }
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={clearComparison}
                className="text-blue-700 border-blue-300 hover:bg-blue-100"
              >
                Clear
              </Button>
            </div>
          </div>
        )}

        {/* Version Comparison */}
        {compareVersions?.from && compareVersions?.to && (
          <DatasetVersionComparison
            fromVersionId={compareVersions.from}
            toVersionId={compareVersions.to}
          />
        )}

        {/* Version History */}
        <DatasetVersionHistory
          datasetId={datasetId}
          currentVersionId={dataset.current_version_id}
          onCompare={handleCompare}
        />
      </div>
    </div>
  );
} 