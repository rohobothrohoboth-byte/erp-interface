import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { X, PenBox, Building2 } from "lucide-react";
import { Button } from "../../ui/button";
import { Label } from "../../ui/label";
import { Input } from "../../ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../ui/select";
import type { EditDeptDto, DeptListDto, UUID } from "../../../types/core/dept";
import { amharicRegex } from "../../../utils/amharic-regex";
import { DeptStat } from "../../../types/core/enum";
import { useBranchCompanyList } from "../../../services/core/branch/branch.queries";
import toast from "react-hot-toast";

interface EditDeptModalProps {
  department: DeptListDto;
  onEditDepartment: (department: EditDeptDto) => Promise<any>;
  isOpen: boolean;
  onClose: () => void;
}

const EditDeptModal: React.FC<EditDeptModalProps> = ({
                                                       department,
                                                       onEditDepartment,
                                                       isOpen,
                                                       onClose,
                                                     }) => {
  const [editedDepartment, setEditedDepartment] = useState<EditDeptDto>({
    id: department.id,
    name: department.name,
    nameAm: department.nameAm,
    deptStat: department.deptStat,
    branchId: department.branchId,
    rowVersion: department.rowVersion,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { data: branches = [], isLoading: loadingBranches } = useBranchCompanyList();

  const deptStatusOptions = Object.entries(DeptStat);

  useEffect(() => {
    setEditedDepartment({
      id: department.id,
      name: department.name,
      nameAm: department.nameAm,
      deptStat: department.deptStat,
      branchId: department.branchId,
      rowVersion: department.rowVersion,
    });
  }, [department]);

  const handleSubmit = async () => {
    if (!editedDepartment.name || !editedDepartment.nameAm || !editedDepartment.branchId) {
      toast.error("Please fill all required fields");
      return;
    }

    setIsSubmitting(true);
    try {
      await onEditDepartment(editedDepartment);
      toast.success("Department updated successfully");
      onClose();
    } catch (error: any) {
      toast.error(error.message || "Failed to update department");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="bg-white dark:bg-slate-900 rounded-lg shadow-xl max-w-md w-full overflow-hidden"
        >
          {/* Header */}
          <div className="flex justify-between items-center px-5 py-3 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-slate-100 dark:bg-slate-800 rounded-lg">
                <PenBox className="h-4 w-4 text-slate-600 dark:text-slate-400" />
              </div>
              <h2 className="text-base font-semibold text-slate-800 dark:text-slate-200">
                Edit Department
              </h2>
            </div>
            <button
                onClick={onClose}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <X size={18} />
            </button>
          </div>

          {/* Body */}
          <div className="p-5 space-y-4">
            {/* Branch Selection */}
            <div className="space-y-1.5">
              <Label className="text-xs font-medium text-slate-700 dark:text-slate-300">
                Branch <span className="text-red-500">*</span>
              </Label>
              <Select
                  value={editedDepartment.branchId}
                  onValueChange={(value) => setEditedDepartment(prev => ({ ...prev, branchId: value as UUID }))}
                  disabled={loadingBranches || isSubmitting}
              >
                <SelectTrigger className="h-9 text-sm">
                  <SelectValue placeholder="Select a branch" />
                </SelectTrigger>
                <SelectContent>
                  {branches.map((branch) => (
                      <SelectItem key={branch.id} value={branch.id}>
                        {branch.name}
                      </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Department Name (Amharic) */}
            <div className="space-y-1.5">
              <Label className="text-xs font-medium text-slate-700 dark:text-slate-300">
                የዲፓርትመንት ስም <span className="text-red-500">*</span>
              </Label>
              <Input
                  value={editedDepartment.nameAm}
                  onChange={(e) => {
                    const value = e.target.value;
                    if (value === "" || amharicRegex.test(value)) {
                      setEditedDepartment(prev => ({ ...prev, nameAm: value }));
                    }
                  }}
                  placeholder="ፋይናንስ"
                  className="h-9 text-sm"
                  disabled={isSubmitting}
              />
            </div>

            {/* Department Name (English) */}
            <div className="space-y-1.5">
              <Label className="text-xs font-medium text-slate-700 dark:text-slate-300">
                Department Name <span className="text-red-500">*</span>
              </Label>
              <Input
                  value={editedDepartment.name}
                  onChange={(e) => setEditedDepartment(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Finance"
                  className="h-9 text-sm"
                  disabled={isSubmitting}
              />
            </div>

            {/* Status */}
            <div className="space-y-1.5">
              <Label className="text-xs font-medium text-slate-700 dark:text-slate-300">
                Status
              </Label>
              <Select
                  value={editedDepartment.deptStat}
                  onValueChange={(value) => setEditedDepartment(prev => ({ ...prev, deptStat: value }))}
                  disabled={isSubmitting}
              >
                <SelectTrigger className="h-9 text-sm">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  {deptStatusOptions.map(([key, label]) => (
                      <SelectItem key={key} value={key}>
                        {label}
                      </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Footer */}
          <div className="px-5 py-3 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50">
            <div className="flex justify-center gap-2">
              <Button
                  className="bg-slate-800 dark:bg-slate-700 hover:bg-slate-900 dark:hover:bg-slate-600 text-white px-5 h-8 text-sm"
                  onClick={handleSubmit}
                  disabled={!editedDepartment.name || !editedDepartment.nameAm || !editedDepartment.branchId || isSubmitting}
              >
                {isSubmitting ? "Saving..." : "Save Changes"}
              </Button>
              <Button
                  variant="outline"
                  className="px-5 h-8 text-sm"
                  onClick={onClose}
                  disabled={isSubmitting}
              >
                Cancel
              </Button>
            </div>
          </div>
        </motion.div>
      </div>
  );
};

export default EditDeptModal;