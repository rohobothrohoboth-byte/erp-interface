import { useState } from "react";
import { motion } from "framer-motion";
import { X, FolderPlus } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { Label } from "@/shared/components/ui/label";
import { Input } from "@/shared/components/ui/input";
import toast from "react-hot-toast";

interface AddFolderDto {
  name: string;
  description?: string;
}

interface AddFolderModalProps {
  showAddModal: boolean;
  onClose: () => void;
  onAddfolder: (folder: AddFolderDto) => Promise<any>;
}

const AddFolderModal: React.FC<AddFolderModalProps> = ({
  showAddModal,
  onClose,
  onAddfolder,
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  const handleClose = () => {
    if (isLoading) return;
    setName("");
    setDescription("");
    onClose();
  };

  const handleSubmit = async () => {
    if (!name.trim()) {
      toast.error("Folder name is required");
      return;
    }

    setIsLoading(true);
    try {
      const response = await onAddfolder({ name: name.trim(), description: description.trim() });
      const msg = response?.data?.message || response?.message || "Folder created successfully";
      toast.success(msg);
      setName("");
      setDescription("");
      onClose();
    } catch (error: any) {
      toast.error(error?.message || "Something went wrong");
    } finally {
      setIsLoading(false);
    }
  };

  if (!showAddModal) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 px-6">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="bg-white rounded-xl shadow-xl w-full max-w-md"
      >
        {/* Header */}
        <div className="flex justify-between items-center border-b px-6 py-3 sticky top-0 bg-white z-10 rounded-t-xl">
          <div className="flex items-center gap-2">
            <FolderPlus size={20} className="text-emerald-600" />
            <h2 className="text-lg font-bold text-gray-800">New Folder</h2>
          </div>
          <button
            onClick={handleClose}
            disabled={isLoading}
            className="text-gray-500 hover:text-gray-700 p-2 rounded-full hover:bg-gray-100 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-5 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="folderName" className="text-sm text-gray-500">
              Folder Name <span className="text-red-500">*</span>
            </Label>
            <Input
              id="folderName"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Project Files"
              disabled={isLoading}
              className="w-full focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-transparent"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="folderDesc" className="text-sm text-gray-500">
              Description
            </Label>
            <Input
              id="folderDesc"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Optional description"
              disabled={isLoading}
              className="w-full focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="border-t px-6 py-3 rounded-b-xl">
          <div className="flex justify-center items-center gap-2">
            <Button
              className="bg-emerald-600 hover:bg-emerald-700 text-white cursor-pointer px-6"
              onClick={handleSubmit}
              disabled={!name.trim() || isLoading}
            >
              {isLoading ? "Saving..." : "Save"}
            </Button>
            <Button
              variant="outline"
              className="cursor-pointer px-6"
              onClick={handleClose}
              disabled={isLoading}
            >
              Cancel
            </Button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default AddFolderModal;
