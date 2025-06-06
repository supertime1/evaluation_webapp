import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { experimentManager } from '@/lib/managers/experimentManager';
import { ExperimentCreate, ExperimentUpdate } from '@/lib/schemas/experiment';
import { ExperimentEntity } from '@/lib/models';

const EXPERIMENTS_QUERY_KEY = 'experiments';

/**
 * Hook for fetching all experiments
 */
export function useExperiments() {
  return useQuery({
    queryKey: [EXPERIMENTS_QUERY_KEY],
    queryFn: () => experimentManager.getExperiments(),
  });
}

/**
 * Hook for fetching a specific experiment
 */
export function useExperiment(id: string) {
  return useQuery({
    queryKey: [EXPERIMENTS_QUERY_KEY, id],
    queryFn: () => experimentManager.getExperiment(id),
    enabled: !!id, // Only run the query if id is provided
    retry: (failureCount, error: any) => {
      // Don't retry on 404 errors (deleted experiments)
      if (error?.response?.status === 404 || 
          error?.name === 'ExperimentNotFound' ||
          error?.message?.includes('404') ||
          error?.message?.includes('no longer exists')) {
        return false;
      }
      // Retry other errors up to 3 times
      return failureCount < 3;
    },
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    // Don't throw errors for 404s - let the component handle them via the error property
    throwOnError: (error: any) => {
      // Don't throw for 404 errors, let the component handle them gracefully
      if (error?.response?.status === 404 || 
          error?.name === 'ExperimentNotFound' ||
          error?.message?.includes('404') ||
          error?.message?.includes('no longer exists')) {
        return false;
      }
      // Throw other errors as usual
      return true;
    },
  });
}

/**
 * Hook for creating a new experiment
 */
export function useCreateExperiment() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (experiment: ExperimentCreate) => experimentManager.createExperiment(experiment),
    onSuccess: () => {
      // Invalidate experiments queries to trigger a refetch
      queryClient.invalidateQueries({ queryKey: [EXPERIMENTS_QUERY_KEY] });
    },
  });
}

/**
 * Hook for updating an experiment
 */
export function useUpdateExperiment() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: ExperimentUpdate }) => 
      experimentManager.updateExperiment(id, data),
    onSuccess: (_, variables) => {
      // Invalidate the specific experiment query and the list query
      queryClient.invalidateQueries({ queryKey: [EXPERIMENTS_QUERY_KEY, variables.id] });
      queryClient.invalidateQueries({ queryKey: [EXPERIMENTS_QUERY_KEY] });
    },
  });
}

/**
 * Hook for deleting an experiment
 */
export function useDeleteExperiment() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => experimentManager.deleteExperiment(id),
    onSuccess: (_, id) => {
      // Invalidate the specific experiment query and the list query
      queryClient.invalidateQueries({ queryKey: [EXPERIMENTS_QUERY_KEY, id] });
      queryClient.invalidateQueries({ queryKey: [EXPERIMENTS_QUERY_KEY] });
      
      // Remove the experiment from the cache
      queryClient.removeQueries({ queryKey: [EXPERIMENTS_QUERY_KEY, id] });
    },
  });
}

/**
 * Hook for syncing experiments with the API
 */
export function useSyncExperiments() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: () => experimentManager.syncPendingChanges(),
    onSuccess: () => {
      // Invalidate all experiments queries to refresh data
      queryClient.invalidateQueries({ queryKey: [EXPERIMENTS_QUERY_KEY] });
    },
  });
} 