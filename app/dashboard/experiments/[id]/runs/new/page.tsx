'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useCreateRun } from '@/lib/hooks/useRunManager';
import { useExperiment } from '@/lib/hooks/useExperimentManager';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';
import { use } from 'react';

export default function NewRunPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const resolvedParams = use(params);
  const experimentId = resolvedParams.id;
  
  const { data: experiment, isLoading, error: experimentError } = useExperiment(experimentId);
  const { mutate: createRun, isPending, error } = useCreateRun();
  
  const [gitCommit, setGitCommit] = useState('');
  const [hyperparameters, setHyperparameters] = useState('');
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Basic validation
    if (!gitCommit.trim()) {
      return;
    }
    
    // Parse hyperparameters - this is a simplified version
    let parsedHyperparameters = {};
    try {
      if (hyperparameters.trim()) {
        parsedHyperparameters = JSON.parse(hyperparameters);
      }
    } catch (err) {
      alert('Invalid JSON format for hyperparameters');
      return;
    }
    
    createRun(
      { 
        experiment_id: experimentId,
        git_commit: gitCommit,
        hyperparameters: parsedHyperparameters
      },
      {
        onSuccess: (data) => {
          router.push(`/dashboard/experiments/${experimentId}/runs/${data.id}`);
        }
      }
    );
  };
  
  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="animate-spin h-10 w-10 border-4 border-blue-500 rounded-full border-t-transparent"></div>
      </div>
    );
  }
  
  if (experimentError || !experiment) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md m-6">
        {experimentError ? `Error: ${experimentError.message}` : 'Experiment not found'}
      </div>
    );
  }
  
  return (
    <div className="p-6 max-w-2xl mx-auto">
      <div className="flex items-center mb-6">
        <Link href={`/dashboard/experiments/${experimentId}`} className="text-slate-500 hover:text-slate-700 mr-4">
          <ArrowLeftIcon className="h-5 w-5" />
        </Link>
        <h1 className="text-2xl font-bold text-slate-800">Create New Run</h1>
      </div>
      
      <Card className="mb-6">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">Experiment: {experiment.name}</CardTitle>
          <CardDescription>{experiment.description || 'No description provided'}</CardDescription>
        </CardHeader>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Run Details</CardTitle>
          <CardDescription>Enter information for this evaluation run</CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md mb-4">
              {error.message || 'An error occurred while creating the run.'}
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label 
                htmlFor="git-commit" 
                className="block text-sm font-medium text-slate-700 mb-2"
              >
                Git Commit <span className="text-red-500">*</span>
              </label>
              <input
                id="git-commit"
                type="text"
                value={gitCommit}
                onChange={(e) => setGitCommit(e.target.value)}
                className="h-11 w-full rounded-md border border-slate-300 focus:border-slate-400 focus:ring-2 focus:ring-slate-200 px-4"
                placeholder="e.g., 8f4d76b2"
                required
              />
              <p className="text-xs text-slate-500 mt-1">
                The specific git commit hash for this evaluation run
              </p>
            </div>
            
            <div>
              <label 
                htmlFor="hyperparameters" 
                className="block text-sm font-medium text-slate-700 mb-2"
              >
                Hyperparameters (JSON format)
              </label>
              <textarea
                id="hyperparameters"
                value={hyperparameters}
                onChange={(e) => setHyperparameters(e.target.value)}
                className="w-full rounded-md border border-slate-300 focus:border-slate-400 focus:ring-2 focus:ring-slate-200 px-4 py-2 h-32 font-mono"
                placeholder='{"model": "gpt-4", "temperature": 0.7}'
              />
              <p className="text-xs text-slate-500 mt-1">
                Any model parameters or settings in JSON format
              </p>
            </div>
            
            <div className="flex justify-end space-x-2 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push(`/dashboard/experiments/${experimentId}`)}
                className="h-11"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="h-11 px-6 bg-slate-900 hover:bg-slate-800 text-white"
                disabled={isPending || !gitCommit.trim()}
              >
                {isPending ? 'Creating...' : 'Create Run'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
} 