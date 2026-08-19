// src/pages/file/FoldersAllPage.tsx

import { FolderSection } from '@/modules/file/components/folders/FolderSection';
import { FolderProvider } from '@/shared/contexts/FolderContext';

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