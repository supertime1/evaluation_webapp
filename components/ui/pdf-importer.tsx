'use client';

import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { FileText, Upload, Loader2, AlertCircle } from 'lucide-react';
import * as pdfjsLib from 'pdfjs-dist';

// Configure PDF.js worker
if (typeof window !== 'undefined') {
  // Try to use local worker first, fallback to CDN if needed
  pdfjsLib.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.mjs';
  
  // Fallback configuration for development
  if (process.env.NODE_ENV === 'development') {
    // Alternative: you can also try the CDN as fallback
    // pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;
  }
}

interface PDFImporterProps {
  onTextExtracted: (text: string, filename: string) => void;
  disabled?: boolean;
  className?: string;
  compact?: boolean;
}

export function PDFImporter({ onTextExtracted, disabled, className, compact }: PDFImporterProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const extractTextFromPDF = async (file: File): Promise<string> => {
    try {
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      
      let fullText = '';
      
      // Extract text from each page
      for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
        const page = await pdf.getPage(pageNum);
        const textContent = await page.getTextContent();
        
        // Combine text items with proper spacing
        const pageText = textContent.items
          .map((item: any) => {
            if ('str' in item) {
              return item.str;
            }
            return '';
          })
          .join(' ')
          .replace(/\s+/g, ' ') // Replace multiple spaces with single space
          .trim();
        
        if (pageText) {
          fullText += (fullText ? '\n\n' : '') + `[Page ${pageNum}]\n${pageText}`;
        }
      }
      
      return fullText.trim();
    } catch (error) {
      console.error('Error extracting text from PDF:', error);
      
      // Handle specific error types
      if (error instanceof Error) {
        if (error.message.includes('worker') || error.message.includes('fetch')) {
          throw new Error('PDF processing failed. Please try refreshing the page and try again.');
        }
        if (error.message.includes('Invalid PDF')) {
          throw new Error('The selected file appears to be corrupted or is not a valid PDF.');
        }
      }
      
      throw new Error('Failed to extract text from PDF. Please ensure the file is a valid PDF document.');
    }
  };

  const handleFileSelect = async (file: File) => {
    if (!file) return;

    // Validate file type
    if (file.type !== 'application/pdf') {
      setError('Please select a valid PDF file.');
      return;
    }

    // Validate file size (10MB limit)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      setError('File size must be less than 10MB.');
      return;
    }

    setIsProcessing(true);
    setError(null);

    try {
      const extractedText = await extractTextFromPDF(file);
      
      if (!extractedText.trim()) {
        setError('No text could be extracted from this PDF. The PDF might be image-based or empty.');
        return;
      }

      onTextExtracted(extractedText, file.name);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to process PDF file.');
    } finally {
      setIsProcessing(false);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleFileInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleButtonClick = () => {
    if (disabled || isProcessing) return;
    fileInputRef.current?.click();
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    if (disabled || isProcessing) return;

    const files = Array.from(event.dataTransfer.files);
    const pdfFile = files.find(file => file.type === 'application/pdf');
    
    if (pdfFile) {
      handleFileSelect(pdfFile);
    } else {
      setError('Please drop a valid PDF file.');
    }
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
  };

  return (
    <div className={`space-y-2 ${className}`}>
      <input
        ref={fileInputRef}
        type="file"
        accept=".pdf,application/pdf"
        onChange={handleFileInputChange}
        className="hidden"
        disabled={disabled || isProcessing}
      />
      
      {compact ? (
        // Compact layout for inline use
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleButtonClick}
            disabled={disabled || isProcessing}
            className="gap-1 text-xs h-7 px-2"
          >
            {isProcessing ? (
              <Loader2 className="h-3 w-3 animate-spin" />
            ) : (
              <FileText className="h-3 w-3" />
            )}
            {isProcessing ? 'Processing...' : 'Import PDF'}
          </Button>
          <span className="text-xs text-slate-500">
            {isProcessing ? 'Extracting text...' : 'Import text from PDF file'}
          </span>
        </div>
      ) : (
        // Full layout with drag and drop
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          className={`
            relative border-2 border-dashed rounded-lg p-4 transition-colors
            ${disabled || isProcessing ? 'border-slate-200 bg-slate-50' : 'border-slate-300 hover:border-slate-400 hover:bg-slate-50'}
            ${error ? 'border-red-300 bg-red-50' : ''}
          `}
        >
          <div className="flex flex-col items-center text-center">
            <div className="mb-2">
              {isProcessing ? (
                <Loader2 className="h-8 w-8 text-slate-400 animate-spin" />
              ) : error ? (
                <AlertCircle className="h-8 w-8 text-red-500" />
              ) : (
                <FileText className="h-8 w-8 text-slate-400" />
              )}
            </div>
            
            <Button
              type="button"
              variant="outline"
              onClick={handleButtonClick}
              disabled={disabled || isProcessing}
              className="mb-2 gap-2"
            >
              <Upload className="h-4 w-4" />
              {isProcessing ? 'Processing PDF...' : 'Import from PDF'}
            </Button>
            
            <p className="text-xs text-slate-500">
              {isProcessing ? (
                'Extracting text from PDF document...'
              ) : (
                'Click to upload or drag and drop a PDF file here'
              )}
            </p>
            
            <p className="text-xs text-slate-400 mt-1">
              Maximum file size: 10MB
            </p>
          </div>
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded-md text-sm">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-4 w-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        </div>
      )}
    </div>
  );
} 