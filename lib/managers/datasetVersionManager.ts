import { db } from '@/lib/db';
import * as datasetVersionApi from '@/lib/api/datasetVersions';
import { 
  DatasetVersion, 
  DatasetVersionCreate, 
  DatasetVersionWithTestCases,
  DatasetVersionComparison 
} from '@/lib/schemas/datasetVersion';
import { DatasetVersionEntity } from '@/lib/models';

export class DatasetVersionManager {
  // Get dataset versions with caching
  async getDatasetVersions(datasetId: string): Promise<DatasetVersionEntity[]> {
    // Try from IndexedDB first
    const cachedVersions = await db.datasetVersions.where('dataset_id').equals(datasetId).toArray();
    
    try {
      // Fetch from API
      const apiVersions = await datasetVersionApi.getDatasetVersions(datasetId);
      
      // Transform to local model format and update cache
      const versions = apiVersions.map(this.transformToEntity);
      await db.datasetVersions.bulkPut(versions);
      
      return versions;
    } catch (error) {
      // Return cache on error if available
      if (cachedVersions.length > 0) {
        return cachedVersions;
      }
      throw error;
    }
  }

  // Get dataset version by ID with caching
  async getDatasetVersionById(versionId: string): Promise<DatasetVersionEntity | null> {
    // Try from cache first
    const cachedVersion = await db.datasetVersions.get(versionId);
    
    try {
      // Fetch from API
      const apiVersion = await datasetVersionApi.getDatasetVersionById(versionId);
      
      // Transform and update cache
      const version = this.transformToEntity(apiVersion);
      await db.datasetVersions.put(version);
      
      return version;
    } catch (error) {
      // Return cache on error if available
      if (cachedVersion) {
        return cachedVersion;
      }
      throw error;
    }
  }

  // Create dataset version
  async createDatasetVersion(datasetId: string, data: DatasetVersionCreate): Promise<DatasetVersionEntity> {
    const apiVersion = await datasetVersionApi.createDatasetVersion(datasetId, data);
    const version = this.transformToEntity(apiVersion);
    
    // Update cache
    await db.datasetVersions.put(version);
    
    // Update dataset's current_version_id in cache
    const dataset = await db.datasets.get(datasetId);
    if (dataset) {
      dataset.current_version_id = version.id;
      await db.datasets.put(dataset);
    }
    
    return version;
  }

  // Get test cases for a dataset version
  async getDatasetVersionTestCases(versionId: string) {
    return await datasetVersionApi.getDatasetVersionTestCases(versionId);
  }

  // Get dataset version with test cases
  async getDatasetVersionWithTestCases(versionId: string): Promise<DatasetVersionWithTestCases> {
    return await datasetVersionApi.getDatasetVersionWithTestCases(versionId);
  }

  // Get latest version for a dataset
  async getLatestVersion(datasetId: string): Promise<DatasetVersionEntity | null> {
    const versions = await this.getDatasetVersions(datasetId);
    if (versions.length === 0) return null;
    
    // Sort by version number descending and return the first (latest)
    return versions.sort((a, b) => b.version_number - a.version_number)[0];
  }

  // Compare two dataset versions
  async compareVersions(fromVersionId: string, toVersionId: string): Promise<DatasetVersionComparison> {
    const [fromVersion, toVersion] = await Promise.all([
      this.getDatasetVersionById(fromVersionId),
      this.getDatasetVersionById(toVersionId)
    ]);

    if (!fromVersion || !toVersion) {
      throw new Error('One or both versions not found');
    }

    const fromTestCases = new Set(fromVersion.test_case_ids);
    const toTestCases = new Set(toVersion.test_case_ids);

    const added = toVersion.test_case_ids.filter(id => !fromTestCases.has(id));
    const removed = fromVersion.test_case_ids.filter(id => !toTestCases.has(id));
    const unchanged = fromVersion.test_case_ids.filter(id => toTestCases.has(id));

    return {
      from_version: this.transformFromEntity(fromVersion),
      to_version: this.transformFromEntity(toVersion),
      added_test_cases: added,
      removed_test_cases: removed,
      unchanged_test_cases: unchanged
    };
  }

  // Get version history for a dataset (sorted by version number)
  async getVersionHistory(datasetId: string): Promise<DatasetVersionEntity[]> {
    const versions = await this.getDatasetVersions(datasetId);
    return versions.sort((a, b) => b.version_number - a.version_number);
  }

  // Transform API data to local entity
  private transformToEntity(apiVersion: DatasetVersion): DatasetVersionEntity {
    return {
      id: apiVersion.id,
      dataset_id: apiVersion.dataset_id,
      version_number: apiVersion.version_number,
      test_case_ids: apiVersion.test_case_ids,
      change_summary: apiVersion.change_summary,
      created_at: apiVersion.created_at,
      created_by_user_id: apiVersion.created_by_user_id
    };
  }

  // Transform local entity back to API format (for comparisons)
  private transformFromEntity(entity: DatasetVersionEntity): DatasetVersion {
    return {
      id: entity.id,
      dataset_id: entity.dataset_id,
      version_number: entity.version_number,
      test_case_ids: entity.test_case_ids,
      change_summary: entity.change_summary,
      created_at: entity.created_at,
      created_by_user_id: entity.created_by_user_id
    };
  }

  // Get versions by test case ID (find which versions contain a specific test case)
  async getVersionsByTestCase(testCaseId: string): Promise<DatasetVersionEntity[]> {
    const allVersions = await db.datasetVersions.toArray();
    return allVersions.filter(version => 
      version.test_case_ids.includes(testCaseId)
    );
  }

  // Check if a test case exists in a specific version
  async testCaseExistsInVersion(versionId: string, testCaseId: string): Promise<boolean> {
    const version = await this.getDatasetVersionById(versionId);
    return version ? version.test_case_ids.includes(testCaseId) : false;
  }
}

// Export singleton instance
export const datasetVersionManager = new DatasetVersionManager(); 