import { MLLMImage, TestCaseInput } from './testCase';

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
  verbose_logs?: string | null;
  [key: string]: any;
}

// Base schema with common fields
export interface TestResultBase {
  name: string;
  success: boolean;
  conversational: boolean;
  multimodal?: boolean;
  input?: TestCaseInput;
  actual_output?: string | (string | MLLMImage)[];
  expected_output?: string;
  context?: string[];
  retrieval_context?: string[];
  metrics_data?: MetricData[];
  additional_metadata?: Record<string, any>;
}

// Schema for creating a new test result
export interface TestResultCreate extends TestResultBase {
  run_id: string; // Pattern: ^run_[a-f0-9]{8}$
  test_case_id: string; // Pattern: ^tc_[a-f0-9]{8}$
}

// Schema for test result response
export interface TestResult extends TestResultBase {
  id: string; // Pattern: ^tr_[a-f0-9]{8}$
  run_id: string; // Pattern: ^run_[a-f0-9]{8}$
  test_case_id: string; // Pattern: ^tc_[a-f0-9]{8}$
  executed_at: string; // ISO datetime string
}

// For local IndexedDB storage
export interface TestResultModel extends Omit<TestResult, 'executed_at'> {
  executed_at: Date;
  synced: boolean;
  syncError?: string;
}
