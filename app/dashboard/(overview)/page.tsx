'use client';

import { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { useExperiments } from '@/lib/hooks/useExperimentManager';
import { useDatasets } from '@/lib/hooks/useDatasetManager';
import { formatDistanceToNow } from 'date-fns';

type SyncStatus = 'loading' | 'success' | 'error';

export default function DashboardPage() {
    const [isRefreshingPrograms, setIsRefreshingPrograms] = useState(false);
    const [isRefreshingMembers, setIsRefreshingMembers] = useState(false);
    const [syncStatus, setSyncStatus] = useState<SyncStatus>('loading');
    const [syncError, setSyncError] = useState<string | null>(null);
    const [userName, setUserName] = useState<string>('');
    const memberListRef = useRef<{ refresh: () => Promise<void> }>(null);
    const programListRef = useRef<{ refresh: () => Promise<void> }>(null);
    
    // Fetch experiments and datasets using the hooks
    const { data: experiments, isLoading: isExperimentsLoading, error: experimentsError } = useExperiments();
    const { data: datasets, isLoading: isDatasetsLoading, error: datasetsError } = useDatasets();

    // Define initializeData outside useEffect
    const initializeData = async () => {
        setSyncStatus('loading');
        setSyncError(null);
        
        // Use a shorter timeout since we're now fetching real data
        setTimeout(() => {
            if (experimentsError || datasetsError) {
                setSyncStatus('error');
                setSyncError(experimentsError?.message || datasetsError?.message || 'Unknown error');
            } else {
                setSyncStatus('success');
            }
        }, 500);
    };

    // Initial load
    useEffect(() => {
        initializeData();
    }, [experimentsError, datasetsError]);

    const handleRefreshPrograms = async () => {
        if (isRefreshingPrograms) return;
        setIsRefreshingPrograms(true);
        try {
            await programListRef.current?.refresh();
        } finally {
            setIsRefreshingPrograms(false);
        }
    };

    const handleRefreshMembers = async () => {
        if (isRefreshingMembers) return;
        setIsRefreshingMembers(true);
        try {
            await memberListRef.current?.refresh();
        } finally {
            setIsRefreshingMembers(false);
        }
    };

    const handleRetrySync = () => {
        initializeData();
    };

    if (syncStatus === 'error') {
        return (
            <main className="min-h-screen bg-white p-6">
                <div className="max-w-7xl mx-auto">
                    <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-6">
                        <div className="flex items-center">
                            <div className="flex-shrink-0">
                                <svg className="h-5 w-5 text-red-700" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                </svg>
                            </div>
                            <div className="ml-3">
                                <h3 className="text-sm font-medium text-red-700">
                                    Failed to sync data
                                </h3>
                                <div className="mt-2 text-sm text-red-700">
                                    {syncError || 'An error occurred while syncing data. Please try again.'}
                                </div>
                                <div className="mt-4">
                                    <Button
                                        onClick={handleRetrySync}
                                        className="h-11 px-4 bg-slate-900 hover:bg-slate-800 text-white rounded-md"
                                    >
                                        Retry Sync
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        );
    }

    const isLoading = syncStatus === 'loading' || isExperimentsLoading || isDatasetsLoading;

    return (
        <main className="min-h-screen bg-white p-6">
            {isLoading && (
                <div className="bg-blue-50 border border-blue-200 text-blue-700 px-4 py-3 rounded-md text-sm mb-6">
                    <div className="flex items-center justify-center">
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Syncing data...
                    </div>
                </div>
            )}
            <div className="max-w-7xl mx-auto space-y-8">
                {/* Header Section */}
                <div className="flex flex-col md:flex-row justify-between items-start gap-6">
                    <div className="w-full max-w-2xl">
                        <h1 className="text-3xl font-bold text-slate-800">
                            {userName ? `Welcome back, ${userName}!` : 'Welcome to FortiEval'}
                        </h1>
                        <p className="text-sm text-slate-500 mt-2">Define, run, and visualize your LLM evaluation experiments with ease</p>
                    </div>
                </div>

                {/* Dashboard content section */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Experiments Card */}
                    <div className="bg-white border border-slate-200 rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow duration-300 flex flex-col h-full">
                        <h3 className="text-lg font-semibold text-slate-900 mb-5">Recent Experiments</h3>
                        <div className="text-sm text-slate-700 flex-grow">
                            {isLoading ? (
                                <div className="space-y-3">
                                    <div className="h-8 bg-slate-100 rounded animate-pulse"></div>
                                    <div className="h-8 bg-slate-100 rounded animate-pulse"></div>
                                    <div className="h-8 bg-slate-100 rounded animate-pulse"></div>
                                </div>
                            ) : experiments && experiments.length > 0 ? (
                                <div className="space-y-3">
                                    {experiments.slice(0, 3).map(experiment => (
                                        <Link 
                                            key={experiment.id}
                                            href={`/dashboard/experiments/${experiment.id}`}
                                            className="block bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-md px-4 py-3 transition-colors relative"
                                        >
                                            <div className="font-medium text-base text-slate-900">{experiment.name}</div>
                                            <div className="text-xs text-slate-500 mt-1 flex items-center">
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 mr-1 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                </svg>
                                                Created {formatDistanceToNow(new Date(experiment.created_at), { addSuffix: true })}
                                            </div>
                                            <svg className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                            </svg>
                                        </Link>
                                    ))}
                                </div>
                            ) : (
                                <div className="flex flex-col items-center justify-center h-full py-8">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-slate-300 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                                    </svg>
                                    <p className="text-slate-500 text-center">No experiments yet. Create your first experiment.</p>
                                </div>
                            )}
                        </div>
                        <div className="mt-6">
                            <Link href="/dashboard/experiments/new" className="block w-full">
                                <Button 
                                    className="w-full h-11 bg-slate-900 hover:bg-slate-800 text-white font-medium transition-colors"
                                >
                                    Create Experiment
                                </Button>
                            </Link>
                        </div>
                    </div>

                    {/* Datasets Card */}
                    <div className="bg-white border border-slate-200 rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow duration-300 flex flex-col h-full">
                        <h3 className="text-lg font-semibold text-slate-900 mb-5">Recent Datasets</h3>
                        <div className="text-sm text-slate-700 flex-grow">
                            {isLoading ? (
                                <div className="space-y-3">
                                    <div className="h-8 bg-slate-100 rounded animate-pulse"></div>
                                    <div className="h-8 bg-slate-100 rounded animate-pulse"></div>
                                    <div className="h-8 bg-slate-100 rounded animate-pulse"></div>
                                </div>
                            ) : datasets && datasets.length > 0 ? (
                                <div className="space-y-3">
                                    {datasets.slice(0, 3).map(dataset => (
                                        <Link 
                                            key={dataset.id}
                                            href={`/dashboard/datasets/${dataset.id}`}
                                            className="block bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-md px-4 py-3 transition-colors relative"
                                        >
                                            <div className="font-medium text-base text-slate-900">{dataset.name}</div>
                                            <div className="text-xs text-slate-500 mt-1 flex items-center">
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 mr-1 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                </svg>
                                                Created {formatDistanceToNow(new Date(dataset.created_at), { addSuffix: true })}
                                                {dataset.is_global && (
                                                    <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                                                        Global
                                                    </span>
                                                )}
                                            </div>
                                            <svg className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                            </svg>
                                        </Link>
                                    ))}
                                </div>
                            ) : (
                                <div className="flex flex-col items-center justify-center h-full py-8">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-slate-300 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" />
                                    </svg>
                                    <p className="text-slate-500 text-center">No datasets yet. Create your first dataset.</p>
                                </div>
                            )}
                        </div>
                        <div className="mt-6">
                            <Link href="/dashboard/datasets/new" className="block w-full">
                                <Button 
                                    className="w-full h-11 bg-white border border-slate-300 hover:bg-slate-50 text-slate-800 font-medium transition-colors"
                                >
                                    Create Dataset
                                </Button>
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
} 
