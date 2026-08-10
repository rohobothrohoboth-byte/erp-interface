import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ArrowRight, Calendar, Building, FileText, Save } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import { Textarea } from '@/shared/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/components/ui/select';
import { showToast } from '@/shared/layout/layout';
import type { FixedAsset } from '@/modules/finance/components/assets/assetRegister/types';

interface AssetTransferModalProps {
  isOpen: boolean;
  onClose: () => void;
  asset: FixedAsset | null;
  onSubmit: (data: any) => void;
}

const AssetTransferModal: React.FC<AssetTransferModalProps> = ({
  isOpen,
  onClose,
  asset,
  onSubmit,
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    transfer_date: new Date().toISOString().split('T')[0],
    from_department: '',
    to_department: '',
    from_location: '',
    to_location: '',
    reason: '',
    notes: '',
  });

  // Update form data when asset changes
  useEffect(() => {
    if (asset) {
      // Map asset department to department ID
      const deptMapping: { [key: string]: string } = {
        'IT Department': 'IT',
        'Human Resources': 'HR',
        'Finance': 'FIN',
        'Operations': 'OPS',
        'Marketing': 'MKT',
        'Administration': 'ADM',
        'Executive': 'EXE',
      };
      
      // Map asset location to location ID
      const locationMapping: { [key: string]: string } = {
        'Head Office - Floor 1': 'HO-F1',
        'Head Office - Floor 2': 'HO-F2',
        'Head Office - Floor 3': 'HO-F3',
        'Branch - Addis Ababa': 'BR-ADD',
        'Branch - Bahir Dar': 'BR-BAH',
        'Warehouse - Main': 'WH-001',
        'Company Garage': 'GAR-001',
      };

      setFormData(prev => ({
        ...prev,
        from_department: deptMapping[asset.department || ''] || 'IT',
        from_location: locationMapping[asset.location || ''] || 'HO-F3',
      }));
    }
  }, [asset]);

  // Mock departments and locations
  const departments = [
    { id: 'IT', name: 'IT Department' },
    { id: 'HR', name: 'Human Resources' },
    { id: 'FIN', name: 'Finance' },
    { id: 'OPS', name: 'Operations' },
    { id: 'MKT', name: 'Marketing' },
    { id: 'ADM', name: 'Administration' },
    { id: 'EXE', name: 'Executive' },
  ];

  const locations = [
    { id: 'HO-F1', name: 'Head Office - Floor 1' },
    { id: 'HO-F2', name: 'Head Office - Floor 2' },
    { id: 'HO-F3', name: 'Head Office - Floor 3' },
    { id: 'BR-ADD', name: 'Branch - Addis Ababa' },
    { id: 'BR-BAH', name: 'Branch - Bahir Dar' },
    { id: 'WH-001', name: 'Warehouse - Main' },
    { id: 'GAR-001', name: 'Company Garage' },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!asset) return;

    if (formData.from_department === formData.to_department) {
      showToast.error('Source and destination departments cannot be the same');
      return;
    }

    if (!formData.to_department || !formData.to_location) {
      showToast.error('Please select destination department and location');
      return;
    }

    if (!formData.reason.trim()) {
      showToast.error('Please provide a reason for transfer');
      return;
    }

    setIsLoading(true);

    try {
      const fromDept = departments.find(d => d.id === formData.from_department);
      const toDept = departments.find(d => d.id === formData.to_department);
      const fromLoc = locations.find(l => l.id === formData.from_location);
      const toLoc = locations.find(l => l.id === formData.to_location);

      await onSubmit({
        asset_id: asset.id,
        transfer_date: formData.transfer_date,
        from_department: fromDept?.name,
        to_department: toDept?.name,
        from_location: fromLoc?.name,
        to_location: toLoc?.name,
        reason: formData.reason,
        notes: formData.notes,
      });

      handleClose();
    } catch (error) {
      console.error('Error transferring asset:', error);
      showToast.error('Error transferring asset');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setFormData({
      transfer_date: new Date().toISOString().split('T')[0],
      from_department: '',
      to_department: '',
      from_location: '',
      to_location: '',
      reason: '',
      notes: '',
    });
    onClose();
  };

  if (!isOpen || !asset) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 px-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
        >
          {/* Header */}
          <div className="flex justify-between items-center border-b px-6 py-2 sticky top-0 bg-white z-10">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-indigo-100 rounded-lg">
                <ArrowRight className="w-4 h-4 text-indigo-600" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-800">Asset Transfer</h2>
              </div>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit}>
            <div className="px-6 py-4 space-y-4">
              <div className="space-y-2">
                <Label htmlFor="transfer_date" className="flex items-center gap-2">
                  <Calendar size={16} />
                  Transfer Date <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="transfer_date"
                  type="date"
                  value={formData.transfer_date}
                  onChange={(e) => setFormData({ ...formData, transfer_date: e.target.value })}
                  className="border-gray-300 focus:ring-1 focus:ring-indigo-500 focus:border-transparent"
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="from_department" className="flex items-center gap-2">
                    <Building size={16} />
                    From Department
                  </Label>
                  <Select value={formData.from_department} onValueChange={(value) => setFormData({ ...formData, from_department: value })}>
                    <SelectTrigger className="w-full border-gray-300 focus:ring-1 focus:ring-indigo-500 focus:border-transparent">
                      <SelectValue placeholder="Select source department" />
                    </SelectTrigger>
                    <SelectContent>
                      {departments.map(dept => (
                        <SelectItem key={dept.id} value={dept.id}>
                          {dept.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="to_department" className="flex items-center gap-2">
                    <Building size={16} />
                    To Department <span className="text-red-500">*</span>
                  </Label>
                  <Select value={formData.to_department} onValueChange={(value) => setFormData({ ...formData, to_department: value })}>
                    <SelectTrigger className="w-full border-gray-300 focus:ring-1 focus:ring-indigo-500 focus:border-transparent">
                      <SelectValue placeholder="Select destination department" />
                    </SelectTrigger>
                    <SelectContent>
                      {departments.filter(d => d.id !== formData.from_department).map(dept => (
                        <SelectItem key={dept.id} value={dept.id}>
                          {dept.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="from_location">From Location</Label>
                  <Select value={formData.from_location} onValueChange={(value) => setFormData({ ...formData, from_location: value })}>
                    <SelectTrigger className="w-full border-gray-300 focus:ring-1 focus:ring-indigo-500 focus:border-transparent">
                      <SelectValue placeholder="Select source location" />
                    </SelectTrigger>
                    <SelectContent>
                      {locations.map(loc => (
                        <SelectItem key={loc.id} value={loc.id}>
                          {loc.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="to_location">To Location <span className="text-red-500">*</span></Label>
                  <Select value={formData.to_location} onValueChange={(value) => setFormData({ ...formData, to_location: value })}>
                    <SelectTrigger className="w-full border-gray-300 focus:ring-1 focus:ring-indigo-500 focus:border-transparent">
                      <SelectValue placeholder="Select destination location" />
                    </SelectTrigger>
                    <SelectContent>
                      {locations.map(loc => (
                        <SelectItem key={loc.id} value={loc.id}>
                          {loc.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="reason" className="flex items-center gap-2">
                  <FileText size={16} />
                  Reason for Transfer <span className="text-red-500">*</span>
                </Label>
                <Select value={formData.reason} onValueChange={(value) => setFormData({ ...formData, reason: value })}>
                  <SelectTrigger className="w-full border-gray-300 focus:ring-1 focus:ring-indigo-500 focus:border-transparent">
                    <SelectValue placeholder="Select reason for transfer" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="departmental_restructure">Departmental Restructure</SelectItem>
                    <SelectItem value="operational_needs">Operational Needs</SelectItem>
                    <SelectItem value="employee_transfer">Employee Transfer</SelectItem>
                    <SelectItem value="space_optimization">Space Optimization</SelectItem>
                    <SelectItem value="maintenance">Maintenance Requirements</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">Additional Notes</Label>
                <Textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="border-gray-300 focus:ring-1 focus:ring-indigo-500 focus:border-transparent"
                  placeholder="Enter any additional notes about the transfer..."
                  rows={3}
                />
              </div>
            </div>

            {/* Footer */}
            <div className="border-t px-6 py-4 bg-gray-50">
              <div className="flex justify-center gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleClose}
                  className="px-6"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isLoading}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 flex items-center gap-2"
                >
                  {isLoading ? 'Transferring...' : ' Transfer'}
                </Button>
              </div>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default AssetTransferModal;