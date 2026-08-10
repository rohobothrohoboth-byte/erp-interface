// src/pages/file/DocumentsAllPage.tsx

import { DocumentSection } from '@/modules/file/components/documents/DocumentSection';
import { DocumentProvider } from '@/shared/contexts/DocumentContext';

export default function DocumentsAllPage() {
  return (
      <DocumentProvider>
        <DocumentSection
            title="All Documents"
            subtitle="All files you have access to"
            filterBy="all"
        />
      </DocumentProvider>
  );
}