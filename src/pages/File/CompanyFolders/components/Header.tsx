// src/pages/file/CompanyFolders/components/Header.tsx

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Folder, ArrowLeft, FolderPlus } from 'lucide-react';
import { Button } from '../../../../components/ui/button';

interface HeaderProps {
    onNewFolder: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onNewFolder }) => {
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
                <div className="p-2 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg shadow-lg">
                    <Folder className="w-6 h-6 text-white" />
                </div>
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Company Folders</h1>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Organize documents by department and team</p>
                </div>
            </div>
            <Button
                onClick={onNewFolder}
                className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white shadow-lg shadow-indigo-500/20"
            >
                <FolderPlus className="w-4 h-4 mr-2" />
                New Folder
            </Button>
        </div>
    );
};