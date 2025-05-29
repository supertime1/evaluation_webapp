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

export const getDatasets = async (): Promise<Dataset[]> => {
  const response = await apiClient.get('/api/v1/datasets/');
  return response.data;
};

export const getGlobalDatasets = async (): Promise<Dataset[]> => {
  const response = await apiClient.get('/api/v1/datasets/global');
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