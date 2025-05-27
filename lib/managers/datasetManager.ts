import { db } from '@/lib/db';
import * as datasetApi from '@/lib/api/datasets';
import { 
  Dataset, 
  DatasetCreate, 
  DatasetUpdate, 
  DatasetWithVersions 
} from '@/lib/schemas/dataset';
import { DatasetEntity } from '@/lib/models';

export class DatasetManager {
  // Get datasets with caching
  async getDatasets(): Promise<DatasetEntity[]> {
    // Try from IndexedDB first
    const cachedDatasets = await db.datasets.where('is_global').equals(0).toArray();
    
    try {
      // Fetch from API
      const apiDatasets = await datasetApi.getDatasets();
      
      // Transform to local model format and update cache
      const datasets = apiDatasets.map(this.transformToEntity);
      await db.datasets.bulkPut(datasets);
      
      return datasets;
    } catch (error) {
      console.warn('Failed to fetch datasets from API, using cached data:', error);
      
      // Return cache on error if available
      if (cachedDatasets.length > 0) {
        return cachedDatasets;
      }
      
      // Enhance error message for better UX
      const enhancedError = new Error(
        error instanceof Error 
          ? `Unable to load datasets: ${error.message}` 
          : 'Unable to load datasets. Please check your connection and try again.'
      );
      throw enhancedError;
    }
  }

  // Get global datasets with caching
  async getGlobalDatasets(): Promise<DatasetEntity[]> {
    try {
      // Fetch from API (global datasets are always fresh)
      const apiDatasets = await datasetApi.getGlobalDatasets();
      
      // Transform to local model format
      const datasets = apiDatasets.map(this.transformToEntity);
      
      // Update cache for global datasets
      await db.datasets.bulkPut(datasets.filter(d => d.is_global));
      
      return datasets;
    } catch (error) {
      console.warn('Failed to fetch global datasets from API, using cached data:', error);
      
      // Fallback to cached global datasets
      const cachedGlobalDatasets = await db.datasets.where('is_global').equals(1).toArray();
      if (cachedGlobalDatasets.length > 0) {
        return cachedGlobalDatasets;
      }
      
      // Enhance error message for better UX
      const enhancedError = new Error(
        error instanceof Error 
          ? `Unable to load global datasets: ${error.message}` 
          : 'Unable to load global datasets. Please check your connection and try again.'
      );
      throw enhancedError;
    }
  }

  // Get dataset by ID with caching
  async getDatasetById(datasetId: string): Promise<DatasetEntity | null> {
    // Try from cache first
    const cachedDataset = await db.datasets.get(datasetId);
    
    try {
      // Fetch from API
      const apiDataset = await datasetApi.getDatasetById(datasetId);
      
      // Transform and update cache
      const dataset = this.transformToEntity(apiDataset);
      await db.datasets.put(dataset);
      
      return dataset;
    } catch (error) {
      // Return cache on error if available
      if (cachedDataset) {
        return cachedDataset;
      }
      throw error;
    }
  }

  // Create dataset
  async createDataset(data: DatasetCreate): Promise<DatasetEntity> {
    const apiDataset = await datasetApi.createDataset(data);
    const dataset = this.transformToEntity(apiDataset);
    
    // Update cache
    await db.datasets.put(dataset);
    
    return dataset;
  }

  // Update dataset
  async updateDataset(datasetId: string, data: DatasetUpdate): Promise<DatasetEntity> {
    const apiDataset = await datasetApi.updateDataset(datasetId, data);
    const dataset = this.transformToEntity(apiDataset);
    
    // Update cache
    await db.datasets.put(dataset);
    
    return dataset;
  }

