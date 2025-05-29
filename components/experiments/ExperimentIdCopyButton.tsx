'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ClipboardIcon, CheckIcon } from '@heroicons/react/24/outline';

interface ExperimentIdCopyButtonProps {
  experimentId: string;
  className?: string;
}

export function ExperimentIdCopyButton({ experimentId, className = '' }: ExperimentIdCopyButtonProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(experimentId);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy experiment ID:', error);
    }
  };

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <span className="text-sm text-slate-500">ID:</span>
      <code className="text-sm font-mono bg-slate-100 px-2 py-1 rounded border">
        {experimentId}
      </code>
      <Button
        variant="outline"
        size="sm"
        onClick={handleCopy}
        className="h-8 w-8 p-0"
        title={copied ? 'Copied!' : 'Copy experiment ID'}
      >
        {copied ? (
          <CheckIcon className="h-4 w-4 text-green-600" />
        ) : (
          <ClipboardIcon className="h-4 w-4" />
        )}
      </Button>
    </div>
  );
} 