import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { CheckCircle, User, Printer } from "lucide-react";
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

  // Scroll to top function
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
    if (document.documentElement) {
      document.documentElement.scrollTop = 0;
    }
    if (document.body) {
      document.body.scrollTop = 0;
    }
  };

  useEffect(() => {
    scrollToTop();
  }, []);

  // Handle confirmation
  const handleConfirm = () => {
    setSubmitError(null);
    scrollToTop();
    onConfirm();
  };

  // Format the full name - use Step 2 data if available, otherwise fallback to Step 1
  const fullName =
    step2Data?.fullName ||
    `${step1Data.firstName || ""} ${step1Data.middleName || ""} ${step1Data.lastName || ""}`.trim();
  const fullNameAm =
    step2Data?.fullNameAm ||
    `${step1Data.firstNameAm || ""} ${step1Data.middleNameAm || ""} ${step1Data.lastNameAm || ""}`.trim();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
      className="space-y-8"
    >
      {/* Error Display */}
      {submitError && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 bg-red-50 border border-red-200 rounded-xl p-4"
        >
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <svg
                className="h-5 w-5 text-red-400"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Error</h3>
              <p className="text-sm text-red-700 mt-1">{submitError}</p>
            </div>
            <div className="ml-auto pl-3">
              <button
                onClick={() => setSubmitError(null)}
                className="text-red-800 hover:text-red-900"
              >
                <svg
                  className="h-4 w-4"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
                </svg>
              </button>
            </div>
          </div>
        </motion.div>
      )}

      <div className="text-center mb-8">
        <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Review Basic Information
        </h2>
        <p className="text-gray-600">
          Please review all the information before confirming
        </p>
      </div>

      {/* Basic Information Section */}
      <div
        className="border border-gray-200 rounded-xl p-6 mb-6 print-section"
        id="basic-info-section"
      >
        <div className="flex items-center mb-4">
          <div className="flex items-center">
            <User className="w-5 h-5 text-green-600 mr-2" />
            <h3 className="text-lg font-semibold text-gray-900">
              Basic Information
            </h3>
          </div>
        </div>

        <div className="print-layout flex">
          {/* Left Column - Profile Photo and Employee Code */}
          <div className="left-column w-1/3 pr-8">
            {/* Profile Picture Preview */}
            <div className="border-dashed border-2 rounded-lg px-4 py-2 flex flex-col items-center justify-center mb-4">
              <div className="photo-section">
                {step2Data?.photo ? (
                  <img
                    src={step2Data.photo}
                    alt="Employee Profile"
                    className="employee-photo"
                  />
                ) : photo ? (
                  <img
                    src={`data:image/png;base64,${photo}`}
                    alt="Employee Profile"
                    className="employee-photo"
                  />
                ) : step1Data.File ? (
                  <div className="placeholder-photo">
                    <User className="w-12 h-12 text-gray-400" />
                    <p className="text-xs text-gray-500 mt-2">Image uploaded</p>
                  </div>
                ) : (
                  <div className="placeholder-photo">
                    <User className="w-12 h-12 text-gray-400" />
                    <p className="text-xs text-gray-500 mt-2">No photo</p>
                  </div>
                )}
              </div>
              <p className="text-sm text-gray-500 mt-2 text-center">
                Profile Photo
              </p>
            </div>

            {step2Data?.code && (
              <div className="employee-code text-center">
                <div className="bg-green-50 border border-green-200 rounded-lg px-3 py-2">
                  <span className="text-xs font-medium text-green-600">
                    Employee Code:{" "}
                  </span>
                  <span className="text-sm font-bold text-green-800">
                    {step2Data.code}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Right Column - Personal Information in 2 columns */}
          <div className="right-column w-2/3">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Left Column */}
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">
                    Full Name (English)
                  </label>
                  <p className="text-gray-900 font-medium">
                    {fullName || "Not provided"}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">
                    Gender
                  </label>
                  <p className="text-gray-900 font-medium">
                    {step2Data?.gender || step1Data.gender || "Not provided"}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">
                    Nationality
                  </label>
                  <p className="text-gray-900 font-medium">
                    {step2Data?.nationality ||
                      step1Data.nationality ||
                      "Not provided"}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">
                    Employment Date
                  </label>
                  <p className="text-gray-900 font-medium">
                    {step2Data?.employmentDate ||
                      step1Data.employmentDate ||
                      "Not provided"}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">
                    Employment Type
                  </label>
                  <p className="text-gray-900 font-medium">
                    {step2Data?.employmentType ||
                      step1Data.employmentType ||
                      "Not provided"}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">
                    Employment Nature
                  </label>
                  <p className="text-gray-900 font-medium">
                    {step2Data?.employmentNature ||
                      step1Data.employmentNature ||
                      "Not provided"}
                  </p>
                </div>
              </div>

              {/* Right Column */}
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">
                    ሙሉ ስም
                  </label>
                  <p className="text-gray-900 font-medium">
                    {fullNameAm || "Not provided"}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">
                    Department
                  </label>
                  <p className="text-gray-900 font-medium">
                    {step2Data?.department || "Not provided"}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">
                    Position
                  </label>
                  <p className="text-gray-900 font-medium">
                    {step2Data?.position || "Not provided"}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">
                    Job Grade
                  </label>
                  <p className="text-gray-900 font-medium">
                    {step2Data?.jobGrade || "Not provided"}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">
                    Branch
                  </label>
                  <p className="text-gray-900 font-medium">
                    {step2Data?.branch || "Not provided"}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">
                    Work Arrangement
                  </label>
                  <p className="text-gray-900 font-medium">
                    {step2Data?.workArrangement ||
                      step1Data.workArrangement ||
                      "Not provided"}
                  </p>
                </div>
              </div>
            </div>

            {/* Extra fields — Birth Date, Marital Status, Address */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6 pt-6 border-t border-gray-100">
              <div>
                <label className="text-sm font-medium text-gray-500">
                  Birth Date
                </label>
                <p className="text-gray-900 font-medium">
                  {step2Data?.birthDate || step1Data.birthDate || "Not provided"}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">
                  Marital Status
                </label>
                <p className="text-gray-900 font-medium">
                  {step2Data?.maritalStatus || step1Data.maritalStatus || "Not provided"}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">
                  Address
                </label>
                <p className="text-gray-900 font-medium">
                  {step2Data?.address || "Not provided"}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">
                  Telephone
                </label>
                <p className="text-gray-900 font-medium">
                  {step2Data?.telephone || step1Data.telephone || "Not provided"}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Buttons */}
      <div className="flex justify-between pt-8">
        <button
          type="button"
          onClick={onBack}
          disabled={loading}
          className="px-6 py-3 border border-gray-300 rounded-xl text-gray-700 font-medium hover:bg-gray-50 transition-colors disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed"
        >
          Back to Edit
        </button>

        <div className="flex gap-4">
          <button
            type="button"
            onClick={onPrint}
            disabled={loading}
            className="px-6 py-3 border border-blue-600 text-blue-600 rounded-xl font-medium hover:bg-blue-50 transition-colors disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed flex items-center"
          >
            <Printer className="w-5 h-5 mr-2" />
            Print
          </button>

          <button
            type="button"
            onClick={handleConfirm}
            disabled={loading}
            className="px-8 py-3 bg-green-600 text-white rounded-xl font-medium hover:bg-green-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center"
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                Confirming...
              </>
            ) : (
              <>
                <CheckCircle className="w-5 h-5 mr-2" />
                Confirm & Save
              </>
            )}
          </button>
        </div>
      </div>
    </motion.div>
  );
};
