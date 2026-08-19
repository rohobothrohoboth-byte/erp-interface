// src/pages/file/FoldersPersonalPage.tsx

import { FolderSection } from '@/modules/file/components/folders/FolderSection';
import { FolderProvider } from '@/shared/contexts/FolderContext';

export default function FoldersPersonalPage() {
  return (
      <FolderProvider>
        <div className="container mx-auto p-6">
          <FolderSection
              title="Personal Folders"
              subtitle="Your private folders"
              filterBy="personal"
          />
        </div>
      </FolderProvider>
  );
}