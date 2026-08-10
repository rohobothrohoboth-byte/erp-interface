import { useState, useEffect, forwardRef, useImperativeHandle } from "react";
import { Edit, Trash2, Briefcase } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import DeletePositionExperienceModal from "@/modules/settings/components/hrSettings/position/positionSet/DeletePositionExperianceModal";
import type {
  PositionExpListDto,
  UUID,
} from "@/modules/hr/types/position";
import { positionService } from "@/modules/core/services/settings/ModHrm/positionService";

interface PositionExperienceProps {
  positionId: UUID;
  onEdit?: (experience: PositionExpListDto) => void;
  onExperienceAdded?: () => void;
  onExperienceDeleted?: () => void;
}

const PositionExperience = forwardRef(
  (
    {
      positionId,
      onEdit,
      onExperienceAdded,
      onExperienceDeleted,
    }: PositionExperienceProps,
    ref
  ) => {
    const [experiences, setExperiences] = useState<PositionExpListDto[]>([]);
    const [loading, setLoading] = useState(true);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [deletingExperience, setDeletingExperience] =
      useState<PositionExpListDto | null>(null);

    useEffect(() => {
      fetchExperiences();
    }, [positionId]);

    const fetchExperiences = async () => {
      try {
        setLoading(true);
        const positionExperiences =
          await positionService.getAllPositionExperiences(positionId);

        setExperiences(positionExperiences);

        // Notify parent about experience status
        if (positionExperiences.length > 0 && onExperienceAdded) {
          onExperienceAdded();
        }
      } catch (error) {
        console.error("Error fetching experiences:", error);
      } finally {
        setLoading(false);
      }
    };

    const handleEdit = (experience: PositionExpListDto) => {
      if (onEdit) {
        onEdit(experience);
      }
    };

    const handleDelete = (experience: PositionExpListDto) => {
      setDeletingExperience(experience);
      setIsDeleteModalOpen(true);
    };

    const handleConfirmDelete = async (experience: PositionExpListDto) => {
      try {
        await positionService.deletePositionExperience(experience.id);
        await fetchExperiences();
        setIsDeleteModalOpen(false);
        setDeletingExperience(null);

        // Notify parent that experience was deleted
        if (onExperienceDeleted) {
          onExperienceDeleted();
        }
      } catch (error) {
        console.error("Error deleting experience:", error);
      }
    };

    const handleCloseDeleteModal = () => {
      setIsDeleteModalOpen(false);
      setDeletingExperience(null);
    };

    // Expose fetchExperiences to parent via ref
    useImperativeHandle(ref, () => ({
      fetchExperiences,
    }));

    if (loading) {
      return (
        <div className="flex justify-center items-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
          <span className="ml-2 text-gray-600">Loading experiences...</span>
        </div>
      );
    }

    return (
      <div className="space-y-6">
        <div className="space-y-4">
          {experiences.map((experience) => (
            <div
              key={experience.id}
              className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow duration-200"
            >
              <div className="flex justify-between items-start">
                <div className="flex items-start space-x-4 flex-1">
                  <div className="p-3 bg-green-100 rounded-lg">
                    <Briefcase className="h-6 w-6 text-green-600" />
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 flex-1">
                    <div>
                      <p className="text-sm text-gray-500">Same Position Exp</p>
                      <p className="font-semibold text-gray-900">
                        {experience.samePosExp} years
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">
                        Other Position Exp
                      </p>
                      <p className="font-semibold text-gray-900">
                        {experience.otherPosExp} years
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Age Range</p>
                      <p className="font-semibold text-gray-900">
                        {experience.minAge} - {experience.maxAge} years
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Total Experience</p>
                      <p className="font-semibold text-green-600">
                        {experience.samePosExp + experience.otherPosExp} years
                      </p>
                    </div>
                  </div>
                </div>
                <div className="flex gap-2 ml-4">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEdit(experience)}
                    className="flex items-center gap-1 border-green-300 text-green-700 hover:bg-green-50"
                  >
                    <Edit className="h-3 w-3" />
                    Edit
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDelete(experience)}
                    className="flex items-center gap-1 text-red-600 hover:text-red-700 border-red-300 hover:bg-red-50"
                  >
                    <Trash2 className="h-3 w-3" />
                    Delete
                  </Button>
                </div>
              </div>
            </div>
          ))}
          {experiences.length === 0 && (
            <div className="text-center py-6">
              <p className="text-gray-600 mb-4">
                No Experiance Assigned for this position
              </p>
            </div>
          )}
        </div>

        {/* Delete Modal */}
        <DeletePositionExperienceModal
          experience={deletingExperience}
          isOpen={isDeleteModalOpen}
          onClose={handleCloseDeleteModal}
          onConfirm={handleConfirmDelete}
        />
      </div>
    );
  }
);

export default PositionExperience;
