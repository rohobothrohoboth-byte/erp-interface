import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Eye,
  EyeOff,
  Shield,
  Key,
  UserCog,
  CheckCircle,
  AlertCircle,
  Sparkles,
  Lock
} from "lucide-react";
import { Formik, Form, ErrorMessage } from "formik";
import * as Yup from "yup";
import { Button } from "../../../../components/ui/button";
import { Label } from "../../../../components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../../../components/ui/select";
import { Checkbox } from "../../../../components/ui/checkbox";
import { authListApi } from "../../../../services/List/auth/authList.api";
import type {
  NameListItem,
  RoleListItem,
} from "../../../../types/NameList/nameList";
import toast from "react-hot-toast";

interface AccountBasicInfoStepProps {
  initialData: {
    password: string;
    confirmPassword: string;
    role: string;
    modules: string[];
  };
  onSubmit: (data: any) => Promise<void>;
  onBack: () => void;
  isLoading: boolean;
  employee?: {
    id: string;
    name: string;
    employeeCode: string;
    email: string;
  };
  isEditMode?: boolean;
}

const getValidationSchema = (isEditMode: boolean) => {
  const baseSchema = {
    role: Yup.string().required("Role is required"),
    modules: Yup.array()
        .of(Yup.string())
        .min(1, "Please select at least one module")
        .required("Modules are required"),
  };

  if (isEditMode) {
    return Yup.object({
      ...baseSchema,
      password: Yup.string().min(6, "Password must be at least 6 characters"),
      confirmPassword: Yup.string().when("password", {
        is: (val: string) => val && val.length > 0,
        then: (schema) =>
            schema
                .required("Confirm password is required")
                .oneOf([Yup.ref("password")], "Passwords must match"),
      }),
    });
  } else {
    return Yup.object({
      ...baseSchema,
      password: Yup.string()
          .required("Password is required")
          .min(6, "Password must be at least 6 characters"),
      confirmPassword: Yup.string()
          .required("Confirm password is required")
          .oneOf([Yup.ref("password")], "Passwords must match"),
    });
  }
};

