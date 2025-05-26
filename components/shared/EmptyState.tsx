'use client';

import { Button } from '@/components/ui/button';

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description: string;
  action?: {
    label: string;
    onClick?: () => void;
    href?: string;
  };
  className?: string;
}

export function EmptyState({ 
  icon, 
  title, 
  description, 
  action, 
  className = '' 
}: EmptyStateProps) {
  const defaultIcon = (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-slate-300 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" />
    </svg>
  );

  return (
    <div className={`text-center py-12 ${className}`}>
      {icon || defaultIcon}
      <h3 className="text-lg font-medium text-slate-900 mb-2">
        {title}
      </h3>
      <p className="text-slate-500 mb-6 max-w-md mx-auto">
        {description}
      </p>
      {action && (
        action.href ? (
          <a href={action.href}>
            <Button className="h-11 px-6 bg-slate-900 hover:bg-slate-800 text-white rounded-md">
              {action.label}
            </Button>
          </a>
        ) : (
          <Button 
            onClick={action.onClick}
            className="h-11 px-6 bg-slate-900 hover:bg-slate-800 text-white rounded-md"
          >
            {action.label}
          </Button>
        )
      )}
    </div>
  );
} 