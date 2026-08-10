import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { X, Briefcase } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { Label } from '@/shared/components/ui/label';
import { Input } from '@/shared/components/ui/input';
import type { PositionExpAddDto, PositionExpModDto, PositionExpListDto, UUID } from '@/modules/hr/types/position';

interface PositionExperienceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: PositionExpAddDto | PositionExpModDto) => void;
  positionId: UUID;
  editingExperience?: PositionExpListDto | null;
}

const PositionExperienceModal: React.FC<PositionExperienceModalProps> = ({
  isOpen,
  onClose,
  onSave,
  positionId,
  editingExperience
}) => {
  const [formData, setFormData] = useState<PositionExpAddDto>({
    positionId,
    samePosExp: 0,
    otherPosExp: 0,
    minAge: 18,
    maxAge: 65,
  });

  useEffect(() => {
    if (editingExperience) {
      setFormData({
        positionId: editingExperience.positionId,
        samePosExp: editingExperience.samePosExp,
        otherPosExp: editingExperience.otherPosExp,
        minAge: editingExperience.minAge,
        maxAge: editingExperience.maxAge,
      });
    } else {
      setFormData({
        positionId,
        samePosExp: 0,
        otherPosExp: 0,
        minAge: 18,
        maxAge: 65,
      });
    }
  }, [editingExperience, positionId]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: Number(value) || 0
    }));
  };

  const handleSubmit = () => {
    if (formData.minAge >= formData.maxAge) {
      alert('Minimum age must be less than maximum age');
      return;
    }

    if (editingExperience) {
      const modData: PositionExpModDto = {
        ...formData,
        id: editingExperience.id,
        rowVersion: editingExperience.rowVersion,
      };
      onSave(modData);
    } else {
      onSave(formData);
    }

    onClose();
  };

  // const totalExperience = formData.samePosExp + formData.otherPosExp;
  // const ageRange = formData.maxAge - formData.minAge;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 px-6 h-screen">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="bg-white rounded-xl shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto"
      >
        {/* Header */}
        <div className="flex justify-between items-center border-b px-6 py-2 sticky top-0 bg-white z-10">
          <div className="flex items-center gap-2">
            <Briefcase size={20} />
            <h2 className="text-lg font-bold text-gray-800">
              {editingExperience ? 'Edit' : 'Add Experience'}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 p-2 rounded-full hover:bg-gray-100 transition-colors duration-200"
          >
            <X size={24} />
          </button>
        </div>

        {/* Body */}
        <div className="px-6">
          <div className="py-4 space-y-3">
            {/* Same Position Experience */}
            <div className="space-y-2">
              <Label htmlFor="samePosExp" className="text-sm text-gray-500">
                Same Position Experience (years) <span className="text-red-500">*</span>
              </Label>
              <Input
                id="samePosExp"
                name="samePosExp"
                type="number"
                value={formData.samePosExp}
                onChange={handleChange}
                placeholder="3"
                min="0"
                className="w-full focus:outline-none focus:ring-1 focus:ring-green-500 focus:border-transparent"
                required
              />
            </div>

            {/* Other Position Experience */}
            <div className="space-y-2">
              <Label htmlFor="otherPosExp" className="text-sm text-gray-500">
                Other Position Experience (years) <span className="text-red-500">*</span>
              </Label>
              <Input
                id="otherPosExp"
                name="otherPosExp"
                type="number"
                value={formData.otherPosExp}
                onChange={handleChange}
                placeholder="2"
                min="0"
                className="w-full focus:outline-none focus:ring-1 focus:ring-green-500 focus:border-transparent"
                required
              />
            </div>

            {/* Age Range */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="minAge" className="text-sm text-gray-500">
                  Minimum Age <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="minAge"
                  name="minAge"
                  type="number"
                  value={formData.minAge}
                  onChange={handleChange}
                  placeholder="18"
                  min="18"
                  max="65"
                  className="w-full focus:outline-none focus:ring-1 focus:ring-green-500 focus:border-transparent"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="maxAge" className="text-sm text-gray-500">
                  Maximum Age <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="maxAge"
                  name="maxAge"
                  type="number"
                  value={formData.maxAge}
                  onChange={handleChange}
                  placeholder="65"
                  min="18"
                  max="65"
                  className="w-full focus:outline-none focus:ring-1 focus:ring-green-500 focus:border-transparent"
                  required
                />
              </div>
            </div>

            {/* Experience Preview */}
            {/* {(formData.samePosExp > 0 || formData.otherPosExp > 0 || formData.minAge > 18 || formData.maxAge < 65) && (
              <div className="p-4 bg-green-50 rounded-lg border border-green-100">
                <p className="text-sm text-green-800 font-medium mb-2">Experience Preview:</p>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-600">Same Position Exp</p>
                    <p className="font-semibold">{formData.samePosExp} years</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Other Position Exp</p>
                    <p className="font-semibold">{formData.otherPosExp} years</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Total Experience</p>
                    <p className="font-semibold text-green-700">{totalExperience} years</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Age Range</p>
                    <p className="font-semibold">{formData.minAge} - {formData.maxAge} years</p>
                  </div>
                </div>
                <div className="mt-2 text-xs text-gray-600">
                  <span className="font-medium">Age Span:</span> {ageRange} years
                </div>
              </div>
            )} */}
          </div>
        </div>

        {/* Footer */}
        <div className="border-t px-6 py-2">
          <div className="mx-auto flex justify-center items-center gap-1.5">
            <Button
              className="bg-green-600 hover:bg-green-700 text-white cursor-pointer px-6"
              onClick={handleSubmit}
              disabled={formData.minAge >= formData.maxAge}
            >
              {editingExperience ? 'Update' : 'Save'}
            </Button>
            <Button
              variant="outline"
              className="cursor-pointer px-6"
              onClick={onClose}
            >
              Cancel
            </Button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default PositionExperienceModal;