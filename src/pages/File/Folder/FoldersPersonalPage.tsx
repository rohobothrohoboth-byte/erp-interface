// src/pages/file/FoldersPersonalPage.tsx

import { FolderSection } from '../../components/file/folders/FolderSection';
import { FolderProvider } from '../../contexts/FolderContext';

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