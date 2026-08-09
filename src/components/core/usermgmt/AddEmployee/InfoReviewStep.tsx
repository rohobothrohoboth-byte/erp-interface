// BasicInfoReviewStep.tsx - FULLY CORRECTED VERSION

import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import {
  CheckCircle,
  User,
  Printer,
  Shield,
  Sparkles,
  Eye,
  Download,
  AlertCircle,
  Briefcase,
  MapPin,
  Calendar,
  Building2,
  Users,
  Phone,
  Mail,
  Home,
  Flag,
  UserCheck,
  FileText
} from "lucide-react";
import type {
  Step1Dto,
  EmpAddPrintDto,
} from "../../../../types/hr/employee/empAddDto";
import type { UUID } from "crypto";

interface BasicInfoReviewStepProps {
  step1Data: Step1Dto & { branchId: UUID };
  step2Data: EmpAddPrintDto | null;
  photo?: string | null;
  onBack: () => void;
  onConfirm: () => void;
  onPrint: () => void;
  loading?: boolean;
}

export const BasicInfoReviewStep: React.FC<BasicInfoReviewStepProps> = ({
                                                                          step1Data,
                                                                          step2Data,
                                                                          photo,
                                                                          onBack,
                                                                          onConfirm,
                                                                          onPrint,
                                                                          loading = false,
                                                                        }) => {
  const [submitError, setSubmitError] = useState<string | null>(null);
  const prefersReducedMotion = useReducedMotion();

  // Scroll to top function
  const scrollToTop = useCallback(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
    if (document.documentElement) document.documentElement.scrollTop = 0;
    if (document.body) document.body.scrollTop = 0;
  }, []);

  useEffect(() => {
    scrollToTop();
  }, [scrollToTop]);

  // Handle confirmation
  const handleConfirm = useCallback((e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }

    console.log('=== CONFIRM BUTTON CLICKED ===');
    setSubmitError(null);
    scrollToTop();

    if (typeof onConfirm === 'function') {
      onConfirm();
    } else {
      console.error('onConfirm is not a function!');
      setSubmitError('Configuration error: Confirm function is not available');
    }
  }, [onConfirm, scrollToTop]);

  // Format the full name
  const fullName = step2Data?.fullName ||
      `${step1Data.firstName || ""} ${step1Data.middleName || ""} ${step1Data.lastName || ""}`.trim();

  const fullNameAm = step2Data?.fullNameAm ||
      `${step1Data.firstNameAm || ""} ${step1Data.middleNameAm || ""} ${step1Data.lastNameAm || ""}`.trim();

  // Check if data exists
  const hasData = step1Data && Object.keys(step1Data).length > 0;

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: prefersReducedMotion ? 0.2 : 0.3 }
    },
    exit: {
      opacity: 0,
      y: -20,
      transition: { duration: prefersReducedMotion ? 0.2 : 0.3 }
    }
  };

  const headerVariants = {
    hidden: { scale: 0.9, opacity: 0 },
    visible: {
      scale: 1,
      opacity: 1,
      transition: { type: "spring", stiffness: 200, damping: 20 }
    }
  };

  const sectionVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: prefersReducedMotion ? 0.2 : 0.4, delay: 0.2 }
    }
  };

  const buttonVariants = {
    hover: { scale: prefersReducedMotion ? 1 : 1.02 },
    tap: { scale: prefersReducedMotion ? 1 : 0.98 }
  };

  return (
      <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          className="space-y-8"
      >
        {/* Error Display */}
        <AnimatePresence>
          {submitError && (
              <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="bg-gradient-to-r from-red-50 to-red-100 dark:from-red-950/30 dark:to-red-900/30 border border-red-200 dark:border-red-800 rounded-xl p-4"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <AlertCircle className="h-5 w-5 text-red-500 dark:text-red-400" />
                    <div>
                      <h3 className="text-sm font-medium text-red-800 dark:text-red-300">Error</h3>
                      <p className="text-sm text-red-700 dark:text-red-400 mt-1">{submitError}</p>
                    </div>
                  </div>
                  <button
                      onClick={() => setSubmitError(null)}
                      className="text-red-700 dark:text-red-400 hover:text-red-900 dark:hover:text-red-300 transition-colors"
                  >
                    <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
                    </svg>
                  </button>
                </div>
              </motion.div>
          )}
        </AnimatePresence>

        {/* ✅ PRINTABLE SECTION */}
        <div id="basic-info-section" className="printable-area">
          {/* Header */}
          <motion.div variants={headerVariants} className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 shadow-lg mb-4">
              <CheckCircle className="w-10 h-10 text-white" />
            </div>
            <h2 className="text-2xl lg:text-3xl font-bold text-slate-800 dark:text-slate-100 mb-2">
              Review Basic Information
            </h2>
            <p className="text-slate-500 dark:text-slate-400">
              Please review all the information before confirming
            </p>
            {!hasData && (
                <p className="text-amber-600 dark:text-amber-400 text-sm mt-2">
                  ⚠️ No data found. Please go back and fill the form.
                </p>
            )}
          </motion.div>

          {/* Profile Photo Section */}
          <motion.div variants={sectionVariants} className="flex justify-center">
            <div className="relative">
              <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-emerald-500/20 shadow-xl">
                {photo ? (
                    <img
                        src={photo}
                        alt="Profile"
                        className="w-full h-full object-cover"
                    />
                ) : (
                    <div className="w-full h-full bg-gradient-to-br from-slate-200 to-slate-300 dark:from-slate-700 dark:to-slate-600 flex items-center justify-center">
                      <User className="w-12 h-12 text-slate-400 dark:text-slate-500" />
                    </div>
                )}
              </div>
              <div className="absolute -bottom-1 -right-1 bg-emerald-500 rounded-full p-1.5 border-2 border-white dark:border-slate-800">
                <CheckCircle className="w-4 h-4 text-white" />
              </div>
            </div>
          </motion.div>

          {/* Full Name Display */}
          <motion.div variants={sectionVariants} className="text-center">
            <h3 className="text-2xl font-bold text-slate-800 dark:text-slate-100">
              {fullName || "Full Name"}
            </h3>
            {fullNameAm && (
                <p className="text-lg text-slate-500 dark:text-slate-400">
                  {fullNameAm}
                </p>
            )}
            {step2Data?.code && (
                <p className="text-sm text-emerald-600 dark:text-emerald-400 font-medium mt-1">
                  Employee Code: {step2Data.code}
                </p>
            )}
          </motion.div>

          {/* Personal Information Section */}
          <motion.div variants={sectionVariants} className="bg-slate-50/50 dark:bg-slate-800/30 rounded-xl p-6 border border-slate-200/50 dark:border-slate-700/50">
            <div className="flex items-center gap-2 mb-4">
              <div className="p-1.5 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg">
                <User className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              </div>
              <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                Personal Information
              </h3>
              <span className="ml-auto text-xs text-slate-400 dark:text-slate-500">
              {step2Data ? 'From Database' : 'From Form'}
            </span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <InfoField
                  label="First Name"
                  value={step1Data.firstName || step2Data?.fullName?.split(' ')[0]}
              />
              <InfoField
                  label="First Name (Amharic)"
                  value={step1Data.firstNameAm || step2Data?.fullNameAm?.split(' ')[0]}
              />
              <InfoField
                  label="Middle Name"
                  value={step1Data.middleName || step2Data?.fullName?.split(' ')[1]}
              />
              <InfoField
                  label="Middle Name (Amharic)"
                  value={step1Data.middleNameAm || step2Data?.fullNameAm?.split(' ')[1]}
              />
              <InfoField
                  label="Last Name"
                  value={step1Data.lastName || step2Data?.fullName?.split(' ')[2]}
              />
              <InfoField
                  label="Last Name (Amharic)"
                  value={step1Data.lastNameAm || step2Data?.fullNameAm?.split(' ')[2]}
              />
              <InfoField
                  label="Gender"
                  value={step1Data.gender || step2Data?.gender}
                  icon={<Flag className="w-3 h-3" />}
              />
              <InfoField
                  label="Nationality"
                  value={step1Data.nationality || step2Data?.nationality}
                  icon={<Flag className="w-3 h-3" />}
              />
              <InfoField
                  label="Marital Status"
                  value={step1Data.maritalStatus || step2Data?.maritalStatus}
                  icon={<Users className="w-3 h-3" />}
              />
              <InfoField
                  label="Birth Date"
                  value={step1Data.birthDate ? new Date(step1Data.birthDate).toLocaleDateString() : step2Data?.birthDate}
                  icon={<Calendar className="w-3 h-3" />}
              />
            </div>
          </motion.div>

          {/* Employment Information Section */}
          <motion.div variants={sectionVariants} className="bg-slate-50/50 dark:bg-slate-800/30 rounded-xl p-6 border border-slate-200/50 dark:border-slate-700/50">
            <div className="flex items-center gap-2 mb-4">
              <div className="p-1.5 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                <Briefcase className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              </div>
              <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                Employment Information
              </h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <InfoField
                  label="Employee Code"
                  value={step2Data?.code || 'Will be generated'}
                  icon={<FileText className="w-3 h-3" />}
              />
              <InfoField
                  label="Employment Date"
                  value={step1Data.employmentDate ? new Date(step1Data.employmentDate).toLocaleDateString() : step2Data?.employmentDate}
                  icon={<Calendar className="w-3 h-3" />}
              />
              <InfoField
                  label="Employment Type"
                  value={step1Data.employmentType || step2Data?.employmentType}
              />
              <InfoField
                  label="Employment Nature"
                  value={step1Data.employmentNature || step2Data?.employmentNature}
              />
              <InfoField
                  label="Work Arrangement"
                  value={step1Data.workArrangement || step2Data?.workArr}
              />
              <InfoField
                  label="Department"
                  value={step2Data?.department || ''}
                  icon={<Building2 className="w-3 h-3" />}
              />
              <InfoField
                  label="Position"
                  value={step2Data?.position || ''}
                  icon={<UserCheck className="w-3 h-3" />}
              />
              <InfoField
                  label="Job Grade"
                  value={step2Data?.jobGrade || ''}
              />
              <InfoField
                  label="Branch"
                  value={step2Data?.branch || ''}
                  icon={<Building2 className="w-3 h-3" />}
              />
            </div>
          </motion.div>

          {/* Address Information Section */}
          <motion.div variants={sectionVariants} className="bg-slate-50/50 dark:bg-slate-800/30 rounded-xl p-6 border border-slate-200/50 dark:border-slate-700/50">
            <div className="flex items-center gap-2 mb-4">
              <div className="p-1.5 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                <MapPin className="w-4 h-4 text-purple-600 dark:text-purple-400" />
              </div>
              <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                Address Information
              </h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <InfoField
                  label="Address Type"
                  value={step1Data.addressType}
                  icon={<Home className="w-3 h-3" />}
              />
              <InfoField
                  label="Country"
                  value={step1Data.country || step2Data?.address?.split(',')[0]}
                  icon={<Flag className="w-3 h-3" />}
              />
              <InfoField
                  label="Region"
                  value={step1Data.region || step2Data?.address?.split(',')[1]}
              />
              <InfoField
                  label="Subcity"
                  value={step1Data.subcity || step2Data?.address?.split(',')[2]}
              />
              <InfoField
                  label="Zone"
                  value={step1Data.zone}
              />
              <InfoField
                  label="Woreda"
                  value={step1Data.woreda}
              />
              <InfoField
                  label="Kebele"
                  value={step1Data.kebele}
              />
              <InfoField
                  label="House No"
                  value={step1Data.houseNo}
                  icon={<Home className="w-3 h-3" />}
              />
              <InfoField
                  label="Telephone"
                  value={step1Data.telephone || step2Data?.telephone}
                  icon={<Phone className="w-3 h-3" />}
              />
              <InfoField
                  label="Email"
                  value={step1Data.email || step2Data?.address?.split(',')[3]?.trim()}
                  icon={<Mail className="w-3 h-3" />}
              />
              <InfoField
                  label="P.O. Box"
                  value={step1Data.poBox}
              />
              <InfoField
                  label="Fax"
                  value={step1Data.fax}
              />
              <InfoField
                  label="Website"
                  value={step1Data.website}
              />
            </div>
          </motion.div>

          {/* Guarantor Information Section (if available) */}
          {step2Data?.guaFullName && (
              <motion.div variants={sectionVariants} className="bg-slate-50/50 dark:bg-slate-800/30 rounded-xl p-6 border border-slate-200/50 dark:border-slate-700/50">
                <div className="flex items-center gap-2 mb-4">
                  <div className="p-1.5 bg-amber-100 dark:bg-amber-900/30 rounded-lg">
                    <Shield className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                  </div>
                  <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                    Guarantor Information
                  </h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <InfoField label="Full Name" value={step2Data.guaFullName} />
                  <InfoField label="Gender" value={step2Data.guaGender} />
                  <InfoField label="Nationality" value={step2Data.guaNationality} />
                  <InfoField label="Relation" value={step2Data.guaRelation} />
                  <InfoField label="Address" value={step2Data.guaAddress} />
                  <InfoField label="Telephone" value={step2Data.guaTelephone} icon={<Phone className="w-3 h-3" />} />
                </div>
              </motion.div>
          )}
        </div>

        {/* Navigation Buttons - Outside print area */}
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="flex flex-col sm:flex-row justify-between gap-4 pt-6 border-t border-slate-200 dark:border-slate-700 no-print"
        >
          <motion.button
              variants={buttonVariants}
              whileHover="hover"
              whileTap="tap"
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onBack();
              }}
              disabled={loading}
              className="px-6 py-3 border border-slate-300 dark:border-slate-600 rounded-xl text-slate-700 dark:text-slate-300 font-medium hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Back to Edit
          </motion.button>

          <div className="flex flex-col sm:flex-row gap-3">
            <motion.button
                variants={buttonVariants}
                whileHover="hover"
                whileTap="tap"
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  onPrint();
                }}
                disabled={loading}
                className="px-6 py-3 border border-blue-600 dark:border-blue-500 text-blue-600 dark:text-blue-400 rounded-xl font-medium hover:bg-blue-50 dark:hover:bg-blue-950/30 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              <Printer className="w-4 h-4" />
              Print
            </motion.button>

            <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  handleConfirm(e);
                }}
                disabled={loading || !hasData}
                className="px-8 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-xl font-medium hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer"
            >
              {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Confirming...</span>
                  </>
              ) : (
                  <>
                    <CheckCircle className="w-4 h-4" />
                    <span>Confirm & Save</span>
                  </>
              )}
            </button>
          </div>
        </motion.div>

        {/* Footer Security Note - Outside print area */}
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="text-center no-print"
        >
          <div className="inline-flex items-center gap-4 px-4 py-2 bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm rounded-full shadow-sm border border-slate-200/50 dark:border-slate-700/50">
            <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
              <Shield className="w-3 h-3" />
              <span>Information is encrypted</span>
            </div>
            <div className="w-px h-3 bg-slate-300 dark:bg-slate-600" />
            <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
              <Eye className="w-3 h-3" />
              <span>Audit trail enabled</span>
            </div>
            <div className="w-px h-3 bg-slate-300 dark:bg-slate-600" />
            <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
              <Download className="w-3 h-3" />
              <span>Ready for HR approval</span>
            </div>
          </div>
        </motion.div>
      </motion.div>
  );
};

// Info Field Component
interface InfoFieldProps {
  label: string;
  value?: string;
  icon?: React.ReactNode;
  highlight?: boolean;
}

const InfoField: React.FC<InfoFieldProps> = ({ label, value, icon, highlight }) => {
  const displayValue = value && value !== "" ? value : "Not provided";

  return (
      <div className="group">
        <div className="flex items-center gap-1.5 mb-1">
          {icon && <span className="text-slate-400 dark:text-slate-500 group-hover:text-emerald-500 transition-colors">{icon}</span>}
          <label className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide">
            {label}
          </label>
        </div>
        <p className={`text-sm font-medium ${highlight ? 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/30 px-2 py-0.5 rounded-md inline-block' : 'text-slate-800 dark:text-slate-200'}`}>
          {displayValue}
        </p>
      </div>
  );
};