import { motion } from 'framer-motion';
import { RefreshCw } from 'lucide-react';
import { Button } from '../../components/ui/button';
import InventoryStatCards from '../../components/inventory/InventoryStatCards';
import StockMovements from '../../components/inventory/StockMovements';
import WarehouseManagement from '../../components/inventory/WarehouseManagement';
import ReorderAlerts from '../../components/inventory/ReorderAlerts';
import InventoryTrends from '../../components/inventory/InventoryTrends';
import { useModuleStore } from '../../stores/module.store';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: { type: 'spring', stiffness: 260, damping: 20 }
  }
};

export default function InventoryDashboard() {
  const activeModule = useModuleStore((s) => s.activeModule);

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible">
      <section className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {activeModule === 'Inventory' ? (
              <>
                Inventory Management <span className="text-yellow-600">Dashboard</span>
              </>
            ) : (
              'Dashboard'
            )}
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Overview of all inventory operations and metrics.
          </p>
        </div>
        <div className="flex space-x-3 mt-4 sm:mt-0">
          <Button variant="outline" size="sm">
            <RefreshCw size={16} />
            Refresh
          </Button>
        </div>
      </section>

      <motion.div variants={itemVariants}>
        <InventoryStatCards />
      </motion.div>

      <motion.div
        variants={itemVariants}
        className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6"
      >
        <StockMovements />
        <ReorderAlerts />
        <WarehouseManagement />
      </motion.div>

      <motion.div variants={itemVariants} className="mt-6">
        <InventoryTrends />
      </motion.div>
    </motion.div>
  );
}
