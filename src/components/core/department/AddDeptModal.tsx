import { useState,useEffect } from "react";
import { motion } from "framer-motion";
import { X, BadgePlus, Building2 } from "lucide-react";
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
import type { AddDeptDto, UUID } from "../../../types/core/dept";
import type { BranchCompListDto } from "../../../types/core/branch";
import { amharicRegex } from "../../../utils/amharic-regex";
import { useBranchCompanyList } from "../../../services/core/branch/branch.queries";
import toast from "react-hot-toast";

interface AddDeptModalProps {
  onAddDepartment: (department: AddDeptDto) => Promise<any>;
}

const AddDeptModal: React.FC<AddDeptModalProps> = ({ onAddDepartment }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [newDepartment, setNewDepartment] = useState({
    name: "",
    nameAm: "",
    branchId: "" as UUID,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);


  const {
    data: branches = [],
    isLoading: loadingBranches,
    error: branchError
  } = useBranchCompanyList();

// Add this useEffect to see what's happening
  useEffect(() => {
    console.log('Branches data:', branches);
    console.log('Branches loading:', loadingBranches);
    console.log('Branches error:', branchError);
  }, [branches, loadingBranches, branchError]);
  const handleAmharicChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value === "" || amharicRegex.test(value)) {
      setNewDepartment((prev) => ({ ...prev, nameAm: value }));
    }
  };

  const handleSubmit = async () => {
    if (!newDepartment.name || !newDepartment.nameAm || !newDepartment.branchId) {
      toast.error("Please fill all required fields");
      return;
    }

    setIsSubmitting(true);

    try {
      await onAddDepartment({
        name: newDepartment.name.trim(),
        nameAm: newDepartment.nameAm.trim(),
        branchId: newDepartment.branchId,
      });

      toast.success("Department added successfully");
      setNewDepartment({ name: "", nameAm: "", branchId: "" as UUID });
      setIsOpen(false);
    } catch (error: any) {
      toast.error(error.message || "Failed to add department");
    } finally {
      setIsSubmitting(false);
    }
  };

  const modalVariants = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: { opacity: 1, scale: 1, transition: { duration: 0.2 } },
    exit: { opacity: 0, scale: 0.95, transition: { duration: 0.15 } }
  };

  return (
      <>
        <Button
            onClick={() => setIsOpen(true)}
            className="bg-slate-800 dark:bg-slate-700 hover:bg-slate-900 dark:hover:bg-slate-600 text-white rounded-lg text-sm flex items-center gap-2"
        >
          <BadgePlus size={16} />
          Add Department
        </Button>

        {isOpen && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
              <motion.div
                  variants={modalVariants}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  className="bg-white dark:bg-slate-900 rounded-lg shadow-xl max-w-md w-full overflow-hidden"
              >
                {/* Header */}
                <div className="flex justify-between items-center px-5 py-3 border-b border-slate-100 dark:border-slate-800">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 bg-slate-100 dark:bg-slate-800 rounded-lg">
                      <Building2 className="h-4 w-4 text-slate-600 dark:text-slate-400" />
                    </div>
                    <h2 className="text-base font-semibold text-slate-800 dark:text-slate-200">
                      Add Department
                    </h2>
                  </div>
                  <button
                      onClick={() => setIsOpen(false)}
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
                        value={newDepartment.branchId}
                        onValueChange={(value) => setNewDepartment(prev => ({ ...prev, branchId: value as UUID }))}
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
                        value={newDepartment.nameAm}
                        onChange={handleAmharicChange}
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
                        value={newDepartment.name}
                        onChange={(e) => setNewDepartment(prev => ({ ...prev, name: e.target.value }))}
                        placeholder="Finance"
                        className="h-9 text-sm"
                        disabled={isSubmitting}
                    />
                  </div>
                </div>

                {/* Footer */}
                <div className="px-5 py-3 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50">
                  <div className="flex justify-center gap-2">
                    <Button
                        className="bg-slate-800 dark:bg-slate-700 hover:bg-slate-900 dark:hover:bg-slate-600 text-white px-5 h-8 text-sm"
                        onClick={handleSubmit}
                        disabled={!newDepartment.name || !newDepartment.nameAm || !newDepartment.branchId || isSubmitting}
                    >
                      {isSubmitting ? "Saving..." : "Save"}
                    </Button>
                    <Button
                        variant="outline"
                        className="px-5 h-8 text-sm"
                        onClick={() => setIsOpen(false)}
                        disabled={isSubmitting}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              </motion.div>
            </div>
        )}
      </>
  );
};

export default AddDeptModal;