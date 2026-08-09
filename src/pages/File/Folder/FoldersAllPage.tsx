// src/pages/file/FoldersAllPage.tsx

import { FolderSection } from '../../components/file/folders/FolderSection';
import { FolderProvider } from '../../contexts/FolderContext';

export default function FoldersAllPage() {
  return (
      <FolderProvider>
        <div className="container mx-auto p-6">
          <FolderSection
              title="All Folders"
              subtitle="Browse all folders you have access to"
              filterBy="all"
          />
        </div>
      </FolderProvider>
  );
}