// src/pages/file/DocumentsAllPage.tsx

import { DocumentSection } from '../../components/file/documents/DocumentSection';
import { DocumentProvider } from '../../contexts/DocumentContext';

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