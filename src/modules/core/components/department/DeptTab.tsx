import { motion } from 'framer-motion';
import { Button } from '@/shared/components/ui/button';
import { Plus } from 'lucide-react';
import DepartmentCard from '@/modules/core/components/department/DeptCard';
import type { Department } from '@/modules/core/data/company';

interface DepartmentsTabProps {
  departments: Department[];
}

const DepartmentsTab = ({ departments }: DepartmentsTabProps) => {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className="space-y-4"
    >
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Departments</h3>
        <Button variant="outline" size="sm" className="gap-1 border-emerald-300 text-emerald-700 hover:bg-emerald-50">
          <Plus size={14} />
          Add Department
        </Button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {departments.map((department) => (
          <DepartmentCard key={department.id} department={department} />
        ))}
      </div>
    </motion.div>
  );
};

export default DepartmentsTab;