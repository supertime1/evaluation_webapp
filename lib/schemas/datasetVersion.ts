// Dataset Version API schemas

export interface DatasetVersionCreate {
  test_case_ids: string[]; // Array of tc_[uuid]
  change_summary?: string;
}

export interface DatasetVersion {
  id: string; // dsv_[uuid]
  dataset_id: string; // ds_[uuid]
  version_number: number;
  test_case_ids: string[]; // Array of tc_[uuid]
  change_summary?: string;
  created_at: string;
  created_by_user_id: string;
}

export interface DatasetVersionWithTestCases extends DatasetVersion {
  test_cases?: TestCase[];
}

// Import TestCase type from existing schema
import { TestCase } from './testCase';

// Response types for version endpoints
export interface DatasetVersionListResponse {
  versions: DatasetVersion[];
  total: number;
}

export interface DatasetVersionDetailResponse extends DatasetVersionWithTestCases {}

// For version comparison
export interface DatasetVersionComparison {
  from_version: DatasetVersion;
  to_version: DatasetVersion;
  added_test_cases: string[];
  removed_test_cases: string[];
  unchanged_test_cases: string[];
} 