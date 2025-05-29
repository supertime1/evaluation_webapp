# PDF Importer Setup Guide

## Overview
The PDF importer component allows users to upload PDF files and extract text content for creating test cases. It uses the `pdfjs-dist` library, which is the browser version of PDF.js.

## Setup Steps

### 1. Install Dependencies
```bash
npm install pdfjs-dist
```

### 2. Copy Worker File
The PDF.js library requires a worker file to process PDFs. Copy it to the public directory:
```bash
cp node_modules/pdfjs-dist/build/pdf.worker.min.mjs public/
```

### 3. Configure Next.js Headers
Add proper headers in `next.config.js` to serve the worker file:
```javascript
async headers() {
  return [
    {
      source: '/pdf.worker.min.mjs',
      headers: [
        {
          key: 'Content-Type',
          value: 'application/javascript',
        },
      ],
    },
  ];
},
```

### 4. Component Configuration
The PDF importer component is configured to use the local worker:
```typescript
pdfjsLib.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.mjs';
```

## Troubleshooting

### Common Issues

#### "Failed to fetch dynamically imported module" Error
- **Cause**: Worker file not found or incorrect path
- **Solution**: Ensure the worker file is copied to `public/pdf.worker.min.mjs`
- **Check**: Verify the file exists at `http://localhost:3000/pdf.worker.min.mjs`

#### "Worker setup failed" Error
- **Cause**: CORS or MIME type issues
- **Solution**: Check Next.js headers configuration
- **Alternative**: Use CDN fallback (less reliable)

#### No Text Extracted
- **Cause**: PDF might be image-based or empty
- **Solution**: Component shows appropriate error message
- **Note**: OCR is not supported (text-based PDFs only)

### Development vs Production

#### Development
- Uses local worker file from public directory
- Better for debugging and offline development

#### Production
- Same local worker file is served statically
- Ensure the worker file is included in deployment

## Features

### File Validation
- File type: PDF only
- File size: 10MB maximum
- Error handling for invalid files

### Text Extraction
- Page-by-page text extraction
- Preserves page structure with `[Page N]` markers
- Handles multi-page documents
- Proper spacing and formatting

### UI Modes
- **Compact**: Small button for inline use in forms
- **Full**: Drag-and-drop area for standalone use

### Error Handling
- Network errors
- Invalid PDF files
- Empty or image-based PDFs
- Worker loading failures

## Usage Example

```tsx
import { PDFImporter } from '@/components/ui/pdf-importer';

function MyComponent() {
  const handleTextExtracted = (text: string, filename: string) => {
    console.log('Extracted text:', text);
    console.log('From file:', filename);
  };

  return (
    <PDFImporter
      onTextExtracted={handleTextExtracted}
      compact={true}
      disabled={false}
    />
  );
}
```

## Integration in Dataset Version Creation

The PDF importer is integrated into the test case creation form:
- Located below the "Input" field
- Uses compact mode for better form integration
- Automatically populates input field with extracted text
- Suggests test case name based on PDF filename 