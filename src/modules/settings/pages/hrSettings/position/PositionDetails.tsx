import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Users,
  Briefcase,
  GraduationCap,
  Award,
  Settings,
  Building,
  UserCheck,
  Calendar,
  BadgePlus,
  Grid,
  List,
} from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import PositionExperience from "@/modules/settings/components/hrSettings/position/positionSet/PositionExperiance";
import PositionBenefits from "@/modules/settings/components/hrSettings/position/positionSet/PositionBenefits";
import PositionEducation from "@/modules/settings/components/hrSettings/position/positionSet/PositionEducation";
import PositionRequirements from "@/modules/settings/components/hrSettings/position/positionSet/PositionRequirements";
import PositionExperienceModal from "@/modules/settings/components/hrSettings/position/positionSet/PositionExperianceModal";
import PositionRequirementsModal from "@/modules/settings/components/hrSettings/position/positionSet/PositionRequirementsModal";
import PositionEducationModal from "@/modules/settings/components/hrSettings/position/positionSet/PositionEducationModal";
import PositionBenefitsModal from "@/modules/settings/components/hrSettings/position/positionSet/PositionBenefitsModal";
import type {
  PositionListDto,
  PositionSettingType,
  PositionExpAddDto,
  PositionExpModDto,
  PositionExpListDto,
  PositionReqAddDto,
  PositionReqModDto,
  PositionReqListDto,
  PositionEduAddDto,
  PositionEduModDto,
  PositionEduListDto,
  PositionBenefitAddDto,
  UUID,
} from "@/modules/hr/types/position";
import { positionService } from "@/modules/core/services/settings/ModHrm/positionService";

// Define the tab interface
interface SettingTab {
  id: PositionSettingType;
  label: string;
  icon: React.ComponentType<any>;
  color: string;
}

const settingTabs: SettingTab[] = [
  {
    id: "benefit",
    label: "Benefits",
    icon: Award,
    color: "green",
  },
  {
    id: "education",
    label: "Education",
    icon: GraduationCap,
    color: "green",
  },
  {
    id: "experience",
    label: "Experience",
    icon: Briefcase,
    color: "green",
  },
  {
    id: "requirement",
    label: "Requirements",
    icon: Settings,
    color: "green",
  },
];

// Unified green color scheme
const greenTheme = {
  primary: {
    light: "bg-green-50",
    medium: "bg-green-100",
    dark: "bg-green-500",
    text: "text-green-700",
    border: "border-green-200",
    icon: "text-green-600",
    active: "border-green-500 text-green-600 bg-green-50",
  },
};

