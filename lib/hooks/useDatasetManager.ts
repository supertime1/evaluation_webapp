import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { datasetManager } from '@/lib/managers/datasetManager';
import { DatasetCreate, DatasetUpdate } from '@/lib/schemas/dataset';

// Query keys for React Query
export const datasetKeys = {
  all: ['datasets'] as const,
  lists: () => [...datasetKeys.all, 'list'] as const,
  list: (filters: string) => [...datasetKeys.lists(), { filters }] as const,
  details: () => [...datasetKeys.all, 'detail'] as const,
  detail: (id: string) => [...datasetKeys.details(), id] as const,
  global: () => [...datasetKeys.all, 'global'] as const,
  search: (query: string) => [...datasetKeys.all, 'search', query] as const,
};

// Get all datasets for current user
export function useDatasets() {
  return useQuery({
    queryKey: datasetKeys.lists(),
    queryFn: () => datasetManager.getDatasets(),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

// Get global datasets
export function useGlobalDatasets() {
  return useQuery({
    queryKey: datasetKeys.global(),
    queryFn: () => datasetManager.getGlobalDatasets(),
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
}

// Get dataset by ID
export function useDataset(datasetId: string) {
  return useQuery({
    queryKey: datasetKeys.detail(datasetId),
    queryFn: () => datasetManager.getDatasetById(datasetId),
    enabled: !!datasetId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

// Search datasets
export function useSearchDatasets(query: string) {
  return useQuery({
    queryKey: datasetKeys.search(query),
    queryFn: () => datasetManager.searchDatasets(query),
    enabled: query.length > 0,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
}

// Get datasets by user
export function useDatasetsByUser(userId: string) {
  return useQuery({
    queryKey: [...datasetKeys.lists(), 'user', userId],
    queryFn: () => datasetManager.getDatasetsByUser(userId),
    enabled: !!userId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

// Create dataset mutation
export function useCreateDataset() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (dataset: DatasetCreate) => datasetManager.createDataset(dataset),
    onSuccess: () => {
      // Invalidate and refetch datasets
      queryClient.invalidateQueries({ queryKey: datasetKeys.lists() });
      queryClient.invalidateQueries({ queryKey: datasetKeys.global() });
    },
  });
}

// Update dataset mutation
export function useUpdateDataset() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ datasetId, data }: { datasetId: string; data: DatasetUpdate }) => 
      datasetManager.updateDataset(datasetId, data),
    onSuccess: (updatedDataset) => {
      // Update specific dataset in cache
      queryClient.setQueryData(
        datasetKeys.detail(updatedDataset.id),
        updatedDataset
      );
      
      // Invalidate lists to ensure consistency
      queryClient.invalidateQueries({ queryKey: datasetKeys.lists() });
      queryClient.invalidateQueries({ queryKey: datasetKeys.global() });
    },
  });
}

// Delete dataset mutation
export function useDeleteDataset() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (datasetId: string) => datasetManager.deleteDataset(datasetId),
    onSuccess: (_, datasetId) => {
      // Remove from cache
      queryClient.removeQueries({ queryKey: datasetKeys.detail(datasetId) });
      
      // Invalidate lists
      queryClient.invalidateQueries({ queryKey: datasetKeys.lists() });
      queryClient.invalidateQueries({ queryKey: datasetKeys.global() });
    },
  });
}

// Add test case to dataset mutation
export function useAddTestCaseToDataset() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ datasetId, testCaseId }: { datasetId: string; testCaseId: string }) => 
      datasetManager.addTestCaseToDataset(datasetId, testCaseId),
    onSuccess: (_, { datasetId }) => {
      // Invalidate dataset detail to refetch updated data
      queryClient.invalidateQueries({ queryKey: datasetKeys.detail(datasetId) });
      
      // Invalidate dataset versions as well
      queryClient.invalidateQueries({ queryKey: ['datasetVersions', datasetId] });
    },
  });
}

// Remove test case from dataset mutation
export function useRemoveTestCaseFromDataset() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ datasetId, testCaseId }: { datasetId: string; testCaseId: string }) => 
      datasetManager.removeTestCaseFromDataset(datasetId, testCaseId),
    onSuccess: (_, { datasetId }) => {
      // Invalidate dataset detail to refetch updated data
      queryClient.invalidateQueries({ queryKey: datasetKeys.detail(datasetId) });
      
      // Invalidate dataset versions as well
      queryClient.invalidateQueries({ queryKey: ['datasetVersions', datasetId] });
    },
  });
} 