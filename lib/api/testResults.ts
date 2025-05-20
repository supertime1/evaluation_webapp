import { 
  TestResultCreate, 
  TestResult 
} from '@/lib/schemas/testResult';
import { apiClient } from './client';

const API_PATH = '/api/v1/test-results';

/**
 * Create a new test result
 */
export const createTestResult = async (data: TestResultCreate): Promise<TestResult> => {
  const response = await apiClient.post(API_PATH, data);
  return response.data;
};

/**
 * Create multiple test results at once
 */
export const createBatchTestResults = async (data: TestResultCreate[]): Promise<TestResult[]> => {
  const response = await apiClient.post(`${API_PATH}/batch`, data);
  return response.data;
};

/**
 * Get a specific test result by ID
 */
export const getTestResult = async (id: string): Promise<TestResult> => {
  const response = await apiClient.get(`${API_PATH}/${id}`);
  return response.data;
};

/**
 * Get all test results for a specific run
 */
export const getTestResultsByRun = async (runId: string): Promise<TestResult[]> => {
  const response = await apiClient.get(`/api/v1/runs/${runId}/test-results`);
  return response.data;
};

/**
 * Delete a test result
 */
export const deleteTestResult = async (id: string): Promise<void> => {
  await apiClient.delete(`${API_PATH}/${id}`);
}; 