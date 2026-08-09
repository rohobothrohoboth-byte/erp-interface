import React, { useState, useEffect } from 'react';
import { useFormik } from 'formik';
import * as yup from 'yup';
import { motion, AnimatePresence } from 'framer-motion';
import PhoneInput from 'react-phone-input-2';
import 'react-phone-input-2/lib/style.css';
import {
  User,
  Phone,
  MapPin,
  ChevronRight,
  ChevronLeft,
  AlertCircle,
  CheckCircle,
  Globe,
  Home,
  Mail,
  Heart,
  Users,
  Award
} from 'lucide-react';
import { Input } from '../../../../../components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../../../components/ui/select';
import { Gender, AddressType } from '../../../../../types/hr/enum';
import type { Step3Dto } from '../../../../../types/hr/employee/empAddDto';
import { amharicRegex } from '../../../../../utils/amharic-regex';
import type { UUID } from '../../../../../types/List/list';
import EnumSelect from '../../../../ui/enumSelect';
import { Relation } from '../../../../../types/enum';
import { Label } from '../../../../ui/label';

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
  relation: yup.string().required('Relation is required'),
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
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    if (document.documentElement) document.documentElement.scrollTop = 0;
    if (document.body) document.body.scrollTop = 0;
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

  useEffect(() => {
    if (employeeId && employeeId !== formik.values.employeeId) {
      formik.setFieldValue('employeeId', employeeId);
    }
  }, [employeeId]);

  const handleAmharicInputChange = (
      e: React.ChangeEvent<HTMLInputElement>,
      fieldName: string
  ) => {
    const value = e.target.value;
    if (value === '' || amharicRegex.test(value)) {
      formik.setFieldValue(fieldName, value);
    }
  };

  const handlePhoneChange = (value: string) => {
    formik.setFieldValue('telephone', value);
  };

  const getErrorMessage = (fieldName: string): string => {
    const error = formik.errors[fieldName as keyof typeof formik.errors];
    const touched = formik.touched[fieldName as keyof typeof formik.touched];
    if (touched && error) return typeof error === 'string' ? error : 'Invalid value';
    return '';
  };

  const handleSubmit = async (e: React.FormEvent) => {
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

  const handleBackClick = () => {
    scrollToTop();
    onBack();
  };

  // Section animation variants
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
          {/* Emergency Contact Person Information Section */}
          <motion.div variants={sectionVariants} initial="hidden" animate="visible" className="space-y-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-orange-500 to-red-600 rounded-xl shadow-lg">
                <Heart className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-slate-800">Emergency Contact Person</h3>
                <p className="text-sm text-slate-500">Information about the emergency contact person</p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              {/* English Names Column */}
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-slate-700">
                    First Name <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <Input
                        name="firstName"
                        value={formik.values.firstName}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        className={`w-full pl-10 pr-4 py-2.5 border rounded-xl focus:ring-2 focus:ring-orange-500 transition-all ${
                            getErrorMessage("firstName") ? "border-red-500" : "border-slate-200"
                        }`}
                        placeholder="John"
                        disabled={loading}
                    />
                  </div>
                  {getErrorMessage("firstName") && (
                      <p className="text-red-500 text-xs">{getErrorMessage("firstName")}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-slate-700">
                    Middle Name <span className="text-red-500">*</span>
                  </label>
                  <Input
                      name="middleName"
                      value={formik.values.middleName}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      className={`w-full px-4 py-2.5 border rounded-xl focus:ring-2 focus:ring-orange-500 transition-all ${
                          getErrorMessage("middleName") ? "border-red-500" : "border-slate-200"
                      }`}
                      placeholder="Michael"
                      disabled={loading}
                  />
                  {getErrorMessage("middleName") && (
                      <p className="text-red-500 text-xs">{getErrorMessage("middleName")}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-slate-700">
                    Last Name <span className="text-red-500">*</span>
                  </label>
                  <Input
                      name="lastName"
                      value={formik.values.lastName}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      className={`w-full px-4 py-2.5 border rounded-xl focus:ring-2 focus:ring-orange-500 transition-all ${
                          getErrorMessage("lastName") ? "border-red-500" : "border-slate-200"
                      }`}
                      placeholder="Doe"
                      disabled={loading}
                  />
                  {getErrorMessage("lastName") && (
                      <p className="text-red-500 text-xs">{getErrorMessage("lastName")}</p>
                  )}
                </div>
              </div>

              {/* Amharic Names Column */}
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-slate-700">
                    ስም (Amharic) <span className="text-red-500">*</span>
                  </label>
                  <Input
                      name="firstNameAm"
                      value={formik.values.firstNameAm}
                      onChange={(e) => handleAmharicInputChange(e, "firstNameAm")}
                      onBlur={formik.handleBlur}
                      className={`w-full px-4 py-2.5 border rounded-xl focus:ring-2 focus:ring-orange-500 transition-all ${
                          getErrorMessage("firstNameAm") ? "border-red-500" : "border-slate-200"
                      }`}
                      placeholder="አየለ"
                      disabled={loading}
                  />
                  {getErrorMessage("firstNameAm") && (
                      <p className="text-red-500 text-xs">{getErrorMessage("firstNameAm")}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-slate-700">
                    የአባት ስም (Amharic) <span className="text-red-500">*</span>
                  </label>
                  <Input
                      name="middleNameAm"
                      value={formik.values.middleNameAm}
                      onChange={(e) => handleAmharicInputChange(e, "middleNameAm")}
                      onBlur={formik.handleBlur}
                      className={`w-full px-4 py-2.5 border rounded-xl focus:ring-2 focus:ring-orange-500 transition-all ${
                          getErrorMessage("middleNameAm") ? "border-red-500" : "border-slate-200"
                      }`}
                      placeholder="በቀለ"
                      disabled={loading}
                  />
                  {getErrorMessage("middleNameAm") && (
                      <p className="text-red-500 text-xs">{getErrorMessage("middleNameAm")}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-slate-700">
                    የአያት ስም (Amharic) <span className="text-red-500">*</span>
                  </label>
                  <Input
                      name="lastNameAm"
                      value={formik.values.lastNameAm}
                      onChange={(e) => handleAmharicInputChange(e, "lastNameAm")}
                      onBlur={formik.handleBlur}
                      className={`w-full px-4 py-2.5 border rounded-xl focus:ring-2 focus:ring-orange-500 transition-all ${
                          getErrorMessage("lastNameAm") ? "border-red-500" : "border-slate-200"
                      }`}
                      placeholder="ዮሐንስ"
                      disabled={loading}
                  />
                  {getErrorMessage("lastNameAm") && (
                      <p className="text-red-500 text-xs">{getErrorMessage("lastNameAm")}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Additional Contact Details */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 pt-4">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-slate-700">
                  Nationality <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Globe className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <Input
                      name="nationality"
                      value={formik.values.nationality}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      className={`w-full pl-10 pr-4 py-2.5 border rounded-xl focus:ring-2 focus:ring-orange-500 transition-all ${
                          getErrorMessage("nationality") ? "border-red-500" : "border-slate-200"
                      }`}
                      placeholder="Ethiopian"
                      disabled={loading}
                  />
                </div>
                {getErrorMessage("nationality") && (
                    <p className="text-red-500 text-xs">{getErrorMessage("nationality")}</p>
                )}
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-slate-700">
                  Gender <span className="text-red-500">*</span>
                </label>
                <Select
                    value={formik.values.gender}
                    onValueChange={(value: Gender) => formik.setFieldValue("gender", value)}
                    disabled={loading}
                >
                  <SelectTrigger className={`w-full px-4 py-2.5 border rounded-xl focus:ring-2 focus:ring-orange-500 ${
                      getErrorMessage("gender") ? "border-red-500" : "border-slate-200"
                  }`}>
                    <SelectValue placeholder="Select gender" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(Gender).map(([key, value]) => (
                        <SelectItem key={key} value={key}>{value}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {getErrorMessage("gender") && (
                    <p className="text-red-500 text-xs">{getErrorMessage("gender")}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label className="block text-sm font-medium text-slate-700">
                  Relation <span className="text-red-500">*</span>
                </Label>
                <div className="relative">
                  <Users className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400 z-10" />
                  <EnumSelect
                      enumObject={Relation}
                      value={formik.values.relation}
                      onChange={(value) => formik.setFieldValue("relation", value)}
                      placeholder="Select Relation"
                      disabled={loading}
                      className="pl-10"
                  />
                </div>
              </div>
            </div>
          </motion.div>

          {/* Contact Address Information Section */}
          <motion.div variants={sectionVariants} initial="hidden" animate="visible" transition={{ delay: 0.1 }} className="space-y-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-xl shadow-lg">
                <MapPin className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-slate-800">Contact Address</h3>
                <p className="text-sm text-slate-500">Emergency contact address details</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-slate-700">
                  Address Type <span className="text-red-500">*</span>
                </label>
                <Select
                    value={formik.values.addressType}
                    onValueChange={(value: AddressType) => formik.setFieldValue("addressType", value)}
                    disabled={loading}
                >
                  <SelectTrigger className={`w-full px-4 py-2.5 border rounded-xl focus:ring-2 focus:ring-blue-500 ${
                      getErrorMessage("addressType") ? "border-red-500" : "border-slate-200"
                  }`}>
                    <SelectValue placeholder="Select address type" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(AddressType).map(([key, value]) => (
                        <SelectItem key={key} value={key}>{value}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {getErrorMessage("addressType") && (
                    <p className="text-red-500 text-xs">{getErrorMessage("addressType")}</p>
                )}
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-slate-700">
                  Country <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Globe className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <Input
                      name="country"
                      value={formik.values.country}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 transition-all"
                      placeholder="Ethiopia"
                      disabled={loading}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-slate-700">
                  Region <span className="text-red-500">*</span>
                </label>
                <Input
                    name="region"
                    value={formik.values.region}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 transition-all"
                    placeholder="Addis Ababa"
                    disabled={loading}
                />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-slate-700">
                  Telephone <span className="text-red-500">*</span>
                </label>
                <PhoneInput
                    country={'et'}
                    value={formik.values.telephone}
                    onChange={handlePhoneChange}
                    disabled={loading}
                    inputProps={{ name: "telephone", onBlur: formik.handleBlur }}
                    containerClass="w-full"
                    inputClass={`!w-full !px-4 !py-2.5 !rounded-xl !border-slate-200 focus:!ring-2 focus:!ring-blue-500 ${
                        getErrorMessage("telephone") ? "!border-red-500" : ""
                    }`}
                />
                {getErrorMessage("telephone") && (
                    <p className="text-red-500 text-xs">{getErrorMessage("telephone")}</p>
                )}
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-slate-700">Subcity</label>
                <Input
                    name="subcity"
                    value={formik.values.subcity}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 transition-all"
                    placeholder="Kirkos"
                    disabled={loading}
                />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-slate-700">Zone</label>
                <Input
                    name="zone"
                    value={formik.values.zone}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 transition-all"
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
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 transition-all"
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
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 transition-all"
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
                      className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 transition-all"
                      placeholder="H-123"
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
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 transition-all"
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
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 transition-all"
                    placeholder="+251111223344"
                    disabled={loading}
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
                      className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 transition-all"
                      placeholder="example@email.com"
                      disabled={loading}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-slate-700">Website</label>
                <Input
                    name="website"
                    value={formik.values.website}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 transition-all"
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
              transition={{ delay: 0.2 }}
              className="flex justify-between pt-6 border-t border-slate-200"
          >
            <button
                type="button"
                onClick={handleBackClick}
                disabled={loading}
                className="group px-8 py-3 border border-slate-300 rounded-xl text-slate-700 font-medium hover:bg-slate-50 hover:border-slate-400 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
              Back
            </button>
            <button
                type="submit"
                disabled={loading}
                className="group px-8 py-3 bg-gradient-to-r from-orange-600 to-red-600 text-white rounded-xl font-medium hover:shadow-lg hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {loading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Saving...
                  </>
              ) : (
                  <>
                    Save & Continue
                    <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </>
              )}
            </button>
          </motion.div>
        </form>
      </motion.div>
  );
};