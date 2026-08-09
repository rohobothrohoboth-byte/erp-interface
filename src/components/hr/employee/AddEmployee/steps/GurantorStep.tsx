// GuarantorStep.tsx - FULLY CORRECTED VERSION

import React, { useState, useEffect } from 'react';
import { useFormik } from 'formik';
import { motion, AnimatePresence } from 'framer-motion';
import PhoneInput from 'react-phone-input-2';
import 'react-phone-input-2/lib/style.css';
import {
  User,
  Users,
  MapPin,
  Phone,
  Mail,
  Home,
  Globe,
  Building2,
  Shield,
  CheckCircle,
  AlertCircle,
  ChevronRight,
  ChevronLeft,
  FileText,
  XCircle,
  Loader2
} from 'lucide-react';
import { GuarantorProfileUpload } from './GuarantorProfileUpload';
import { Input } from '../../../../ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../../ui/select';
import { Gender, AddressType } from '../../../../../types/hr/enum';
import type { Step2Dto, UUID } from '../../../../../types/hr/employee/empAddDto';
import EnumSelect from '../../../../ui/enumSelect';
import { Label } from '../../../../ui/label';
import { Relation } from '../../../../../types/enum';
import { zodValidate } from '../../../../../schemas/hr/employee/validateSchema';
import { guarantorSchema } from '../../../../../schemas/hr/employee/guarantorSchema';
import { useLanguage } from '../../../../../i18n/LanguageContext';
import toast from 'react-hot-toast';

// ============================================================
// TYPES
// ============================================================

interface GuarantorStepProps {
  data: Partial<Step2Dto>;
  onNext: (data: Step2Dto) => void;
  onBack: () => void;
  employeeId?: UUID;
  loading?: boolean;
}

// ============================================================
// FIELD COMPONENT
// ============================================================

const Field = ({
                 label,
                 labelAm,
                 error,
                 required,
                 children,
                 description,
                 isLoading
               }: {
  label: string;
  labelAm?: string;
  error?: string;
  required?: boolean;
  children: React.ReactNode;
  description?: string;
  isLoading?: boolean;
}) => (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
        {label}
        {labelAm && (
            <span className="text-slate-400 dark:text-slate-500 ml-1 text-xs font-normal">
          / {labelAm}
        </span>
        )}
        {required && <span className="text-red-500 ml-0.5">*</span>}
        {description && (
            <span className="text-slate-400 dark:text-slate-500 ml-1 text-xs font-normal">
          ({description})
        </span>
        )}
      </label>
      <div className={isLoading ? 'opacity-60 pointer-events-none' : ''}>
        {children}
      </div>
      {error && (
          <p className="text-red-500 text-xs flex items-center gap-1 mt-1 animate-fadeIn">
            <AlertCircle className="w-3 h-3" />
            {error}
          </p>
      )}
    </div>
);

// ============================================================
// SECTION HEADER
// ============================================================

const SectionHeader = ({
                         icon,
                         title,
                         subtitle,
                         gradient
                       }: {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  gradient: string;
}) => (
    <div className="flex items-center gap-3">
      <div className={`p-2 bg-gradient-to-br ${gradient} rounded-xl shadow-lg`}>
        {icon}
      </div>
      <div>
        <h3 className="text-xl font-bold text-slate-800 dark:text-slate-200">
          {title}
        </h3>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          {subtitle}
        </p>
      </div>
    </div>
);

// ============================================================
// MAIN COMPONENT
// ============================================================