  // Delete dataset
  async deleteDataset(datasetId: string): Promise<void> {
    try {
      await datasetApi.deleteDataset(datasetId);
      
      // Remove from cache
      await db.datasets.delete(datasetId);
      
      // Also remove associated versions from cache
      await db.datasetVersions.where('dataset_id').equals(datasetId).delete();
    } catch (error: any) {
      // Handle 400 errors (business logic violations from backend)
      if (error.response?.status === 400) {
        // The backend now returns descriptive error messages for 400 errors
        // Clean up the message format for better display
        let errorMessage = error.message || 'Cannot delete dataset due to validation error.';
        
        // Extract and format run IDs more cleanly
        const runIdMatch = errorMessage.match(/\['([^']+)'\]/);
        if (runIdMatch) {
          const runIds = runIdMatch[1].split("', '");
          const formattedRunIds = runIds.map((id: string) => id.replace(/^run_/, '')).join(', ');
          errorMessage = errorMessage.replace(/\['[^']+'\]/, formattedRunIds);
        }
        
        // Clean up any remaining array formatting
        errorMessage = errorMessage.replace(/\['/g, '').replace(/'\]/g, '').replace(/', '/g, ', ');
        
        // This is expected behavior, not an error - log as info
        console.info('Dataset deletion prevented due to business rules:', errorMessage);
        
        // Create a user-friendly error for the UI
        const userError = new Error(errorMessage);
        userError.name = 'BusinessRuleViolation';
        throw userError;
      }
      
      // Handle 500 errors (constraint violations that shouldn't happen with the new backend logic)
      if (error.response?.status === 500 && 
          (error.response?.data?.detail?.includes('IntegrityError') ||
           error.message?.includes('constraint'))) {
        console.error('Unexpected constraint violation:', error);
        throw new Error(
          'Cannot delete dataset: There are experiment runs that depend on this dataset. ' +
          'Please delete the associated experiment runs first, or contact your administrator.'
        );
      }
      
      // Re-throw other errors as-is (these are unexpected)
      console.error('Unexpected error during dataset deletion:', error);
      throw error;
    }
  }

  // Add test case to dataset
  async addTestCaseToDataset(datasetId: string, testCaseId: string): Promise<void> {
    await datasetApi.addTestCaseToDataset(datasetId, testCaseId);
    
    // Invalidate cache for this dataset
    await db.datasets.delete(datasetId);
  }

  // Remove test case from dataset
  async removeTestCaseFromDataset(datasetId: string, testCaseId: string): Promise<void> {
    await datasetApi.removeTestCaseFromDataset(datasetId, testCaseId);
    
    // Invalidate cache for this dataset
    await db.datasets.delete(datasetId);
  }

  // Transform API data to local entity
  private transformToEntity(apiDataset: Dataset | DatasetWithVersions): DatasetEntity {
    return {
      id: apiDataset.id,
      name: apiDataset.name,
      description: apiDataset.description,
      is_global: apiDataset.is_global,
      user_id: apiDataset.user_id,
      created_at: apiDataset.created_at,
      updated_at: apiDataset.updated_at,
      current_version_id: apiDataset.current_version_id
    };
  }

  // Get datasets by user
  async getDatasetsByUser(userId: string): Promise<DatasetEntity[]> {
    const allDatasets = await this.getDatasets();
    return allDatasets.filter(dataset => dataset.user_id === userId);
  }

  // Search datasets by name
  async searchDatasets(query: string): Promise<DatasetEntity[]> {
    const allDatasets = await this.getDatasets();
    const globalDatasets = await this.getGlobalDatasets();
    
    // Combine and deduplicate
    const combinedDatasets = [...allDatasets, ...globalDatasets];
    const uniqueDatasets = combinedDatasets.filter((dataset, index, self) => 
      index === self.findIndex(d => d.id === dataset.id)
    );
    
    // Filter by query
    return uniqueDatasets.filter(dataset => 
      dataset.name.toLowerCase().includes(query.toLowerCase()) ||
      (dataset.description && dataset.description.toLowerCase().includes(query.toLowerCase()))
    );
  }
}

// Export singleton instance
export const datasetManager = new DatasetManager(); 