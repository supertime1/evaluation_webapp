'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { useCreateDataset, useUpdateDataset } from '@/lib/hooks/useDatasetManager';
import { Dataset, DatasetCreate, DatasetUpdate } from '@/lib/schemas/dataset';

interface DatasetCreateModalProps {
  trigger: React.ReactNode;
  dataset?: Dataset; // If provided, this is an edit modal
  onSuccess?: () => void;
}

export function DatasetCreateModal({ trigger, dataset, onSuccess }: DatasetCreateModalProps) {
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: dataset?.name || '',
    description: dataset?.description || '',
    is_global: dataset?.is_global || false,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const createMutation = useCreateDataset();
  const updateMutation = useUpdateDataset();

  const isEditing = !!dataset;
  const isLoading = createMutation.isPending || updateMutation.isPending;

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Dataset name is required';
    } else if (formData.name.length < 3) {
      newErrors.name = 'Dataset name must be at least 3 characters';
    } else if (formData.name.length > 100) {
      newErrors.name = 'Dataset name must be less than 100 characters';
    }

    if (formData.description && formData.description.length > 500) {
      newErrors.description = 'Description must be less than 500 characters';
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
      if (isEditing) {
        const updateData: DatasetUpdate = {
          name: formData.name !== dataset.name ? formData.name : undefined,
          description: formData.description !== dataset.description ? formData.description : undefined,
          is_global: formData.is_global !== dataset.is_global ? formData.is_global : undefined,
        };
        
        // Only send fields that have changed
        const hasChanges = Object.values(updateData).some(value => value !== undefined);
        if (hasChanges) {
          await updateMutation.mutateAsync({ datasetId: dataset.id, data: updateData });
        }
      } else {
        const createData: DatasetCreate = {
          name: formData.name,
          description: formData.description || undefined,
          is_global: formData.is_global,
        };
        await createMutation.mutateAsync(createData);
      }

      setOpen(false);
      setFormData({ name: '', description: '', is_global: false });
      setErrors({});
      onSuccess?.();
    } catch (error) {
      console.error('Failed to save dataset:', error);
      setErrors({ submit: 'Failed to save dataset. Please try again.' });
    }
  };

  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen);
    if (!newOpen) {
      // Reset form when closing
      setFormData({
        name: dataset?.name || '',
        description: dataset?.description || '',
        is_global: dataset?.is_global || false,
      });
      setErrors({});
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        {trigger}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold text-slate-900">
            {isEditing ? 'Edit Dataset' : 'Create New Dataset'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-5">
          {errors.submit && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-sm">
              {errors.submit}
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="name" className="text-sm font-medium text-slate-700">
              Dataset Name *
            </Label>
            <input
              id="name"
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className={`h-11 w-full rounded-md border px-3 py-2 text-sm focus:ring-2 focus:ring-slate-200 ${
                errors.name ? 'border-red-300 focus:border-red-400' : 'border-slate-300 focus:border-slate-400'
              }`}
              placeholder="Enter dataset name"
              disabled={isLoading}
            />
            {errors.name && (
              <p className="text-sm text-red-600">{errors.name}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description" className="text-sm font-medium text-slate-700">
              Description
            </Label>
            <textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className={`w-full rounded-md border px-3 py-2 text-sm focus:ring-2 focus:ring-slate-200 min-h-[80px] ${
                errors.description ? 'border-red-300 focus:border-red-400' : 'border-slate-300 focus:border-slate-400'
              }`}
              placeholder="Describe your dataset (optional)"
              disabled={isLoading}
            />
            {errors.description && (
              <p className="text-sm text-red-600">{errors.description}</p>
            )}
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label htmlFor="is_global" className="text-sm font-medium text-slate-700">
                Global Dataset
              </Label>
              <p className="text-xs text-slate-500">
                Make this dataset accessible to all users
              </p>
            </div>
            <Switch
              id="is_global"
              checked={formData.is_global}
              onCheckedChange={(checked) => setFormData({ ...formData, is_global: checked })}
              disabled={isLoading}
            />
          </div>

          <div className="flex justify-end gap-3 pt-4">
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
              disabled={isLoading}
              className="h-11 px-4 bg-slate-900 hover:bg-slate-800"
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  {isEditing ? 'Updating...' : 'Creating...'}
                </>
              ) : (
                isEditing ? 'Update Dataset' : 'Create Dataset'
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
} 