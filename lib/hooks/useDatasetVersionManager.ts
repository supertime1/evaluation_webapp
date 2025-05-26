import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { datasetVersionManager } from '@/lib/managers/datasetVersionManager';
import { DatasetVersionCreate } from '@/lib/schemas/datasetVersion';

// Query keys for React Query
export const datasetVersionKeys = {
  all: ['datasetVersions'] as const,
  lists: () => [...datasetVersionKeys.all, 'list'] as const,
  list: (datasetId: string) => [...datasetVersionKeys.lists(), datasetId] as const,
  details: () => [...datasetVersionKeys.all, 'detail'] as const,
  detail: (id: string) => [...datasetVersionKeys.details(), id] as const,
  testCases: (versionId: string) => [...datasetVersionKeys.all, 'testCases', versionId] as const,
  withTestCases: (versionId: string) => [...datasetVersionKeys.all, 'withTestCases', versionId] as const,
  latest: (datasetId: string) => [...datasetVersionKeys.all, 'latest', datasetId] as const,
  history: (datasetId: string) => [...datasetVersionKeys.all, 'history', datasetId] as const,
  comparison: (fromId: string, toId: string) => [...datasetVersionKeys.all, 'comparison', fromId, toId] as const,
};

// Get dataset versions for a dataset
export function useDatasetVersions(datasetId: string) {
  return useQuery({
    queryKey: datasetVersionKeys.list(datasetId),
    queryFn: () => datasetVersionManager.getDatasetVersions(datasetId),
    enabled: !!datasetId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

// Get dataset version by ID
export function useDatasetVersion(versionId: string) {
  return useQuery({
    queryKey: datasetVersionKeys.detail(versionId),
    queryFn: () => datasetVersionManager.getDatasetVersionById(versionId),
    enabled: !!versionId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

// Get test cases for a dataset version
export function useDatasetVersionTestCases(versionId: string) {
  return useQuery({
    queryKey: datasetVersionKeys.testCases(versionId),
    queryFn: () => datasetVersionManager.getDatasetVersionTestCases(versionId),
    enabled: !!versionId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

// Get dataset version with test cases
export function useDatasetVersionWithTestCases(versionId: string) {
  return useQuery({
    queryKey: datasetVersionKeys.withTestCases(versionId),
    queryFn: () => datasetVersionManager.getDatasetVersionWithTestCases(versionId),
    enabled: !!versionId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

// Get latest version for a dataset
export function useLatestDatasetVersion(datasetId: string) {
  return useQuery({
    queryKey: datasetVersionKeys.latest(datasetId),
    queryFn: () => datasetVersionManager.getLatestVersion(datasetId),
    enabled: !!datasetId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

// Get version history for a dataset
export function useDatasetVersionHistory(datasetId: string) {
  return useQuery({
    queryKey: datasetVersionKeys.history(datasetId),
    queryFn: () => datasetVersionManager.getVersionHistory(datasetId),
    enabled: !!datasetId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

// Compare two dataset versions
export function useCompareDatasetVersions(fromVersionId: string, toVersionId: string) {
  return useQuery({
    queryKey: datasetVersionKeys.comparison(fromVersionId, toVersionId),
    queryFn: () => datasetVersionManager.compareVersions(fromVersionId, toVersionId),
    enabled: !!fromVersionId && !!toVersionId,
    staleTime: 10 * 60 * 1000, // 10 minutes (comparisons are stable)
  });
}

// Get versions that contain a specific test case
export function useVersionsByTestCase(testCaseId: string) {
  return useQuery({
    queryKey: [...datasetVersionKeys.all, 'byTestCase', testCaseId],
    queryFn: () => datasetVersionManager.getVersionsByTestCase(testCaseId),
    enabled: !!testCaseId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

// Check if test case exists in version
export function useTestCaseExistsInVersion(versionId: string, testCaseId: string) {
  return useQuery({
    queryKey: [...datasetVersionKeys.all, 'testCaseExists', versionId, testCaseId],
    queryFn: () => datasetVersionManager.testCaseExistsInVersion(versionId, testCaseId),
    enabled: !!versionId && !!testCaseId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

// Create dataset version mutation
export function useCreateDatasetVersion() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ datasetId, data }: { datasetId: string; data: DatasetVersionCreate }) => 
      datasetVersionManager.createDatasetVersion(datasetId, data),
    onSuccess: (newVersion, { datasetId }) => {
      // Invalidate version lists for this dataset
      queryClient.invalidateQueries({ queryKey: datasetVersionKeys.list(datasetId) });
      queryClient.invalidateQueries({ queryKey: datasetVersionKeys.history(datasetId) });
      queryClient.invalidateQueries({ queryKey: datasetVersionKeys.latest(datasetId) });
      
      // Update dataset cache to reflect new current version
      queryClient.invalidateQueries({ queryKey: ['datasets', 'detail', datasetId] });
      
      // Set the new version in cache
      queryClient.setQueryData(
        datasetVersionKeys.detail(newVersion.id),
        newVersion
      );
    },
  });
} 