// src/components/file/uploads/UploadSection.tsx

import React from 'react';
import { Upload, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { UploadZone } from '@/modules/file/components/uploads/UploadZone';
import { Button } from '@/shared/components/ui/button';

export function UploadSection() {
    const navigate = useNavigate();

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => navigate('/file')}
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                        <ArrowLeft className="w-5 h-5 text-gray-500" />
                    </button>
                    <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600">
                        <Upload className="w-5 h-5" />
                    </div>
                    <div>
                        <h1 className="text-xl font-bold text-gray-900">Upload Manager</h1>
                        <p className="text-sm text-gray-500">Upload and manage your files</p>
                    </div>
                </div>
                <Button
                    variant="outline"
                    onClick={() => navigate('/documents')}
                    className="text-sm"
                >
                    View All Documents
                </Button>
            </div>

            {/* Upload Zone */}
            <UploadZone />

            {/* Tips */}
            <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4">
                <h4 className="text-sm font-semibold text-blue-700 mb-1">💡 Upload Tips</h4>
                <ul className="text-xs text-blue-600 space-y-1">
                    <li>• Supported formats: PDF, JPEG, PNG, GIF, DOC, DOCX, XLS, XLSX, PPT, PPTX</li>
                    <li>• Maximum file size: 50 MB per file</li>
                    <li>• Files are automatically scanned for viruses</li>
                    <li>• You can upload multiple files at once</li>
                </ul>
            </div>
        </div>
    );
}