import { memo, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Shield,
  FileText,
  MapPin,
  User,
  Phone,
  Mail,
  Globe,
  Building2,
  Home,
  Calendar,
  CheckCircle,
  AlertCircle,
  Award,
  CreditCard,
  Sparkles,
  Lock,
  Eye,
  EyeOff,
  Download,
  X
} from 'lucide-react';
import { useEmpDetailGuarantor } from '../../../../services/hr/employee/empDetail/empDetail.queries';
import { useLanguage } from '../../../../i18n/LanguageContext';

// ============ Helper Components ============

const cn = (...classes: (string | undefined | false | null)[]) => {
  return classes.filter(Boolean).join(' ');
};

// Loading Skeleton Component
const DetailSkeleton = ({ rows = 4 }: { rows?: number }) => {
  const { t } = useLanguage();
  return (
      <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 overflow-hidden">
        <div className="bg-gradient-to-r from-slate-50 to-gray-50 px-5 py-4 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-slate-200 rounded-xl animate-pulse" />
            <div className="h-5 w-32 bg-slate-200 rounded-lg animate-pulse" />
          </div>
        </div>
        <div className="p-5 space-y-4">
          {Array.from({ length: rows }).map((_, i) => (
              <div key={i} className="space-y-2">
                <div className="h-3 w-20 bg-slate-200 rounded animate-pulse" />
                <div className="h-5 w-full bg-slate-100 rounded animate-pulse" />
              </div>
          ))}
        </div>
      </div>
  );
};

// Error Component
const DetailError = ({ message }: { message: string }) => {
  const { t } = useLanguage();
  return (
      <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-red-50 to-red-100 rounded-2xl p-8 text-center border border-red-200"
      >
        <div className="w-16 h-16 bg-red-200 rounded-full flex items-center justify-center mx-auto mb-4">
          <AlertCircle className="w-8 h-8 text-red-600" />
        </div>
        <h3 className="text-lg font-semibold text-red-800 mb-2">{t.failedToLoadGuarantorData || 'Failed to Load Guarantor Data'}</h3>
        <p className="text-red-600">{message}</p>
        <button className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors">
          {t.tryAgain || 'Try Again'}
        </button>
      </motion.div>
  );
};

