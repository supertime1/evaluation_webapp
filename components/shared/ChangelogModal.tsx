'use client';

import React from 'react';
import { Calendar, User, FileText, Plus, Minus, Hash } from 'lucide-react';
import { DatasetVersion } from '@/lib/schemas/datasetVersion';
import { TestCase } from '@/lib/schemas/testCase';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface ChangelogModalProps {
  isOpen: boolean;
  onClose: () => void;
  version: DatasetVersion;
  previousVersion?: DatasetVersion;
  addedTestCases?: TestCase[];
  removedTestCases?: TestCase[];
  unchangedTestCases?: TestCase[];
}

export function ChangelogModal({
  isOpen,
  onClose,
  version,
  previousVersion,
  addedTestCases = [],
  removedTestCases = [],
  unchangedTestCases = [],
}: ChangelogModalProps) {
  const hasChanges = addedTestCases.length > 0 || removedTestCases.length > 0;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Version {version.version_number} Changelog
          </DialogTitle>
          <DialogDescription>
            Detailed summary of changes made in this version
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Version Metadata */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-slate-50 rounded-lg">
            <div className="flex items-center gap-2">
              <Hash className="h-4 w-4 text-slate-500" />
              <div>
                <p className="text-sm font-medium text-slate-900">Version</p>
                <p className="text-sm text-slate-600">{version.version_number}</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-slate-500" />
              <div>
                <p className="text-sm font-medium text-slate-900">Created</p>
                <p className="text-sm text-slate-600">
                  {new Date(version.created_at).toLocaleDateString()}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <User className="h-4 w-4 text-slate-500" />
              <div>
                <p className="text-sm font-medium text-slate-900">Created By</p>
                <p className="text-sm text-slate-600">{version.created_by_user_id}</p>
              </div>
            </div>
          </div>

          {/* Change Summary */}
          {version.change_summary && (
            <div>
              <h3 className="text-lg font-semibold text-slate-900 mb-3">Change Summary</h3>
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm text-slate-700 whitespace-pre-wrap">
                  {version.change_summary}
                </p>
              </div>
            </div>
          )}

          {/* Changes Overview */}
          {hasChanges && (
            <div>
              <h3 className="text-lg font-semibold text-slate-900 mb-3">Changes Overview</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {addedTestCases.length > 0 && (
                  <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <Plus className="h-4 w-4 text-green-600" />
                      <span className="font-medium text-green-800">Added</span>
                    </div>
                    <p className="text-2xl font-bold text-green-600">{addedTestCases.length}</p>
                    <p className="text-sm text-green-700">test cases</p>
                  </div>
                )}

                {removedTestCases.length > 0 && (
                  <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <Minus className="h-4 w-4 text-red-600" />
                      <span className="font-medium text-red-800">Removed</span>
                    </div>
                    <p className="text-2xl font-bold text-red-600">{removedTestCases.length}</p>
                    <p className="text-sm text-red-700">test cases</p>
                  </div>
                )}

                {unchangedTestCases.length > 0 && (
                  <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <FileText className="h-4 w-4 text-slate-600" />
                      <span className="font-medium text-slate-800">Unchanged</span>
                    </div>
                    <p className="text-2xl font-bold text-slate-600">{unchangedTestCases.length}</p>
                    <p className="text-sm text-slate-700">test cases</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Detailed Changes */}
          {hasChanges && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-slate-900">Detailed Changes</h3>

              {/* Added Test Cases */}
              {addedTestCases.length > 0 && (
                <div>
                  <h4 className="text-md font-medium text-green-800 mb-3 flex items-center gap-2">
                    <Plus className="h-4 w-4" />
                    Added Test Cases ({addedTestCases.length})
                  </h4>
                  <div className="space-y-2">
                    {addedTestCases.map(testCase => (
                      <div
                        key={testCase.id}
                        className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-md"
                      >
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-slate-900">{testCase.name}</span>
                            <Badge variant="secondary" className="text-xs">
                              {testCase.type}
                            </Badge>
                            {testCase.is_global && (
                              <Badge variant="outline" className="text-xs">
                                Global
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-slate-600 mt-1 truncate">
                            {testCase.input?.toString().substring(0, 100)}
                            {(testCase.input?.toString().length || 0) > 100 ? '...' : ''}
                          </p>
                        </div>
                        <div className="text-xs text-slate-500">
                          {testCase.id}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Removed Test Cases */}
              {removedTestCases.length > 0 && (
                <div>
                  <h4 className="text-md font-medium text-red-800 mb-3 flex items-center gap-2">
                    <Minus className="h-4 w-4" />
                    Removed Test Cases ({removedTestCases.length})
                  </h4>
                  <div className="space-y-2">
                    {removedTestCases.map(testCase => (
                      <div
                        key={testCase.id}
                        className="flex items-center justify-between p-3 bg-red-50 border border-red-200 rounded-md"
                      >
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-slate-900">{testCase.name}</span>
                            <Badge variant="secondary" className="text-xs">
                              {testCase.type}
                            </Badge>
                            {testCase.is_global && (
                              <Badge variant="outline" className="text-xs">
                                Global
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-slate-600 mt-1 truncate">
                            {testCase.input?.toString().substring(0, 100)}
                            {(testCase.input?.toString().length || 0) > 100 ? '...' : ''}
                          </p>
                        </div>
                        <div className="text-xs text-slate-500">
                          {testCase.id}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* No Changes Message */}
          {!hasChanges && (
            <div className="text-center py-8">
              <FileText className="h-12 w-12 text-slate-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-slate-900 mb-2">No Changes</h3>
              <p className="text-slate-600">
                This version contains the same test cases as the previous version.
              </p>
            </div>
          )}

          {/* Previous Version Comparison */}
          {previousVersion && (
            <div className="pt-4 border-t border-slate-200">
              <div className="flex items-center justify-between text-sm text-slate-600">
                <span>
                  Compared to Version {previousVersion.version_number}
                </span>
                <span>
                  Total test cases: {version.test_case_ids.length}
                </span>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
} 