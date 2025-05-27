'use client';

import React, { useState, useMemo } from 'react';
import { Database, Plus, Minus, Search, Filter, ExternalLink } from 'lucide-react';
import { TestCase } from '@/lib/schemas/testCase';
import { Dataset } from '@/lib/schemas/dataset';
import { useDatasets, useAddTestCaseToDataset, useRemoveTestCaseFromDataset } from '@/lib/hooks/useDatasetManager';
import { useDatasetVersions } from '@/lib/hooks/useDatasetVersionManager';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { GlobalDatasetBadge } from './GlobalDatasetBadge';

interface TestCaseDatasetManagerProps {
  testCase: TestCase;
  className?: string;
}

interface DatasetWithTestCaseStatus extends Dataset {
  containsTestCase: boolean;
  isInCurrentVersion: boolean;
}

export function TestCaseDatasetManager({
  testCase,
  className = '',
}: TestCaseDatasetManagerProps) {
  const { data: allDatasets = [] } = useDatasets();
  const addToDatasetMutation = useAddTestCaseToDataset();
  const removeFromDatasetMutation = useRemoveTestCaseFromDataset();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [showGlobalOnly, setShowGlobalOnly] = useState(false);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [selectedDatasetId, setSelectedDatasetId] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState(false);

  // Get dataset versions to check which datasets contain this test case
  const datasetVersionQueries = allDatasets.map(dataset => 
    useDatasetVersions(dataset.id)
  );

  // Determine which datasets contain this test case
  const datasetsWithStatus = useMemo((): DatasetWithTestCaseStatus[] => {
    return allDatasets.map((dataset, index) => {
      const versions = datasetVersionQueries[index]?.data || [];
      const currentVersion = versions.find(v => v.id === dataset.current_version_id);
      
      const containsTestCase = versions.some(version => 
        version.test_case_ids.includes(testCase.id)
      );
      
      const isInCurrentVersion = currentVersion?.test_case_ids.includes(testCase.id) || false;

      return {
        ...dataset,
        containsTestCase,
        isInCurrentVersion,
      };
    });
  }, [allDatasets, datasetVersionQueries, testCase.id]);

  // Filter datasets based on search and filters
  const filteredDatasets = useMemo(() => {
    return datasetsWithStatus.filter(dataset => {
      // Search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const matchesName = dataset.name.toLowerCase().includes(query);
        const matchesDescription = dataset.description?.toLowerCase().includes(query);
        
        if (!matchesName && !matchesDescription) {
          return false;
        }
      }

      // Global filter
      if (showGlobalOnly && !dataset.is_global) {
        return false;
      }

      return true;
    });
  }, [datasetsWithStatus, searchQuery, showGlobalOnly]);

  // Separate datasets that contain vs don't contain the test case
  const datasetsContaining = filteredDatasets.filter(d => d.containsTestCase);
  const datasetsNotContaining = filteredDatasets.filter(d => !d.containsTestCase);

  const handleAddToDataset = async () => {
    if (!selectedDatasetId) return;

    setIsProcessing(true);
    try {
      await addToDatasetMutation.mutateAsync({
        datasetId: selectedDatasetId,
        testCaseId: testCase.id,
      });
      
      setShowAddDialog(false);
      setSelectedDatasetId('');
    } catch (error) {
      console.error('Error adding test case to dataset:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleRemoveFromDataset = async (datasetId: string) => {
    setIsProcessing(true);
    try {
      await removeFromDatasetMutation.mutateAsync({
        datasetId,
        testCaseId: testCase.id,
      });
    } catch (error) {
      console.error('Error removing test case from dataset:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Database className="h-5 w-5 text-slate-600" />
          <h3 className="text-lg font-semibold text-slate-900">
            Dataset Relationships
          </h3>
        </div>
        
        <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Add to Dataset
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add to Dataset</DialogTitle>
              <DialogDescription>
                Add "{testCase.name}" to a dataset.
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Select Dataset
                </label>
                <select
                  value={selectedDatasetId}
                  onChange={(e) => setSelectedDatasetId(e.target.value)}
                  className="w-full border border-slate-300 rounded-md px-3 py-2 focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
                >
                  <option value="">Choose a dataset...</option>
                  {datasetsNotContaining.map(dataset => (
                    <option key={dataset.id} value={dataset.id}>
                      {dataset.name} {dataset.is_global && '(Global)'}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setShowAddDialog(false)}
                disabled={isProcessing}
              >
                Cancel
              </Button>
              <Button
                onClick={handleAddToDataset}
                disabled={!selectedDatasetId || isProcessing}
              >
                {isProcessing ? 'Adding...' : 'Add to Dataset'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Search and Filters */}
      <div className="space-y-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
          <input
            type="text"
            placeholder="Search datasets..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 h-10 border border-slate-300 rounded-md focus:border-slate-400 focus:ring-2 focus:ring-slate-200 text-sm"
          />
        </div>

        <div className="flex items-center gap-2">
          <Switch
            id="global-filter"
            checked={showGlobalOnly}
            onCheckedChange={setShowGlobalOnly}
          />
          <Label htmlFor="global-filter" className="text-sm">
            Show global datasets only
          </Label>
        </div>
      </div>

      {/* Datasets Containing Test Case */}
      {datasetsContaining.length > 0 && (
        <div>
          <h4 className="text-base font-medium text-slate-900 mb-3">
            Datasets containing this test case ({datasetsContaining.length})
          </h4>
          <div className="space-y-2">
            {datasetsContaining.map(dataset => (
              <Card key={dataset.id} className="p-4 border-green-200 bg-green-50">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h5 className="font-medium text-slate-900">
                        {dataset.name}
                      </h5>
                                             {dataset.is_global && <GlobalDatasetBadge isGlobal={dataset.is_global} />}
                       {dataset.isInCurrentVersion && (
                         <Badge variant="secondary" className="text-xs bg-green-100 text-green-800">
                           Current Version
                         </Badge>
                       )}
                    </div>
                    
                    {dataset.description && (
                      <p className="text-sm text-slate-600 mb-2">
                        {dataset.description}
                      </p>
                    )}
                    
                    <p className="text-xs text-slate-500">
                      ID: {dataset.id}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="gap-2"
                      onClick={() => window.open(`/dashboard/datasets/${dataset.id}`, '_blank')}
                    >
                      <ExternalLink className="h-4 w-4" />
                      View
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="gap-2 text-red-600 hover:text-red-700"
                      onClick={() => handleRemoveFromDataset(dataset.id)}
                      disabled={isProcessing}
                    >
                      <Minus className="h-4 w-4" />
                      Remove
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Datasets Not Containing Test Case */}
      {datasetsNotContaining.length > 0 && (
        <div>
          <h4 className="text-base font-medium text-slate-900 mb-3">
            Available datasets ({datasetsNotContaining.length})
          </h4>
          <div className="space-y-2">
            {datasetsNotContaining.map(dataset => (
              <Card key={dataset.id} className="p-4 hover:bg-slate-50">
                <div className="flex items-center justify-between">
                                     <div className="flex-1">
                     <div className="flex items-center gap-2 mb-1">
                       <h5 className="font-medium text-slate-900">
                         {dataset.name}
                       </h5>
                       {dataset.is_global && <GlobalDatasetBadge isGlobal={dataset.is_global} />}
                     </div>
                    
                    {dataset.description && (
                      <p className="text-sm text-slate-600 mb-2">
                        {dataset.description}
                      </p>
                    )}
                    
                    <p className="text-xs text-slate-500">
                      ID: {dataset.id}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="gap-2"
                      onClick={() => window.open(`/dashboard/datasets/${dataset.id}`, '_blank')}
                    >
                      <ExternalLink className="h-4 w-4" />
                      View
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="gap-2"
                      onClick={() => {
                        setSelectedDatasetId(dataset.id);
                        setShowAddDialog(true);
                      }}
                      disabled={isProcessing}
                    >
                      <Plus className="h-4 w-4" />
                      Add
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {filteredDatasets.length === 0 && (
        <div className="text-center py-8">
          <Database className="h-12 w-12 text-slate-300 mx-auto mb-4" />
          <h4 className="text-lg font-medium text-slate-900 mb-2">
            No datasets found
          </h4>
          <p className="text-slate-600">
            {searchQuery || showGlobalOnly
              ? 'No datasets match your search criteria.'
              : 'Create a dataset to organize your test cases.'
            }
          </p>
        </div>
      )}
    </div>
  );
} 