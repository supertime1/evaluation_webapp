import { apiClient } from './client';
import { 
  RunCreate, 
  RunUpdate, 
  Run, 
  RunWithResults 
} from '@/lib/schemas/run';

const API_PATH = '/api/v1/runs';

/**
 * Create a new run
 */
export const createRun = async (data: RunCreate): Promise<Run> => {
  const response = await apiClient.post(API_PATH, data);
  return response.data;
};

/**
 * Get all runs for a specific experiment
 */
export const getRunsByExperiment = async (experimentId: string): Promise<Run[]> => {
  const response = await apiClient.get(`/api/v1/experiments/${experimentId}/runs`);
  return response.data;
};

/**
 * Get a specific run by ID
 */
export const getRun = async (id: string): Promise<Run> => {
  const response = await apiClient.get(`${API_PATH}/${id}`);
  return response.data;
};

/**
 * Get a specific run with its test results
 */
export const getRunWithResults = async (id: string): Promise<RunWithResults> => {
  const response = await apiClient.get(`${API_PATH}/${id}?include_results=true`);
  return response.data;
};

/**
 * Update a run
 */
export const updateRun = async (id: string, data: RunUpdate): Promise<Run> => {
  const response = await apiClient.put(`${API_PATH}/${id}`, data);
  return response.data;
};

/**
 * Delete a run
 */
export const deleteRun = async (id: string): Promise<void> => {
  await apiClient.delete(`${API_PATH}/${id}`);
}; 