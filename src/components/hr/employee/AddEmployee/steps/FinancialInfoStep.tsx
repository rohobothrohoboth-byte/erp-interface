import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { FormikProps } from "formik";
import { Input } from "../../../../ui/input";
import {
  DollarSign,
  CreditCard,
  Shield,
  Building2,
  Wallet,
  TrendingUp,
  Lock,
  AlertCircle
} from "lucide-react";
import type { RelationDto, AddressDto } from "../../../../../types/hr/employee";
import type { ExtendedEmployeeData } from "../AddEmployeeStepForm";

interface FinancialStepProps {
  formikProps: FormikProps<ExtendedEmployeeData>;
  mockRelations: RelationDto[];
  mockAddresses: AddressDto[];
  guarantorFiles: File[];
  stampFiles: File[];
  signatureFiles: File[];
  onGuarantorFileSelect: (file: File) => void;
  onStampFileSelect: (file: File) => void;
  onSignatureFileSelect: (file: File) => void;
  onGuarantorFileRemove: () => void;
  onStampFileRemove: () => void;
  onSignatureFileRemove: () => void;
}

export const FinancialStep: React.FC<FinancialStepProps> = ({
                                                              formikProps,
                                                            }) => {
  const { errors, touched, values, handleChange, handleBlur } = formikProps;

  const inputClassName = (fieldName: string) =>
      `w-full px-4 py-2.5 border rounded-xl focus:ring-2 focus:ring-emerald-500 transition-all duration-200 ${
          getNestedError(errors, fieldName) && getNestedTouched(touched, fieldName)
              ? "border-red-500"
              : "border-slate-200"
      }`;

  const getNestedError = (errorObj: any, path: string) => {
    return path.split(".").reduce((obj, key) => obj && obj[key], errorObj);
  };

  const getNestedTouched = (touchedObj: any, path: string) => {
    return path.split(".").reduce((obj, key) => obj && obj[key], touchedObj);
  };

  // Section animation variants
  const sectionVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4 } }
  };

  // Helper to format number display
  const formatNumber = (value: string) => {
    if (!value) return '';
    return value.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  };

  return (
      <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
          className="space-y-8"
      >
        {/* Hero Header */}
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="relative"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/10 to-teal-500/10 rounded-2xl blur-xl" />
          <div className="relative bg-gradient-to-br from-emerald-50 to-teal-50 rounded-2xl p-6 border border-emerald-100">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl shadow-lg">
                <DollarSign className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-slate-800">Financial & Banking Information</h2>
                <p className="text-sm text-slate-500 mt-1">
                  Enter the employee's financial and banking details for payroll processing
                </p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Financial Information Section */}
        <motion.div
            variants={sectionVariants}
            initial="hidden"
            animate="visible"
            className="space-y-6"
        >
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl shadow-lg">
              <CreditCard className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-slate-800">Financial Details</h3>
              <p className="text-sm text-slate-500">Tax, banking, and pension information</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {/* TIN Number Card */}
            <div className="group">
              <div className="relative bg-white rounded-xl border border-slate-200 p-5 hover:shadow-md transition-all duration-300">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-gradient-to-br from-purple-100 to-purple-200 rounded-lg group-hover:scale-110 transition-transform">
                    <Shield className="w-4 h-4 text-purple-600" />
                  </div>
                  <label className="text-sm font-semibold text-slate-700">
                    TIN Number
                  </label>
                </div>
                <Input
                    id="financialData.tin"
                    name="financialData.tin"
                    type="text"
                    value={values.financialData.tin}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    className={inputClassName("financialData.tin")}
                    placeholder="1234567890"
                />
                {getNestedError(errors, "financialData.tin") &&
                    getNestedTouched(touched, "financialData.tin") && (
                        <p className="text-red-500 text-xs mt-2 flex items-center gap-1">
                          <AlertCircle className="w-3 h-3" />
                          {getNestedError(errors, "financialData.tin")}
                        </p>
                    )}
              </div>
            </div>

            {/* Bank Account Number Card */}
            <div className="group">
              <div className="relative bg-white rounded-xl border border-slate-200 p-5 hover:shadow-md transition-all duration-300">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-gradient-to-br from-blue-100 to-blue-200 rounded-lg group-hover:scale-110 transition-transform">
                    <Building2 className="w-4 h-4 text-blue-600" />
                  </div>
                  <label className="text-sm font-semibold text-slate-700">
                    Bank Account Number
                  </label>
                </div>
                <Input
                    id="financialData.bankAccountNo"
                    name="financialData.bankAccountNo"
                    type="text"
                    value={values.financialData.bankAccountNo}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    className={inputClassName("financialData.bankAccountNo")}
                    placeholder="100023456789"
                />
                {values.financialData.bankAccountNo && (
                    <p className="text-xs text-slate-400 mt-2">
                      Account number: {formatNumber(values.financialData.bankAccountNo.slice(-4))}
                    </p>
                )}
              </div>
            </div>

            {/* Pension Number Card */}
            <div className="group">
              <div className="relative bg-white rounded-xl border border-slate-200 p-5 hover:shadow-md transition-all duration-300">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-gradient-to-br from-orange-100 to-orange-200 rounded-lg group-hover:scale-110 transition-transform">
                    <Wallet className="w-4 h-4 text-orange-600" />
                  </div>
                  <label className="text-sm font-semibold text-slate-700">
                    Pension Number
                  </label>
                </div>
                <Input
                    id="financialData.pensionNumber"
                    name="financialData.pensionNumber"
                    type="text"
                    value={values.financialData.pensionNumber}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    className={inputClassName("financialData.pensionNumber")}
                    placeholder="PEN123456789"
                />
              </div>
            </div>
          </div>

          {/* Quick Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
            <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-4 border border-purple-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-purple-600 font-medium">Tax ID Status</p>
                  <p className="text-sm font-semibold text-purple-900 mt-1">
                    {values.financialData.tin ? 'Registered' : 'Not Registered'}
                  </p>
                </div>
                <Shield className={`w-8 h-8 ${values.financialData.tin ? 'text-purple-500' : 'text-purple-300'}`} />
              </div>
            </div>

            <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-4 border border-blue-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-blue-600 font-medium">Bank Account</p>
                  <p className="text-sm font-semibold text-blue-900 mt-1">
                    {values.financialData.bankAccountNo ? 'Linked' : 'Not Linked'}
                  </p>
                </div>
                <Building2 className={`w-8 h-8 ${values.financialData.bankAccountNo ? 'text-blue-500' : 'text-blue-300'}`} />
              </div>
            </div>

            <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl p-4 border border-orange-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-orange-600 font-medium">Pension Status</p>
                  <p className="text-sm font-semibold text-orange-900 mt-1">
                    {values.financialData.pensionNumber ? 'Active' : 'Inactive'}
                  </p>
                </div>
                <Wallet className={`w-8 h-8 ${values.financialData.pensionNumber ? 'text-orange-500' : 'text-orange-300'}`} />
              </div>
            </div>
          </div>

          {/* Information Note */}
          <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-4 border border-blue-100"
          >
            <div className="flex items-start gap-3">
              <div className="p-1.5 bg-blue-100 rounded-lg">
                <Lock className="w-4 h-4 text-blue-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-blue-800">Secure Financial Information</p>
                <p className="text-xs text-blue-600 mt-1">
                  All financial data is encrypted and securely stored. This information is used exclusively for payroll and tax purposes.
                </p>
              </div>
            </div>
          </motion.div>
        </motion.div>

        {/* Placeholder for Guarantors Section (commented out) */}
        {/*
      <motion.div variants={sectionVariants} className="space-y-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gradient-to-br from-amber-500 to-orange-600 rounded-xl shadow-lg">
            <Users className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-slate-800">Guarantors</h3>
            <p className="text-sm text-slate-500">Add employee guarantors</p>
          </div>
        </div>
        {/* Guarantor content would go here */}
        {/* </motion.div>
      */}

        {/* Footer Stats */}
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="flex justify-between items-center pt-6 border-t border-slate-200"
        >
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
              <span className="text-xs text-slate-500">Data encrypted</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
              <span className="text-xs text-slate-500">Secure connection</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse" />
              <span className="text-xs text-slate-500">PCI compliant</span>
            </div>
          </div>
          <div className="text-xs text-slate-400">
            All fields are optional unless marked otherwise
          </div>
        </motion.div>
      </motion.div>
  );
};