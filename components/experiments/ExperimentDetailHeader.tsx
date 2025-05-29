'use client';

import { useState } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { Button } from '@/components/ui/button';
import { ExperimentEntity } from '@/lib/models';
import { ExperimentIdCopyButton } from '@/components/experiments/ExperimentIdCopyButton';
import { useDeleteExperiment } from '@/lib/hooks/useExperimentManager';
import { useRouter } from 'next/navigation';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface ExperimentDetailHeaderProps {
  experiment: ExperimentEntity;
  className?: string;
}

export function ExperimentDetailHeader({ experiment, className = '' }: ExperimentDetailHeaderProps) {
  console.log('ExperimentDetailHeader rendering with experiment:', experiment);
  
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const deleteMutation = useDeleteExperiment();
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
            onClick={() => router.push(`/dashboard/experiments/${experiment.id}/edit`)}
            className="h-11 px-4"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
            Edit Experiment
          </Button>
          
          <Button
            variant="default"
            onClick={() => router.push(`/dashboard/experiments/${experiment.id}/runs/new`)}
            className="h-11 px-4"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            New Run
          </Button>
          
          <Button
            variant="outline"
            onClick={() => router.push(`/dashboard/experiments/${experiment.id}/settings`)}
            className="h-11 px-4"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            Settings
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
    </div>
  );
} 