import { useState, useCallback } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';
import {
  X, ZoomIn, ZoomOut, RotateCw, ChevronLeft, ChevronRight, Loader2, AlertCircle,
} from 'lucide-react';
import type { EmpDetailDocument } from './types';

// Use local worker served from /public — avoids CDN failures in dev/prod
pdfjs.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.mjs';

const ZOOM_STEP = 0.25;
const MIN_ZOOM  = 0.5;
const MAX_ZOOM  = 3;

interface Props {
  doc: EmpDetailDocument;
  onClose: () => void;
}

export function DocViewerModal({ doc, onClose }: Props) {
  const [numPages, setNumPages] = useState<number>(0);
  const [page, setPage]         = useState(1);
  const [scale, setScale]       = useState(1);
  const [rotation, setRotation] = useState(0);
  const [status, setStatus]     = useState<'loading' | 'ready' | 'error'>('loading');

  const onDocLoad = useCallback(({ numPages }: { numPages: number }) => {
    setNumPages(numPages);
    setStatus('ready');
  }, []);

  const onDocError = useCallback(() => setStatus('error'), []);

  const zoomIn  = () => setScale(s => Math.min(MAX_ZOOM, +(s + ZOOM_STEP).toFixed(2)));
  const zoomOut = () => setScale(s => Math.max(MIN_ZOOM, +(s - ZOOM_STEP).toFixed(2)));
  const rotate  = () => setRotation(r => (r + 90) % 360);

  const isImage = doc.contentType.startsWith('image/');

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl flex flex-col" style={{ height: '90vh' }}>

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-gray-100 shrink-0">
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold text-gray-800 truncate">{doc.fileName}</p>
            <p className="text-xs text-gray-400">{doc.documentType} · {doc.fileSizeStr}</p>
          </div>

          {/* Zoom + Rotate controls */}
          <div className="flex items-center gap-1 mx-4 shrink-0">
            <button
              onClick={zoomOut}
              disabled={scale <= MIN_ZOOM}
              className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-500 hover:bg-gray-100 disabled:opacity-30 transition-colors"
              title="Zoom out"
            >
              <ZoomOut className="w-4 h-4" />
            </button>
            <span className="text-xs font-medium text-gray-600 w-12 text-center select-none">
              {Math.round(scale * 100)}%
            </span>
            <button
              onClick={zoomIn}
              disabled={scale >= MAX_ZOOM}
              className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-500 hover:bg-gray-100 disabled:opacity-30 transition-colors"
              title="Zoom in"
            >
              <ZoomIn className="w-4 h-4" />
            </button>
            <div className="w-px h-5 bg-gray-200 mx-1" />
            <button
              onClick={rotate}
              className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-500 hover:bg-gray-100 transition-colors"
              title="Rotate 90°"
            >
              <RotateCw className="w-4 h-4" />
            </button>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors shrink-0"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content area */}
        <div className="flex-1 overflow-auto bg-gray-100 flex items-start justify-center p-4 relative">

          {/* Loading overlay */}
          {status === 'loading' && !isImage && (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-100 z-10">
              <div className="flex flex-col items-center gap-2">
                <Loader2 className="w-8 h-8 animate-spin text-green-500" />
                <p className="text-xs text-gray-400">Loading document…</p>
              </div>
            </div>
          )}

          {/* Error state */}
          {status === 'error' && (
            <div className="flex flex-col items-center justify-center h-full gap-3 text-center">
              <AlertCircle className="w-10 h-10 text-red-300" />
              <p className="text-sm text-gray-500">Failed to load document</p>
            </div>
          )}

          {/* Image viewer */}
          {isImage && (
            <img
              src={doc.url}
              alt={doc.fileName}
              onLoad={() => setStatus('ready')}
              onError={() => setStatus('error')}
              style={{
                transform: `scale(${scale}) rotate(${rotation}deg)`,
                transformOrigin: 'top center',
              }}
              className="max-w-full transition-transform duration-200"
            />
          )}

          {/* PDF viewer */}
          {!isImage && status !== 'error' && (
            <Document
              file={doc.url}
              onLoadSuccess={onDocLoad}
              onLoadError={onDocError}
              loading={null}
              noData={null}
            >
              <Page
                pageNumber={page}
                scale={scale}
                rotate={rotation}
                renderAnnotationLayer={false}
                renderTextLayer={false}
                loading={null}
              />
            </Document>
          )}
        </div>

        {/* Page navigation — only for multi-page PDFs */}
        {!isImage && numPages > 1 && (
          <div className="flex items-center justify-center gap-3 px-5 py-3 border-t border-gray-100 shrink-0">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="w-7 h-7 rounded-lg flex items-center justify-center text-gray-500 hover:bg-gray-100 disabled:opacity-30 transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-xs text-gray-500">
              Page <span className="font-semibold text-gray-700">{page}</span> of {numPages}
            </span>
            <button
              onClick={() => setPage(p => Math.min(numPages, p + 1))}
              disabled={page === numPages}
              className="w-7 h-7 rounded-lg flex items-center justify-center text-gray-500 hover:bg-gray-100 disabled:opacity-30 transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
