'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { authApi } from '@/lib/api/auth';

export default function DashboardPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState(null);

  useEffect(() => {
    // Check authentication when component mounts
    const checkAuth = async () => {
      try {
        const userData = await authApi.getCurrentUser();
        console.log('User authenticated:', userData);
        setUser(userData);
        setIsLoading(false);
      } catch (error) {
        console.error('Authentication failed:', error);
        // Redirect to login page if not authenticated
        router.push('/login');
      }
    };

    checkAuth();
  }, [router]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-semibold mb-4">Loading Dashboard...</h2>
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-800">Dashboard</h1>
        <p className="text-slate-600 mt-2">Welcome to your FortiEval dashboard.</p>
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