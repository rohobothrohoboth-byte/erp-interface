import { useParams, useNavigate } from 'react-router-dom';
import { FolderDocumentsView } from '../../components/file/documents/FolderDocumentsView';
import { MOCK_FOLDERS } from '../../data/file/fileMockData';
import { useEffect } from 'react';

export default function FolderDocumentsPage() {
  const { folderId } = useParams<{ folderId: string }>();
  const navigate = useNavigate();

  const folder = MOCK_FOLDERS.find((f) => f.id === folderId) ?? null;

  useEffect(() => {
    if (!folder) navigate('/file', { replace: true });
  }, [folder, navigate]);

  if (!folder) return null;

  return <FolderDocumentsView folder={folder} />;
}
