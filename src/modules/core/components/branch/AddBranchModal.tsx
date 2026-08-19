import { useState } from "react";
import { motion } from "framer-motion";
import { X, BadgePlus, Building2 } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { Label } from "@/shared/components/ui/label";
import { Input } from "@/shared/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";
import { amharicRegex } from "@/shared/utils/amharic-regex";
import type { AddBranchDto, UUID } from "@/modules/core/types/branch";
import { BranchType, BranchStat } from "@/modules/core/types/enum";
import toast from 'react-hot-toast';

interface AddBranchModalProps {
  onAddBranch: (branch: AddBranchDto) => Promise<any>;
  defaultCompanyId?: string;
}

const AddBranchModal: React.FC<AddBranchModalProps> = ({
                                                         onAddBranch,
                                                         defaultCompanyId,
                                                       }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [branchName, setBranchName] = useState("");
  const [branchNameAm, setBranchNameAm] = useState("");
  const [branchCode, setBranchCode] = useState("");
  const [branchLocation, setBranchLocation] = useState("");
  const [dateOpened, setDateOpened] = useState(
      () => new Date().toISOString().split("T")[0]
  );
  const [branchType, setBranchType] = useState<BranchType>(BranchType["0"]);
  const [branchStat, setBranchStat] = useState<BranchStat>(BranchStat["0"]); // ✅ Added
  const [branchPhone, setBranchPhone] = useState("");
  const [branchEmail, setBranchEmail] = useState("");
  const [branchAddress, setBranchAddress] = useState("");
  const [branchCity, setBranchCity] = useState("");
  const [branchManagerName, setBranchManagerName] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const branchTypeOptions = Object.entries(BranchType).map(([key, value]) => ({
    key,
    value,
  }));

  const handleAmharicChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value === "" || amharicRegex.test(value)) {
      setBranchNameAm(value);
    }
  };

  const handleSubmit = async () => {
    if (!branchName.trim() || !defaultCompanyId) {
      toast.error('Please fill all required fields');
      return;
    }

    setIsLoading(true);

    try {
      const newBranch: AddBranchDto = {
        name: branchName.trim(),
        nameAm: branchNameAm.trim(),
        code: branchCode.trim(),
        location: branchLocation.trim(),
        dateOpened: new Date(dateOpened).toISOString(),
        branchType: branchType,
        branchStat: branchStat, // ✅ Added
        compId: defaultCompanyId as UUID,
        phone: branchPhone.trim(),
        email: branchEmail.trim(),
        address: branchAddress.trim(),
        city: branchCity.trim(),
        managerName: branchManagerName.trim(),
      };

      const response = await onAddBranch(newBranch);

      const successMessage =
          response?.data?.message ||
          response?.message ||
          'Branch added successfully';

      toast.success(successMessage);

      // Reset form
      setBranchName("");
      setBranchNameAm("");
      setBranchCode("");
      setBranchLocation("");
      setDateOpened(new Date().toISOString().split("T")[0]);
      setBranchType(BranchType["0"]);
      setBranchStat(BranchStat["0"]); // ✅ Reset status
      setBranchPhone("");
      setBranchEmail("");
      setBranchAddress("");
      setBranchCity("");
      setBranchManagerName("");
      setIsOpen(false);

    } catch (error: any) {
      const errorMessage = error.message || 'Failed to add branch';
      toast.error(errorMessage);
      console.error('Error adding branch:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    if (!isLoading) {
      setIsOpen(false);
    }
  };

  const modalVariants = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: { duration: 0.2, ease: "easeOut" }
    },
    exit: {
      opacity: 0,
      scale: 0.95,
      transition: { duration: 0.15, ease: "easeIn" }
    }
  };

  return (
      <>
        {/* Trigger Button */}
        <Button
            onClick={() => setIsOpen(true)}
            className="px-4 py-2 bg-slate-800 dark:bg-slate-700 hover:bg-slate-900 dark:hover:bg-slate-600 text-white rounded-lg text-sm flex items-center gap-2"
        >
          <BadgePlus size={16} />
          Add Branch
        </Button>

        {/* Modal */}
        {isOpen && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
              <motion.div
                  variants={modalVariants}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  className="bg-white dark:bg-slate-900 rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-hidden"
              >
                {/* Header */}
                <div className="flex justify-between items-center px-5 py-3 border-b border-slate-100 dark:border-slate-800">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 bg-slate-100 dark:bg-slate-800 rounded-lg">
                      <Building2 className="h-4 w-4 text-slate-600 dark:text-slate-400" />
                    </div>
                    <h2 className="text-base font-semibold text-slate-800 dark:text-slate-200">
                      Add New Branch
                    </h2>
                  </div>
                  <button
                      onClick={handleClose}
                      className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                      disabled={isLoading}
                  >
                    <X size={18} />
                  </button>
                </div>

                {/* Body */}
                <div className="px-5 py-4 space-y-4 overflow-y-auto max-h-[calc(90vh-120px)]">
                  {/* Branch Name (Amharic) */}
                  <div className="space-y-1.5">
                    <Label className="text-xs font-medium text-slate-700 dark:text-slate-300">
                      የቅርንጫፍ ስም (አማርኛ)
                    </Label>
                    <Input
                        value={branchNameAm}
                        onChange={handleAmharicChange}
                        placeholder="ምሳሌ፡ ቅርንጫፍ 1"
                        className="h-9 text-sm"
                        disabled={isLoading}
                    />
                  </div>

                  {/* Branch Name (English) */}
                  <div className="space-y-1.5">
                    <Label className="text-xs font-medium text-slate-700 dark:text-slate-300">
                      Branch Name <span className="text-red-500">*</span>
                    </Label>
                    <Input
                        value={branchName}
                        onChange={(e) => setBranchName(e.target.value)}
                        placeholder="Eg. Branch 1"
                        className="h-9 text-sm"
                        required
                        disabled={isLoading}
                    />
                  </div>

                  {/* Branch Code */}
                  <div className="space-y-1.5">
                    <Label className="text-xs font-medium text-slate-700 dark:text-slate-300">
                      Branch Code
                    </Label>
                    <Input
                        value={branchCode}
                        onChange={(e) => setBranchCode(e.target.value)}
                        placeholder="Eg. BR-001"
                        className="h-9 text-sm"
                        disabled={isLoading}
                    />
                  </div>

                  {/* Date Opened */}
                  <div className="space-y-1.5">
                    <Label className="text-xs font-medium text-slate-700 dark:text-slate-300">
                      Date Opened
                    </Label>
                    <Input
                        type="date"
                        value={dateOpened}
                        onChange={(e) => setDateOpened(e.target.value)}
                        className="h-9 text-sm"
                        disabled={isLoading}
                    />
                  </div>

                  {/* Branch Type */}
                  <div className="space-y-1.5">
                    <Label className="text-xs font-medium text-slate-700 dark:text-slate-300">
                      Branch Type <span className="text-red-500">*</span>
                    </Label>
                    <Select
                        value={branchType}
                        onValueChange={(value: BranchType) => setBranchType(value)}
                        disabled={isLoading}
                    >
                      <SelectTrigger className="h-9 text-sm">
                        <SelectValue placeholder="Select branch type" />
                      </SelectTrigger>
                      <SelectContent>
                        {branchTypeOptions.map((option) => (
                            <SelectItem key={option.key} value={option.key}>
                              {option.value}
                            </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* ✅ NEW: Branch Status */}
                  <div className="space-y-1.5">
                    <Label className="text-xs font-medium text-slate-700 dark:text-slate-300">
                      Branch Status <span className="text-red-500">*</span>
                    </Label>
                    <Select
                        value={branchStat}
                        onValueChange={(value: BranchStat) => setBranchStat(value)}
                        disabled={isLoading}
                    >
                      <SelectTrigger className="h-9 text-sm">
                        <SelectValue placeholder="Select branch status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value={BranchStat["0"]}>Active</SelectItem>
                        <SelectItem value={BranchStat["1"]}>Inactive</SelectItem>
                        <SelectItem value={BranchStat["2"]}>Under Construction</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Location */}
                  <div className="space-y-1.5">
                    <Label className="text-xs font-medium text-slate-700 dark:text-slate-300">
                      Location <span className="text-red-500">*</span>
                    </Label>
                    <Input
                        value={branchLocation}
                        onChange={(e) => setBranchLocation(e.target.value)}
                        placeholder="Eg. Addis Ababa"
                        className="h-9 text-sm"
                        disabled={isLoading}
                    />
                  </div>

                  {/* Contact Person (Manager) */}
                  <div className="space-y-1.5">
                    <Label className="text-xs font-medium text-slate-700 dark:text-slate-300">
                      Contact Person
                    </Label>
                    <Input
                        value={branchManagerName}
                        onChange={(e) => setBranchManagerName(e.target.value)}
                        placeholder="Eg. John Doe"
                        className="h-9 text-sm"
                        disabled={isLoading}
                    />
                  </div>

                  {/* Phone */}
                  <div className="space-y-1.5">
                    <Label className="text-xs font-medium text-slate-700 dark:text-slate-300">
                      Phone
                    </Label>
                    <Input
                        value={branchPhone}
                        onChange={(e) => setBranchPhone(e.target.value)}
                        placeholder="Eg. +251 911 000000"
                        className="h-9 text-sm"
                        disabled={isLoading}
                    />
                  </div>

                  {/* Email */}
                  <div className="space-y-1.5">
                    <Label className="text-xs font-medium text-slate-700 dark:text-slate-300">
                      Email
                    </Label>
                    <Input
                        type="email"
                        value={branchEmail}
                        onChange={(e) => setBranchEmail(e.target.value)}
                        placeholder="Eg. branch@example.com"
                        className="h-9 text-sm"
                        disabled={isLoading}
                    />
                  </div>

                  {/* Address */}
                  <div className="space-y-1.5">
                    <Label className="text-xs font-medium text-slate-700 dark:text-slate-300">
                      Address
                    </Label>
                    <Input
                        value={branchAddress}
                        onChange={(e) => setBranchAddress(e.target.value)}
                        placeholder="Eg. Bole, Street 5"
                        className="h-9 text-sm"
                        disabled={isLoading}
                    />
                  </div>

                  {/* City */}
                  <div className="space-y-1.5">
                    <Label className="text-xs font-medium text-slate-700 dark:text-slate-300">
                      City
                    </Label>
                    <Input
                        value={branchCity}
                        onChange={(e) => setBranchCity(e.target.value)}
                        placeholder="Eg. Addis Ababa"
                        className="h-9 text-sm"
                        disabled={isLoading}
                    />
                  </div>
                </div>

                {/* Footer */}
                <div className="px-5 py-3 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50">
                  <div className="flex justify-center gap-2">
                    <Button
                        className="bg-slate-800 dark:bg-slate-700 hover:bg-slate-900 dark:hover:bg-slate-600 text-white px-5 h-8 text-sm"
                        onClick={handleSubmit}
                        disabled={!branchName.trim() || !defaultCompanyId || isLoading}
                    >
                      {isLoading ? 'Saving...' : 'Save'}
                    </Button>
                    <Button
                        variant="outline"
                        className="px-5 h-8 text-sm"
                        onClick={handleClose}
                        disabled={isLoading}
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

export default AddBranchModal;