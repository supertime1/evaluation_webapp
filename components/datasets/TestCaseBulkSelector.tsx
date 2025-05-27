'use client';

import React, { useState } from 'react';
import { Plus, Minus, Copy, Trash2, Download, Upload, MoreHorizontal } from 'lucide-react';
import { TestCase } from '@/lib/schemas/testCase';
import { Dataset } from '@/lib/schemas/dataset';
import { useDatasets } from '@/lib/hooks/useDatasetManager';
import { useAddTestCaseToDataset, useRemoveTestCaseFromDataset } from '@/lib/hooks/useDatasetManager';
import { useDeleteTestCase } from '@/lib/hooks/useTestCaseManager';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

interface TestCaseBulkSelectorProps {
  selectedTestCases: TestCase[];
  onSelectionChange: (testCases: TestCase[]) => void;
  onBulkAction?: (action: string, testCases: TestCase[]) => void;
  className?: string;
}

export function TestCaseBulkSelector({
  selectedTestCases,
  onSelectionChange,
  onBulkAction,
  className = '',
}: TestCaseBulkSelectorProps) {
  const { data: datasets = [] } = useDatasets();
  const addToDatasetMutation = useAddTestCaseToDataset();
  const removeFromDatasetMutation = useRemoveTestCaseFromDataset();
  const deleteTestCaseMutation = useDeleteTestCase();
  
  const [showAddToDatasetDialog, setShowAddToDatasetDialog] = useState(false);
  const [showRemoveFromDatasetDialog, setShowRemoveFromDatasetDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [selectedDatasetId, setSelectedDatasetId] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState(false);

  const handleBulkAddToDataset = async () => {
    if (!selectedDatasetId || selectedTestCases.length === 0) return;

    setIsProcessing(true);
    try {
      // Add each test case to the dataset
      for (const testCase of selectedTestCases) {
        await addToDatasetMutation.mutateAsync({
          datasetId: selectedDatasetId,
          testCaseId: testCase.id,
        });
      }
      
      setShowAddToDatasetDialog(false);
      setSelectedDatasetId('');
      onBulkAction?.('add-to-dataset', selectedTestCases);
    } catch (error) {
      console.error('Error adding test cases to dataset:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleBulkRemoveFromDataset = async () => {
    if (!selectedDatasetId || selectedTestCases.length === 0) return;

    setIsProcessing(true);
    try {
      // Remove each test case from the dataset
      for (const testCase of selectedTestCases) {
        await removeFromDatasetMutation.mutateAsync({
          datasetId: selectedDatasetId,
          testCaseId: testCase.id,
        });
      }
      
      setShowRemoveFromDatasetDialog(false);
      setSelectedDatasetId('');
      onBulkAction?.('remove-from-dataset', selectedTestCases);
    } catch (error) {
      console.error('Error removing test cases from dataset:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleBulkDelete = async () => {
    if (selectedTestCases.length === 0) return;

    setIsProcessing(true);
    try {
      // Delete each test case
      for (const testCase of selectedTestCases) {
        await deleteTestCaseMutation.mutateAsync(testCase.id);
      }
      
      setShowDeleteDialog(false);
      onBulkAction?.('delete', selectedTestCases);
      onSelectionChange([]); // Clear selection after deletion
    } catch (error) {
      console.error('Error deleting test cases:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCopyIds = () => {
    const ids = selectedTestCases.map(tc => tc.id).join('\n');
    navigator.clipboard.writeText(ids);
    onBulkAction?.('copy-ids', selectedTestCases);
  };

  const handleExport = () => {
    const exportData = selectedTestCases.map(tc => ({
      id: tc.id,
      name: tc.name,
      type: tc.type,
      input: tc.input,
      expected_output: tc.expected_output,
      context: tc.context,
      retrieval_context: tc.retrieval_context,
      additional_metadata: tc.additional_metadata,
      is_global: tc.is_global,
    }));

    const blob = new Blob([JSON.stringify(exportData, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `test-cases-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    onBulkAction?.('export', selectedTestCases);
  };

  const clearSelection = () => {
    onSelectionChange([]);
  };

  if (selectedTestCases.length === 0) {
    return null;
  }

  return (
    <Card className={`p-4 border-blue-200 bg-blue-50 ${className}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Badge variant="secondary" className="bg-blue-100 text-blue-800">
            {selectedTestCases.length} selected
          </Badge>
          <span className="text-sm text-slate-600">
            Bulk operations available
          </span>
        </div>

        <div className="flex items-center gap-2">
          {/* Add to Dataset */}
          <Dialog open={showAddToDatasetDialog} onOpenChange={setShowAddToDatasetDialog}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm" className="gap-2">
                <Plus className="h-4 w-4" />
                Add to Dataset
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add to Dataset</DialogTitle>
                <DialogDescription>
                  Add {selectedTestCases.length} test cases to a dataset.
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Select Dataset
                  </label>
                  <select
                    value={selectedDatasetId}
                    onChange={(e) => setSelectedDatasetId(e.target.value)}
                    className="w-full border border-slate-300 rounded-md px-3 py-2 focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
                  >
                    <option value="">Choose a dataset...</option>
                    {datasets.map(dataset => (
                      <option key={dataset.id} value={dataset.id}>
                        {dataset.name} {dataset.is_global && '(Global)'}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setShowAddToDatasetDialog(false)}
                  disabled={isProcessing}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleBulkAddToDataset}
                  disabled={!selectedDatasetId || isProcessing}
                >
                  {isProcessing ? 'Adding...' : 'Add to Dataset'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Remove from Dataset */}
          <Dialog open={showRemoveFromDatasetDialog} onOpenChange={setShowRemoveFromDatasetDialog}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm" className="gap-2">
                <Minus className="h-4 w-4" />
                Remove from Dataset
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Remove from Dataset</DialogTitle>
                <DialogDescription>
                  Remove {selectedTestCases.length} test cases from a dataset.
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Select Dataset
                  </label>
                  <select
                    value={selectedDatasetId}
                    onChange={(e) => setSelectedDatasetId(e.target.value)}
                    className="w-full border border-slate-300 rounded-md px-3 py-2 focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
                  >
                    <option value="">Choose a dataset...</option>
                    {datasets.map(dataset => (
                      <option key={dataset.id} value={dataset.id}>
                        {dataset.name} {dataset.is_global && '(Global)'}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setShowRemoveFromDatasetDialog(false)}
                  disabled={isProcessing}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleBulkRemoveFromDataset}
                  disabled={!selectedDatasetId || isProcessing}
                >
                  {isProcessing ? 'Removing...' : 'Remove from Dataset'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Copy IDs */}
          <Button variant="outline" size="sm" className="gap-2" onClick={handleCopyIds}>
            <Copy className="h-4 w-4" />
            Copy IDs
          </Button>

          {/* Export */}
          <Button variant="outline" size="sm" className="gap-2" onClick={handleExport}>
            <Download className="h-4 w-4" />
            Export
          </Button>

          {/* Delete */}
          <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm" className="gap-2 text-red-600 hover:text-red-700">
                <Trash2 className="h-4 w-4" />
                Delete
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Delete Test Cases</DialogTitle>
                <DialogDescription>
                  Are you sure you want to delete {selectedTestCases.length} test cases? 
                  This action cannot be undone.
                </DialogDescription>
              </DialogHeader>

              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setShowDeleteDialog(false)}
                  disabled={isProcessing}
                >
                  Cancel
                </Button>
                <Button
                  variant="destructive"
                  onClick={handleBulkDelete}
                  disabled={isProcessing}
                >
                  {isProcessing ? 'Deleting...' : 'Delete Test Cases'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Clear Selection */}
          <Button variant="ghost" size="sm" onClick={clearSelection}>
            Clear
          </Button>
        </div>
      </div>

      {/* Selected Test Cases Preview */}
      {selectedTestCases.length > 0 && (
        <div className="mt-4 pt-4 border-t border-blue-200">
          <h4 className="text-sm font-medium text-slate-700 mb-2">Selected Test Cases:</h4>
          <div className="flex flex-wrap gap-2">
            {selectedTestCases.slice(0, 5).map(testCase => (
              <Badge key={testCase.id} variant="outline" className="text-xs">
                {testCase.name}
              </Badge>
            ))}
            {selectedTestCases.length > 5 && (
              <Badge variant="outline" className="text-xs">
                +{selectedTestCases.length - 5} more
              </Badge>
            )}
          </div>
        </div>
      )}
    </Card>
  );
} 