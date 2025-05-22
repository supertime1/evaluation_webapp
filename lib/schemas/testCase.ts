import { TestResult } from './testResult';

export enum TestCaseType {
  LLM = "llm",
  CONVERSATIONAL = "conversational",
  MULTIMODAL = "multimodal"
}

// Define MLLMImage interface to match the Python class
export interface MLLMImage {
  url: string;
  alt_text?: string;
}

// Type for input that can be string or array of strings/images
export type TestCaseInput = string | (string | MLLMImage)[];

// Base schema with common fields
export interface TestCaseBase {
  name: string;
  type: string;
  input?: TestCaseInput;
  expected_output?: string;
  context?: string[];
  retrieval_context?: string[];
  additional_metadata?: Record<string, any>;
  is_global: boolean;
}

// Schema for creating a new test case
export interface TestCaseCreate extends TestCaseBase {}

// Schema for updating an existing test case
export interface TestCaseUpdate extends TestCaseBase {}

// Schema for test case response
export interface TestCase extends TestCaseBase {
  id: string; // Pattern: ^tc_[a-f0-9]{8}$
  user_id: string;
  created_at: string; // ISO datetime string
  updated_at: string; // ISO datetime string
}

// Schema for test case with results
export interface TestCaseWithResults extends TestCase {
  test_results: TestResult[];
}

// For local IndexedDB storage
export interface TestCaseModel extends Omit<TestCase, 'created_at' | 'updated_at'> {
  created_at: Date;
  updated_at: Date;
  synced: boolean;
  syncError?: string;
}
