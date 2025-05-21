'use client';

import { useRouter } from 'next/navigation';
import { ComponentProps } from 'react';
import { useExperiments } from '@/lib/hooks/useExperimentManager';
import { useExperimentRuns } from '@/lib/hooks/useRunManager';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PlusIcon, RocketLaunchIcon, CalendarIcon } from '@heroicons/react/24/outline';
import { formatDistanceToNow } from 'date-fns';
import { ExperimentEntity } from '@/lib/models';
import { cn } from '@/lib/utils';

// Component for displaying experiment card with run information
function ExperimentCard({ experiment, className, ...props }: { experiment: ExperimentEntity } & ComponentProps<typeof Card>) {
  const router = useRouter();
  const { data: runs } = useExperimentRuns(experiment.id);
  
  // Calculate most recent run
  const mostRecentRun = runs?.length 
    ? [...runs].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())[0]
    : null;
    
  const handleExperimentClick = () => {
    router.push(`/dashboard/experiments/${experiment.id}`);
  };

  // Calculate run statistics  
  const runCount = runs?.length || 0;
  const hasRuns = runCount > 0;
  
  return (
    <Card 
      className={cn("hover:shadow-md transition-all cursor-pointer border-slate-200 overflow-hidden h-full", className)}
      onClick={handleExperimentClick}
      {...props}
    >
      <CardHeader className="p-5 pb-0 flex flex-row justify-between items-start">
        <CardTitle className="text-lg font-semibold text-slate-900 line-clamp-1 mr-4">
          {experiment.name}
        </CardTitle>
        <span className="text-xs text-slate-500 whitespace-nowrap">
          {formatDistanceToNow(new Date(experiment.created_at), { addSuffix: true })}
        </span>
      </CardHeader>
      
      <CardContent className="p-5 flex flex-col h-full">
        {/* Description */}
        <p className="text-sm text-slate-600 mb-5 line-clamp-2 flex-grow">
          {experiment.description || 'No description provided'}
        </p>
        
        {/* Metadata */}
        <div className="grid grid-cols-2 gap-x-6 gap-y-3 text-sm">
          {/* Run count */}
          <div>
            <p className="text-slate-500 text-xs flex items-center">
              <RocketLaunchIcon className="h-3 w-3 mr-1" />
              RUNS
            </p>
            <p className="text-slate-700 font-medium">
              {runCount} {runCount === 1 ? 'run' : 'runs'}
            </p>
          </div>
          
          {/* Latest run */}
          <div>
            <p className="text-slate-500 text-xs flex items-center">
              <CalendarIcon className="h-3 w-3 mr-1" />
              LATEST RUN
            </p>
            <p className="text-slate-700 font-medium">
              {mostRecentRun 
                ? formatDistanceToNow(new Date(mostRecentRun.created_at), { addSuffix: true })
                : 'None yet'}
            </p>
          </div>
          
          {/* ID + Status pill */}
          <div className="col-span-2 flex justify-between items-center mt-3 pt-3 border-t border-slate-100">
            <span className="text-xs text-slate-500 font-mono">
              {experiment.id}
            </span>
            
            <span className={cn(
              "px-2 py-0.5 rounded-full text-xs font-medium",
              hasRuns ? "bg-blue-50 text-blue-700" : "bg-slate-100 text-slate-600"
            )}>
              {hasRuns ? "Active" : "No runs"}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function ExperimentsPage() {
  const router = useRouter();
  const { data: experiments, isLoading, error } = useExperiments();

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="animate-spin h-10 w-10 border-4 border-blue-500 rounded-full border-t-transparent"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md m-6">
        Error loading experiments: {error.message}
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-slate-800">Experiments</h1>
        <Button 
          className="h-11 bg-slate-900 hover:bg-slate-800 text-white"
          onClick={() => router.push('/dashboard/experiments/new')}
        >
          <PlusIcon className="h-5 w-5 mr-2" />
          New Experiment
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {experiments?.length === 0 ? (
          <div className="col-span-full text-center py-10 text-slate-500">
            No experiments found. Create your first experiment.
          </div>
        ) : (
          experiments?.map((experiment) => (
            <ExperimentCard key={experiment.id} experiment={experiment} />
          ))
        )}
      </div>
    </div>
  );
} 