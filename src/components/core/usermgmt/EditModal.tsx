import { useState, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, PenBox } from "lucide-react";
import { Button } from "../../../components/ui/button";

interface EditModalProps {
  onEdit: () => void;
  title?: string;
  children?: React.ReactNode;
}

const EditModal: React.FC<EditModalProps> = ({
                                               onEdit,
                                               title = "Edit",
                                               children,
                                             }) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleOpen = useCallback(() => setIsOpen(true), []);
  const handleClose = useCallback(() => setIsOpen(false), []);
  const handleSubmit = useCallback(() => {
    onEdit();
    handleClose();
  }, [onEdit, handleClose]);

  // Close on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) handleClose();
    };
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [isOpen, handleClose]);

  // Prevent body scroll
  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [isOpen]);

  return (
      <>
        <div
            onClick={handleOpen}
            className="w-full cursor-pointer"
            role="button"
            tabIndex={0}
            onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && handleOpen()}
        >
          <div className="flex items-center gap-2">
            <PenBox size={16} />
            Edit
          </div>
        </div>

        <AnimatePresence>
          {isOpen && (
              <div
                  className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 px-6"
                  onClick={(e) => e.target === e.currentTarget && handleClose()}
              >
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
                >
                  <div className="sticky top-0 bg-white z-10 flex justify-between items-center border-b px-6 py-4">
                    <div className="flex items-center gap-2">
                      <PenBox size={20} />
                      <h2 className="text-lg font-semibold text-gray-800">{title}</h2>
                    </div>
                    <button onClick={handleClose} className="p-2 rounded-full hover:bg-gray-100">
                      <X size={24} />
                    </button>
                  </div>

                  {children && <div className="px-6 py-4">{children}</div>}

                  <div className="sticky bottom-0 bg-gray-50 border-t px-6 py-4">
                    <div className="flex justify-center gap-3">
                      <Button className="bg-emerald-600 hover:bg-emerald-700" onClick={handleSubmit}>
                        Save Changes
                      </Button>
                      <Button variant="outline" onClick={handleClose}>
                        Cancel
                      </Button>
                    </div>
                  </div>
                </motion.div>
              </div>
          )}
        </AnimatePresence>
      </>
  );
};

export default EditModal;