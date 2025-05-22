import { 
  TestCaseCreate, 
  TestCaseUpdate, 
  TestCase
} from '@/lib/schemas/testCase';
import { apiClient } from './client';

const API_PATH = '/api/v1/test-cases';

/**
 * Create a new test case
 */
export const createTestCase = async (data: TestCaseCreate): Promise<TestCase> => {
  const response = await apiClient.post(API_PATH, data);
  return response.data;
};

/**
 * Get all test cases for the current user
 */
export const getTestCases = async (): Promise<TestCase[]> => {
  const response = await apiClient.get(API_PATH);
  return response.data;
};

/**
 * Get global test cases that are available to all users
 */
export const getGlobalTestCases = async (): Promise<TestCase[]> => {
  const response = await apiClient.get(`${API_PATH}/global`);
  return response.data;
};

/**
 * Get a specific test case by ID
 */
export const getTestCase = async (id: string): Promise<TestCase> => {
  const response = await apiClient.get(`${API_PATH}/${id}`);
  return response.data;
};

/**
 * Update a test case
 */
export const updateTestCase = async (id: string, data: TestCaseUpdate): Promise<TestCase> => {
  const response = await apiClient.put(`${API_PATH}/${id}`, data);
  return response.data;
};

/**
 * Delete a test case
 */
export const deleteTestCase = async (id: string): Promise<void> => {
  await apiClient.delete(`${API_PATH}/${id}`);
}; 