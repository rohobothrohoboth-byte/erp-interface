import React, { useState } from 'react';
import { useFormik } from 'formik';
import * as yup from 'yup';
import { motion } from 'framer-motion';
import PhoneInput from 'react-phone-input-2';
import 'react-phone-input-2/lib/style.css';
import { Input } from '../../../../../components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../../../components/ui/select';
import { YesNo, MaritalStat, AddressType } from '../../../../../types/hr/enum';
import type { Step2Dto, UUID } from '../../../../../types/hr/employee/empAddDto';

interface BiographicalStepProps {
  data: Partial<Step2Dto>;
  onNext: (data: Step2Dto) => void;
  onBack: () => void;
  employeeId?: UUID;
  loading?: boolean;
}

const validationSchema = yup.object({
  birthDate: yup.string().required('Birth date is required'),
  birthLocation: yup.string().required('Birth location is required'),
  motherFullName: yup.string().required("Mother's full name is required"),
  hasBirthCert: yup.string().required('Birth certificate information is required'),
  hasMarriageCert: yup.string().required('Marriage certificate information is required'),
  maritalStatus: yup.string().required('Marital status is required'),
  tin: yup.string().required('TIN is required'),
  bankAccountNo: yup.string().required('Bank account number is required'),
  pensionNumber: yup.string().required('Pension number is required'),
  addressType: yup.string().required('Address type is required'),
  country: yup.string().required('Country is required'),
  region: yup.string().required('Region is required'),
  telephone: yup.string().required('Telephone is required'),
});

