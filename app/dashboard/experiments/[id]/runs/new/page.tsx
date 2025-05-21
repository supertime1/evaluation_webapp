'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeftIcon, InformationCircleIcon } from '@heroicons/react/24/outline';
import { use } from 'react';

export default function NewRunPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const resolvedParams = use(params);
  const experimentId = resolvedParams.id;
  
  return (
    <div className="p-6 max-w-2xl mx-auto">
      <div className="flex items-center mb-6">
        <Link href={`/dashboard/experiments/${experimentId}`} className="text-slate-500 hover:text-slate-700 mr-4">
          <ArrowLeftIcon className="h-5 w-5" />
        </Link>
        <h1 className="text-2xl font-bold text-slate-800">Runs Information</h1>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <InformationCircleIcon className="h-5 w-5 text-blue-500 mr-2" />
            Automatic Run Creation
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-slate-700">
            Runs are automatically created by the LLM system being evaluated, not through the web interface.
          </p>
          
          <p className="text-slate-700">
            Each time the evaluation system is run with your test cases, a new run will be generated automatically
            and will appear in your experiment dashboard.
          </p>
          
          <div className="flex justify-end pt-4">
            <Button
              onClick={() => router.push(`/dashboard/experiments/${experimentId}`)}
              className="h-11 px-6 bg-slate-900 hover:bg-slate-800 text-white"
            >
              Return to Experiment
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 