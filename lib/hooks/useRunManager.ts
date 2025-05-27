import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { runManager } from '@/lib/managers/runManager';
import { RunCreate, RunUpdate } from '@/lib/schemas/run';
import { RunEntity } from '@/lib/models';

const RUNS_QUERY_KEY = 'runs';
const EXPERIMENTS_QUERY_KEY = 'experiments';

/**
 * Hook for fetching all runs for a specific experiment
 */
export function useExperimentRuns(experimentId: string) {
  return useQuery({
    queryKey: [RUNS_QUERY_KEY, { experimentId }],
    queryFn: () => runManager.getRunsByExperiment(experimentId),
    enabled: !!experimentId, // Only run the query if experimentId is provided
  });
}

/**
 * Hook for fetching all runs that use a specific dataset version (from local cache)
 */
export function useDatasetVersionRuns(datasetVersionId: string) {
  return useQuery({
    queryKey: [RUNS_QUERY_KEY, { datasetVersionId }],
    queryFn: () => runManager.getRunsByDatasetVersion(datasetVersionId),
    enabled: !!datasetVersionId, // Only run the query if datasetVersionId is provided
  });
}

/**
 * Hook for fetching a specific run
 */
export function useRun(id: string) {
  return useQuery({
    queryKey: [RUNS_QUERY_KEY, id],
    queryFn: () => runManager.getRun(id),
    enabled: !!id, // Only run the query if id is provided
  });
}

/**
 * Hook for fetching a run with its test results
 */
export function useRunWithResults(id: string) {
  return useQuery({
    queryKey: [RUNS_QUERY_KEY, id, 'results'],
    queryFn: () => runManager.getRunWithResults(id),
    enabled: !!id, // Only run the query if id is provided
  });
}

/**
 * Hook for creating a new run
 */
export function useCreateRun() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (run: RunCreate) => runManager.createRun(run),
    onSuccess: (_, variables) => {
      // Invalidate runs queries for this experiment to trigger a refetch
      queryClient.invalidateQueries({
        queryKey: [RUNS_QUERY_KEY, { experimentId: variables.experiment_id }],
      });
      // Also invalidate the experiment query since run count may change
      queryClient.invalidateQueries({
        queryKey: [EXPERIMENTS_QUERY_KEY, variables.experiment_id],
      });
    },
  });
}

/**
 * Hook for updating a run
 */
export function useUpdateRun() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: RunUpdate }) => 
      runManager.updateRun(id, data),
    onSuccess: async (updatedRun) => {
      // Invalidate the specific run query
      queryClient.invalidateQueries({ queryKey: [RUNS_QUERY_KEY, updatedRun.id] });
      // Invalidate the runs for this experiment
      queryClient.invalidateQueries({
        queryKey: [RUNS_QUERY_KEY, { experimentId: updatedRun.experiment_id }],
      });
      // Also invalidate the experiment query
      queryClient.invalidateQueries({
        queryKey: [EXPERIMENTS_QUERY_KEY, updatedRun.experiment_id],
      });
    },
  });
}

/**
 * Hook for deleting a run
 */
export function useDeleteRun() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      // We need to get the run to know its experiment_id before deleting
      const run = await runManager.getRun(id);
      const experimentId = run.experiment_id;
      await runManager.deleteRun(id);
      return { id, experimentId };
    },
    onSuccess: ({ id, experimentId }) => {
      // Invalidate the specific run query and remove it from cache
      queryClient.removeQueries({ queryKey: [RUNS_QUERY_KEY, id] });
      // Invalidate the runs for this experiment
      queryClient.invalidateQueries({
        queryKey: [RUNS_QUERY_KEY, { experimentId }],
      });
      // Also invalidate the experiment query
      queryClient.invalidateQueries({
        queryKey: [EXPERIMENTS_QUERY_KEY, experimentId],
      });
    },
  });
}

/**
 * Hook for syncing runs for a specific experiment
 */
export function useSyncExperimentRuns(experimentId: string) {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: () => runManager.syncExperimentRuns(experimentId),
    onSuccess: () => {
      // Invalidate runs queries for this experiment to refresh data
      queryClient.invalidateQueries({
        queryKey: [RUNS_QUERY_KEY, { experimentId }],
      });
    },
  });
} 