function PositionDetails() {
  const { id } = useParams<{ id: UUID }>();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<PositionSettingType>("benefit");
  const [position, setPosition] = useState<PositionListDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Experience modal state
  const [isExperienceModalOpen, setIsExperienceModalOpen] = useState(false);
  const [editingExperience, setEditingExperience] =
    useState<PositionExpListDto | null>(null);
  const [hasExperience, setHasExperience] = useState(false);
  const experienceRef = useRef<any>(null);

  // Requirement modal state
  const [hasRequirement, setHasRequirement] = useState(false);
  const [isRequirementModalOpen, setIsRequirementModalOpen] = useState(false);
  const [editingRequirement, setEditingRequirement] =
    useState<PositionReqListDto | null>(null);
  const requirementRef = useRef<any>(null);

  // Education modal state
  const [isEducationModalOpen, setIsEducationModalOpen] = useState(false);
  const [editingEducation, setEditingEducation] =
    useState<PositionEduListDto | null>(null);
  const educationRef = useRef<any>(null);

  // Benefit modal state
  const [isBenefitModalOpen, setIsBenefitModalOpen] = useState(false);
  const benefitRef = useRef<any>(null);

  // Grid/List view state for benefits
  const [benefitViewMode, setBenefitViewMode] = useState<"grid" | "list">(
    "grid"
  );

  useEffect(() => {
    if (id) {
      fetchPosition();
      checkIfHasExperience();
      checkIfHasRequirement();
    }
  }, [id]);

  const fetchPosition = async () => {
    try {
      setLoading(true);
      const positionData = await positionService.getPositionById(id!);
      setPosition(positionData);
      setError(null);
    } catch (err) {
      setError("Failed to fetch position details");
      console.error("Error fetching position:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    navigate("/settings/hr/position");
  };

  // Experience modal handlers
  const handleAddExperience = () => {
    setEditingExperience(null);
    setIsExperienceModalOpen(true);
  };

  const handleEditExperience = (experience: PositionExpListDto) => {
    setEditingExperience(experience);
    setIsExperienceModalOpen(true);
  };

  const handleSaveExperience = async (
    data: PositionExpAddDto | PositionExpModDto
  ) => {
    try {
      if ("id" in data) {
        await positionService.updatePositionExperience(data);
      } else {
        await positionService.createPositionExperience(data);
        setHasExperience(true);
      }
      if (experienceRef.current && experienceRef.current.fetchExperiences) {
        await experienceRef.current.fetchExperiences();
      }
    } catch (error) {
      console.error("Error saving experience:", error);
      throw error;
    }
  };

  const handleCloseExperienceModal = () => {
    setIsExperienceModalOpen(false);
    setEditingExperience(null);
  };

  // Requirement modal handlers
  const handleAddRequirement = () => {
    setEditingRequirement(null);
    setIsRequirementModalOpen(true);
  };

  const handleEditRequirement = (requirement: PositionReqListDto) => {
    setEditingRequirement(requirement);
    setIsRequirementModalOpen(true);
  };

  const handleSaveRequirement = async (
    data: PositionReqAddDto | PositionReqModDto
  ) => {
    try {
      if ("id" in data) {
        await positionService.updatePositionRequirement(data);
      } else {
        await positionService.createPositionRequirement(data);
        setHasRequirement(true);
      }
      if (requirementRef.current && requirementRef.current.fetchRequirements) {
        await requirementRef.current.fetchRequirements();
      }
    } catch (error) {
      console.error("Error saving requirement:", error);
      throw error;
    }
  };

  const handleCloseRequirementModal = () => {
    setIsRequirementModalOpen(false);
    setEditingRequirement(null);
  };

  // Education modal handlers
  const handleAddEducation = () => {
    setEditingEducation(null);
    setIsEducationModalOpen(true);
  };

  const handleEditEducation = (education: PositionEduListDto) => {
    setEditingEducation(education);
    setIsEducationModalOpen(true);
  };

  const handleSaveEducation = async (
    data: PositionEduAddDto | PositionEduModDto
  ) => {
    try {
      if ("id" in data) {
        await positionService.updatePositionEducation(data);
      } else {
        await positionService.createPositionEducation(data);
      }
      if (educationRef.current && educationRef.current.fetchEducations) {
        await educationRef.current.fetchEducations();
      }
    } catch (error) {
      console.error("Error saving education:", error);
      throw error;
    }
  };

  const handleCloseEducationModal = () => {
    setIsEducationModalOpen(false);
    setEditingEducation(null);
  };

  // Benefit modal handlers
  const handleAddBenefit = () => {
    setIsBenefitModalOpen(true);
  };

  const handleSaveBenefit = async (data: PositionBenefitAddDto) => {
    try {
      await positionService.createPositionBenefit(data);
      if (benefitRef.current && benefitRef.current.fetchBenefits) {
        await benefitRef.current.fetchBenefits();
      }
    } catch (error) {
      console.error("Error saving benefit:", error);
      throw error;
    }
  };

  const handleCloseBenefitModal = () => {
    setIsBenefitModalOpen(false);
  };

  // Check if position has experiences
  const checkIfHasExperience = async () => {
    try {
      if (!id) return;
      
      const data = await positionService.getAllPositionExperiences(id);
      const positionExperiences = data.filter((exp) => exp.positionId === id);
      setHasExperience(positionExperiences.length > 0);
    } catch (error) {
      console.error("Error checking experiences:", error);
    }
  };

  // Check if position has requirements
  const checkIfHasRequirement = async () => {
    try {
      if (!id) return;
      
      const data = await positionService.getAllPositionRequirements(id);
      const positionRequirements = data.filter((req) => req.positionId === id);
      setHasRequirement(positionRequirements.length > 0);
    } catch (error) {
      console.error("Error checking requirements:", error);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <h3 className="text-lg font-semibold text-gray-700">
            Loading Position Details
          </h3>
          <p className="text-gray-500 mt-2">
            Please wait while we fetch the position information...
          </p>
        </div>
      </div>
    );
  }

  if (error || !position) {
    return (
      <div className="mx-auto space-y-6">
        <div className="flex items-center space-x-4 mb-6">
          <Button variant="outline" onClick={handleBack}>
            <ArrowLeft className="h-4 w-4" />
            Back to Positions
          </Button>
        </div>

        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg"
        >
          <div className="flex justify-between items-center">
            <span className="font-medium">
              {error && error.includes("fetch") ? (
                <>
                  Failed to load position details.{" "}
                  <button
                    onClick={fetchPosition}
                    className="underline hover:text-red-800 font-semibold focus:outline-none"
                  >
                    Try again
                  </button>{" "}
                  later.
                </>
              ) : (
                error || "Position not found"
              )}
            </span>
            <button
              onClick={() => setError(null)}
              className="text-red-700 hover:text-red-900 font-bold text-lg ml-4"
            >
              ×
            </button>
          </div>
        </motion.div>

        <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
          <div className="text-gray-400 mb-4">
            <Users className="h-16 w-16 mx-auto" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Position Not Found
          </h3>
          <p className="text-gray-500 mb-4">
            {error || "The requested position could not be found."}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto space-y-6">
      {/* Error Display */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg"
        >
          <div className="flex justify-between items-center">
            <span className="font-medium">
              {error.includes("fetch") ? (
                <>
                  Failed to load position details.{" "}
                  <button
                    onClick={fetchPosition}
                    className="underline hover:text-red-800 font-semibold focus:outline-none"
                  >
                    Try again
                  </button>{" "}
                  later.
                </>
              ) : error.includes("save") ? (
                "Failed to save changes. Please try again."
              ) : error.includes("create") ? (
                "Failed to create item. Please try again."
              ) : error.includes("update") ? (
                "Failed to update item. Please try again."
              ) : error.includes("delete") ? (
                "Failed to delete item. Please try again."
              ) : (
                error
              )}
            </span>
            <button
              onClick={() => setError(null)}
              className="text-red-700 hover:text-red-900 font-bold text-lg ml-4"
            >
              ×
            </button>
          </div>
        </motion.div>
      )}

      {/* Header Section */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button variant="outline" onClick={handleBack}>
              <ArrowLeft className="h-4 w-4" />
              Back to Positions
            </Button>
            <div className="h-8 w-px bg-green-300"></div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 tracking-tight">
                {position.name}
              </h1>
              <p className="text-lg text-gray-600 mt-1">{position.nameAm}</p>
            </div>
          </div>
        </div>

        {/* Position Stats */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white rounded-xl p-4 shadow-sm border border-green-200 hover:shadow-md transition-shadow duration-200">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <Building className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Department
                </p>
                <p className="text-lg font-semibold text-gray-900">
                  {position.department}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-4 shadow-sm border border-green-200 hover:shadow-md transition-shadow duration-200">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <UserCheck className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Positions</p>
                <p className="text-lg font-semibold text-gray-900">
                  {position.noOfPosition}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-4 shadow-sm border border-green-200 hover:shadow-md transition-shadow duration-200">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <Calendar className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Status</p>
                <p
                  className={`text-lg font-semibold ${
                    position.isVacant === "1"
                      ? "text-green-600"
                      : "text-gray-600"
                  }`}
                >
                  {position.isVacantStr}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="mb-8">
        <div className="bg-white rounded-2xl shadow-sm border border-green-200 p-2">
          <nav className="flex space-x-2">
            {settingTabs.map((tab) => {
              const IconComponent = tab.icon;
              const isActive = activeTab === tab.id;

              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-3 py-3 px-4 rounded-xl font-medium text-sm transition-all duration-200 ${
                    isActive
                      ? `${greenTheme.primary.light} border border-green-300 text-green-700 shadow-sm`
                      : "text-gray-500 hover:text-green-700 hover:bg-green-50"
                  }`}
                >
                  <IconComponent
                    className={`h-5 w-5 ${
                      isActive ? greenTheme.primary.icon : "text-gray-400"
                    }`}
                  />
                  {tab.label}
                  {isActive && (
                    <div className="w-2 h-2 rounded-full bg-green-500 ml-1"></div>
                  )}
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Tab Content */}
      <div className="bg-white rounded-2xl shadow-sm border border-green-200 overflow-hidden">
        {/* Tab Header */}
        <div className={`border-b ${greenTheme.primary.border} px-6 py-4`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className={`p-2 rounded-lg ${greenTheme.primary.light}`}>
                {settingTabs.find((tab) => tab.id === activeTab) && (
                  <IconComponent
                    icon={
                      settingTabs.find((tab) => tab.id === activeTab)!.icon
                    }
                    className={`h-6 w-6 ${greenTheme.primary.icon}`}
                  />
                )}
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">
                  Position{" "}
                  {settingTabs.find((tab) => tab.id === activeTab)?.label}
                </h2>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {/* View Mode Toggle - Only shown for Benefit tab */}
              {activeTab === "benefit" && (
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-2 cursor-pointer border-green-300 text-green-700 hover:bg-green-100 hover:text-green-800 whitespace-nowrap"
                  onClick={() =>
                    setBenefitViewMode(
                      benefitViewMode === "grid" ? "list" : "grid"
                    )
                  }
                >
                  {benefitViewMode === "grid" ? (
                    <>
                      <List className="h-4 w-4" />
                      List View
                    </>
                  ) : (
                    <>
                      <Grid className="h-4 w-4" />
                      Grid View
                    </>
                  )}
                </Button>
              )}

              {/* Add Education Button - Only shown for Education tab */}
              {activeTab === "education" && (
                <Button
                  onClick={handleAddEducation}
                  className="flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white whitespace-nowrap w-full sm:w-auto cursor-pointer"
                >
                  <BadgePlus className="h-4 w-4" />
                  Add Education
                </Button>
              )}

              {/* Add Benefit Button - Only shown for Benefit tab */}
              {activeTab === "benefit" && (
                <Button
                  onClick={handleAddBenefit}
                  className="flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white whitespace-nowrap w-full sm:w-auto cursor-pointer"
                >
                  <BadgePlus className="h-4 w-4" />
                  Add Benefit
                </Button>
              )}

              {/* Add Experience Button - Only shown for Experience tab when no experience exists */}
              {activeTab === "experience" && !hasExperience && (
                <Button
                  onClick={handleAddExperience}
                  className="flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white whitespace-nowrap cursor-pointer"
                >
                  <BadgePlus className="h-4 w-4" />
                  Add Experience
                </Button>
              )}

              {/* Add Requirements Button - Only shown for Requirements tab when no requirement exists */}
              {activeTab === "requirement" && !hasRequirement && (
                <Button
                  onClick={handleAddRequirement}
                  className="flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white whitespace-nowrap cursor-pointer"
                >
                  <BadgePlus className="h-4 w-4" />
                  Add Requirements
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Tab Content with Properly Typed Conditional Rendering */}
        <div className="p-6">
          {/* Experience Tab */}
          {activeTab === "experience" && (
            <PositionExperience
              positionId={position.id}
              ref={experienceRef}
              onEdit={handleEditExperience}
              onExperienceAdded={() => setHasExperience(true)}
              onExperienceDeleted={() => setHasExperience(false)}
            />
          )}

          {/* Requirements Tab */}
          {activeTab === "requirement" && (
            <PositionRequirements
              positionId={position.id}
              ref={requirementRef}
              onEdit={handleEditRequirement}
              onRequirementAdded={() => setHasRequirement(true)}
              onRequirementDeleted={() => setHasRequirement(false)}
            />
          )}

          {/* Education Tab */}
          {activeTab === "education" && (
            <PositionEducation
              positionId={position.id}
              ref={educationRef}
              onEdit={handleEditEducation}
            />
          )}

          {/* Benefits Tab */}
          {activeTab === "benefit" && (
            <PositionBenefits
              positionId={position.id}
              ref={benefitRef}
              viewMode={benefitViewMode}
              setViewMode={setBenefitViewMode}
            />
          )}
        </div>
      </div>

      {/* Experience Modal */}
      <PositionExperienceModal
        isOpen={isExperienceModalOpen}
        onClose={handleCloseExperienceModal}
        onSave={handleSaveExperience}
        positionId={position.id}
        editingExperience={editingExperience}
      />

      {/* Requirements Modal */}
      <PositionRequirementsModal
        isOpen={isRequirementModalOpen}
        onClose={handleCloseRequirementModal}
        onSave={handleSaveRequirement}
        positionId={position.id}
        editingRequirement={editingRequirement}
      />

      {/* Education Modal */}
      <PositionEducationModal
        isOpen={isEducationModalOpen}
        onClose={handleCloseEducationModal}
        onSave={handleSaveEducation}
        positionId={position.id}
        editingEducation={editingEducation}
      />

      {/* Benefit Modal */}
      <PositionBenefitsModal
        isOpen={isBenefitModalOpen}
        onClose={handleCloseBenefitModal}
        onSave={handleSaveBenefit}
        positionId={position.id}
      />
    </div>
  );
}

// Helper component for dynamic icon rendering
const IconComponent = ({
  icon: Icon,
  className,
}: {
  icon: React.ComponentType<any>;
  className: string;
}) => {
  return <Icon className={className} />;
};

export default PositionDetails;