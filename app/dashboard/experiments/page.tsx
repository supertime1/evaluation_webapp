'use client';

import { useRouter } from 'next/navigation';
import { useExperiments } from '@/lib/hooks/useExperimentManager';
import { useExperimentRuns } from '@/lib/hooks/useRunManager';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PlusIcon, BeakerIcon, RocketLaunchIcon, CalendarIcon } from '@heroicons/react/24/outline';
import { formatDistanceToNow } from 'date-fns';
import { ExperimentEntity } from '@/lib/models';

// Component for displaying experiment card with run information
function ExperimentCard({ experiment }: { experiment: ExperimentEntity }) {
  const router = useRouter();
  const { data: runs } = useExperimentRuns(experiment.id);
  
  // Calculate most recent run
  const mostRecentRun = runs?.length 
    ? [...runs].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())[0]
    : null;
    
  const handleExperimentClick = () => {
    router.push(`/dashboard/experiments/${experiment.id}`);
  };
  
  return (
    <Card 
      className="hover:shadow-md transition-shadow cursor-pointer"
      onClick={handleExperimentClick}
    >
      <CardHeader className="pb-2">
        <div>
          <CardTitle className="text-lg font-semibold text-slate-900">
            {experiment.name}
          </CardTitle>
          <CardDescription className="text-sm text-slate-500 mt-1">
            Created {formatDistanceToNow(new Date(experiment.created_at), { addSuffix: true })}
          </CardDescription>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-slate-700 line-clamp-2 h-10">
          {experiment.description || 'No description provided'}
        </p>
        <div className="mt-4 flex items-center text-xs text-slate-500">
          <BeakerIcon className="h-4 w-4 mr-1" />
          <span>ID: {experiment.id}</span>
        </div>
      </CardContent>
      <CardFooter className="border-t border-slate-100 pt-4 pb-3 px-6">
        <div className="w-full space-y-2 text-xs">
          <div className="flex justify-between items-center text-slate-500">
            <div className="flex items-center">
              <RocketLaunchIcon className="h-4 w-4 mr-1" />
              <span>{runs?.length || 0} {runs?.length === 1 ? 'run' : 'runs'}</span>
            </div>
            {mostRecentRun && (
              <div className="flex items-center">
                <CalendarIcon className="h-4 w-4 mr-1" />
                <span>Latest run: {formatDistanceToNow(new Date(mostRecentRun.created_at), { addSuffix: true })}</span>
              </div>
            )}
          </div>
        </div>
      </CardFooter>
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

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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