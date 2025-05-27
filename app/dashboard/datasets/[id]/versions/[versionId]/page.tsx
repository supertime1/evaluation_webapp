'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Calendar, User, FileText, Hash } from 'lucide-react';
import { useDataset } from '@/lib/hooks/useDatasetManager';
import { useDatasetVersion } from '@/lib/hooks/useDatasetVersionManager';
import { useAllTestCases } from '@/lib/hooks/useTestCaseManager';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TestCasePreview } from '@/components/datasets';
import { TestCase } from '@/lib/schemas/testCase';

interface VersionDetailPageProps {
  params: Promise<{
    id: string;
    versionId: string;
  }>;
}

export default function VersionDetailPage({ params }: VersionDetailPageProps) {
  const router = useRouter();
  const resolvedParams = React.use(params);
  const { data: dataset } = useDataset(resolvedParams.id);
  const { data: version, isLoading, error } = useDatasetVersion(resolvedParams.versionId);
  const { data: allTestCases = [] } = useAllTestCases();

  const [searchQuery, setSearchQuery] = useState('');

  // Get test cases for this version
  const versionTestCases = allTestCases.filter(tc => 
    version?.test_case_ids.includes(tc.id)
  );

  // Filter test cases based on search
  const filteredTestCases = versionTestCases.filter(tc => {
    if (!searchQuery) return true;
    
    const query = searchQuery.toLowerCase();
    return (
      tc.name.toLowerCase().includes(query) ||
      tc.type.toLowerCase().includes(query) ||
      tc.input?.toString().toLowerCase().includes(query)
    );
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-slate-200 rounded w-1/3 mb-4"></div>
          <div className="h-64 bg-slate-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (error || !version) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <Button variant="ghost" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <h1 className="text-2xl font-bold text-slate-900">Version Details</h1>
        </div>
        
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
          {error ? `Error loading version: ${error.message}` : 'Version not found'}
        </div>
      </div>
    );
  }

  const isCurrentVersion = dataset?.current_version_id === version.id;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button variant="ghost" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">
              Version {version.version_number}
            </h1>
            {dataset && (
              <p className="text-slate-600">
                Dataset: <span className="font-medium">{dataset.name}</span>
              </p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          {isCurrentVersion && (
            <Badge variant="default" className="bg-green-100 text-green-800">
              Current Version
            </Badge>
          )}
          <Badge variant="outline">
            Version {version.version_number}
          </Badge>
        </div>
      </div>

      {/* Version Info */}
      <Card className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="flex items-center gap-3">
            <Hash className="h-5 w-5 text-slate-500" />
            <div>
              <p className="text-sm font-medium text-slate-900">Version Number</p>
              <p className="text-sm text-slate-600">{version.version_number}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <FileText className="h-5 w-5 text-slate-500" />
            <div>
              <p className="text-sm font-medium text-slate-900">Test Cases</p>
              <p className="text-sm text-slate-600">{version.test_case_ids.length}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Calendar className="h-5 w-5 text-slate-500" />
            <div>
              <p className="text-sm font-medium text-slate-900">Created</p>
              <p className="text-sm text-slate-600">
                {new Date(version.created_at).toLocaleDateString()}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <User className="h-5 w-5 text-slate-500" />
            <div>
              <p className="text-sm font-medium text-slate-900">Created By</p>
              <p className="text-sm text-slate-600">{version.created_by_user_id}</p>
            </div>
          </div>
        </div>

        {version.change_summary && (
          <div className="mt-6 pt-6 border-t border-slate-200">
            <h3 className="text-sm font-medium text-slate-900 mb-2">Change Summary</h3>
            <p className="text-sm text-slate-700 whitespace-pre-wrap">
              {version.change_summary}
            </p>
          </div>
        )}

        <div className="mt-6 pt-6 border-t border-slate-200">
          <div className="flex items-center gap-4 text-xs text-slate-500">
            <span>Version ID: {version.id}</span>
            <span>Dataset ID: {version.dataset_id}</span>
          </div>
        </div>
      </Card>

      {/* Search */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1">
          <input
            type="text"
            placeholder="Search test cases in this version..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-4 pr-4 h-10 border border-slate-300 rounded-md focus:border-slate-400 focus:ring-2 focus:ring-slate-200 text-sm"
          />
        </div>
        <div className="text-sm text-slate-600">
          {filteredTestCases.length} of {versionTestCases.length} test cases
        </div>
      </div>

      {/* Test Cases */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-slate-900">Test Cases</h2>
        </div>

        {filteredTestCases.length === 0 ? (
          <Card className="p-8 text-center">
            <div className="space-y-3">
              <div className="text-slate-400">
                <FileText className="h-12 w-12 mx-auto mb-4" />
              </div>
              <h3 className="text-lg font-medium text-slate-900">
                {searchQuery 
                  ? 'No test cases match your search'
                  : 'No test cases in this version'
                }
              </h3>
              <p className="text-slate-600">
                {searchQuery 
                  ? 'Try adjusting your search terms.'
                  : 'This version contains no test cases.'
                }
              </p>
            </div>
          </Card>
        ) : (
          <div className="grid gap-4">
            {filteredTestCases.map(testCase => (
              <TestCasePreview
                key={testCase.id}
                testCase={testCase as TestCase}
                className="hover:shadow-md transition-shadow"
              />
            ))}
          </div>
        )}
      </div>

      {/* Summary */}
      {filteredTestCases.length > 0 && (
        <div className="text-center text-sm text-slate-500 py-4">
          Showing {filteredTestCases.length} of {versionTestCases.length} test cases
          {searchQuery && ` matching "${searchQuery}"`}
        </div>
      )}
    </div>
  );
} 