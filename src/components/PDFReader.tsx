import React, { useState, useEffect, useRef } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import { ChevronLeft, ChevronRight, ZoomIn, ZoomOut, Loader2, Upload, BookOpen } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';

// Set up the worker for react-pdf
pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.mjs',
  import.meta.url,
).toString();

interface PDFReaderProps {
  file: File | null;
  onTextSelected: (text: string) => void;
  onReset: () => void;
}

export default function PDFReader({ file, onTextSelected, onReset }: PDFReaderProps) {
  const [numPages, setNumPages] = useState<number>(0);
  const [pageNumber, setPageNumber] = useState<number>(1);
  const [scale, setScale] = useState<number>(1.0);
  const [loading, setLoading] = useState<boolean>(true);
  const containerRef = useRef<HTMLDivElement>(null);

  function onDocumentLoadSuccess({ numPages }: { numPages: number }) {
    setNumPages(numPages);
    setLoading(false);
  }

  function changePage(offset: number) {
    setPageNumber(prevPageNumber => {
      const newPage = prevPageNumber + offset;
      return Math.max(1, Math.min(newPage, numPages));
    });
  }

  const handleMouseUp = () => {
    const selection = window.getSelection();
    if (selection && selection.toString().trim().length > 0) {
      onTextSelected(selection.toString());
    }
  };

  // Reset page when file changes
  useEffect(() => {
    setPageNumber(1);
    setLoading(true);
  }, [file]);

  if (!file) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-slate-500 p-8 text-center">
        <div className="bg-slate-100 p-6 rounded-full mb-4">
          <BookOpen size={48} className="text-slate-400" />
        </div>
        <h3 className="text-xl font-medium text-slate-700 mb-2">No PDF Uploaded</h3>
        <p className="max-w-md">Upload a novel or document to start reading and translating.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-slate-50 relative">
      {/* Toolbar */}
      <div className="flex items-center justify-between px-4 py-3 bg-white border-b border-slate-200 shadow-sm z-10">
        <div className="flex items-center gap-2">
          <button 
            onClick={onReset}
            className="p-2 hover:bg-slate-100 rounded-lg text-slate-600 transition-colors"
            title="Upload new file"
          >
            <Upload size={18} />
          </button>
          <div className="h-6 w-px bg-slate-200 mx-2" />
          <span className="text-sm font-medium text-slate-700 truncate max-w-[200px]">
            {file.name}
          </span>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center bg-slate-100 rounded-lg p-1">
            <button
              disabled={pageNumber <= 1}
              onClick={() => changePage(-1)}
              className="p-1.5 rounded-md hover:bg-white disabled:opacity-50 disabled:hover:bg-transparent text-slate-700 transition-all shadow-sm disabled:shadow-none"
            >
              <ChevronLeft size={18} />
            </button>
            <span className="px-3 text-sm font-mono text-slate-600">
              {pageNumber} / {numPages || '-'}
            </span>
            <button
              disabled={pageNumber >= numPages}
              onClick={() => changePage(1)}
              className="p-1.5 rounded-md hover:bg-white disabled:opacity-50 disabled:hover:bg-transparent text-slate-700 transition-all shadow-sm disabled:shadow-none"
            >
              <ChevronRight size={18} />
            </button>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={() => setScale(s => Math.max(0.5, s - 0.1))}
              className="p-2 hover:bg-slate-100 rounded-lg text-slate-600"
            >
              <ZoomOut size={18} />
            </button>
            <span className="text-xs font-medium text-slate-500 w-12 text-center">
              {Math.round(scale * 100)}%
            </span>
            <button
              onClick={() => setScale(s => Math.min(2.0, s + 0.1))}
              className="p-2 hover:bg-slate-100 rounded-lg text-slate-600"
            >
              <ZoomIn size={18} />
            </button>
          </div>
        </div>
      </div>

      {/* PDF Content */}
      <div 
        className="flex-1 overflow-auto p-8 flex justify-center bg-slate-100/50"
        onMouseUp={handleMouseUp}
        ref={containerRef}
      >
        <Document
          file={file}
          onLoadSuccess={onDocumentLoadSuccess}
          loading={
            <div className="flex flex-col items-center justify-center py-20">
              <Loader2 className="animate-spin text-indigo-600 mb-4" size={32} />
              <p className="text-slate-500 font-medium">Loading Document...</p>
            </div>
          }
          error={
            <div className="flex flex-col items-center justify-center py-20 text-red-500">
              <p>Failed to load PDF.</p>
            </div>
          }
          className="shadow-xl"
        >
          <Page 
            pageNumber={pageNumber} 
            scale={scale} 
            className="bg-white pdf-page-container"
            renderAnnotationLayer={false}
            renderTextLayer={true}
          />
        </Document>
      </div>
    </div>
  );
}
