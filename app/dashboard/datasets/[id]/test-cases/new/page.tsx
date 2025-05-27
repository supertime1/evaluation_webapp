'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Save, X, Image as ImageIcon } from 'lucide-react';
import { useDataset } from '@/lib/hooks/useDatasetManager';
import { useCreateTestCase } from '@/lib/hooks/useTestCaseManager';
import { useAddTestCaseToDataset } from '@/lib/hooks/useDatasetManager';
import { TestCaseCreate, TestCaseType } from '@/lib/schemas/testCase';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';

interface NewTestCasePageProps {
  params: Promise<{
    id: string;
  }>;
}

export default function NewTestCasePage({ params }: NewTestCasePageProps) {
  const router = useRouter();
  const resolvedParams = React.use(params);
  const { data: dataset, isLoading: datasetLoading, error: datasetError } = useDataset(resolvedParams.id);
  const createTestCaseMutation = useCreateTestCase();
  const addToDatasetMutation = useAddTestCaseToDataset();

  const [formData, setFormData] = useState<TestCaseCreate>({
    name: '',
    type: TestCaseType.LLM,
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
  const [addToDataset, setAddToDataset] = useState(true);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
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

      const testCaseData: TestCaseCreate = {
        ...formData,
        context: context.length > 0 ? context : undefined,
        retrieval_context: retrieval_context.length > 0 ? retrieval_context : undefined,
        additional_metadata: Object.keys(additional_metadata).length > 0 ? additional_metadata : undefined,
      };

      // Create the test case
      const createdTestCase = await createTestCaseMutation.mutateAsync(testCaseData);
      
      // Add to dataset if requested
      if (addToDataset && dataset) {
        await addToDatasetMutation.mutateAsync({
          datasetId: dataset.id,
          testCaseId: createdTestCase.id,
        });
      }
      
      router.push(`/dashboard/datasets/${resolvedParams.id}/test-cases`);
    } catch (error) {
      console.error('Error creating test case:', error);
    }
  };

  const handleCancel = () => {
    router.back();
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
          <h1 className="text-2xl font-bold text-slate-900">Create Test Case</h1>
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
      <div className="flex items-center gap-3">
        <Button variant="ghost" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Create Test Case</h1>
          <p className="text-slate-600">
            For dataset: <span className="font-medium">{dataset.name}</span>
          </p>
        </div>
      </div>

      {/* Dataset Info */}
      <Card className="p-4">
        <div className="flex items-center gap-2">
          <h3 className="font-medium text-slate-900">{dataset.name}</h3>
          {dataset.is_global && (
            <Badge variant="outline" className="text-xs">Global</Badge>
          )}
        </div>
        {dataset.description && (
          <p className="text-sm text-slate-600 mt-1">{dataset.description}</p>
        )}
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
              onChange={(e) => setFormData({ ...formData, type: e.target.value as TestCaseType })}
              className="w-full h-11 px-3 border border-slate-300 rounded-md focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
              required
            >
              <option value={TestCaseType.LLM}>LLM</option>
              <option value={TestCaseType.CONVERSATIONAL}>Conversational</option>
              <option value={TestCaseType.MULTIMODAL}>Multimodal</option>
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
            {formData.type === TestCaseType.MULTIMODAL && (
              <p className="text-xs text-slate-500 mt-1">
                <ImageIcon className="h-3 w-3 inline mr-1" />
                For multimodal inputs, you can include image URLs or use the API to upload images
              </p>
            )}
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
            <p className="text-xs text-slate-500 mt-1">
              Enter each context item on a separate line
            </p>
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
            <p className="text-xs text-slate-500 mt-1">
              Enter each retrieval context item on a separate line
            </p>
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
            <p className="text-xs text-slate-500 mt-1">
              Enter valid JSON for additional metadata
            </p>
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

          {/* Add to Dataset Toggle */}
          <div className="flex items-center justify-between p-4 border border-slate-200 rounded-md">
            <div>
              <Label htmlFor="add_to_dataset" className="text-sm font-medium text-slate-900">
                Add to Dataset
              </Label>
              <p className="text-sm text-slate-600 mt-1">
                Automatically add this test case to "{dataset.name}" after creation
              </p>
            </div>
            <Switch
              id="add_to_dataset"
              checked={addToDataset}
              onCheckedChange={setAddToDataset}
            />
          </div>

          {/* Form Actions */}
          <div className="flex items-center gap-3 pt-4 border-t border-slate-200">
            <Button
              type="submit"
              disabled={createTestCaseMutation.isPending || !formData.name?.trim()}
              className="gap-2"
            >
              <Save className="h-4 w-4" />
              {createTestCaseMutation.isPending ? 'Creating...' : 'Create Test Case'}
            </Button>
            
            <Button
              type="button"
              variant="outline"
              onClick={handleCancel}
              disabled={createTestCaseMutation.isPending}
              className="gap-2"
            >
              <X className="h-4 w-4" />
              Cancel
            </Button>
          </div>

          {/* Error Display */}
          {(createTestCaseMutation.error || addToDatasetMutation.error) && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
              Error: {createTestCaseMutation.error?.message || addToDatasetMutation.error?.message}
            </div>
          )}
        </form>
      </Card>
    </div>
  );
} 