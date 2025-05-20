import Dexie, { Table } from 'dexie';
import { ExperimentEntity, RunEntity, TestCaseEntity, TestResultEntity } from '../models';

class EvaluationDB extends Dexie {
  experiments!: Table<ExperimentEntity, string>;
  runs!: Table<RunEntity, string>;
  testCases!: Table<TestCaseEntity, string>;
  testResults!: Table<TestResultEntity, string>;
  
  constructor() {
    super('EvaluationDB');

    // ----------------------------------------------------------------------
    // 1) Define all versions and their schemas
    // ----------------------------------------------------------------------
    this.version(1).stores({
      experiments: '&id, name, user_id, created_at',
      runs: '&id, experiment_id, created_at',
      testCases: '&id, name, type, user_id',
      testResults: '&id, run_id, test_case_id'
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

    this.testResults.hook("creating", (primKey, obj: TestResultEntity) => {
      if (!obj.run_id) {
        throw new Error("Run ID is required");
      }
    });
    
  }
    
    // ----------------------------------------------------------------------
    // 3) Utility method to reset the entire DB
    // ----------------------------------------------------------------------
    async resetDatabase() {
      // TODO: Split into multiple transactions to handle table limit
      await this.transaction("rw", this.experiments, this.runs, this.testCases, this.testResults, () => {
        // Drop all tables
        this.tables.forEach(table => {
          table.clear();
        });
      });
    }
    
  }


export const db = new EvaluationDB(); 