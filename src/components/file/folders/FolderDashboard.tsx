import { useState } from 'react';
import { Search, FolderOpen } from 'lucide-react';
import { FolderCategorySection } from './FolderCategorySection';
import AddFolderModal from './AddFolderModal';
import type { FolderItem, FolderCategory } from '../../../types/file/folder.types';
import { MOCK_FOLDERS } from '../../../data/file/fileMockData';

const CATEGORY_ORDER: FolderCategory[] = ['company', 'department', 'shared', 'my', 'personal'];

export function FolderDashboard() {
  const [query, setQuery] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [addCategory, setAddCategory] = useState<FolderCategory>('my');
  const [folders, setFolders] = useState<FolderItem[]>(MOCK_FOLDERS);

  const filtered = folders.filter((f) =>
    f.name.toLowerCase().includes(query.toLowerCase())
  );

  const byCategory = (cat: FolderCategory) => filtered.filter((f) => f.category === cat);

  const handleAddFolder = (category: FolderCategory) => {
    setAddCategory(category);
    setShowAddModal(true);
  };

  const handleSaveFolder = async (data: { name: string; description?: string }) => {
    const newFolder: FolderItem = {
      id: `new-${Date.now()}`,
      name: data.name,
      fileCount: 0,
      updatedAt: new Date().toISOString().split('T')[0],
      category: addCategory,
      owner: 'Me',
      description: data.description,
    };
    setFolders((prev) => [...prev, newFolder]);
    setShowAddModal(false);
  };

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-green-100">
            <FolderOpen className="w-5 h-5 text-green-600" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">File Manager</h1>
            <p className="text-sm text-gray-500">Browse and manage all your folders</p>
          </div>
        </div>
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search folders..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-sm border border-gray-300 rounded-md bg-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
          />
        </div>
      </div>

      {/* Divider */}
      <div className="border-t border-green-100" />

      {/* Category sections */}
      <div className="space-y-8">
        {CATEGORY_ORDER.map((cat) => (
          <FolderCategorySection
            key={cat}
            category={cat}
            folders={byCategory(cat)}
            onAddFolder={() => handleAddFolder(cat)}
          />
        ))}
      </div>

      <AddFolderModal
        showAddModal={showAddModal}
        onClose={() => setShowAddModal(false)}
        onAddfolder={handleSaveFolder}
      />
    </div>
  );
}
