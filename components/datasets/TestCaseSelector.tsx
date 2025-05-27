'use client';

import React, { useState, useMemo } from 'react';
import { Search, Check, X, Filter } from 'lucide-react';
import { TestCase } from '@/lib/schemas/testCase';
import { useAllTestCases } from '@/lib/hooks/useTestCaseManager';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';

interface TestCaseSelectorProps {
  selectedTestCaseIds: string[];
  onSelectionChange: (testCaseIds: string[]) => void;
  excludeTestCaseIds?: string[]; // Test cases to exclude from selection
  maxSelections?: number;
  className?: string;
}

export function TestCaseSelector({
  selectedTestCaseIds,
  onSelectionChange,
  excludeTestCaseIds = [],
  maxSelections,
  className = '',
}: TestCaseSelectorProps) {
  const { data: testCases = [], isLoading, error } = useAllTestCases();
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [showGlobalOnly, setShowGlobalOnly] = useState(false);

  // Filter and search test cases
  const filteredTestCases = useMemo(() => {
    return testCases.filter(testCase => {
      // Exclude specified test cases
      if (excludeTestCaseIds.includes(testCase.id)) {
        return false;
      }

      // Search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const matchesName = testCase.name.toLowerCase().includes(query);
        const matchesType = testCase.type.toLowerCase().includes(query);
        const matchesInput = testCase.input?.toString().toLowerCase().includes(query);
        
        if (!matchesName && !matchesType && !matchesInput) {
          return false;
        }
      }

      // Type filter
      if (typeFilter !== 'all' && testCase.type !== typeFilter) {
        return false;
      }

      // Global filter
      if (showGlobalOnly && !testCase.is_global) {
        return false;
      }

      return true;
    });
  }, [testCases, searchQuery, typeFilter, showGlobalOnly, excludeTestCaseIds]);

  // Get unique test case types for filter
  const testCaseTypes = useMemo(() => {
    const types = new Set(testCases.map(tc => tc.type));
    return Array.from(types);
  }, [testCases]);

  const handleTestCaseToggle = (testCaseId: string) => {
    const isSelected = selectedTestCaseIds.includes(testCaseId);
    
    if (isSelected) {
      // Remove from selection
      onSelectionChange(selectedTestCaseIds.filter(id => id !== testCaseId));
    } else {
      // Add to selection (check max limit)
      if (maxSelections && selectedTestCaseIds.length >= maxSelections) {
        return; // Don't add if at max limit
      }
      onSelectionChange([...selectedTestCaseIds, testCaseId]);
    }
  };

  const handleSelectAll = () => {
    const availableIds = filteredTestCases.map(tc => tc.id);
    const limitedIds = maxSelections 
      ? availableIds.slice(0, maxSelections) 
      : availableIds;
    onSelectionChange(limitedIds);
  };

  const handleClearAll = () => {
    onSelectionChange([]);
  };

  if (isLoading) {
    return (
      <div className={`space-y-4 ${className}`}>
        <div className="animate-pulse">
          <div className="h-10 bg-slate-200 rounded-md mb-4"></div>
          <div className="space-y-2">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-16 bg-slate-200 rounded-md"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md ${className}`}>
        Error loading test cases: {error.message}
      </div>
    );
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Search and Filters */}
      <div className="space-y-3">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
          <input
            type="text"
            placeholder="Search test cases..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 h-10 border border-slate-300 rounded-md focus:border-slate-400 focus:ring-2 focus:ring-slate-200 text-sm"
          />
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-4 items-center">
          {/* Type Filter */}
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-slate-500" />
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="border border-slate-300 rounded-md px-3 py-1 text-sm focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
            >
              <option value="all">All Types</option>
              {testCaseTypes.map(type => (
                <option key={type} value={type}>
                  {type.charAt(0).toUpperCase() + type.slice(1)}
                </option>
              ))}
            </select>
          </div>

          {/* Global Filter */}
          <div className="flex items-center gap-2">
            <Switch
              id="global-filter"
              checked={showGlobalOnly}
              onCheckedChange={setShowGlobalOnly}
            />
            <Label htmlFor="global-filter" className="text-sm">
              Global only
            </Label>
          </div>
        </div>
      </div>

      {/* Selection Summary */}
      <div className="flex items-center justify-between bg-slate-50 px-4 py-3 rounded-md">
        <div className="flex items-center gap-2">
          <span className="text-sm text-slate-700">
            {selectedTestCaseIds.length} selected
            {maxSelections && ` of ${maxSelections} max`}
          </span>
          {filteredTestCases.length > 0 && (
            <span className="text-sm text-slate-500">
              ({filteredTestCases.length} available)
            </span>
          )}
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleSelectAll}
                         disabled={filteredTestCases.length === 0 || (maxSelections ? selectedTestCaseIds.length >= maxSelections : false)}
          >
            Select All
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleClearAll}
            disabled={selectedTestCaseIds.length === 0}
          >
            Clear All
          </Button>
        </div>
      </div>

      {/* Test Cases List */}
      <div className="space-y-2 max-h-96 overflow-y-auto">
        {filteredTestCases.length === 0 ? (
          <div className="text-center py-8 text-slate-500">
            {searchQuery || typeFilter !== 'all' || showGlobalOnly
              ? 'No test cases match your filters'
              : 'No test cases available'
            }
          </div>
        ) : (
          filteredTestCases.map(testCase => {
            const isSelected = selectedTestCaseIds.includes(testCase.id);
            const isDisabled = !isSelected && maxSelections && selectedTestCaseIds.length >= maxSelections;

            return (
              <Card
                key={testCase.id}
                className={`p-4 cursor-pointer transition-colors ${
                  isSelected 
                    ? 'border-blue-300 bg-blue-50' 
                    : isDisabled
                    ? 'border-slate-200 bg-slate-50 opacity-50 cursor-not-allowed'
                    : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                }`}
                onClick={() => !isDisabled && handleTestCaseToggle(testCase.id)}
              >
                <div className="flex items-start gap-3">
                  {/* Checkbox */}
                  <div className={`w-5 h-5 rounded border-2 flex items-center justify-center mt-0.5 ${
                    isSelected 
                      ? 'bg-blue-600 border-blue-600' 
                      : 'border-slate-300'
                  }`}>
                    {isSelected && <Check className="h-3 w-3 text-white" />}
                  </div>

                  {/* Test Case Info */}
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
                    
                    {testCase.input && (
                      <p className="text-sm text-slate-600 truncate">
                        {typeof testCase.input === 'string' 
                          ? testCase.input 
                          : 'Multimodal input'
                        }
                      </p>
                    )}
                    
                    <p className="text-xs text-slate-500 mt-1">
                      ID: {testCase.id}
                    </p>
                  </div>
                </div>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
} 