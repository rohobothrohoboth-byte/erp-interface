// src/components/file/folders/FolderDashboard.tsx

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FolderOpen, Users, User, Globe, Archive, ChevronRight } from 'lucide-react';
import { Card, CardContent } from '@/shared/components/ui/card';
import { Badge } from '@/shared/components/ui/badge';
import { useDashboard } from '@/shared/contexts/DashboardContext';

interface FolderQuickAccessProps {
    title: string;
    icon: React.ReactNode;
    count: number;
    color: string;
    path: string;
}

const FolderQuickAccess: React.FC<FolderQuickAccessProps> = ({ title, icon, count, color, path }) => {
    const navigate = useNavigate();

    return (
        <div
            onClick={() => navigate(path)}
            className={`flex items-center justify-between p-3 rounded-xl border-2 ${color} cursor-pointer hover:shadow-md transition-all`}
        >
            <div className="flex items-center gap-3">
                <div className="p-2 bg-white/50 rounded-lg">
                    {icon}
                </div>
                <div>
                    <p className="text-sm font-medium text-gray-700">{title}</p>
                    <p className="text-xs text-gray-500">{count} folders</p>
                </div>
            </div>
            <ChevronRight className="w-4 h-4 text-gray-400" />
        </div>
    );
};

export function FolderDashboard() {
    const { folders, loading } = useDashboard();
    const navigate = useNavigate();

    // Group folders by type
    const companyFolders = folders.filter(f => f.type === 'company');
    const personalFolders = folders.filter(f => f.type === 'personal');
    const sharedFolders = folders.filter(f => f.type === 'shared');
    const archiveFolders = folders.filter(f => f.type === 'archive');

    const folderGroups = [
        {
            title: 'Company Folders',
            icon: <Globe className="w-4 h-4 text-blue-500" />,
            count: companyFolders.length,
            color: 'border-blue-200 bg-blue-50/50',
            path: '/folders?type=company',
            folders: companyFolders.slice(0, 3),
        },
        {
            title: 'Personal Folders',
            icon: <User className="w-4 h-4 text-green-500" />,
            count: personalFolders.length,
            color: 'border-green-200 bg-green-50/50',
            path: '/folders/personal',
            folders: personalFolders.slice(0, 3),
        },
        {
            title: 'Shared Folders',
            icon: <Users className="w-4 h-4 text-purple-500" />,
            count: sharedFolders.length,
            color: 'border-purple-200 bg-purple-50/50',
            path: '/folders/shared',
            folders: sharedFolders.slice(0, 3),
        },
        {
            title: 'Archive',
            icon: <Archive className="w-4 h-4 text-amber-500" />,
            count: archiveFolders.length,
            color: 'border-amber-200 bg-amber-50/50',
            path: '/folders?type=archive',
            folders: archiveFolders.slice(0, 3),
        },
    ];

    if (loading) {
        return (
            <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {[1, 2, 3, 4].map((i) => (
                        <div key={i} className="h-24 bg-gray-100 animate-pulse rounded-xl" />
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Quick Access Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {folderGroups.map((group) => (
                    <FolderQuickAccess
                        key={group.title}
                        title={group.title}
                        icon={group.icon}
                        count={group.count}
                        color={group.color}
                        path={group.path}
                    />
                ))}
            </div>

            {/* Featured Folders */}
            <Card>
                <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-3">
                        <h3 className="text-sm font-semibold text-gray-700">Recent Folders</h3>
                        <button
                            onClick={() => navigate('/folders')}
                            className="text-xs text-cyan-600 hover:text-cyan-700"
                        >
                            View all
                        </button>
                    </div>
                    <div className="space-y-2">
                        {folders.slice(0, 5).map((folder) => (
                            <div
                                key={folder.id}
                                onClick={() => navigate(`/folder/${folder.id}`)}
                                className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                            >
                                <div className="flex items-center gap-3">
                                    <FolderOpen className="w-4 h-4 text-cyan-500" />
                                    <span className="text-sm font-medium text-gray-700">{folder.name}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Badge variant="outline" className="text-xs">
                                        {folder.fileCount || 0} files
                                    </Badge>
                                    <ChevronRight className="w-4 h-4 text-gray-400" />
                                </div>
                            </div>
                        ))}
                        {folders.length === 0 && (
                            <p className="text-sm text-gray-400 text-center py-4">No folders yet</p>
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}