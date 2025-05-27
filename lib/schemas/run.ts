import { TestResult } from './testResult';

export enum RunStatus {
  PENDING = "pending",
  RUNNING = "running",
  COMPLETED = "completed",
  FAILED = "failed"
}

// Base schema with common fields
export interface RunBase {
  git_commit: string;
  hyperparameters?: Record<string, string | number | boolean>;
}

// Schema for creating a new run
export interface RunCreate extends RunBase {
  experiment_id: string; // Pattern: ^exp_[a-f0-9]{8}$
  dataset_version_id: string; // Pattern: ^dsv_[a-f0-9]{8}$
}

// Schema for updating an existing run
export interface RunUpdate {
  status?: RunStatus;
  started_at?: string; // ISO datetime string
  finished_at?: string; // ISO datetime string
  hyperparameters?: Record<string, string | number | boolean>;
}

// Schema for run response
export interface Run extends RunBase {
  id: string; // Pattern: ^run_[a-f0-9]{8}$
  experiment_id: string; // Pattern: ^exp_[a-f0-9]{8}$
  dataset_version_id: string; // Pattern: ^dsv_[a-f0-9]{8}$
  status: RunStatus;
  started_at?: string; // ISO datetime string
  finished_at?: string; // ISO datetime string
  created_at: string; // ISO datetime string
}

// Schema for run with test results
export interface RunWithResults extends Run {
  test_results: TestResult[];
}

// For local IndexedDB storage
export interface RunModel extends Omit<Run, 'created_at' | 'started_at' | 'finished_at'> {
  created_at: Date;
  started_at?: Date;
  finished_at?: Date;
  synced: boolean;
  syncError?: string;
}
