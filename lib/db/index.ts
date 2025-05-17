import Dexie, { Table } from 'dexie';
import { Experiment, Run, TestCase, TestResult } from '../types';

class EvaluationDB extends Dexie {
  experiments!: Table<Experiment, string>;
  runs!: Table<Run, string>;
  testCases!: Table<TestCase, string>;
  testResults!: Table<TestResult, string>;
  
  constructor() {
    super('EvaluationDB');
    this.version(1).stores({
      experiments: 'id, name, user_id, created_at',
      runs: 'id, experiment_id, created_at',
      testCases: 'id, name, type, user_id',
      testResults: 'id, run_id, test_case_id'
    });
  }
}

export const db = new EvaluationDB(); 