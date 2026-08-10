import { useState, useCallback, useEffect } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X, ZoomIn, ZoomOut, RotateCw, ChevronLeft, ChevronRight, Loader2, AlertCircle,
  Download, Maximize2, Minimize2, FileText, Image as ImageIcon, CheckCircle
} from 'lucide-react';
import type { EmpDetailDocument } from '@/modules/hr/types/employee/empDetail';
import { useLanguage } from '@/shared/i18n/LanguageContext';

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
  const { t } = useLanguage();
  const [numPages, setNumPages] = useState<number>(0);
  const [page, setPage]         = useState(1);
  const [scale, setScale]       = useState(1);
  const [rotation, setRotation] = useState(0);
  const [status, setStatus]     = useState<'loading' | 'ready' | 'error'>('loading');
  const [isFullscreen, setIsFullscreen] = useState(false);

  const onDocLoad = useCallback(({ numPages }: { numPages: number }) => {
    setNumPages(numPages);
    setStatus('ready');
  }, []);

  const onDocError = useCallback(() => setStatus('error'), []);

  const zoomIn  = () => setScale(s => Math.min(MAX_ZOOM, +(s + ZOOM_STEP).toFixed(2)));
  const zoomOut = () => setScale(s => Math.max(MIN_ZOOM, +(s - ZOOM_STEP).toFixed(2)));
  const rotate  = () => setRotation(r => (r + 90) % 360);

  const handleDownload = () => {
    if (doc.url) {
      const link = document.createElement('a');
      link.href = doc.url;
      link.download = doc.fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      onClose();
    } else if (e.key === 'ArrowLeft' && page > 1) {
      setPage(p => p - 1);
    } else if (e.key === 'ArrowRight' && page < numPages) {
      setPage(p => p + 1);
    }
  }, [onClose, page, numPages]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  const isImage = doc.contentType.startsWith('image/');
  const zoomOutTitle = t.zoomOut || 'Zoom out';
  const zoomInTitle = t.zoomIn || 'Zoom in';
  const rotateTitle = t.rotate || 'Rotate 90°';
  const fullscreenTitle = isFullscreen ? (t.exitFullscreen || 'Exit fullscreen') : (t.fullscreen || 'Fullscreen');
  const downloadTitle = t.download || 'Download';
  const loadingDocument = t.loadingDocument || 'Loading document...';
  const failedToLoad = t.failedToLoadDocument || 'Failed to Load Document';
  const pleaseTryAgain = t.pleaseTryAgain || 'The document could not be loaded. Please try again.';
  const retry = t.retry || 'Retry';
  const loaded = t.loaded || 'Loaded';
  const pageText = t.page || 'Page';

  return (
      <AnimatePresence>
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
            onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
        >
          <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className={`bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden ${
                  isFullscreen ? 'fixed inset-4 w-auto h-auto' : 'w-full max-w-5xl'
              }`}
              style={{ height: isFullscreen ? 'calc(100vh - 2rem)' : '85vh' }}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 bg-gradient-to-r from-slate-50 to-gray-50 border-b border-slate-200 shrink-0">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  {isImage ? (
                      <div className="p-1.5 bg-blue-100 rounded-lg">
                        <ImageIcon className="w-4 h-4 text-blue-600" />
                      </div>
                  ) : (
                      <div className="p-1.5 bg-red-100 rounded-lg">
                        <FileText className="w-4 h-4 text-red-600" />
                      </div>
                  )}
                  <div>
                    <p className="text-sm font-semibold text-slate-800 truncate">{doc.fileName}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-xs text-slate-400">{doc.documentType}</span>
                      <span className="w-1 h-1 rounded-full bg-slate-300" />
                      <span className="text-xs text-slate-400">{doc.fileSizeStr}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Controls */}
              <div className="flex items-center gap-1 mx-4 shrink-0">
                <ControlButton
                    onClick={zoomOut}
                    disabled={scale <= MIN_ZOOM}
                    icon={<ZoomOut className="w-4 h-4" />}
                    title={zoomOutTitle}
                />
                <span className="text-xs font-medium text-slate-600 w-14 text-center select-none bg-slate-100 px-2 py-1 rounded-lg">
                  {Math.round(scale * 100)}%
                </span>
                <ControlButton
                    onClick={zoomIn}
                    disabled={scale >= MAX_ZOOM}
                    icon={<ZoomIn className="w-4 h-4" />}
                    title={zoomInTitle}
                />
                <div className="w-px h-5 bg-slate-200 mx-1" />
                <ControlButton
                    onClick={rotate}
                    icon={<RotateCw className="w-4 h-4" />}
                    title={rotateTitle}
                />
                <ControlButton
                    onClick={toggleFullscreen}
                    icon={isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
                    title={fullscreenTitle}
                />
                <ControlButton
                    onClick={handleDownload}
                    icon={<Download className="w-4 h-4" />}
                    title={downloadTitle}
                />
              </div>

              <button
                  onClick={onClose}
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors shrink-0"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Content area */}
            <div className="flex-1 overflow-auto bg-gradient-to-br from-slate-100 to-gray-100 flex items-start justify-center p-6 relative">
              {/* Loading overlay */}
              {status === 'loading' && !isImage && (
                  <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="absolute inset-0 flex items-center justify-center bg-slate-100/80 backdrop-blur-sm z-10"
                  >
                    <div className="flex flex-col items-center gap-3">
                      <div className="relative">
                        <div className="w-12 h-12 border-4 border-emerald-200 rounded-full"></div>
                        <div className="absolute top-0 left-0 w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
                      </div>
                      <p className="text-sm text-slate-500 font-medium">{loadingDocument}</p>
                    </div>
                  </motion.div>
              )}

              {/* Success state */}
              {status === 'ready' && (
                  <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="absolute top-4 right-4 bg-emerald-500 text-white text-xs px-2 py-1 rounded-lg shadow-lg z-10 flex items-center gap-1"
                  >
                    <CheckCircle className="w-3 h-3" />
                    <span>{loaded}</span>
                  </motion.div>
              )}

              {/* Error state */}
              {status === 'error' && (
                  <motion.div
                      initial={{ scale: 0.9, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      className="flex flex-col items-center justify-center h-full gap-4 text-center"
                  >
                    <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center">
                      <AlertCircle className="w-10 h-10 text-red-500" />
                    </div>
                    <div>
                      <h4 className="text-lg font-semibold text-slate-800 mb-1">{failedToLoad}</h4>
                      <p className="text-sm text-slate-500">{pleaseTryAgain}</p>
                    </div>
                    <button
                        onClick={() => window.location.reload()}
                        className="px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm font-medium hover:bg-emerald-700 transition-colors"
                    >
                      {retry}
                    </button>
                  </motion.div>
              )}

              {/* Image viewer */}
              {isImage && status !== 'error' && (
                  <motion.div
                      initial={{ scale: 0.95, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ duration: 0.3 }}
                      className="flex items-center justify-center min-h-full"
                  >
                    <img
                        src={doc.url}
                        alt={doc.fileName}
                        onLoad={() => setStatus('ready')}
                        onError={() => setStatus('error')}
                        style={{
                          transform: `scale(${scale}) rotate(${rotation}deg)`,
                          transformOrigin: 'center',
                        }}
                        className="max-w-full max-h-full object-contain transition-all duration-200 rounded-lg shadow-lg"
                    />
                  </motion.div>
              )}

              {/* PDF viewer */}
              {!isImage && status !== 'error' && (
                  <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.3 }}
                      className="flex items-start justify-center min-h-full"
                  >
                    <Document
                        file={doc.url}
                        onLoadSuccess={onDocLoad}
                        onLoadError={onDocError}
                        loading={null}
                        noData={null}
                        className="shadow-xl rounded-lg overflow-hidden"
                    >
                      <Page
                          pageNumber={page}
                          scale={scale}
                          rotate={rotation}
                          renderAnnotationLayer={true}
                          renderTextLayer={true}
                          loading={null}
                          className="bg-white"
                      />
                    </Document>
                  </motion.div>
              )}
            </div>

            {/* Page navigation — only for multi-page PDFs */}
            {!isImage && numPages > 1 && (
                <div className="flex items-center justify-center gap-4 px-6 py-3 bg-gradient-to-r from-slate-50 to-gray-50 border-t border-slate-200 shrink-0">
                  <NavButton
                      onClick={() => setPage(p => Math.max(1, p - 1))}
                      disabled={page === 1}
                      icon={<ChevronLeft className="w-4 h-4" />}
                  />
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-500">{pageText}</span>
                    <span className="text-sm font-semibold text-slate-700 bg-white px-3 py-1 rounded-lg shadow-sm">
                      {page}
                    </span>
                    <span className="text-xs text-slate-500">{t.of || 'of'} {numPages}</span>
                  </div>
                  <NavButton
                      onClick={() => setPage(p => Math.min(numPages, p + 1))}
                      disabled={page === numPages}
                      icon={<ChevronRight className="w-4 h-4" />}
                  />
                </div>
            )}

            {/* Keyboard shortcuts hint */}
            <div className="absolute bottom-4 right-4 text-xs text-slate-400 bg-white/80 backdrop-blur-sm px-2 py-1 rounded-lg shadow-sm">
              <span className="hidden sm:inline">← → </span>
              <kbd className="px-1 bg-slate-100 rounded text-xs">ESC</kbd> {t.toClose || 'to close'}
            </div>
          </motion.div>
        </motion.div>
      </AnimatePresence>
  );
}

// Helper Components
interface ControlButtonProps {
  onClick: () => void;
  disabled?: boolean;
  icon: React.ReactNode;
  title: string;
}

const ControlButton = ({ onClick, disabled, icon, title }: ControlButtonProps) => (
    <button
        onClick={onClick}
        disabled={disabled}
        className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-500 hover:bg-slate-100 hover:text-slate-700 disabled:opacity-30 disabled:cursor-not-allowed transition-all duration-200"
        title={title}
    >
      {icon}
    </button>
);

interface NavButtonProps {
  onClick: () => void;
  disabled: boolean;
  icon: React.ReactNode;
}

const NavButton = ({ onClick, disabled, icon }: NavButtonProps) => (
    <button
        onClick={onClick}
        disabled={disabled}
        className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-500 hover:bg-slate-100 hover:text-slate-700 disabled:opacity-30 disabled:cursor-not-allowed transition-all duration-200"
    >
      {icon}
    </button>
);