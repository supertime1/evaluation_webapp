import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { CheckCircleIcon, XCircleIcon, ClockIcon } from '@heroicons/react/24/outline';
import { TestResult, MetricData } from '@/lib/schemas/testResult';

interface TestResultDetailModalProps {
  testResult: TestResult | null;
  isOpen: boolean;
  onClose: () => void;
}

export function TestResultDetailModal({ testResult, isOpen, onClose }: TestResultDetailModalProps) {
  if (!testResult) return null;

  // Format the input/output for display
  const formatContent = (content: any, isInput: boolean = false): React.ReactNode => {
    if (content === undefined || content === null) return 'None';
    
    if (typeof content === 'string') {
      // Special handling for resume-style input content
      if (isInput && content.includes('\n')) {
        const lines = content.split('\n').filter(line => line.trim() !== '');
        
        return (
          <div className="flex flex-col">
            {lines.map((line, i) => {
              // Format bullet points specially
              if (line.trim().startsWith('•')) {
                return (
                  <div key={i} className="flex items-baseline">
                    <span className="mr-2">•</span>
                    <span>{line.trim().substring(1).trim()}</span>
                  </div>
                );
              }
              
              return (
                <div key={i} className="mb-1">
                  {line.trim()}
                </div>
              );
            })}
          </div>
        );
      } 
      // Regular paragraph text for outputs
      else if (content.includes('\n')) {
        const lines = content.split('\n').filter(line => line.trim() !== '');
        return (
          <div>
            {lines.map((line, i) => (
              <div key={i} className={i !== 0 ? 'mt-1' : ''}>
                {line}
              </div>
            ))}
          </div>
        );
      }
      return content;
    }
    
    // For non-string content, format as JSON
    return JSON.stringify(content, null, 2);
  };

  // Format arrays for display
  const formatArray = (arr: string[] | undefined | null): string => {
    if (!arr || arr.length === 0) return 'None';
    return arr.join(', ');
  };

  // Get duration if available
  const getDuration = (): string => {
    if (testResult.additional_metadata?.duration) {
      return `${testResult.additional_metadata.duration.toFixed(1)}s`;
    }
    return 'N/A';
  };

  // Get status badge
  const getStatusBadge = () => {
    if (testResult.success) {
      return (
        <Badge className="bg-green-500 text-white">
          PASSED
        </Badge>
      );
    }
    return (
      <Badge className="bg-red-500 text-white">
        FAILED
      </Badge>
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto p-0">
        {/* Include DialogTitle for accessibility but position it within our custom header */}
        <DialogTitle className="sr-only">{testResult.name}</DialogTitle>
        
        {/* Header */}
        <div className="bg-slate-900 text-white p-4 flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <h2 className="text-lg font-medium">{testResult.name}</h2>
            <span className="text-slate-400 text-sm">ID: {testResult.test_case_id}</span>
          </div>
          <div className="flex items-center space-x-4">
            {getStatusBadge()}
            <div className="flex items-center text-slate-400 text-sm">
              <ClockIcon className="h-4 w-4 mr-1" />
              Run Duration: {getDuration()}
            </div>
          </div>
        </div>
        
        {/* Main content grid */}
        <div className="px-6 py-4">
          {/* Main content - Input, Output, Expected sections */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6 text-sm">
            {/* Input Column */}
            <div className="col-span-1">
              <h3 className="text-xs uppercase font-medium text-slate-500 mb-2">Input</h3>
              <div className="bg-slate-50 p-4 rounded-md border border-slate-200 text-slate-700 min-h-[150px] max-h-[300px] overflow-y-auto">
                {formatContent(testResult.input, true)}
              </div>
            </div>
            
            {/* Actual Output Column */}
            <div className="col-span-1">
              <h3 className="text-xs uppercase font-medium text-slate-500 mb-2">Actual Output</h3>
              <div className="bg-slate-50 p-4 rounded-md border border-slate-200 text-slate-700 min-h-[150px] max-h-[300px] overflow-y-auto">
                {formatContent(testResult.actual_output)}
              </div>
            </div>
            
            {/* Expected Output Column */}
            <div className="col-span-1">
              <h3 className="text-xs uppercase font-medium text-slate-500 mb-2">Expected Output</h3>
              <div className="bg-slate-50 p-4 rounded-md border border-slate-200 text-slate-700 min-h-[150px] max-h-[300px] overflow-y-auto">
                {formatContent(testResult.expected_output)}
              </div>
            </div>
          </div>
          
          {/* Secondary row */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6 text-sm">
            {/* Retrieval Context */}
            <div className="col-span-1">
              <h3 className="text-xs uppercase font-medium text-slate-500 mb-2">Retrieval Context</h3>
              <div className="bg-slate-50 p-4 rounded-md border border-slate-200 text-slate-700 min-h-[80px] max-h-[200px] overflow-y-auto">
                {formatArray(testResult.retrieval_context)}
              </div>
            </div>
            
            {/* Tools Called */}
            <div className="col-span-1">
              <h3 className="text-xs uppercase font-medium text-slate-500 mb-2">Tools Called</h3>
              <div className="bg-slate-50 p-4 rounded-md border border-slate-200 text-slate-700 min-h-[80px] max-h-[200px] overflow-y-auto">
                {testResult.additional_metadata?.tools_called 
                  ? formatContent(testResult.additional_metadata.tools_called) 
                  : 'None'}
              </div>
            </div>
            
            {/* Expected Tools */}
            <div className="col-span-1">
              <h3 className="text-xs uppercase font-medium text-slate-500 mb-2">Expected Tools</h3>
              <div className="bg-slate-50 p-4 rounded-md border border-slate-200 text-slate-700 min-h-[80px] max-h-[200px] overflow-y-auto">
                {testResult.additional_metadata?.expected_tools 
                  ? formatContent(testResult.additional_metadata.expected_tools) 
                  : 'None'}
              </div>
            </div>
          </div>
          
          {/* Metrics and Context row */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6 text-sm">
            {/* Context */}
            <div className="col-span-1">
              <h3 className="text-xs uppercase font-medium text-slate-500 mb-2">Context</h3>
              <div className="bg-slate-50 p-4 rounded-md border border-slate-200 text-slate-700 min-h-[80px] max-h-[200px] overflow-y-auto">
                {formatArray(testResult.context)}
              </div>
            </div>
            
            {/* Comments */}
            <div className="col-span-1">
              <h3 className="text-xs uppercase font-medium text-slate-500 mb-2">Comments</h3>
              <div className="bg-slate-50 p-4 rounded-md border border-slate-200 text-slate-700 min-h-[80px] max-h-[200px] overflow-y-auto">
                {testResult.additional_metadata?.comments 
                  ? formatContent(testResult.additional_metadata.comments) 
                  : 'None'}
              </div>
            </div>
            
            {/* Metrics Data */}
            <div className="col-span-1">
              <h3 className="text-xs uppercase font-medium text-slate-500 mb-2">Metrics</h3>
              <div className="bg-slate-50 p-4 rounded-md border border-slate-200 text-slate-700 min-h-[80px] max-h-[200px] overflow-y-auto">
                {testResult.metrics_data && testResult.metrics_data.length > 0 ? (
                  <div className="space-y-2">
                    {testResult.metrics_data.map((metric: MetricData, index: number) => (
                      <div key={index} className="flex justify-between">
                        <span>{metric.name}:</span>
                        <span className={metric.success ? 'text-green-600' : 'text-red-600'}>
                          {metric.score.toFixed(2)}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-slate-500">None</div>
                )}
              </div>
            </div>
          </div>
          
          {/* Bottom row - additional metadata */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm">
            {/* Token Cost */}
            <div className="col-span-1">
              <h3 className="text-xs uppercase font-medium text-slate-500 mb-2">Token Cost</h3>
              <div className="bg-slate-50 p-4 rounded-md border border-slate-200 text-slate-700 min-h-[60px] max-h-[150px] overflow-y-auto">
                {testResult.additional_metadata?.token_cost 
                  ? formatContent(testResult.additional_metadata.token_cost) 
                  : 'None'}
              </div>
            </div>
            
            {/* Completion Time */}
            <div className="col-span-1">
              <h3 className="text-xs uppercase font-medium text-slate-500 mb-2">Completion Time</h3>
              <div className="bg-slate-50 p-4 rounded-md border border-slate-200 text-slate-700 min-h-[60px] max-h-[150px] overflow-y-auto">
                {testResult.additional_metadata?.completion_time 
                  ? formatContent(testResult.additional_metadata.completion_time) 
                  : 'None'}
              </div>
            </div>
            
            {/* Additional Metadata */}
            <div className="col-span-1">
              <h3 className="text-xs uppercase font-medium text-slate-500 mb-2">Additional Metadata</h3>
              <div className="bg-slate-50 p-4 rounded-md border border-slate-200 text-slate-700 min-h-[60px] max-h-[150px] overflow-y-auto">
                {testResult.additional_metadata && 
                Object.keys(testResult.additional_metadata).filter(key => 
                  !['duration', 'tools_called', 'expected_tools', 'comments', 'token_cost', 'completion_time'].includes(key)
                ).length > 0 
                  ? (
                    <pre className="whitespace-pre-wrap text-xs">
                      {JSON.stringify(
                        Object.fromEntries(
                          Object.entries(testResult.additional_metadata).filter(([key]) => 
                            !['duration', 'tools_called', 'expected_tools', 'comments', 'token_cost', 'completion_time'].includes(key)
                          )
                        ), 
                        null, 
                        2
                      )}
                    </pre>
                  ) 
                  : 'None'}
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
} 