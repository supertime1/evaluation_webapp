import { db } from '@/lib/db';
import * as testResultApi from '@/lib/api/testResults';
import { TestResultCreate, TestResult } from '@/lib/schemas/testResult';
import { TestResultEntity, MetricDataEntity } from '@/lib/models';

export class TestResultManager {
  /**
   * Get all test results for a specific run
   */
  async getTestResultsByRun(runId: string): Promise<TestResultEntity[]> {
    try {
      // Try to get from IndexedDB first
      const cachedTestResults = await db.testResults
        .where('run_id')
        .equals(runId)
        .toArray();
      
      // Fetch from API
      try {
        const apiTestResults = await testResultApi.getTestResultsByRun(runId);
        
        // Transform API response to local model format
        const testResults = apiTestResults.map(this.transformToEntity);
        
        // Update cache
        await db.testResults.bulkPut(testResults);
        
        return testResults;
      } catch (error) {
        console.error(`Error fetching test results for run ${runId} from API:`, error);
        
        // Return cached data if we have it
        if (cachedTestResults.length > 0) {
          return cachedTestResults;
        }
        
        throw error;
      }
    } catch (error) {
      console.error(`Error in getTestResultsByRun(${runId}):`, error);
      throw error;
    }
  }
  
  /**
   * Get a specific test result by ID
   */
  async getTestResult(id: string): Promise<TestResultEntity> {
    try {
      // Try to get from IndexedDB first
      const cachedTestResult = await db.testResults.get(id);
      
      // Fetch from API
      try {
        const apiTestResult = await testResultApi.getTestResult(id);
        
        // Transform to local model
        const testResult = this.transformToEntity(apiTestResult);
        
        // Update cache
        await db.testResults.put(testResult);
        
        return testResult;
      } catch (error) {
        console.error(`Error fetching test result ${id} from API:`, error);
        
        // Return cached data if we have it
        if (cachedTestResult) {
          return cachedTestResult;
        }
        
        throw error;
      }
    } catch (error) {
      console.error(`Error in getTestResult(${id}):`, error);
      throw error;
    }
  }
  
  /**
   * Create a new test result
   */
  async createTestResult(testResult: TestResultCreate): Promise<TestResultEntity> {
    try {
      // Send to API without optimistic update because test results are typically created in batches
      const apiTestResult = await testResultApi.createTestResult(testResult);
      
      // Transform to local model
      const createdTestResult = this.transformToEntity(apiTestResult);
      
      // Save to IndexedDB
      await db.testResults.put(createdTestResult);
      
      return createdTestResult;
    } catch (error) {
      console.error(`Error in createTestResult:`, error);
      throw error;
    }
  }
  
  /**
   * Create multiple test results at once
   */
  async createBatchTestResults(testResults: TestResultCreate[]): Promise<TestResultEntity[]> {
    try {
      // Send to API
      const apiTestResults = await testResultApi.createBatchTestResults(testResults);
      
      // Transform to local model
      const createdTestResults = apiTestResults.map(this.transformToEntity);
      
      // Save to IndexedDB
      await db.testResults.bulkPut(createdTestResults);
      
      return createdTestResults;
    } catch (error) {
      console.error(`Error in createBatchTestResults:`, error);
      throw error;
    }
  }
  
  /**
   * Delete a test result
   */
  async deleteTestResult(id: string): Promise<void> {
    try {
      // Send to API
      await testResultApi.deleteTestResult(id);
      
      // Remove from IndexedDB
      await db.testResults.delete(id);
    } catch (error) {
      console.error(`Error in deleteTestResult(${id}):`, error);
      throw error;
    }
  }
  
  /**
   * Sync test results for a specific run
   */
  async syncRunTestResults(runId: string): Promise<void> {
    try {
      // Fetch all test results for the run from API
      const apiTestResults = await testResultApi.getTestResultsByRun(runId);
      
      // Transform API response to local model format
      const testResults = apiTestResults.map(this.transformToEntity);
      
      // Delete existing test results for this run
      await db.testResults
        .where('run_id')
        .equals(runId)
        .delete();
      
      // Update cache with fresh data
      await db.testResults.bulkPut(testResults);
    } catch (error) {
      console.error(`Error in syncRunTestResults(${runId}):`, error);
      throw error;
    }
  }
  
  /**
   * Transform API response to local entity format
   */
  private transformToEntity(apiTestResult: TestResult): TestResultEntity {
    return {
      id: apiTestResult.id,
      run_id: apiTestResult.run_id,
      test_case_id: apiTestResult.test_case_id,
      name: apiTestResult.name,
      success: apiTestResult.success,
      conversational: apiTestResult.conversational,
      multimodal: apiTestResult.multimodal || false,
      input: typeof apiTestResult.input === 'string' 
        ? apiTestResult.input 
        : JSON.stringify(apiTestResult.input || ''),
      actual_output: typeof apiTestResult.actual_output === 'string'
        ? apiTestResult.actual_output
        : JSON.stringify(apiTestResult.actual_output || ''),
      expected_output: apiTestResult.expected_output,
      context: apiTestResult.context,
      retrieval_context: apiTestResult.retrieval_context,
      metrics_data: apiTestResult.metrics_data || [],
      additional_metadata: apiTestResult.additional_metadata,
      executed_at: apiTestResult.executed_at,
    };
  }
}

// Export singleton instance
export const testResultManager = new TestResultManager(); 