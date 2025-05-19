'use client';

import {
  UserGroupIcon,
  HomeIcon,
  DocumentDuplicateIcon,
  UserIcon,
  Cog6ToothIcon,
  Squares2X2Icon,
  UsersIcon,
  BellAlertIcon,
  ChatBubbleLeftRightIcon,
} from '@heroicons/react/24/outline';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import clsx from 'clsx';
import { useEffect, useState } from 'react';


const NavLinks: React.FC = () => {
  const pathname = usePathname();


  const links = [
    { name: 'Home', href: '/dashboard', icon: HomeIcon },
    { name: 'Experiments', href: '/dashboard/experiments', icon: UsersIcon },
    { name: 'Test Cases', href: '/dashboard/test-cases', icon: Squares2X2Icon },

  ];

  return (
    <>

      {(
        <Link
          href="/dashboard/admin"
          className={clsx(
            'flex h-[48px] grow items-center justify-center gap-2 rounded-md bg-gray-50 p-3 text-sm font-medium hover:bg-sky-100 hover:text-blue-600 md:flex-none md:justify-start md:p-2 md:px-3',
            {
              'bg-sky-100 text-blue-600': pathname === "/dashboard/admin",
            },
          )}
        >
        </Link>
      )}
    </>
  );
};

export default NavLinks;
