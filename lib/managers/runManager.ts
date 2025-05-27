import { db } from '@/lib/db';
import * as runApi from '@/lib/api/runs';
import * as experimentApi from '@/lib/api/experiments';
import { RunCreate, RunUpdate, Run, RunWithResults } from '@/lib/schemas/run';
import { RunEntity } from '@/lib/models';

export class RunManager {
  /**
   * Get all runs for a specific experiment
   */
  async getRunsByExperiment(experimentId: string): Promise<RunEntity[]> {
    try {
      // Try to get from IndexedDB first
      const cachedRuns = await db.runs
        .where('experiment_id')
        .equals(experimentId)
        .toArray();
      
      // Fetch from API
      try {
        // Use the API function to get runs from the experiment endpoint
        const apiRuns = await runApi.getRunsByExperiment(experimentId);
        
        // Transform API response to local model format
        const runs = apiRuns.map(this.transformToEntity);
        
        // Update cache
        await db.runs.bulkPut(runs);
        
        return runs;
      } catch (error) {
        console.error(`Error fetching runs for experiment ${experimentId} from API:`, error);
        
        // Return cached data if we have it
        if (cachedRuns.length > 0) {
          return cachedRuns;
        }
        
        throw error;
      }
    } catch (error) {
      console.error(`Error in getRunsByExperiment(${experimentId}):`, error);
      throw error;
    }
  }
  
  /**
   * Get a specific run by ID
   */
  async getRun(id: string): Promise<RunEntity> {
    try {
      // Try to get from IndexedDB first
      const cachedRun = await db.runs.get(id);
      
      // Fetch from API
      try {
        const apiRun = await runApi.getRun(id);
        
        // Transform to local model
        const run = this.transformToEntity(apiRun);
        
        // Update cache
        await db.runs.put(run);
        
        return run;
      } catch (error) {
        console.error(`Error fetching run ${id} from API:`, error);
        
        // Return cached data if we have it
        if (cachedRun) {
          return cachedRun;
        }
        
        throw error;
      }
    } catch (error) {
      console.error(`Error in getRun(${id}):`, error);
      throw error;
    }
  }
  
  /**
   * Get a run with its test results
   */
  async getRunWithResults(id: string): Promise<RunWithResults> {
    // This only returns the API data since we don't store the full joined data in IndexedDB
    try {
      const runWithResults = await runApi.getRunWithResults(id);
      return runWithResults;
    } catch (error) {
      console.error(`Error in getRunWithResults(${id}):`, error);
      throw error;
    }
  }
  
  /**
   * Create a new run
   */
  async createRun(run: RunCreate): Promise<RunEntity> {
    try {
      // Create optimistic entry with temporary ID
      const optimisticId = `temp_${Date.now()}`;
      const optimisticRun: RunEntity = {
        ...run,
        id: optimisticId,
        status: 'pending',
        created_at: new Date().toISOString(),
      };
      
      // Save to IndexedDB immediately for optimistic UI
      await db.runs.add(optimisticRun);
      
      try {
        // Send to API
        const apiRun = await runApi.createRun(run);
        
        // Transform to local model
        const createdRun = this.transformToEntity(apiRun);
        
        // Replace optimistic entry with real data
        await db.runs.delete(optimisticId);
        await db.runs.put(createdRun);
        
        return createdRun;
      } catch (error) {
        // We can't directly set syncError since it's not in the model
        console.error(`Failed to create run for experiment ${run.experiment_id}:`, error);
        
        throw error;
      }
    } catch (error) {
      console.error('Error in createRun:', error);
      throw error;
    }
  }
  
  /**
   * Update an existing run
   */
  async updateRun(id: string, data: RunUpdate): Promise<RunEntity> {
    try {
      // Get the current run
      const currentRun = await db.runs.get(id);
      
      if (!currentRun) {
        throw new Error(`Run with ID ${id} not found`);
      }
      
      // Create optimistic update
      const optimisticRun: RunEntity = {
        ...currentRun,
        ...data,
      };
      
      // Save to IndexedDB immediately
      await db.runs.update(id, optimisticRun);
      
      try {
        // Send to API
        const apiRun = await runApi.updateRun(id, data);
        
        // Transform to local model
        const updatedRun = this.transformToEntity(apiRun);
        
        // Update in IndexedDB
        await db.runs.update(id, updatedRun);
        
        return updatedRun;
      } catch (error) {
        console.error(`Failed to update run ${id}:`, error);
        
        throw error;
      }
    } catch (error) {
      console.error(`Error in updateRun(${id}):`, error);
      throw error;
    }
  }
  
  /**
   * Delete a run
   */
  async deleteRun(id: string): Promise<void> {
    try {
      // No sync status in model, so just try to delete from API
      try {
        // Send to API
        await runApi.deleteRun(id);
        
        // Remove from IndexedDB
        await db.runs.delete(id);
      } catch (error) {
        console.error(`Failed to delete run ${id}:`, error);
        throw error;
      }
    } catch (error) {
      console.error(`Error in deleteRun(${id}):`, error);
      throw error;
    }
  }
  
  /**
   * Sync runs with the API for a specific experiment
   */
  async syncExperimentRuns(experimentId: string): Promise<void> {
    try {
      // Fetch all runs for the experiment from API
      const apiRuns = await runApi.getRunsByExperiment(experimentId);
      
      // Transform API response to local model format
      const runs = apiRuns.map(this.transformToEntity);
      
      // Delete existing runs for this experiment
      await db.runs
        .where('experiment_id')
        .equals(experimentId)
        .delete();
      
      // Update cache with fresh data
      await db.runs.bulkPut(runs);
    } catch (error) {
      console.error(`Error in syncExperimentRuns(${experimentId}):`, error);
      throw error;
    }
  }
  
  /**
   * Get runs by dataset version ID from local cache across all experiments
   */
  async getRunsByDatasetVersion(datasetVersionId: string): Promise<RunEntity[]> {
    try {
      // Search in the local cache since the backend doesn't support this endpoint
      const cachedRuns = await db.runs
        .where('dataset_version_id')
        .equals(datasetVersionId)
        .toArray();
      
      return cachedRuns;
    } catch (error) {
      console.error(`Error in getRunsByDatasetVersion(${datasetVersionId}):`, error);
      throw error;
    }
  }
  
  /**
   * Transform API response to local entity format
   */
  private transformToEntity(apiRun: Run): RunEntity {
    return {
      id: apiRun.id,
      experiment_id: apiRun.experiment_id,
      dataset_version_id: apiRun.dataset_version_id,
      git_commit: apiRun.git_commit,
      hyperparameters: apiRun.hyperparameters,
      status: apiRun.status,
      started_at: apiRun.started_at,
      finished_at: apiRun.finished_at,
      created_at: apiRun.created_at,
    };
  }
}

// Export singleton instance
export const runManager = new RunManager(); 