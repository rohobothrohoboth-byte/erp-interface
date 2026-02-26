import React, { useState, useEffect } from 'react';
import { useFormik } from 'formik';
import * as yup from 'yup';
import { motion } from 'framer-motion';
import PhoneInput from 'react-phone-input-2';
import 'react-phone-input-2/lib/style.css';
import { Input } from '../../../../../components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../../../components/ui/select';
import { Gender, AddressType } from '../../../../../types/hr/enum';
import type { Step3Dto } from '../../../../../types/hr/employee/empAddDto';
import { amharicRegex } from '../../../../../utils/amharic-regex';
import List from '../../../../List/list';
import { listService } from '../../../../../services/hr/listservice';
import type { ListItem, UUID } from '../../../../../types/List/list';
import EnumSelect from '../../../../ui/enumSelect';
import { Relation } from '../../../../../types/enum';
import { Label } from '../../../../ui/label';
// import { empService } from '../../../../../services/hr/employee/empService';

interface EmergencyContactStepProps {
  data: Partial<Step3Dto>;
  onNext: (data: Step3Dto) => void;
  onBack: () => void;
  employeeId?: UUID;
  loading?: boolean;
}

const validationSchema = yup.object({
  firstName: yup.string().required('First name is required'),
  firstNameAm: yup.string().required('First name (Amharic) is required'),
  middleName: yup.string().required('Middle name is required'),
  middleNameAm: yup.string().required('Middle name (Amharic) is required'),
  lastName: yup.string().required('Last name is required'),
  lastNameAm: yup.string().required('Last name (Amharic) is required'),
  nationality: yup.string().required('Nationality is required'),
  gender: yup.string().required('Gender is required'),
  // relationId: yup.string().required('Relation is required'),
  addressType: yup.string().required('Address type is required'),
  country: yup.string().required('Country is required'),
  region: yup.string().required('Region is required'),
  telephone: yup.string().required('Telephone is required'),
});

