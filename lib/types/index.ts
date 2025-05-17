export interface Experiment {
  id: string;
  name: string;
  description?: string;
  user_id: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  created_at: string;
  updated_at?: string;
}

export interface Run {
  id: string;
  experiment_id: string;
  git_commit?: string;
  hyperparameters?: Record<string, any>;
  status: 'pending' | 'running' | 'completed' | 'failed';
  created_at: string;
  finished_at?: string;
}

export interface TestCase {
  id: string;
  name: string;
  type: 'llm' | 'conversational' | 'multimodal';
  user_id?: string;
  input: string;
  expected_output?: string;
  context?: string[];
  retrieval_context?: string[];
  additional_metadata?: Record<string, any>;
  is_global: boolean;
  created_at: string;
  updated_at?: string;
}

export interface TestResult {
  id: string;
  run_id: string;
  test_case_id: string;
  name: string;
  success: boolean;
  conversational: boolean;
  input: string;
  actual_output: string;
  expected_output?: string;
  context?: string[];
  retrieval_context?: string[];
  metrics_data: MetricData[];
  additional_metadata?: Record<string, any>;
  executed_at: string;
}

export interface MetricData {
  name: string;
  score: number;
  threshold?: number;
  success: boolean;
  reason?: string;
  strict_mode?: boolean;
  evaluation_model?: string;
  error?: string | null;
  evaluation_cost?: number;
  verbose_logs?: any;
} 