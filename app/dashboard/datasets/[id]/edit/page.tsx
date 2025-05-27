'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Save, X } from 'lucide-react';
import { useDataset, useUpdateDataset } from '@/lib/hooks/useDatasetManager';
import { DatasetUpdate } from '@/lib/schemas/dataset';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';

interface EditDatasetPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default function EditDatasetPage({ params }: EditDatasetPageProps) {
  const router = useRouter();
  const resolvedParams = React.use(params);
  const { data: dataset, isLoading, error } = useDataset(resolvedParams.id);
  const updateDatasetMutation = useUpdateDataset();

  const [formData, setFormData] = useState<DatasetUpdate>({
    name: '',
    description: '',
    is_global: false,
  });

  const [hasInitialized, setHasInitialized] = useState(false);

  // Initialize form data when dataset loads
  React.useEffect(() => {
    if (dataset && !hasInitialized) {
      setFormData({
        name: dataset.name,
        description: dataset.description || '',
        is_global: dataset.is_global,
      });
      setHasInitialized(true);
    }
  }, [dataset, hasInitialized]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!dataset) return;

    try {
      await updateDatasetMutation.mutateAsync({
        datasetId: dataset.id,
        data: formData,
      });
      
      router.push(`/dashboard/datasets/${resolvedParams.id}`);
    } catch (error) {
      console.error('Error updating dataset:', error);
    }
  };

  const handleCancel = () => {
    router.back();
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

  if (error || !dataset) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <Button variant="ghost" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <h1 className="text-2xl font-bold text-slate-900">Edit Dataset</h1>
        </div>
        
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
          {error ? `Error loading dataset: ${error.message}` : 'Dataset not found'}
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
        <h1 className="text-2xl font-bold text-slate-900">Edit Dataset</h1>
      </div>

      {/* Form */}
      <Card className="p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Dataset Name */}
          <div>
            <Label htmlFor="name" className="block text-sm font-medium text-slate-700 mb-2">
              Dataset Name *
            </Label>
            <input
              type="text"
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full h-11 px-3 border border-slate-300 rounded-md focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
              placeholder="Enter dataset name"
              required
            />
          </div>

          {/* Description */}
          <div>
            <Label htmlFor="description" className="block text-sm font-medium text-slate-700 mb-2">
              Description
            </Label>
            <textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={4}
              className="w-full px-3 py-2 border border-slate-300 rounded-md focus:border-slate-400 focus:ring-2 focus:ring-slate-200 resize-none"
              placeholder="Describe the purpose and contents of this dataset"
            />
          </div>

          {/* Global Dataset Toggle */}
          <div className="flex items-center justify-between p-4 border border-slate-200 rounded-md">
            <div>
              <Label htmlFor="is_global" className="text-sm font-medium text-slate-900">
                Global Dataset
              </Label>
              <p className="text-sm text-slate-600 mt-1">
                Make this dataset available to all users in the organization
              </p>
            </div>
            <Switch
              id="is_global"
              checked={formData.is_global}
              onCheckedChange={(checked) => setFormData({ ...formData, is_global: checked })}
            />
          </div>

          {/* Current Values Display */}
          <div className="bg-slate-50 p-4 rounded-md">
            <h3 className="text-sm font-medium text-slate-900 mb-2">Current Dataset Info</h3>
            <div className="space-y-1 text-sm text-slate-600">
              <p><span className="font-medium">ID:</span> {dataset.id}</p>
              <p><span className="font-medium">Created:</span> {new Date(dataset.created_at).toLocaleDateString()}</p>
              <p><span className="font-medium">Last Updated:</span> {new Date(dataset.updated_at).toLocaleDateString()}</p>
              {dataset.current_version_id && (
                <p><span className="font-medium">Current Version:</span> {dataset.current_version_id}</p>
              )}
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex items-center gap-3 pt-4 border-t border-slate-200">
            <Button
              type="submit"
              disabled={updateDatasetMutation.isPending || !formData.name?.trim()}
              className="gap-2"
            >
              <Save className="h-4 w-4" />
              {updateDatasetMutation.isPending ? 'Saving...' : 'Save Changes'}
            </Button>
            
            <Button
              type="button"
              variant="outline"
              onClick={handleCancel}
              disabled={updateDatasetMutation.isPending}
              className="gap-2"
            >
              <X className="h-4 w-4" />
              Cancel
            </Button>
          </div>

          {/* Error Display */}
          {updateDatasetMutation.error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
              Error updating dataset: {updateDatasetMutation.error.message}
            </div>
          )}
        </form>
      </Card>
    </div>
  );
} 