export const EmergencyContactStep: React.FC<EmergencyContactStepProps> = ({
  data,
  onNext,
  onBack,
  employeeId,
  loading = false
}) => {
  const [relations, setRelations] = useState("0");
  const [loadingRelations, setLoadingRelations] = useState(false);
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

  const formik = useFormik<Step3Dto>({
    initialValues: {
      firstName: data.firstName || '',
      firstNameAm: data.firstNameAm || '',
      middleName: data.middleName || '',
      middleNameAm: data.middleNameAm || '',
      lastName: data.lastName || '',
      lastNameAm: data.lastNameAm || '',
      nationality: data.nationality || '',
      gender: data.gender || '' as Gender,
      relationId: data.relationId || '' as UUID,
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
    },
    validationSchema,
    enableReinitialize: true,
    validateOnMount: false,
    onSubmit: (values) => {
      // Clear previous errors when submitting
      setSubmitError(null);

      // Scroll to top before calling onNext
      scrollToTop();
      onNext(values);
    },
  });

  // Update employeeId when prop changes
  useEffect(() => {
    if (employeeId && employeeId !== formik.values.employeeId) {
      formik.setFieldValue('employeeId', employeeId);
    }
  }, [employeeId]);

  // Fetch relations when component mounts
  // useEffect(() => {
  //   const fetchRelations = async () => {
  //     setLoadingRelations(true);
  //     try {
  //       const relationsData = await listService.getAllRelations();
  //       setRelations(relationsData);

  //       // Auto-select first relation if none is selected and we have relations
  //       if (!formik.values.relationId && relationsData.length > 0) {
  //         formik.setFieldValue('relationId', relationsData[0].id);
  //       }
  //     } catch (error) {
  //       console.error('Error fetching relations:', error);
  //       setSubmitError('Failed to load relations');
  //     } finally {
  //       setLoadingRelations(false);
  //     }
  //   };

  //   fetchRelations();
  // }, []);

  // Handle relation selection
  const handleRelationSelect = (item: ListItem) => {
    formik.setFieldValue('relationId', item.id);
  };

  // Amharic input handlers
  const handleAmharicInputChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    fieldName: string
  ) => {
    const value = e.target.value;
    if (value === '' || amharicRegex.test(value)) {
      formik.setFieldValue(fieldName, value);
    }
  };

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
  const handleSubmit = async(e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);

    const errors = await formik.validateForm();

    if (Object.keys(errors).length > 0) {
      formik.setTouched(
        Object.keys(errors).reduce((acc, key) => {
          acc[key] = true;
          return acc;
        }, {} as any),
      );
      return;
    }

    scrollToTop();
    formik.handleSubmit();
    
  };

  // Handle back button click with scroll to top
  const handleBackClick = () => {
    scrollToTop();
    onBack();
  };

  // Get the selected relation name for display
  // const selectedRelation = relations.find(relation => relation.id === formik.values.relationId);

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

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Contact Person Information Section */}
        <div className="space-y-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-2 h-8 bg-gradient-to-b from-purple-400 to-purple-600 rounded-full"></div>
            <h3 className="text-xl font-semibold text-gray-800">
              Emergency Contact Person Information
            </h3>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
            {/* English Names Column */}
            <div className="space-y-4">
              <div className="space-y-2">
                <label
                  htmlFor="firstName"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  First Name *
                </label>
                <Input
                  id="firstName"
                  name="firstName"
                  value={formik.values.firstName}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  className={`w-full px-3 py-2 border focus:outline-none focus:border-green-500 focus:outline-2 rounded-md transition-colors duration-200 ${
                    getErrorMessage("firstName")
                      ? "border-red-500"
                      : "border-gray-300"
                  }`}
                  placeholder="John"
                  disabled={loading}
                />
                {getErrorMessage("firstName") && (
                  <div className="text-red-500 text-xs mt-1">
                    {getErrorMessage("firstName")}
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <label
                  htmlFor="middleName"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Middle Name *
                </label>
                <Input
                  id="middleName"
                  name="middleName"
                  value={formik.values.middleName}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  className={`w-full px-3 py-2 border focus:outline-none focus:border-green-500 focus:outline-2 rounded-md transition-colors duration-200 ${
                    getErrorMessage("middleName")
                      ? "border-red-500"
                      : "border-gray-300"
                  }`}
                  placeholder="Michael"
                  disabled={loading}
                />
                {getErrorMessage("middleName") && (
                  <div className="text-red-500 text-xs mt-1">
                    {getErrorMessage("middleName")}
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <label
                  htmlFor="lastName"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Last Name *
                </label>
                <Input
                  id="lastName"
                  name="lastName"
                  value={formik.values.lastName}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  className={`w-full px-3 py-2 border focus:outline-none focus:border-green-500 focus:outline-2 rounded-md transition-colors duration-200 ${
                    getErrorMessage("lastName")
                      ? "border-red-500"
                      : "border-gray-300"
                  }`}
                  placeholder="Doe"
                  disabled={loading}
                />
                {getErrorMessage("lastName") && (
                  <div className="text-red-500 text-xs mt-1">
                    {getErrorMessage("lastName")}
                  </div>
                )}
              </div>
            </div>

            {/* Amharic Names Column */}
            <div className="space-y-4">
              <div className="space-y-2">
                <label
                  htmlFor="firstNameAm"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  First Name (Amharic) *
                </label>
                <Input
                  id="firstNameAm"
                  name="firstNameAm"
                  value={formik.values.firstNameAm}
                  onChange={(e) => handleAmharicInputChange(e, "firstNameAm")}
                  onBlur={formik.handleBlur}
                  className={`w-full px-3 py-2 border focus:outline-none focus:border-green-500 focus:outline-2 rounded-md transition-colors duration-200 ${
                    getErrorMessage("firstNameAm")
                      ? "border-red-500"
                      : "border-gray-300"
                  }`}
                  placeholder="አየለ"
                  disabled={loading}
                />
                {getErrorMessage("firstNameAm") && (
                  <div className="text-red-500 text-xs mt-1">
                    {getErrorMessage("firstNameAm")}
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <label
                  htmlFor="middleNameAm"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Middle Name (Amharic) *
                </label>
                <Input
                  id="middleNameAm"
                  name="middleNameAm"
                  value={formik.values.middleNameAm}
                  onChange={(e) => handleAmharicInputChange(e, "middleNameAm")}
                  onBlur={formik.handleBlur}
                  className={`w-full px-3 py-2 border focus:outline-none focus:border-green-500 focus:outline-2 rounded-md transition-colors duration-200 ${
                    getErrorMessage("middleNameAm")
                      ? "border-red-500"
                      : "border-gray-300"
                  }`}
                  placeholder="በቀለ"
                  disabled={loading}
                />
                {getErrorMessage("middleNameAm") && (
                  <div className="text-red-500 text-xs mt-1">
                    {getErrorMessage("middleNameAm")}
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <label
                  htmlFor="lastNameAm"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Last Name (Amharic) *
                </label>
                <Input
                  id="lastNameAm"
                  name="lastNameAm"
                  value={formik.values.lastNameAm}
                  onChange={(e) => handleAmharicInputChange(e, "lastNameAm")}
                  onBlur={formik.handleBlur}
                  className={`w-full px-3 py-2 border focus:outline-none focus:border-green-500 focus:outline-2 rounded-md transition-colors duration-200 ${
                    getErrorMessage("lastNameAm")
                      ? "border-red-500"
                      : "border-gray-300"
                  }`}
                  placeholder="ዮሐንስ"
                  disabled={loading}
                />
                {getErrorMessage("lastNameAm") && (
                  <div className="text-red-500 text-xs mt-1">
                    {getErrorMessage("lastNameAm")}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Additional Contact Details */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mt-6">
            <div className="space-y-2">
              <label
                htmlFor="nationality"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Nationality *
              </label>
              <Input
                id="nationality"
                name="nationality"
                value={formik.values.nationality}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                className={`w-full px-3 py-2 border focus:outline-none focus:border-green-500 focus:outline-2 rounded-md transition-colors duration-200 ${
                  getErrorMessage("nationality")
                    ? "border-red-500"
                    : "border-gray-300"
                }`}
                placeholder="Ethiopian"
                disabled={loading}
              />
              {getErrorMessage("nationality") && (
                <div className="text-red-500 text-xs mt-1">
                  {getErrorMessage("nationality")}
                </div>
              )}
            </div>
            {/* gender */}
            <div className="space-y-2">
              <label
                htmlFor="gender"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Gender *
              </label>
              <Select
                value={formik.values.gender}
                onValueChange={(value: Gender) =>
                  formik.setFieldValue("gender", value)
                }
                disabled={loading}
              >
                <SelectTrigger
                  className={`w-full px-3 py-2 border focus:outline-none focus:border-green-500 focus:outline-2 rounded-md transition-colors duration-200 ${
                    getErrorMessage("gender")
                      ? "border-red-500"
                      : "border-gray-300"
                  }`}
                >
                  <SelectValue placeholder="Select gender" />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(Gender).map(([key, value]) => (
                    <SelectItem key={key} value={key}>
                      {value}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {getErrorMessage("gender") && (
                <div className="text-red-500 text-xs mt-1">
                  {getErrorMessage("gender")}
                </div>
              )}
            </div>
            {/* relation */}
            <div className="space-y-2">
              <Label
                htmlFor="fiscalYear"
                className="block text-sm font-medium text-gray-700"
              >
                Relation <span className="text-red-500">*</span>
              </Label>
              <EnumSelect
                enumObject={Relation}
                value={formik.values.relationId}
                onChange={(value) => formik.setFieldValue("relationId", value)}
                placeholder="Select Relation"
                disabled={loading}
              />
            </div>
          </div>
        </div>

        {/* Address Information Section */}
        <div className="space-y-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-2 h-8 bg-gradient-to-b from-blue-400 to-blue-600 rounded-full"></div>
            <h3 className="text-xl font-semibold text-gray-800">
              Contact Address Information
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {/* Address Type */}
            <div className="space-y-2">
              <label
                htmlFor="addressType"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Address Type *
              </label>
              <Select
                value={formik.values.addressType}
                onValueChange={(value: AddressType) =>
                  formik.setFieldValue("addressType", value)
                }
                disabled={loading}
              >
                <SelectTrigger
                  className={`w-full px-3 py-2 border focus:outline-none focus:border-green-500 focus:outline-2 rounded-md transition-colors duration-200 ${
                    getErrorMessage("addressType")
                      ? "border-red-500"
                      : "border-gray-300"
                  }`}
                >
                  <SelectValue placeholder="Select address type" />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(AddressType).map(([key, value]) => (
                    <SelectItem key={key} value={key}>
                      {value}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {getErrorMessage("addressType") && (
                <div className="text-red-500 text-xs mt-1">
                  {getErrorMessage("addressType")}
                </div>
              )}
            </div>

            {/* Country */}
            <div className="space-y-2">
              <label
                htmlFor="country"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Country *
              </label>
              <Input
                id="country"
                name="country"
                value={formik.values.country}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                className={`w-full px-3 py-2 border focus:outline-none focus:border-green-500 focus:outline-2 rounded-md transition-colors duration-200 ${
                  getErrorMessage("country")
                    ? "border-red-500"
                    : "border-gray-300"
                }`}
                placeholder="Ethiopia"
                disabled={loading}
              />
              {getErrorMessage("country") && (
                <div className="text-red-500 text-xs mt-1">
                  {getErrorMessage("country")}
                </div>
              )}
            </div>

            {/* Region */}
            <div className="space-y-2">
              <label
                htmlFor="region"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Region *
              </label>
              <Input
                id="region"
                name="region"
                value={formik.values.region}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                className={`w-full px-3 py-2 border focus:outline-none focus:border-green-500 focus:outline-2 rounded-md transition-colors duration-200 ${
                  getErrorMessage("region")
                    ? "border-red-500"
                    : "border-gray-300"
                }`}
                placeholder="Addis Ababa"
                disabled={loading}
              />
              {getErrorMessage("region") && (
                <div className="text-red-500 text-xs mt-1">
                  {getErrorMessage("region")}
                </div>
              )}
            </div>

            {/* Telephone */}
            <div className="space-y-2">
              <label
                htmlFor="telephone"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Telephone *
              </label>
              <div
                className={`w-full border rounded-md transition-colors duration-200 ${
                  getErrorMessage("telephone")
                    ? "border-red-500"
                    : "border-gray-300"
                }`}
              >
                <PhoneInput
                  country={"et"}
                  value={formik.values.telephone}
                  onChange={handlePhoneChange}
                  disabled={loading}
                  inputProps={{
                    name: "telephone",
                    onBlur: formik.handleBlur,
                    disabled: loading,
                  }}
                  inputStyle={{
                    width: "100%",
                    height: "42px",
                    paddingLeft: "48px",
                    outline: "none",
                    fontSize: "14px",
                    borderRadius: "6px",
                    border: "none",
                    ...(loading && {
                      backgroundColor: "#f3f4f6",
                      cursor: "not-allowed",
                    }),
                  }}
                  buttonStyle={{
                    border: "none",
                    borderRight: "1px solid #ccc",
                    borderRadius: "6px 0 0 6px",
                    backgroundColor: "#f8f9fa",
                    ...(loading && { cursor: "not-allowed" }),
                  }}
                  containerStyle={{
                    width: "100%",
                  }}
                  dropdownStyle={{
                    borderRadius: "6px",
                  }}
                />
              </div>
              {getErrorMessage("telephone") && (
                <div className="text-red-500 text-xs mt-1">
                  {getErrorMessage("telephone")}
                </div>
              )}
            </div>

            {/* Subcity - Optional */}
            <div className="space-y-2">
              <label
                htmlFor="subcity"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
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
              <label
                htmlFor="zone"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
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
              <label
                htmlFor="woreda"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
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
              <label
                htmlFor="kebele"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
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
              <label
                htmlFor="houseNo"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
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
              <label
                htmlFor="poBox"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
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
              <label
                htmlFor="fax"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
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
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
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
              <label
                htmlFor="website"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
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
              "Save & Continue"
            )}
          </button>
        </div>
      </form>
    </motion.div>
  );
};