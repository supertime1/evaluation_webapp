'use client';

import { useState } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ExperimentEntity } from '@/lib/models';
import { ExperimentIdCopyButton } from '@/components/experiments/ExperimentIdCopyButton';
import { useDeleteExperiment, useUpdateExperiment } from '@/lib/hooks/useExperimentManager';
import { useRouter } from 'next/navigation';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { InformationCircleIcon } from '@heroicons/react/24/outline';

interface ExperimentDetailHeaderProps {
  experiment: ExperimentEntity;
  className?: string;
}

export function ExperimentDetailHeader({ experiment, className = '' }: ExperimentDetailHeaderProps) {
  console.log('ExperimentDetailHeader rendering with experiment:', experiment);
  
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showRunInfoDialog, setShowRunInfoDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [editFormData, setEditFormData] = useState({
    name: experiment.name,
    description: experiment.description || '',
  });
  const [editErrors, setEditErrors] = useState<Record<string, string>>({});
  
  const deleteMutation = useDeleteExperiment();
  const updateMutation = useUpdateExperiment();
  const router = useRouter();

  const handleDelete = async () => {
    try {
      setDeleteError(null);
      await deleteMutation.mutateAsync(experiment.id);
      setShowDeleteDialog(false);
      router.push('/dashboard/experiments');
    } catch (error: any) {
      const errorMessage = error.message || 'Failed to delete experiment. Please try again.';
      setDeleteError(errorMessage);
      
      if (error.name === 'BusinessRuleViolation') {
        console.info('Experiment deletion prevented by business rules:', errorMessage);
      } else {
        console.error('Unexpected error during experiment deletion:', error);
      }
    }
  };

  const handleCloseDialog = () => {
    setShowDeleteDialog(false);
    setDeleteError(null);
  };

  const handleShowRunInfo = () => {
    setShowRunInfoDialog(true);
  };

  const handleCloseRunInfoDialog = () => {
    setShowRunInfoDialog(false);
  };

  const handleShowEditDialog = () => {
    setEditFormData({
      name: experiment.name,
      description: experiment.description || '',
    });
    setEditErrors({});
    setShowEditDialog(true);
  };

  const handleCloseEditDialog = () => {
    setShowEditDialog(false);
    setEditErrors({});
  };

  const validateEditForm = () => {
    const newErrors: Record<string, string> = {};

    if (!editFormData.name.trim()) {
      newErrors.name = 'Experiment name is required';
    } else if (editFormData.name.length < 3) {
      newErrors.name = 'Experiment name must be at least 3 characters';
    } else if (editFormData.name.length > 100) {
      newErrors.name = 'Experiment name must be less than 100 characters';
    }

    if (editFormData.description && editFormData.description.length > 500) {
      newErrors.description = 'Description must be less than 500 characters';
    }

    setEditErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateEditForm()) {
      return;
    }

    try {
      // Create the update object with all required fields
      const updateData: { name?: string; description?: string } = {};
      
      // Only include fields that have changed
      if (editFormData.name !== experiment.name) {
        updateData.name = editFormData.name;
      }
      if (editFormData.description !== (experiment.description || '')) {
        updateData.description = editFormData.description || undefined;
      }

      // Only send the update if something changed
      const hasChanges = Object.keys(updateData).length > 0;
      if (hasChanges) {
        // Construct a proper ExperimentUpdate object
        const experimentUpdate = {
          name: updateData.name || experiment.name, // Use current name if not changed
          description: updateData.description !== undefined ? updateData.description : experiment.description
        };
        
        await updateMutation.mutateAsync({ id: experiment.id, data: experimentUpdate });
      }

      setShowEditDialog(false);
      setEditErrors({});
    } catch (error: any) {
      console.error('Failed to update experiment:', error);
      const errorMessage = error.message || 'Failed to update experiment. Please try again.';
      setEditErrors({ submit: errorMessage });
    }
  };

  return (
    <div className={`bg-white border border-slate-200 rounded-lg p-6 ${className}`}>
      
      <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
        {/* Experiment Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start gap-3 mb-3">
            <h1 className="text-2xl font-bold text-slate-800 break-words">
              {experiment.name}
            </h1>
          </div>
          
          {experiment.description && (
            <p className="text-sm text-slate-600 mb-4 leading-relaxed">
              {experiment.description}
            </p>
          )}
          
          <div className="space-y-2">
            <div className="flex items-center text-sm text-slate-500">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Created {formatDistanceToNow(new Date(experiment.created_at), { addSuffix: true })}
            </div>
            
            <div className="flex items-center text-sm text-slate-500">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Last updated {experiment.updated_at ? formatDistanceToNow(new Date(experiment.updated_at), { addSuffix: true }) : 'Unknown'}
            </div>
          </div>
          
          <div className="mt-4">
            <ExperimentIdCopyButton experimentId={experiment.id} />
          </div>
        </div>
        
        {/* Actions */}
        <div className="flex flex-col sm:flex-row lg:flex-col gap-3 lg:min-w-[200px]">
          <Button
            variant="outline"
            onClick={handleShowEditDialog}
            className="h-11 px-4"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
            Edit Experiment
          </Button>
          
          <Button
            variant="outline"
            onClick={handleShowRunInfo}
            className="h-11 px-4"
          >
            <InformationCircleIcon className="h-4 w-4 mr-2" />
            New Run
          </Button>
          
          <Button
            variant="outline"
            onClick={() => setShowDeleteDialog(true)}
            className="h-11 px-4 text-red-600 hover:text-red-700 hover:bg-red-50"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
            Delete
          </Button>
        </div>
      </div>

      {/* Edit Dialog */}
      {showEditDialog && (
        <Dialog open={showEditDialog} onOpenChange={handleCloseEditDialog}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle className="text-xl font-semibold text-slate-900">
                Edit Experiment
              </DialogTitle>
              <DialogDescription>
                Update the experiment name and description
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleEditSubmit} className="space-y-5">
              {editErrors.submit && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-sm">
                  {editErrors.submit}
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="edit-name" className="text-sm font-medium text-slate-700">
                  Experiment Name *
                </Label>
                <Input
                  id="edit-name"
                  type="text"
                  value={editFormData.name}
                  onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
                  className={`h-11 w-full ${
                    editErrors.name ? 'border-red-300 focus:border-red-400' : ''
                  }`}
                  placeholder="Enter experiment name"
                  disabled={updateMutation.isPending}
                />
                {editErrors.name && (
                  <p className="text-sm text-red-600">{editErrors.name}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-description" className="text-sm font-medium text-slate-700">
                  Description
                </Label>
                <textarea
                  id="edit-description"
                  value={editFormData.description}
                  onChange={(e) => setEditFormData({ ...editFormData, description: e.target.value })}
                  className={`w-full rounded-md border px-3 py-2 text-sm focus:ring-2 focus:ring-slate-200 min-h-[80px] ${
                    editErrors.description ? 'border-red-300 focus:border-red-400' : 'border-slate-300 focus:border-slate-400'
                  }`}
                  placeholder="Describe the purpose of this experiment (optional)"
                  disabled={updateMutation.isPending}
                />
                {editErrors.description && (
                  <p className="text-sm text-red-600">{editErrors.description}</p>
                )}
              </div>

              <DialogFooter>
                <Button 
                  type="button"
                  variant="outline" 
                  onClick={handleCloseEditDialog}
                  disabled={updateMutation.isPending}
                >
                  Cancel
                </Button>
                <Button 
                  type="submit"
                  disabled={updateMutation.isPending || !editFormData.name.trim()}
                  className="bg-slate-900 hover:bg-slate-800 text-white"
                >
                  {updateMutation.isPending ? 'Saving...' : 'Save Changes'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      )}

      {/* Delete Dialog */}
      {showDeleteDialog && (
        <Dialog open={showDeleteDialog} onOpenChange={handleCloseDialog}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Delete Experiment</DialogTitle>
              <DialogDescription>
                Are you sure you want to delete this experiment? This action cannot be undone and will also delete all associated runs.
              </DialogDescription>
            </DialogHeader>
            
            {deleteError && (
              <div className="bg-red-50 border border-red-200 rounded-md p-4 my-4">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-red-800">
                      Cannot Delete Experiment
                    </h3>
                    <div className="mt-2 text-sm text-red-700">
                      <p>{deleteError}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            <DialogFooter>
              {!deleteError ? (
                <>
                  <Button 
                    variant="outline" 
                    onClick={handleCloseDialog}
                  >
                    Cancel
                  </Button>
                  <Button 
                    onClick={handleDelete} 
                    disabled={deleteMutation.isPending}
                    className="bg-red-600 hover:bg-red-700 text-white"
                  >
                    {deleteMutation.isPending ? 'Deleting...' : 'Delete'}
                  </Button>
                </>
              ) : (
                <Button 
                  variant="outline" 
                  onClick={handleCloseDialog}
                >
                  Close
                </Button>
              )}
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Run Info Dialog */}
      {showRunInfoDialog && (
        <Dialog open={showRunInfoDialog} onOpenChange={handleCloseRunInfoDialog}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle className="flex items-center">
                <InformationCircleIcon className="h-5 w-5 text-blue-500 mr-2" />
                Automatic Run Creation
              </DialogTitle>
              <DialogDescription>
                How evaluation runs are created in this system
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4 py-4">
              <p className="text-slate-700">
                Runs are automatically created by the LLM system being evaluated, not through the web interface.
              </p>
              
              <p className="text-slate-700">
                Each time the evaluation system is run with your test cases, a new run will be generated automatically
                and will appear in your experiment dashboard.
              </p>
              
              <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <InformationCircleIcon className="h-5 w-5 text-blue-400" />
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-blue-800">
                      What happens when a run is created?
                    </h3>
                    <div className="mt-2 text-sm text-blue-700">
                      <ul className="list-disc list-inside space-y-1">
                        <li>Test cases are executed against your LLM</li>
                        <li>Metrics are calculated for each test result</li>
                        <li>Results are automatically saved to this experiment</li>
                        <li>Charts and summaries are updated in real-time</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <DialogFooter>
              <Button onClick={handleCloseRunInfoDialog}>
                Got it
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
} 