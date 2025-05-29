'use client';

import { useState } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useDatasetVersionTestCases } from '@/lib/hooks/useDatasetVersionManager';
import { TestCasePreview } from '@/components/datasets/TestCasePreview';
import { Search, FileText, Calendar, Hash, Tag } from 'lucide-react';

interface DatasetVersionDetailModalProps {
  version: any;
  trigger: React.ReactNode;
  isCurrent?: boolean;
  isLatest?: boolean;
}

export function DatasetVersionDetailModal({ 
  version, 
  trigger, 
  isCurrent = false, 
  isLatest = false 
}: DatasetVersionDetailModalProps) {
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  const { data: testCases = [], isLoading } = useDatasetVersionTestCases(
    open ? version.id : ''
  );

  // Filter test cases based on search
  const filteredTestCases = testCases.filter(tc => {
    if (!searchQuery) return true;
    
    const query = searchQuery.toLowerCase();
    return (
      tc.name.toLowerCase().includes(query) ||
      tc.type.toLowerCase().includes(query) ||
      tc.input?.toString().toLowerCase().includes(query) ||
      tc.expected_output?.toString().toLowerCase().includes(query)
    );
  });

  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen);
    if (!newOpen) {
      setSearchQuery('');
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        {trigger}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[800px] max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <Tag className="h-5 w-5" />
            <span>Version {version.version_number} Details</span>
            <div className="flex items-center gap-2">
              {isCurrent && (
                <Badge variant="default" className="bg-green-100 text-green-800 text-xs">
                  Current
                </Badge>
              )}
              {isLatest && !isCurrent && (
                <Badge variant="secondary" className="bg-blue-100 text-blue-800 text-xs">
                  Latest
                </Badge>
              )}
            </div>
          </DialogTitle>
        </DialogHeader>

        <div className="flex flex-col flex-1 min-h-0 space-y-4">
          {/* Version Info */}
          <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-slate-400" />
                <span className="text-slate-600">Created:</span>
                <span className="font-medium">
                  {formatDistanceToNow(new Date(version.created_at), { addSuffix: true })}
                </span>
              </div>
              
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4 text-slate-400" />
                <span className="text-slate-600">Test Cases:</span>
                <span className="font-medium">
                  {version.test_case_ids.length}
                </span>
              </div>
              
              <div className="flex items-center gap-2">
                <Hash className="h-4 w-4 text-slate-400" />
                <span className="text-slate-600">Version ID:</span>
                <span className="font-mono text-xs bg-slate-200 px-2 py-1 rounded">
                  {version.id.slice(-8)}
                </span>
              </div>
            </div>
            
            {version.change_summary && (
              <div className="mt-3 pt-3 border-t border-slate-200">
                <p className="text-sm text-slate-700 leading-relaxed">
                  <span className="font-medium">Change Summary:</span> {version.change_summary}
                </p>
              </div>
            )}
          </div>

          {/* Search */}
          <div className="flex items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
              <input
                type="text"
                placeholder="Search test cases..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 h-10 border border-slate-300 rounded-md focus:border-slate-400 focus:ring-2 focus:ring-slate-200 text-sm"
              />
            </div>
            <div className="text-sm text-slate-600 whitespace-nowrap">
              {filteredTestCases.length} of {testCases.length} test cases
            </div>
          </div>

          {/* Test Cases List */}
          <div className="flex-1 min-h-0 overflow-y-auto">
            {isLoading ? (
              <div className="space-y-3">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="h-24 bg-slate-200 rounded animate-pulse"></div>
                ))}
              </div>
            ) : filteredTestCases.length === 0 ? (
              <div className="text-center py-12 text-slate-500">
                <FileText className="h-12 w-12 mx-auto mb-4 text-slate-300" />
                <p className="text-lg font-medium mb-2">
                  {searchQuery ? 'No test cases match your search' : 'No test cases in this version'}
                </p>
                <p className="text-sm">
                  {searchQuery 
                    ? 'Try adjusting your search terms.' 
                    : 'This version doesn\'t contain any test cases.'
                  }
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredTestCases.map((testCase) => (
                  <TestCasePreview
                    key={testCase.id}
                    testCase={testCase}
                    className="hover:shadow-md transition-shadow"
                  />
                ))}
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