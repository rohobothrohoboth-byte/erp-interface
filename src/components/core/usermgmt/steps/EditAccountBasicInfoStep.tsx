import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Shield, Trash2 } from "lucide-react";
import { Formik, Form } from "formik";
import * as Yup from "yup";
import { Button } from "../../../../components/ui/button";
import { Label } from "../../../../components/ui/label";
import { Checkbox } from "../../../../components/ui/checkbox";
import { authListApi } from "../../../../services/List/auth/authList.api";
import type { NameListItem } from "../../../../types/NameList/nameList";
import toast from "react-hot-toast";
import { usermgmtApi } from "../../../../services/core/usermgmt/usermgmt.api";
import type { UUID } from "../../../../types/hr/employee";

interface EditAccountBasicInfoStepProps {
  initialData: {
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
  onBackToAccounts: () => void;
  onAccountDeleted?: (result: any) => void;
}

// Simple validation schema for edit mode - only modules
const validationSchema = Yup.object({
  modules: Yup.array()
    .of(Yup.string())
    .min(1, "Please select at least one module")
    .required("Modules are required"),
});

export const EditAccountBasicInfoStep: React.FC<
  EditAccountBasicInfoStepProps
> = ({ initialData, onSubmit, onBack, isLoading, employee, onBackToAccounts,
  onAccountDeleted, }) => {
  const [moduleOptions, setModuleOptions] = useState<NameListItem[]>([]);
  const [isFetchingModules, setIsFetchingModules] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
      const [error, setError] = useState<string | null>(null);
    

  // Fetch modules from backend using listService
  useEffect(() => {
    const fetchModules = async () => {
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
    };

    fetchModules();
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
    modules: initialData.modules,
  };

   const handleDeleteAccount = async (userId: string) => {
      setIsDeleting(true);
      setError(null);
  
      try {
        await usermgmtApi.deleteAccount(userId as UUID);
  
        toast.success("Account deleted successfully!");
  
        // Call the callback if provided
        if (onAccountDeleted) {
          onAccountDeleted({
            success: true,
            message: "Account deleted successfully",
            userId: userId,
            employeeId: employee?.id || "",
          });
        } else {
          // Fallback to onBackToAccounts if no delete callback
          onBackToAccounts();
        }
      } catch (error: any) {
        console.error("Failed to delete account:", error);
        const errorMessage =
          error.message || "Failed to delete account. Please try again.";
        setError(errorMessage);
        toast.error(errorMessage);
      } finally {
        setIsDeleting(false);
        setShowDeleteConfirm(false);
      }
    };

  const isLoadingData = isLoading || isFetchingModules;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="bg-white p-5"
    >
      <div className="p-2 flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800">
          Edit Account Modules
        </h2>
                <Button
                  onClick={() => setShowDeleteConfirm(true)}
                  disabled={isDeleting || isLoading}
                  className="flex items-center gap-2 px-3 py-1.5 bg-red-100 text-red-700 hover:bg-red-200 rounded-md text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Trash2 size={14} />
                  Delete Account
                </Button>
          
      </div>
  <div className="p-3 text-sm text-gray-500">
          Select the modules this user should have access to.
        </div>
      <Formik
        initialValues={initialValues}
        validationSchema={validationSchema}
        onSubmit={handleSubmit}
        validateOnChange
        validateOnBlur
      >
        {({
          values,
          errors,
          touched,
          setFieldValue,
          isSubmitting,
          isValid,
        }) => (
          <Form className="space-y-8">
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
                Cancel
              </Button>
              <Button
                type="submit"
                className="bg-emerald-600 hover:bg-emerald-700 text-white px-8"
                disabled={
                  isLoadingData ||
                  isSubmitting ||
                  !isValid ||
                  moduleOptions.length === 0
                }
              >
                {isLoading || isSubmitting
                  ? "Updating..."
                  : "Update & Continue"}
              </Button>
            </div>
          </Form>
        )}
      </Formik>
    </motion.div>
  );
};
