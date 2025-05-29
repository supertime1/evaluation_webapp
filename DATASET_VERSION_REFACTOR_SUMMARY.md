# Dataset Version Creation Logic Refactor

## Overview
This refactor simplifies the dataset version creation logic by consolidating test case management into the version creation process only, removing the complexity of individual test case add/remove operations.

## Key Changes Made

### 1. Removed "Manage Test Cases" Functionality
- **Removed**: "Manage Test Cases" button from `DatasetDetailHeader`
- **Removed**: Entire `/test-cases` page and directory structure under datasets
- **Removed**: Individual test case add/remove API endpoints and hooks

### 2. Simplified Version Creation Flow
- **Enhanced**: `DatasetVersionCreateModal` to be the single point for test case management
- **Changed**: Instead of selecting existing test cases, users can now manually create new test cases during version creation
- **Added**: Form to create new test cases with name, type, input, and expected output
- **Added**: Real-time preview of changes from current version
- **Removed**: Complex test case selection from database to avoid ID conflicts

### 3. Enhanced Version Details View
- **Added**: `DatasetVersionDetailModal` to show test cases in a version
- **Fixed**: "View Details" button now opens a proper modal instead of broken link
- **Added**: Search functionality within version test cases
- **Added**: Rich preview of test case details with input/output information

### 4. Cleaned Up API Layer
- **Removed**: `addTestCaseToDataset()` and `removeTestCaseFromDataset()` from API client
- **Removed**: Related manager methods and React Query hooks
- **Simplified**: Dataset manager to focus only on dataset CRUD operations

### 5. Removed Unused Components
- **Deleted**: `TestCaseBulkSelector.tsx`
- **Deleted**: `TestCaseSelector.tsx` 
- **Deleted**: `TestCaseDatasetManager.tsx`
- **Updated**: Component exports in `index.ts`

## New User Flow

### Before (Complex)
1. User creates dataset
2. User navigates to "Manage Test Cases" page
3. User adds/removes individual test cases (creates versions automatically)
4. User manually creates versions for tracking
5. Multiple entry points for test case management

### After (Simplified)
1. User creates dataset
2. User creates versions through "Create New Version" modal
3. During version creation, user can:
   - See current test cases in the dataset
   - Remove unwanted existing test cases
   - Manually create new test cases with a simple form
   - Preview changes before creating version
4. User can view version details through "View Details" modal:
   - See all test cases in that version
   - Search through test cases
   - View detailed test case information
5. Single entry point for all test case management

## File Structure Changes

### Removed Files
```
app/dashboard/datasets/[id]/test-cases/
├── page.tsx (main test case management page)
├── new/page.tsx (create test case for dataset)
└── [testCaseId]/page.tsx (test case detail)

app/dashboard/datasets/[id]/versions/new/
└── page.tsx (old version creation page - replaced by modal)

components/datasets/
├── TestCaseBulkSelector.tsx
├── TestCaseSelector.tsx
└── TestCaseDatasetManager.tsx
```

### Added Files
```
components/datasets/
└── DatasetVersionDetailModal.tsx (new version detail modal)
```

### Current Structure
```
app/dashboard/datasets/
├── page.tsx (dataset list)
├── new/ (create dataset)
└── [id]/
    ├── page.tsx (dataset detail - simplified)
    ├── edit/ (edit dataset)
    └── versions/ (version management)

components/datasets/
├── DatasetDetailHeader.tsx (simplified - no manage test cases)
├── DatasetVersionCreateModal.tsx (enhanced)
├── DatasetVersionDetailModal.tsx (new)
├── DatasetVersionHistory.tsx (enhanced)
└── ... (other existing components)
```

## Benefits

### 1. Reduced Complexity
- Single point of entry for test case management
- No confusion about when versions are created
- Clear separation between dataset metadata and test case management
- No duplicate test case IDs from database selection
- Simplified workflow: remove existing cases + create new ones manually

### 2. Better User Experience
- Intuitive workflow: create version → manage test cases
- Real-time preview of changes
- Clear indication of what's being added/removed
- Proper version details view with searchable test cases

### 3. Cleaner Codebase
- Removed ~1000+ lines of complex test case management code
- Simplified API surface
- Fewer components to maintain

### 4. Improved Data Consistency
- Versions are only created intentionally by users
- No automatic version creation from individual test case operations
- Clear audit trail of changes

## Migration Notes

### For Users
- Existing datasets and versions remain unchanged
- Test case management now happens only during version creation
- More intuitive workflow for managing dataset contents
- "View Details" button now works properly and shows test case details

### For Developers
- Removed API endpoints: `/add-test-case` and `/remove-test-case`
- Removed React hooks: `useAddTestCaseToDataset`, `useRemoveTestCaseFromDataset`
- Version creation modal now handles all test case operations
- New `DatasetVersionDetailModal` component for viewing version details

## Future Enhancements

1. **Bulk Import**: Add ability to import multiple test cases during version creation
2. **Templates**: Create version templates with predefined test case sets
3. **Smart Suggestions**: Suggest test cases based on dataset context
4. **Version Branching**: Allow creating versions from any previous version (not just current)
5. **Test Case Editing**: Allow editing test cases directly from version detail modal
6. **Export Functionality**: Export test cases from a version to various formats

## Testing Recommendations

1. Test version creation with add/remove operations
2. Verify existing datasets still work correctly
3. Test search functionality in version creation modal
4. Test the new version detail modal and its search functionality
5. Verify proper error handling for version creation failures
6. Test that deleted API endpoints return appropriate errors
7. Verify test case previews display correctly in version details 