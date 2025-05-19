'use client';

import {
  HomeIcon,
  Squares2X2Icon,
  BeakerIcon,
} from '@heroicons/react/24/outline';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';

const NavLinks: React.FC = () => {
  const pathname = usePathname();

  const links = [
    { name: 'Dashboard', href: '/dashboard', icon: HomeIcon },
    { name: 'Experiments', href: '/dashboard/experiments', icon: BeakerIcon },
    { name: 'Test Cases', href: '/dashboard/test-cases', icon: Squares2X2Icon },
  ];

  return (
    <nav className="space-y-1">
      {links.map((link) => {
        const isActive = pathname === link.href || pathname?.startsWith(`${link.href}/`);
        
        return (
          <Link
            key={link.name}
            href={link.href}
            className={cn(
              "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
              isActive 
                ? "bg-slate-50 text-slate-900" 
                : "text-slate-700 hover:bg-slate-50 hover:text-slate-900"
            )}
          >
            <link.icon className="h-5 w-5" />
            <span>{link.name}</span>
          </Link>
        );
      })}
    </nav>
  );
};

export default NavLinks;
