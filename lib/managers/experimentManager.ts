import { db } from '@/lib/db';
import * as experimentApi from '@/lib/api/experiments';
import { ExperimentCreate, ExperimentUpdate, Experiment } from '@/lib/schemas/experiment';
import { ExperimentEntity } from '@/lib/models';

export class ExperimentManager {
  /**
   * Get all experiments with caching
   */
  async getExperiments(): Promise<ExperimentEntity[]> {
    try {
      // Try to get from IndexedDB first
      const cachedExperiments = await db.experiments.toArray();
      
      // Fetch from API in background and update cache
      try {
        const apiExperiments = await experimentApi.getExperiments();
        
        // Transform API response to local model format
        const experiments = apiExperiments.map(this.transformToEntity);
        
        // Update cache
        await db.experiments.bulkPut(experiments);
        
        return experiments;
      } catch (error) {
        console.error('Error fetching experiments from API:', error);
        
        // Return cached data if we have it
        if (cachedExperiments.length > 0) {
          return cachedExperiments;
        }
        
        throw error;
      }
    } catch (error) {
      console.error('Error in getExperiments:', error);
      throw error;
    }
  }
  
  /**
   * Get a specific experiment by ID
   */
  async getExperiment(id: string): Promise<ExperimentEntity> {
    try {
      // Try to get from IndexedDB first
      const cachedExperiment = await db.experiments.get(id);
      
      // Fetch from API
      try {
        const apiExperiment = await experimentApi.getExperiment(id);
        
        // Transform to local model
        const experiment = this.transformToEntity(apiExperiment);
        
        // Update cache
        await db.experiments.put(experiment);
        
        return experiment;
      } catch (error) {
        console.error(`Error fetching experiment ${id} from API:`, error);
        
        // Return cached data if we have it
        if (cachedExperiment) {
          return cachedExperiment;
        }
        
        throw error;
      }
    } catch (error) {
      console.error(`Error in getExperiment(${id}):`, error);
      throw error;
    }
  }
  
  /**
   * Create a new experiment with optimistic updates
   */
  async createExperiment(experiment: ExperimentCreate): Promise<ExperimentEntity> {
    try {
      // Create optimistic entry with temporary ID
      const optimisticId = `temp_${Date.now()}`;
      const optimisticExperiment: ExperimentEntity = {
        ...experiment,
        id: optimisticId,
        user_id: 'current_user', // Will be replaced by the server
        created_at: new Date().toISOString(),
      };
      
      // Save to IndexedDB immediately for optimistic UI
      await db.experiments.add(optimisticExperiment);
      
      try {
        // Send to API
        const apiExperiment = await experimentApi.createExperiment(experiment);
        
        // Transform to local model
        const createdExperiment = this.transformToEntity(apiExperiment);
        
        // Replace optimistic entry with real data
        await db.experiments.delete(optimisticId);
        await db.experiments.put(createdExperiment);
        
        return createdExperiment;
      } catch (error) {
        // We can't directly set syncError since it's not in the model
        // For now, we'll just keep the optimistic entry
        console.error(`Failed to create experiment ${optimisticId}:`, error);
        
        throw error;
      }
    } catch (error) {
      console.error('Error in createExperiment:', error);
      throw error;
    }
  }
  
  /**
   * Update an existing experiment
   */
  async updateExperiment(id: string, data: ExperimentUpdate): Promise<ExperimentEntity> {
    try {
      // Get the current experiment
      const currentExperiment = await db.experiments.get(id);
      
      if (!currentExperiment) {
        throw new Error(`Experiment with ID ${id} not found`);
      }
      
      // Create optimistic update
      const optimisticExperiment: ExperimentEntity = {
        ...currentExperiment,
        ...data,
        updated_at: new Date().toISOString(),
      };
      
      // Save to IndexedDB immediately
      await db.experiments.update(id, optimisticExperiment);
      
      try {
        // Send to API
        const apiExperiment = await experimentApi.updateExperiment(id, data);
        
        // Transform to local model
        const updatedExperiment = this.transformToEntity(apiExperiment);
        
        // Update in IndexedDB
        await db.experiments.update(id, updatedExperiment);
        
        return updatedExperiment;
      } catch (error) {
        // We can't directly set syncError, just log it
        console.error(`Failed to update experiment ${id}:`, error);
        
        throw error;
      }
    } catch (error) {
      console.error(`Error in updateExperiment(${id}):`, error);
      throw error;
    }
  }
  
  /**
   * Delete an experiment
   */
  async deleteExperiment(id: string): Promise<void> {
    try {
      // No sync status in model, so just try to delete from API
      try {
        // Send to API
        await experimentApi.deleteExperiment(id);
        
        // Remove from IndexedDB
        await db.experiments.delete(id);
      } catch (error) {
        console.error(`Failed to delete experiment ${id}:`, error);
        throw error;
      }
    } catch (error) {
      console.error(`Error in deleteExperiment(${id}):`, error);
      throw error;
    }
  }
  
  /**
   * Sync experiments with the API
   * Note: Since the current model doesn't track sync status, this is just a placeholder 
   * that synchronizes by reloading all experiments
   */
  async syncPendingChanges(): Promise<void> {
    try {
      // Since we don't have sync status in the model, just fetch all from API
      const apiExperiments = await experimentApi.getExperiments();
      
      // Transform API response to local model format
      const experiments = apiExperiments.map(this.transformToEntity);
      
      // Update cache
      await db.experiments.clear();
      await db.experiments.bulkPut(experiments);
    } catch (error) {
      console.error('Error in syncPendingChanges:', error);
      throw error;
    }
  }
  
  /**
   * Transform API response to local entity format
   */
  private transformToEntity(apiExperiment: Experiment): ExperimentEntity {
    return {
      id: apiExperiment.id,
      name: apiExperiment.name,
      description: apiExperiment.description,
      user_id: apiExperiment.user_id,
      created_at: apiExperiment.created_at,
      updated_at: apiExperiment.updated_at
    };
  }
}

// Export singleton instance
export const experimentManager = new ExperimentManager();
