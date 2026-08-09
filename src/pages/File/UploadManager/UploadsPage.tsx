// src/pages/file/UploadsPage.tsx

import React, { useState, useRef } from 'react';
import { Upload, File, X, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { Button } from '../../components/ui/button';
import { Card, CardContent } from '../../components/ui/card';
import { useDocuments } from '../../contexts/DocumentContext';
import { showToast } from '../../layout/layout';

interface UploadFile {
  id: string;
  name: string;
  size: number;
  progress: number;
  status: 'pending' | 'uploading' | 'success' | 'error';
  error?: string;
}

export default function UploadsPage() {
  const { uploadDocument } = useDocuments();
  const [files, setFiles] = useState<UploadFile[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleFileUpload = async (fileList: FileList) => {
    const newFiles: UploadFile[] = Array.from(fileList).map(file => ({
      id: `upload-${Date.now()}-${Math.random()}`,
      name: file.name,
      size: file.size,
      progress: 0,
      status: 'pending' as const,
    }));

    setFiles(prev => [...prev, ...newFiles]);

    for (const file of Array.from(fileList)) {
      const uploadFile = newFiles.find(f => f.name === file.name && f.size === file.size);
      if (!uploadFile) continue;

      try {
        setFiles(prev => prev.map(f =>
            f.id === uploadFile.id ? { ...f, status: 'uploading' } : f
        ));

        await uploadDocument({
          file,
          module: 'general',
          category: 'uploads',
          description: file.name,
        });

        setFiles(prev => prev.map(f =>
            f.id === uploadFile.id ? { ...f, progress: 100, status: 'success' } : f
        ));
      } catch (error) {
        setFiles(prev => prev.map(f =>
            f.id === uploadFile.id ? { ...f, status: 'error', error: 'Upload failed' } : f
        ));
      }
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFileUpload(files);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFileUpload(files);
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleRemoveFile = (id: string) => {
    setFiles(prev => prev.filter(f => f.id !== id));
  };

  const handleRetry = (id: string) => {
    const file = files.find(f => f.id === id);
    if (file && file.status === 'error') {
      setFiles(prev => prev.map(f =>
          f.id === id ? { ...f, status: 'pending', progress: 0, error: undefined } : f
      ));
      // Re-upload logic would go here
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="h-5 w-5 text-gray-400" />;
      case 'uploading':
        return <Loader2 className="h-5 w-5 text-blue-500 animate-spin" />;
      case 'success':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'error':
        return <AlertCircle className="h-5 w-5 text-red-500" />;
      default:
        return null;
    }
  };

  return (
      <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="container mx-auto p-6 space-y-6"
      >
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Uploads</h1>
          <p className="text-sm text-gray-500">Upload and manage your files</p>
        </div>

        {/* Drop Zone */}
        <div
            className={`relative border-2 border-dashed rounded-2xl p-12 text-center transition-colors ${
                isDragging
                    ? 'border-indigo-500 bg-indigo-50'
                    : 'border-gray-300 hover:border-indigo-400'
            }`}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
        >
          <input
              ref={fileInputRef}
              type="file"
              multiple
              className="hidden"
              onChange={handleFileInput}
          />
          <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-lg font-medium text-gray-700">
            Drop files here or click to upload
          </p>
          <p className="text-sm text-gray-500 mt-1">
            Supports PDF, Images, Word, Excel, PowerPoint (Max 10MB)
          </p>
          <Button
              className="mt-4 bg-indigo-600 hover:bg-indigo-700"
              onClick={() => fileInputRef.current?.click()}
          >
            Select Files
          </Button>
        </div>

        {/* Upload List */}
        {files.length > 0 && (
            <Card>
              <CardContent className="p-4">
                <h3 className="text-sm font-semibold text-gray-700 mb-3">
                  Uploading Files ({files.filter(f => f.status === 'success').length}/{files.length})
                </h3>
                <div className="space-y-3">
                  {files.map((file) => (
                      <div
                          key={file.id}
                          className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg border border-gray-100"
                      >
                        <File className="h-5 w-5 text-gray-400" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-700 truncate">
                            {file.name}
                          </p>
                          <div className="flex items-center gap-2">
                                            <span className="text-xs text-gray-500">
                                                {formatFileSize(file.size)}
                                            </span>
                            {file.status === 'uploading' && (
                                <span className="text-xs text-blue-500">
                                                    {file.progress}%
                                                </span>
                            )}
                            {file.status === 'success' && (
                                <span className="text-xs text-green-500">Complete</span>
                            )}
                            {file.status === 'error' && (
                                <span className="text-xs text-red-500">{file.error}</span>
                            )}
                          </div>
                          {file.status === 'uploading' && (
                              <div className="mt-1 w-full bg-gray-200 rounded-full h-1.5">
                                <div
                                    className="bg-indigo-600 h-1.5 rounded-full transition-all duration-300"
                                    style={{ width: `${file.progress}%` }}
                                />
                              </div>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          {file.status === 'error' && (
                              <button
                                  onClick={() => handleRetry(file.id)}
                                  className="p-1 hover:bg-gray-200 rounded-lg transition-colors"
                              >
                                <RefreshCw className="h-4 w-4 text-blue-500" />
                              </button>
                          )}
                          {file.status !== 'uploading' && (
                              <button
                                  onClick={() => handleRemoveFile(file.id)}
                                  className="p-1 hover:bg-gray-200 rounded-lg transition-colors"
                              >
                                <X className="h-4 w-4 text-gray-400" />
                              </button>
                          )}
                        </div>
                      </div>
                  ))}
                </div>
              </CardContent>
            </Card>
        )}
      </motion.div>
  );
}