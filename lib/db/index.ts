import Dexie, { Table } from 'dexie';
import { 
  ExperimentEntity, 
  RunEntity, 
  TestCaseEntity, 
  TestResultEntity,
  DatasetEntity,
  DatasetVersionEntity
} from '@/lib/models';

class EvaluationDB extends Dexie {
  // Define tables
  experiments!: Table<ExperimentEntity, string>;
  runs!: Table<RunEntity, string>;
  testCases!: Table<TestCaseEntity, string>;
  testResults!: Table<TestResultEntity, string>;
  datasets!: Table<DatasetEntity, string>;
  datasetVersions!: Table<DatasetVersionEntity, string>;
  
  constructor() {
    super('EvaluationDB');
    
    // Define table schemas
    this.version(1).stores({
      experiments: 'id, name, user_id',
      runs: 'id, experiment_id, status',
      testCases: 'id, name, type, user_id, is_global',
      testResults: 'id, run_id, test_case_id',
      datasets: 'id, name, user_id, is_global',
      datasetVersions: 'id, dataset_id, version_number'
    });

    // ----------------------------------------------------------------------
    // 2) Add hooks for validation and default values
    // ----------------------------------------------------------------------
    this.experiments.hook("creating", (primKey, obj: ExperimentEntity) => {
      if (!obj.user_id) {
        throw new Error("User ID is required");
      }
    });

    this.runs.hook("creating", (primKey, obj: RunEntity) => {
      if (!obj.experiment_id) {
        throw new Error("Experiment ID is required");
      }
    });

    this.testCases.hook("creating", (primKey, obj: TestCaseEntity) => {
      if (!obj.user_id) {
        throw new Error("User ID is required");
      }
    });

    this.testResults.hook("creating", (primKey, obj: TestResultEntity) => {
      if (!obj.run_id) {
        throw new Error("Run ID is required");
      }
    });

    this.datasets.hook("creating", (primKey, obj: DatasetEntity) => {
      if (!obj.user_id) {
        throw new Error("User ID is required");
      }
    });

    this.datasetVersions.hook("creating", (primKey, obj: DatasetVersionEntity) => {
      if (!obj.dataset_id) {
        throw new Error("Dataset ID is required");
      }
    });
    
  }
    
    // ----------------------------------------------------------------------
    // 3) Utility method to reset the entire DB
    // ----------------------------------------------------------------------
    async resetDatabase() {
      // Split into multiple transactions to handle table limit
      await this.transaction("rw", this.experiments, this.runs, this.testCases, () => {
        this.experiments.clear();
        this.runs.clear();
        this.testCases.clear();
      });
      
      await this.transaction("rw", this.testResults, this.datasets, this.datasetVersions, () => {
        this.testResults.clear();
        this.datasets.clear();
        this.datasetVersions.clear();
      });
    }
    
  }

// Create and export database instance
export const db = new EvaluationDB(); 