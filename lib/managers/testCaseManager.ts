import { db } from '@/lib/db';
import * as testCaseApi from '@/lib/api/testCases';
import { TestCaseCreate, TestCaseUpdate, TestCase, TestCaseType, TestCaseInput } from '@/lib/schemas/testCase';
import { TestCaseEntity } from '@/lib/models';

/**
 * Utility function to convert TestCaseInput to string for storage
 * TestCaseInput can be a string or an array of strings/MLLMImage objects
 */
const stringifyTestCaseInput = (input: TestCaseInput | undefined): string => {
  if (!input) return '';
  
  if (typeof input === 'string') {
    return input;
  }
  
  // For arrays, convert to JSON string
  return JSON.stringify(input);
};

export class TestCaseManager {
  /**
   * Get all test cases with caching
   */
  async getTestCases(): Promise<TestCaseEntity[]> {
    try {
      // Try to get from IndexedDB first
      const cachedTestCases = await db.testCases
        .filter(testCase => !testCase.is_global)
        .toArray();
      
      // Fetch from API in background and update cache
      try {
        const apiTestCases = await testCaseApi.getTestCases();
        
        // Transform API response to local model format
        const testCases = apiTestCases.map(this.transformToEntity);
        
        // Update cache
        await db.testCases.bulkPut(testCases);
        
        return testCases;
      } catch (error) {
        console.error('Error fetching test cases from API:', error);
        
        // Return cached data if we have it
        if (cachedTestCases.length > 0) {
          return cachedTestCases;
        }
        
        throw error;
      }
    } catch (error) {
      console.error('Error in getTestCases:', error);
      throw error;
    }
  }
  
  /**
   * Get global test cases with caching
   */
  async getGlobalTestCases(): Promise<TestCaseEntity[]> {
    try {
      // Try to get from IndexedDB first
      const cachedTestCases = await db.testCases
        .filter(testCase => testCase.is_global)
        .toArray();
      
      // Fetch from API in background and update cache
      try {
        const apiTestCases = await testCaseApi.getGlobalTestCases();
        
        // Transform API response to local model format
        const testCases = apiTestCases.map(this.transformToEntity);
        
        // Update cache
        await db.testCases.bulkPut(testCases);
        
        return testCases;
      } catch (error) {
        console.error('Error fetching global test cases from API:', error);
        
        // Return cached data if we have it
        if (cachedTestCases.length > 0) {
          return cachedTestCases;
        }
        
        throw error;
      }
    } catch (error) {
      console.error('Error in getGlobalTestCases:', error);
      throw error;
    }
  }
  
  /**
   * Get a specific test case by ID
   */
  async getTestCase(id: string): Promise<TestCaseEntity> {
    try {
      // Try to get from IndexedDB first
      const cachedTestCase = await db.testCases.get(id);
      
      // Fetch from API
      try {
        const apiTestCase = await testCaseApi.getTestCase(id);
        
        // Transform to local model
        const testCase = this.transformToEntity(apiTestCase);
        
        // Update cache
        await db.testCases.put(testCase);
        
        return testCase;
      } catch (error) {
        console.error(`Error fetching test case ${id} from API:`, error);
        
        // Return cached data if we have it
        if (cachedTestCase) {
          return cachedTestCase;
        }
        
        throw error;
      }
    } catch (error) {
      console.error(`Error in getTestCase(${id}):`, error);
      throw error;
    }
  }
  
  /**
   * Create a new test case with optimistic updates
   */
  async createTestCase(testCase: TestCaseCreate): Promise<TestCaseEntity> {
    try {
      // Create optimistic entry with temporary ID
      const optimisticId = `temp_${Date.now()}`;
      const optimisticTestCase: TestCaseEntity = {
        ...testCase,
        id: optimisticId,
        user_id: 'current_user', // Will be replaced by the server
        is_global: false, // Users can't create global test cases directly
        type: testCase.type as TestCaseType,
        input: stringifyTestCaseInput(testCase.input),
        created_at: new Date().toISOString(),
      };
      
      // Save to IndexedDB immediately for optimistic UI
      await db.testCases.add(optimisticTestCase);
      
      try {
        // Send to API
        const apiTestCase = await testCaseApi.createTestCase(testCase);
        
        // Transform to local model
        const createdTestCase = this.transformToEntity(apiTestCase);
        
        // Replace optimistic entry with real data
        await db.testCases.delete(optimisticId);
        await db.testCases.put(createdTestCase);
        
        return createdTestCase;
      } catch (error) {
        console.error(`Failed to create test case ${optimisticId}:`, error);
        throw error;
      }
    } catch (error) {
      console.error('Error in createTestCase:', error);
      throw error;
    }
  }
  
