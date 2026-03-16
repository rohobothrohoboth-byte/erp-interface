import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Users } from 'lucide-react';
import { Button } from '../../../ui/button';
import { Input } from '../../../ui/input';
import { Label } from '../../../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../ui/select';
import type { LeadGroup } from './LeadGroupingSection';

interface AddLeadGroupModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (groupData: Omit<LeadGroup, 'id' | 'leadCount' | 'createdAt' | 'updatedAt'>) => void;
  editingGroup: LeadGroup | null;
}

export default function AddLeadGroupModal({ isOpen, onClose, onSubmit, editingGroup }: AddLeadGroupModalProps) {
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [status, setStatus] = useState<'Active' | 'Inactive'>('Active');

  useEffect(() => {
    if (editingGroup) {
      setName(editingGroup.name);
      setCode(editingGroup.code);
      setStatus(editingGroup.status);
    } else {
      setName(''); setCode(''); setStatus('Active');
    }
  }, [editingGroup, isOpen]);

  const handleSubmit = () => {
    if (!name.trim() || !code.trim()) return;
    onSubmit({ name, code, status });
    setName(''); setCode(''); setStatus('Active');
    onClose();
  };

  const handleClose = () => {
    setName(''); setCode(''); setStatus('Active');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 px-6">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="bg-white rounded-xl shadow-xl max-w-md w-full"
      >
        {/* Header */}
        <div className="flex items-center gap-2 border-b px-6 py-2">
          <Users size={20} className="text-orange-600" />
          <h2 className="text-lg font-bold text-gray-800">
            {editingGroup ? 'Edit Lead Group' : 'Add Lead Group'}
          </h2>
        </div>

        {/* Body */}
        <div className="px-6 py-4 space-y-3">
          <div className="space-y-2">
            <Label htmlFor="name" className="text-sm text-gray-500">
              Name <span className="text-red-500">*</span>
            </Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., High Value Prospects"
              className="w-full focus:outline-none focus:ring-1 focus:ring-orange-500 focus:border-transparent"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="code" className="text-sm text-gray-500">
              Code <span className="text-red-500">*</span>
            </Label>
            <Input
              id="code"
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              placeholder="e.g., HVP"
              maxLength={10}
              className="w-full focus:outline-none focus:ring-1 focus:ring-orange-500 focus:border-transparent"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="status" className="text-sm text-gray-500">Status</Label>
            <Select value={status} onValueChange={(v: 'Active' | 'Inactive') => setStatus(v)}>
              <SelectTrigger className="w-full focus:outline-none focus:ring-1 focus:ring-orange-500 focus:border-transparent">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Active">Active</SelectItem>
                <SelectItem value="Inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t px-6 py-2">
          <div className="flex justify-center items-center gap-1.5">
            <Button
              className="bg-orange-600 hover:bg-orange-700 text-white px-6"
              onClick={handleSubmit}
              disabled={!name.trim() || !code.trim()}
            >
              {editingGroup ? 'Update' : 'Save'}
            </Button>
            <Button variant="outline" className="px-6" onClick={handleClose}>
              Cancel
            </Button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
