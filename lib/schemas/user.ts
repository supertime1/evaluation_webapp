// Schema for user response
export interface UserRead {
  id: string; // UUID converted to string
  email: string;
  is_active: boolean;
  is_superuser: boolean;
  is_verified: boolean;
  created_at: string; // ISO datetime string
  updated_at: string; // ISO datetime string
}

// Schema for creating a new user
export interface UserCreate {
  email: string;
  password: string;
}

// Schema for updating a user
export interface UserUpdate {
  email?: string;
  password?: string;
  is_active?: boolean;
  is_superuser?: boolean;
  is_verified?: boolean;
}

// For local IndexedDB storage
export interface UserModel extends Omit<UserRead, 'created_at' | 'updated_at'> {
  created_at: Date;
  updated_at: Date;
  synced: boolean;
  syncError?: string;
}
