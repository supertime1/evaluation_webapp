'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ClipboardIcon, CheckIcon } from '@heroicons/react/24/outline';

interface RunIdCopyButtonProps {
  runId: string;
  className?: string;
}

export function RunIdCopyButton({ runId, className = '' }: RunIdCopyButtonProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(runId);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy run ID:', error);
    }
  };

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <span className="text-sm text-slate-500">Run ID:</span>
      <code className="text-sm font-mono bg-slate-100 px-2 py-1 rounded border">
        {runId}
      </code>
      <Button
        variant="outline"
        size="sm"
        onClick={handleCopy}
        className="h-8 w-8 p-0"
        title={copied ? 'Copied!' : 'Copy run ID'}
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