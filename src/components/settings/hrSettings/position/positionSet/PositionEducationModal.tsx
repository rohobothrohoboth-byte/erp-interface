import React, { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import {
  X,
  GraduationCap,
  BookOpen,
  School,
  University,
  Building2,
  Users,
  Loader2,
} from "lucide-react";
import { Button } from "../../../../ui/button";
import type {
  PositionEduAddDto,
  PositionEduModDto,
  PositionEduListDto,
  UUID,
} from "../../../../../types/hr/position";
import type { ListItem } from "../../../../../types/List/list";
import { nameListService } from "../../../../../services/List/HrmmNameListService";
import { EducationLevel } from "../../../../../types/enum";
import EnumSelect from "../../../../ui/enumSelect";

interface PositionEducationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: PositionEduAddDto | PositionEduModDto) => void;
  positionId: UUID;
  editingEducation?: PositionEduListDto | null;
}

// Icon mapping for different education levels
const educationIcons: { [key: string]: React.ComponentType<any> } = {
  Preparatory: BookOpen,
  College: School,
  TVT: Users,
  "High School": GraduationCap,
  University: University,
  Elementary: Building2,
  default: GraduationCap,
};

const PositionEducationModal: React.FC<PositionEducationModalProps> = ({
  isOpen,
  onClose,
  onSave,
  positionId,
  editingEducation,
}) => {
  const [selectedEducationLevel, setSelectedEducationLevel] =
    useState<string>("");
  const [selectedEducationQual, setSelectedEducationQual] =
    useState<string>("");
  const [educationQualNames, setEducationQualNames] = useState<ListItem[]>([]);
  const [loadingQuals, setLoadingQuals] = useState(false);

  const handleClose = useCallback(() => {
    setSelectedEducationLevel("");
    setSelectedEducationQual("");
    onClose();
  }, [onClose]);

  useEffect(() => {
    if (isOpen) {
      setSelectedEducationLevel(editingEducation?.educationLevelId || "");
      setSelectedEducationQual(editingEducation?.educationQualId || "");
    }
  }, [isOpen, editingEducation]);

  // Fetch qualification names
  useEffect(() => {
    const fetchQualificationNames = async () => {
      if (!isOpen) return;
      setLoadingQuals(true);
      try {
        const qualNamesData = await nameListService.getAllEducationQualNames();
        setEducationQualNames(qualNamesData);

        if (
          !editingEducation &&
          qualNamesData.length > 0 &&
          !selectedEducationQual
        ) {
          setSelectedEducationQual(qualNamesData[0].id);
        }
      } catch (err) {
        console.error("Error fetching education qualifications:", err);
      } finally {
        setLoadingQuals(false);
      }
    };

    fetchQualificationNames();
  }, [isOpen, editingEducation]);

  const handleSubmit = () => {
    if (!selectedEducationLevel || !selectedEducationQual) return;

    const formData: PositionEduAddDto = {
      positionId,
      educationQualId: selectedEducationQual,
      educationLevelId: selectedEducationLevel,
    };

    if (editingEducation) {
      const modData: PositionEduModDto = {
        ...formData,
        id: editingEducation.id,
        rowVersion: editingEducation.rowVersion,
      };
      onSave(modData);
    } else {
      onSave(formData);
    }

    handleClose();
  };

  const getEducationIcon = (levelValue: string) => {
    const IconComponent =
      educationIcons[
        EducationLevel[levelValue as keyof typeof EducationLevel]
      ] || educationIcons.default;
    return <IconComponent className="h-5 w-5" />;
  };

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) handleClose();
    };
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
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
        <div className="flex justify-between items-center border-b px-6 py-4 sticky top-0 bg-white z-10">
          <div className="flex items-center gap-2">
            <GraduationCap className="h-5 w-5 text-green-600" />
            <h2 className="text-lg font-bold text-gray-800">
              {editingEducation ? "Edit Education" : "Add Education"}
            </h2>
          </div>
          <button
            onClick={handleClose}
            className="text-gray-500 hover:text-gray-700 p-2 rounded-full hover:bg-gray-100 transition-colors duration-200"
            type="button"
          >
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-4 space-y-4">
          {/* Education Level */}
          <EnumSelect
            enumObject={EducationLevel}
            value={selectedEducationLevel}
            onChange={setSelectedEducationLevel}
            placeholder="Select Education Level"
          />

          {/* Education Qualification */}
          <EnumSelect
            enumObject={educationQualNames.reduce(
              (acc, curr) => ({ ...acc, [curr.id]: curr.name }),
              {} as Record<string, string>,
            )}
            value={selectedEducationQual}
            onChange={setSelectedEducationQual}
            placeholder="Select Education Qualification"
            disabled={loadingQuals}
          />
          {loadingQuals && (
            <p className="text-sm text-gray-500">
              Loading education qualifications...
            </p>
          )}

          {/* Current Selection Info */}
          {(selectedEducationLevel || selectedEducationQual) && (
            <div className="p-4 bg-blue-50 rounded-lg border border-blue-100">
              {selectedEducationLevel && (
                <div className="flex items-center space-x-3 mb-2">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    {getEducationIcon(selectedEducationLevel)}
                  </div>
                  <div className="flex-1">
                    <p className="text-blue-700 font-medium">
                      {
                        EducationLevel[
                          selectedEducationLevel as keyof typeof EducationLevel
                        ]
                      }
                    </p>
                    <p className="text-blue-600 text-xs">Education Level</p>
                  </div>
                </div>
              )}
              {selectedEducationQual && (
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <GraduationCap className="h-5 w-5 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-blue-700 font-medium">
                      {
                        educationQualNames.find(
                          (q) => q.id === selectedEducationQual,
                        )?.name
                      }
                    </p>
                    <p className="text-blue-600 text-xs">
                      Education Qualification
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t px-6 py-4 rounded-b-xl flex flex-row-reverse justify-center items-center gap-3">
          <Button
            variant="outline"
            onClick={handleClose}
            type="button"
            disabled={loadingQuals}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={
              !selectedEducationLevel || !selectedEducationQual || loadingQuals
            }
            className="bg-green-600 hover:bg-green-700 text-white"
          >
            {loadingQuals ? (
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
            ) : editingEducation ? (
              "Update"
            ) : (
              "Save"
            )}
          </Button>
        </div>
      </motion.div>
    </div>
  );
};

export default PositionEducationModal;
