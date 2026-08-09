// src/contexts/FolderContext.tsx
import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import {
    getFolders,
    getRootFolders,
    getFolderById,
    getFolderTree,
    createFolder as apiCreateFolder,
    updateFolder as apiUpdateFolder,
    deleteFolder as apiDeleteFolder,
    moveFolder as apiMoveFolder,
    getFolderContents,
    getSharedFolders,
    folderKeys,
    type Folder,
    type CreateFolderDto,
    type UpdateFolderDto,
} from '../services/fileManagement/folder.api';
import { showToast } from '../layout/layout';

// ============================================================
// TYPES
// ============================================================

interface FolderContextType {
    // State
    folders: Folder[];
    rootFolders: Folder[];
    loading: boolean;
    error: string | null;
    searchTerm: string;

    // Actions
    setSearchTerm: (term: string) => void;
    refreshAll: () => Promise<void>;
    refreshRoots: () => Promise<void>;
    getFolder: (id: string) => Promise<Folder>;
    getFolderContents: (id: string) => Promise<{ folders: Folder[]; documents: any[] }>;
    getFolderTree: (folderType?: string) => Promise<Folder[]>;
    getSharedFolders: () => Promise<Folder[]>;
    createFolder: (data: CreateFolderDto) => Promise<Folder>;
    updateFolder: (id: string, data: UpdateFolderDto) => Promise<Folder>;
    deleteFolder: (id: string) => Promise<void>;
    moveFolder: (id: string, targetParentId: string | null) => Promise<Folder>;
}

// ============================================================
// CONTEXT
// ============================================================

const FolderContext = createContext<FolderContextType | undefined>(undefined);

export const useFolders = () => {
    const context = useContext(FolderContext);
    if (!context) {
        throw new Error('useFolders must be used within a FolderProvider');
    }
    return context;
};

// ============================================================
// PROVIDER
// ============================================================

interface FolderProviderProps {
    children: React.ReactNode;
}

