'use client';

import { useState } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { TestCase } from '@/lib/schemas/testCase';
import { Copy, FileText, Clock, User, Globe, Hash } from 'lucide-react';

interface TestCaseDetailModalProps {
  testCase: TestCase;
  trigger: React.ReactNode;
}

export function TestCaseDetailModal({ testCase, trigger }: TestCaseDetailModalProps) {
  const [open, setOpen] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const copyToClipboard = (text: string, fieldName: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldName);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const formatArrayValue = (value: any): string => {
    if (Array.isArray(value)) {
      return value.length > 0 ? value.join('\n') : 'None';
    }
    return value || 'None';
  };

  const formatObjectValue = (value: any): string => {
    if (typeof value === 'object' && value !== null) {
      return JSON.stringify(value, null, 2);
    }
    return value || 'None';
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[700px] max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <FileText className="h-5 w-5" />
            <span className="truncate">{testCase.name}</span>
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="text-xs">
                {testCase.type.toUpperCase()}
              </Badge>
              {testCase.is_global && (
                <Badge variant="default" className="bg-blue-100 text-blue-800 text-xs">
                  <Globe className="h-3 w-3 mr-1" />
                  Global
                </Badge>
              )}
            </div>
          </DialogTitle>
        </DialogHeader>

        <div className="flex flex-col flex-1 min-h-0 space-y-4">
          {/* Metadata */}
          <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div className="flex items-center gap-2">
                <Hash className="h-4 w-4 text-slate-400" />
                <span className="text-slate-600">ID:</span>
                <span className="font-mono text-xs bg-slate-200 px-2 py-1 rounded">
                  {testCase.id.slice(-8)}
                </span>
              </div>
              
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-slate-400" />
                <span className="text-slate-600">Owner:</span>
                <span className="font-mono text-xs">
                  {testCase.user_id.slice(-8)}
                </span>
              </div>
              
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-slate-400" />
                <span className="text-slate-600">Created:</span>
                <span className="text-xs">
                  {formatDistanceToNow(new Date(testCase.created_at), { addSuffix: true })}
                </span>
              </div>
            </div>
          </div>

          {/* Test Case Details */}
          <div className="flex-1 min-h-0 overflow-y-auto space-y-4">
            {/* Input */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-medium text-slate-900">Input</h4>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => copyToClipboard(formatArrayValue(testCase.input), 'input')}
                  className="h-6 px-2 text-xs"
                >
                  <Copy className="h-3 w-3 mr-1" />
                  {copiedField === 'input' ? 'Copied!' : 'Copy'}
                </Button>
              </div>
              <div className="bg-white border border-slate-200 rounded-md p-3">
                <pre className="text-sm text-slate-700 whitespace-pre-wrap">
                  {formatArrayValue(testCase.input)}
                </pre>
              </div>
            </div>

            {/* Expected Output */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-medium text-slate-900">Expected Output</h4>
                {testCase.expected_output && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => copyToClipboard(testCase.expected_output || '', 'expected_output')}
                    className="h-6 px-2 text-xs"
                  >
                    <Copy className="h-3 w-3 mr-1" />
                    {copiedField === 'expected_output' ? 'Copied!' : 'Copy'}
                  </Button>
                )}
              </div>
              <div className="bg-white border border-slate-200 rounded-md p-3">
                <pre className="text-sm text-slate-700 whitespace-pre-wrap">
                  {testCase.expected_output || 'None'}
                </pre>
              </div>
            </div>

            {/* Context */}
            {(testCase.context && testCase.context.length > 0) && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-medium text-slate-900">Context</h4>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => copyToClipboard(formatArrayValue(testCase.context), 'context')}
                    className="h-6 px-2 text-xs"
                  >
                    <Copy className="h-3 w-3 mr-1" />
                    {copiedField === 'context' ? 'Copied!' : 'Copy'}
                  </Button>
                </div>
                <div className="bg-white border border-slate-200 rounded-md p-3">
                  <pre className="text-sm text-slate-700 whitespace-pre-wrap">
                    {formatArrayValue(testCase.context)}
                  </pre>
                </div>
              </div>
            )}

            {/* Retrieval Context */}
            {(testCase.retrieval_context && testCase.retrieval_context.length > 0) && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-medium text-slate-900">Retrieval Context</h4>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => copyToClipboard(formatArrayValue(testCase.retrieval_context), 'retrieval_context')}
                    className="h-6 px-2 text-xs"
                  >
                    <Copy className="h-3 w-3 mr-1" />
                    {copiedField === 'retrieval_context' ? 'Copied!' : 'Copy'}
                  </Button>
                </div>
                <div className="bg-white border border-slate-200 rounded-md p-3">
                  <pre className="text-sm text-slate-700 whitespace-pre-wrap">
                    {formatArrayValue(testCase.retrieval_context)}
                  </pre>
                </div>
              </div>
            )}

            {/* Additional Metadata */}
            {(testCase.additional_metadata && Object.keys(testCase.additional_metadata).length > 0) && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-medium text-slate-900">Additional Metadata</h4>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => copyToClipboard(formatObjectValue(testCase.additional_metadata), 'additional_metadata')}
                    className="h-6 px-2 text-xs"
                  >
                    <Copy className="h-3 w-3 mr-1" />
                    {copiedField === 'additional_metadata' ? 'Copied!' : 'Copy'}
                  </Button>
                </div>
                <div className="bg-white border border-slate-200 rounded-md p-3">
                  <pre className="text-sm text-slate-700 whitespace-pre-wrap font-mono">
                    {formatObjectValue(testCase.additional_metadata)}
                  </pre>
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex justify-end pt-4 border-t border-slate-200">
            <Button
              variant="outline"
              onClick={() => setOpen(false)}
              className="h-10 px-4"
            >
              Close
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
} 