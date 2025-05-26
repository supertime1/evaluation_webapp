import { apiClient } from './client';
import { 
  DatasetVersion, 
  DatasetVersionCreate, 
  DatasetVersionWithTestCases,
  DatasetVersionListResponse 
} from '@/lib/schemas/datasetVersion';
import { TestCase } from '@/lib/schemas/testCase';

// Dataset version operations
export const createDatasetVersion = async (
  datasetId: string, 
  data: DatasetVersionCreate
): Promise<DatasetVersion> => {
  const response = await apiClient.post(`/api/v1/datasets/${datasetId}/versions`, data);
  return response.data;
};

export const getDatasetVersions = async (
  datasetId: string, 
  skip: number = 0, 
  limit: number = 100
): Promise<DatasetVersion[]> => {
  const response = await apiClient.get(`/api/v1/datasets/${datasetId}/versions`, {
    params: { skip, limit }
  });
  return response.data;
};

export const getDatasetVersionById = async (versionId: string): Promise<DatasetVersion> => {
  const response = await apiClient.get(`/api/v1/datasets/versions/${versionId}`);
  return response.data;
};

export const getDatasetVersionTestCases = async (versionId: string): Promise<TestCase[]> => {
  const response = await apiClient.get(`/api/v1/datasets/versions/${versionId}/test-cases`);
  return response.data;
};

// Helper function to get version with test cases
export const getDatasetVersionWithTestCases = async (versionId: string): Promise<DatasetVersionWithTestCases> => {
  const [version, testCases] = await Promise.all([
    getDatasetVersionById(versionId),
    getDatasetVersionTestCases(versionId)
  ]);
  
  return {
    ...version,
    test_cases: testCases
  };
}; 