  /**
   * Update an existing test case
   */
  async updateTestCase(id: string, data: TestCaseUpdate): Promise<TestCaseEntity> {
    try {
      // Get the current test case
      const currentTestCase = await db.testCases.get(id);
      
      if (!currentTestCase) {
        throw new Error(`Test case with ID ${id} not found`);
      }
      
      // Ensure type is a valid TestCaseType
      const type = data.type as TestCaseType;
      
      // Create optimistic update
      const optimisticTestCase: TestCaseEntity = {
        ...currentTestCase,
        ...data,
        type,
        input: data.input ? stringifyTestCaseInput(data.input) : currentTestCase.input,
        updated_at: new Date().toISOString(),
      };
      
      // Save to IndexedDB immediately
      await db.testCases.update(id, optimisticTestCase);
      
      try {
        // Send to API
        const apiTestCase = await testCaseApi.updateTestCase(id, data);
        
        // Transform to local model
        const updatedTestCase = this.transformToEntity(apiTestCase);
        
        // Update in IndexedDB
        await db.testCases.update(id, updatedTestCase);
        
        return updatedTestCase;
      } catch (error) {
        console.error(`Failed to update test case ${id}:`, error);
        throw error;
      }
    } catch (error) {
      console.error(`Error in updateTestCase(${id}):`, error);
      throw error;
    }
  }
  
  /**
   * Delete a test case
   */
  async deleteTestCase(id: string): Promise<void> {
    try {
      // Check if this is a global test case (users can't delete global test cases)
      const testCase = await db.testCases.get(id);
      if (testCase?.is_global) {
        throw new Error("Cannot delete global test cases");
      }
      
      // Delete from API
      try {
        await testCaseApi.deleteTestCase(id);
        
        // Remove from IndexedDB
        await db.testCases.delete(id);
      } catch (error) {
        console.error(`Failed to delete test case ${id}:`, error);
        throw error;
      }
    } catch (error) {
      console.error(`Error in deleteTestCase(${id}):`, error);
      throw error;
    }
  }
  
  /**
   * Sync test cases with the API
   */
  async syncTestCases(): Promise<void> {
    try {
      // Sync user test cases
      const apiTestCases = await testCaseApi.getTestCases();
      const userTestCases = apiTestCases.map(this.transformToEntity);
      
      // Sync global test cases
      const apiGlobalTestCases = await testCaseApi.getGlobalTestCases();
      const globalTestCases = apiGlobalTestCases.map(this.transformToEntity);
      
      // Merge all test cases
      const allTestCases = [...userTestCases, ...globalTestCases];
      
      // Update cache - clear non-optimistic entries
      await db.testCases
        .filter(tc => !tc.id.startsWith('temp_'))
        .delete();
      
      // Add all test cases
      await db.testCases.bulkPut(allTestCases);
    } catch (error) {
      console.error('Error in syncTestCases:', error);
      throw error;
    }
  }
  
  /**
   * Transform API response to local entity format
   */
  private transformToEntity(apiTestCase: TestCase): TestCaseEntity {
    return {
      id: apiTestCase.id,
      name: apiTestCase.name,
      type: apiTestCase.type as TestCaseType,
      user_id: apiTestCase.user_id,
      input: stringifyTestCaseInput(apiTestCase.input),
      expected_output: apiTestCase.expected_output,
      context: apiTestCase.context,
      retrieval_context: apiTestCase.retrieval_context,
      additional_metadata: apiTestCase.additional_metadata,
      is_global: apiTestCase.is_global,
      created_at: apiTestCase.created_at,
      updated_at: apiTestCase.updated_at
    };
  }
}

// Export singleton instance
export const testCaseManager = new TestCaseManager(); 