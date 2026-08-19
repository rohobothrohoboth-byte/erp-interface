/* eslint-disable react-hooks/exhaustive-deps */
import { useState, useEffect, forwardRef, useImperativeHandle } from "react";
import { Edit, Trash2, Settings } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import DeletePositionRequirementsModal from "@/modules/settings/components/hrSettings/position/positionSet/DeletePositionRequirementsModal";
import type {
  PositionReqListDto,
  UUID,
} from "@/modules/hr/types/position";
import { positionService } from "@/modules/core/services/settings/ModHrm/positionService";
import {
  PositionGender,
  ProfessionType,
  WorkOption,
} from "@/modules/hr/types/enum";
// import { listService } from "@/modules/list/services/listservice";
// import type { ListItem } from "@/modules/list/types/list";

interface PositionRequirementsProps {
  positionId: UUID;
  onEdit?: (requirement: PositionReqListDto) => void;
  onRequirementAdded?: () => void;
  onRequirementDeleted?: () => void;
}

export interface PositionRequirementsRef {
  fetchRequirements: () => Promise<void>;
}

const PositionRequirements = forwardRef<
  PositionRequirementsRef,
  PositionRequirementsProps
>(({ positionId, onEdit, onRequirementAdded, onRequirementDeleted }, ref) => {
  const [requirements, setRequirements] = useState<PositionReqListDto[]>([]);
  // const [professionTypes, setProfessionTypes] = useState<ListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deletingRequirement, setDeletingRequirement] =
    useState<PositionReqListDto | null>(null);

  useEffect(() => {
    fetchData();
  }, [positionId]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [requirementsData] = await Promise.all([
        positionService.getAllPositionRequirements(positionId),
        // listService.getAllProfessionTypes(),
      ]);

      const positionRequirements = requirementsData.filter(
        (req) => req.positionId === positionId
      );
      setRequirements(positionRequirements);
      // setProfessionTypes(professionTypesData);

      // Notify parent about requirement status
      if (positionRequirements.length > 0 && onRequirementAdded) {
        onRequirementAdded();
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (requirement: PositionReqListDto) => {
    if (onEdit) {
      onEdit(requirement);
    }
  };

  const handleDelete = (requirement: PositionReqListDto) => {
    setDeletingRequirement(requirement);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = async (requirement: PositionReqListDto) => {
    try {
      await positionService.deletePositionRequirement(requirement.id);
      await fetchData();
      setIsDeleteModalOpen(false);
      setDeletingRequirement(null);

      // Notify parent that requirement was deleted
      if (onRequirementDeleted) {
        onRequirementDeleted();
      }
    } catch (error) {
      console.error("Error deleting requirement:", error);
    }
  };

  const handleCloseDeleteModal = () => {
    setIsDeleteModalOpen(false);
    setDeletingRequirement(null);
  };

  // Expose fetchData to parent via ref
  useImperativeHandle(ref, () => ({
    fetchRequirements: fetchData,
  }));

  if (loading) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
        <span className="ml-2 text-gray-600">Loading requirements...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        {requirements.map((requirement) => {
          return (
            <div
              key={requirement.id}
              className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow duration-200"
            >
              <div className="flex justify-between items-start">
                <div className="flex items-start space-x-4 flex-1">
                  <div className="p-3 bg-green-100 rounded-lg">
                    <Settings className="h-6 w-6 text-green-600" />
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4 flex-1">
                    <div>
                      <p className="text-sm text-gray-500">Profession Type</p>
                      <p className="font-semibold text-gray-900">
                        {
                          ProfessionType[
                            requirement.professionType as keyof typeof ProfessionType
                          ]
                        }
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Working Hours</p>
                      <p className="font-semibold text-gray-900">
                        {requirement.workingHours} hours/day
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Gender</p>
                      <p className="font-semibold text-gray-900">
                        {
                          PositionGender[
                            requirement.gender as keyof typeof PositionGender
                          ]
                        }
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Saturday Work</p>
                      <p className="font-semibold text-gray-900">
                        {
                          WorkOption[
                            requirement.saturdayWorkOption as keyof typeof WorkOption
                          ]
                        }
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Sunday Work</p>
                      <p className="font-semibold text-gray-900">
                        {
                          WorkOption[
                            requirement.sundayWorkOption as keyof typeof WorkOption
                          ]
                        }
                      </p>
                    </div>
                  </div>
                </div>
                <div className="flex gap-2 ml-4">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEdit(requirement)}
                    className="flex items-center gap-1 border-green-300 text-green-700 hover:bg-green-50"
                  >
                    <Edit className="h-3 w-3" />
                    Edit
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDelete(requirement)}
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
        {requirements.length === 0 && (
          <div className="text-center py-6">
            <p className="text-gray-600 mb-4">
              No Requirements Assigned for this position
            </p>
          </div>
        )}
      </div>

      <DeletePositionRequirementsModal
        requirement={deletingRequirement}
        isOpen={isDeleteModalOpen}
        onClose={handleCloseDeleteModal}
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
});

export default PositionRequirements;
