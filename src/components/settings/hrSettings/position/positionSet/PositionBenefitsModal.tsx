import React, { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { X, Award, Loader2 } from "lucide-react";
import { Button } from "../../../../ui/button";
import { Label } from "../../../../ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../../../ui/select";
import type {
  PositionBenefitAddDto,
  UUID,
} from "../../../../../types/hr/position";
import type { NameListItem } from "../../../../../types/NameList/nameList";
import { hrmmNamesApi } from "../../../../../services/List/hrmmNames/hrmmNames.api";

interface PositionBenefitsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: PositionBenefitAddDto) => void;
  positionId: UUID;
}

const PositionBenefitsModal: React.FC<PositionBenefitsModalProps> = ({
  isOpen,
  onClose,
  onSave,
  positionId,
}) => {
  const [selectedBenefitSetting, setSelectedBenefitSetting] = useState<UUID | "">("");
  const [benefitSettings, setBenefitSettings] = useState<NameListItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const handleClose = useCallback(() => {
    setSelectedBenefitSetting("");
    setBenefitSettings([]);
    onClose();
  }, [onClose]);

  // Fetch benefit settings when modal opens
  useEffect(() => {
    const fetchBenefitSettings = async () => {
      if (!isOpen) return;

      setLoading(true);
      try {
        const settings = await hrmmNamesApi.getAllBenefitSetNames();
        setBenefitSettings(settings);

        if (settings.length > 0) {
          setSelectedBenefitSetting(settings[0].id);
        }
      } catch (err) {
        console.error("Error fetching benefit settings:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchBenefitSettings();
  }, [isOpen]);

  const handleSubmit = async () => {
    if (!selectedBenefitSetting) return;

    setSaving(true);
    try {
      const formData: PositionBenefitAddDto = {
        positionId,
        benefitSettingId: selectedBenefitSetting,
      };

      await onSave(formData);
      handleClose();
    } catch (error) {
      console.error("Error saving benefit:", error);
    } finally {
      setSaving(false);
    }
  };

  // Add escape key to close
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        handleClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, handleClose]);

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
            <Award size={20} />
            <h2 className="text-lg font-bold text-gray-800">
              Add Benefit
            </h2>
          </div>
          <button
            onClick={handleClose}
            className="text-gray-500 hover:text-gray-700 p-2 rounded-full hover:bg-gray-100 transition-colors duration-200"
            disabled={saving}
          >
            <X size={24} />
          </button>
        </div>

        {/* Body */}
        <div className="px-6">
          <div className="py-4 space-y-3">
            {/* Benefit Selection */}
            <div className="space-y-2">
              <Label className="block text-sm font-medium text-gray-700">
                Benefit Setting <span className="text-red-500">*</span>
              </Label>
              <Select
                value={selectedBenefitSetting}
                onValueChange={(value) => setSelectedBenefitSetting(value as UUID)}
                disabled={loading || saving}
              >
                <SelectTrigger className={`
                  w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm
                  focus:outline-none focus:ring-emerald-500 focus:border-emerald-500
                  text-sm transition-colors
                  ${loading ? 'bg-gray-100 text-gray-500 cursor-not-allowed' : 'bg-white text-gray-900'}
                `}>
                  <SelectValue placeholder={loading ? "Loading benefits..." : "Choose a benefit"} />
                </SelectTrigger>
                <SelectContent>
                  {benefitSettings.map((setting) => (
                    <SelectItem key={setting.id} value={setting.id} className="text-gray-900">
                      {setting.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {loading && (
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Loading benefit settings...
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t px-6 py-2">
          <div className="mx-auto flex justify-center items-center gap-1.5">
            <Button
              className="bg-green-600 hover:bg-green-700 text-white cursor-pointer px-6"
              onClick={handleSubmit}
              disabled={!selectedBenefitSetting || loading || saving}
            >
              {saving ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Saving...
                </>
              ) : (
                "Add Benefit"
              )}
            </Button>
            <Button
              variant="outline"
              className="cursor-pointer px-6"
              onClick={handleClose}
              disabled={saving}
            >
              Cancel
            </Button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default PositionBenefitsModal;