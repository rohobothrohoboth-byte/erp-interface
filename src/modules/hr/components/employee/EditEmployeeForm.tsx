import React, { useState } from 'react';
import { X, Save, Loader2 } from 'lucide-react';
import { useLanguage } from '@/shared/i18n/LanguageContext';

// ============================================================
// TYPES
// ============================================================

interface Employee {
  id: string;
  code: string;
  empFullName: string;
  empFullNameAm?: string;
  department: string;
  position: string;
  branch?: string;
  jobGrade?: string;
  gender?: string;
  empState?: string;
  email?: string;
  phone?: string;
  [key: string]: any;
}

interface EditEmployeeFormProps {
  employee: Employee;
  onSave: (updatedEmployee: Employee) => void;
  onClose: () => void;
  isSaving?: boolean;
}

// ============================================================
// MAIN COMPONENT
// ============================================================

const EditEmployeeForm: React.FC<EditEmployeeFormProps> = ({
                                                             employee,
                                                             onSave,
                                                             onClose,
                                                             isSaving = false,
                                                           }) => {
  const { t } = useLanguage();
  const [formData, setFormData] = useState<Employee>({ ...employee });

  const handleChange = (
      e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  // Department options
  const departments = ['Finance', 'Engineering', 'Product', 'Marketing', 'HR', 'Operations', 'Sales', 'IT'];

  // Status options
  const statusOptions = ['Active', 'Pending', 'On Leave', 'Suspended', 'Terminated', 'Retired'];

  // Gender options
  const genderOptions = ['Male', 'Female', 'Other'];

  return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
        <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-700">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-xl">
                <Save className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>
              <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-200">
                {t.editEmployee || 'Edit Employee'}
              </h2>
            </div>
            <button
                onClick={onClose}
                disabled={isSaving}
                className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Full Name */}
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  {t.fullName || 'Full Name'} <span className="text-red-500">*</span>
                </label>
                <input
                    type="text"
                    name="empFullName"
                    value={formData.empFullName || ''}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200"
                    required
                />
              </div>

              {/* Code */}
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  {t.code || 'Code'} <span className="text-red-500">*</span>
                </label>
                <input
                    type="text"
                    name="code"
                    value={formData.code || ''}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200"
                    required
                />
              </div>

              {/* Department */}
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  {t.department || 'Department'} <span className="text-red-500">*</span>
                </label>
                <select
                    name="department"
                    value={formData.department || ''}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200"
                    required
                >
                  <option value="">Select Department</option>
                  {departments.map((dept) => (
                      <option key={dept} value={dept}>
                        {dept}
                      </option>
                  ))}
                </select>
              </div>

              {/* Position */}
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  {t.position || 'Position'} <span className="text-red-500">*</span>
                </label>
                <input
                    type="text"
                    name="position"
                    value={formData.position || ''}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200"
                    required
                />
              </div>

              {/* Branch */}
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  {t.branch || 'Branch'}
                </label>
                <input
                    type="text"
                    name="branch"
                    value={formData.branch || ''}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200"
                />
              </div>

              {/* Job Grade */}
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  {t.jobGrade || 'Job Grade'}
                </label>
                <input
                    type="text"
                    name="jobGrade"
                    value={formData.jobGrade || ''}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200"
                />
              </div>

              {/* Gender */}
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  {t.gender || 'Gender'}
                </label>
                <select
                    name="gender"
                    value={formData.gender || ''}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200"
                >
                  <option value="">Select Gender</option>
                  {genderOptions.map((gender) => (
                      <option key={gender} value={gender}>
                        {gender}
                      </option>
                  ))}
                </select>
              </div>

              {/* Status */}
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  {t.status || 'Status'}
                </label>
                <select
                    name="empState"
                    value={formData.empState || ''}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200"
                >
                  <option value="">Select Status</option>
                  {statusOptions.map((status) => (
                      <option key={status} value={status}>
                        {status}
                      </option>
                  ))}
                </select>
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  {t.email || 'Email'}
                </label>
                <input
                    type="email"
                    name="email"
                    value={formData.email || ''}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200"
                />
              </div>

              {/* Phone */}
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  {t.phone || 'Phone'}
                </label>
                <input
                    type="tel"
                    name="phone"
                    value={formData.phone || ''}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200"
                />
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-3 mt-6 pt-4 border-t border-slate-200 dark:border-slate-700">
              <button
                  type="button"
                  onClick={onClose}
                  disabled={isSaving}
                  className="px-5 py-2 text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
              >
                {t.cancel || 'Cancel'}
              </button>
              <button
                  type="submit"
                  disabled={isSaving}
                  className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 text-white text-sm font-medium rounded-lg hover:shadow-lg transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSaving ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      {t.saving || 'Saving...'}
                    </>
                ) : (
                    <>
                      <Save className="w-4 h-4" />
                      {t.saveChanges || 'Save Changes'}
                    </>
                )}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
  );
};

export default EditEmployeeForm;