'use client';

import Link from 'next/link';
import NavLinks from '@/components/dashboard/nav-links';
import Logo from '@/components/ui/logomark.svg';
import { PowerIcon } from '@heroicons/react/24/outline';
import { useRouter, usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import Version from '@/components/common/Version';

export default function SideNav() {
  const router = useRouter();
  const pathname = usePathname();
  const [showConfirmation, setShowConfirmation] = useState(false);


//   const handleSignOut = async () => {
//     try {
//         setShowConfirmation(false);
        
//         // Use AuthManager to handle sign out and get the base URL
//         const baseUrl = await AuthManager.getInstance().signOut();
        
//         // Construct the sign-in URL with the correct base URL and cache busting
//         const signInUrl = `${baseUrl}/sign-in?t=${new Date().getTime()}`;
        
//         // First try: direct navigation
//         window.location.href = signInUrl;
        
//         // Second try: after a short delay, try again with reload
//         setTimeout(() => {
//             window.location.reload();
//             window.location.href = signInUrl;
//         }, 500);
        
//         // Final try: if still on the page after 1 second, force a hard reload and redirect
//         setTimeout(() => {
//             const hardReloadUrl = `${baseUrl}/sign-in`;
//             window.location.replace(hardReloadUrl);
//         }, 1000);
        
//     } catch (error) {
//         console.error('Error during sign out:', error);
//         // Force reload as fallback
//         window.location.replace('/sign-in');
//     }
//   };

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
              6th Sense Health
            </span>
          </div>
        </Link>

        {/* Main navigation section with better spacing */}
        <div className="flex grow flex-col justify-between py-8">
          {/* Nav links with more padding */}
          <div className="space-y-2 px-4">
            <NavLinks />
          </div>

          {/* Bottom section with sign out and version */}
          <div className="space-y-4 px-4">
            {/* Sign out button - updated to match NavLinks style */}
            <button
              onClick={() => setShowConfirmation(true)}
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
