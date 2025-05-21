'use client';

import Link from 'next/link';
import { ArrowLeftIcon, InformationCircleIcon, LightBulbIcon, RocketLaunchIcon, SparklesIcon } from '@heroicons/react/24/outline';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function RunsInfoPage() {
  return (
    <div className="p-6 space-y-6">
      {/* Header with back button */}
      <div className="flex items-center mb-6">
        <Link href="/dashboard/experiments" className="text-slate-500 hover:text-slate-700 mr-4">
          <ArrowLeftIcon className="h-5 w-5" />
        </Link>
        <h1 className="text-2xl font-bold text-slate-800">About Runs in FortiEval</h1>
      </div>
      
      <Card className="border-blue-100">
        <CardHeader className="bg-blue-50 border-b border-blue-100">
          <div className="flex items-center">
            <InformationCircleIcon className="h-6 w-6 text-blue-600 mr-3" />
            <CardTitle>How Evaluation Runs Work</CardTitle>
          </div>
          <CardDescription>Understanding the automated evaluation process</CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          <p className="text-slate-700 mb-6">
            In FortiEval, evaluation runs are automatically created and executed by the LLM system rather than manually triggered through the web interface. This ensures consistent evaluation of your models against your defined test cases.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
              <div className="flex items-center mb-3">
                <RocketLaunchIcon className="h-5 w-5 text-blue-600 mr-2" />
                <h3 className="font-semibold">Automatic Triggering</h3>
              </div>
              <p className="text-sm text-slate-600">
                Runs are automatically triggered when your system detects changes in your model or test data repository.
              </p>
            </div>
            
            <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
              <div className="flex items-center mb-3">
                <SparklesIcon className="h-5 w-5 text-purple-600 mr-2" />
                <h3 className="font-semibold">Consistent Evaluation</h3>
              </div>
              <p className="text-sm text-slate-600">
                Each run consistently applies the same evaluation criteria, ensuring fair comparison between model versions.
              </p>
            </div>
            
            <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
              <div className="flex items-center mb-3">
                <LightBulbIcon className="h-5 w-5 text-amber-600 mr-2" />
                <h3 className="font-semibold">Insight Generation</h3>
              </div>
              <p className="text-sm text-slate-600">
                The system automatically generates insights by comparing performance metrics across runs.
              </p>
            </div>
          </div>
          
          <h3 className="font-semibold text-lg mb-3">Run Creation Process</h3>
          <ol className="space-y-4 text-slate-700 mb-6">
            <li className="flex">
              <span className="bg-blue-100 text-blue-800 rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0 mr-3">1</span>
              <div>
                <strong>Model Change Detection</strong>: The FortiEval system monitors your model repository for changes.
              </div>
            </li>
            <li className="flex">
              <span className="bg-blue-100 text-blue-800 rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0 mr-3">2</span>
              <div>
                <strong>Run Initialization</strong>: When changes are detected, a new run is automatically created.
              </div>
            </li>
            <li className="flex">
              <span className="bg-blue-100 text-blue-800 rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0 mr-3">3</span>
              <div>
                <strong>Evaluation Execution</strong>: The system executes all test cases against your model.
              </div>
            </li>
            <li className="flex">
              <span className="bg-blue-100 text-blue-800 rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0 mr-3">4</span>
              <div>
                <strong>Results Processing</strong>: Metrics are calculated and stored for comparison.
              </div>
            </li>
            <li className="flex">
              <span className="bg-blue-100 text-blue-800 rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0 mr-3">5</span>
              <div>
                <strong>Notification</strong>: Users are notified of completed evaluations and any significant performance changes.
              </div>
            </li>
          </ol>
          
          <div className="bg-amber-50 border border-amber-200 rounded-md p-4 text-amber-800">
            <h4 className="font-semibold flex items-center mb-2">
              <InformationCircleIcon className="h-5 w-5 mr-2" />
              Note
            </h4>
            <p className="text-sm">
              While runs are automatically created, you can still view detailed results and compare performance across runs through the web interface.
            </p>
          </div>
          
          {/* Metrics section */}
          <h3 className="font-semibold text-lg mt-8 mb-3">Evaluation Metrics</h3>
          <p className="text-slate-700 mb-4">
            FortiEval uses several key metrics to measure model performance:
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-white border border-slate-200 rounded-md p-4 shadow-sm">
              <h4 className="font-semibold text-blue-700 mb-2">Accuracy</h4>
              <p className="text-sm text-slate-600">
                Measures how accurately the model's responses match expected answers. Higher scores indicate better factual correctness.
              </p>
            </div>
            
            <div className="bg-white border border-slate-200 rounded-md p-4 shadow-sm">
              <h4 className="font-semibold text-indigo-700 mb-2">Completeness</h4>
              <p className="text-sm text-slate-600">
                Evaluates whether the model's response includes all necessary information or aspects required by the prompt.
              </p>
            </div>
            
            <div className="bg-white border border-slate-200 rounded-md p-4 shadow-sm">
              <h4 className="font-semibold text-purple-700 mb-2">Relevancy</h4>
              <p className="text-sm text-slate-600">
                Assesses how well the model's response addresses the specific question or prompt without irrelevant information.
              </p>
            </div>
          </div>
          
          <p className="text-slate-700 mb-4">
            These metrics are automatically calculated for each run and can be viewed in the metrics visualization on the experiment detail page.
            Tracking these metrics over time helps identify improvements or regressions in model performance.
          </p>
        </CardContent>
      </Card>
      
      <div className="flex justify-center mt-6">
        <Link href="/dashboard/experiments" className="text-blue-600 hover:text-blue-800 font-medium">
          Return to Experiments
        </Link>
      </div>
    </div>
  );
} 