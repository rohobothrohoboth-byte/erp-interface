// src/pages/file/CompanyDocuments/components/Header.tsx

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Building2, ArrowLeft, Upload, FolderPlus } from 'lucide-react';
import { Button } from '../../../../components/ui/button';

interface HeaderProps {
    onUpload: () => void;
    onNewFolder: () => void; // ✅ Add this prop
}

export const Header: React.FC<HeaderProps> = ({ onUpload, onNewFolder }) => {
    const navigate = useNavigate();

    return (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
                <button
                    onClick={() => navigate('/file')}
                    className="p-2 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                >
                    <ArrowLeft className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                </button>
                <div className="p-2 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg shadow-lg">
                    <Building2 className="w-6 h-6 text-white" />
                </div>
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Company Documents</h1>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Organization-wide documents and policies</p>
                </div>
            </div>
            <div className="flex items-center gap-2">
                <Button
                    onClick={onNewFolder}
                    variant="outline"
                    className="border-indigo-300 text-indigo-600 hover:bg-indigo-50 dark:border-indigo-700 dark:text-indigo-400 dark:hover:bg-indigo-950/30"
                >
                    <FolderPlus className="w-4 h-4 mr-2" />
                    New Folder
                </Button>
                <Button
                    onClick={onUpload}
                    className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg shadow-blue-500/20"
                >
                    <Upload className="w-4 h-4 mr-2" />
                    Upload Document
                </Button>
            </div>
        </div>
    );
};