export const GuarantorStep: React.FC<GuarantorStepProps> = ({
                                                              data,
                                                              onNext,
                                                              onBack,
                                                              employeeId,
                                                              loading = false,
                                                            }) => {
  const { t } = useLanguage();
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [errorSummary, setErrorSummary] = useState<string[]>([]);
  const [submitAttempted, setSubmitAttempted] = useState(false);

  // ============================================================
  // SCROLL TO TOP
  // ============================================================

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    if (document.documentElement) document.documentElement.scrollTop = 0;
    if (document.body) document.body.scrollTop = 0;
  };

  // ============================================================
  // FORMIK
  // ============================================================

  const formik = useFormik<Step2Dto>({
    initialValues: {
      firstName: data.firstName || '',
      middleName: data.middleName || '',
      lastName: data.lastName || '',
      nationality: data.nationality || '',
      gender: data.gender || '' as Gender,
      relation: data.relation || '',
      employeeId: employeeId || data.employeeId || '' as UUID,
      addressType: data.addressType || '' as AddressType,
      country: data.country || '',
      region: data.region || '',
      subcity: data.subcity || '',
      zone: data.zone || '',
      woreda: data.woreda || '',
      kebele: data.kebele || '',
      houseNo: data.houseNo || '',
      telephone: data.telephone || '',
      poBox: data.poBox || '',
      fax: data.fax || '',
      email: data.email || '',
      website: data.website || '',
      File: data.File || null,
    },
    validate: zodValidate(guarantorSchema),
    enableReinitialize: true,
    validateOnMount: false,
    validateOnChange: true,
    validateOnBlur: true,
    onSubmit: async (values) => {
      setSubmitError(null);
      setErrorSummary([]);
      setSubmitAttempted(true);

      // ✅ Manually validate all fields
      const errors = guarantorSchema.safeParse(values);
      if (!errors.success) {
        // Mark all fields as touched to show errors
        const allFields = Object.keys(formik.values);
        allFields.forEach(field => {
          formik.setFieldTouched(field, true);
        });
        // Build error summary
        const errorMessages: string[] = errors.error.errors.map(err =>
            `${err.path.join('.')}: ${err.message}`
        );
        setErrorSummary(errorMessages);
        toast.error(`Please fix ${errorMessages.length} validation error(s)`);
        return;
      }

      try {
        if (!values.employeeId) {
          const msg = 'Employee ID is missing. Please complete Step 1 first.';
          setSubmitError(msg);
          setErrorSummary([msg]);
          toast.error(msg);
          return;
        }

        await onNext(values);
        toast.success(t.guarantorInfoSaved || 'Guarantor information saved successfully!');
        scrollToTop();
      } catch (error: any) {
        const errorMessage = error.message || 'Failed to save guarantor information. Please try again.';
        setSubmitError(errorMessage);
        setErrorSummary([errorMessage]);
        toast.error(errorMessage);
        scrollToTop();
      }
    },
  });

  // ============================================================
  // GET ERROR MESSAGE
  // ============================================================

  const getErrorMessage = (fieldName: string): string => {
    const error = formik.errors[fieldName as keyof typeof formik.errors];
    const touched = formik.touched[fieldName as keyof typeof formik.touched];
    if ((touched || submitAttempted) && error) {
      return typeof error === 'string' ? error : 'Invalid value';
    }
    return '';
  };

  // ============================================================
  // EFFECT: Sync employeeId
  // ============================================================

  useEffect(() => {
    if (employeeId && employeeId !== formik.values.employeeId) {
      formik.setFieldValue('employeeId', employeeId);
    }
  }, [employeeId, formik]);

  // ============================================================
  // HANDLERS
  // ============================================================

  const handlePhoneChange = (value: string) => {
    formik.setFieldValue('telephone', value);
    formik.setFieldTouched('telephone', true);
  };

  const handleGuarantorFileSelect = (file: File) => {
    formik.setFieldValue('File', file);
    toast.success('Document uploaded successfully');
  };

  const handleGuarantorFileRemove = () => {
    formik.setFieldValue('File', null);
    toast.success('Document removed');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation();

    setSubmitError(null);
    setErrorSummary([]);
    setSubmitAttempted(true);

    // Validate all fields
    const errors = await formik.validateForm();

    if (Object.keys(errors).length > 0) {
      // Set all fields as touched to show errors
      const allTouched = Object.keys(formik.values).reduce((acc, key) => {
        acc[key as keyof Step2Dto] = true;
        return acc;
      }, {} as Record<keyof Step2Dto, boolean>);
      formik.setTouched(allTouched);

      // Build error summary
      const errorMessages: string[] = [];
      Object.entries(errors).forEach(([field, error]) => {
        if (typeof error === 'string') {
          errorMessages.push(`${field}: ${error}`);
        } else if (Array.isArray(error)) {
          error.forEach((msg: string) => {
            errorMessages.push(`${field}: ${msg}`);
          });
        }
      });

      setErrorSummary(errorMessages);
      toast.error(`Please fix ${errorMessages.length} error(s)`);
      scrollToTop();
      return;
    }

    // Check if employeeId is present
    if (!formik.values.employeeId) {
      const msg = 'Employee ID is missing. Please go back to Step 1.';
      setSubmitError(msg);
      setErrorSummary([msg]);
      toast.error(msg);
      scrollToTop();
      return;
    }

    // Submit the form
    formik.handleSubmit();
  };

  const handleBackClick = () => {
    scrollToTop();
    onBack();
  };

  const clearError = () => {
    setSubmitError(null);
    setErrorSummary([]);
    setSubmitAttempted(false);
  };

  // ============================================================
  // ANIMATION VARIANTS
  // ============================================================

  const sectionVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4 } }
  };

  // ============================================================
  // GET VALIDATION SUMMARY
  // ============================================================

  const validationErrors = formik.errors;
  const hasValidationErrors = Object.keys(validationErrors).length > 0 && submitAttempted;

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
        {/* Validation Error Summary */}
        <AnimatePresence>
          {hasValidationErrors && (
              <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="bg-gradient-to-r from-red-50 to-red-100 dark:from-red-950/30 dark:to-red-900/30 border border-red-200 dark:border-red-800 rounded-xl overflow-hidden"
              >
                <div className="flex items-center justify-between p-4 border-b border-red-200 dark:border-red-800">
                  <div className="flex items-center gap-3">
                    <div className="p-1.5 bg-red-200 dark:bg-red-900/50 rounded-lg">
                      <AlertCircle className="w-5 h-5 text-red-700 dark:text-red-400" />
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-red-800 dark:text-red-300">
                        {t.validationErrors || 'Validation Errors'}
                      </h3>
                      <p className="text-xs text-red-600 dark:text-red-400">
                        {errorSummary.length > 0
                            ? `${errorSummary.length} error(s) found`
                            : t.pleaseFixErrors || 'Please fix the errors below'}
                      </p>
                    </div>
                  </div>
                  <button
                      onClick={clearError}
                      className="text-red-700 dark:text-red-400 hover:text-red-900 dark:hover:text-red-300 transition-colors"
                  >
                    <XCircle className="w-5 h-5" />
                  </button>
                </div>
                <div className="p-4 space-y-2 max-h-60 overflow-y-auto">
                  {errorSummary.length > 0 ? (
                      errorSummary.map((err, index) => (
                          <div key={index} className="flex items-start gap-2 text-sm text-red-700 dark:text-red-400">
                            <span className="text-red-500 mt-0.5">•</span>
                            <span>{err}</span>
                          </div>
                      ))
                  ) : (
                      <p className="text-sm text-red-700 dark:text-red-400">{submitError}</p>
                  )}
                </div>
              </motion.div>
          )}
        </AnimatePresence>

        {/* Submit Error */}
        <AnimatePresence>
          {submitError && !hasValidationErrors && (
              <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="bg-gradient-to-r from-red-50 to-red-100 dark:from-red-950/30 dark:to-red-900/30 border border-red-200 dark:border-red-800 rounded-xl p-4"
              >
                <div className="flex items-center gap-3">
                  <AlertCircle className="w-5 h-5 text-red-700 dark:text-red-400" />
                  <p className="text-sm text-red-700 dark:text-red-400">{submitError}</p>
                </div>
              </motion.div>
          )}
        </AnimatePresence>

        <form onSubmit={handleSubmit} className="space-y-8" noValidate>
          {/* Hero Header */}
          <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
              className="relative"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/10 to-purple-500/10 rounded-2xl blur-xl" />
            <div className="relative bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-950/30 dark:to-purple-950/30 rounded-2xl p-6 border border-indigo-100 dark:border-indigo-800">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl shadow-lg">
                  <Shield className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-200">
                    {t.guarantorInformation || 'Guarantor Information'}
                  </h2>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                    {t.guarantorDescription || 'Provide details about the employee\'s guarantor for financial security'}
                  </p>
                  {formik.values.employeeId && (
                      <p className="text-xs text-indigo-600 dark:text-indigo-400 mt-1">
                        Employee ID: {formik.values.employeeId}
                      </p>
                  )}
                </div>
              </div>
            </div>
          </motion.div>

          {/* Guarantor Information Section */}
          <motion.div variants={sectionVariants} initial="hidden" animate="visible" className="space-y-6">
            <SectionHeader
                icon={<User className="w-5 h-5 text-white" />}
                title={t.personalDetails || 'Personal Details'}
                subtitle={t.guarantorBasicInfo || 'Basic information about the guarantor'}
                gradient="from-indigo-500 to-purple-600"
            />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
              <Field
                  label={t.firstName || 'First Name'}
                  required
                  error={getErrorMessage('firstName')}
              >
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <Input
                      name="firstName"
                      value={formik.values.firstName}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      className={`w-full pl-10 pr-4 py-2.5 border rounded-xl focus:ring-2 focus:ring-indigo-500 dark:bg-slate-800 dark:border-slate-700 transition-all ${
                          getErrorMessage('firstName') ? 'border-red-500' : 'border-slate-200'
                      }`}
                      placeholder="John"
                      disabled={loading}
                  />
                </div>
              </Field>

              <Field
                  label={t.middleName || 'Middle Name'}
                  required
                  error={getErrorMessage('middleName')}
              >
                <Input
                    name="middleName"
                    value={formik.values.middleName}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    className={`w-full px-4 py-2.5 border rounded-xl focus:ring-2 focus:ring-indigo-500 dark:bg-slate-800 dark:border-slate-700 transition-all ${
                        getErrorMessage('middleName') ? 'border-red-500' : 'border-slate-200'
                    }`}
                    placeholder="Michael"
                    disabled={loading}
                />
              </Field>

              <Field
                  label={t.lastName || 'Last Name'}
                  required
                  error={getErrorMessage('lastName')}
              >
                <Input
                    name="lastName"
                    value={formik.values.lastName}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    className={`w-full px-4 py-2.5 border rounded-xl focus:ring-2 focus:ring-indigo-500 dark:bg-slate-800 dark:border-slate-700 transition-all ${
                        getErrorMessage('lastName') ? 'border-red-500' : 'border-slate-200'
                    }`}
                    placeholder="Doe"
                    disabled={loading}
                />
              </Field>

              <Field
                  label={t.nationality || 'Nationality'}
                  required
                  error={getErrorMessage('nationality')}
              >
                <div className="relative">
                  <Globe className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <Input
                      name="nationality"
                      value={formik.values.nationality}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      className={`w-full pl-10 pr-4 py-2.5 border rounded-xl focus:ring-2 focus:ring-indigo-500 dark:bg-slate-800 dark:border-slate-700 transition-all ${
                          getErrorMessage('nationality') ? 'border-red-500' : 'border-slate-200'
                      }`}
                      placeholder="Ethiopian"
                      disabled={loading}
                  />
                </div>
              </Field>

              <Field
                  label={t.gender || 'Gender'}
                  required
                  error={getErrorMessage('gender')}
              >
                <Select
                    value={formik.values.gender ?? ''}
                    onValueChange={(value: Gender) => formik.setFieldValue('gender', value)}
                    disabled={loading}
                >
                  <SelectTrigger className={`w-full px-4 py-2.5 border rounded-xl focus:ring-2 focus:ring-indigo-500 dark:bg-slate-800 dark:border-slate-700 ${
                      getErrorMessage('gender') ? 'border-red-500' : 'border-slate-200'
                  }`}>
                    <SelectValue placeholder={t.selectGender || "Select gender"} />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(Gender).map(([key, value]) => (
                        <SelectItem key={key} value={key}>{value}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>

              <Field
                  label={t.relation || 'Relation'}
                  required
                  error={getErrorMessage('relation')}
              >
                <div className="relative">
                  <Users className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400 z-10" />
                  <EnumSelect
                      enumObject={Relation}
                      value={formik.values.relation}
                      onChange={(value) => formik.setFieldValue('relation', value)}
                      placeholder={t.selectRelation || "Select Relation"}
                      disabled={loading}
                      className={`pl-10 ${getErrorMessage('relation') ? 'border-red-500' : ''}`}
                  />
                </div>
              </Field>
            </div>
          </motion.div>

          {/* Address Information Section */}
          <motion.div variants={sectionVariants} initial="hidden" animate="visible" transition={{ delay: 0.1 }} className="space-y-6">
            <SectionHeader
                icon={<MapPin className="w-5 h-5 text-white" />}
                title={t.contactAddress || 'Contact Address'}
                subtitle={t.guarantorAddressDesc || 'Guarantor\'s address and contact details'}
                gradient="from-blue-500 to-cyan-600"
            />

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              <Field
                  label={t.addressType || 'Address Type'}
                  required
                  error={getErrorMessage('addressType')}
              >
                <Select
                    value={formik.values.addressType}
                    onValueChange={(value: AddressType) => formik.setFieldValue('addressType', value)}
                    disabled={loading}
                >
                  <SelectTrigger className={`w-full px-4 py-2.5 border rounded-xl focus:ring-2 focus:ring-blue-500 dark:bg-slate-800 dark:border-slate-700 ${
                      getErrorMessage('addressType') ? 'border-red-500' : 'border-slate-200'
                  }`}>
                    <SelectValue placeholder={t.selectAddressType || "Select address type"} />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(AddressType).map(([key, value]) => (
                        <SelectItem key={key} value={key}>{value}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>

              <Field
                  label={t.country || 'Country'}
                  required
                  error={getErrorMessage('country')}
              >
                <div className="relative">
                  <Globe className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <Input
                      name="country"
                      value={formik.values.country}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      className={`w-full pl-10 pr-4 py-2.5 border rounded-xl focus:ring-2 focus:ring-blue-500 dark:bg-slate-800 dark:border-slate-700 transition-all ${
                          getErrorMessage('country') ? 'border-red-500' : 'border-slate-200'
                      }`}
                      placeholder="Ethiopia"
                      disabled={loading}
                  />
                </div>
              </Field>

              <Field
                  label={t.region || 'Region'}
                  required
                  error={getErrorMessage('region')}
              >
                <Input
                    name="region"
                    value={formik.values.region}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    className={`w-full px-4 py-2.5 border rounded-xl focus:ring-2 focus:ring-blue-500 dark:bg-slate-800 dark:border-slate-700 transition-all ${
                        getErrorMessage('region') ? 'border-red-500' : 'border-slate-200'
                    }`}
                    placeholder="Addis Ababa"
                    disabled={loading}
                />
              </Field>

              <Field
                  label={t.telephone || 'Telephone'}
                  required
                  error={getErrorMessage('telephone')}
              >
                <PhoneInput
                    country={'et'}
                    value={formik.values.telephone}
                    onChange={handlePhoneChange}
                    disabled={loading}
                    inputProps={{ name: 'telephone', onBlur: formik.handleBlur }}
                    containerClass="w-full"
                    inputClass={`!w-full !px-4 !py-2.5 !rounded-xl !border-slate-200 dark:!border-slate-700 dark:!bg-slate-800 dark:!text-white focus:!ring-2 focus:!ring-blue-500 ${
                        getErrorMessage('telephone') ? '!border-red-500' : ''
                    }`}
                />
              </Field>

              <Field label={t.subcity || 'Subcity'}>
                <div className="relative">
                  <Building2 className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <Input
                      name="subcity"
                      value={formik.values.subcity}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      className="w-full pl-10 pr-4 py-2.5 border border-slate-200 dark:border-slate-700 dark:bg-slate-800 rounded-xl focus:ring-2 focus:ring-blue-500 transition-all"
                      placeholder="Kirkos"
                      disabled={loading}
                  />
                </div>
              </Field>

              <Field label={t.zone || 'Zone'}>
                <Input
                    name="zone"
                    value={formik.values.zone}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    className="w-full px-4 py-2.5 border border-slate-200 dark:border-slate-700 dark:bg-slate-800 rounded-xl focus:ring-2 focus:ring-blue-500 transition-all"
                    placeholder="Zone 3"
                    disabled={loading}
                />
              </Field>

              <Field label={t.woreda || 'Woreda'}>
                <Input
                    name="woreda"
                    value={formik.values.woreda}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    className="w-full px-4 py-2.5 border border-slate-200 dark:border-slate-700 dark:bg-slate-800 rounded-xl focus:ring-2 focus:ring-blue-500 transition-all"
                    placeholder="08"
                    disabled={loading}
                />
              </Field>

              <Field label={t.kebele || 'Kebele'}>
                <Input
                    name="kebele"
                    value={formik.values.kebele}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    className="w-full px-4 py-2.5 border border-slate-200 dark:border-slate-700 dark:bg-slate-800 rounded-xl focus:ring-2 focus:ring-blue-500 transition-all"
                    placeholder="09"
                    disabled={loading}
                />
              </Field>

              <Field label={t.houseNumber || 'House Number'}>
                <div className="relative">
                  <Home className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <Input
                      name="houseNo"
                      value={formik.values.houseNo}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      className="w-full pl-10 pr-4 py-2.5 border border-slate-200 dark:border-slate-700 dark:bg-slate-800 rounded-xl focus:ring-2 focus:ring-blue-500 transition-all"
                      placeholder="H-123"
                      disabled={loading}
                  />
                </div>
              </Field>

              <Field label={t.email || 'Email'}>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <Input
                      name="email"
                      type="email"
                      value={formik.values.email}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      className="w-full pl-10 pr-4 py-2.5 border border-slate-200 dark:border-slate-700 dark:bg-slate-800 rounded-xl focus:ring-2 focus:ring-blue-500 transition-all"
                      placeholder="example@email.com"
                      disabled={loading}
                  />
                </div>
                {getErrorMessage('email') && (
                    <p className="text-red-500 text-xs flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" />
                      {getErrorMessage('email')}
                    </p>
                )}
              </Field>

              <Field label={t.poBox || 'P.O. Box'}>
                <Input
                    name="poBox"
                    value={formik.values.poBox}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    className="w-full px-4 py-2.5 border border-slate-200 dark:border-slate-700 dark:bg-slate-800 rounded-xl focus:ring-2 focus:ring-blue-500 transition-all"
                    placeholder="1234"
                    disabled={loading}
                />
              </Field>

              <Field label={t.fax || 'Fax'}>
                <Input
                    name="fax"
                    value={formik.values.fax}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    className="w-full px-4 py-2.5 border border-slate-200 dark:border-slate-700 dark:bg-slate-800 rounded-xl focus:ring-2 focus:ring-blue-500 transition-all"
                    placeholder="+251111223344"
                    disabled={loading}
                />
              </Field>

              <Field label={t.website || 'Website'}>
                <Input
                    name="website"
                    value={formik.values.website}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    className="w-full px-4 py-2.5 border border-slate-200 dark:border-slate-700 dark:bg-slate-800 rounded-xl focus:ring-2 focus:ring-blue-500 transition-all"
                    placeholder="https://example.com"
                    disabled={loading}
                />
              </Field>
            </div>
          </motion.div>

          {/* Document Upload Section */}
          <motion.div variants={sectionVariants} initial="hidden" animate="visible" transition={{ delay: 0.2 }} className="space-y-6">
            <SectionHeader
                icon={<FileText className="w-5 h-5 text-white" />}
                title={t.supportingDocument || 'Supporting Document'}
                subtitle={t.guarantorDocumentDesc || 'Upload guarantor identification or supporting document'}
                gradient="from-amber-500 to-orange-600"
            />

            <div className="flex justify-center">
              <div className="w-full max-w-2xl">
                <GuarantorProfileUpload
                    guarantorFile={formik.values.File ?? null}
                    onGuarantorFileSelect={handleGuarantorFileSelect}
                    onGuarantorFileRemove={handleGuarantorFileRemove}
                    guarantorName={`${formik.values.firstName} ${formik.values.lastName}`}
                    guarantorNameAm={undefined}
                    maxSize={10}
                    acceptedTypes={[
                      "image/jpeg",
                      "image/png",
                      "image/jpg",
                      "application/pdf",
                      "application/msword",
                      "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                    ]}
                />
              </div>
            </div>
          </motion.div>

          {/* Navigation Buttons */}
          <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="flex justify-between pt-6 border-t border-slate-200 dark:border-slate-700"
          >
            <button
                type="button"
                onClick={handleBackClick}
                disabled={loading}
                className="group px-8 py-3 border border-slate-300 dark:border-slate-600 rounded-xl text-slate-700 dark:text-slate-300 font-medium hover:bg-slate-50 dark:hover:bg-slate-800 hover:border-slate-400 dark:hover:border-slate-500 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
              {t.back || 'Back'}
            </button>
            <button
                type="submit"
                disabled={loading}
                className="group px-8 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-medium hover:shadow-lg hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    {t.saving || 'Saving...'}
                  </>
              ) : (
                  <>
                    {t.saveAndContinue || 'Save & Continue'}
                    <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </>
              )}
            </button>
          </motion.div>
        </form>

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
            <span className="text-xs text-slate-500 dark:text-slate-400">{t.documentVerified || 'Document verified'}</span>
          </div>
        </motion.div>
      </motion.div>
  );
};

export default GuarantorStep;