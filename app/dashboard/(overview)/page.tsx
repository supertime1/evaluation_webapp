'use client';

import { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

type SyncStatus = 'loading' | 'success' | 'error';

export default function DashboardPage() {
    const [isRefreshingPrograms, setIsRefreshingPrograms] = useState(false);
    const [isRefreshingMembers, setIsRefreshingMembers] = useState(false);
    const [syncStatus, setSyncStatus] = useState<SyncStatus>('loading');
    const [syncError, setSyncError] = useState<string | null>(null);
    const [userName, setUserName] = useState<string>('');
    const memberListRef = useRef<{ refresh: () => Promise<void> }>(null);
    const programListRef = useRef<{ refresh: () => Promise<void> }>(null);

    // Define initializeData outside useEffect
    const initializeData = async () => {
        setSyncStatus('loading');
        setSyncError(null);
        
        // Simulate data loading
        setTimeout(() => {
            setSyncStatus('success');
        }, 1500);
    };

    // Initial load
    useEffect(() => {
        initializeData();
    }, []);

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

    const isLoading = syncStatus === 'loading';

    return (
        <main className="min-h-screen bg-white">
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
            <div className="max-w-7xl mx-auto space-y-6">
                {/* Header Section */}
                <div className="flex flex-col md:flex-row justify-between items-start gap-6">
                    <div className="w-full max-w-2xl">
                        <h1 className="text-2xl font-bold text-slate-800">
                            {userName ? `Welcome back, ${userName}!` : 'Welcome to FortiEval'}
                        </h1>
                        <p className="text-sm text-slate-500 mt-1">Define, run, and visualize your LLM evaluation experiments with ease</p>
                    </div>
                </div>

                {/* Dashboard content section */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Experiments Card */}
                    <div className="bg-white border border-slate-200 rounded-lg shadow-sm p-6">
                        <h3 className="text-base font-semibold text-slate-900 mb-4">Recent Experiments</h3>
                        <div className="text-sm text-slate-700">
                            {isLoading ? (
                                <div className="space-y-3">
                                    <div className="h-8 bg-slate-100 rounded animate-pulse"></div>
                                    <div className="h-8 bg-slate-100 rounded animate-pulse"></div>
                                    <div className="h-8 bg-slate-100 rounded animate-pulse"></div>
                                </div>
                            ) : (
                                <p className="text-slate-500">No experiments yet. Create your first experiment.</p>
                            )}
                        </div>
                        <div className="mt-6">
                            <Link href="/dashboard/experiments/new">
                                <Button 
                                    className="w-full h-11 bg-slate-900 hover:bg-slate-800 mt-3"
                                >
                                    Create Experiment
                                </Button>
                            </Link>
                        </div>
                    </div>

                    {/* Test Cases Card */}
                    <div className="bg-white border border-slate-200 rounded-lg shadow-sm p-6">
                        <h3 className="text-base font-semibold text-slate-900 mb-4">Test Cases</h3>
                        <div className="text-sm text-slate-700">
                            {isLoading ? (
                                <div className="space-y-3">
                                    <div className="h-8 bg-slate-100 rounded animate-pulse"></div>
                                    <div className="h-8 bg-slate-100 rounded animate-pulse"></div>
                                    <div className="h-8 bg-slate-100 rounded animate-pulse"></div>
                                </div>
                            ) : (
                                <p className="text-slate-500">No test cases yet. Create your first test case.</p>
                            )}
                        </div>
                        <div className="mt-6">
                            <Link href="/dashboard/test-cases/new">
                                <Button 
                                    className="w-full h-11 border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 rounded-md"
                                >
                                    Create Test Case
                                </Button>
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
} 