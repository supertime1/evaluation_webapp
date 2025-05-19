'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { authApi } from '@/lib/api/auth';

export default function DashboardPage() {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [userInfo, setUserInfo] = useState<any>(null);
  const [loadingError, setLoadingError] = useState<string | null>(null);

  useEffect(() => {
    // Check authentication on component mount
    const checkAuth = async () => {
      // Check token first
      const hasToken = authApi.isAuthenticated();
      console.log('Dashboard token check:', hasToken);
      
      if (!hasToken) {
        console.log('No auth token found, redirecting to login');
        setIsAuthenticated(false);
        router.push('/login');
        return;
      }
      
      try {
        // Try to get current user with token
        console.log('Attempting to load user data with token');
        const userData = await authApi.getCurrentUser();
        console.log('User authenticated in dashboard:', userData);
        setUserInfo(userData);
        setIsAuthenticated(true);
      } catch (error) {
        console.error('Authentication check failed in dashboard:', error);
        setLoadingError('Failed to load user data. Please try logging in again.');
        setIsAuthenticated(false);
        // Redirect to login if not authenticated
        router.push('/login');
      }
    };

    checkAuth();
  }, [router]);

  // Show loading state while checking authentication
  if (isAuthenticated === null) {
    return (
      <div className="p-6 flex items-center justify-center min-h-screen">
        <div className="bg-white p-8 rounded-lg shadow-md text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p>Loading dashboard...</p>
        </div>
      </div>
    );
  }

  // Show unauthorized message if not authenticated (will redirect)
  if (isAuthenticated === false) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-md">
          {loadingError || 'You are not authorized to view this page. Redirecting to login...'}
        </div>
      </div>
    );
  }
  
  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-800">Dashboard</h1>
        <p className="text-slate-600 mt-2">
          Welcome to your FortiEval dashboard
          {userInfo?.email ? `, ${userInfo.email}` : ''}
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-xl font-semibold mb-2">Experiments</h3>
          <p className="text-gray-600 mb-4">Manage your LLM evaluation experiments</p>
          <button
            onClick={() => router.push('/dashboard/experiments')}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            View Experiments
          </button>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-xl font-semibold mb-2">Test Cases</h3>
          <p className="text-gray-600 mb-4">Manage your test cases and datasets</p>
          <button
            onClick={() => router.push('/dashboard/test-cases')}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            View Test Cases
          </button>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-xl font-semibold mb-2">Results</h3>
          <p className="text-gray-600 mb-4">View and analyze evaluation results</p>
          <button
            onClick={() => router.push('/dashboard/results')}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            View Results
          </button>
        </div>
      </div>
    </div>
  );
}