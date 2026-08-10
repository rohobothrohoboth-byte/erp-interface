import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BookOpen } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import JobGradeHeader from '@/modules/settings/components/hrSettings/jobgrade/JobGradeHeader';
import JobGradeCard from '@/modules/settings/components/hrSettings/jobgrade/JobGradeCard';
import JobGradeSearchFilters from '@/modules/settings/components/hrSettings/jobgrade/JobGradeSearchFilters';
import AddJobGradeModal from '@/modules/settings/components/hrSettings/jobgrade/AddJobGrade';
import EditJobGradeModal from '@/modules/settings/components/hrSettings/jobgrade/EditJobGradeModal';
import DeleteJobGradeModal from '@/modules/settings/components/hrSettings/jobgrade/DeleteJobGradeModal';
import { jobGradeService } from '@/modules/core/services/settings/ModHrm/JobGradeServives';
import type { JobGradeListDto, JobGradeAddDto, JobGradeModDto } from '@/modules/hr/types/jobgrade';

const ITEMS_PER_PAGE = 20;

const JobGradePage = () => {
  const [jobGrades, setJobGrades] = useState<JobGradeListDto[]>([]);
  const [filteredGrades, setFilteredGrades] = useState<JobGradeListDto[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({ 
    minSalary: '' as number | '',
    maxSalary: '' as number | '',
  });
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [editingGrade, setEditingGrade] = useState<JobGradeListDto | null>(null);
  const [deletingGrade, setDeletingGrade] = useState<JobGradeListDto | null>(null);
  const [expandedCard, setExpandedCard] = useState<string | null>(null);

  // Calculate pagination values
  const totalItems = filteredGrades.length;
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = Math.min(startIndex + ITEMS_PER_PAGE, totalItems);
  const currentGrades = filteredGrades.slice(startIndex, endIndex);

  // Load job grades on component mount
  useEffect(() => {
    loadJobGrades();
  }, []);

  // Filter job grades when search term or filters change
  useEffect(() => {
    let results = jobGrades;
    
    // Search filter
    if (searchTerm) {
      const t = searchTerm.toLowerCase();
      results = results.filter(grade =>
        grade.name.toLowerCase().includes(t)
      );
    }
    
    // Salary filters
    if (filters.minSalary !== '') {
      results = results.filter(grade => grade.startSalary >= Number(filters.minSalary));
    }
    if (filters.maxSalary !== '') {
      results = results.filter(grade => grade.maxSalary <= Number(filters.maxSalary));
    }

    setFilteredGrades(results);
    setCurrentPage(1); // Reset to first page when filters change
  }, [searchTerm, filters, jobGrades]);

  const loadJobGrades = async () => {
    try {
      setLoading(true);
      setError(null);
      const grades = await jobGradeService.getAllJobGrades();
      setJobGrades(grades);
      setFilteredGrades(grades);
    } catch (err) {
      setError('Failed to load job grades');
      console.error('Error loading job grades:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddGrade = async (newGrade: JobGradeAddDto) => {
    try {
      setError(null);
      const createdGrade = await jobGradeService.createJobGrade(newGrade);
      setJobGrades(prev => [createdGrade, ...prev]);
      setFilteredGrades(prev => [createdGrade, ...prev]);
      setExpandedCard(createdGrade.id);
      setCurrentPage(1);
      setIsAddModalOpen(false);
    } catch (err) {
      setError('Failed to create job grade');
      console.error('Error creating job grade:', err);
    }
  };

  const handleEdit = (jobGrade: JobGradeListDto) => {
    setEditingGrade(jobGrade);
    setIsEditModalOpen(true);
  };

  const handleDelete = (jobGrade: JobGradeListDto) => {
    setDeletingGrade(jobGrade);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = async (jobGrade: JobGradeListDto) => {
    try {
      setError(null);
      await jobGradeService.deleteJobGrade(jobGrade.id);
      setJobGrades(prev => prev.filter(grade => grade.id !== jobGrade.id));
      setFilteredGrades(prev => prev.filter(grade => grade.id !== jobGrade.id));
      setIsDeleteModalOpen(false);
      setDeletingGrade(null);
    } catch (err) {
      setError('Failed to delete job grade');
      console.error('Error deleting job grade:', err);
    }
  };

  const handleSaveEdit = async (updatedGrade: JobGradeModDto) => {
    try {
      setError(null);
      const savedGrade = await jobGradeService.updateJobGrade(updatedGrade);
      setJobGrades(prev => prev.map(grade => 
        grade.id === savedGrade.id ? savedGrade : grade
      ));
      setFilteredGrades(prev => prev.map(grade => 
        grade.id === savedGrade.id ? savedGrade : grade
      ));
      setIsEditModalOpen(false);
      setEditingGrade(null);
    } catch (err) {
      setError('Failed to update job grade');
      console.error('Error updating job grade:', err);
    }
  };

  return (
    <motion.section 
      className="min-h-screen bg-gray-50 space-y-6" 
      initial="hidden" 
      animate="visible" 
      variants={{
        hidden: { opacity: 0 },
        visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
      }}
    >
      <JobGradeHeader jobGrades={jobGrades} />

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
                  Failed to load job grades.{" "}
                  <button
                    onClick={loadJobGrades}
                    className="underline hover:text-red-800 font-semibold focus:outline-none"
                  >
                    Try again
                  </button>{" "}
                  later.
                </>
              ) : error.includes("create") ? (
                "Failed to create job grade. Please try again."
              ) : error.includes("update") ? (
                "Failed to update job grade. Please try again."
              ) : error.includes("delete") ? (
                "Failed to delete job grade. Please try again."
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

      <JobGradeSearchFilters
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        filters={filters}
        setFilters={setFilters}
        jobGrades={jobGrades}
        onAddClick={() => setIsAddModalOpen(true)}
        viewMode={viewMode}
        setViewMode={setViewMode}
      />

      <AddJobGradeModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAddGrade={handleAddGrade}
      />

      <EditJobGradeModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setEditingGrade(null);
        }}
        onSave={handleSaveEdit}
        jobGrade={editingGrade}
      />

      <DeleteJobGradeModal
        jobGrade={deletingGrade}
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setDeletingGrade(null);
        }}
        onConfirm={handleConfirmDelete}
      />

      {/* Loading State */}
      {loading && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="flex justify-center items-center py-12"
        >
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading job grades...</p>
          </div>
        </motion.div>
      )}

      {/* Success State */}
      {!loading && !error && currentGrades.length > 0 && (
        <>
          <motion.div 
            className={
              viewMode === 'grid'
                ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
                : "space-y-4"
            }
          >
            <AnimatePresence>
              {currentGrades.map(grade => (
                <JobGradeCard
                  key={grade.id}
                  jobGrade={grade}
                  expanded={expandedCard === grade.id}
                  onToggleExpand={() => setExpandedCard(prev => prev === grade.id ? null : grade.id)}
                  viewMode={viewMode}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                />
              ))}
            </AnimatePresence>
          </motion.div>
        </>
      )}

      {/* Empty State */}
      {!loading && !error && filteredGrades.length === 0 && jobGrades.length === 0 && (
        <div className="flex flex-col items-center justify-center py-12 bg-white rounded-lg border border-green-100">
          <BookOpen className="h-10 w-10 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900">No job grades found</h3>
          <p className="text-sm text-gray-500 mt-1">
            Get started by creating your first job grade
          </p>
        </div>
      )}

      {/* No Results State */}
      {!loading && !error && jobGrades.length > 0 && filteredGrades.length === 0 && (
        <div className="flex flex-col items-center justify-center py-12 bg-white rounded-lg border border-green-100">
          <BookOpen className="h-10 w-10 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900">No job grades match your search</h3>
          <p className="text-sm text-gray-500 mt-1">
            Try adjusting your search or filters
          </p>
          <Button
            variant="ghost"
            className="mt-4 text-green-600 hover:bg-green-50"
            onClick={() => {
              setSearchTerm('');
              setFilters({ minSalary: '', maxSalary: '' });
            }}
          >
            Reset filters
          </Button>
        </div>
      )}
    </motion.section>
  );
};

export default JobGradePage;