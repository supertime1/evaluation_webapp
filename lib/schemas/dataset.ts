// Dataset API schemas based on the backend API specification

export interface DatasetCreate {
  name: string;
  description?: string;
  is_global: boolean;
}

export interface DatasetUpdate {
  name?: string;
  description?: string;
  is_global?: boolean;
}

export interface Dataset {
  id: string; // ds_[uuid]
  name: string;
  description?: string;
  is_global: boolean;
  user_id: string;
  created_at: string;
  updated_at: string;
  current_version_id?: string;
}

export interface DatasetWithVersions extends Dataset {
  versions?: DatasetVersion[];
}

// Import DatasetVersion type
export interface DatasetVersion {
  id: string; // dsv_[uuid]
  dataset_id: string; // ds_[uuid]
  version_number: number;
  test_case_ids: string[]; // Array of tc_[uuid]
  change_summary?: string;
  created_at: string;
  created_by_user_id: string;
}

// Response types for API endpoints
export interface DatasetListResponse {
  datasets: Dataset[];
  total: number;
}

export interface DatasetDetailResponse extends DatasetWithVersions {} 