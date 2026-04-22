import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, User, Briefcase, MapPin, GraduationCap, Star } from 'lucide-react';
import { Button } from '../../../ui/button';
import { useApplicantDetail } from '../../../../services/hr/recruitment/applicant/applicant.queries';

interface ApplicantDetailModalProps {
  applicantId: string | null;
  onClose: () => void;
}

const Field = ({ label, value }: { label: string; value?: string }) =>
  value ? (
    <div className="space-y-0.5">
      <p className="text-xs text-gray-500">{label}</p>
      <p className="text-sm font-medium text-gray-800">{value}</p>
    </div>
  ) : null;

const ApplicantDetailModal: React.FC<ApplicantDetailModalProps> = ({ applicantId, onClose }) => {
  const { data, isLoading } = useApplicantDetail(applicantId ?? '');

  return (
    <AnimatePresence>
      {applicantId && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 px-4"
          onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
          <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }} transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center gap-3 border-b px-6 py-4 sticky top-0 bg-white z-10">
              <User size={20} className="text-green-600" />
              <div className="flex-1">
                <h2 className="text-lg font-bold text-gray-800">Applicant Details</h2>
                {data && <p className="text-xs text-gray-500">{data.applicant} · {data.postNumber}</p>}
              </div>
              <button onClick={onClose} className="text-gray-400 hover:text-gray-600 cursor-pointer">
                <X size={18} />
              </button>
            </div>

            {isLoading ? (
              <div className="p-8 flex justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600" />
              </div>
            ) : data ? (
              <div className="p-6 space-y-6">
                {/* Applicant */}
                <div className="bg-green-50 rounded-lg p-4 flex items-center gap-3">
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                    <User className="w-6 h-6 text-green-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-800 text-lg">{data.applicant}</p>
                    <p className="text-sm text-gray-500">{data.position} · {data.jgStep}</p>
                  </div>
                </div>

                {/* Posting info */}
                <div>
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3 flex items-center gap-1">
                    <Briefcase size={12} /> Posting Info
                  </p>
                  <div className="grid grid-cols-2 gap-4">
                    <Field label="Post Number" value={data.postNumber} />
                    <Field label="Req Number" value={data.reqNumber} />
                    <Field label="Plan Code" value={data.planCode} />
                    <Field label="Department" value={data.department} />
                    <Field label="Period" value={data.period} />
                  </div>
                </div>

                {/* Job details */}
                <div>
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3 flex items-center gap-1">
                    <Star size={12} /> Job Details
                  </p>
                  <div className="grid grid-cols-2 gap-4">
                    <Field label="Work Location" value={data.workLocation} />
                    <Field label="Preferred Gender" value={data.preGender} />
                    <Field label="Contract Type" value={data.contractType} />
                  </div>
                  {data.desc && (
                    <div className="mt-3 space-y-0.5">
                      <p className="text-xs text-gray-500">Description</p>
                      <p className="text-sm text-gray-700 whitespace-pre-line">{data.desc}</p>
                    </div>
                  )}
                  {data.qualification && (
                    <div className="mt-3 space-y-0.5">
                      <p className="text-xs text-gray-500 flex items-center gap-1"><GraduationCap size={11} /> Qualification</p>
                      <p className="text-sm text-gray-700 whitespace-pre-line">{data.qualification}</p>
                    </div>
                  )}
                  {data.keySkills && (
                    <div className="mt-3 space-y-0.5">
                      <p className="text-xs text-gray-500">Key Skills</p>
                      <p className="text-sm text-gray-700 whitespace-pre-line">{data.keySkills}</p>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="p-8 text-center text-gray-500">No details found.</div>
            )}

            <div className="border-t px-6 py-4 bg-gray-50 rounded-b-xl flex justify-end">
              <Button variant="outline" onClick={onClose} className="cursor-pointer">Close</Button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ApplicantDetailModal;
