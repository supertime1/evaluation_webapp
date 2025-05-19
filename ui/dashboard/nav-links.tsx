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
// import { db } from '@/app/lib/db/database';
// import { ReportType, ProviderRole } from '@/app/lib/generated/api';

// Define ProviderRole enum since it's missing
export enum ProviderRole {
  PROVIDER_ADMIN = 'PROVIDER_ADMIN',
  PROVIDER_SYSTEM_ADMIN = 'PROVIDER_SYSTEM_ADMIN',
  PROVIDER_USER = 'PROVIDER_USER'
}

interface NavLinksProps {
  userRole: ProviderRole[];
}

const NavLinks: React.FC<NavLinksProps> = ({ userRole }) => {
  const pathname = usePathname();
  const [unreadAlertCount, setUnreadAlertCount] = useState(0);
  const [unreadMessageCount, setUnreadMessageCount] = useState(0);
  
            
  // useEffect(() => {
  //   async function loadUnreadCounts() {
  //     try {
  //       // Count unread alert reports
  //       const reportCount = await db.reports
  //         .where('reportType')
  //         .equals(ReportType.ALERT_REPORT)
  //         .filter(report => !report.isRead)
  //         .count();
        
  //       setUnreadAlertCount(reportCount);
        
  //       // Count unread messages
  //       const providerId = (await db.providerOrganizations.toArray())[0].providerID
  //       if (providerId) {
  //         const messageCount = await db.providerMessages
  //           .where('providerID')
  //           .equals(providerId)
  //           .and(message => !message.isRead)
  //           .count();
          
  //         setUnreadMessageCount(messageCount);
  //         console.log('unread messageCount:', providerId, messageCount)
  //       }
  //     } catch (error) {
  //       console.error('Error loading unread counts:', error);
  //     }
  //   }

  //   loadUnreadCounts();
    
  //   // Listen for report status changes
  //   const handleReportStatusChange = () => {
  //     loadUnreadCounts();
  //   };
    
  //   // Listen for message status changes
  //   const handleMessageStatusChange = () => {
  //     loadUnreadCounts();
  //   };
    
  //   window.addEventListener('reportStatusChanged', handleReportStatusChange);
  //   window.addEventListener('messageStatusChanged', handleMessageStatusChange);
    
  //   // Set up an interval to refresh the counts
  //   const interval = setInterval(loadUnreadCounts, 5000); // Refresh every 5 seconds
    
  //   return () => {
  //     clearInterval(interval);
  //     window.removeEventListener('reportStatusChanged', handleReportStatusChange);
  //     window.removeEventListener('messageStatusChanged', handleMessageStatusChange);
  //   };
  // }, []);

  const links = [
    { name: 'Home', href: '/dashboard', icon: HomeIcon },
    { name: 'Experiments', href: '/dashboard/experiments', icon: DocumentDuplicateIcon },
    { name: 'Test Cases', href: '/dashboard/test-cases', icon: Squares2X2Icon },
    { name: 'Results', href: '/dashboard/results', icon: UserGroupIcon },
  ];

  return (
    <>
      {links.map((link) => {
        const LinkIcon = link.icon;
        // const hasUnread = link.count && link.count > 0;
        
        return (
          <Link
            key={link.name}
            href={link.href}
            className={clsx(
              'flex h-[48px] grow items-center justify-center gap-2 rounded-md bg-gray-50 p-3 text-sm font-medium hover:bg-sky-100 hover:text-blue-600 md:flex-none md:justify-start md:p-2 md:px-3 relative',
              {
                'bg-sky-100 text-blue-600': pathname === link.href,
              },
            )}
          >
            <div className="relative">
              <LinkIcon className="w-6" />
              {/* {hasUnread && (
                <div className="absolute -top-1 -right-1 h-4 w-4 bg-red-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-xs">
                    {link.count > 9 ? '9+' : link.count}
                  </span>
                </div>
              )} */}
            </div>
            <p className="hidden md:block">{link.name}</p>
          </Link>
        );
      })}
      {(userRole.includes(ProviderRole.PROVIDER_ADMIN) || userRole.includes(ProviderRole.PROVIDER_SYSTEM_ADMIN)) && (
        <Link
          href="/dashboard/admin"
          className={clsx(
            'flex h-[48px] grow items-center justify-center gap-2 rounded-md bg-gray-50 p-3 text-sm font-medium hover:bg-sky-100 hover:text-blue-600 md:flex-none md:justify-start md:p-2 md:px-3',
            {
              'bg-sky-100 text-blue-600': pathname === "/dashboard/admin",
            },
          )}
        >
          <Cog6ToothIcon className='w-6' />
          <p className="hidden md:block">Admin</p>
        </Link>
      )}
    </>
  );
};

export default NavLinks;
