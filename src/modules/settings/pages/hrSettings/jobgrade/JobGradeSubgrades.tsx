import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Briefcase, BadgePlus, Grid, List } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import JobGradeSubgradesHeader from '@/modules/settings/components/hrSettings/jobgrade/JobGradeSubgradesHeader';
import AddJgStepModal from '@/modules/settings/components/hrSettings/jobgrade/AddJgStepModal';
import EditJgStepModal from '@/modules/settings/components/hrSettings/jobgrade/EditJgStepModal';
import DeleteJgStepModal from '@/modules/settings/components/hrSettings/jobgrade/DeleteJgStepModal';
import StepCard from '@/modules/settings/components/hrSettings/jobgrade/StepCard';
import { jgStepService } from '@/modules/core/services/settings/ModHrm/JgStepService';
import type { JobGradeListDto } from '@/modules/hr/types/jobgrade';
import type { JgStepListDto, JgStepAddDto, JgStepModDto, UUID } from '@/modules/hr/types/JgStep';

const JobGradeSubgrades: React.FC = () => {
  const { gradeId } = useParams<{ gradeId: string }>();
  const location = useLocation();
  const navigate = useNavigate();
  const [jobGrade, setJobGrade] = useState<JobGradeListDto | null>(null);
  const [steps, setSteps] = useState<JgStepListDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [editingStep, setEditingStep] = useState<JgStepListDto | null>(null);
  const [deletingStep, setDeletingStep] = useState<JgStepListDto | null>(null);

  // Memoized load function to prevent unnecessary recreations
  const loadJobGradeAndSteps = useCallback(async () => {
    if (!gradeId) return;

    try {
      setLoading(true);
      setError(null);

      if (location.state?.jobGrade) {
        setJobGrade(location.state.jobGrade);
      } else if (gradeId) {
        
        console.log('Job grade ID:', gradeId);
      }

      // Fetch steps for the job grade
      const stepsData = await jgStepService.getJgStepsByJobGrade(gradeId as UUID);
      setSteps(stepsData);
    } catch (err) {
      setError('Failed to load job grade steps');
      console.error('Error loading job grade steps:', err);
    } finally {
      setLoading(false);
    }
  }, [gradeId, location.state]);

  
  useEffect(() => {
    loadJobGradeAndSteps();
  }, [loadJobGradeAndSteps]); // Only re-run when loadJobGradeAndSteps changes

  const handleBack = () => {
    navigate('/settings/hr/jobgrade');
  };

  const handleOpenAddModal = () => {
    setIsAddModalOpen(true);
  };

  const handleCloseAddModal = () => {
    setIsAddModalOpen(false);
  };

  const handleOpenEditModal = (step: JgStepListDto) => {
    setEditingStep(step);
    setIsEditModalOpen(true);
  };

  const handleCloseEditModal = () => {
    setEditingStep(null);
    setIsEditModalOpen(false);
  };

  const handleOpenDeleteModal = (step: JgStepListDto) => {
    setDeletingStep(step);
    setIsDeleteModalOpen(true);
  };

  const handleCloseDeleteModal = () => {
    setDeletingStep(null);
    setIsDeleteModalOpen(false);
  };

  const handleAddStep = async (stepData: JgStepAddDto) => {
    if (!gradeId) return;

    try {
      setError(null);
      const newStep = await jgStepService.createJgStep({
        ...stepData,
        jobGradeId: gradeId as UUID
      });
      setSteps(prev => [...prev, newStep]);
      handleCloseAddModal();
    } catch (err) {
      setError('Failed to create step');
      console.error('Error creating step:', err);
    }
  };

  const handleEditStep = async (stepData: JgStepModDto) => {
    try {
      setError(null);
      const updatedStep = await jgStepService.updateJgStep(stepData);
      setSteps(prev => prev.map(step => 
        step.id === updatedStep.id ? updatedStep : step
      ));
      handleCloseEditModal();
    } catch (err) {
      setError('Failed to update step');
      console.error('Error updating step:', err);
    }
  };

  const handleDeleteStep = async (step: JgStepListDto) => {
    try {
      setError(null);
      setDeletingId(step.id);
      await jgStepService.deleteJgStep(step.id);
      setSteps(prev => prev.filter(s => s.id !== step.id));
      handleCloseDeleteModal();
    } catch (err) {
      setError('Failed to delete step');
      console.error('Error deleting step:', err);
    } finally {
      setDeletingId(null);
    }
  };

  // Format currency for display
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-ET', {
      minimumFractionDigits: 0,
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="flex items-center gap-4 mb-6">
          <Button
            variant="outline"
            onClick={handleBack}
            className="cursor-pointer border-gray-300 hover:bg-gray-50 hover:border-gray-400 transition-colors"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Job Grades
          </Button>
        </div>
        <div className="flex justify-center items-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading job grade steps...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <motion.section
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="bg-gray-50 space-y-4 min-h-screen"
    >
      {/* Header Section */}
      <div className="flex items-center gap-4 mb-6">
        <Button
          variant="outline"
          onClick={handleBack}
          className="cursor-pointer border-gray-300 hover:bg-gray-50 hover:border-gray-400 transition-colors"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Job Grades
        </Button>

        <div className="h-10 w-px bg-gray-300"></div>

        <div className="flex-1">
          <JobGradeSubgradesHeader jobGrade={jobGrade} />
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg"
        >
          <div className="flex justify-between items-center">
            <span className="font-medium">
              {error.includes("load") ? (
                <>
                  Failed to load job grade steps.{" "}
                  <button
                    onClick={loadJobGradeAndSteps}
                    className="underline hover:text-red-800 font-semibold focus:outline-none"
                  >
                    Try again
                  </button>{" "}
                  later.
                </>
              ) : error.includes("create") ? (
                "Failed to create step. Please try again."
              ) : error.includes("update") ? (
                "Failed to update step. Please try again."
              ) : error.includes("delete") ? (
                "Failed to delete step. Please try again."
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

      {/* Job Grade Info Card with Action Buttons */}
      {jobGrade && (
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-lg shadow-sm border border-green-100 p-6 mb-6"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center flex-1">
              <div className="p-3 rounded-full bg-green-50 mr-4">
                <Briefcase className="text-green-600" size={24} />
              </div>
              <div className="flex-1">
                <h2 className="text-lg font-semibold text-gray-900">
                  {jobGrade.name}
                </h2>
                <div className="grid grid-cols-2 gap-4 mt-2 text-sm">
                  <div>
                    <span className="text-gray-500">Start Salary:</span>
                    <span className="ml-2 font-semibold">
                      {formatCurrency(jobGrade.startSalary)} ETB
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-500">Max Salary:</span>
                    <span className="ml-2 font-semibold">
                      {formatCurrency(jobGrade.maxSalary)} ETB
                    </span>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Action Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="flex space-x-3"
            >
              {/* View Mode Toggle */}
              <Button
                variant="outline"
                size="sm"
                className="gap-2 cursor-pointer border-green-300 text-green-700 hover:bg-green-100 hover:text-green-800"
                onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
              >
                {viewMode === 'grid' ? (
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

              {/* Add Step Button */}
              <Button
                onClick={handleOpenAddModal}
                className="flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white whitespace-nowrap cursor-pointer"
              >
                <BadgePlus className="h-4 w-4 mr-2" />
                Add Job Step
              </Button>
            </motion.div>
          </div>
        </motion.div>
      )}

      {/* Steps List */}
      {!loading && (
        <div className={
          viewMode === 'grid' 
            ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" 
            : "space-y-4"
        }>
          {steps.map((step, index) => (
            <StepCard
              key={step.id}
              step={step}
              index={index}
              totalSteps={steps.length}
              onEdit={handleOpenEditModal}
              onDelete={handleOpenDeleteModal}
              isDeleting={deletingId === step.id}
              viewMode={viewMode}
            />
          ))}
        </div>
      )}

      {!loading && steps.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-center py-12 bg-white rounded-lg border border-gray-200"
        >
          <Briefcase className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No Job Steps Found
          </h3>
          <p className="text-gray-500 mb-4">
            Get started by creating the first step for this job grade.
          </p>
        </motion.div>
      )}

        {/* Add Step Modal */}
      <AddJgStepModal
        isOpen={isAddModalOpen}
        onClose={handleCloseAddModal}
        onAddStep={handleAddStep}
        jobGradeId={gradeId as UUID || ''}
        minSalary={jobGrade?.startSalary || 0}
        maxSalary={jobGrade?.maxSalary || 0}
      />

      {/* Edit Step Modal */}
      <EditJgStepModal
        isOpen={isEditModalOpen}
        onClose={handleCloseEditModal}
        onSave={handleEditStep}
        step={editingStep}
      />

      {/* Delete Step Modal */}
      <DeleteJgStepModal
        isOpen={isDeleteModalOpen}
        onClose={handleCloseDeleteModal}
        onConfirm={handleDeleteStep}
        step={deletingStep}
      />
    </motion.section>
  );
};

export default JobGradeSubgrades;