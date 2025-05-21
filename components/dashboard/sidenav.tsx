'use client';

import Link from 'next/link';
import NavLinks from '@/components/dashboard/nav-links';
import { PowerIcon } from '@heroicons/react/24/outline';
import { useRouter, usePathname } from 'next/navigation';
import { useState } from 'react';
import Image from 'next/image';
import { useAuth } from '@/lib/hooks/useAuth';

export default function SideNav() {
  const router = useRouter();
  const pathname = usePathname();
  const { logout } = useAuth({ checkOnMount: false });
  const [isLoading, setIsLoading] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);

  const handleSignOut = async () => {
    try {
      setIsLoading(true);
      // Call the logout function from useAuth
      await logout();
      router.push('/login');
    } catch (error) {
      console.error('Error during sign out:', error);
      // Even if logout fails, redirect to login
      router.push('/login');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex h-full flex-col bg-white">
      {/* Logo section */}
      <Link
        className="flex h-20 items-center gap-2 px-6 border-b border-slate-200"
        href="/dashboard"
      >
        <div className="flex items-center gap-2">
          <Image
            src="/logomark.svg"
            alt="FortiEval"
            width={50}
            height={50}
          />
          <span className="text-lg font-semibold text-slate-900">
            FortiEval
          </span>
        </div>
      </Link>

      {/* Main navigation section with better spacing */}
      <div className="flex grow flex-col justify-between py-6">
        {/* Nav links with more padding */}
        <div className="space-y-2 px-4">
          <NavLinks />
        </div>

        {/* Bottom section with sign out */}
        <div className="space-y-2 px-4 mt-auto pt-6 border-t border-slate-200">
          {/* Sign out button - updated to match design system */}
          <button
            onClick={handleSignOut}
            disabled={isLoading}
            className="flex w-full items-center gap-2 rounded-lg px-4 py-3 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors disabled:opacity-50"
          >
            <PowerIcon className={`w-5 h-5 ${isLoading ? 'animate-pulse' : ''}`} />
            <span>{isLoading ? 'Signing Out...' : 'Sign Out'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
