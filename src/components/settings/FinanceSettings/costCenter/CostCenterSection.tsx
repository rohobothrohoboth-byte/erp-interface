import { useState } from 'react';
import { motion } from 'framer-motion';
import CostCenterHeader from './CostCenterHeader';
import CostCenterSearchFilter from './CostCenterSearchFilter';
import CostCenterTree from './CostCenterTree';
import AddCostCenterModal from './AddCostCenterModal';
import EditCostCenterModal from './EditCostCenterModal';
import DeleteCostCenterModal from './DeleteCostCenterModal';

export interface CostCenter {
  id: string;
  costCenterCode: string;
  name: string;
  description: string;
  parentCode?: string;
  isGroup: boolean;
  status: 'Active' | 'Inactive';
  children?: CostCenter[];
  createdAt: string;
}

const CostCenterSection = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedCostCenter, setSelectedCostCenter] = useState<CostCenter | null>(null);
  const [selectedParent, setSelectedParent] = useState<CostCenter | null>(null);

  const [costCenters, setCostCenters] = useState<CostCenter[]>([  ]);

  const handleAddCostCenter = async (data: Omit<CostCenter, 'id' | 'createdAt' | 'children'>) => {
    const newCostCenter: CostCenter = {
      ...data,
      id: `cc-${Date.now()}`,
      createdAt: new Date().toISOString(),
      children: [],
    };

    // If this is the first cost center, make it the root
    if (costCenters.length === 0) {
      // Force it to be a group and remove parentCode
      newCostCenter.isGroup = true;
      newCostCenter.parentCode = undefined;
      setCostCenters([newCostCenter]);
    } else if (selectedParent) {
      // Add as child to selected parent
      const addChild = (centers: CostCenter[]): CostCenter[] => {
        return centers.map((center) => {
          if (center.costCenterCode === selectedParent.costCenterCode) {
            return {
              ...center,
              children: [...(center.children || []), newCostCenter],
            };
          }
          if (center.children && center.children.length > 0) {
            return {
              ...center,
              children: addChild(center.children),
            };
          }
          return center;
        });
      };
      setCostCenters(addChild(costCenters));
    } else {
      // If root exists but no parent selected, add as child of root
      const root = costCenters[0];
      newCostCenter.parentCode = root.costCenterCode;
      setCostCenters([
        {
          ...root,
          children: [...(root.children || []), newCostCenter],
        },
      ]);
    }

    setIsAddModalOpen(false);
    setSelectedParent(null);
  };

  const handleEditCostCenter = async (data: Omit<CostCenter, 'id' | 'createdAt' | 'children'>) => {
    if (!selectedCostCenter) return;

    const updateCenter = (centers: CostCenter[]): CostCenter[] => {
      return centers.map((center) => {
        if (center.id === selectedCostCenter.id) {
          return {
            ...center,
            ...data,
          };
        }
        if (center.children && center.children.length > 0) {
          return {
            ...center,
            children: updateCenter(center.children),
          };
        }
        return center;
      });
    };

    setCostCenters(updateCenter(costCenters));
    setIsEditModalOpen(false);
    setSelectedCostCenter(null);
  };

  const handleDeleteCostCenter = async () => {
    if (!selectedCostCenter) return;

    const deleteCenter = (centers: CostCenter[]): CostCenter[] => {
      return centers
        .filter((center) => center.id !== selectedCostCenter.id)
        .map((center) => ({
          ...center,
          children: center.children ? deleteCenter(center.children) : [],
        }));
    };

    setCostCenters(deleteCenter(costCenters));
    setIsDeleteModalOpen(false);
    setSelectedCostCenter(null);
  };

  const handleAddChild = (parent: CostCenter) => {
    setSelectedParent(parent);
    setIsAddModalOpen(true);
  };

  const handleEdit = (costCenter: CostCenter) => {
    setSelectedCostCenter(costCenter);
    setIsEditModalOpen(true);
  };

  const handleDelete = (costCenter: CostCenter) => {
    setSelectedCostCenter(costCenter);
    setIsDeleteModalOpen(true);
  };

  return (
    <motion.section
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="bg-gray-50 space-y-6 min-h-screen"
    >
      <CostCenterHeader />

      <CostCenterSearchFilter
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        onAddClick={() => setIsAddModalOpen(true)}
      />

      <CostCenterTree
        costCenters={costCenters}
        searchTerm={searchTerm}
        onAddChild={handleAddChild}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />

      <AddCostCenterModal
        isOpen={isAddModalOpen}
        onClose={() => {
          setIsAddModalOpen(false);
          setSelectedParent(null);
        }}
        onSubmit={handleAddCostCenter}
        parentCostCenter={selectedParent}
        isFirstCostCenter={costCenters.length === 0}
      />

      <EditCostCenterModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setSelectedCostCenter(null);
        }}
        onSubmit={handleEditCostCenter}
        costCenter={selectedCostCenter}
      />

      <DeleteCostCenterModal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setSelectedCostCenter(null);
        }}
        onConfirm={handleDeleteCostCenter}
        costCenterName={selectedCostCenter?.name || ''}
      />
    </motion.section>
  );
};

export default CostCenterSection;
