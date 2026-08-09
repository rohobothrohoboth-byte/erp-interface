import React from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Button } from '../../ui/button';

type Props = {
  open: boolean;
  title: string;
  onClose: () => void;
  onSubmit?: () => void;
  submitLabel?: string;
  loading?: boolean;
  children: React.ReactNode;
};

const SimpleModal: React.FC<Props> = ({
  open, title, onClose, onSubmit, submitLabel = 'Save', loading, children,
}) => (
  <AnimatePresence>
    {open && (
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center px-4"
        onClick={(e) => { if (e.target === e.currentTarget && !loading) onClose(); }}
      >
        <motion.div
          initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 16 }}
          className="bg-white rounded-xl shadow-xl w-full max-w-xl max-h-[90vh] overflow-y-auto"
        >
          <div className="px-6 py-4 border-b font-semibold text-gray-900">{title}</div>
          <div className="p-6 space-y-3">{children}</div>
          <div className="px-6 py-4 border-t flex justify-end gap-2">
            <Button variant="outline" onClick={onClose} disabled={loading}>Cancel</Button>
            {onSubmit && (
              <Button className="bg-green-700 hover:bg-green-800 text-white" onClick={onSubmit} disabled={loading}>
                {loading ? 'Saving…' : submitLabel}
              </Button>
            )}
          </div>
        </motion.div>
      </motion.div>
    )}
  </AnimatePresence>
);

export default SimpleModal;
