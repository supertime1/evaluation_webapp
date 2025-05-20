import { 
  ExperimentCreate, 
  ExperimentUpdate, 
  Experiment, 
  ExperimentWithRuns 
} from '@/lib/schemas/experiment';
import { apiClient } from './client';

const API_PATH = '/api/v1/experiments';

/**
 * Create a new experiment
 */
export const createExperiment = async (data: ExperimentCreate): Promise<Experiment> => {
  const response = await apiClient.post(API_PATH, data);
  return response.data;
};

/**
 * Get all experiments for the current user
 */
export const getExperiments = async (): Promise<Experiment[]> => {
  const response = await apiClient.get(API_PATH);
  return response.data;
};

/**
 * Get a specific experiment by ID
 */
export const getExperiment = async (id: string): Promise<Experiment> => {
  const response = await apiClient.get(`${API_PATH}/${id}`);
  return response.data;
};

/**
 * Get a specific experiment with its runs
 */
export const getExperimentWithRuns = async (id: string): Promise<ExperimentWithRuns> => {
  const response = await apiClient.get(`${API_PATH}/${id}?include_runs=true`);
  return response.data;
};

/**
 * Update an experiment
 */
export const updateExperiment = async (id: string, data: ExperimentUpdate): Promise<Experiment> => {
  const response = await apiClient.put(`${API_PATH}/${id}`, data);
  return response.data;
};

/**
 * Delete an experiment
 */
export const deleteExperiment = async (id: string): Promise<void> => {
  await apiClient.delete(`${API_PATH}/${id}`);
}; 