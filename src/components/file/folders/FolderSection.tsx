import { useState } from 'react';
import { FolderHeader } from './FolderHeader';
import { FolderGrid, type FolderItem } from './FolderGrid';
import AddFolderModal from './AddFolderModal';

interface FolderSectionProps {
  title: string;
  subtitle: string;
  folders: FolderItem[];
  showNew?: boolean;
}

export function FolderSection({ title, subtitle, folders }: FolderSectionProps) {
  const [query, setQuery] = useState('');
  const [showAddModal,setShowAddModal] = useState(false);

  const filtered = folders.filter((f) =>
    f.name.toLowerCase().includes(query.toLowerCase())
  );

  const openAddModal = () => {
    setShowAddModal(true);
  };

  const closeAddModal = () => {
    setShowAddModal(false);
  };
 const handleAddFolder = async (folder: any) => {
    console.log(folder);

    // API call here

    closeAddModal();

    return {
      message: 'Folder added successfully',
    };
  };
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
      <FolderHeader
        title={title}
        subtitle={subtitle}
        onNew={openAddModal}
        onSearch={setQuery}
      />
      <FolderGrid folders={filtered} />
      <AddFolderModal
      onAddfolder={handleAddFolder}
      showAddModal= {showAddModal}
      onClose={closeAddModal}
      />
    </div>
  );
}
