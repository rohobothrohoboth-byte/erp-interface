import { memo, useState, lazy, Suspense, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FileText,
  FileBadge,
  FileImage,
  Eye,
  Loader2,
  FolderOpen,
  Download,
  Calendar,
  User,
  CheckCircle,
  AlertCircle,
  File,
  FileArchive,
  FileCode,
  FileSpreadsheet,
  FileJson
} from 'lucide-react';
import { useEmpCertAll, useEmpDetailPhotoFull, useEmpDetailStamp, useEmpDetailSign } from '@/modules/hr/services/employee/empDetail/empDetail.queries';
import { fetchCertBlobUrl } from '@/modules/hr/services/employee/empDetail/empDetail.api';
import type { EmpDetailImage } from '@/modules/hr/services/employee/empDetail/empDetail.api';
import type { EmpFileList, EmpDetailDocument } from '@/modules/hr/types/employee/empDetail';
import { useLanguage } from '@/shared/i18n/LanguageContext';

const DocViewerModal = lazy(() =>
    import('@/modules/hr/components/employee/EmployeeDetail/DocViewerModal').then(m => ({ default: m.DocViewerModal }))
);

// Document Icon Component with enhanced styling
function DocIcon({ contentType, className }: { contentType: string; className?: string }) {
  const getIconConfig = () => {
    if (contentType === 'application/pdf') {
      return { icon: FileText, color: 'text-red-500', bg: 'bg-red-50' };
    }
    if (contentType.startsWith('image/')) {
      return { icon: FileImage, color: 'text-blue-500', bg: 'bg-blue-50' };
    }
    if (contentType.includes('word') || contentType.includes('document')) {
      return { icon: FileText, color: 'text-indigo-500', bg: 'bg-indigo-50' };
    }
    if (contentType.includes('excel') || contentType.includes('sheet')) {
      return { icon: FileSpreadsheet, color: 'text-emerald-500', bg: 'bg-emerald-50' };
    }
    if (contentType.includes('zip') || contentType.includes('archive')) {
      return { icon: FileArchive, color: 'text-amber-500', bg: 'bg-amber-50' };
    }
    if (contentType.includes('json') || contentType.includes('xml')) {
      return { icon: FileCode, color: 'text-purple-500', bg: 'bg-purple-50' };
    }
    return { icon: FileBadge, color: 'text-gray-500', bg: 'bg-gray-50' };
  };

  const config = getIconConfig();
  const IconComponent = config.icon;

  return (
      <div className={`p-2 rounded-xl ${config.bg} ${className}`}>
        <IconComponent className={`w-5 h-5 ${config.color}`} />
      </div>
  );
}