export const BiographicalStep: React.FC<BiographicalStepProps> = ({ 
  data, 
  onNext, 
  onBack,
  employeeId,
  loading = false 
}) => {
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Scroll to top function
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
      hasBirthCert: data.hasBirthCert || '' as YesNo,
      hasMarriageCert: data.hasMarriageCert || '' as YesNo,
      maritalStatus: data.maritalStatus || '' as MaritalStat,
      employeeId: employeeId || data.employeeId || '' as UUID,
      tin: data.tin || '',
      bankAccountNo: data.bankAccountNo || '',
      pensionNumber: data.pensionNumber || '',
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
    },
    validationSchema,
    enableReinitialize: true,
    validateOnMount: false,
    onSubmit: (values) => {
      // Clear previous errors when submitting
      setSubmitError(null);

      const submitData: Step2Dto = {
        ...values,
        birthDate: new Date(values.birthDate).toISOString(),
      };
      
      // Scroll to top before calling onNext
      scrollToTop();
      onNext(submitData);
    },
  });

  // Handle phone input change
  const handlePhoneChange = (value: string) => {
    formik.setFieldValue('telephone', value);
  };

  // Helper function to safely get error messages (kept for display purposes only)
  const getErrorMessage = (fieldName: string): string => {
    const error = formik.errors[fieldName as keyof typeof formik.errors];
    const touched = formik.touched[fieldName as keyof typeof formik.touched];
    
    if (touched && error) {
      return typeof error === 'string' ? error : 'Invalid value';
    }
    return '';
  };

  // Handle form submission without validation
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);
    
    // Scroll to top before form submission
    scrollToTop();
    formik.handleSubmit();
  };

  // Handle back button click with scroll to top
  const handleBackClick = () => {
    scrollToTop();
    onBack();
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
            <div className="shrink-0">
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
            <div className="w-2 h-8 bg-linear-to-b from-purple-400 to-purple-600 rounded-full"></div>
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
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

            {/* Has Birth Certificate */}
            <div className="space-y-2">
              <label htmlFor="hasBirthCert" className="block text-sm font-medium text-gray-700 mb-1">
                Has Birth Certificate? *
              </label>
              <Select
                value={formik.values.hasBirthCert}
                onValueChange={(value: YesNo) => formik.setFieldValue('hasBirthCert', value)}
                disabled={loading}
              >
                <SelectTrigger className={`w-full px-3 py-2 border focus:outline-none focus:border-green-500 focus:outline-2 rounded-md transition-colors duration-200 ${
                  getErrorMessage('hasBirthCert') ? "border-red-500" : "border-gray-300"
                }`}>
                  <SelectValue placeholder="Select option" />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(YesNo).map(([key, value]) => (
                    <SelectItem key={key} value={key}>
                      {value}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {getErrorMessage('hasBirthCert') && (
                <div className="text-red-500 text-xs mt-1">{getErrorMessage('hasBirthCert')}</div>
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
            {/* Has Marriage Certificate */}
            <div className="space-y-2">
              <label htmlFor="hasMarriageCert" className="block text-sm font-medium text-gray-700 mb-1">
                Has Marriage Certificate? *
              </label>
              <Select
                value={formik.values.hasMarriageCert}
                onValueChange={(value: YesNo) => formik.setFieldValue('hasMarriageCert', value)}
                disabled={loading}
              >
                <SelectTrigger className={`w-full px-3 py-2 border focus:outline-none focus:border-green-500 focus:outline-2 rounded-md transition-colors duration-200 ${
                  getErrorMessage('hasMarriageCert') ? "border-red-500" : "border-gray-300"
                }`}>
                  <SelectValue placeholder="Select option" />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(YesNo).map(([key, value]) => (
                    <SelectItem key={key} value={key}>
                      {value}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {getErrorMessage('hasMarriageCert') && (
                <div className="text-red-500 text-xs mt-1">{getErrorMessage('hasMarriageCert')}</div>
              )}
            </div>
          </div>
        </div>

        {/* Financial Information Section */}
        <div className="space-y-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-2 h-8 bg-linear-to-b from-blue-400 to-blue-600 rounded-full"></div>
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
            <div className="w-2 h-8 bg-linear-to-b from-green-400 to-green-600 rounded-full"></div>
            <h3 className="text-xl font-semibold text-gray-800">Address Information</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {/* Address Type */}
            <div className="space-y-2">
              <label htmlFor="addressType" className="block text-sm font-medium text-gray-700 mb-1">
                Address Type *
              </label>
              <Select
  value={formik.values.addressType}
  onValueChange={(value: AddressType) => formik.setFieldValue('addressType', value)}
  disabled={loading}
>
  <SelectTrigger className={`w-full px-3 py-2 border focus:outline-none focus:border-green-500 focus:outline-2 rounded-md transition-colors duration-200 ${
    getErrorMessage('addressType') ? "border-red-500" : "border-gray-300"
  }`}>
    <SelectValue placeholder="Select address type" />
  </SelectTrigger>
  <SelectContent>
    {Object.entries(AddressType).map(([key, value]) => {
      const isWorkPlace = key === "1" || value === 'Work Place';
      return (
        <SelectItem 
          key={key} 
          value={key}
          disabled={isWorkPlace}
          className={isWorkPlace ? "opacity-50 cursor-not-allowed" : ""}
        >
          <div className="flex items-center justify-between">
            <span>{value}</span>
          </div>
        </SelectItem>
      );
    })}
  </SelectContent>
</Select>
              {getErrorMessage('addressType') && (
                <div className="text-red-500 text-xs mt-1">{getErrorMessage('addressType')}</div>
              )}
            </div>

            {/* Country */}
            <div className="space-y-2">
              <label htmlFor="country" className="block text-sm font-medium text-gray-700 mb-1">
                Country *
              </label>
              <Input
                id="country"
                name="country"
                value={formik.values.country}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                className={`w-full px-3 py-2 border focus:outline-none focus:border-green-500 focus:outline-2 rounded-md transition-colors duration-200 ${
                  getErrorMessage('country') ? "border-red-500" : "border-gray-300"
                }`}
                placeholder="Ethiopia"
                disabled={loading}
              />
              {getErrorMessage('country') && (
                <div className="text-red-500 text-xs mt-1">{getErrorMessage('country')}</div>
              )}
            </div>

            {/* Region */}
            <div className="space-y-2">
              <label htmlFor="region" className="block text-sm font-medium text-gray-700 mb-1">
                Region *
              </label>
              <Input
                id="region"
                name="region"
                value={formik.values.region}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                className={`w-full px-3 py-2 border focus:outline-none focus:border-green-500 focus:outline-2 rounded-md transition-colors duration-200 ${
                  getErrorMessage('region') ? "border-red-500" : "border-gray-300"
                }`}
                placeholder="Addis Ababa"
                disabled={loading}
              />
              {getErrorMessage('region') && (
                <div className="text-red-500 text-xs mt-1">{getErrorMessage('region')}</div>
              )}
            </div>

            {/* Telephone */}
            <div className="space-y-2">
              <label htmlFor="telephone" className="block text-sm font-medium text-gray-700 mb-1">
                Telephone *
              </label>
              <div className={`w-full border rounded-md transition-colors duration-200 ${
                getErrorMessage('telephone') ? "border-red-500" : "border-gray-300"
              }`}>
                <PhoneInput
                  country={'et'} // Default to Ethiopia
                  value={formik.values.telephone}
                  onChange={handlePhoneChange}
                  disabled={loading}
                  inputProps={{
                    name: "telephone",
                    onBlur: formik.handleBlur,
                    disabled: loading
                  }}
                  inputStyle={{
                    width: '100%',
                    height: '42px',
                    paddingLeft: '48px',
                    outline: 'none',
                    fontSize: '14px',
                    borderRadius: '6px',
                    border: 'none',
                    ...(loading && { backgroundColor: '#f3f4f6', cursor: 'not-allowed' })
                  }}
                  buttonStyle={{
                    border: 'none',
                    borderRight: '1px solid #ccc',
                    borderRadius: '6px 0 0 6px',
                    backgroundColor: '#f8f9fa',
                    ...(loading && { cursor: 'not-allowed' })
                  }}
                  containerStyle={{
                    width: '100%'
                  }}
                  dropdownStyle={{
                    borderRadius: '6px'
                  }}
                />
              </div>
              {getErrorMessage('telephone') && (
                <div className="text-red-500 text-xs mt-1">{getErrorMessage('telephone')}</div>
              )}
            </div>

            {/* Subcity - Optional */}
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

            {/* Zone - Optional */}
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

            {/* Woreda - Optional */}
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

            {/* Kebele - Optional */}
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

            {/* House Number - Optional */}
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

            {/* P.O. Box - Optional */}
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

            {/* Fax - Optional */}
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

            {/* Email - Optional */}
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

            {/* Website - Optional */}
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

        {/* Navigation Buttons */}
        <div className="flex justify-between pt-6">
          <button
            type="button"
            onClick={handleBackClick}
            disabled={loading}
            className="px-6 py-3 border border-gray-300 rounded-xl text-gray-700 font-medium hover:bg-gray-50 transition-colors disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed"
          >
            Back
          </button>
          <button
            type="submit"
            disabled={loading} // Only disable when loading, not based on form validation
            className="px-8 py-3 bg-green-600 text-white rounded-xl font-medium hover:bg-green-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Saving...
              </>
            ) : (
              'Save & Continue'
            )}
          </button>
        </div>
      </form>
    </motion.div>
  );
};