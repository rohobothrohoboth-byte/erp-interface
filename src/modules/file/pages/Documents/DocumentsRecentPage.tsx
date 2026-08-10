// src/pages/file/DocumentsRecentPage.tsx

import { DocumentSection } from '@/modules/file/components/documents/DocumentSection';
import { DocumentProvider } from '@/shared/contexts/DocumentContext';

export default function DocumentsRecentPage() {
  return (
      <DocumentProvider>
        <DocumentSection
            title="Recent Documents"
            subtitle="Files you've accessed recently"
            filterBy="recent"
            showUpload={false}
        />
      </DocumentProvider>
  );
}