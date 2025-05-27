'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { useCreateDatasetVersion } from '@/lib/hooks/useDatasetVersionManager';
import { useTestCases } from '@/lib/hooks/useTestCaseManager';
import { DatasetVersionCreate } from '@/lib/schemas/datasetVersion';

interface DatasetVersionCreateModalProps {
  datasetId: string;
  trigger: React.ReactNode;
  onSuccess?: () => void;
}

export function DatasetVersionCreateModal({ 
  datasetId, 
  trigger, 
  onSuccess 
}: DatasetVersionCreateModalProps) {
  const [open, setOpen] = useState(false);
  const [selectedTestCases, setSelectedTestCases] = useState<string[]>([]);
  const [changeSummary, setChangeSummary] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const createMutation = useCreateDatasetVersion();
  const { data: testCases, isLoading: isLoadingTestCases } = useTestCases();

  const isLoading = createMutation.isPending;

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (selectedTestCases.length === 0) {
      newErrors.testCases = 'Please select at least one test case';
    }

    if (changeSummary.length > 500) {
      newErrors.changeSummary = 'Change summary must be less than 500 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      const createData: DatasetVersionCreate = {
        test_case_ids: selectedTestCases,
        change_summary: changeSummary.trim() || undefined,
      };

      await createMutation.mutateAsync({ datasetId, data: createData });

      setOpen(false);
      setSelectedTestCases([]);
      setChangeSummary('');
      setErrors({});
      onSuccess?.();
    } catch (error) {
      console.error('Failed to create dataset version:', error);
      const errorMessage = error instanceof Error 
        ? error.message 
        : 'Failed to create dataset version. Please try again.';
      setErrors({ submit: errorMessage });
    }
  };

  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen);
    if (!newOpen) {
      // Reset form when closing
      setSelectedTestCases([]);
      setChangeSummary('');
      setErrors({});
    }
  };

  const handleTestCaseToggle = (testCaseId: string) => {
    setSelectedTestCases(prev => 
      prev.includes(testCaseId)
        ? prev.filter(id => id !== testCaseId)
        : [...prev, testCaseId]
    );
  };

  const handleSelectAll = () => {
    if (testCases) {
      setSelectedTestCases(testCases.map(tc => tc.id));
    }
  };

  const handleSelectNone = () => {
    setSelectedTestCases([]);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        {trigger}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold text-slate-900">
            Create New Version
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0">
          {errors.submit && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-sm mb-4">
              {errors.submit}
            </div>
          )}

          <div className="space-y-5 flex-1 min-h-0 overflow-y-auto">
            {/* Test Case Selection */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-medium text-slate-700">
                  Test Cases *
                </Label>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleSelectAll}
                    className="h-7 px-2 text-xs"
                  >
                    Select All
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleSelectNone}
                    className="h-7 px-2 text-xs"
                  >
                    Select None
                  </Button>
                </div>
              </div>

              {isLoadingTestCases ? (
                <div className="space-y-2">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="h-12 bg-slate-200 rounded animate-pulse"></div>
                  ))}
                </div>
              ) : testCases && testCases.length > 0 ? (
                <div className="border border-slate-300 rounded-md max-h-60 overflow-y-auto">
                  {testCases.map((testCase) => (
                    <label
                      key={testCase.id}
                      className="flex items-center p-3 hover:bg-slate-50 cursor-pointer border-b border-slate-200 last:border-b-0"
                    >
                      <input
                        type="checkbox"
                        checked={selectedTestCases.includes(testCase.id)}
                        onChange={() => handleTestCaseToggle(testCase.id)}
                        className="h-4 w-4 text-slate-900 focus:ring-slate-500 border-slate-300 rounded"
                      />
                      <div className="ml-3 flex-1 min-w-0">
                        <p className="text-sm font-medium text-slate-900 truncate">
                          {testCase.name}
                        </p>
                        <p className="text-xs text-slate-500 truncate">
                          {Array.isArray(testCase.input) 
                            ? `${testCase.input.length} input items`
                            : testCase.input || 'No input'
                          }
                        </p>
                      </div>
                      <span className="ml-2 px-2 py-1 bg-slate-100 text-slate-600 text-xs rounded font-mono">
                        {testCase.id.slice(-8)}
                      </span>
                    </label>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-slate-500">
                  <p>No test cases available</p>
                  <p className="text-xs mt-1">Create test cases first to add them to a version</p>
                </div>
              )}

              {errors.testCases && (
                <p className="text-sm text-red-600">{errors.testCases}</p>
              )}

              {selectedTestCases.length > 0 && (
                <p className="text-sm text-slate-600">
                  {selectedTestCases.length} test case{selectedTestCases.length !== 1 ? 's' : ''} selected
                </p>
              )}
            </div>

            {/* Change Summary */}
            <div className="space-y-2">
              <Label htmlFor="changeSummary" className="text-sm font-medium text-slate-700">
                Change Summary
              </Label>
              <textarea
                id="changeSummary"
                value={changeSummary}
                onChange={(e) => setChangeSummary(e.target.value)}
                className={`w-full rounded-md border px-3 py-2 text-sm focus:ring-2 focus:ring-slate-200 min-h-[80px] ${
                  errors.changeSummary ? 'border-red-300 focus:border-red-400' : 'border-slate-300 focus:border-slate-400'
                }`}
                placeholder="Describe what changed in this version (optional)"
                disabled={isLoading}
              />
              {errors.changeSummary && (
                <p className="text-sm text-red-600">{errors.changeSummary}</p>
              )}
              <p className="text-xs text-slate-500">
                {changeSummary.length}/500 characters
              </p>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-200 mt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={isLoading}
              className="h-11 px-4"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isLoading || selectedTestCases.length === 0}
              className="h-11 px-4 bg-slate-900 hover:bg-slate-800"
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Creating...
                </>
              ) : (
                'Create Version'
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
} 