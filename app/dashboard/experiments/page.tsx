'use client';

import { useRouter } from 'next/navigation';
import { useExperiments } from '@/lib/hooks/useExperimentManager';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PlusIcon, BeakerIcon, ClockIcon, XCircleIcon, CheckCircleIcon } from '@heroicons/react/24/outline';
import { formatDistanceToNow } from 'date-fns';

export default function ExperimentsPage() {
  const router = useRouter();
  const { data: experiments, isLoading, error } = useExperiments();

  // Handle navigation to experiment details
  const handleExperimentClick = (experimentId: string) => {
    router.push(`/dashboard/experiments/${experimentId}`);
  };

  // Function to get status icon
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircleIcon className="h-5 w-5 text-green-500" />;
      case 'running':
        return <ClockIcon className="h-5 w-5 text-blue-500 animate-pulse" />;
      case 'failed':
        return <XCircleIcon className="h-5 w-5 text-red-500" />;
      default:
        return <ClockIcon className="h-5 w-5 text-slate-400" />;
    }
  };

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
            <Card 
              key={experiment.id} 
              className="hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => handleExperimentClick(experiment.id)}
            >
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg font-semibold text-slate-900">
                      {experiment.name}
                    </CardTitle>
                    <CardDescription className="text-sm text-slate-500 mt-1">
                      Created {formatDistanceToNow(new Date(experiment.created_at), { addSuffix: true })}
                    </CardDescription>
                  </div>
                  {getStatusIcon(experiment.status)}
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-slate-700 line-clamp-2 h-10">
                  {experiment.description || 'No description provided'}
                </p>
                <div className="mt-4 flex items-center text-xs text-slate-500">
                  <BeakerIcon className="h-4 w-4 mr-1" />
                  <span>
                    ID: {experiment.id}
                  </span>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
} 