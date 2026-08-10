import React from "react";
import { AlertTriangle } from "lucide-react";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/shared/components/ui/dialog";
import { Button } from "@/shared/components/ui/button";

interface DeleteSMSTemplateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  templateName: string;
}

const DeleteSMSTemplateModal: React.FC<DeleteSMSTemplateModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  templateName
}) => {
  const handleConfirm = () => {
    onConfirm();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center">Delete SMS Template</DialogTitle>
        </DialogHeader>
        
        <div className="flex flex-col items-center text-center py-4">
          <AlertTriangle className="w-12 h-12 text-red-500 mb-4" />
          <p className="text-gray-700 mb-2">
            Are you sure you want to delete
          </p>
          <p className="font-semibold text-gray-900 mb-4">
            "{templateName}"?
          </p>
          <p className="text-sm text-gray-500">
            This action cannot be undone.
          </p>
        </div>

        <DialogFooter className="border-t pt-4">
          <div className="flex justify-center items-center gap-2 w-full">
            <Button
              onClick={handleConfirm}
              className="bg-red-600 hover:bg-red-700 text-white cursor-pointer px-6"
            >
              Yes, Delete!
            </Button>
            <Button
              onClick={onClose}
              variant="outline"
              className="cursor-pointer px-6"
            >
              No, Keep It.
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default DeleteSMSTemplateModal;
