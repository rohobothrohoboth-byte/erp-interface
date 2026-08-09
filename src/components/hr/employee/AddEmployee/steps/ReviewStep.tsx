// ReviewStep.tsx - FULLY CORRECTED VERSION

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CheckCircle,
  FileText,
  User,
  MapPin,
  Printer,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  Download,
  Shield,
  Building2,
  Briefcase,
  Calendar,
  Mail,
  Phone,
  Home,
  Award,
  Users,
  Heart,
  Loader2,
  Eye,
  XCircle
} from 'lucide-react';
import type { EmpAddPrintDto } from '../../../../../types/hr/employee/empAddDto';
import type { UUID } from 'crypto';
import { empApi } from '../../../../../services/hr/employee/emp.api';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../../../../../i18n/LanguageContext';
import toast from 'react-hot-toast';

// ============================================================
// TYPES
// ============================================================

interface ReviewStepProps {
  employeeId?: UUID;
  onBack: () => void;
  loading?: boolean;
  onClearTempData?: () => void;
}

// ============================================================
// INFO FIELD COMPONENT
// ============================================================

interface InfoFieldProps {
  label: string;
  value?: string;
  icon?: React.ComponentType<{ className?: string }>;
  t: any;
}

const InfoField: React.FC<InfoFieldProps> = ({ label, value, icon: Icon, t }) => (
    <div className="group">
      <label className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-1 flex items-center gap-1.5">
        {Icon && <Icon className="w-3 h-3" />}
        {label}
      </label>
      <p className="text-sm font-medium text-slate-800 dark:text-slate-200 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
        {value || t.notProvided || 'Not provided'}
      </p>
    </div>
);

// ============================================================
// SECTION HEADER
// ============================================================

const SectionHeader = ({
                         icon,
                         title,
                         gradient
                       }: {
  icon: React.ReactNode;
  title: string;
  gradient: string;
}) => (
    <div className={`bg-gradient-to-r ${gradient} px-6 py-4`}>
      <div className="flex items-center gap-2">
        {icon}
        <h3 className="text-lg font-semibold text-white">{title}</h3>
      </div>
    </div>
);

// ============================================================
// MAIN COMPONENT
// ============================================================

