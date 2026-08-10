import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogClose,
} from "@/shared/components/ui/dialog";
import { Button } from "@/shared/components/ui/button";
import { AlertTriangle, Menu } from "lucide-react";

import { useState } from "react";
import type { PerMenuListDto, UUID } from "@/modules/core/types/Settings/menu-permissions";

interface DeleteLeavePolicyConfigProps {
  permission: PerMenuListDto | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (permissionId: UUID) => Promise<any>;
}

const DeleteLeavePolicyConfig: React.FC<DeleteLeavePolicyConfigProps> = ({
  permission,
  isOpen,
  onClose,
  onConfirm,
}) => {
  const [isLoading, setIsLoading] = useState(false);

  const handleConfirm = async () => {
    if (!permission) return;

    setIsLoading(true);

    try {
      const response = await onConfirm(permission.id);
      console.log("Menu permission deleted successfully:", response);
      onClose();
    } catch (error: any) {
      console.error("Error deleting menu permission:", error);
      alert(error.message || "Failed to delete menu permission");
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    if (!isLoading) {
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent
        className="sm:max-w-[425px]"
        onInteractOutside={(e) => e.preventDefault()}
      >
        <DialogHeader>
          <div className="flex items-center justify-center p-3 bg-red-100 rounded-full gap-2 text-red-600 mx-auto">
            <AlertTriangle size={32} />
          </div>
        </DialogHeader>
        {permission && (
          <div className="py-4 text-center space-y-4">
            <p className="text-lg font-medium text-red-600">
              Are you sure you want to delete this menu permission?
            </p>
          </div>
        )}

        <DialogFooter className="border-t pt-6">
          <div className="mx-auto flex justify-center items-center gap-1.5">
            <Button
              variant="destructive"
              onClick={handleConfirm}
              className="cursor-pointer px-6"
              disabled={isLoading}
            >
              {isLoading ? "Deleting..." : "Yes, Delete!"}
            </Button>
            <DialogClose asChild>
              <Button
                variant="outline"
                className="cursor-pointer px-6"
                disabled={isLoading}
              >
                No, Keep it.
              </Button>
            </DialogClose>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default DeleteLeavePolicyConfig;
