import { Run } from './run';

// Base schema with common fields
export interface ExperimentBase {
  name: string;
  description?: string;
}

// Schema for creating a new experiment
export interface ExperimentCreate extends ExperimentBase {}

// Schema for updating an existing experiment
export interface ExperimentUpdate extends ExperimentBase {}

// Schema for experiment response
export interface Experiment extends ExperimentBase {
  id: string; // Pattern: ^exp_[a-f0-9]{8}$
  user_id: string;
  created_at: string; // ISO datetime string
  updated_at: string; // ISO datetime string
}

// Schema for experiment with runs
export interface ExperimentWithRuns extends Experiment {
  runs: Run[];
}

// For local IndexedDB storage
export interface ExperimentModel extends Omit<Experiment, 'created_at' | 'updated_at'> {
  created_at: Date;
  updated_at: Date;
  synced: boolean;
  syncError?: string;
}
