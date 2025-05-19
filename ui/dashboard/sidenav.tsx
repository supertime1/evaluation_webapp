'use client';

import Link from 'next/link';
import NavLinks, { ProviderRole } from '@/ui/dashboard/nav-links';
import { PowerIcon } from '@heroicons/react/24/outline';
import { useRouter, usePathname } from 'next/navigation';
import { useState } from 'react';

// Simple logo component as replacement for SixthsLogo
const Logo = () => (
  <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold">
    FE
  </div>
);

// Simple Version component
const Version = ({ pathname }: { pathname: string }) => (
  <div className="text-xs text-gray-400">
    <p>FortiEval v1.0.0</p>
    <p className="mt-1">{pathname}</p>
  </div>
);

export default function SideNav() {
  const router = useRouter();
  const pathname = usePathname();
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [userRole, setUserRole] = useState<ProviderRole[]>([]);

  const handleSignOut = async () => {
    try {
        setShowConfirmation(false);
        // For now, just redirect to sign-in page
        router.push('/sign-in');
    } catch (error) {
        console.error('Error during sign out:', error);
        router.push('/sign-in');
    }
  };

  return (
    <>
      <div className="flex h-full flex-col bg-white border-r border-gray-200">
        {/* Logo section */}
        <Link
          className="flex h-20 items-center gap-2 px-6 border-b border-gray-200"
          href="/"
        >
          <div className="flex items-center gap-3">
            <Logo />
            <span className="text-lg font-semibold text-gray-900">
              FortiEval
            </span>
          </div>
        </Link>

        {/* Main navigation section with better spacing */}
        <div className="flex grow flex-col justify-between py-8">
          {/* Nav links with more padding */}
          <div className="space-y-2 px-4">
            <NavLinks userRole={userRole} />
          </div>

          {/* Bottom section with sign out and version */}
          <div className="space-y-4 px-4">
            {/* Sign out button - updated to match NavLinks style */}
            <button
              onClick={() => router.push('/sign-in')}
              className="flex w-full items-center gap-2 rounded-lg px-4 py-3 text-sm font-medium text-gray-500 hover:bg-blue-50 hover:text-blue-600 transition-colors"
            >
              <PowerIcon className="w-5 h-5" />
              <span>Sign Out</span>
            </button>

            {/* Version info with more padding */}
            <div className="pt-4 pb-4">
              <Version pathname={pathname} />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
