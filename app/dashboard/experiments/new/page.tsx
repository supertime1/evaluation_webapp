'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useCreateExperiment } from '@/lib/hooks/useExperimentManager';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';

export default function NewExperimentPage() {
  const router = useRouter();
  const { mutate: createExperiment, isPending, error } = useCreateExperiment();
  
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Basic validation
    if (!name.trim()) {
      return;
    }
    
    createExperiment(
      { 
        name, 
        description: description || undefined
      },
      {
        onSuccess: (data) => {
          router.push(`/dashboard/experiments/${data.id}`);
        }
      }
    );
  };
  
  return (
    <div className="p-6 max-w-2xl mx-auto">
      <div className="flex items-center mb-6">
        <Link href="/dashboard/experiments" className="text-slate-500 hover:text-slate-700 mr-4">
          <ArrowLeftIcon className="h-5 w-5" />
        </Link>
        <h1 className="text-2xl font-bold text-slate-800">Create New Experiment</h1>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Experiment Details</CardTitle>
          <CardDescription>Enter information about your new experiment</CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md mb-4">
              {error.message || 'An error occurred while creating the experiment.'}
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label 
                htmlFor="name" 
                className="block text-sm font-medium text-slate-700 mb-2"
              >
                Name <span className="text-red-500">*</span>
              </label>
              <input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="h-11 w-full rounded-md border border-slate-300 focus:border-slate-400 focus:ring-2 focus:ring-slate-200 px-4"
                placeholder="e.g., GPT-4 Evaluation"
                required
              />
            </div>
            
            <div>
              <label 
                htmlFor="description" 
                className="block text-sm font-medium text-slate-700 mb-2"
              >
                Description
              </label>
              <textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full rounded-md border border-slate-300 focus:border-slate-400 focus:ring-2 focus:ring-slate-200 px-4 py-2 h-32"
                placeholder="Describe the purpose of this experiment"
              />
            </div>
            
            <div className="flex justify-end space-x-2 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push('/dashboard/experiments')}
                className="h-11"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="h-11 px-6 bg-slate-900 hover:bg-slate-800 text-white"
                disabled={isPending || !name.trim()}
              >
                {isPending ? 'Creating...' : 'Create Experiment'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
} 