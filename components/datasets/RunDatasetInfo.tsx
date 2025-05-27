'use client';

import React from 'react';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useDatasetVersion } from '@/lib/hooks/useDatasetVersionManager';
import { useDataset } from '@/lib/hooks/useDatasetManager';
import { formatDistanceToNow } from 'date-fns';
import { ArrowRightIcon, CircleStackIcon, TagIcon } from '@heroicons/react/24/outline';
import { GlobalDatasetBadge } from './GlobalDatasetBadge';

interface RunDatasetInfoProps {
  datasetVersionId: string;
}

export function RunDatasetInfo({ datasetVersionId }: RunDatasetInfoProps) {
  const { data: datasetVersion, isLoading: isVersionLoading, error: versionError } = useDatasetVersion(datasetVersionId || '');
  const { data: dataset, isLoading: isDatasetLoading, error: datasetError } = useDataset(datasetVersion?.dataset_id || '');

  const isLoading = isVersionLoading || isDatasetLoading;
  const error = versionError || datasetError;

  if (!datasetVersionId) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CircleStackIcon className="h-5 w-5" />
            Dataset Used
          </CardTitle>
          <CardDescription>
            Dataset version used for this evaluation run
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-slate-500">
            <CircleStackIcon className="h-12 w-12 mx-auto mb-4 text-slate-300" />
            <p className="text-lg font-medium mb-2">Dataset information coming soon</p>
            <p className="text-sm">
              We're working on adding dataset version tracking to runs. 
              This feature will be available in a future update.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CircleStackIcon className="h-5 w-5" />
            Dataset Used
          </CardTitle>
          <CardDescription>
            Dataset version used for this evaluation run
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse">
            <div className="flex items-center justify-between p-4 border border-slate-200 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="h-4 w-4 bg-slate-200 rounded"></div>
                <div className="space-y-2">
                  <div className="h-4 bg-slate-200 rounded w-48"></div>
                  <div className="h-3 bg-slate-200 rounded w-32"></div>
                </div>
              </div>
              <div className="h-8 bg-slate-200 rounded w-24"></div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CircleStackIcon className="h-5 w-5" />
            Dataset Used
          </CardTitle>
          <CardDescription>
            Dataset version used for this evaluation run
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-sm">
            Error loading dataset information: {error.message}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!datasetVersion || !dataset) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CircleStackIcon className="h-5 w-5" />
            Dataset Used
          </CardTitle>
          <CardDescription>
            Dataset version used for this evaluation run
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-slate-500">
            <CircleStackIcon className="h-12 w-12 mx-auto mb-4 text-slate-300" />
            <p className="text-lg font-medium mb-2">Dataset not found</p>
            <p className="text-sm">
              The dataset version used for this run could not be found.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CircleStackIcon className="h-5 w-5" />
          Dataset Used
        </CardTitle>
        <CardDescription>
          Dataset version used for this evaluation run
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between p-4 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors">
          <div className="flex items-center space-x-3">
            <CircleStackIcon className="h-5 w-5 text-slate-400" />
            <div>
              <div className="flex items-center gap-2">
                <span className="font-medium text-slate-900">{dataset.name}</span>
                {dataset.is_global && <GlobalDatasetBadge isGlobal={dataset.is_global} />}
              </div>
              <div className="flex items-center gap-4 text-sm text-slate-500 mt-1">
                <span className="flex items-center gap-1">
                  <TagIcon className="h-3 w-3" />
                  Version {datasetVersion.version_number}
                </span>
                <span>
                  {datasetVersion.test_case_ids.length} test cases
                </span>
                <span>
                  Created {formatDistanceToNow(new Date(datasetVersion.created_at), { addSuffix: true })}
                </span>
              </div>
              {datasetVersion.change_summary && (
                <div className="text-sm text-slate-600 mt-2 italic">
                  "{datasetVersion.change_summary}"
                </div>
              )}
            </div>
          </div>
          <Link href={`/dashboard/datasets/${dataset.id}`}>
            <Button variant="outline" size="sm" className="flex items-center gap-2">
              View Dataset
              <ArrowRightIcon className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
} 