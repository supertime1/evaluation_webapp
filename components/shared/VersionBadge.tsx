'use client';

interface VersionBadgeProps {
  version: number | string;
  isCurrent?: boolean;
  className?: string;
}

export function VersionBadge({ version, isCurrent = false, className = '' }: VersionBadgeProps) {
  const baseClasses = "inline-flex items-center px-2 py-1 rounded text-xs font-medium";
  const variantClasses = isCurrent 
    ? "bg-green-100 text-green-800 border border-green-200"
    : "bg-slate-100 text-slate-700 border border-slate-200";

  return (
    <span className={`${baseClasses} ${variantClasses} ${className}`}>
      <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
      </svg>
      v{version}
      {isCurrent && (
        <span className="ml-1 text-green-600">
          (current)
        </span>
      )}
    </span>
  );
} 