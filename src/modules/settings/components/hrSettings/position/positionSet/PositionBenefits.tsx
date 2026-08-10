import { useState, useEffect, forwardRef, useImperativeHandle } from "react";
import { Trash2, Award } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import PositionBenefitsModal from "@/modules/settings/components/hrSettings/position/positionSet/PositionBenefitsModal";
import DeletePositionBenefitsModal from "@/modules/settings/components/hrSettings/position/positionSet/DeletePositionBenefitsModal";
import type {
  PositionBenefitListDto,
  PositionBenefitAddDto,
  UUID,
} from "@/modules/hr/types/position";
import { positionService } from "@/modules/core/services/settings/ModHrm/positionService";

interface PositionBenefitsProps {
  positionId: UUID;
  viewMode: "grid" | "list";
  setViewMode: (mode: "grid" | "list") => void;
}

export interface PositionBenefitsRef {
  fetchBenefits: () => Promise<void>;
}

const PositionBenefits = forwardRef<PositionBenefitsRef, PositionBenefitsProps>(
  ({ positionId, viewMode }, ref) => {
    const [benefits, setBenefits] = useState<PositionBenefitListDto[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [deletingBenefit, setDeletingBenefit] =
      useState<PositionBenefitListDto | null>(null);

    useImperativeHandle(ref, () => ({
      fetchBenefits: fetchData,
    }));

    useEffect(() => {
      fetchData();
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [positionId]);

    const fetchData = async () => {
      try {
        setLoading(true);
        const benefitsData = await positionService.getAllPositionBenefits(
          positionId
        );

        const positionBenefits = benefitsData.filter(
          (benefit) => benefit.positionId === positionId
        );
        setBenefits(positionBenefits);
      } catch (error) {
        console.error("Error fetching benefits:", error);
      } finally {
        setLoading(false);
      }
    };

    const handleSave = async (data: PositionBenefitAddDto) => {
      try {
        await positionService.createPositionBenefit(data);
        await fetchData();
      } catch (error) {
        console.error("Error saving benefit:", error);
      }
    };

    const handleDelete = (benefit: PositionBenefitListDto) => {
      setDeletingBenefit(benefit);
      setIsDeleteModalOpen(true);
    };

    const handleConfirmDelete = async (benefit: PositionBenefitListDto) => {
      try {
        await positionService.deletePositionBenefit(benefit.id);
        await fetchData();
        setIsDeleteModalOpen(false);
        setDeletingBenefit(null);
      } catch (error) {
        console.error("Error deleting benefit:", error);
      }
    };

    const handleCloseModal = () => {
      setIsModalOpen(false);
    };

    const handleCloseDeleteModal = () => {
      setIsDeleteModalOpen(false);
      setDeletingBenefit(null);
    };

    if (loading) {
      return (
        <div className="flex justify-center items-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
          <span className="ml-2 text-gray-600">Loading benefits...</span>
        </div>
      );
    }

    return (
      <div className="space-y-6">
        {/* Benefits Grid/List */}
        <div
          className={
            viewMode === "grid"
              ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
              : "space-y-4"
          }
        >
          {benefits.map((benefit) => {
            if (viewMode === "grid") {
              // Grid View Layout
              return (
                <div
                  key={benefit.id}
                  className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow duration-200 bg-white relative"
                >
                  <div className="flex flex-col items-center text-center h-full">
                    {/* Icon */}
                    <div className="p-3 bg-green-100 rounded-lg mb-1">
                      <Award className="h-6 w-6 text-green-600" />
                    </div>

                    {/* Benefit Name */}
                    <h4 className="font-semibold text-gray-900 text-lg mb-0">
                      {benefit.benefitName || "Unknown Benefit"}
                    </h4>

                    {/* Amount - Updated formatting */}
                    <div className="mt-auto mb-0">
                      <p className="text-2xl font-bold text-green-600">
                        {benefit.benefit}{" "}
                        <span className="text-sm text-gray-500">
                          ETB/ {benefit.perStr}
                        </span>
                      </p>
                    </div>

                    {/* Action Buttons */}
                    <div className="mt-4 pt-4 border-t border-gray-200 w-full flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(benefit)}
                        className="flex-1 flex items-center justify-center gap-2 text-red-600 hover:text-red-700 border-red-300 hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4" />
                        Delete
                      </Button>
                    </div>
                  </div>
                </div>
              );
            } else {
              // List View Layout
              return (
                <div
                  key={benefit.id}
                  className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow duration-200 bg-white"
                >
                  <div className="flex justify-between items-start">
                    {/* Left Content */}
                    <div className="flex items-start space-x-4 flex-1">
                      {/* Icon */}
                      <div className="p-3 bg-green-100 rounded-lg">
                        <Award className="h-6 w-6 text-green-600" />
                      </div>

                      {/* Text Content */}
                      <div className="flex-1">
                        {/* Benefit Name */}
                        <h4 className="font-semibold text-gray-900 text-lg mb-1">
                          {benefit.benefitName || "Unknown Benefit"}
                        </h4>

                        {/* Amount - Updated formatting */}
                        <div className="mt-3">
                          <p className="text-2xl font-bold text-green-600">
                            {benefit.benefit}{" "}
                            <span className="text-sm text-gray-500">
                              ETB/ {benefit.perStr}
                            </span>
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Right Content - Action Buttons */}
                    <div className="flex gap-2 ml-4">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(benefit)}
                        className="flex items-center gap-2 text-red-600 hover:text-red-700 border-red-300 hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4" />
                        Delete
                      </Button>
                    </div>
                  </div>
                </div>
              );
            }
          })}

          {benefits.length === 0 && (
            <div className="text-center py-12 col-span-full">
              <p className="text-sm text-gray-500">
                No Benefits Assigned for this position
              </p>
            </div>
          )}
        </div>

        <PositionBenefitsModal
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          onSave={handleSave}
          positionId={positionId}
        />

        <DeletePositionBenefitsModal
          benefit={deletingBenefit}
          isOpen={isDeleteModalOpen}
          onClose={handleCloseDeleteModal}
          onConfirm={handleConfirmDelete}
        />
      </div>
    );
  }
);

export default PositionBenefits;
