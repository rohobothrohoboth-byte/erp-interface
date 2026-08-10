import { useState, useEffect } from 'react';
import { Users } from 'lucide-react';
import PositionHeader from '@/modules/settings/components/hrSettings/position/PositionHeader';
import PositionSearchFilters from '@/modules/settings/components/hrSettings/position/PositonSearchFilter';
import PositionCard from '@/modules/settings/components/hrSettings/position/PositionCard';
import AddPositionModal from '@/modules/settings/components/hrSettings/position/AddPositionModal';
import EditPositionModal from '@/modules/settings/components/hrSettings/position/EditPositionModal';
import DeletePositionModal from '@/modules/settings/components/hrSettings/position/DeletePositionModal';
import type { PositionListDto, PositionAddDto, PositionModDto } from '@/modules/hr/types/position';
import { positionService } from '@/modules/core/services/settings/ModHrm/positionService';
import { motion } from 'framer-motion';

function PagePosition() {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedPosition, setSelectedPosition] = useState<PositionListDto | null>(null);
  const [positionToDelete, setPositionToDelete] = useState<PositionListDto | null>(null);
  const [positionData, setPositionData] = useState<PositionListDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch positions on component mount
  useEffect(() => {
    fetchPositions();
  }, []);

  const fetchPositions = async () => {
    try {
      setLoading(true);
      // Use actual service call
      const positions = await positionService.getAllPositions();
      setPositionData(positions);
      setError(null);
    } catch (err) {
      setError('Failed to fetch positions');
      console.error('Error fetching positions:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddPositionClick = () => {
    setIsAddModalOpen(true);
  };

  const handleAddPosition = async (newPositionData: PositionAddDto) => {
    try {
      // Use actual service call
      await positionService.createPosition(newPositionData);
      await fetchPositions(); // Refresh the list
      setIsAddModalOpen(false);
    } catch (err) {
      setError('Failed to add position');
      console.error('Error adding position:', err);
    }
  };

  const handleEdit = (position: PositionListDto) => {
    setSelectedPosition(position);
    setIsEditModalOpen(true);
  };

  const handleDelete = (position: PositionListDto) => {
    setPositionToDelete(position);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = async (position: PositionListDto) => {
    try {
      // Use actual service call
      await positionService.deletePosition(position.id);
      await fetchPositions(); // Refresh the list
      setIsDeleteModalOpen(false);
      setPositionToDelete(null);
    } catch (err) {
      setError('Failed to delete position');
      console.error('Error deleting position:', err);
    }
  };

  const handleCloseDeleteModal = () => {
    setIsDeleteModalOpen(false);
    setPositionToDelete(null);
  };

  const handleSavePosition = async (updatedPosition: PositionModDto) => {
    try {
      // Use actual service call
      await positionService.updatePosition(updatedPosition);
      await fetchPositions(); // Refresh the list
      setIsEditModalOpen(false);
      setSelectedPosition(null);
    } catch (err) {
      setError('Failed to update position');
      console.error('Error updating position:', err);
    }
  };

  const handleCloseEditModal = () => {
    setIsEditModalOpen(false);
    setSelectedPosition(null);
  };

  const filteredData = positionData.filter(item =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.nameAm.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.department.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    );
  }

  return (
    <div className="mx-auto space-y-6">
      <PositionHeader />

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
                  Failed to load Positions.{" "}
                  <button
                    onClick={fetchPositions}
                    className="underline hover:text-red-800 font-semibold focus:outline-none"
                  >
                    Try again
                  </button>{" "}
                  later.
                </>
              ) : error.includes("create") ? (
                "Failed to create position. Please try again."
              ) : error.includes("update") ? (
                "Failed to update position. Please try again."
              ) : error.includes("delete") ? (
                "Failed to delete position. Please try again."
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

      <PositionSearchFilters
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        positionData={positionData}
        onAddClick={handleAddPositionClick}
        viewMode={viewMode}
        setViewMode={setViewMode}
      />

      <div>
        {filteredData.length === 0 ? (
          <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
            <div className="text-gray-400 mb-4">
              <Users className="h-16 w-16 mx-auto" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No positions found
            </h3>
            <p className="text-gray-500 mb-4">
              {searchTerm ? `No positions match your search for "${searchTerm}"` : 'Get started by adding your first position'}
            </p>
          </div>
        ) : (
          <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' : 'space-y-4'}>
            {filteredData.map((position) => (
              <PositionCard
                key={position.id}
                position={position}
                expanded={false}
                onToggleExpand={() => {}}
                viewMode={viewMode}
                onEdit={handleEdit}
                onDelete={handleDelete}
              />
            ))}
          </div>
        )}

        {/* Search Results Info */}
        {filteredData.length > 0 && searchTerm && (
          <div className="mt-4 text-sm text-gray-500">
            Found {filteredData.length} results for "{searchTerm}"
          </div>
        )}
      </div>

      {/* Add Position Modal */}
      <AddPositionModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAddPosition={handleAddPosition}
      />

      {/* Edit Position Modal */}
      <EditPositionModal
        isOpen={isEditModalOpen}
        onClose={handleCloseEditModal}
        onSave={handleSavePosition}
        position={selectedPosition}
      />

      {/* Delete Position Modal */}
      <DeletePositionModal
        position={positionToDelete}
        isOpen={isDeleteModalOpen}
        onClose={handleCloseDeleteModal}
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
}

export default PagePosition;