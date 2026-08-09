// src/pages/file/DocumentsRecentPage.tsx

import { DocumentSection } from '../../components/file/documents/DocumentSection';
import { DocumentProvider } from '../../contexts/DocumentContext';

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