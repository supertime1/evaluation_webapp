'use client';

import React, { useState } from 'react';
import { Eye, EyeOff, Copy, ExternalLink, Image as ImageIcon } from 'lucide-react';
import { TestCase, MLLMImage } from '@/lib/schemas/testCase';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

interface TestCasePreviewProps {
  testCase: TestCase;
  showFullDetails?: boolean;
  className?: string;
}

export function TestCasePreview({
  testCase,
  showFullDetails = false,
  className = '',
}: TestCasePreviewProps) {
  const [showDetails, setShowDetails] = useState(showFullDetails);
  const [showFullInput, setShowFullInput] = useState(false);
  const [showFullOutput, setShowFullOutput] = useState(false);

  const handleCopyId = () => {
    navigator.clipboard.writeText(testCase.id);
  };

  const handleViewTestCase = () => {
    window.open(`/dashboard/test-cases/${testCase.id}`, '_blank');
  };

  // Helper function to render multimodal input
  const renderInput = (input: string | (string | MLLMImage)[] | undefined, truncate = true) => {
    if (!input) return <span className="text-slate-400 italic">No input</span>;

    if (typeof input === 'string') {
      const displayText = truncate && input.length > 200 
        ? input.substring(0, 200) + '...' 
        : input;
      
      return (
        <div className="space-y-2">
          <pre className="whitespace-pre-wrap text-sm text-slate-700 font-mono bg-slate-50 p-3 rounded border">
            {displayText}
          </pre>
          {truncate && input.length > 200 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowFullInput(!showFullInput)}
              className="text-blue-600 hover:text-blue-800"
            >
              {showFullInput ? <EyeOff className="h-4 w-4 mr-1" /> : <Eye className="h-4 w-4 mr-1" />}
              {showFullInput ? 'Show less' : 'Show more'}
            </Button>
          )}
        </div>
      );
    }

    // Handle multimodal input (array of strings and images)
    return (
      <div className="space-y-2">
        <div className="flex items-center gap-2 mb-2">
          <ImageIcon className="h-4 w-4 text-slate-500" />
          <span className="text-sm text-slate-600">Multimodal input ({input.length} items)</span>
        </div>
        <div className="space-y-2">
          {input.slice(0, truncate ? 3 : input.length).map((item, index) => (
            <div key={index} className="border border-slate-200 rounded p-2">
              {typeof item === 'string' ? (
                <pre className="whitespace-pre-wrap text-sm text-slate-700 font-mono">
                  {truncate && item.length > 100 ? item.substring(0, 100) + '...' : item}
                </pre>
              ) : (
                <div className="flex items-center gap-2">
                  <ImageIcon className="h-4 w-4 text-slate-500" />
                  <span className="text-sm text-slate-600">
                    Image: {item.url}
                  </span>
                  {item.alt_text && (
                    <span className="text-xs text-slate-500">
                      ({item.alt_text})
                    </span>
                  )}
                </div>
              )}
            </div>
          ))}
          {truncate && input.length > 3 && (
            <div className="text-sm text-slate-500 text-center py-2">
              +{input.length - 3} more items
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderOutput = (output: string | undefined, truncate = true) => {
    if (!output) return <span className="text-slate-400 italic">No expected output</span>;

    const displayText = truncate && output.length > 200 
      ? output.substring(0, 200) + '...' 
      : output;

    return (
      <div className="space-y-2">
        <pre className="whitespace-pre-wrap text-sm text-slate-700 font-mono bg-slate-50 p-3 rounded border">
          {displayText}
        </pre>
        {truncate && output.length > 200 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowFullOutput(!showFullOutput)}
            className="text-blue-600 hover:text-blue-800"
          >
            {showFullOutput ? <EyeOff className="h-4 w-4 mr-1" /> : <Eye className="h-4 w-4 mr-1" />}
            {showFullOutput ? 'Show less' : 'Show more'}
          </Button>
        )}
      </div>
    );
  };

  return (
    <Card className={`p-4 ${className}`}>
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h4 className="font-medium text-slate-900 truncate">
              {testCase.name}
            </h4>
            <Badge variant="secondary" className="text-xs">
              {testCase.type}
            </Badge>
            {testCase.is_global && (
              <Badge variant="outline" className="text-xs">
                Global
              </Badge>
            )}
          </div>
          <p className="text-xs text-slate-500">
            ID: {testCase.id}
          </p>
        </div>

        <div className="flex items-center gap-1 ml-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleCopyId}
            className="h-8 w-8 p-0"
            title="Copy ID"
          >
            <Copy className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleViewTestCase}
            className="h-8 w-8 p-0"
            title="View test case"
          >
            <ExternalLink className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowDetails(!showDetails)}
            className="h-8 w-8 p-0"
            title={showDetails ? "Hide details" : "Show details"}
          >
            {showDetails ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </Button>
        </div>
      </div>

      {/* Compact Preview */}
      {!showDetails && (
        <div className="space-y-2">
          {/* Input Preview */}
          <div>
            <span className="text-xs font-medium text-slate-600 uppercase tracking-wide">
              Input
            </span>
            <div className="mt-1">
              {typeof testCase.input === 'string' ? (
                <p className="text-sm text-slate-700 truncate">
                  {testCase.input}
                </p>
              ) : testCase.input ? (
                <div className="flex items-center gap-2">
                  <ImageIcon className="h-4 w-4 text-slate-500" />
                  <span className="text-sm text-slate-600">
                    Multimodal ({testCase.input.length} items)
                  </span>
                </div>
              ) : (
                <span className="text-sm text-slate-400 italic">No input</span>
              )}
            </div>
          </div>

          {/* Expected Output Preview */}
          {testCase.expected_output && (
            <div>
              <span className="text-xs font-medium text-slate-600 uppercase tracking-wide">
                Expected Output
              </span>
              <p className="text-sm text-slate-700 truncate mt-1">
                {testCase.expected_output}
              </p>
            </div>
          )}
        </div>
      )}

      {/* Detailed View */}
      {showDetails && (
        <div className="space-y-4">
          {/* Input */}
          <div>
            <h5 className="text-sm font-medium text-slate-900 mb-2">Input</h5>
            {renderInput(testCase.input, !showFullInput)}
          </div>

          {/* Expected Output */}
          {testCase.expected_output && (
            <div>
              <h5 className="text-sm font-medium text-slate-900 mb-2">Expected Output</h5>
              {renderOutput(testCase.expected_output, !showFullOutput)}
            </div>
          )}

          {/* Context */}
          {testCase.context && testCase.context.length > 0 && (
            <div>
              <h5 className="text-sm font-medium text-slate-900 mb-2">Context</h5>
              <div className="space-y-1">
                {testCase.context.map((ctx, index) => (
                  <div key={index} className="text-sm text-slate-700 bg-slate-50 p-2 rounded border">
                    {ctx}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Retrieval Context */}
          {testCase.retrieval_context && testCase.retrieval_context.length > 0 && (
            <div>
              <h5 className="text-sm font-medium text-slate-900 mb-2">Retrieval Context</h5>
              <div className="space-y-1">
                {testCase.retrieval_context.map((ctx, index) => (
                  <div key={index} className="text-sm text-slate-700 bg-slate-50 p-2 rounded border">
                    {ctx}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Additional Metadata */}
          {testCase.additional_metadata && Object.keys(testCase.additional_metadata).length > 0 && (
            <div>
              <h5 className="text-sm font-medium text-slate-900 mb-2">Additional Metadata</h5>
              <pre className="text-sm text-slate-700 bg-slate-50 p-3 rounded border overflow-x-auto">
                {JSON.stringify(testCase.additional_metadata, null, 2)}
              </pre>
            </div>
          )}

          {/* Timestamps */}
          <div className="pt-2 border-t border-slate-200">
            <div className="flex justify-between text-xs text-slate-500">
              <span>Created: {new Date(testCase.created_at).toLocaleDateString()}</span>
              <span>Updated: {new Date(testCase.updated_at).toLocaleDateString()}</span>
            </div>
          </div>
        </div>
      )}
    </Card>
  );
} 