export const AccountBasicInfoStep: React.FC<AccountBasicInfoStepProps> = ({
                                                                            initialData,
                                                                            onSubmit,
                                                                            onBack,
                                                                            isLoading,
                                                                            employee,
                                                                            isEditMode = false,
                                                                          }) => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [moduleOptions, setModuleOptions] = useState<NameListItem[]>([]);
  const [roleOptions, setRoleOptions] = useState<RoleListItem[]>([]);
  const [isFetchingModules, setIsFetchingModules] = useState(false);
  const [isFetchingRoles, setIsFetchingRoles] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setIsFetchingModules(true);
      try {
        const modules = await authListApi.getAllModuleNames();
        if (Array.isArray(modules)) {
          setModuleOptions(modules);
        }
      } catch (error: any) {
        console.error("Error fetching modules:", error);
        toast.error("Failed to load modules");
      } finally {
        setIsFetchingModules(false);
      }

      setIsFetchingRoles(true);
      try {
        const roles = await authListApi.getAllRoles();
        if (Array.isArray(roles)) {
          setRoleOptions(roles);
        }
      } catch (error: any) {
        console.error("Error fetching roles:", error);
        toast.error("Failed to load roles");
      } finally {
        setIsFetchingRoles(false);
      }
    };

    fetchData();
  }, []);

  const handleSubmit = async (values: any, { setSubmitting }: any) => {
    try {
      await onSubmit(values);
    } catch (error) {
      console.error('onSubmit error:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const isLoadingData = isLoading || isFetchingModules || isFetchingRoles;

  const initialValues = {
    password: initialData.password || '',
    confirmPassword: initialData.confirmPassword || '',
    role: initialData.role || '',
    modules: initialData.modules || [],
  };

  return (
      <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="w-full"
      >
        <div className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-xl rounded-2xl shadow-xl border border-white/20 dark:border-slate-700/50 p-6">
          {/* Header */}
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl shadow-lg">
              <Lock className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100">
                {isEditMode ? "Edit Account Information" : "Account Basic Information"}
              </h2>
              {employee && (
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    {isEditMode ? "Editing account for:" : "Creating account for:"}{" "}
                    <span className="font-semibold text-emerald-600 dark:text-emerald-400">{employee.name}</span>
                  </p>
              )}
            </div>
          </div>

          <Formik
              initialValues={initialValues}
              validationSchema={getValidationSchema(isEditMode)}
              onSubmit={handleSubmit}
              validateOnChange
              validateOnBlur
          >
            {({
                values,
                errors,
                touched,
                handleChange,
                handleBlur,
                setFieldValue,
                isSubmitting,
                isValid,
              }) => (
                <Form className="space-y-6">
                  {/* Password and Confirm Password Row */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    {/* Password Field */}
                    <div className="space-y-2">
                      <Label htmlFor="password" className="text-sm font-medium text-slate-700 dark:text-slate-300 flex items-center gap-2">
                        <Key className="w-4 h-4" />
                        Password {!isEditMode && <span className="text-red-500">*</span>}
                      </Label>
                      <div className="relative">
                        <input
                            id="password"
                            name="password"
                            type={showPassword ? "text" : "password"}
                            value={values.password}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            placeholder="Enter password"
                            className={`w-full px-4 py-2.5 border rounded-xl pr-10 focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:bg-slate-900 dark:border-slate-700 ${
                                errors.password && touched.password
                                    ? "border-red-500"
                                    : "border-slate-200"
                            }`}
                            disabled={isLoadingData}
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600"
                        >
                          {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                      </div>
                      <ErrorMessage name="password">
                        {(msg) => (
                            <div className="text-red-500 text-xs mt-1 flex items-center gap-1">
                              <AlertCircle className="w-3 h-3" />
                              {msg}
                            </div>
                        )}
                      </ErrorMessage>
                    </div>

                    {/* Confirm Password Field */}
                    <div className="space-y-2">
                      <Label htmlFor="confirmPassword" className="text-sm font-medium text-slate-700 dark:text-slate-300 flex items-center gap-2">
                        <CheckCircle className="w-4 h-4" />
                        Confirm Password {!isEditMode && <span className="text-red-500">*</span>}
                      </Label>
                      <div className="relative">
                        <input
                            id="confirmPassword"
                            name="confirmPassword"
                            type={showConfirmPassword ? "text" : "password"}
                            value={values.confirmPassword}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            placeholder="Confirm password"
                            className={`w-full px-4 py-2.5 border rounded-xl pr-10 focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:bg-slate-900 dark:border-slate-700 ${
                                errors.confirmPassword && touched.confirmPassword
                                    ? "border-red-500"
                                    : "border-slate-200"
                            }`}
                            disabled={isLoadingData}
                        />
                        <button
                            type="button"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600"
                        >
                          {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                      </div>
                      <ErrorMessage name="confirmPassword">
                        {(msg) => (
                            <div className="text-red-500 text-xs mt-1 flex items-center gap-1">
                              <AlertCircle className="w-3 h-3" />
                              {msg}
                            </div>
                        )}
                      </ErrorMessage>
                    </div>
                  </div>

                  {/* Role Selection */}
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-slate-700 dark:text-slate-300 flex items-center gap-2">
                      <UserCog className="w-4 h-4" />
                      Role <span className="text-red-500">*</span>
                    </Label>
                    {isFetchingRoles ? (
                        <div className="flex items-center justify-center p-4 border rounded-xl bg-slate-50">
                          <div className="h-4 w-4 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin mr-2" />
                          <span className="text-sm">Loading roles...</span>
                        </div>
                    ) : (
                        <Select
                            value={values.role}
                            onValueChange={(value) => setFieldValue("role", value)}
                            disabled={isLoadingData}
                        >
                          <SelectTrigger className="w-full h-11 rounded-xl">
                            <SelectValue placeholder="Select a role" />
                          </SelectTrigger>
                          <SelectContent>
                            {roleOptions.map((role) => (
                                <SelectItem key={role.id} value={role.id}>
                                  {role.role}
                                </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                    )}
                    <ErrorMessage name="role">
                      {(msg) => (
                          <div className="text-red-500 text-xs mt-1 flex items-center gap-1">
                            <AlertCircle className="w-3 h-3" />
                            {msg}
                          </div>
                      )}
                    </ErrorMessage>
                  </div>

                  {/* Modules Selection */}
                  <div className="space-y-3">
                    <Label className="text-sm font-medium text-slate-700 dark:text-slate-300 flex items-center gap-2">
                      <Shield size={14} />
                      Modules Access <span className="text-red-500">*</span>
                    </Label>

                    {isFetchingModules ? (
                        <div className="flex items-center justify-center p-8 border rounded-xl bg-slate-50">
                          <div className="h-5 w-5 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin mr-3" />
                          <span>Loading modules...</span>
                        </div>
                    ) : moduleOptions.length === 0 ? (
                        <div className="p-4 border border-amber-200 bg-amber-50 rounded-xl">
                          <p className="text-sm text-amber-800">No modules available</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                          {moduleOptions.map((module) => (
                              <div
                                  key={module.id}
                                  className="flex items-center space-x-3 p-2 rounded-lg hover:bg-slate-50 transition-colors"
                              >
                                <Checkbox
                                    id={`module-${module.id}`}
                                    checked={values.modules.includes(module.id)}
                                    onCheckedChange={(checked) => {
                                      if (checked) {
                                        setFieldValue("modules", [...values.modules, module.id]);
                                      } else {
                                        setFieldValue(
                                            "modules",
                                            values.modules.filter((id: string) => id !== module.id)
                                        );
                                      }
                                    }}
                                    disabled={isLoadingData}
                                    className="data-[state=checked]:bg-emerald-600 h-5 w-5"
                                />
                                <label
                                    htmlFor={`module-${module.id}`}
                                    className="text-sm text-slate-700 cursor-pointer font-medium flex-1"
                                >
                                  {module.name}
                                </label>
                              </div>
                          ))}
                        </div>
                    )}
                    <ErrorMessage name="modules">
                      {(msg) => (
                          <div className="text-red-500 text-xs mt-1 flex items-center gap-1">
                            <AlertCircle className="w-3 h-3" />
                            {msg}
                          </div>
                      )}
                    </ErrorMessage>
                  </div>

                  {/* Selected Modules Summary */}
                  {values.modules.length > 0 && (
                      <div className="p-3 bg-slate-50 rounded-xl">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs font-medium text-slate-600">Selected Modules:</span>
                          <span className="text-xs text-emerald-600 font-medium">
                      {values.modules.length} module{values.modules.length !== 1 ? 's' : ''}
                    </span>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {moduleOptions
                              .filter(m => values.modules.includes(m.id))
                              .slice(0, 5)
                              .map(module => (
                                  <span key={module.id} className="text-xs px-2 py-1 bg-white rounded-lg border">
                          {module.name}
                        </span>
                              ))}
                          {values.modules.length > 5 && (
                              <span className="text-xs px-2 py-1 bg-slate-200 rounded-lg">
                        +{values.modules.length - 5} more
                      </span>
                          )}
                        </div>
                      </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex justify-between pt-6 border-t">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={onBack}
                        disabled={isLoadingData || isSubmitting}
                    >
                      {employee ? "Cancel" : "Back"}
                    </Button>
                    <Button
                        type="submit"
                        disabled={isLoadingData || isSubmitting || !isValid || moduleOptions.length === 0 || roleOptions.length === 0}
                        className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700"
                    >
                      {isLoading || isSubmitting ? (
                          <>
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                            {isEditMode ? "Updating..." : "Creating Account..."}
                          </>
                      ) : (
                          <>
                            <Sparkles className="w-4 h-4 mr-2" />
                            {isEditMode ? "Update & Continue" : "Create Account & Continue"}
                          </>
                      )}
                    </Button>
                  </div>
                </Form>
            )}
          </Formik>
        </div>
      </motion.div>
  );
};