export const ReviewStep: React.FC<ReviewStepProps> = ({
                                                        employeeId,
                                                        onBack,
                                                        loading = false,
                                                        onClearTempData,
                                                      }) => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [reviewData, setReviewData] = useState<EmpAddPrintDto | null>(null);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [submissionStatus, setSubmissionStatus] = useState<'idle' | 'submitting'>('idle');

  // ============================================================
  // SCROLL TO TOP
  // ============================================================

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    if (document.documentElement) document.documentElement.scrollTop = 0;
    if (document.body) document.body.scrollTop = 0;
  };

  useEffect(() => {
    scrollToTop();
  }, []);

  // ============================================================
  // FETCH DATA
  // ============================================================

  useEffect(() => {
    const fetchData = async () => {
      if (!employeeId) {
        setFetchError('No employee ID provided. Please go back and complete the previous steps.');
        setFetchLoading(false);
        return;
      }
      try {
        setFetchLoading(true);
        setFetchError(null);
        const data = await empApi.getPrint(employeeId);
        setReviewData(data);
      } catch (error) {
        console.error('Failed to fetch review data:', error);
        setFetchError('Failed to load employee data. Please try again.');
        toast.error('Failed to load employee data');
      } finally {
        setFetchLoading(false);
      }
    };
    fetchData();
  }, [employeeId]);

  // ============================================================
  // HANDLERS
  // ============================================================

  const clearTemporaryData = () => {
    localStorage.removeItem('employeeFormData');
    localStorage.removeItem('employeeId');
    if (onClearTempData) onClearTempData();
  };

  const handleConfirm = async () => {
    if (!reviewData) {
      setFetchError('No review data available');
      toast.error('No review data available');
      return;
    }
    scrollToTop();
    setSubmissionStatus('submitting');
    try {
      clearTemporaryData();
      toast.success('Employee confirmed successfully!');
      navigate('/hr/employees/record');
    } catch (error) {
      console.error('Confirmation failed:', error);
      setFetchError('Failed to confirm. Please try again.');
      toast.error('Failed to confirm employee');
      setSubmissionStatus('idle');
    }
  };

  const handleBackClick = () => {
    scrollToTop();
    onBack();
  };

  const handleCancelAndClear = () => {
    if (window.confirm(t.confirmCancelClear || 'Are you sure you want to cancel and clear all temporary data?')) {
      clearTemporaryData();
      toast.success('Data cleared successfully');
      navigate('/hr/employees/record');
    }
  };

  // ============================================================
  // PRINT HANDLER
  // ============================================================

  const handlePrint = () => {
    scrollToTop();
    setTimeout(() => {
      const el = document.getElementById('basic-info-section');
      if (!el) {
        toast.error(t.sectionNotFound || 'Section not found.');
        return;
      }
      const clone = el.cloneNode(true) as HTMLElement;
      const printWindow = window.open('', '_blank');
      if (!printWindow) return;

      const styles = Array.from(document.querySelectorAll("style, link[rel='stylesheet']")).map(n => n.outerHTML).join('\n');
      const printCSS = `
        <style>
          @page { size: A4; margin: 12mm; }
          body { 
            -webkit-print-color-adjust: exact !important; 
            print-color-adjust: exact !important; 
            font-family: 'Segoe UI', Tahoma, sans-serif; 
            margin: 0; 
            padding: 0; 
            font-size: 14px;
            background: white;
          }
          #print-root { page-break-inside: avoid; }
          .print-section * { page-break-inside: avoid !important; break-inside: avoid !important; }
          .print-layout { display: flex !important; flex-direction: row !important; gap: 20px !important; width: 100% !important; }
          .left-column { flex: 1 !important; max-width: 35% !important; display: flex !important; flex-direction: column !important; align-items: center !important; }
          .right-column { flex: 2 !important; max-width: 65% !important; }
          .photo-section { width: 100% !important; max-width: 180px !important; margin-bottom: 20px !important; }
          .employee-photo { width: 100% !important; height: auto !important; max-height: 180px !important; object-fit: contain !important; border: 1px solid #ddd !important; border-radius: 8px !important; }
          .placeholder-photo { width: 180px !important; height: 180px !important; border: 2px dashed #ddd !important; border-radius: 8px !important; display: flex !important; align-items: center !important; justify-content: center !important; background-color: #f9fafb !important; }
          .employee-code { margin-top: 10px !important; text-align: center !important; width: 100% !important; }
          .field { margin-bottom: 12px !important; page-break-inside: avoid !important; }
          .field label { display: block !important; font-size: 12px !important; color: #6b7280 !important; margin-bottom: 4px !important; font-weight: 500 !important; }
          .field p { margin: 0 !important; font-size: 14px !important; color: #111827 !important; font-weight: 500 !important; word-break: break-word !important; }
          button, .no-print { display: none !important; }
          .print-header { margin-bottom: 20px !important; padding-bottom: 15px !important; border-bottom: 2px solid #e5e7eb !important; }
          .print-header h3 { margin: 0 !important; font-size: 18px !important; color: #111827 !important; font-weight: 600 !important; }
          .print-section { padding: 10px 0 !important; }
          .print-grid { display: grid !important; grid-template-columns: 1fr 1fr !important; gap: 15px !important; }
          .print-full { grid-column: 1 / -1 !important; }
        </style>
      `;

      printWindow.document.write(`<!DOCTYPE html><html><head><title>${t.employeeInformation || 'Employee Information'}</title>${styles}${printCSS}</head><body><div id="print-root"><div class="print-header"><h3>${t.employeeInformation || 'Employee Information'}</h3></div><div class="print-section">${clone.outerHTML}</div></div></body></html>`);
      printWindow.document.close();
      printWindow.focus();
      setTimeout(() => {
        printWindow.print();
        printWindow.close();
      }, 250);
    }, 50);
  };

  // ============================================================
  // LOADING STATE
  // ============================================================

  if (fetchLoading) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="flex items-center justify-center min-h-[400px]"
        >
          <div className="text-center">
            <div className="relative">
              <Loader2 className="w-16 h-16 animate-spin text-emerald-500 mx-auto" />
            </div>
            <h3 className="text-xl font-semibold text-slate-800 dark:text-slate-200 mt-6 mb-2">
              {t.loadingEmployeeData || 'Loading Employee Data'}
            </h3>
            <p className="text-slate-500 dark:text-slate-400">
              {t.pleaseWaitFetching || 'Please wait while we fetch the information...'}
            </p>
          </div>
        </motion.div>
    );
  }

  // ============================================================
  // ERROR STATE
  // ============================================================

  if (fetchError || !reviewData) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="space-y-6"
        >
          <div className="bg-gradient-to-r from-red-50 to-red-100 dark:from-red-950/30 dark:to-red-900/30 rounded-2xl p-8 text-center border border-red-200 dark:border-red-800">
            <div className="w-20 h-20 bg-red-200 dark:bg-red-900/50 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="w-10 h-10 text-red-600 dark:text-red-400" />
            </div>
            <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-200 mb-2">
              {t.failedToLoadData || 'Failed to Load Data'}
            </h2>
            <p className="text-slate-600 dark:text-slate-400 mb-6">
              {fetchError || t.unableToLoadEmployeeInfo || 'Unable to load employee information.'}
            </p>
            <div className="flex gap-4 justify-center flex-wrap">
              <button
                  onClick={handleBackClick}
                  className="px-6 py-2.5 bg-slate-600 hover:bg-slate-700 text-white rounded-xl font-medium transition-all"
              >
                {t.goBack || 'Go Back'}
              </button>
              <button
                  onClick={handleCancelAndClear}
                  className="px-6 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl font-medium transition-all"
              >
                {t.cancelAndClearData || 'Cancel & Clear Data'}
              </button>
            </div>
          </div>
        </motion.div>
    );
  }

  // ============================================================
  // RENDER
  // ============================================================

  return (
      <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
          className="space-y-8"
      >
        {/* Hero Header */}
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/10 to-teal-500/10 rounded-2xl blur-xl" />
          <div className="relative bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-950/30 dark:to-teal-950/30 rounded-2xl p-6 border border-emerald-100 dark:border-emerald-800 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl shadow-lg mb-4">
              <CheckCircle className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-200 mb-2">
              {t.reviewEmployeeInfo || 'Review Employee Information'}
            </h2>
            <p className="text-slate-500 dark:text-slate-400">
              {t.reviewBeforeConfirming || 'Please review all the information before confirming the employee record'}
            </p>
          </div>
        </div>

        <div id="employee-review-content" className="space-y-6">
          {/* Basic Information Section */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden shadow-sm hover:shadow-md transition-shadow" id="basic-info-section">
            <SectionHeader
                icon={<User className="w-5 h-5 text-white" />}
                title={t.basicInformation || 'Basic Information'}
                gradient="from-emerald-500 to-teal-600"
            />

            <div className="p-6">
              <div className="flex flex-col lg:flex-row gap-8">
                {/* Left Column - Photo */}
                <div className="lg:w-1/3">
                  <div className="border-2 border-dashed border-emerald-200 dark:border-emerald-800 rounded-2xl p-4 bg-gradient-to-br from-emerald-50/50 to-teal-50/50 dark:from-emerald-950/20 dark:to-teal-950/20">
                    <div className="flex flex-col items-center">
                      <div className="w-48 h-48 rounded-xl overflow-hidden bg-gradient-to-br from-emerald-100 to-teal-100 dark:from-emerald-900/30 dark:to-teal-900/30 flex items-center justify-center mb-3">
                        {reviewData.photo ? (
                            <img
                                src={`data:image/png;base64,${reviewData.photo}`}
                                alt={t.employeeProfile || "Employee Profile"}
                                className="w-full h-full object-cover"
                            />
                        ) : (
                            <User className="w-16 h-16 text-emerald-400" />
                        )}
                      </div>
                      <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">{t.profilePhoto || 'Profile Photo'}</p>
                    </div>
                  </div>
                  {reviewData.code && (
                      <div className="mt-4 bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-950/30 dark:to-teal-950/30 rounded-xl p-3 text-center border border-emerald-100 dark:border-emerald-800">
                        <p className="text-xs font-medium text-emerald-600 dark:text-emerald-400">{t.employeeCode || 'Employee Code'}</p>
                        <p className="text-lg font-bold text-emerald-800 dark:text-emerald-300">{reviewData.code}</p>
                      </div>
                  )}
                </div>

                {/* Right Column - Details */}
                <div className="flex-1">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <InfoField label={t.fullName || 'Full Name'} value={reviewData.fullName} icon={User} t={t} />
                      <InfoField label={t.gender || 'Gender'} value={reviewData.gender} icon={Users} t={t} />
                      <InfoField label={t.nationality || 'Nationality'} value={reviewData.nationality} icon={MapPin} t={t} />
                      <InfoField label={t.birthDate || 'Birth Date'} value={reviewData.birthDate} icon={Calendar} t={t} />
                      <InfoField label={t.maritalStatus || 'Marital Status'} value={reviewData.maritalStatus} icon={Heart} t={t} />
                      <InfoField label={t.employmentDate || 'Employment Date'} value={reviewData.employmentDate} icon={Calendar} t={t} />
                    </div>
                    <div className="space-y-4">
                      <InfoField label={t.employmentType || 'Employment Type'} value={reviewData.employmentType} icon={Briefcase} t={t} />
                      <InfoField label={t.employmentNature || 'Employment Nature'} value={reviewData.employmentNature} icon={Award} t={t} />
                      <InfoField label={t.position || 'Position'} value={reviewData.position} icon={Briefcase} t={t} />
                      <InfoField label={t.department || 'Department'} value={reviewData.department} icon={Building2} t={t} />
                      <InfoField label={t.jobGrade || 'Job Grade'} value={reviewData.jobGrade} icon={Award} t={t} />
                      <InfoField label={t.branch || 'Branch'} value={reviewData.branch} icon={Building2} t={t} />
                      <InfoField label={t.address || 'Address'} value={reviewData.address} icon={Home} t={t} />
                      <InfoField label={t.telephone || 'Telephone'} value={reviewData.telephone} icon={Phone} t={t} />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Guarantor Information Section */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden shadow-sm hover:shadow-md transition-shadow">
            <SectionHeader
                icon={<Shield className="w-5 h-5 text-white" />}
                title={t.guarantorInformation || 'Guarantor Information'}
                gradient="from-purple-500 to-pink-600"
            />

            <div className="p-6">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Document Preview */}
                <div className="lg:col-span-1">
                  <div className="border-2 border-dashed border-purple-200 dark:border-purple-800 rounded-2xl p-6 text-center bg-gradient-to-br from-purple-50/50 to-pink-50/50 dark:from-purple-950/20 dark:to-pink-950/20">
                    <div className="w-20 h-20 bg-gradient-to-br from-purple-100 to-pink-100 dark:from-purple-900/30 dark:to-pink-900/30 rounded-2xl flex items-center justify-center mx-auto mb-3">
                      <FileText className={`w-10 h-10 ${reviewData.guaFileName ? 'text-purple-500' : 'text-slate-400'}`} />
                    </div>
                    <p className="text-sm font-medium text-slate-700 dark:text-slate-300 mt-2">
                      {reviewData.guaFileName || t.noDocumentUploaded || 'No document uploaded'}
                    </p>
                    {reviewData.guaFileSize && (
                        <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">{reviewData.guaFileSize}</p>
                    )}
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-3">{t.supportingDocument || 'Supporting Document'}</p>
                  </div>
                </div>

                {/* Guarantor Details */}
                <div className="lg:col-span-2">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <InfoField label={t.fullName || 'Full Name'} value={reviewData.guaFullName} icon={User} t={t} />
                    <InfoField label={t.nationality || 'Nationality'} value={reviewData.guaNationality} icon={MapPin} t={t} />
                    <InfoField label={t.gender || 'Gender'} value={reviewData.guaGender} icon={Users} t={t} />
                    <InfoField label={t.relation || 'Relation'} value={reviewData.guaRelation} icon={Heart} t={t} />
                  </div>

                  {/* Guarantor Address */}
                  <div className="mt-6 pt-6 border-t border-slate-200 dark:border-slate-700">
                    <h4 className="font-semibold text-slate-800 dark:text-slate-200 mb-4 flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-purple-500" />
                      {t.addressInformation || 'Address Information'}
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <InfoField label={t.fullAddress || 'Full Address'} value={reviewData.guaAddress} icon={Home} t={t} />
                      <InfoField label={t.telephone || 'Telephone'} value={reviewData.guaTelephone} icon={Phone} t={t} />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Submission Status Message */}
          <AnimatePresence>
            {submissionStatus === 'submitting' && (
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-xl p-4 text-center"
                >
                  <div className="flex items-center justify-center gap-3">
                    <Loader2 className="w-5 h-5 animate-spin text-blue-600 dark:text-blue-400" />
                    <span className="text-blue-700 dark:text-blue-300 font-medium">
                  {t.submittingEmployee || 'Submitting employee record...'}
                </span>
                  </div>
                </motion.div>
            )}
          </AnimatePresence>

          {/* Navigation Buttons */}
          <div className="flex justify-between items-center pt-6 border-t border-slate-200 dark:border-slate-700 flex-wrap gap-4">
            <button
                type="button"
                onClick={handleBackClick}
                disabled={loading || submissionStatus === 'submitting'}
                className="group px-6 py-3 border border-slate-300 dark:border-slate-600 rounded-xl text-slate-700 dark:text-slate-300 font-medium hover:bg-slate-50 dark:hover:bg-slate-800 hover:border-slate-400 dark:hover:border-slate-500 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
              {t.back || 'Back'}
            </button>

            <div className="flex gap-4 flex-wrap">
              <button
                  type="button"
                  onClick={handleCancelAndClear}
                  disabled={loading || submissionStatus === 'submitting'}
                  className="px-6 py-3 border border-red-300 dark:border-red-700 text-red-600 dark:text-red-400 rounded-xl font-medium hover:bg-red-50 dark:hover:bg-red-950/30 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                <XCircle className="w-4 h-4" />
                {t.cancelAndClear || 'Cancel & Clear'}
              </button>

              <button
                  type="button"
                  onClick={handlePrint}
                  disabled={loading || submissionStatus === 'submitting'}
                  className="group px-6 py-3 border border-blue-600 dark:border-blue-500 text-blue-600 dark:text-blue-400 rounded-xl font-medium hover:bg-blue-50 dark:hover:bg-blue-950/30 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                <Printer className="w-4 h-4 group-hover:scale-110 transition-transform" />
                {t.print || 'Print'}
              </button>

              <button
                  type="button"
                  onClick={handleConfirm}
                  disabled={loading || submissionStatus === 'submitting'}
                  className="group px-8 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-xl font-medium hover:shadow-lg hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {submissionStatus === 'submitting' ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      {t.confirming || 'Confirming...'}
                    </>
                ) : (
                    <>
                      <CheckCircle className="w-4 h-4 group-hover:scale-110 transition-transform" />
                      {t.confirmAndFinish || 'Confirm & Finish'}
                      <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </>
                )}
              </button>
            </div>
          </div>

          {/* Footer Stats */}
          <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="flex justify-center items-center gap-6 pt-4 flex-wrap"
          >
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
              <span className="text-xs text-slate-500 dark:text-slate-400">{t.dataEncrypted || 'Data encrypted'}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
              <span className="text-xs text-slate-500 dark:text-slate-400">{t.secureConnection || 'Secure connection'}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse" />
              <span className="text-xs text-slate-500 dark:text-slate-400">{t.readyToConfirm || 'Ready to confirm'}</span>
            </div>
          </motion.div>
        </div>
      </motion.div>
  );
};

export default ReviewStep;