// Certificate Type Badge Component
function CertTypeBadge({ certType }: { certType: string }) {
  const { t } = useLanguage();
  const certTypeLower = certType.toLowerCase();

  const getTypeConfig = () => {
    if (certTypeLower.includes('birth')) {
      return {
        bg: 'bg-blue-50',
        text: 'text-blue-700',
        border: 'border-blue-200',
        icon: <User className="w-3 h-3" />,
        label: t.birthCertificate || 'Birth Certificate'
      };
    }
    if (certTypeLower.includes('marriage')) {
      return {
        bg: 'bg-pink-50',
        text: 'text-pink-700',
        border: 'border-pink-200',
        icon: <CheckCircle className="w-3 h-3" />,
        label: t.marriageCertificate || 'Marriage Certificate'
      };
    }
    if (certTypeLower.includes('contract')) {
      return {
        bg: 'bg-emerald-50',
        text: 'text-emerald-700',
        border: 'border-emerald-200',
        icon: <FileText className="w-3 h-3" />,
        label: t.contract || 'Contract'
      };
    }
    if (certTypeLower.includes('certificate')) {
      return {
        bg: 'bg-purple-50',
        text: 'text-purple-700',
        border: 'border-purple-200',
        icon: <AwardIcon className="w-3 h-3" />,
        label: t.certificate || 'Certificate'
      };
    }
    return {
      bg: 'bg-gray-50',
      text: 'text-gray-600',
      border: 'border-gray-200',
      icon: <File className="w-3 h-3" />,
      label: t.document || 'Document'
    };
  };

  const config = getTypeConfig();

  return (
      <span className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium border ${config.bg} ${config.text} ${config.border}`}>
        {config.icon}
        {config.label}
      </span>
  );
}

// Document Card Component
const DocumentCard = ({
                        cert,
                        onView,
                        isLoading
                      }: {
  cert: EmpFileList;
  onView: () => void;
  isLoading: boolean;
}) => {
  const { t } = useLanguage();

  return (
      <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          whileHover={{ y: -2 }}
          className="group relative bg-white rounded-xl border border-slate-200 hover:border-emerald-200 hover:shadow-md transition-all duration-300 overflow-hidden"
      >
        <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/0 to-teal-500/0 group-hover:from-emerald-500/5 group-hover:to-teal-500/5 transition-all duration-300" />

        <div className="relative p-4">
          <div className="flex items-start gap-3">
            {/* Document Icon */}
            <DocIcon contentType={cert.contentType} className="shrink-0 group-hover:scale-110 transition-transform" />

            {/* Document Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2">
                <div className="space-y-1">
                  <CertTypeBadge certType={cert.certType} />
                  <p className="text-xs text-slate-400 font-mono mt-1">
                    {cert.fileName.length > 30 ? cert.fileName.substring(0, 30) + '...' : cert.fileName}
                  </p>
                </div>

                {/* Action Button */}
                <button
                    onClick={onView}
                    disabled={isLoading}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-emerald-600 bg-emerald-50 rounded-lg hover:bg-emerald-100 hover:text-emerald-700 transition-all disabled:opacity-50 shrink-0"
                >
                  {isLoading ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        {t.loading || 'Loading...'}
                      </>
                  ) : (
                      <>
                        <Eye className="w-3.5 h-3.5" />
                        {t.view || 'View'}
                      </>
                  )}
                </button>
              </div>

              {/* File Metadata */}
              <div className="flex items-center gap-3 mt-2 pt-2 border-t border-slate-100">
                <div className="flex items-center gap-1">
                  <File className="w-3 h-3 text-slate-400" />
                  <span className="text-xs text-slate-400">{cert.contentType.split('/').pop()?.toUpperCase()}</span>
                </div>
                <div className="w-px h-3 bg-slate-200" />
                <div className="flex items-center gap-1">
                  <FileText className="w-3 h-3 text-slate-400" />
                  <span className="text-xs text-slate-400">{cert.size}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
  );
};

// Loading Skeleton Component
const DetailSkeleton = ({ rows = 3 }: { rows?: number }) => {
  return (
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
        <div className="bg-slate-50 px-5 py-4 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-slate-200 rounded-xl animate-pulse" />
            <div className="h-5 w-32 bg-slate-200 rounded-lg animate-pulse" />
          </div>
        </div>
        <div className="p-4 space-y-3">
          {Array.from({ length: rows }).map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="flex items-start gap-3 p-4 bg-slate-50 rounded-xl">
                  <div className="w-10 h-10 bg-slate-200 rounded-xl" />
                  <div className="flex-1">
                    <div className="h-4 bg-slate-200 rounded w-1/3 mb-2" />
                    <div className="h-3 bg-slate-200 rounded w-1/2" />
                  </div>
                  <div className="w-16 h-8 bg-slate-200 rounded-lg" />
                </div>
              </div>
          ))}
        </div>
      </div>
  );
};

// Helper Icon Components
const AwardIcon = () => (
    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
);

// ============ Main Component ============

// Render an employee image asset (photo / stamp / signature) as a preview card.
function ImageAssetCard({ label, img, onView }: { label: string; img: EmpDetailImage; onView: () => void }) {
  const src = `data:${img.contentType || 'image/png'};base64,${img.image}`;
  return (
      <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="group relative bg-white rounded-xl border border-slate-200 hover:border-emerald-200 hover:shadow-md transition-all overflow-hidden"
      >
        <div className="flex items-center gap-3 p-4">
          <div className="h-16 w-16 shrink-0 rounded-lg border border-slate-100 bg-slate-50 overflow-hidden flex items-center justify-center">
            <img src={src} alt={label} className="h-full w-full object-contain" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-slate-800">{label}</p>
            <p className="text-xs text-slate-400 truncate">{img.fileName || '—'}</p>
            <p className="text-xs text-slate-400 mt-0.5">{img.contentType?.split('/').pop()?.toUpperCase()} · {img.size}</p>
          </div>
          <button
              onClick={onView}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-emerald-600 bg-emerald-50 rounded-lg hover:bg-emerald-100 shrink-0"
          >
            <Eye className="w-3.5 h-3.5" /> View
          </button>
        </div>
      </motion.div>
  );
}

export const DocumentsTab = memo(function DocumentsTab({ employeeId }: { employeeId: string }) {
  const { t } = useLanguage();
  const { data: certs, isLoading } = useEmpCertAll(employeeId);
  const { data: photo } = useEmpDetailPhotoFull(employeeId);
  const { data: stamp } = useEmpDetailStamp(employeeId);
  const { data: sign } = useEmpDetailSign(employeeId);
  const [viewing, setViewing] = useState<EmpDetailDocument | null>(null);
  const [loadingId, setLoadingId] = useState<string | null>(null);

  const imageAssets = [
    photo?.image ? { key: 'photo', label: 'Photo', img: photo as EmpDetailImage } : null,
    stamp?.image ? { key: 'stamp', label: 'Personal Stamp', img: stamp as EmpDetailImage } : null,
    sign?.image ? { key: 'sign', label: 'Signature', img: sign as EmpDetailImage } : null,
  ].filter(Boolean) as { key: string; label: string; img: EmpDetailImage }[];

  const viewImageAsset = useCallback((label: string, img: EmpDetailImage) => {
    setViewing({
      id: img.id,
      fileName: img.fileName || label,
      contentType: img.contentType || 'image/png',
      fileSizeStr: img.size,
      documentType: label,
      uploadedAt: '',
      url: `data:${img.contentType || 'image/png'};base64,${img.image}`,
    });
  }, []);

  const handleView = useCallback(async (cert: EmpFileList) => {
    setLoadingId(cert.id);
    try {
      const blobUrl = await fetchCertBlobUrl(cert.id);
      setViewing({
        id:           cert.id,
        fileName:     cert.fileName,
        contentType:  cert.contentType,
        fileSizeStr:  cert.size,
        documentType: cert.certType,
        uploadedAt:   '',
        url:          blobUrl,
      });
    } finally {
      setLoadingId(null);
    }
  }, []);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05,
        delayChildren: 0.1
      }
    }
  };

  if (isLoading) return <DetailSkeleton rows={3} />;

  const list: EmpFileList[] = certs ?? [];

  return (
      <>
        {/* Document Viewer Modal */}
        <AnimatePresence>
          {viewing && (
              <Suspense fallback={
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
                  <div className="relative">
                    <div className="w-16 h-16 border-4 border-white/20 border-t-white rounded-full animate-spin" />
                  </div>
                </div>
              }>
                <DocViewerModal doc={viewing} onClose={() => {
                  if (viewing.url) URL.revokeObjectURL(viewing.url);
                  setViewing(null);
                }} />
              </Suspense>
          )}
        </AnimatePresence>

        {/* Documents Container */}
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl shadow-lg border border-slate-200 overflow-hidden"
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-emerald-50 to-teal-50 px-6 py-4 border-b border-slate-100">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-xl shadow-md">
                  <FolderOpen className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h3 className="text-base font-semibold text-slate-800">{t.documents || 'Documents'}</h3>
                  <p className="text-xs text-slate-500 mt-0.5">{t.employeeCertificatesFiles || 'Employee certificates and files'}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="px-2.5 py-1 bg-white/80 backdrop-blur-sm rounded-full">
                <span className="text-xs font-medium text-slate-600">
                  {list.length + imageAssets.length} {list.length + imageAssets.length === 1 ? (t.file || 'file') : (t.files || 'files')}
                </span>
                </div>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="p-6 space-y-6">
            {imageAssets.length > 0 && (
                <div>
                  <h4 className="text-sm font-semibold text-slate-700 mb-3">Identity &amp; Signatures</h4>
                  <motion.div variants={containerVariants} initial="hidden" animate="visible" className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {imageAssets.map((a) => (
                        <ImageAssetCard key={a.key} label={a.label} img={a.img} onView={() => viewImageAsset(a.label, a.img)} />
                    ))}
                  </motion.div>
                </div>
            )}

            {list.length > 0 && (
                <div>
                  <h4 className="text-sm font-semibold text-slate-700 mb-3">Certificates &amp; Files</h4>
                  <motion.div
                      variants={containerVariants}
                      initial="hidden"
                      animate="visible"
                      className="grid grid-cols-1 md:grid-cols-2 gap-4"
                  >
                    {list.map((cert) => (
                        <DocumentCard
                            key={cert.id}
                            cert={cert}
                            onView={() => handleView(cert)}
                            isLoading={loadingId === cert.id}
                        />
                    ))}
                  </motion.div>
                </div>
            )}

            {list.length === 0 && imageAssets.length === 0 && (
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex flex-col items-center justify-center py-16 text-center"
                >
                  <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mb-4">
                    <FolderOpen className="w-10 h-10 text-slate-300" />
                  </div>
                  <h4 className="text-base font-semibold text-slate-700 mb-1">{t.noDocuments || 'No Documents'}</h4>
                  <p className="text-sm text-slate-400">{t.noDocumentsUploaded || 'No documents have been uploaded for this employee yet.'}</p>
                </motion.div>
            )}
          </div>

          {/* Footer Stats (if documents exist) */}
          {(list.length > 0 || imageAssets.length > 0) && (
              <div className="bg-slate-50 px-6 py-3 border-t border-slate-100">
                <div className="flex items-center justify-between text-xs text-slate-500">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1.5">
                      <FileText className="w-3.5 h-3.5" />
                      <span>{t.totalFiles || 'Total'}: {list.length + imageAssets.length} {t.files || 'files'}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <CheckCircle className="w-3.5 h-3.5 text-emerald-500" />
                      <span>{t.allFilesVerified || 'All files verified'}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>{t.lastUpdated || 'Last updated'}: {new Date().toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
          )}
        </motion.div>
      </>
  );
});

export default DocumentsTab;