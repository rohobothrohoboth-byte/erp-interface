import { useState, useEffect, forwardRef, useImperativeHandle } from "react";
import { Edit, Trash2 } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import PositionEducationModal from "@/modules/settings/components/hrSettings/position/positionSet/PositionEducationModal";
import type {
  PositionEduListDto,
  PositionEduAddDto,
  PositionEduModDto,
  UUID,
} from "@/modules/hr/types/position";
import { positionService } from "@/modules/core/services/settings/ModHrm/positionService";
import DeletePositionEducationModal from "@/modules/settings/components/hrSettings/position/positionSet/DeletePositionEducationModal";

interface PositionEducationProps {
  positionId: UUID;
  onEdit: (education: PositionEduListDto) => void;
}

export interface PositionEducationRef {
  fetchEducations: () => Promise<void>;
}

const PositionEducation = forwardRef<
    PositionEducationRef,
    PositionEducationProps
>(({ positionId, onEdit }, ref) => {
  const [educations, setEducations] = useState<PositionEduListDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEducation, setEditingEducation] =
      useState<PositionEduListDto | null>(null);
  const [deletingEducation, setDeletingEducation] =
      useState<PositionEduListDto | null>(null);

  useImperativeHandle(ref, () => ({
    fetchEducations: fetchData,
  }));

  useEffect(() => {
    fetchData();
  }, [positionId]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const positionEducations =
          await positionService.getAllPositionEducations(positionId);
      setEducations(positionEducations);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (data: PositionEduAddDto | PositionEduModDto) => {
    try {
      if ("id" in data) {
        await positionService.updatePositionEducation(data);
      } else {
        const educationData: PositionEduAddDto = {
          ...data,
          positionId: positionId,
        };
        await positionService.createPositionEducation(educationData);
      }
      await fetchData();
      setIsModalOpen(false);
      setEditingEducation(null);
    } catch (error) {
      console.error("Error saving education:", error);
      throw error;
    }
  };

  const handleEdit = (education: PositionEduListDto) => {
    setEditingEducation(education);
    setIsModalOpen(true);
    onEdit(education);
  };

  const handleDelete = (education: PositionEduListDto) => {
    setDeletingEducation(education);
  };

  const handleConfirmDelete = async () => {
    if (deletingEducation) {
      try {
        await positionService.deletePositionEducation(deletingEducation.id);
        await fetchData();
        setDeletingEducation(null);
      } catch (error) {
        console.error("Error deleting education:", error);
      }
    }
  };

  const handleCloseDeleteModal = () => {
    setDeletingEducation(null);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingEducation(null);
  };

  if (loading) {
    return (
        <div className="flex justify-center items-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
          <span className="ml-2 text-gray-600">
          Loading education requirements...
        </span>
        </div>
    );
  }

  return (
      <div className="space-y-6">
        <div className="space-y-4">
          {educations.map((education) => {
            return (
                <div
                    key={education.id}
                    className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow duration-200"
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      {/* ✅ Display the education level string directly */}
                      <h4 className="font-semibold text-gray-900 text-lg">
                        {education.educationLevel || "Not Specified"}
                      </h4>
                      <p className="text-sm text-gray-600 mt-1">
                        {education.positionName || "Position"}
                      </p>
                      <p className="text-sm text-gray-500 mt-2">
                        <span className="font-medium">Qualification:</span>{" "}
                        {education.educationQual || "Not Specified"}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEdit(education)}
                          className="flex items-center gap-1 border-green-300 text-green-700 hover:bg-green-50"
                      >
                        <Edit className="h-3 w-3" />
                        Edit
                      </Button>
                      <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDelete(education)}
                          className="flex items-center gap-1 text-red-600 hover:text-red-700 border-red-300 hover:bg-red-50"
                      >
                        <Trash2 className="h-3 w-3" />
                        Delete
                      </Button>
                    </div>
                  </div>
                </div>
            );
          })}
          {educations.length === 0 && (
              <div className="text-center py-8 border-2 border-dashed border-gray-300 rounded-lg">
                <p className="text-gray-500 mb-4">
                  No education requirements found for this position.
                </p>
              </div>
          )}
        </div>

        <PositionEducationModal
            isOpen={isModalOpen}
            onClose={handleCloseModal}
            onSave={handleSave}
            positionId={positionId}
            editingEducation={editingEducation}
        />

        <DeletePositionEducationModal
            education={deletingEducation}
            isOpen={!!deletingEducation}
            onClose={handleCloseDeleteModal}
            onConfirm={handleConfirmDelete}
        />
      </div>
  );
});

export default PositionEducation;