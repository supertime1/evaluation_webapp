import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { testResultManager } from '@/lib/managers/testResultManager';
import { TestResultCreate } from '@/lib/schemas/testResult';

const TEST_RESULTS_QUERY_KEY = 'testResults';
const RUNS_QUERY_KEY = 'runs';

/**
 * Hook for fetching all test results for a specific run
 */
export function useRunTestResults(runId: string) {
  return useQuery({
    queryKey: [TEST_RESULTS_QUERY_KEY, { runId }],
    queryFn: () => testResultManager.getTestResultsByRun(runId),
    enabled: !!runId, // Only run the query if runId is provided
  });
}

/**
 * Hook for fetching a specific test result
 */
export function useTestResult(id: string) {
  return useQuery({
    queryKey: [TEST_RESULTS_QUERY_KEY, id],
    queryFn: () => testResultManager.getTestResult(id),
    enabled: !!id, // Only run the query if id is provided
  });
}

/**
 * Hook for creating a new test result
 */
export function useCreateTestResult() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (testResult: TestResultCreate) => testResultManager.createTestResult(testResult),
    onSuccess: (_, variables) => {
      // Invalidate test results queries for this run to trigger a refetch
      queryClient.invalidateQueries({
        queryKey: [TEST_RESULTS_QUERY_KEY, { runId: variables.run_id }],
      });
      // Also invalidate the run query
      queryClient.invalidateQueries({
        queryKey: [RUNS_QUERY_KEY, variables.run_id],
      });
    },
  });
}

/**
 * Hook for creating multiple test results at once
 */
export function useCreateBatchTestResults() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (testResults: TestResultCreate[]) => testResultManager.createBatchTestResults(testResults),
    onSuccess: (_, variables) => {
      // Get unique run IDs
      const runIds = Array.from(new Set(variables.map(tr => tr.run_id)));
      
      // Invalidate test results queries for each run
      runIds.forEach(runId => {
        queryClient.invalidateQueries({
          queryKey: [TEST_RESULTS_QUERY_KEY, { runId }],
        });
        // Also invalidate each run query
        queryClient.invalidateQueries({
          queryKey: [RUNS_QUERY_KEY, runId],
        });
      });
    },
  });
}

/**
 * Hook for deleting a test result
 */
export function useDeleteTestResult() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      // We need to get the test result to know its run_id before deleting
      const testResult = await testResultManager.getTestResult(id);
      const runId = testResult.run_id;
      await testResultManager.deleteTestResult(id);
      return { id, runId };
    },
    onSuccess: ({ id, runId }) => {
      // Invalidate the specific test result query and remove it from cache
      queryClient.removeQueries({ queryKey: [TEST_RESULTS_QUERY_KEY, id] });
      // Invalidate the test results for this run
      queryClient.invalidateQueries({
        queryKey: [TEST_RESULTS_QUERY_KEY, { runId }],
      });
      // Also invalidate the run query
      queryClient.invalidateQueries({
        queryKey: [RUNS_QUERY_KEY, runId],
      });
    },
  });
}

/**
 * Hook for syncing test results for a specific run
 */
export function useSyncRunTestResults(runId: string) {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: () => testResultManager.syncRunTestResults(runId),
    onSuccess: () => {
      // Invalidate test results queries for this run to refresh data
      queryClient.invalidateQueries({
        queryKey: [TEST_RESULTS_QUERY_KEY, { runId }],
      });
    },
  });
} 