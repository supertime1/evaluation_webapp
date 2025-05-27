'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Save, X, Trash2, ExternalLink } from 'lucide-react';
import { useDataset } from '@/lib/hooks/useDatasetManager';
import { useTestCase, useUpdateTestCase, useDeleteTestCase } from '@/lib/hooks/useTestCaseManager';
import { TestCaseUpdate, TestCase } from '@/lib/schemas/testCase';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { TestCaseDatasetManager } from '@/components/datasets';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

interface EditTestCasePageProps {
  params: Promise<{
    id: string;
    testCaseId: string;
  }>;
}

export default function EditTestCasePage({ params }: EditTestCasePageProps) {
  const router = useRouter();
  const resolvedParams = React.use(params);
  const { data: dataset } = useDataset(resolvedParams.id);
  const { data: testCase, isLoading, error } = useTestCase(resolvedParams.testCaseId);
  const updateTestCaseMutation = useUpdateTestCase();
  const deleteTestCaseMutation = useDeleteTestCase();

  const [formData, setFormData] = useState<TestCaseUpdate>({
    name: '',
    type: 'llm',
    input: '',
    expected_output: '',
    context: [],
    retrieval_context: [],
    additional_metadata: {},
    is_global: false,
  });

  const [contextInput, setContextInput] = useState('');
  const [retrievalContextInput, setRetrievalContextInput] = useState('');
  const [metadataInput, setMetadataInput] = useState('{}');
  const [hasInitialized, setHasInitialized] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  // Initialize form data when test case loads
  React.useEffect(() => {
    if (testCase && !hasInitialized) {
      setFormData({
        name: testCase.name,
        type: testCase.type,
        input: testCase.input,
        expected_output: testCase.expected_output || '',
        context: testCase.context || [],
        retrieval_context: testCase.retrieval_context || [],
        additional_metadata: testCase.additional_metadata || {},
        is_global: testCase.is_global,
      });

      setContextInput((testCase.context || []).join('\n'));
      setRetrievalContextInput((testCase.retrieval_context || []).join('\n'));
      setMetadataInput(JSON.stringify(testCase.additional_metadata || {}, null, 2));
      setHasInitialized(true);
    }
  }, [testCase, hasInitialized]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!testCase) return;

    try {
      // Parse context arrays
      const context = contextInput
        .split('\n')
        .map(line => line.trim())
        .filter(line => line.length > 0);
      
      const retrieval_context = retrievalContextInput
        .split('\n')
        .map(line => line.trim())
        .filter(line => line.length > 0);

      // Parse metadata
      let additional_metadata = {};
      if (metadataInput.trim()) {
        try {
          additional_metadata = JSON.parse(metadataInput);
        } catch (error) {
          throw new Error('Invalid JSON in additional metadata');
        }
      }

      const updateData: TestCaseUpdate = {
        ...formData,
        context: context.length > 0 ? context : undefined,
        retrieval_context: retrieval_context.length > 0 ? retrieval_context : undefined,
        additional_metadata: Object.keys(additional_metadata).length > 0 ? additional_metadata : undefined,
      };

      await updateTestCaseMutation.mutateAsync({
        id: testCase.id,
        data: updateData,
      });
      
      router.push(`/dashboard/datasets/${resolvedParams.id}/test-cases`);
    } catch (error) {
      console.error('Error updating test case:', error);
    }
  };

  const handleDelete = async () => {
    if (!testCase) return;

    try {
      await deleteTestCaseMutation.mutateAsync(testCase.id);
      setShowDeleteDialog(false);
      router.push(`/dashboard/datasets/${resolvedParams.id}/test-cases`);
    } catch (error) {
      console.error('Error deleting test case:', error);
    }
  };

  const handleCancel = () => {
    router.back();
  };

  const handleViewStandalone = () => {
    window.open(`/dashboard/test-cases/${resolvedParams.testCaseId}`, '_blank');
  };

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

  if (error || !testCase) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <Button variant="ghost" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <h1 className="text-2xl font-bold text-slate-900">Edit Test Case</h1>
        </div>
        
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
          {error ? `Error loading test case: ${error.message}` : 'Test case not found'}
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
            <h1 className="text-2xl font-bold text-slate-900">Edit Test Case</h1>
            {dataset && (
              <p className="text-slate-600">
                In dataset: <span className="font-medium">{dataset.name}</span>
              </p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={handleViewStandalone}
            className="gap-2"
          >
            <ExternalLink className="h-4 w-4" />
            View Standalone
          </Button>
          
          <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
            <DialogTrigger asChild>
              <Button variant="outline" className="gap-2 text-red-600 hover:text-red-700">
                <Trash2 className="h-4 w-4" />
                Delete
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Delete Test Case</DialogTitle>
                <DialogDescription>
                  Are you sure you want to delete "{testCase.name}"? This action cannot be undone.
                </DialogDescription>
              </DialogHeader>

              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setShowDeleteDialog(false)}
                  disabled={deleteTestCaseMutation.isPending}
                >
                  Cancel
                </Button>
                <Button
                  variant="destructive"
                  onClick={handleDelete}
                  disabled={deleteTestCaseMutation.isPending}
                >
                  {deleteTestCaseMutation.isPending ? 'Deleting...' : 'Delete Test Case'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Test Case Info */}
      <Card className="p-4">
        <div className="flex items-center gap-2 mb-2">
          <h3 className="font-medium text-slate-900">{testCase.name}</h3>
          <Badge variant="secondary" className="text-xs">{testCase.type}</Badge>
          {testCase.is_global && (
            <Badge variant="outline" className="text-xs">Global</Badge>
          )}
        </div>
        <div className="flex items-center gap-4 text-xs text-slate-500">
          <span>ID: {testCase.id}</span>
          <span>Created: {new Date(testCase.created_at).toLocaleDateString()}</span>
          <span>Updated: {testCase.updated_at ? new Date(testCase.updated_at).toLocaleDateString() : 'Never'}</span>
        </div>
      </Card>

      {/* Form */}
      <Card className="p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Test Case Name */}
          <div>
            <Label htmlFor="name" className="block text-sm font-medium text-slate-700 mb-2">
              Test Case Name *
            </Label>
            <input
              type="text"
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full h-11 px-3 border border-slate-300 rounded-md focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
              placeholder="Enter test case name"
              required
            />
          </div>

          {/* Test Case Type */}
          <div>
            <Label htmlFor="type" className="block text-sm font-medium text-slate-700 mb-2">
              Test Case Type *
            </Label>
            <select
              id="type"
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value })}
              className="w-full h-11 px-3 border border-slate-300 rounded-md focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
              required
            >
              <option value="llm">LLM</option>
              <option value="conversational">Conversational</option>
              <option value="multimodal">Multimodal</option>
            </select>
          </div>

          {/* Input */}
          <div>
            <Label htmlFor="input" className="block text-sm font-medium text-slate-700 mb-2">
              Input
            </Label>
            <textarea
              id="input"
              value={formData.input as string}
              onChange={(e) => setFormData({ ...formData, input: e.target.value })}
              rows={4}
              className="w-full px-3 py-2 border border-slate-300 rounded-md focus:border-slate-400 focus:ring-2 focus:ring-slate-200 resize-none font-mono text-sm"
              placeholder="Enter the input for this test case"
            />
          </div>

          {/* Expected Output */}
          <div>
            <Label htmlFor="expected_output" className="block text-sm font-medium text-slate-700 mb-2">
              Expected Output
            </Label>
            <textarea
              id="expected_output"
              value={formData.expected_output}
              onChange={(e) => setFormData({ ...formData, expected_output: e.target.value })}
              rows={4}
              className="w-full px-3 py-2 border border-slate-300 rounded-md focus:border-slate-400 focus:ring-2 focus:ring-slate-200 resize-none font-mono text-sm"
              placeholder="Enter the expected output for this test case"
            />
          </div>

          {/* Context */}
          <div>
            <Label htmlFor="context" className="block text-sm font-medium text-slate-700 mb-2">
              Context
            </Label>
            <textarea
              id="context"
              value={contextInput}
              onChange={(e) => setContextInput(e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-slate-300 rounded-md focus:border-slate-400 focus:ring-2 focus:ring-slate-200 resize-none font-mono text-sm"
              placeholder="Enter context items (one per line)"
            />
          </div>

          {/* Retrieval Context */}
          <div>
            <Label htmlFor="retrieval_context" className="block text-sm font-medium text-slate-700 mb-2">
              Retrieval Context
            </Label>
            <textarea
              id="retrieval_context"
              value={retrievalContextInput}
              onChange={(e) => setRetrievalContextInput(e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-slate-300 rounded-md focus:border-slate-400 focus:ring-2 focus:ring-slate-200 resize-none font-mono text-sm"
              placeholder="Enter retrieval context items (one per line)"
            />
          </div>

          {/* Additional Metadata */}
          <div>
            <Label htmlFor="metadata" className="block text-sm font-medium text-slate-700 mb-2">
              Additional Metadata (JSON)
            </Label>
            <textarea
              id="metadata"
              value={metadataInput}
              onChange={(e) => setMetadataInput(e.target.value)}
              rows={4}
              className="w-full px-3 py-2 border border-slate-300 rounded-md focus:border-slate-400 focus:ring-2 focus:ring-slate-200 resize-none font-mono text-sm"
              placeholder='{"key": "value"}'
            />
          </div>

          {/* Global Test Case Toggle */}
          <div className="flex items-center justify-between p-4 border border-slate-200 rounded-md">
            <div>
              <Label htmlFor="is_global" className="text-sm font-medium text-slate-900">
                Global Test Case
              </Label>
              <p className="text-sm text-slate-600 mt-1">
                Make this test case available to all users in the organization
              </p>
            </div>
            <Switch
              id="is_global"
              checked={formData.is_global}
              onCheckedChange={(checked) => setFormData({ ...formData, is_global: checked })}
            />
          </div>

          {/* Form Actions */}
          <div className="flex items-center gap-3 pt-4 border-t border-slate-200">
            <Button
              type="submit"
              disabled={updateTestCaseMutation.isPending || !formData.name?.trim()}
              className="gap-2"
            >
              <Save className="h-4 w-4" />
              {updateTestCaseMutation.isPending ? 'Saving...' : 'Save Changes'}
            </Button>
            
            <Button
              type="button"
              variant="outline"
              onClick={handleCancel}
              disabled={updateTestCaseMutation.isPending}
              className="gap-2"
            >
              <X className="h-4 w-4" />
              Cancel
            </Button>
          </div>

          {/* Error Display */}
          {updateTestCaseMutation.error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
              Error updating test case: {updateTestCaseMutation.error.message}
            </div>
          )}
        </form>
      </Card>

      {/* Dataset Relationships */}
      <TestCaseDatasetManager testCase={testCase as TestCase} />
    </div>
  );
} 