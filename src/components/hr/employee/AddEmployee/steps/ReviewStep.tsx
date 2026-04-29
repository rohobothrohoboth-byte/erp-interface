import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, FileText, User, MapPin, Printer } from 'lucide-react';
import type { EmpAddPrintDto } from '../../../../../types/hr/employee/empAddDto';
import type { UUID } from 'crypto';
import { empService } from '../../../../../services/hr/employee/empService';
import { useNavigate } from 'react-router-dom';

interface ReviewStepProps {
  employeeId?: UUID;
  onBack: () => void;
  loading?: boolean;
  onClearTempData?: () => void;
}

export const ReviewStep: React.FC<ReviewStepProps> = ({
  employeeId,
  onBack,
  loading = false,
  onClearTempData,
}) => {
  const navigate = useNavigate();
  const [reviewData, setReviewData] = useState<EmpAddPrintDto | null>(null);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [submissionStatus, setSubmissionStatus] = useState<'idle' | 'submitting'>('idle');

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    if (document.documentElement) document.documentElement.scrollTop = 0;
    if (document.body) document.body.scrollTop = 0;
  };

  useEffect(() => {
    scrollToTop();
  }, []);

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
        const data = await empService.getStep5Data(employeeId);
        setReviewData(data);
      } catch (error) {
        console.error('Failed to fetch review data:', error);
        setFetchError('Failed to load employee data. Please try again.');
      } finally {
        setFetchLoading(false);
      }
    };
    fetchData();
  }, [employeeId]);

  const clearTemporaryData = () => {
    localStorage.removeItem('employeeFormData');
    localStorage.removeItem('employeeId');
    if (onClearTempData) onClearTempData();
  };

  const handleConfirm = async () => {
    if (!reviewData) { setFetchError('No review data available'); return; }
    scrollToTop();
    setSubmissionStatus('submitting');
    try {
      clearTemporaryData();
      navigate('/hr/employees/record');
    } catch (error) {
      console.error('Confirmation failed:', error);
      setFetchError('Failed to confirm. Please try again.');
      setSubmissionStatus('idle');
    }
  };

  const handleBackClick = () => { scrollToTop(); onBack(); };

  const handleCancelAndClear = () => {
    if (window.confirm('Are you sure you want to cancel and clear all temporary data?')) {
      clearTemporaryData();
      navigate('/hr/employees/record');
    }
  };

  const handlePrint = () => {
    scrollToTop();
    setTimeout(() => {
      const el = document.getElementById('basic-info-section');
      if (!el) { alert('Section not found.'); return; }
      const clone = el.cloneNode(true) as HTMLElement;
      const printWindow = window.open('', '_blank');
      if (!printWindow) return;
      const styles = Array.from(document.querySelectorAll("style, link[rel='stylesheet']")).map(n => n.outerHTML).join('\n');
      const printCSS = `<style>
        @page { size: A4; margin: 12mm; }
        body { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; font-family: 'Segoe UI', Tahoma, sans-serif; margin: 0; padding: 0; font-size: 14px; }
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
      </style>`;
      printWindow.document.write(`<!DOCTYPE html><html><head><title>Employee Information</title>${styles}${printCSS}</head><body><div id="print-root"><div class="print-header"><h3>Employee Information</h3></div><div class="print-section">${clone.outerHTML}</div></div></body></html>`);
      printWindow.document.close();
      printWindow.focus();
      setTimeout(() => { printWindow.print(); printWindow.close(); }, 250);
    }, 50);
  };

  if (fetchLoading) {
    return (
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.3 }} className="space-y-8">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-green-200 border-t-green-500 rounded-full animate-spin mx-auto mb-4"></div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Loading Employee Data</h2>
          <p className="text-gray-600">Please wait...</p>
        </div>
      </motion.div>
    );
  }

  if (fetchError || !reviewData) {
    return (
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.3 }} className="space-y-8">
        <div className="text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <FileText className="w-8 h-8 text-red-500" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Failed to Load Data</h2>
          <p className="text-gray-600 mb-4">{fetchError || 'Unable to load employee information.'}</p>
          <div className="flex gap-4 justify-center">
            <button onClick={handleBackClick} className="px-6 py-2 bg-gray-600 text-white rounded-lg font-medium hover:bg-gray-700 transition-colors">Go Back</button>
            <button onClick={handleCancelAndClear} className="px-6 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors">Cancel & Clear Data</button>
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.3 }} className="space-y-8">
      <div id="employee-review-content">
        <div className="text-center mb-8">
          <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Review Employee Information</h2>
          <p className="text-gray-600">Please review all the information before confirming</p>
        </div>

        {/* Basic Information */}
        <div className="border border-gray-200 rounded-xl p-6 mb-6 print-section" id="basic-info-section">
          <div className="flex items-center mb-4">
            <User className="w-5 h-5 text-green-600 mr-2" />
            <h3 className="text-lg font-semibold text-gray-900">Basic Information</h3>
          </div>

          <div className="print-layout flex">
            {/* Left — photo + code */}
            <div className="left-column w-1/3 pr-8">
              <div className="border-dashed border-2 rounded-lg px-4 py-2 flex flex-col items-center justify-center mb-4">
                <div className="photo-section">
                  {reviewData.photo ? (
                    <img src={`data:image/png;base64,${reviewData.photo}`} alt="Employee Profile" className="employee-photo" />
                  ) : (
                    <div className="placeholder-photo"><User className="w-12 h-12 text-gray-400" /></div>
                  )}
                </div>
                <p className="text-sm text-gray-500 mt-2 text-center">Profile Photo</p>
              </div>
              {reviewData.code && (
                <div className="employee-code text-center">
                  <div className="bg-green-50 border border-green-200 rounded-lg px-3 py-2">
                    <span className="text-xs font-medium text-green-600">Employee Code: </span>
                    <span className="text-sm font-bold text-green-800">{reviewData.code}</span>
                  </div>
                </div>
              )}
            </div>

            {/* Right — details */}
            <div className="w-2/3 flex flex-col md:flex-row md:space-x-10 space-y-6 md:space-y-0">
              <div className="flex-1 space-y-4">
                <div className="field">
                  <label className="text-sm font-medium text-gray-500">Full Name</label>
                  <p className="text-gray-900 font-medium">{reviewData.fullName || 'Not provided'}</p>
                </div>
                <div className="field">
                  <label className="text-sm font-medium text-gray-500">Gender</label>
                  <p className="text-gray-900 font-medium">{reviewData.gender || 'Not provided'}</p>
                </div>
                <div className="field">
                  <label className="text-sm font-medium text-gray-500">Nationality</label>
                  <p className="text-gray-900 font-medium">{reviewData.nationality || 'Not provided'}</p>
                </div>
                <div className="field">
                  <label className="text-sm font-medium text-gray-500">Birth Date</label>
                  <p className="text-gray-900 font-medium">{reviewData.birthDate || 'Not provided'}</p>
                </div>
                <div className="field">
                  <label className="text-sm font-medium text-gray-500">Marital Status</label>
                  <p className="text-gray-900 font-medium">{reviewData.maritalStatus || 'Not provided'}</p>
                </div>
                <div className="field">
                  <label className="text-sm font-medium text-gray-500">Employment Date</label>
                  <p className="text-gray-900 font-medium">{reviewData.employmentDate || 'Not provided'}</p>
                </div>
              </div>

              <div className="flex-1 space-y-4">
                <div className="field">
                  <label className="text-sm font-medium text-gray-500">Employment Type</label>
                  <p className="text-gray-900 font-medium">{reviewData.employmentType || 'Not provided'}</p>
                </div>
                <div className="field">
                  <label className="text-sm font-medium text-gray-500">Employment Nature</label>
                  <p className="text-gray-900 font-medium">{reviewData.employmentNature || 'Not provided'}</p>
                </div>
                <div className="field">
                  <label className="text-sm font-medium text-gray-500">Position</label>
                  <p className="text-gray-900 font-medium">{reviewData.position || 'Not provided'}</p>
                </div>
                <div className="field">
                  <label className="text-sm font-medium text-gray-500">Department</label>
                  <p className="text-gray-900 font-medium">{reviewData.department || 'Not provided'}</p>
                </div>
                <div className="field">
                  <label className="text-sm font-medium text-gray-500">Job Grade</label>
                  <p className="text-gray-900 font-medium">{reviewData.jobGrade || 'Not provided'}</p>
                </div>
                <div className="field">
                  <label className="text-sm font-medium text-gray-500">Branch</label>
                  <p className="text-gray-900 font-medium">{reviewData.branch || 'Not provided'}</p>
                </div>
                <div className="field">
                  <label className="text-sm font-medium text-gray-500">Address</label>
                  <p className="text-gray-900 font-medium">{reviewData.address || 'Not provided'}</p>
                </div>
                <div className="field">
                  <label className="text-sm font-medium text-gray-500">Telephone</label>
                  <p className="text-gray-900 font-medium">{reviewData.telephone || 'Not provided'}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Guarantor Information */}
        <div className="border border-gray-200 rounded-xl p-6 print-section">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <User className="w-5 h-5 text-purple-600 mr-2" />
              <h3 className="text-lg font-semibold text-gray-900">Guarantor Information</h3>
            </div>
            {reviewData.guaFileName && (
              <div className="flex items-center gap-2 text-sm text-blue-600">
                <FileText className="w-4 h-4" />
                <span>Document uploaded</span>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Document preview */}
            <div className="lg:col-span-1 flex flex-col items-center">
              <label className="text-sm font-medium text-gray-500 mb-3">Guarantor Document</label>
              <div className="flex flex-col items-center">
                <div className="w-16 h-16 bg-blue-50 border border-blue-200 rounded-lg flex items-center justify-center">
                  <FileText className={`w-8 h-8 ${reviewData.guaFileName ? 'text-blue-500' : 'text-gray-400'}`} />
                </div>
                <p className="text-sm text-gray-500 mt-2">{reviewData.guaFileName || 'No document uploaded'}</p>
                {reviewData.guaFileSize && <p className="text-xs text-gray-400 mt-1">{reviewData.guaFileSize}</p>}
              </div>
            </div>

            {/* Guarantor details */}
            <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="field">
                <label className="text-sm font-medium text-gray-500">Full Name</label>
                <p className="text-gray-900 font-medium">{reviewData.guaFullName || 'Not provided'}</p>
              </div>
              <div className="field">
                <label className="text-sm font-medium text-gray-500">Nationality</label>
                <p className="text-gray-900 font-medium">{reviewData.guaNationality || 'Not provided'}</p>
              </div>
              <div className="field">
                <label className="text-sm font-medium text-gray-500">Gender</label>
                <p className="text-gray-900 font-medium">{reviewData.guaGender || 'Not provided'}</p>
              </div>
              <div className="field">
                <label className="text-sm font-medium text-gray-500">Relation</label>
                <p className="text-gray-900 font-medium">{reviewData.guaRelation || 'Not provided'}</p>
              </div>
            </div>
          </div>

          {/* Guarantor Address */}
          <div className="mt-6 pt-6 border-t border-gray-200">
            <div className="flex items-center mb-4">
              <MapPin className="w-5 h-5 text-purple-600 mr-2" />
              <h4 className="font-semibold text-gray-900">Address</h4>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="field">
                <label className="text-sm font-medium text-gray-500">Full Address</label>
                <p className="text-gray-900 font-medium">{reviewData.guaAddress || 'Not provided'}</p>
              </div>
              <div className="field">
                <label className="text-sm font-medium text-gray-500">Telephone</label>
                <p className="text-gray-900 font-medium">{reviewData.guaTelephone || 'Not provided'}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex justify-between pt-8">
        <button
          type="button"
          onClick={handleBackClick}
          disabled={loading}
          className="px-6 py-3 border border-gray-300 rounded-xl text-gray-700 font-medium hover:bg-gray-50 transition-colors disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed"
        >
          Back
        </button>

        <div className="flex gap-4">
          <button
            type="button"
            onClick={handlePrint}
            disabled={loading}
            className="px-6 py-3 border border-blue-600 text-blue-600 rounded-xl font-medium hover:bg-blue-50 transition-colors disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed flex items-center"
          >
            <Printer className="w-5 h-5 mr-2" />
            Print
          </button>

          <button
            type="button"
            onClick={handleConfirm}
            disabled={loading || submissionStatus === 'submitting'}
            className="px-8 py-3 bg-green-600 text-white rounded-xl font-medium hover:bg-green-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center"
          >
            {submissionStatus === 'submitting' || loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                Confirming...
              </>
            ) : (
              <>
                <CheckCircle className="w-5 h-5 mr-2" />
                Confirm & Finish
              </>
            )}
          </button>
        </div>
      </div>
    </motion.div>
  );
};
