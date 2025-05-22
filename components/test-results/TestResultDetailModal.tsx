import React, { useState } from 'react';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { CheckCircleIcon, XCircleIcon, ClockIcon, ChevronDownIcon, ChevronUpIcon } from '@heroicons/react/24/outline';
import { TestResult, MetricData } from '@/lib/schemas/testResult';

interface TestResultDetailModalProps {
  testResult: TestResult | null;
  isOpen: boolean;
  onClose: () => void;
}

export function TestResultDetailModal({ testResult, isOpen, onClose }: TestResultDetailModalProps) {
  if (!testResult) return null;
  
  const [expandedMetric, setExpandedMetric] = useState<string | null>(null);
  const [showVerboseLogs, setShowVerboseLogs] = useState<boolean>(false);

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
  const getStatusBadge = (success: boolean) => {
    if (success) {
      return (
        <Badge className="bg-green-500 text-white px-3 py-1">
          PASSED
        </Badge>
      );
    }
    return (
      <Badge className="bg-red-500 text-white px-3 py-1">
        FAILED
      </Badge>
    );
  };

  // Toggle metric details
  const toggleMetricDetails = (metricName: string) => {
    if (expandedMetric === metricName) {
      setExpandedMetric(null);
    } else {
      setExpandedMetric(metricName);
      setShowVerboseLogs(false);
    }
  };

  // Toggle verbose logs
  const toggleVerboseLogs = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowVerboseLogs(!showVerboseLogs);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto p-6">
        {/* Include DialogTitle for accessibility but position it within our custom header */}
        <DialogTitle className="sr-only">{testResult.name}</DialogTitle>
        
        {/* Main Header - Test Info */}
        <div className="flex justify-between items-center mb-6">
          <div className="flex flex-col">
            <h2 className="text-xl font-semibold text-slate-900">{testResult.name}</h2>
            <div className="text-sm text-slate-500 mt-1">
              <span className="mr-4">ID: {testResult.test_case_id}</span>
              <span className="flex items-center inline-block">
                <ClockIcon className="h-4 w-4 mr-1 inline" />
                <span>Run Duration: {getDuration()}</span>
              </span>
            </div>
          </div>
        </div>
        
        {/* Metrics Section - Top of Modal */}
        {testResult.metrics_data && testResult.metrics_data.length > 0 ? (
          <div className="mb-8">
            <h3 className="text-lg font-medium text-slate-800 mb-4">Metrics</h3>
            <div className="space-y-4">
              {testResult.metrics_data.map((metric, index) => (
                <div 
                  key={index} 
                  className="border border-slate-200 rounded-lg overflow-hidden"
                >
                  {/* Metric Header - Always visible and clickable */}
                  <div 
                    className="bg-slate-50 p-4 flex items-center justify-between cursor-pointer"
                    onClick={() => toggleMetricDetails(metric.name)}
                  >
                    <div className="flex items-center space-x-4">
                      <h4 className="font-medium text-slate-900">{metric.name}</h4>
                      {getStatusBadge(metric.success)}
                    </div>
                    
                    <div className="flex items-center space-x-6">
                      {metric.evaluation_model && (
                        <div className="text-sm text-slate-600">
                          <span className="font-medium">Model:</span> {metric.evaluation_model}
                        </div>
                      )}
                      
                      <div className="text-sm">
                        <span className="font-medium text-slate-600">Score:</span> 
                        <span className={metric.success ? 'text-green-600 font-medium ml-1' : 'text-red-600 font-medium ml-1'}>
                          {metric.score.toFixed(2)}
                        </span>
                        {metric.threshold !== undefined && (
                          <span className="text-slate-500 ml-2">
                            (Threshold: {metric.threshold.toFixed(2)})
                          </span>
                        )}
                      </div>
                      
                      <div className="text-slate-400">
                        {expandedMetric === metric.name ? 
                          <ChevronUpIcon className="h-5 w-5" /> : 
                          <ChevronDownIcon className="h-5 w-5" />
                        }
                      </div>
                    </div>
                  </div>
                  
                  {/* Metric Details - Expanded section */}
                  {expandedMetric === metric.name && (
                    <div className="p-4 border-t border-slate-200 bg-white">
                      {/* Reason */}
                      {metric.reason && (
                        <div className="mb-4">
                          <h5 className="text-sm font-medium text-slate-700 mb-1">Reason</h5>
                          <p className="text-sm text-slate-600">{metric.reason}</p>
                        </div>
                      )}
                      
                      {/* Additional properties */}
                      {metric.strict_mode !== undefined && (
                        <div className="mb-2 text-sm">
                          <span className="font-medium text-slate-700">Strict Mode:</span> 
                          <span className="ml-1 text-slate-600">{metric.strict_mode ? 'Yes' : 'No'}</span>
                        </div>
                      )}
                      
                      {metric.evaluation_cost !== undefined && (
                        <div className="mb-2 text-sm">
                          <span className="font-medium text-slate-700">Evaluation Cost:</span> 
                          <span className="ml-1 text-slate-600">${metric.evaluation_cost.toFixed(4)}</span>
                        </div>
                      )}
                      
                      {/* Verbose Logs Toggle */}
                      {metric.verbose_logs && (
                        <div className="mt-4">
                          <button 
                            className="flex items-center text-sm font-medium text-blue-600 hover:text-blue-800"
                            onClick={toggleVerboseLogs}
                          >
                            {showVerboseLogs ? 'Hide verbose logs' : 'Show verbose logs'}
                            {showVerboseLogs ? 
                              <ChevronUpIcon className="h-4 w-4 ml-1" /> : 
                              <ChevronDownIcon className="h-4 w-4 ml-1" />
                            }
                          </button>
                          
                          {showVerboseLogs && (
                            <div className="mt-2 p-3 bg-slate-50 rounded-md border border-slate-200 text-sm font-mono whitespace-pre-wrap text-slate-700 max-h-[300px] overflow-y-auto">
                              {metric.verbose_logs}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="bg-slate-50 p-4 rounded-md border border-slate-200 text-slate-500 mb-8">
            No metrics data available for this test result
          </div>
        )}
        
        {/* Main content grid */}
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
        
        {/* Additional Info row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm">
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
          
          {/* Additional Metadata */}
          <div className="col-span-1">
            <h3 className="text-xs uppercase font-medium text-slate-500 mb-2">Additional Metadata</h3>
            <div className="bg-slate-50 p-4 rounded-md border border-slate-200 text-slate-700 min-h-[80px] max-h-[200px] overflow-y-auto">
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
      </DialogContent>
    </Dialog>
  );
} 