import React, { useState } from 'react';
import { useFormik } from 'formik';
import * as yup from 'yup';
import { motion } from 'framer-motion';
import PhoneInput from 'react-phone-input-2';
import 'react-phone-input-2/lib/style.css';
import { Input } from '../../../../../components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../../../components/ui/select';
import { MaritalStat, AddressType } from '../../../../../types/hr/enum';
import type { Step2Dto } from '../../../../../types/hr/employee/empAddDto';
import type { UUID } from 'crypto';

interface BiographicalStepProps {
  data: Partial<Step2Dto>;
  onNext: (data: Step2Dto) => void;
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

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    
    if (document.documentElement) {
      document.documentElement.scrollTop = 0;
    }
    
    if (document.body) {
      document.body.scrollTop = 0;
    }
  };

  const formik = useFormik<Step2Dto>({
    initialValues: {
      birthDate: data.birthDate || '',
      birthLocation: data.birthLocation || '',
      motherFullName: data.motherFullName || '',
      maritalStatus: data.maritalStatus || '' as MaritalStat,
      employeeId: employeeId || data.employeeId || '' as UUID,
      tin: data.tin || '',
      bankAccountNo: data.bankAccountNo || '',
      pensionNumber: data.pensionNumber || '',
      // Address fields are excluded for edit mode - will be edited in profile settings
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
    },
    validationSchema,
    enableReinitialize: true,
    validateOnMount: false,
    onSubmit: (values) => {
      setSubmitError(null);
      scrollToTop();
      onNext(values);
    },
  });

  const getErrorMessage = (fieldName: string): string => {
    const error = formik.errors[fieldName as keyof typeof formik.errors];
    const touched = formik.touched[fieldName as keyof typeof formik.touched];
    
    if (touched && error) {
      return typeof error === 'string' ? error : 'Invalid value';
    }
    return '';
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);
    scrollToTop();
    formik.handleSubmit();
  };

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
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z" clipRule="evenodd" />
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
                <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
                </svg>
              </button>
            </div>
          </div>
        </motion.div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Biographical Details Section */}
        <div className="space-y-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-2 h-8 bg-gradient-to-b from-green-400 to-green-600 rounded-full"></div>
            <h3 className="text-xl font-semibold text-gray-800">Biographical Details</h3>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Birth Location */}
            <div className="space-y-2">
              <label htmlFor="birthLocation" className="block text-sm font-medium text-gray-700 mb-1">
                Birth Location *
              </label>
              <Input
                id="birthLocation"
                name="birthLocation"
                value={formik.values.birthLocation}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                className={`w-full px-3 py-2 border focus:outline-none focus:border-green-500 focus:outline-2 rounded-md transition-colors duration-200 ${
                  getErrorMessage('birthLocation') ? "border-red-500" : "border-gray-300"
                }`}
                placeholder="Addis Ababa"
                disabled={loading}
              />
              {getErrorMessage('birthLocation') && (
                <div className="text-red-500 text-xs mt-1">{getErrorMessage('birthLocation')}</div>
              )}
            </div>

            {/* Mother's Full Name */}
            <div className="space-y-2">
              <label htmlFor="motherFullName" className="block text-sm font-medium text-gray-700 mb-1">
                Mother's Full Name *
              </label>
              <Input
                id="motherFullName"
                name="motherFullName"
                value={formik.values.motherFullName}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                className={`w-full px-3 py-2 border focus:outline-none focus:border-green-500 focus:outline-2 rounded-md transition-colors duration-200 ${
                  getErrorMessage('motherFullName') ? "border-red-500" : "border-gray-300"
                }`}
                placeholder="Aster Kebede"
                disabled={loading}
              />
              {getErrorMessage('motherFullName') && (
                <div className="text-red-500 text-xs mt-1">{getErrorMessage('motherFullName')}</div>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Birth Date */}
            <div className="space-y-2">
              <label htmlFor="birthDate" className="block text-sm font-medium text-gray-700 mb-1">
                Birth Date *
              </label>
              <Input
                id="birthDate"
                name="birthDate"
                type="date"
                value={formik.values.birthDate}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                className={`w-full px-3 py-2 border focus:outline-none focus:border-green-500 focus:outline-2 rounded-md transition-colors duration-200 ${
                  getErrorMessage('birthDate') ? "border-red-500" : "border-gray-300"
                }`}
                disabled={loading}
              />
              {getErrorMessage('birthDate') && (
                <div className="text-red-500 text-xs mt-1">{getErrorMessage('birthDate')}</div>
              )}
            </div>

            {/* Marital Status */}
            <div className="space-y-2">
              <label htmlFor="maritalStatus" className="block text-sm font-medium text-gray-700 mb-1">
                Marital Status *
              </label>
              <Select
                value={formik.values.maritalStatus}
                onValueChange={(value: MaritalStat) => formik.setFieldValue('maritalStatus', value)}
                disabled={loading}
              >
                <SelectTrigger className={`w-full px-3 py-2 border focus:outline-none focus:border-green-500 focus:outline-2 rounded-md transition-colors duration-200 ${
                  getErrorMessage('maritalStatus') ? "border-red-500" : "border-gray-300"
                }`}>
                  <SelectValue placeholder="Select marital status" />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(MaritalStat).map(([key, value]) => (
                    <SelectItem key={key} value={key}>
                      {value}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {getErrorMessage('maritalStatus') && (
                <div className="text-red-500 text-xs mt-1">{getErrorMessage('maritalStatus')}</div>
              )}
            </div>
          </div>
        </div>

        {/* Financial Information Section */}
        <div className="space-y-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-2 h-8 bg-gradient-to-b from-blue-400 to-blue-600 rounded-full"></div>
            <h3 className="text-xl font-semibold text-gray-800">Financial Information</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* TIN */}
            <div className="space-y-2">
              <label htmlFor="tin" className="block text-sm font-medium text-gray-700 mb-1">
                TIN (Tax Identification Number) *
              </label>
              <Input
                id="tin"
                name="tin"
                value={formik.values.tin}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                className={`w-full px-3 py-2 border focus:outline-none focus:border-green-500 focus:outline-2 rounded-md transition-colors duration-200 ${
                  getErrorMessage('tin') ? "border-red-500" : "border-gray-300"
                }`}
                placeholder="000123456789"
                disabled={loading}
              />
              {getErrorMessage('tin') && (
                <div className="text-red-500 text-xs mt-1">{getErrorMessage('tin')}</div>
              )}
            </div>

            {/* Bank Account Number */}
            <div className="space-y-2">
              <label htmlFor="bankAccountNo" className="block text-sm font-medium text-gray-700 mb-1">
                Bank Account Number *
              </label>
              <Input
                id="bankAccountNo"
                name="bankAccountNo"
                value={formik.values.bankAccountNo}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                className={`w-full px-3 py-2 border focus:outline-none focus:border-green-500 focus:outline-2 rounded-md transition-colors duration-200 ${
                  getErrorMessage('bankAccountNo') ? "border-red-500" : "border-gray-300"
                }`}
                placeholder="100023456789"
                disabled={loading}
              />
              {getErrorMessage('bankAccountNo') && (
                <div className="text-red-500 text-xs mt-1">{getErrorMessage('bankAccountNo')}</div>
              )}
            </div>

            {/* Pension Number */}
            <div className="space-y-2">
              <label htmlFor="pensionNumber" className="block text-sm font-medium text-gray-700 mb-1">
                Pension Number *
              </label>
              <Input
                id="pensionNumber"
                name="pensionNumber"
                value={formik.values.pensionNumber}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                className={`w-full px-3 py-2 border focus:outline-none focus:border-green-500 focus:outline-2 rounded-md transition-colors duration-200 ${
                  getErrorMessage('pensionNumber') ? "border-red-500" : "border-gray-300"
                }`}
                placeholder="PEN123456789"
                disabled={loading}
              />
              {getErrorMessage('pensionNumber') && (
                <div className="text-red-500 text-xs mt-1">{getErrorMessage('pensionNumber')}</div>
              )}
            </div>
          </div>
        </div>

       

        {/* Address Information Section */}
        <div className="space-y-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-2 h-8 bg-gradient-to-b from-purple-400 to-purple-600 rounded-full"></div>
            <h3 className="text-xl font-semibold text-gray-800">Address Information</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Address Type */}
            <div className="space-y-2">
              <label htmlFor="addressType" className="block text-sm font-medium text-gray-700 mb-1">
                Address Type
              </label>
              <Select
                value={formik.values.addressType}
                onValueChange={(value: AddressType) => formik.setFieldValue('addressType', value)}
                disabled={loading}
              >
                <SelectTrigger className="w-full px-3 py-2 border border-gray-300 focus:outline-none focus:border-green-500 focus:outline-2 rounded-md transition-colors duration-200">
                  <SelectValue placeholder="Select address type" />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(AddressType).map(([key, value]) => (
                    <SelectItem key={key} value={key}>{value}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Country */}
            <div className="space-y-2">
              <label htmlFor="country" className="block text-sm font-medium text-gray-700 mb-1">
                Country
              </label>
              <Input
                id="country"
                name="country"
                value={formik.values.country}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                className="w-full px-3 py-2 border border-gray-300 focus:outline-none focus:border-green-500 focus:outline-2 rounded-md transition-colors duration-200"
                placeholder="Ethiopia"
                disabled={loading}
              />
            </div>

            {/* Region */}
            <div className="space-y-2">
              <label htmlFor="region" className="block text-sm font-medium text-gray-700 mb-1">
                Region
              </label>
              <Input
                id="region"
                name="region"
                value={formik.values.region}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                className="w-full px-3 py-2 border border-gray-300 focus:outline-none focus:border-green-500 focus:outline-2 rounded-md transition-colors duration-200"
                placeholder="Addis Ababa"
                disabled={loading}
              />
            </div>

            {/* Subcity */}
            <div className="space-y-2">
              <label htmlFor="subcity" className="block text-sm font-medium text-gray-700 mb-1">
                Subcity
              </label>
              <Input
                id="subcity"
                name="subcity"
                value={formik.values.subcity}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                className="w-full px-3 py-2 border border-gray-300 focus:outline-none focus:border-green-500 focus:outline-2 rounded-md transition-colors duration-200"
                placeholder="Kirkos"
                disabled={loading}
              />
            </div>

            {/* Zone */}
            <div className="space-y-2">
              <label htmlFor="zone" className="block text-sm font-medium text-gray-700 mb-1">
                Zone
              </label>
              <Input
                id="zone"
                name="zone"
                value={formik.values.zone}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                className="w-full px-3 py-2 border border-gray-300 focus:outline-none focus:border-green-500 focus:outline-2 rounded-md transition-colors duration-200"
                placeholder="Zone 3"
                disabled={loading}
              />
            </div>

            {/* Woreda */}
            <div className="space-y-2">
              <label htmlFor="woreda" className="block text-sm font-medium text-gray-700 mb-1">
                Woreda
              </label>
              <Input
                id="woreda"
                name="woreda"
                value={formik.values.woreda}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                className="w-full px-3 py-2 border border-gray-300 focus:outline-none focus:border-green-500 focus:outline-2 rounded-md transition-colors duration-200"
                placeholder="08"
                disabled={loading}
              />
            </div>

            {/* Kebele */}
            <div className="space-y-2">
              <label htmlFor="kebele" className="block text-sm font-medium text-gray-700 mb-1">
                Kebele
              </label>
              <Input
                id="kebele"
                name="kebele"
                value={formik.values.kebele}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                className="w-full px-3 py-2 border border-gray-300 focus:outline-none focus:border-green-500 focus:outline-2 rounded-md transition-colors duration-200"
                placeholder="09"
                disabled={loading}
              />
            </div>

            {/* House No */}
            <div className="space-y-2">
              <label htmlFor="houseNo" className="block text-sm font-medium text-gray-700 mb-1">
                House Number
              </label>
              <Input
                id="houseNo"
                name="houseNo"
                value={formik.values.houseNo}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                className="w-full px-3 py-2 border border-gray-300 focus:outline-none focus:border-green-500 focus:outline-2 rounded-md transition-colors duration-200"
                placeholder="H-123"
                disabled={loading}
              />
            </div>

            {/* Telephone */}
            <div className="space-y-2">
              <label htmlFor="telephone" className="block text-sm font-medium text-gray-700 mb-1">
                Telephone
              </label>
              <div className="w-full border border-gray-300 rounded-md transition-colors duration-200">
                <PhoneInput
                  country={"et"}
                  value={formik.values.telephone}
                  onChange={(value) => formik.setFieldValue('telephone', value)}
                  disabled={loading}
                  inputProps={{ name: 'telephone', onBlur: formik.handleBlur, disabled: loading }}
                  inputStyle={{
                    width: '100%', height: '42px', paddingLeft: '48px',
                    outline: 'none', fontSize: '14px', borderRadius: '6px', border: 'none',
                    ...(loading && { backgroundColor: '#f3f4f6', cursor: 'not-allowed' }),
                  }}
                  buttonStyle={{
                    border: 'none', borderRight: '1px solid #ccc',
                    borderRadius: '6px 0 0 6px', backgroundColor: '#f8f9fa',
                    ...(loading && { cursor: 'not-allowed' }),
                  }}
                  containerStyle={{ width: '100%' }}
                  dropdownStyle={{ borderRadius: '6px' }}
                />
              </div>
            </div>

            {/* Email */}
            <div className="space-y-2">
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <Input
                id="email"
                name="email"
                type="email"
                value={formik.values.email}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                className="w-full px-3 py-2 border border-gray-300 focus:outline-none focus:border-green-500 focus:outline-2 rounded-md transition-colors duration-200"
                placeholder="example@email.com"
                disabled={loading}
              />
            </div>

            {/* P.O. Box */}
            <div className="space-y-2">
              <label htmlFor="poBox" className="block text-sm font-medium text-gray-700 mb-1">
                P.O. Box
              </label>
              <Input
                id="poBox"
                name="poBox"
                value={formik.values.poBox}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                className="w-full px-3 py-2 border border-gray-300 focus:outline-none focus:border-green-500 focus:outline-2 rounded-md transition-colors duration-200"
                placeholder="1234"
                disabled={loading}
              />
            </div>

            {/* Fax */}
            <div className="space-y-2">
              <label htmlFor="fax" className="block text-sm font-medium text-gray-700 mb-1">
                Fax
              </label>
              <Input
                id="fax"
                name="fax"
                value={formik.values.fax}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                className="w-full px-3 py-2 border border-gray-300 focus:outline-none focus:border-green-500 focus:outline-2 rounded-md transition-colors duration-200"
                placeholder="+251111223344"
                disabled={loading}
              />
            </div>

            {/* Website */}
            <div className="space-y-2">
              <label htmlFor="website" className="block text-sm font-medium text-gray-700 mb-1">
                Website
              </label>
              <Input
                id="website"
                name="website"
                value={formik.values.website}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                className="w-full px-3 py-2 border border-gray-300 focus:outline-none focus:border-green-500 focus:outline-2 rounded-md transition-colors duration-200"
                placeholder="https://example.com"
                disabled={loading}
              />
            </div>
          </div>
        </div>

        {/* Save Button */}
        <div className="flex justify-end pt-6">
          <button
            type="submit"
            disabled={loading}
            className="px-8 py-3 bg-green-600 text-white rounded-xl font-medium hover:bg-green-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Saving...
              </>
            ) : (
              'Save Changes'
            )}
          </button>
        </div>
      </form>
    </motion.div>
  );
};
