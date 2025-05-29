'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { useCreateDatasetVersion } from '@/lib/hooks/useDatasetVersionManager';
import { useDataset } from '@/lib/hooks/useDatasetManager';
import { useDatasetVersionTestCases } from '@/lib/hooks/useDatasetVersionManager';
import { useCreateTestCase } from '@/lib/hooks/useTestCaseManager';
import { DatasetVersionCreate } from '@/lib/schemas/datasetVersion';
import { TestCaseCreate } from '@/lib/schemas/testCase';
import { TestCase } from '@/lib/schemas/testCase';
import { Plus, Minus, X } from 'lucide-react';

interface DatasetVersionCreateModalProps {
  datasetId: string;
  trigger: React.ReactNode;
  onSuccess?: () => void;
}

interface NewTestCase extends Omit<TestCaseCreate, 'id'> {
  tempId: string;
}

export function DatasetVersionCreateModal({ 
  datasetId, 
  trigger, 
  onSuccess 
}: DatasetVersionCreateModalProps) {
  const [open, setOpen] = useState(false);
  const [selectedTestCaseIds, setSelectedTestCaseIds] = useState<string[]>([]);
  const [newTestCases, setNewTestCases] = useState<NewTestCase[]>([]);
  const [changeSummary, setChangeSummary] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showAddForm, setShowAddForm] = useState(false);
  const [newTestCaseForm, setNewTestCaseForm] = useState<TestCaseCreate>({
    name: '',
    type: 'llm',
    input: '',
    expected_output: '',
    context: [],
    retrieval_context: [],
    additional_metadata: {},
    is_global: false
  });

  const createVersionMutation = useCreateDatasetVersion();
  const createTestCaseMutation = useCreateTestCase();
  const { data: dataset } = useDataset(datasetId);
  const { data: currentVersionTestCases = [], isLoading: isLoadingCurrentTestCases } = useDatasetVersionTestCases(
    dataset?.current_version_id || ''
  );

  const isLoading = createVersionMutation.isPending || createTestCaseMutation.isPending;

  // Initialize with current version's test cases
  useEffect(() => {
    if (currentVersionTestCases.length > 0 && selectedTestCaseIds.length === 0) {
      setSelectedTestCaseIds(currentVersionTestCases.map(tc => tc.id));
    }
  }, [currentVersionTestCases, selectedTestCaseIds.length]);

  // Get selected test case objects (from current version)
  const selectedTestCases = currentVersionTestCases.filter(tc => 
    selectedTestCaseIds.includes(tc.id)
  );

  // Test authentication function
  const testAuth = async () => {
    try {
      console.log('Testing authentication...');
      const testCase: TestCaseCreate = {
        name: 'Test Auth',
        type: 'llm',
        input: 'test',
        expected_output: 'test',
        context: [],
        retrieval_context: [],
        additional_metadata: {},
        is_global: false
      };
      
      const result = await createTestCaseMutation.mutateAsync(testCase);
      console.log('Auth test successful:', result);
      alert('Authentication is working! Test case created with ID: ' + result.id);
    } catch (error: any) {
      console.error('Auth test failed:', error);
      alert('Authentication test failed: ' + (error.response?.status || error.message));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (selectedTestCaseIds.length === 0 && newTestCases.length === 0) {
      newErrors.testCases = 'Please keep some existing test cases or add new ones';
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
      console.log('Starting version creation...');
      console.log('New test cases to create:', newTestCases.length);
      console.log('Selected existing test cases:', selectedTestCaseIds.length);
      
      // First, create any new test cases
      const createdTestCaseIds: string[] = [];
      
      if (newTestCases.length > 0) {
        console.log('Creating new test cases...');
        
        for (const newTestCase of newTestCases) {
          try {
            console.log('Creating test case:', newTestCase.name);
            const { tempId, ...testCaseData } = newTestCase;
            console.log('Test case data being sent:', JSON.stringify(testCaseData, null, 2));
            
            const createdTestCase = await createTestCaseMutation.mutateAsync(testCaseData);
            console.log('Test case created successfully:', createdTestCase.id);
            createdTestCaseIds.push(createdTestCase.id);
          } catch (testCaseError: any) {
            console.error('Failed to create test case:', newTestCase.name, testCaseError);
            console.error('Error details:', {
              message: testCaseError.message,
              status: testCaseError.response?.status,
              data: testCaseError.response?.data
            });
            
            // Check if it's an authentication error
            if (testCaseError.response?.status === 401 || 
                testCaseError.message?.includes('401') || 
                testCaseError.message?.includes('Unauthorized')) {
              setErrors({ 
                submit: 'Authentication failed. Your session may have expired. Please refresh the page and log in again.' 
              });
              return;
            }
            
            // Handle other specific errors
            if (testCaseError.response?.status === 400) {
              const errorDetail = testCaseError.response.data?.detail || 'Invalid test case data';
              setErrors({ 
                submit: `Failed to create test case "${newTestCase.name}": ${errorDetail}` 
              });
              return;
            }
            
            throw testCaseError;
          }
        }
        
        console.log('All test cases created successfully, IDs:', createdTestCaseIds);
      } else {
        console.log('No new test cases to create, proceeding with version creation...');
      }

      // Combine existing selected test cases with newly created ones
      const allTestCaseIds = [...selectedTestCaseIds, ...createdTestCaseIds];
      console.log('Final test case IDs for version:', allTestCaseIds);

      if (allTestCaseIds.length === 0) {
        setErrors({ submit: 'Cannot create a version with no test cases.' });
        return;
      }

      const createData: DatasetVersionCreate = {
        test_case_ids: allTestCaseIds,
        change_summary: changeSummary.trim() || undefined,
      };

      console.log('Creating version with data:', createData);
      await createVersionMutation.mutateAsync({ datasetId, data: createData });
      console.log('Version created successfully');

      // Reset form and close modal
      setOpen(false);
      setSelectedTestCaseIds([]);
      setNewTestCases([]);
      setChangeSummary('');
      setErrors({});
      setShowAddForm(false);
      setNewTestCaseForm({
        name: '',
        type: 'llm',
        input: '',
        expected_output: '',
        context: [],
        retrieval_context: [],
        additional_metadata: {},
        is_global: false
      });
      onSuccess?.();
    } catch (error: any) {
      console.error('Failed to create dataset version:', error);
      console.error('Version creation error details:', {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data
      });
      
      // Enhanced error handling
      let errorMessage = 'Failed to create dataset version. Please try again.';
      
      if (error.response?.status === 401 || 
          error.message?.includes('401') || 
          error.message?.includes('Unauthorized')) {
        errorMessage = 'Authentication failed. Your session may have expired. Please refresh the page and log in again.';
      } else if (error.response?.status === 400) {
        const errorDetail = error.response.data?.detail || 'Invalid data provided';
        errorMessage = `Version creation failed: ${errorDetail}`;
      } else if (error.response?.status === 500) {
        errorMessage = 'Server error occurred. Please try again later or contact support.';
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      setErrors({ submit: errorMessage });
    }
  };

  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen);
    if (!newOpen) {
      // Reset form when closing
      setSelectedTestCaseIds([]);
      setNewTestCases([]);
      setChangeSummary('');
      setErrors({});
      setShowAddForm(false);
      setNewTestCaseForm({
        name: '',
        type: 'llm',
        input: '',
        expected_output: '',
        context: [],
        retrieval_context: [],
        additional_metadata: {},
        is_global: false
      });
    }
  };

  const handleRemoveTestCase = (testCaseId: string) => {
    setSelectedTestCaseIds(prev => prev.filter(id => id !== testCaseId));
  };

  const handleAddNewTestCase = () => {
    if (!newTestCaseForm.name.trim()) {
      setErrors({ ...errors, newTestCase: 'Test case name is required' });
      return;
    }

    const tempId = `temp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const newTestCase: NewTestCase = {
      ...newTestCaseForm,
      tempId
    };

    setNewTestCases(prev => [...prev, newTestCase]);
    setNewTestCaseForm({
      name: '',
      type: 'llm',
      input: '',
      expected_output: '',
      context: [],
      retrieval_context: [],
      additional_metadata: {},
      is_global: false
    });
    setShowAddForm(false);
    setErrors({});
  };

  const handleRemoveNewTestCase = (tempId: string) => {
    setNewTestCases(prev => prev.filter(tc => tc.tempId !== tempId));
  };

  // Calculate changes from current version
  const currentTestCaseIds = currentVersionTestCases.map(tc => tc.id);
  const removedTestCases = currentTestCaseIds.filter(id => !selectedTestCaseIds.includes(id));
  const addedTestCases = newTestCases.length;

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        {trigger}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[700px] max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold text-slate-900">
            Create New Version
          </DialogTitle>
          <p className="text-sm text-slate-600">
            Modify test cases and create a new version of this dataset
          </p>
          {/* Temporary auth test button */}
          <div className="pt-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={testAuth}
              className="text-xs"
            >
              Test Authentication
            </Button>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0">
          {errors.submit && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-sm mb-4">
              {errors.submit}
            </div>
          )}

          <div className="space-y-5 flex-1 min-h-0 overflow-y-auto">
            {/* Current Test Cases */}
            <div className="space-y-3">
              <Label className="text-sm font-medium text-slate-700">
                Test Cases from Current Version ({selectedTestCases.length})
              </Label>

              {isLoadingCurrentTestCases ? (
                <div className="space-y-2">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="h-12 bg-slate-200 rounded animate-pulse"></div>
                  ))}
                </div>
              ) : selectedTestCases.length > 0 ? (
                <div className="border border-slate-300 rounded-md max-h-60 overflow-y-auto">
                  {selectedTestCases.map((testCase) => (
                    <div
                      key={testCase.id}
                      className="flex items-center justify-between p-3 hover:bg-slate-50 border-b border-slate-200 last:border-b-0"
                    >
                      <div className="flex-1 min-w-0">
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
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-1 bg-slate-100 text-slate-600 text-xs rounded font-mono">
                          {testCase.id.slice(-8)}
                        </span>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemoveTestCase(testCase.id)}
                          className="h-6 w-6 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <Minus className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-4 text-slate-500 border border-slate-300 rounded-md">
                  <p>No test cases from current version</p>
                </div>
              )}
            </div>

            {/* New Test Cases */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-medium text-slate-700">
                  New Test Cases ({newTestCases.length})
                </Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setShowAddForm(!showAddForm)}
                  className="h-7 px-2 text-xs"
                >
                  <Plus className="h-3 w-3 mr-1" />
                  Add New Test Case
                </Button>
              </div>

              {/* New Test Case Form */}
              {showAddForm && (
                <div className="border border-slate-300 rounded-md p-4 bg-slate-50">
                  <div className="space-y-3">
                    <div>
                      <Label className="text-xs font-medium text-slate-700">Name *</Label>
                      <input
                        type="text"
                        value={newTestCaseForm.name}
                        onChange={(e) => setNewTestCaseForm(prev => ({ ...prev, name: e.target.value }))}
                        className="w-full h-8 px-3 border border-slate-300 rounded-md focus:border-slate-400 focus:ring-2 focus:ring-slate-200 text-sm"
                        placeholder="Test case name"
                      />
                    </div>
                    
                    <div>
                      <Label className="text-xs font-medium text-slate-700">Type</Label>
                      <select
                        value={newTestCaseForm.type}
                        onChange={(e) => setNewTestCaseForm(prev => ({ ...prev, type: e.target.value as any }))}
                        className="w-full h-8 px-3 border border-slate-300 rounded-md focus:border-slate-400 focus:ring-2 focus:ring-slate-200 text-sm"
                      >
                        <option value="llm">LLM</option>
                        <option value="conversational">Conversational</option>
                        <option value="multimodal">Multimodal</option>
                      </select>
                    </div>

                    <div>
                      <Label className="text-xs font-medium text-slate-700">Input</Label>
                      <textarea
                        value={newTestCaseForm.input?.toString() || ''}
                        onChange={(e) => setNewTestCaseForm(prev => ({ ...prev, input: e.target.value }))}
                        className="w-full h-20 px-3 py-2 border border-slate-300 rounded-md focus:border-slate-400 focus:ring-2 focus:ring-slate-200 text-sm resize-none"
                        placeholder="Test input"
                      />
                    </div>

                    <div>
                      <Label className="text-xs font-medium text-slate-700">Expected Output</Label>
                      <textarea
                        value={newTestCaseForm.expected_output?.toString() || ''}
                        onChange={(e) => setNewTestCaseForm(prev => ({ ...prev, expected_output: e.target.value }))}
                        className="w-full h-20 px-3 py-2 border border-slate-300 rounded-md focus:border-slate-400 focus:ring-2 focus:ring-slate-200 text-sm resize-none"
                        placeholder="Expected output"
                      />
                    </div>

                    {errors.newTestCase && (
                      <p className="text-xs text-red-600">{errors.newTestCase}</p>
                    )}

                    <div className="flex items-center gap-2">
                      <Button
                        type="button"
                        onClick={handleAddNewTestCase}
                        disabled={isLoading}
                        className="h-7 px-3 text-xs bg-slate-900 hover:bg-slate-800"
                      >
                        Add Test Case
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => {
                          setShowAddForm(false);
                          setErrors({});
                        }}
                        className="h-7 px-3 text-xs"
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                </div>
              )}

              {/* New Test Cases List */}
              {newTestCases.length > 0 && (
                <div className="border border-slate-300 rounded-md max-h-60 overflow-y-auto">
                  {newTestCases.map((testCase) => (
                    <div
                      key={testCase.tempId}
                      className="flex items-center justify-between p-3 hover:bg-slate-50 border-b border-slate-200 last:border-b-0"
                    >
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-slate-900 truncate">
                          {testCase.name}
                        </p>
                        <p className="text-xs text-slate-500 truncate">
                          {testCase.input?.toString() || 'No input'}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded">
                          NEW
                        </span>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemoveNewTestCase(testCase.tempId)}
                          className="h-6 w-6 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Changes Summary */}
            {(addedTestCases > 0 || removedTestCases.length > 0) && (
              <div className="bg-slate-50 border border-slate-200 rounded-md p-4">
                <h4 className="text-sm font-medium text-slate-900 mb-2">Changes from Current Version</h4>
                <div className="space-y-1 text-sm">
                  {addedTestCases > 0 && (
                    <p className="text-green-700">
                      <span className="font-medium">+{addedTestCases}</span> new test case{addedTestCases !== 1 ? 's' : ''} will be created
                    </p>
                  )}
                  {removedTestCases.length > 0 && (
                    <p className="text-red-700">
                      <span className="font-medium">-{removedTestCases.length}</span> test case{removedTestCases.length !== 1 ? 's' : ''} removed
                    </p>
                  )}
                </div>
              </div>
            )}

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

            {errors.testCases && (
              <p className="text-sm text-red-600">{errors.testCases}</p>
            )}
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
              disabled={isLoading || (selectedTestCaseIds.length === 0 && newTestCases.length === 0)}
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