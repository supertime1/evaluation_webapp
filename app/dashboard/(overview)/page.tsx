'use client';

import { useEffect, useState, useRef } from 'react';
import Link from 'next/link';


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
        // try {
        //     console.log('[DashboardPage] Initializing data');
        //     const syncManager = SyncManager.getInstance();
        //     await syncManager.syncState();
        //     console.log('[DashboardPage] Sync complete');
        //     const metricManager = MetricManager.getInstance();
        //     await metricManager.syncCustomMetricGoals();
        //     // After sync is complete, refresh both lists
        //     await Promise.all([
        //         memberListRef.current?.refresh(),
        //         programListRef.current?.refresh()
        //     ]);
        //     setSyncStatus('success');
        // } catch (error) {
        //     console.error('Error during sync:', error);
        //     setSyncError(error instanceof Error ? error.message : 'Failed to sync data');
        //     setSyncStatus('error');
        // }
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
            <main className="min-h-screen bg-gray-50 p-6">
                <div className="max-w-7xl mx-auto">
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-8">
                        <div className="flex items-center">
                            <div className="flex-shrink-0">
                                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                </svg>
                            </div>
                            <div className="ml-3">
                                <h3 className="text-sm font-medium text-red-800">
                                    Failed to sync data
                                </h3>
                                <div className="mt-2 text-sm text-red-700">
                                    {syncError}
                                </div>
                                <div className="mt-4">
                                    <button
                                        onClick={handleRetrySync}
                                        className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-red-700 bg-red-100 hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                                    >
                                        Retry Sync
                                    </button>
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
        <main className="min-h-screen bg-gray-50 p-6">
            {isLoading && (
                <div className="bg-blue-50 p-2 text-center text-sm text-blue-700 mb-4">
                    <div className="flex items-center justify-center">
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-blue-700" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
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
                    <div className='w-full max-w-2xl'>
                        <h1 className="text-3xl font-bold text-gray-900">
                            {userName ? `Welcome back, ${userName}!` : 'Welcome back!'}
                        </h1>
                        <p className="text-gray-600 mt-3">Check out your latest experiments here.</p>
                    </div>

                </div>

                {/* Summary Cards Section */}
                {/* <div className={isLoading ? 'animate-pulse' : ''}>
                    <SummaryCards 
                        isLoading={isLoading} 
                        onMemberUpdate={() => {
                            memberListRef.current?.refresh();
                        }}
                    />
                </div> */}

                {/* Lists Section */}
                {/* <div className="grid grid-cols-1 lg:grid-cols-2 gap-8"> */}
                    {/* Programs Card */}
                    {/* <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
                        <div className="flex justify-between items-center mb-6 flex-wrap">
                            <h2 className="text-xl font-semibold text-gray-900 truncate">Programs</h2>
                            <div className="flex items-center gap-2 flex-shrink-0 flex-wrap">
                                <button 
                                    onClick={handleRefreshPrograms}
                                    className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-blue-600 hover:text-blue-700 focus:outline-none disabled:opacity-50 flex-wrap"
                                    disabled={isRefreshingPrograms || isLoading}
                                >
                                    <svg 
                                        className={`mr-1.5 h-4 w-4 ${isRefreshingPrograms ? 'animate-spin' : ''}`} 
                                        xmlns="http://www.w3.org/2000/svg" 
                                        fill="none" 
                                        viewBox="0 0 24 24" 
                                        stroke="currentColor"
                                    >
                                        <path 
                                            strokeLinecap="round" 
                                            strokeLinejoin="round" 
                                            strokeWidth={2} 
                                            d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" 
                                        />
                                    </svg>
                                    Refresh
                                </button>
                                <Link 
                                    href="/dashboard/programs"
                                    className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-blue-600 hover:text-blue-700 flex-wrap"
                                >
                                    View All
                                    <svg className="ml-1.5 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                    </svg>
                                </Link>
                            </div>
                        </div>
                        <div className={`bg-gray-50 rounded-lg p-4 min-w-0 ${isLoading ? 'animate-pulse' : ''}`}>
                            <ProgramList ref={programListRef} maxRows={10} isLoading={isLoading} />
                        </div>
                    </div> */}

                    {/* Members Card */}
                    {/* <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
                        <div className="flex justify-between items-center mb-6 flex-wrap">
                            <h2 className="text-xl font-semibold text-gray-900 truncate">Members</h2>
                            <div className="flex items-center gap-2 flex-shrink-0 flex-wrap">
                                <button 
                                    onClick={handleRefreshMembers}
                                    className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-blue-600 hover:text-blue-700 focus:outline-none disabled:opacity-50 flex-wrap"
                                    disabled={isRefreshingMembers || isLoading}
                                >
                                    <svg 
                                        className={`mr-1.5 h-4 w-4 ${isRefreshingMembers ? 'animate-spin' : ''}`} 
                                        xmlns="http://www.w3.org/2000/svg" 
                                        fill="none" 
                                        viewBox="0 0 24 24" 
                                        stroke="currentColor"
                                    >
                                        <path 
                                            strokeLinecap="round" 
                                            strokeLinejoin="round" 
                                            strokeWidth={2} 
                                            d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" 
                                        />
                                    </svg>
                                    Refresh
                                </button>
                                <Link 
                                    href="/dashboard/members"
                                    className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-blue-600 hover:text-blue-700 flex-wrap"
                                >
                                    View All
                                    <svg className="ml-1.5 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                    </svg>
                                </Link>
                            </div>
                        </div>
                        <div className={`bg-gray-50 rounded-lg p-4 min-w-0 ${isLoading ? 'animate-pulse' : ''}`}>
                            <MemberList ref={memberListRef} maxRows={10} isLoading={isLoading} showDeviceButton={false}/>
                        </div>
                    </div> */}
                </div>
            {/* </div> */}
        </main>
    );
} 