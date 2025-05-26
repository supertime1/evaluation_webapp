import { apiClient } from './client';
import { 
  Dataset, 
  DatasetCreate, 
  DatasetUpdate, 
  DatasetWithVersions,
  DatasetListResponse 
} from '@/lib/schemas/dataset';

// Dataset CRUD operations
export const createDataset = async (data: DatasetCreate): Promise<Dataset> => {
  const response = await apiClient.post('/api/v1/datasets/', data);
  return response.data;
};

export const getDatasets = async (skip: number = 0, limit: number = 100): Promise<Dataset[]> => {
  const response = await apiClient.get('/api/v1/datasets/', {
    params: { skip, limit }
  });
  return response.data;
};

export const getGlobalDatasets = async (skip: number = 0, limit: number = 100): Promise<Dataset[]> => {
  const response = await apiClient.get('/api/v1/datasets/global', {
    params: { skip, limit }
  });
  return response.data;
};

export const getDatasetById = async (datasetId: string): Promise<DatasetWithVersions> => {
  const response = await apiClient.get(`/api/v1/datasets/${datasetId}`);
  return response.data;
};

export const updateDataset = async (datasetId: string, data: DatasetUpdate): Promise<Dataset> => {
  const response = await apiClient.put(`/api/v1/datasets/${datasetId}`, data);
  return response.data;
};

export const deleteDataset = async (datasetId: string): Promise<void> => {
  await apiClient.delete(`/api/v1/datasets/${datasetId}`);
};

// Dataset test case management
export const addTestCaseToDataset = async (datasetId: string, testCaseId: string): Promise<void> => {
  await apiClient.post(`/api/v1/datasets/${datasetId}/add-test-case`, null, {
    params: { test_case_id: testCaseId }
  });
};

export const removeTestCaseFromDataset = async (datasetId: string, testCaseId: string): Promise<void> => {
  await apiClient.post(`/api/v1/datasets/${datasetId}/remove-test-case`, null, {
    params: { test_case_id: testCaseId }
  });
}; 