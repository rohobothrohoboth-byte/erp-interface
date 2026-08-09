// src/components/file/uploads/UploadZone.tsx

import React, { useState, useRef } from 'react';
import { Upload, X, FileText, FileImage, File, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { useDocuments } from '../../../contexts/DocumentContext';
import { showToast } from '../../../layout/layout';

interface UploadFile {
  id: string;
  file: File;
  progress: number;
  status: 'pending' | 'uploading' | 'done' | 'error';
  error?: string;
}

function FileIcon({ type }: { type: string }) {
  if (type.startsWith('image/')) return <FileImage className="w-5 h-5 text-blue-400" />;
  if (type === 'application/pdf') return <FileText className="w-5 h-5 text-red-400" />;
  if (type.includes('spreadsheet') || type.includes('excel')) return <File className="w-5 h-5 text-green-400" />;
  if (type.includes('presentation') || type.includes('powerpoint')) return <File className="w-5 h-5 text-orange-400" />;
  if (type.includes('word') || type.includes('document')) return <FileText className="w-5 h-5 text-blue-400" />;
  return <File className="w-5 h-5 text-gray-400" />;
}

export function UploadZone() {
  const { uploadDocument } = useDocuments();
  const [files, setFiles] = useState<UploadFile[]>([]);
  const [dragging, setDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const addFiles = (incoming: FileList | null) => {
    if (!incoming) return;
    const newFiles: UploadFile[] = Array.from(incoming).map((f) => ({
      id: `${f.name}-${Date.now()}-${Math.random()}`,
      file: f,
      progress: 0,
      status: 'pending',
    }));
    setFiles((prev) => [...prev, ...newFiles]);
  };

  const removeFile = (id: string) => {
    setFiles((prev) => prev.filter((f) => f.id !== id));
  };

  const uploadFiles = async () => {
    const pendingFiles = files.filter(f => f.status === 'pending' || f.status === 'error');
    if (pendingFiles.length === 0) {
      showToast.info('No files to upload');
      return;
    }

    setIsUploading(true);

    for (const uploadFile of pendingFiles) {
      try {
        // Update status to uploading
        setFiles(prev => prev.map(f =>
            f.id === uploadFile.id ? { ...f, status: 'uploading', progress: 0 } : f
        ));

        // Simulate progress
        const progressInterval = setInterval(() => {
          setFiles(prev => prev.map(f => {
            if (f.id === uploadFile.id && f.progress < 90) {
              return { ...f, progress: f.progress + 10 };
            }
            return f;
          }));
        }, 300);

        // Upload the file
        await uploadDocument({
          file: uploadFile.file,
          module: 'general',
          category: 'uploads',
          description: uploadFile.file.name,
        });

        clearInterval(progressInterval);

        // Mark as done
        setFiles(prev => prev.map(f =>
            f.id === uploadFile.id ? { ...f, progress: 100, status: 'done' } : f
        ));
      } catch (error: any) {
        // Mark as error
        setFiles(prev => prev.map(f =>
            f.id === uploadFile.id ? {
              ...f,
              status: 'error',
              error: error.message || 'Upload failed'
            } : f
        ));
      }
    }

    setIsUploading(false);

    // Clear done files after a delay
    setTimeout(() => {
      setFiles(prev => prev.filter(f => f.status !== 'done'));
    }, 3000);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    addFiles(e.dataTransfer.files);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      addFiles(files);
    }
    if (inputRef.current) {
      inputRef.current.value = '';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <div className="w-4 h-4 rounded-full border-2 border-gray-300" />;
      case 'uploading':
        return <Loader2 className="w-4 h-4 text-blue-500 animate-spin" />;
      case 'done':
        return <CheckCircle2 className="w-4 h-4 text-green-500" />;
      case 'error':
        return <AlertCircle className="w-4 h-4 text-red-500" />;
      default:
        return null;
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  const pendingCount = files.filter(f => f.status === 'pending' || f.status === 'error').length;

  return (
      <div className="space-y-4">
        {/* Drop zone */}
        <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => inputRef.current?.click()}
            className={`flex flex-col items-center justify-center gap-3 p-12 rounded-2xl border-2 border-dashed cursor-pointer transition-colors ${
                dragging
                    ? 'border-emerald-400 bg-emerald-50'
                    : 'border-gray-200 hover:border-emerald-300 hover:bg-gray-50'
            }`}
        >
          <div className="w-14 h-14 rounded-2xl bg-emerald-50 flex items-center justify-center text-emerald-500">
            <Upload className="w-7 h-7" />
          </div>
          <div className="text-center">
            <p className="text-sm font-semibold text-gray-700">Drop files here or click to browse</p>
            <p className="text-xs text-gray-400 mt-1">PDF, images, documents up to 50 MB</p>
          </div>
          <input
              ref={inputRef}
              type="file"
              multiple
              className="hidden"
              onChange={handleFileInput}
              disabled={isUploading}
          />
        </div>

        {/* File list */}
        {files.length > 0 && (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm divide-y divide-gray-50">
              {files.map((f) => (
                  <div key={f.id} className="flex items-center gap-4 px-5 py-3">
                    <FileIcon type={f.file.type} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-medium text-gray-800 truncate">{f.file.name}</p>
                        {getStatusIcon(f.status)}
                      </div>
                      <p className="text-xs text-gray-400">{formatFileSize(f.file.size)}</p>
                      {f.status === 'uploading' && (
                          <div className="mt-1.5 h-1 bg-gray-100 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-emerald-500 rounded-full transition-all duration-300"
                                style={{ width: `${f.progress}%` }}
                            />
                          </div>
                      )}
                      {f.status === 'error' && (
                          <p className="text-xs text-red-500 mt-0.5">{f.error || 'Upload failed'}</p>
                      )}
                    </div>
                    {f.status !== 'uploading' && (
                        <button
                            onClick={() => removeFile(f.id)}
                            className="p-1 rounded-lg hover:bg-gray-100 shrink-0 transition-colors"
                            disabled={isUploading}
                        >
                          <X className="w-4 h-4 text-gray-400" />
                        </button>
                    )}
                  </div>
              ))}

              <div className="px-5 py-3 flex justify-between items-center">
                        <span className="text-xs text-gray-400">
                            {pendingCount} file{pendingCount !== 1 ? 's' : ''} ready to upload
                        </span>
                {pendingCount > 0 && (
                    <button
                        onClick={uploadFiles}
                        disabled={isUploading}
                        className="px-5 py-2 text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                      {isUploading ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            Uploading...
                          </>
                      ) : (
                          <>
                            <Upload className="w-4 h-4" />
                            Upload {pendingCount} file{pendingCount !== 1 ? 's' : ''}
                          </>
                      )}
                    </button>
                )}
              </div>
            </div>
        )}
      </div>
  );
}