// Document Viewer Modal Component
const DocumentViewerModal = ({ doc, onClose }: { doc: { fileName: string; contentType: string; fileSizeStr: string; blobUrl?: string }; onClose: () => void }) => {
  const { t } = useLanguage();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(false);

  const handleLoad = () => setIsLoading(false);
  const handleError = () => {
    setIsLoading(false);
    setError(true);
  };

  const handleDownload = () => {
    if (doc.blobUrl) {
      const link = document.createElement('a');
      link.href = doc.blobUrl;
      link.download = doc.fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const isImage = doc.contentType?.startsWith('image/');
  const isPDF = doc.contentType?.includes('pdf');

  return (
      <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
          onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
      >
        <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden w-full max-w-4xl max-h-[90vh]"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 bg-gradient-to-r from-slate-50 to-gray-50 border-b border-slate-200">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-amber-100 rounded-lg">
                <FileText className="w-4 h-4 text-amber-600" />
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-800">{doc.fileName}</p>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-xs text-slate-400">{doc.contentType?.split('/').pop()?.toUpperCase() || 'Unknown'}</span>
                  <span className="w-1 h-1 rounded-full bg-slate-300" />
                  <span className="text-xs text-slate-400">{doc.fileSizeStr}</span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                  onClick={handleDownload}
                  className="p-2 rounded-lg text-slate-500 hover:bg-slate-100 transition-colors"
                  title={t.download || 'Download'}
              >
                <Download className="w-4 h-4" />
              </button>
              <button
                  onClick={onClose}
                  className="p-2 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-auto bg-slate-100 flex items-center justify-center p-6 min-h-[400px]">
            {isLoading && (
                <div className="flex flex-col items-center gap-3">
                  <div className="relative">
                    <div className="w-12 h-12 border-4 border-amber-200 rounded-full" />
                    <div className="absolute top-0 left-0 w-12 h-12 border-4 border-amber-500 border-t-transparent rounded-full animate-spin" />
                  </div>
                  <p className="text-sm text-slate-500">{t.loadingDocument || 'Loading document...'}</p>
                </div>
            )}
            {error && (
                <div className="text-center">
                  <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <AlertCircle className="w-8 h-8 text-red-500" />
                  </div>
                  <p className="text-sm text-red-600">{t.failedToLoadDocument || 'Failed to load document'}</p>
                </div>
            )}
            {doc.blobUrl && isImage && !error && (
                <img
                    src={doc.blobUrl}
                    alt={doc.fileName}
                    onLoad={handleLoad}
                    onError={handleError}
                    className="max-w-full max-h-full object-contain rounded-lg shadow-lg"
                />
            )}
            {doc.blobUrl && isPDF && !error && (
                <iframe
                    src={doc.blobUrl}
                    title={doc.fileName}
                    onLoad={handleLoad}
                    onError={handleError}
                    className="w-full h-full min-h-[500px] rounded-lg shadow-lg"
                />
            )}
            {doc.blobUrl && !isImage && !isPDF && !error && (
                <div className="text-center p-8">
                  <FileText className="w-16 h-16 text-slate-300 mx-auto mb-3" />
                  <p className="text-sm text-slate-500">{t.previewNotAvailable || 'Preview not available'}</p>
                  <button
                      onClick={handleDownload}
                      className="mt-4 px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors"
                  >
                    {t.downloadToView || 'Download to view'}
                  </button>
                </div>
            )}
          </div>
        </motion.div>
      </motion.div>
  );
};

// Read Card Component
interface ReadCardProps {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  badge?: string;
  gradient?: string;
  bgGradient?: string;
  action?: React.ReactNode;
}

const ReadCard = ({
                    title,
                    icon,
                    children,
                    badge,
                    gradient = "from-emerald-500 to-teal-600",
                    bgGradient = "from-emerald-50 to-teal-50",
                    action
                  }: ReadCardProps) => {
  return (
      <motion.div
          whileHover={{ y: -2 }}
          className="relative group h-full"
      >
        <div className={`absolute inset-0 bg-gradient-to-r ${gradient} rounded-2xl blur-xl opacity-0 group-hover:opacity-20 transition-opacity duration-500`} />

        <div className="relative bg-white rounded-2xl shadow-xl border border-white/20 overflow-hidden h-full flex flex-col">
          <div className={`bg-gradient-to-r ${bgGradient} px-5 py-4 border-b border-slate-100`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className={`p-2 bg-gradient-to-r ${gradient} rounded-xl shadow-md`}>
                  <div className="text-white">{icon}</div>
                </div>
                <h3 className="text-base font-semibold text-slate-800">{title}</h3>
              </div>
              <div className="flex items-center gap-2">
                {badge && (
                    <span className="px-2.5 py-1 bg-white/80 backdrop-blur-sm text-xs font-medium text-slate-600 rounded-full shadow-sm">
                      {badge}
                    </span>
                )}
                {action}
              </div>
            </div>
          </div>

          <div className="p-5 flex-1">
            {children}
          </div>
        </div>
      </motion.div>
  );
};

// Grid Component
interface GridProps {
  children: React.ReactNode;
  columns?: 1 | 2 | 3 | 4;
  className?: string;
}

const Grid = ({ children, columns = 2, className }: GridProps) => {
  const colClasses = {
    1: 'grid-cols-1',
    2: 'grid-cols-1 sm:grid-cols-2',
    3: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4'
  };

  return (
      <div className={cn(`grid ${colClasses[columns]} gap-5`, className)}>
        {children}
      </div>
  );
};

// Field Component
interface FieldProps {
  label: string;
  value?: string | number;
  icon?: React.ReactNode;
  highlight?: boolean;
  copyable?: boolean;
}

const Field = ({ label, value, icon, highlight, copyable }: FieldProps) => {
  const { t } = useLanguage();
  const displayValue = value !== undefined && value !== null && value !== '' ? value : '—';

  const handleCopy = () => {
    if (copyable && typeof displayValue === 'string' && displayValue !== '—') {
      navigator.clipboard.writeText(displayValue);
    }
  };

  return (
      <div className="group/field">
        <div className="flex items-center gap-1.5 mb-1">
          {icon && <span className="text-slate-400 group-hover/field:text-amber-600 transition-colors">{icon}</span>}
          <label className="text-xs font-medium text-slate-500 uppercase tracking-wide">
            {label}
          </label>
          {copyable && displayValue !== '—' && (
              <button
                  onClick={handleCopy}
                  className="opacity-0 group-hover/field:opacity-100 transition-opacity text-slate-400 hover:text-amber-600"
                  title={t.copyToClipboard || 'Copy to clipboard'}
              >
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                </svg>
              </button>
          )}
        </div>
        <p className={cn(
            "text-sm font-medium text-slate-800 break-words",
            highlight && "font-mono text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md inline-block"
        )}>
          {displayValue}
        </p>
      </div>
  );
};

// Document Card Component with View Button
const DocumentCard = ({ fileName, contentType, fileSizeStr, blobUrl, onView }: {
  fileName?: string;
  contentType?: string;
  fileSizeStr?: string;
  blobUrl?: string;
  onView: () => void;
}) => {
  const { t } = useLanguage();
  if (!fileName) return null;

  const getFileIcon = () => {
    if (contentType?.includes('pdf')) return <FileText className="w-5 h-5 text-red-500" />;
    if (contentType?.includes('image')) return <FileText className="w-5 h-5 text-blue-500" />;
    return <FileText className="w-5 h-5 text-slate-500" />;
  };

  return (
      <div className="flex items-center gap-3 p-4 bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl border border-amber-100">
        <div className="p-2.5 bg-white rounded-xl shadow-sm cursor-pointer hover:shadow-md transition-shadow" onClick={onView}>
          {getFileIcon()}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-slate-800 truncate cursor-pointer hover:text-amber-600 transition-colors" onClick={onView}>
            {fileName}
          </p>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-xs text-slate-500">{contentType?.split('/').pop()?.toUpperCase() || t.unknown || 'Unknown'}</span>
            <span className="w-1 h-1 rounded-full bg-slate-300" />
            <span className="text-xs text-slate-500">{fileSizeStr}</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
              onClick={onView}
              className="px-3 py-1.5 text-xs font-medium text-amber-600 bg-amber-100 rounded-lg hover:bg-amber-200 transition-colors"
          >
            {t.view || 'View'}
          </button>
          <CheckCircle className="w-4 h-4 text-emerald-500" />
        </div>
      </div>
  );
};

// ============ Main Component ============

export const GuarantorTab = memo(function GuarantorTab({ employeeId }: { employeeId: string }) {
  const { t } = useLanguage();
  const { data: g, isLoading, error } = useEmpDetailGuarantor(employeeId);
  const [viewingDoc, setViewingDoc] = useState<{ fileName: string; contentType: string; fileSizeStr: string; blobUrl?: string } | null>(null);

  const handleViewDocument = useCallback(() => {
    if (g?.fileName) {
      // For now, use a placeholder blob URL - in production, fetch from API
      const mockBlobUrl = g.blobUrl || '#';
      setViewingDoc({
        fileName: g.fileName,
        contentType: g.contentType || 'application/pdf',
        fileSizeStr: g.fileSizeStr || 'Unknown',
        blobUrl: mockBlobUrl
      });
    }
  }, [g]);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  if (isLoading) return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="space-y-6"
        >
          <DetailSkeleton rows={6} />
          <DetailSkeleton rows={3} />
        </motion.div>
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
        >
          <DetailSkeleton rows={10} />
        </motion.div>
      </div>
  );

  if (error) return <DetailError message={error.message} />;

  if (!g) return (
      <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white/90 backdrop-blur-xl rounded-2xl shadow-xl border border-white/20 p-12 text-center"
      >
        <div className="relative">
          <div className="absolute inset-0 bg-amber-500 rounded-full blur-2xl opacity-10" />
          <div className="relative w-20 h-20 bg-gradient-to-br from-amber-100 to-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Shield className="w-10 h-10 text-amber-400" />
          </div>
        </div>
        <h3 className="text-lg font-semibold text-slate-700 mb-2">{t.noGuarantorOnRecord || 'No Guarantor on Record'}</h3>
        <p className="text-sm text-slate-400 max-w-sm mx-auto">
          {t.noGuarantorDesc || 'No guarantor information has been added for this employee. Guarantor details help with financial verification.'}
        </p>
      </motion.div>
  );

  // Translation labels
  const guarantorDetails = t.guarantorDetails || 'Guarantor Details';
  const supportingDocument = t.supportingDocument || 'Supporting Document';
  const addressInformation = t.addressInformation || 'Address Information';
  const fullName = t.fullName || 'Full Name';
  const nationality = t.nationality || 'Nationality';
  const gender = t.gender || 'Gender';
  const relation = t.relation || 'Relation';
  const telephone = t.telephone || 'Telephone';
  const email = t.email || 'Email';
  const country = t.country || 'Country';
  const region = t.region || 'Region';
  const subcity = t.subcity || 'Subcity';
  const zone = t.zone || 'Zone';
  const woreda = t.woreda || 'Woreda';
  const kebele = t.kebele || 'Kebele';
  const houseNumber = t.houseNumber || 'House Number';
  const poBox = t.poBox || 'P.O. Box';
  const fax = t.fax || 'Fax';
  const website = t.website || 'Website';
  const primaryLocation = t.primaryLocation || 'Primary Location';
  const verified = t.verified || 'Verified';
  const notProvided = t.notProvided || 'Not provided';
  const noDocumentUploaded = t.noDocumentUploaded || 'No supporting document uploaded';
  const uploadRequired = t.uploadRequired || 'Upload required for verification';
  const informationEncrypted = t.informationEncrypted || 'Information is encrypted';
  const verifiedGuarantor = t.verifiedGuarantor || 'Verified Guarantor';
  const guarantorVerified = t.guarantorVerified || 'Guarantor Verified';
  const dataProtected = t.dataProtected || 'Data Protected';
  const auditTrailEnabled = t.auditTrailEnabled || 'Audit Trail Enabled';
  const lastUpdated = t.lastUpdated || 'Last updated';

  return (
      <>
        {/* Document Viewer Modal */}
        <AnimatePresence>
          {viewingDoc && (
              <DocumentViewerModal doc={viewingDoc} onClose={() => setViewingDoc(null)} />
          )}
        </AnimatePresence>

        <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="space-y-6"
        >
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left Column */}
            <motion.div variants={itemVariants} className="space-y-6">
              {/* Guarantor Details Card */}
              <ReadCard
                  title={guarantorDetails}
                  icon={<Shield className="w-4 h-4" />}
                  gradient="from-amber-500 to-orange-600"
                  bgGradient="from-amber-50 to-orange-50"
              >
                <div className="space-y-5">
                  {/* Guarantor Highlight */}
                  <div className="flex items-center gap-4 p-4 bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl border border-amber-100">
                    <div className="relative">
                      <div className="absolute inset-0 bg-gradient-to-r from-amber-400 to-orange-400 rounded-full blur-md opacity-30" />
                      <div className="relative w-14 h-14 rounded-full bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center shadow-lg">
                        <User className="w-7 h-7 text-white" />
                      </div>
                    </div>
                    <div>
                      <p className="text-base font-semibold text-slate-800">{g.fullName || notProvided}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <div className="inline-flex items-center gap-1 px-2 py-0.5 bg-white rounded-full text-xs">
                          <Shield className="w-3 h-3 text-amber-500" />
                          <span className="text-slate-600">{g.relation}</span>
                        </div>
                        <div className="w-1 h-1 rounded-full bg-slate-300" />
                        <div className="flex items-center gap-1">
                          <CheckCircle className="w-3 h-3 text-emerald-500" />
                          <span className="text-xs text-emerald-600">{verified}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <Grid columns={2}>
                    <Field label={fullName} value={g.fullName} icon={<User className="w-3.5 h-3.5" />} />
                    <Field label={nationality} value={g.nationality} icon={<Globe className="w-3.5 h-3.5" />} />
                    <Field label={gender} value={g.gender} icon={<User className="w-3.5 h-3.5" />} />
                    <Field label={relation} value={g.relation} icon={<Shield className="w-3.5 h-3.5" />} />
                    <Field label={telephone} value={g.telephone} icon={<Phone className="w-3.5 h-3.5" />} highlight copyable />
                    <Field label={email} value={g.email} icon={<Mail className="w-3.5 h-3.5" />} copyable />
                  </Grid>
                </div>
              </ReadCard>

              {/* Document Card */}
              <ReadCard
                  title={supportingDocument}
                  icon={<FileText className="w-4 h-4" />}
                  gradient="from-blue-500 to-cyan-600"
                  bgGradient="from-blue-50 to-cyan-50"
              >
                {g.fileName ? (
                    <DocumentCard
                        fileName={g.fileName}
                        contentType={g.contentType}
                        fileSizeStr={g.fileSizeStr}
                        onView={handleViewDocument}
                    />
                ) : (
                    <div className="text-center py-8">
                      <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-3">
                        <FileText className="w-8 h-8 text-slate-300" />
                      </div>
                      <p className="text-sm text-slate-500">{noDocumentUploaded}</p>
                      <p className="text-xs text-slate-400 mt-1">{uploadRequired}</p>
                    </div>
                )}
              </ReadCard>
            </motion.div>

            {/* Right Column - Address Card */}
            <motion.div variants={itemVariants}>
              <ReadCard
                  title={addressInformation}
                  icon={<MapPin className="w-4 h-4" />}
                  badge={g.addressType}
                  gradient="from-emerald-500 to-teal-600"
                  bgGradient="from-emerald-50 to-teal-50"
              >
                <div className="space-y-5">
                  {/* Location Summary */}
                  {(g.country || g.region) && (
                      <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-emerald-50 to-teal-50 rounded-xl border border-emerald-100">
                        <div className="p-2 bg-white rounded-lg shadow-sm">
                          <MapPin className="w-4 h-4 text-emerald-600" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-slate-800">
                            {[g.region, g.country].filter(Boolean).join(', ')}
                          </p>
                          <p className="text-xs text-slate-500">{primaryLocation}</p>
                        </div>
                        <div className="ml-auto">
                          <Sparkles className="w-4 h-4 text-amber-500" />
                        </div>
                      </div>
                  )}

                  <Grid columns={2}>
                    <Field label={country} value={g.country} icon={<Globe className="w-3.5 h-3.5" />} />
                    <Field label={region} value={g.region} icon={<MapPin className="w-3.5 h-3.5" />} />
                    <Field label={subcity} value={g.subcity} icon={<Building2 className="w-3.5 h-3.5" />} />
                    <Field label={zone} value={g.zone} />
                    <Field label={woreda} value={g.woreda} />
                    <Field label={kebele} value={g.kebele} />
                    <Field label={houseNumber} value={g.houseNo} icon={<Home className="w-3.5 h-3.5" />} />
                    <Field label={poBox} value={g.poBox} />
                    <Field label={fax} value={g.fax} />
                    <Field label={website} value={g.website} />
                  </Grid>

                  {/* Security Note */}
                  <div className="mt-4 pt-3 border-t border-emerald-100">
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <Lock className="w-3.5 h-3.5 text-emerald-600" />
                        <span className="text-slate-500">{informationEncrypted}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle className="w-3.5 h-3.5 text-emerald-500" />
                        <span className="text-emerald-600 font-medium">{verifiedGuarantor}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </ReadCard>
            </motion.div>
          </div>

          {/* Footer Summary */}
          <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-slate-200"
          >
            <div className="flex items-center gap-4 text-xs text-slate-500">
              <div className="flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                <span>{guarantorVerified}</span>
              </div>
              <div className="w-px h-3 bg-slate-300" />
              <div className="flex items-center gap-1.5">
                <Lock className="w-3 h-3" />
                <span>{dataProtected}</span>
              </div>
              <div className="w-px h-3 bg-slate-300" />
              <div className="flex items-center gap-1.5">
                <Eye className="w-3 h-3" />
                <span>{auditTrailEnabled}</span>
              </div>
            </div>
            <div className="text-xs text-slate-400">
              {lastUpdated}: {new Date().toLocaleDateString()}
            </div>
          </motion.div>
        </motion.div>
      </>
  );
});

export default GuarantorTab;