import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Users } from 'lucide-react';
import { Button } from '../../../ui/button';
import { Input } from '../../../ui/input';
import { Label } from '../../../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../ui/select';
import type { ContactGroup } from './ContactGroupingSection';

interface AddContactGroupModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (groupData: Omit<ContactGroup, 'id' | 'contactCount' | 'createdAt' | 'updatedAt'>) => void;
  editingGroup: ContactGroup | null;
}

export default function AddContactGroupModal({
  isOpen,
  onClose,
  onSubmit,
  editingGroup
}: AddContactGroupModalProps) {
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [status, setStatus] = useState<'Active' | 'Inactive'>('Active');

  useEffect(() => {
    if (editingGroup) {
      setName(editingGroup.name);
      setCode(editingGroup.code);
      setStatus(editingGroup.status);
    } else {
      resetForm();
    }
  }, [editingGroup, isOpen]);

  const resetForm = () => {
    setName('');
    setCode('');
    setStatus('Active');
  };

  const handleSubmit = () => {
    if (!name.trim() || !code.trim()) {
      alert('Please fill in all required fields');
      return;
    }
    onSubmit({ name, code, status });
    resetForm();
    onClose();
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 px-6">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="bg-white rounded-xl shadow-xl max-w-xl w-full max-h-[90vh] overflow-y-auto"
      >
        <div className="flex items-center gap-2 border-b px-6 py-4 sticky top-0 bg-white z-10">
          <Users className="w-5 h-5 text-orange-600" />
          <h2 className="text-base font-semibold text-gray-800">
            {editingGroup ? 'Edit Contact Group' : 'Add Contact Group'}
          </h2>
        </div>

        <div className="px-6">
          <div className="py-4 space-y-3">
            <div className="space-y-1">
              <Label htmlFor="name">Name <span className="text-red-500">*</span></Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g., VIP Customers"
              />
            </div>

            <div className="space-y-1">
              <Label htmlFor="code">Code <span className="text-red-500">*</span></Label>
              <Input
                id="code"
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                placeholder="e.g., VIP"
                maxLength={10}
              />
            </div>

            <div className="space-y-1">
              <Label htmlFor="status">Status</Label>
              <Select value={status} onValueChange={(value: 'Active' | 'Inactive') => setStatus(value)}>
                <SelectTrigger className='w-full'>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Active">Active</SelectItem>
                  <SelectItem value="Inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        <div className="border-t px-6 py-2">
          <div className="mx-auto flex justify-center items-center gap-1.5">
            <Button variant="outline" onClick={handleClose}>Cancel</Button>
            <Button onClick={handleSubmit} className="bg-orange-600 hover:bg-orange-700 text-white">
              {editingGroup ? 'Update' : 'Save'}
            </Button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
