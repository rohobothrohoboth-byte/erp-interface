// src/pages/file/FoldersSharedPage.tsx

import { FolderSection } from '@/modules/file/components/folders/FolderSection';
import { FolderProvider } from '@/shared/contexts/FolderContext';

export default function FoldersSharedPage() {
  return (
      <FolderProvider>
        <div className="container mx-auto p-6">
          <FolderSection
              title="Shared Folders"
              subtitle="Folders shared with you by others"
              filterBy="shared"
              showNew={false}
          />
        </div>
      </FolderProvider>
  );
}