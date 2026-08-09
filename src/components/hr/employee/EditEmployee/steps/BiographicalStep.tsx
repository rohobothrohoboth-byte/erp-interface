import React, { useState } from 'react';
import { useFormik } from 'formik';
import * as yup from 'yup';
import { motion, AnimatePresence } from 'framer-motion';
import PhoneInput from 'react-phone-input-2';
import 'react-phone-input-2/lib/style.css';
import {
  User,
  Calendar,
  MapPin,
  Heart,
  CreditCard,
  Banknote,
  Award,
  Globe,
  Building2,
  Home,
  Mail,
  Phone,
  Save,
  CheckCircle,
  AlertCircle,
  ChevronRight,
  Shield,
  FileText
} from 'lucide-react';
import { Input } from '../../../../../components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../../../components/ui/select';
import { MaritalStat, AddressType } from '../../../../../types/hr/enum';
import type { UUID } from 'crypto';
import type { EmpModBioDto } from '../../../../../types/hr/employee/empModDto';

interface BiographicalStepProps {
  data: Partial<EmpModBioDto>;
  onNext: (data: EmpModBioDto) => void;
  employeeId?: UUID;
  loading?: boolean;
  isEditMode?: boolean;
}

const validationSchema = yup.object({
  birthDate: yup.string().required('Birth date is required'),
  birthLocation: yup.string().required('Birth location is required'),
  motherFullName: yup.string().required("Mother's full name is required"),
  maritalStatus: yup.string().required('Marital status is required'),
  tin: yup.string().required('TIN is required'),
  bankAccountNo: yup.string().required('Bank account number is required'),
  pensionNumber: yup.string().required('Pension number is required'),
});

