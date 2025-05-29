import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { datasetManager } from '@/lib/managers/datasetManager';
import { DatasetCreate, DatasetUpdate } from '@/lib/schemas/dataset';

// Query keys for datasets
export const datasetKeys = {
  all: ['datasets'] as const,
  lists: () => [...datasetKeys.all, 'list'] as const,
  list: (filters: string) => [...datasetKeys.lists(), { filters }] as const,
  details: () => [...datasetKeys.all, 'detail'] as const,
  detail: (id: string) => [...datasetKeys.details(), id] as const,
  global: () => [...datasetKeys.all, 'global'] as const,
};

// Get user datasets
export function useDatasets() {
  return useQuery({
    queryKey: datasetKeys.lists(),
    queryFn: () => datasetManager.getDatasets(),
  });
}

// Get global datasets
export function useGlobalDatasets() {
  return useQuery({
    queryKey: datasetKeys.global(),
    queryFn: () => datasetManager.getGlobalDatasets(),
  });
}

// Get dataset by ID
export function useDataset(datasetId: string) {
  return useQuery({
    queryKey: datasetKeys.detail(datasetId),
    queryFn: () => datasetManager.getDatasetById(datasetId),
    enabled: !!datasetId,
  });
}

// Create dataset mutation
export function useCreateDataset() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (dataset: DatasetCreate) => datasetManager.createDataset(dataset),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: datasetKeys.lists() });
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
      queryClient.invalidateQueries({ queryKey: datasetKeys.lists() });
      queryClient.setQueryData(
        datasetKeys.detail(updatedDataset.id),
        updatedDataset
      );
    },
  });
}

// Delete dataset mutation
export function useDeleteDataset() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (datasetId: string) => datasetManager.deleteDataset(datasetId),
    onSuccess: (_, datasetId) => {
      queryClient.invalidateQueries({ queryKey: datasetKeys.lists() });
      queryClient.removeQueries({ queryKey: datasetKeys.detail(datasetId) });
    },
  });
} 