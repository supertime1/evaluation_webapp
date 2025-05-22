'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/lib/hooks/useAuth';
import { useUser } from '@/lib/hooks/useUser';

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login, isAuthenticated, isLoading: authLoading, error: authError } = useAuth({ checkOnMount: false });
  const { loadUser } = useUser();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  // // Check for registration success message
  // useEffect(() => {
  //   if (searchParams?.get('registered') === 'true') {
  //     setSuccess('Account created successfully. Please log in.');
  //   }
  // }, [searchParams]);

  // // Update local error state when auth error changes
  // useEffect(() => {
  //   if (authError) {
  //     setError(authError.message);
  //   }
  // }, [authError]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setSuccess('');
    
    try {
      console.log('Attempting login with:', email);
      
      // Log in first
      await login({
        username: email,
        password,
      });
      
      console.log('Login successful, loading user data');
      // Then load user data
      await loadUser();
      console.log('User data loaded, redirecting to dashboard');
      // If we got this far without errors, redirect to dashboard
      router.push('/dashboard');
      
    } catch (err: any) {
      console.error('Login error:', err);
      
      // Display friendly error message
      if (err.response) {
        if (err.response.status === 400 || err.response.status === 401 || err.response.status === 422) {
          setError('Invalid email or password. Please try again.');
        } else {
          setError(err.response.data?.detail || 'Login failed. Please check your credentials.');
        }
      } else if (err.request) {
        setError('Unable to connect to the server. Please try again later.');
      } else {
        setError(err.message || 'An unexpected error occurred. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full">
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-slate-900">Log in</h2>
        <p className="text-sm text-slate-500 mt-1">
          Enter your credentials to access FortiEval
        </p>
      </div>

      {success && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-md text-sm mb-6">
          {success}
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-sm mb-6">
          {error}
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="space-y-2">
          <label htmlFor="email" className="block text-sm font-medium text-slate-700">
            Email
          </label>
          <Input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            className="h-11 w-full"
            required
          />
        </div>
        
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label htmlFor="password" className="block text-sm font-medium text-slate-700">
              Password
            </label>
            <Link href="/forgot-password" className="text-sm text-blue-600 hover:text-blue-800 font-medium">
              Forgot password?
            </Link>
          </div>
          <Input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="h-11 w-full"
            required
          />
        </div>
        
        <Button 
          type="submit" 
          className="w-full h-11 bg-slate-900 hover:bg-slate-800 mt-3" 
          disabled={isLoading || authLoading}
        >
          {isLoading || authLoading ? 'Signing in...' : 'Sign in'}
        </Button>
      </form>

      <div className="text-center mt-6">
        <p className="text-sm text-slate-500">
          Don't have an account?{' '}
          <Link href="/register" className="text-blue-600 hover:text-blue-800 font-medium">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
} 