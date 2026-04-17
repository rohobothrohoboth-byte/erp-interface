import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send } from 'lucide-react';
import { Button } from '../../../ui/button';
import { Label } from '../../../ui/label';
import type { JobPostingListDto } from '../../../../types/hr/recruit/jobPosting';

interface PublishJobPostingModalProps {
  isOpen: boolean;
  item: JobPostingListDto | null;
  isLoading?: boolean;
  onClose: () => void;
  onSubmit: (id: string, comment: string | null) => void;
}

const PublishJobPostingModal: React.FC<PublishJobPostingModalProps> = ({
  isOpen, item, isLoading = false, onClose, onSubmit,
}) => {
  const [comment, setComment] = useState('');

  const handleClose = () => { if (!isLoading) { setComment(''); onClose(); } };
  const handleSubmit = () => { if (!item) return; onSubmit(item.id, comment || null); setComment(''); };

  return (
    <AnimatePresence>
      {isOpen && item && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 px-4"
          onClick={(e) => { if (e.target === e.currentTarget) handleClose(); }}>
          <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }} transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="bg-white rounded-xl shadow-xl max-w-md w-full">
            <div className="flex items-center gap-3 border-b px-6 py-4">
              <Send size={20} className="text-green-600" />
              <div className="flex-1">
                <h2 className="text-lg font-bold text-gray-800">Publish Job Posting</h2>
                <p className="text-xs text-gray-500">{item.postNumber} · {item.reqNumber}</p>
              </div>
            </div>
            <div className="p-6 space-y-4">
              <div className="space-y-2">
                <Label>Comment</Label>
                <textarea
                  rows={4}
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Add a publish note (optional)..."
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 resize-none disabled:opacity-50"
                  disabled={isLoading}
                />
              </div>
            </div>
            <div className="border-t px-6 py-4 bg-gray-50 rounded-b-xl flex justify-center gap-3">
              <Button type="button" variant="outline" onClick={handleClose} disabled={isLoading} className="px-6 cursor-pointer">
                Cancel
              </Button>
              <Button type="button" onClick={handleSubmit} disabled={isLoading}
                className="bg-green-600 hover:bg-green-700 text-white px-6 cursor-pointer">
                {isLoading
                  ? <><div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />Publishing...</>
                  : <><Send className="w-4 h-4 mr-2" />Publish</>}
              </Button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default PublishJobPostingModal;
