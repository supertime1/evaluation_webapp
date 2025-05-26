'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';

export default function NewDatasetPage() {
  return (
    <div className="min-h-screen bg-white p-6">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Link href="/dashboard/datasets">
            <Button variant="outline" size="sm" className="flex items-center gap-2">
              <ArrowLeftIcon className="h-4 w-4" />
              Back to Datasets
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-slate-800">Create New Dataset</h1>
            <p className="text-sm text-slate-500 mt-2">
              Create a new collection of test cases with version control
            </p>
          </div>
        </div>

        {/* Placeholder Content */}
        <div className="bg-slate-50 border border-slate-200 rounded-lg p-8 text-center">
          <div className="max-w-md mx-auto">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-slate-400 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" />
            </svg>
            <h3 className="text-lg font-medium text-slate-900 mb-2">
              Dataset Creation Form
            </h3>
            <p className="text-slate-600 mb-6">
              This page will contain the dataset creation form with fields for name, description, 
              global/private settings, and initial test case selection. This will be implemented 
              in the next phase of development.
            </p>
            <div className="space-y-3 text-sm text-slate-500">
              <div className="flex items-center justify-center gap-2">
                <div className="w-2 h-2 bg-slate-300 rounded-full"></div>
                <span>Dataset name and description fields</span>
              </div>
              <div className="flex items-center justify-center gap-2">
                <div className="w-2 h-2 bg-slate-300 rounded-full"></div>
                <span>Global/Private visibility toggle</span>
              </div>
              <div className="flex items-center justify-center gap-2">
                <div className="w-2 h-2 bg-slate-300 rounded-full"></div>
                <span>Test case selection interface</span>
              </div>
              <div className="flex items-center justify-center gap-2">
                <div className="w-2 h-2 bg-slate-300 rounded-full"></div>
                <span>Initial version creation</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 