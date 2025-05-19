'use client';

import React, { useEffect, useState } from 'react';
import { userManager } from '@/lib/managers/userManager';

interface AuthProviderProps {
  children: React.ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [isInitialized, setIsInitialized] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      setIsLoading(true);
      try {
        // Initialize user first - this will check auth status and load user data
        await userManager.initializeUser();
      } finally {
        setIsLoading(false);
        setIsInitialized(true);
      }
    };

    initAuth();
  }, []);

  if (!isInitialized) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-white">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return <>{children}</>;
} 