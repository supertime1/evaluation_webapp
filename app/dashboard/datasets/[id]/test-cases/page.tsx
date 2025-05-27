'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Plus, Search, Filter } from 'lucide-react';
import { useDataset } from '@/lib/hooks/useDatasetManager';
import { useDatasetVersions } from '@/lib/hooks/useDatasetVersionManager';
import { useAllTestCases } from '@/lib/hooks/useTestCaseManager';
import { TestCase } from '@/lib/schemas/testCase';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { 
  TestCaseSelector, 
  TestCaseBulkSelector, 
  TestCasePreview 
} from '@/components/datasets';

interface TestCasesPageProps {
  params: {
    id: string;
  };
}

export default function TestCasesPage({ params }: TestCasesPageProps) {
  const router = useRouter();
  const { data: dataset, isLoading: datasetLoading, error: datasetError } = useDataset(params.id);
  const { data: versions = [] } = useDatasetVersions(params.id);
  const { data: allTestCases = [] } = useAllTestCases();

  const [selectedTestCaseIds, setSelectedTestCaseIds] = useState<string[]>([]);
  const [showSelector, setShowSelector] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showCurrentVersionOnly, setShowCurrentVersionOnly] = useState(true);

  // Get current version and test cases
  const currentVersion = versions.find(v => v.id === dataset?.current_version_id);
  const currentTestCaseIds = currentVersion?.test_case_ids || [];
  
  // Get test cases in this dataset
  const datasetTestCases = allTestCases.filter(tc => 
    currentTestCaseIds.includes(tc.id)
  );

  // Filter test cases based on search
  const filteredTestCases = datasetTestCases.filter(tc => {
    if (!searchQuery) return true;
    
    const query = searchQuery.toLowerCase();
    return (
      tc.name.toLowerCase().includes(query) ||
      tc.type.toLowerCase().includes(query) ||
      tc.input?.toString().toLowerCase().includes(query)
    );
  });

  // Get selected test case objects
  const selectedTestCases = allTestCases.filter(tc => 
    selectedTestCaseIds.includes(tc.id) && tc.user_id
  ) as TestCase[];

  const handleBulkAction = (action: string, testCases: TestCase[]) => {
    console.log(`Bulk action: ${action}`, testCases);
    // Actions are handled by the bulk selector component
  };

  if (datasetLoading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-slate-200 rounded w-1/3 mb-4"></div>
          <div className="h-64 bg-slate-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (datasetError || !dataset) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <Button variant="ghost" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <h1 className="text-2xl font-bold text-slate-900">Manage Test Cases</h1>
        </div>
        
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
          {datasetError ? `Error loading dataset: ${datasetError.message}` : 'Dataset not found'}
        </div>
      </div>
    );
  }

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
            <h1 className="text-2xl font-bold text-slate-900">Manage Test Cases</h1>
            <p className="text-slate-600">
              Dataset: <span className="font-medium">{dataset.name}</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={() => router.push(`/dashboard/datasets/${params.id}/test-cases/new`)}
            className="gap-2"
          >
            <Plus className="h-4 w-4" />
            Create Test Case
          </Button>
          
          <Button
            onClick={() => setShowSelector(!showSelector)}
            className="gap-2"
          >
            <Plus className="h-4 w-4" />
            Add Existing
          </Button>
        </div>
      </div>

      {/* Dataset Info */}
      <Card className="p-4">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <h3 className="font-medium text-slate-900">{dataset.name}</h3>
              {dataset.is_global && (
                <Badge variant="outline" className="text-xs">Global</Badge>
              )}
            </div>
            {dataset.description && (
              <p className="text-sm text-slate-600">{dataset.description}</p>
            )}
            <div className="flex items-center gap-4 text-xs text-slate-500">
              <span>ID: {dataset.id}</span>
              {currentVersion && (
                <span>Current Version: {currentVersion.version_number}</span>
              )}
              <span>{datasetTestCases.length} test cases</span>
            </div>
          </div>
        </div>
      </Card>

      {/* Bulk Selector */}
      {selectedTestCases.length > 0 && (
        <TestCaseBulkSelector
          selectedTestCases={selectedTestCases}
          onSelectionChange={(testCases) => 
            setSelectedTestCaseIds(testCases.map(tc => tc.id))
          }
          onBulkAction={handleBulkAction}
        />
      )}

      {/* Add Test Cases Selector */}
      {showSelector && (
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-slate-900">
              Add Test Cases to Dataset
            </h3>
            <Button
              variant="ghost"
              onClick={() => setShowSelector(false)}
              size="sm"
            >
              Close
            </Button>
          </div>
          
          <TestCaseSelector
            selectedTestCaseIds={selectedTestCaseIds}
            onSelectionChange={setSelectedTestCaseIds}
            excludeTestCaseIds={currentTestCaseIds}
          />
        </Card>
      )}

      {/* Search and Filters */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
          <input
            type="text"
            placeholder="Search test cases in this dataset..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 h-10 border border-slate-300 rounded-md focus:border-slate-400 focus:ring-2 focus:ring-slate-200 text-sm"
          />
        </div>

        <div className="flex items-center gap-2">
          <Switch
            id="current-version-filter"
            checked={showCurrentVersionOnly}
            onCheckedChange={setShowCurrentVersionOnly}
          />
          <Label htmlFor="current-version-filter" className="text-sm whitespace-nowrap">
            Current version only
          </Label>
        </div>
      </div>

      {/* Test Cases List */}
      <div className="space-y-4">
        {filteredTestCases.length === 0 ? (
          <Card className="p-8 text-center">
            <div className="space-y-3">
              <div className="text-slate-400">
                <Filter className="h-12 w-12 mx-auto mb-4" />
              </div>
              <h3 className="text-lg font-medium text-slate-900">
                {searchQuery 
                  ? 'No test cases match your search'
                  : 'No test cases in this dataset'
                }
              </h3>
              <p className="text-slate-600">
                {searchQuery 
                  ? 'Try adjusting your search terms or filters.'
                  : 'Add test cases to this dataset to get started.'
                }
              </p>
              {!searchQuery && (
                <div className="flex justify-center gap-2 pt-4">
                  <Button
                    onClick={() => router.push(`/dashboard/datasets/${params.id}/test-cases/new`)}
                    className="gap-2"
                  >
                    <Plus className="h-4 w-4" />
                    Create Test Case
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setShowSelector(true)}
                    className="gap-2"
                  >
                    <Plus className="h-4 w-4" />
                    Add Existing
                  </Button>
                </div>
              )}
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
          Showing {filteredTestCases.length} of {datasetTestCases.length} test cases
          {searchQuery && ` matching "${searchQuery}"`}
        </div>
      )}
    </div>
  );
} 