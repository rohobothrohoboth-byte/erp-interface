import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Eye, EyeOff, Shield } from "lucide-react";
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

// Validation schema for edit mode
const getValidationSchema = (isEditMode: boolean) => {
  const baseSchema = {
    role: Yup.string().required("Role is required"),
    modules: Yup.array()
      .of(Yup.string())
      .min(1, "Please select at least one module")
      .required("Modules are required"),
  };

  if (isEditMode) {
    // In edit mode, password is optional
    return Yup.object({
      ...baseSchema,
      password: Yup.string()
        .min(6, "Password must be at least 6 characters")
        .when("confirmPassword", {
          is: (val: string) => val && val.length > 0,
          then: (schema) =>
            schema.required(
              "Password is required when confirm password is provided",
            ),
        }),
      confirmPassword: Yup.string().when("password", {
        is: (val: string) => val && val.length > 0,
        then: (schema) =>
          schema
            .required("Confirm password is required")
            .oneOf([Yup.ref("password")], "Passwords must match"),
      }),
    });
  } else {
    // In create mode, password is required
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

  // Fetch modules and roles from backend using listService
  useEffect(() => {
    const fetchData = async () => {
      // Fetch modules
      setIsFetchingModules(true);
      try {
        const modules = await authListApi.getAllModuleNames();
        if (Array.isArray(modules)) {
          setModuleOptions(modules);
        } else {
          console.error("Modules is not an array:", modules);
          toast.error("Invalid module data received from server");
        }
      } catch (error: any) {
        console.error("Error fetching modules:", error);
        toast.error("Failed to load modules");
      } finally {
        setIsFetchingModules(false);
      }

      // Fetch roles
      setIsFetchingRoles(true);
      try {
        const roles = await authListApi.getAllRoles();
        if (Array.isArray(roles)) {
          setRoleOptions(roles);
        } else {
          console.error("Roles is not an array:", roles);
          toast.error("Invalid role data received from server");
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
      console.error("Form submission error:", error);
    } finally {
      setSubmitting(false);
    }
  };

  const initialValues = {
    password: initialData.password,
    confirmPassword: initialData.confirmPassword,
    role: initialData.role,
    modules: initialData.modules,
  };

  const isLoadingData = isLoading || isFetchingModules || isFetchingRoles;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="bg-white p-6"
    >
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-800">
          {isEditMode
            ? "Edit Account Information"
            : "Account Basic Information"}
        </h2>
        {employee && (
          <div className="mt-2 text-sm text-gray-600">
            {isEditMode ? "Editing account for:" : "Creating account for:"}{" "}
            <span className="font-semibold">{employee.name}</span> (
            {employee.employeeCode})
          </div>
        )}
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
          <Form className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Password */}
              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm text-gray-500">
                  Password{" "}
                  {!isEditMode && <span className="text-red-500">*</span>}
                  {isEditMode && (
                    <span className="text-xs text-gray-400">
                      (leave blank to keep current)
                    </span>
                  )}
                </Label>
                <div className="relative">
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    value={values.password}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    placeholder={
                      isEditMode
                        ? "Enter new password (optional)"
                        : "Enter password"
                    }
                    className={`w-full px-3 py-2 border rounded-md pr-10 focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-transparent ${
                      errors.password && touched.password
                        ? "border-red-300 focus:ring-red-500"
                        : "border-gray-300"
                    }`}
                    disabled={isLoadingData}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    disabled={isLoadingData}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                <ErrorMessage name="password">
                  {(msg) => (
                    <div className="text-red-500 text-xs mt-1">{msg}</div>
                  )}
                </ErrorMessage>
              </div>

              {/* Confirm Password */}
              <div className="space-y-2">
                <Label
                  htmlFor="confirmPassword"
                  className="text-sm text-gray-500"
                >
                  Confirm Password{" "}
                  {!isEditMode && <span className="text-red-500">*</span>}
                  {isEditMode && (
                    <span className="text-xs text-gray-400">
                      (required if password is provided)
                    </span>
                  )}
                </Label>
                <div className="relative">
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    value={values.confirmPassword}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    placeholder={
                      isEditMode ? "Confirm new password" : "Confirm password"
                    }
                    className={`w-full px-3 py-2 border rounded-md pr-10 focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-transparent ${
                      errors.confirmPassword && touched.confirmPassword
                        ? "border-red-300 focus:ring-red-500"
                        : "border-gray-300"
                    }`}
                    disabled={isLoadingData}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    disabled={isLoadingData}
                  >
                    {showConfirmPassword ? (
                      <EyeOff size={18} />
                    ) : (
                      <Eye size={18} />
                    )}
                  </button>
                </div>
                <ErrorMessage name="confirmPassword">
                  {(msg) => (
                    <div className="text-red-500 text-xs mt-1">{msg}</div>
                  )}
                </ErrorMessage>
              </div>

              {/* Role Selection */}
              <div className="space-y-2">
                <Label htmlFor="role" className="text-sm text-gray-500">
                  Role <span className="text-red-500">*</span>
                </Label>
                {isFetchingRoles ? (
                  <div className="flex items-center justify-center p-3 border border-gray-200 rounded-md bg-gray-50">
                    <div className="h-4 w-4 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin mr-2" />
                    <span className="text-sm text-gray-600">
                      Loading roles...
                    </span>
                  </div>
                ) : roleOptions.length === 0 ? (
                  <div className="p-3 border border-amber-200 bg-amber-50 rounded-md">
                    <p className="text-sm text-amber-800">No roles available</p>
                  </div>
                ) : (
                  <Select
                    value={values.role}
                    onValueChange={(value) => setFieldValue("role", value)}
                    disabled={isLoadingData}
                  >
                    <SelectTrigger
                      className={`w-full focus:ring-1 focus:ring-emerald-500 ${
                        errors.role && touched.role ? "border-red-300" : ""
                      }`}
                    >
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
                {errors.role && touched.role && (
                  <div className="text-red-500 text-xs mt-1">{errors.role}</div>
                )}
              </div>
            </div>

            {/* Modules Selection */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label className="text-sm text-gray-500 flex items-center gap-2">
                  <Shield size={14} />
                  Modules Access <span className="text-red-500">*</span>
                </Label>
                {isFetchingModules && (
                  <span className="text-xs text-gray-500">
                    Loading modules...
                  </span>
                )}
              </div>

              {isFetchingModules ? (
                <div className="flex items-center justify-center p-8 border border-gray-200 rounded-lg bg-gray-50">
                  <div className="h-5 w-5 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin mr-3" />
                  <span className="text-gray-600">
                    Loading available modules...
                  </span>
                </div>
              ) : moduleOptions.length === 0 ? (
                <div className="p-4 border border-amber-200 bg-amber-50 rounded-lg">
                  <p className="text-sm text-amber-800">No modules available</p>
                  <p className="text-xs text-amber-600 mt-1">
                    Please add modules in the system first.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {moduleOptions.map((module) => (
                    <div
                      key={module.id}
                      className="flex items-center space-x-3"
                    >
                      <Checkbox
                        id={`module-${module.id}`}
                        checked={values.modules.includes(module.id)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setFieldValue("modules", [
                              ...values.modules,
                              module.id,
                            ]);
                          } else {
                            setFieldValue(
                              "modules",
                              values.modules.filter((id) => id !== module.id),
                            );
                          }
                        }}
                        disabled={isLoadingData}
                        className="data-[state=checked]:bg-emerald-600 data-[state=changed]:bg-emerald-600 data-[state=checked]:text-white data-[state=checked]:border-emerald-600 h-5 w-5"
                      />
                      <label
                        htmlFor={`module-${module.id}`}
                        className="text-sm text-gray-700 cursor-pointer font-medium flex-1"
                      >
                        {module.name}
                      </label>
                    </div>
                  ))}
                </div>
              )}
              {errors.modules && touched.modules && (
                <div className="text-red-500 text-xs mt-1">
                  {errors.modules}
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex justify-between pt-8 border-t">
              <Button
                type="button"
                variant="outline"
                onClick={onBack}
                disabled={isLoadingData || isSubmitting}
                className="px-8"
              >
                {employee ? "Cancel" : "Back"}
              </Button>
              <Button
                type="submit"
                className="bg-emerald-600 hover:bg-emerald-700 text-white px-8"
                disabled={
                  isLoadingData ||
                  isSubmitting ||
                  !isValid ||
                  moduleOptions.length === 0 ||
                  roleOptions.length === 0
                }
              >
                {isLoading || isSubmitting
                  ? isEditMode
                    ? "Updating..."
                    : "Saving..."
                  : isEditMode
                    ? "Update & Continue"
                    : "Save & Continue"}
              </Button>
            </div>
          </Form>
        )}
      </Formik>
    </motion.div>
  );
};
