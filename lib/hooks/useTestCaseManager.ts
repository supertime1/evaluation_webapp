import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { testCaseManager } from '@/lib/managers/testCaseManager';
import { TestCaseCreate, TestCaseUpdate } from '@/lib/schemas/testCase';
import { TestCaseEntity } from '@/lib/models';

const TEST_CASES_QUERY_KEY = 'testCases';

/**
 * Hook for fetching all test cases for the current user
 */
export function useTestCases() {
  return useQuery({
    queryKey: [TEST_CASES_QUERY_KEY, 'user'],
    queryFn: () => testCaseManager.getTestCases(),
  });
}

/**
 * Hook for fetching global test cases
 */
export function useGlobalTestCases() {
  return useQuery({
    queryKey: [TEST_CASES_QUERY_KEY, 'global'],
    queryFn: () => testCaseManager.getGlobalTestCases(),
  });
}

/**
 * Hook for fetching both user and global test cases
 */
export function useAllTestCases() {
  const { data: userTestCases = [], isLoading: isLoadingUser, error: userError } = useTestCases();
  const { data: globalTestCases = [], isLoading: isLoadingGlobal, error: globalError } = useGlobalTestCases();

  const isLoading = isLoadingUser || isLoadingGlobal;
  const error = userError || globalError;
  const data = [...userTestCases, ...globalTestCases];

  return {
    data,
    isLoading,
    error,
  };
}

/**
 * Hook for fetching a specific test case
 */
export function useTestCase(id: string) {
  return useQuery({
    queryKey: [TEST_CASES_QUERY_KEY, id],
    queryFn: () => testCaseManager.getTestCase(id),
    enabled: !!id, // Only run the query if id is provided
  });
}

/**
 * Hook for creating a new test case
 */
export function useCreateTestCase() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (testCase: TestCaseCreate) => testCaseManager.createTestCase(testCase),
    onSuccess: () => {
      // Invalidate test cases queries to trigger a refetch
      queryClient.invalidateQueries({ queryKey: [TEST_CASES_QUERY_KEY, 'user'] });
    },
  });
}

/**
 * Hook for updating a test case
 */
export function useUpdateTestCase() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: TestCaseUpdate }) => 
      testCaseManager.updateTestCase(id, data),
    onSuccess: (_, variables) => {
      // Invalidate the specific test case query
      queryClient.invalidateQueries({ queryKey: [TEST_CASES_QUERY_KEY, variables.id] });
      
      // Invalidate the list queries
      queryClient.invalidateQueries({ queryKey: [TEST_CASES_QUERY_KEY, 'user'] });
      queryClient.invalidateQueries({ queryKey: [TEST_CASES_QUERY_KEY, 'global'] });
    },
  });
}

/**
 * Hook for deleting a test case
 */
export function useDeleteTestCase() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => testCaseManager.deleteTestCase(id),
    onSuccess: (_, id) => {
      // Invalidate the specific test case query and remove it from cache
      queryClient.removeQueries({ queryKey: [TEST_CASES_QUERY_KEY, id] });
      
      // Invalidate the user test cases list query
      queryClient.invalidateQueries({ queryKey: [TEST_CASES_QUERY_KEY, 'user'] });
    },
  });
}

/**
 * Hook for syncing test cases with the API
 */
export function useSyncTestCases() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: () => testCaseManager.syncTestCases(),
    onSuccess: () => {
      // Invalidate all test cases queries to refresh data
      queryClient.invalidateQueries({ queryKey: [TEST_CASES_QUERY_KEY] });
    },
  });
} 