export const FolderProvider: React.FC<FolderProviderProps> = ({ children }) => {
    const queryClient = useQueryClient();
    const [folders, setFolders] = useState<Folder[]>([]);
    const [rootFolders, setRootFolders] = useState<Folder[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState<string>('');

    // ============================================================
    // LOAD DATA
    // ============================================================

    const loadAllFolders = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);

            // ✅ Use the correct API from folder.api.ts
            const response = await getFolders({ search: searchTerm || undefined });
            const data = response?.data?.data || response?.data || { items: [] };
            setFolders(data.items || data || []);
        } catch (err: any) {
            console.error('Error fetching folders:', err);
            setError(err.message || 'Failed to load folders');
            if (err.response?.status !== 404) {
                showToast.error('Failed to load folders');
            }
        } finally {
            setLoading(false);
        }
    }, [searchTerm]);

    const loadRootFolders = useCallback(async () => {
        try {
            // ✅ Use the correct API from folder.api.ts
            const response = await getRootFolders();
            const data = response?.data?.data || response?.data || [];
            setRootFolders(data);
        } catch (err: any) {
            console.error('Error fetching root folders:', err);
            if (err.response?.status !== 404) {
                // Only show error if it's not a 404 (root folders might not exist yet)
                showToast.error('Failed to load root folders');
            }
        }
    }, []);

    // ✅ Initial load
    useEffect(() => {
        loadAllFolders();
        loadRootFolders();
    }, [loadAllFolders, loadRootFolders]);

    // ✅ Refresh all
    const refreshAll = useCallback(async () => {
        await Promise.all([
            loadAllFolders(),
            loadRootFolders(),
            queryClient.invalidateQueries({ queryKey: folderKeys.all }),
        ]);
    }, [loadAllFolders, loadRootFolders, queryClient]);

    // ✅ Refresh roots only
    const refreshRoots = useCallback(async () => {
        await loadRootFolders();
        await queryClient.invalidateQueries({ queryKey: folderKeys.root() });
    }, [loadRootFolders, queryClient]);

    // ============================================================
    // FOLDER OPERATIONS
    // ============================================================

    // ✅ Get folder by ID
    const getFolder = useCallback(async (id: string): Promise<Folder> => {
        try {
            const response = await getFolderById(id);
            return response?.data?.data || response?.data;
        } catch (err: any) {
            console.error(`Failed to get folder ${id}:`, err);
            showToast.error(err.message || 'Failed to get folder');
            throw err;
        }
    }, []);

    // ✅ Get folder contents
    const getFolderContents = useCallback(async (id: string) => {
        try {
            const response = await getFolderContents(id);
            return response?.data?.data || response?.data || { folders: [], documents: [] };
        } catch (err: any) {
            console.error(`Failed to get folder contents ${id}:`, err);
            showToast.error(err.message || 'Failed to get folder contents');
            throw err;
        }
    }, []);

    // ✅ Get folder tree
    const getFolderTree = useCallback(async (folderType?: string) => {
        try {
            const response = await getFolderTree(folderType);
            return response?.data?.data || response?.data || [];
        } catch (err: any) {
            console.error('Failed to get folder tree:', err);
            showToast.error(err.message || 'Failed to get folder tree');
            throw err;
        }
    }, []);

    // ✅ Get shared folders
    const getSharedFolders = useCallback(async () => {
        try {
            const response = await getSharedFolders();
            return response?.data?.data || response?.data || [];
        } catch (err: any) {
            console.error('Failed to get shared folders:', err);
            showToast.error(err.message || 'Failed to get shared folders');
            throw err;
        }
    }, []);

    // ✅ Create folder
    const createFolder = useCallback(async (data: CreateFolderDto): Promise<Folder> => {
        try {
            const response = await apiCreateFolder(data);
            const newFolder = response?.data?.data || response?.data;
            await refreshAll();
            showToast.success(`Folder "${data.name}" created successfully`);
            return newFolder;
        } catch (err: any) {
            console.error('Failed to create folder:', err);
            const message = err.response?.data?.message || err.message || 'Failed to create folder';
            showToast.error(message);
            throw err;
        }
    }, [refreshAll]);

    // ✅ Update folder
    const updateFolder = useCallback(async (id: string, data: UpdateFolderDto): Promise<Folder> => {
        try {
            const response = await apiUpdateFolder(id, data);
            const updated = response?.data?.data || response?.data;
            await refreshAll();
            showToast.success('Folder updated successfully');
            return updated;
        } catch (err: any) {
            console.error(`Failed to update folder ${id}:`, err);
            const message = err.response?.data?.message || err.message || 'Failed to update folder';
            showToast.error(message);
            throw err;
        }
    }, [refreshAll]);

    // ✅ Delete folder
    const deleteFolder = useCallback(async (id: string): Promise<void> => {
        try {
            await apiDeleteFolder(id);
            await refreshAll();
            showToast.success('Folder deleted successfully');
        } catch (err: any) {
            console.error(`Failed to delete folder ${id}:`, err);
            const message = err.response?.data?.message || err.message || 'Failed to delete folder';
            showToast.error(message);
            throw err;
        }
    }, [refreshAll]);

    // ✅ Move folder
    const moveFolder = useCallback(async (id: string, targetParentId: string | null): Promise<Folder> => {
        try {
            const response = await apiMoveFolder(id, targetParentId);
            const moved = response?.data?.data || response?.data;
            await refreshAll();
            showToast.success('Folder moved successfully');
            return moved;
        } catch (err: any) {
            console.error(`Failed to move folder ${id}:`, err);
            const message = err.response?.data?.message || err.message || 'Failed to move folder';
            showToast.error(message);
            throw err;
        }
    }, [refreshAll]);

    // ============================================================
    // CONTEXT VALUE
    // ============================================================

    const value = useMemo(() => ({
        folders,
        rootFolders,
        loading,
        error,
        searchTerm,
        setSearchTerm,
        refreshAll,
        refreshRoots,
        getFolder,
        getFolderContents,
        getFolderTree,
        getSharedFolders,
        createFolder,
        updateFolder,
        deleteFolder,
        moveFolder,
    }), [
        folders,
        rootFolders,
        loading,
        error,
        searchTerm,
        refreshAll,
        refreshRoots,
        getFolder,
        getFolderContents,
        getFolderTree,
        getSharedFolders,
        createFolder,
        updateFolder,
        deleteFolder,
        moveFolder,
    ]);

    return (
        <FolderContext.Provider value={value}>
            {children}
        </FolderContext.Provider>
    );
};