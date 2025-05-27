'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Save, X } from 'lucide-react';
import { useDataset } from '@/lib/hooks/useDatasetManager';
import { useDatasetVersions, useCreateDatasetVersion } from '@/lib/hooks/useDatasetVersionManager';
import { useAllTestCases } from '@/lib/hooks/useTestCaseManager';
import { DatasetVersionCreate } from '@/lib/schemas/datasetVersion';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { TestCaseSelector } from '@/components/datasets';

interface NewVersionPageProps {
  params: {
    id: string;
  };
}

export default function NewVersionPage({ params }: NewVersionPageProps) {
  const router = useRouter();
  const { data: dataset, isLoading: datasetLoading, error: datasetError } = useDataset(params.id);
  const { data: versions = [] } = useDatasetVersions(params.id);
  const { data: allTestCases = [] } = useAllTestCases();
  const createVersionMutation = useCreateDatasetVersion();

  const [selectedTestCaseIds, setSelectedTestCaseIds] = useState<string[]>([]);
  const [changeSummary, setChangeSummary] = useState('');

  // Get current version for reference
  const currentVersion = versions.find(v => v.id === dataset?.current_version_id);
  const currentTestCaseIds = currentVersion?.test_case_ids || [];

  // Initialize with current version's test cases
  React.useEffect(() => {
    if (currentTestCaseIds.length > 0 && selectedTestCaseIds.length === 0) {
      setSelectedTestCaseIds(currentTestCaseIds);
    }
  }, [currentTestCaseIds, selectedTestCaseIds.length]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!dataset) return;

    try {
      const versionData: DatasetVersionCreate = {
        test_case_ids: selectedTestCaseIds,
        change_summary: changeSummary.trim() || undefined,
      };

      await createVersionMutation.mutateAsync({
        datasetId: dataset.id,
        data: versionData,
      });
      
      router.push(`/dashboard/datasets/${params.id}/versions`);
    } catch (error) {
      console.error('Error creating dataset version:', error);
    }
  };

  const handleCancel = () => {
    router.back();
  };

  // Calculate changes from current version
  const addedTestCases = selectedTestCaseIds.filter(id => !currentTestCaseIds.includes(id));
  const removedTestCases = currentTestCaseIds.filter(id => !selectedTestCaseIds.includes(id));
  const unchangedTestCases = selectedTestCaseIds.filter(id => currentTestCaseIds.includes(id));

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
          <h1 className="text-2xl font-bold text-slate-900">Create New Version</h1>
        </div>
        
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
          {datasetError ? `Error loading dataset: ${datasetError.message}` : 'Dataset not found'}
        </div>
      </div>
    );
  }

  const nextVersionNumber = Math.max(...versions.map(v => v.version_number), 0) + 1;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Button variant="ghost" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Create New Version</h1>
          <p className="text-slate-600">
            Dataset: <span className="font-medium">{dataset.name}</span> • Version {nextVersionNumber}
          </p>
        </div>
      </div>

      {/* Dataset Info */}
      <Card className="p-4">
        <div className="space-y-2">
          <h3 className="font-medium text-slate-900">{dataset.name}</h3>
          {dataset.description && (
            <p className="text-sm text-slate-600">{dataset.description}</p>
          )}
          <div className="flex items-center gap-4 text-xs text-slate-500">
            <span>Current Version: {currentVersion?.version_number || 'None'}</span>
            <span>Test Cases: {currentTestCaseIds.length}</span>
            <span>New Version: {nextVersionNumber}</span>
          </div>
        </div>
      </Card>

      {/* Change Summary */}
      <Card className="p-6">
        <div className="space-y-4">
          <div>
            <Label htmlFor="change_summary" className="block text-sm font-medium text-slate-700 mb-2">
              Change Summary
            </Label>
            <textarea
              id="change_summary"
              value={changeSummary}
              onChange={(e) => setChangeSummary(e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-slate-300 rounded-md focus:border-slate-400 focus:ring-2 focus:ring-slate-200 resize-none"
              placeholder="Describe what changed in this version (optional)"
            />
            <p className="text-xs text-slate-500 mt-1">
              Briefly describe the changes made in this version
            </p>
          </div>

          {/* Changes Preview */}
          {(addedTestCases.length > 0 || removedTestCases.length > 0) && (
            <div className="bg-slate-50 p-4 rounded-md">
              <h4 className="text-sm font-medium text-slate-900 mb-3">Changes from Current Version</h4>
              <div className="space-y-2 text-sm">
                {addedTestCases.length > 0 && (
                  <div className="flex items-center gap-2">
                    <span className="text-green-600 font-medium">+{addedTestCases.length}</span>
                    <span className="text-slate-600">test cases added</span>
                  </div>
                )}
                {removedTestCases.length > 0 && (
                  <div className="flex items-center gap-2">
                    <span className="text-red-600 font-medium">-{removedTestCases.length}</span>
                    <span className="text-slate-600">test cases removed</span>
                  </div>
                )}
                {unchangedTestCases.length > 0 && (
                  <div className="flex items-center gap-2">
                    <span className="text-slate-500 font-medium">{unchangedTestCases.length}</span>
                    <span className="text-slate-600">test cases unchanged</span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </Card>

      {/* Test Case Selection */}
      <Card className="p-6">
        <div className="space-y-4">
          <div>
            <h3 className="text-lg font-semibold text-slate-900 mb-2">
              Select Test Cases for Version {nextVersionNumber}
            </h3>
            <p className="text-sm text-slate-600">
              Choose which test cases to include in this version. The selection starts with the current version's test cases.
            </p>
          </div>

          <TestCaseSelector
            selectedTestCaseIds={selectedTestCaseIds}
            onSelectionChange={setSelectedTestCaseIds}
          />
        </div>
      </Card>

      {/* Form Actions */}
      <Card className="p-6">
        <div className="flex items-center gap-3">
          <Button
            onClick={handleSubmit}
            disabled={createVersionMutation.isPending || selectedTestCaseIds.length === 0}
            className="gap-2"
          >
            <Save className="h-4 w-4" />
            {createVersionMutation.isPending ? 'Creating...' : `Create Version ${nextVersionNumber}`}
          </Button>
          
          <Button
            variant="outline"
            onClick={handleCancel}
            disabled={createVersionMutation.isPending}
            className="gap-2"
          >
            <X className="h-4 w-4" />
            Cancel
          </Button>
        </div>

        {/* Error Display */}
        {createVersionMutation.error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md mt-4">
            Error creating version: {createVersionMutation.error.message}
          </div>
        )}

        {/* Validation Messages */}
        {selectedTestCaseIds.length === 0 && (
          <div className="bg-yellow-50 border border-yellow-200 text-yellow-700 px-4 py-3 rounded-md mt-4">
            Please select at least one test case for this version.
          </div>
        )}
      </Card>
    </div>
  );
} 