export const BiographicalStep: React.FC<BiographicalStepProps> = ({
                                                                    data,
                                                                    onNext,
                                                                    employeeId,
                                                                    loading = false,
                                                                    isEditMode = false
                                                                  }) => {
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [focusedField, setFocusedField] = useState<string | null>(null);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    if (document.documentElement) document.documentElement.scrollTop = 0;
    if (document.body) document.body.scrollTop = 0;
  };

  const formik = useFormik<EmpModBioDto>({
    initialValues: {
      birthDate: data.birthDate || '',
      birthLocation: data.birthLocation || '',
      motherFullName: data.motherFullName || '',
      maritalStatus: data.maritalStatus || '' as MaritalStat,
      employeeId: employeeId || data.employeeId || '' as UUID,
      tin: data.tin || '',
      bankAccountNo: data.bankAccountNo || '',
      pensionNumber: data.pensionNumber || '',
      addressType: data.addressType || '' as any,
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
      hasData: data.hasData ?? false,
      rowVersion: data.rowVersion || '',
      id: data.id || '' as UUID,
      isDeleted: data.isDeleted ?? false,
    },
    validationSchema,
    enableReinitialize: true,
    validateOnMount: false,
    onSubmit: (values) => {
      setSubmitError(null);
      setSuccessMessage('Biographical information saved successfully!');
      setTimeout(() => setSuccessMessage(null), 3000);
      scrollToTop();
      onNext(values);
    },
  });

  const getErrorMessage = (fieldName: string): string => {
    const error = formik.errors[fieldName as keyof typeof formik.errors];
    const touched = formik.touched[fieldName as keyof typeof formik.touched];
    if (touched && error) return typeof error === 'string' ? error : 'Invalid value';
    return '';
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);
    scrollToTop();
    formik.handleSubmit();
  };

  const sectionVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4 } }
  };

  return (
      <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
          className="space-y-8"
      >
        {/* Success Message Toast */}
        <AnimatePresence>
          {successMessage && (
              <motion.div
                  initial={{ opacity: 0, y: -50, scale: 0.9 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -50, scale: 0.9 }}
                  className="fixed top-20 right-4 z-50"
              >
                <div className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white px-6 py-3 rounded-xl shadow-lg flex items-center gap-3">
                  <CheckCircle className="w-5 h-5" />
                  <span className="font-medium">{successMessage}</span>
                </div>
              </motion.div>
          )}
        </AnimatePresence>

        {/* Error Display */}
        <AnimatePresence>
          {submitError && (
              <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="bg-gradient-to-r from-red-50 to-red-100 border border-red-200 rounded-xl shadow-sm"
              >
                <div className="flex items-center justify-between p-4">
                  <div className="flex items-center gap-3">
                    <div className="p-1.5 bg-red-200 rounded-lg">
                      <AlertCircle className="w-5 h-5 text-red-700" />
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-red-800">Error</h3>
                      <p className="text-sm text-red-700">{submitError}</p>
                    </div>
                  </div>
                  <button
                      onClick={() => setSubmitError(null)}
                      className="text-red-700 hover:text-red-900 transition-colors"
                  >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </motion.div>
          )}
        </AnimatePresence>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Biographical Details Section */}
          <motion.div variants={sectionVariants} initial="hidden" animate="visible" className="space-y-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl shadow-lg">
                <User className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-slate-800">Biographical Details</h3>
                <p className="text-sm text-slate-500">Personal background information</p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-slate-700">
                  Birth Location <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <Input
                      name="birthLocation"
                      value={formik.values.birthLocation}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      onFocus={() => setFocusedField('birthLocation')}
                      onBlurCapture={() => setFocusedField(null)}
                      className={`w-full pl-10 pr-4 py-2.5 border rounded-xl focus:ring-2 focus:ring-emerald-500 transition-all ${
                          getErrorMessage('birthLocation') ? 'border-red-500' : 'border-slate-200'
                      } ${focusedField === 'birthLocation' ? 'border-emerald-500 ring-2 ring-emerald-500/20' : ''}`}
                      placeholder="Addis Ababa"
                      disabled={loading}
                  />
                </div>
                {getErrorMessage('birthLocation') && (
                    <p className="text-red-500 text-xs">{getErrorMessage('birthLocation')}</p>
                )}
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-slate-700">
                  Mother's Full Name <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Heart className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <Input
                      name="motherFullName"
                      value={formik.values.motherFullName}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      onFocus={() => setFocusedField('motherFullName')}
                      onBlurCapture={() => setFocusedField(null)}
                      className={`w-full pl-10 pr-4 py-2.5 border rounded-xl focus:ring-2 focus:ring-emerald-500 transition-all ${
                          getErrorMessage('motherFullName') ? 'border-red-500' : 'border-slate-200'
                      } ${focusedField === 'motherFullName' ? 'border-emerald-500 ring-2 ring-emerald-500/20' : ''}`}
                      placeholder="Aster Kebede"
                      disabled={loading}
                  />
                </div>
                {getErrorMessage('motherFullName') && (
                    <p className="text-red-500 text-xs">{getErrorMessage('motherFullName')}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-slate-700">
                  Birth Date <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <Input
                      name="birthDate"
                      type="date"
                      value={formik.values.birthDate}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      className={`w-full pl-10 pr-4 py-2.5 border rounded-xl focus:ring-2 focus:ring-emerald-500 transition-all ${
                          getErrorMessage('birthDate') ? 'border-red-500' : 'border-slate-200'
                      }`}
                      disabled={loading}
                  />
                </div>
                {getErrorMessage('birthDate') && (
                    <p className="text-red-500 text-xs">{getErrorMessage('birthDate')}</p>
                )}
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-slate-700">
                  Marital Status <span className="text-red-500">*</span>
                </label>
                <Select
                    value={formik.values.maritalStatus}
                    onValueChange={(value: MaritalStat) => formik.setFieldValue('maritalStatus', value)}
                    disabled={loading}
                >
                  <SelectTrigger className={`w-full px-4 py-2.5 border rounded-xl focus:ring-2 focus:ring-emerald-500 ${
                      getErrorMessage('maritalStatus') ? 'border-red-500' : 'border-slate-200'
                  }`}>
                    <SelectValue placeholder="Select marital status" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(MaritalStat).map(([key, value]) => (
                        <SelectItem key={key} value={key}>{value}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {getErrorMessage('maritalStatus') && (
                    <p className="text-red-500 text-xs">{getErrorMessage('maritalStatus')}</p>
                )}
              </div>
            </div>
          </motion.div>

          {/* Financial Information Section */}
          <motion.div variants={sectionVariants} initial="hidden" animate="visible" transition={{ delay: 0.1 }} className="space-y-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl shadow-lg">
                <CreditCard className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-slate-800">Financial Information</h3>
                <p className="text-sm text-slate-500">Tax and banking details</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-slate-700">
                  TIN Number <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Shield className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <Input
                      name="tin"
                      value={formik.values.tin}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      className={`w-full pl-10 pr-4 py-2.5 border rounded-xl focus:ring-2 focus:ring-blue-500 transition-all ${
                          getErrorMessage('tin') ? 'border-red-500' : 'border-slate-200'
                      }`}
                      placeholder="000123456789"
                      disabled={loading}
                  />
                </div>
                {getErrorMessage('tin') && <p className="text-red-500 text-xs">{getErrorMessage('tin')}</p>}
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-slate-700">
                  Bank Account Number <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Banknote className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <Input
                      name="bankAccountNo"
                      value={formik.values.bankAccountNo}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      className={`w-full pl-10 pr-4 py-2.5 border rounded-xl focus:ring-2 focus:ring-blue-500 transition-all ${
                          getErrorMessage('bankAccountNo') ? 'border-red-500' : 'border-slate-200'
                      }`}
                      placeholder="100023456789"
                      disabled={loading}
                  />
                </div>
                {getErrorMessage('bankAccountNo') && <p className="text-red-500 text-xs">{getErrorMessage('bankAccountNo')}</p>}
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-slate-700">
                  Pension Number <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Award className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <Input
                      name="pensionNumber"
                      value={formik.values.pensionNumber}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      className={`w-full pl-10 pr-4 py-2.5 border rounded-xl focus:ring-2 focus:ring-blue-500 transition-all ${
                          getErrorMessage('pensionNumber') ? 'border-red-500' : 'border-slate-200'
                      }`}
                      placeholder="PEN123456789"
                      disabled={loading}
                  />
                </div>
                {getErrorMessage('pensionNumber') && <p className="text-red-500 text-xs">{getErrorMessage('pensionNumber')}</p>}
              </div>
            </div>
          </motion.div>

          {/* Address Information Section */}
          <motion.div variants={sectionVariants} initial="hidden" animate="visible" transition={{ delay: 0.2 }} className="space-y-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl shadow-lg">
                <MapPin className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-slate-800">Address Information</h3>
                <p className="text-sm text-slate-500">Contact and location details</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-slate-700">Address Type</label>
                <Select
                    value={formik.values.addressType}
                    onValueChange={(value: AddressType) => formik.setFieldValue('addressType', value)}
                    disabled={loading}
                >
                  <SelectTrigger className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-500">
                    <SelectValue placeholder="Select address type" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(AddressType).map(([key, value]) => (
                        <SelectItem key={key} value={key}>{value}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-slate-700">Country</label>
                <div className="relative">
                  <Globe className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <Input
                      name="country"
                      value={formik.values.country}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-500 transition-all"
                      placeholder="Ethiopia"
                      disabled={loading}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-slate-700">Region</label>
                <Input
                    name="region"
                    value={formik.values.region}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-500 transition-all"
                    placeholder="Addis Ababa"
                    disabled={loading}
                />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-slate-700">Subcity</label>
                <div className="relative">
                  <Building2 className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <Input
                      name="subcity"
                      value={formik.values.subcity}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-500 transition-all"
                      placeholder="Kirkos"
                      disabled={loading}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-slate-700">Zone</label>
                <Input
                    name="zone"
                    value={formik.values.zone}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-500 transition-all"
                    placeholder="Zone 3"
                    disabled={loading}
                />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-slate-700">Woreda</label>
                <Input
                    name="woreda"
                    value={formik.values.woreda}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-500 transition-all"
                    placeholder="08"
                    disabled={loading}
                />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-slate-700">Kebele</label>
                <Input
                    name="kebele"
                    value={formik.values.kebele}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-500 transition-all"
                    placeholder="09"
                    disabled={loading}
                />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-slate-700">House Number</label>
                <div className="relative">
                  <Home className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <Input
                      name="houseNo"
                      value={formik.values.houseNo}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-500 transition-all"
                      placeholder="H-123"
                      disabled={loading}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-slate-700">Telephone</label>
                <PhoneInput
                    country={'et'}
                    value={formik.values.telephone}
                    onChange={(value) => formik.setFieldValue('telephone', value)}
                    disabled={loading}
                    inputProps={{ name: 'telephone', onBlur: formik.handleBlur }}
                    containerClass="w-full"
                    inputClass="!w-full !px-4 !py-2.5 !rounded-xl !border-slate-200 focus:!ring-2 focus:!ring-purple-500"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-slate-700">Email</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <Input
                      name="email"
                      type="email"
                      value={formik.values.email}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-500 transition-all"
                      placeholder="example@email.com"
                      disabled={loading}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-slate-700">P.O. Box</label>
                <Input
                    name="poBox"
                    value={formik.values.poBox}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-500 transition-all"
                    placeholder="1234"
                    disabled={loading}
                />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-slate-700">Fax</label>
                <Input
                    name="fax"
                    value={formik.values.fax}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-500 transition-all"
                    placeholder="+251111223344"
                    disabled={loading}
                />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-slate-700">Website</label>
                <Input
                    name="website"
                    value={formik.values.website}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-500 transition-all"
                    placeholder="https://example.com"
                    disabled={loading}
                />
              </div>
            </div>
          </motion.div>

          {/* Navigation Buttons */}
          <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="flex justify-end pt-6 border-t border-slate-200"
          >
            <button
                type="submit"
                disabled={loading}
                className="group px-8 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-xl font-medium hover:shadow-lg hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {loading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Saving...
                  </>
              ) : (
                  <>
                    <Save className="w-4 h-4 group-hover:scale-110 transition-transform" />
                    Save Changes
                    <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </>
              )}
            </button>
          </motion.div>
        </form>
      </motion.div>
  );
};