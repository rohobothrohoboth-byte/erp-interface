import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import MenuPermissionHeader from "@/modules/settings/components/coreSettings/menuPermissions/MenuPermissionsHeader";
import MenuPermissionSearchFilters from "@/modules/settings/components/coreSettings/menuPermissions/MenuPermissionsSearchFilters";
import MenuPermissionTable from "@/modules/settings/components/coreSettings/menuPermissions/MenuPermissionsTable";
import EditMenuPermissionModal from "@/modules/settings/components/coreSettings/menuPermissions/EditMenuPermissionModal";
import DeleteMenuPermissionModal from "@/modules/settings/components/coreSettings/menuPermissions/DeleteMenuPermissionModal";
import { menuPermissionService } from "@/modules/core/services/settings/ModCore/menu-permissionservice";
import toast from "react-hot-toast";
import type {
  PerMenuListDto,
  PerMenuModDto,
  PerMenuAddDto,
  ModPerMenuListDto,
  UUID
} from '@/modules/core/types/Settings/menu-permissions';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      when: "beforeChildren",
    },
  },
};

const safeString = (value: any): string => {
  if (value === null || value === undefined || value === 'null') {
    return '';
  }
  return String(value).toLowerCase();
};

function PageMenuSettings() {
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [editingPermission, setEditingPermission] = useState<PerMenuListDto | null>(null);
  const [deletingPermission, setDeletingPermission] = useState<PerMenuListDto | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [permissions, setPermissions] = useState<PerMenuListDto[]>([]);
  const [filteredPermissions, setFilteredPermissions] = useState<PerMenuListDto[]>([]);
  const [modules, setModules] = useState<ModPerMenuListDto[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const itemsPerPage = 10;

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const [permissionsData, modulesData] = await Promise.all([
        menuPermissionService.getAllMenuPermissions(),
        menuPermissionService.getAllModules()
      ]);

      // Filter out module records - NO HARDCODED MAPPINGS
      const validPermissions = permissionsData.filter(p =>
          p.key && !p.key.startsWith('mod.')
      );

      setPermissions(validPermissions);
      setFilteredPermissions(validPermissions);
      setModules(modulesData);

    } catch (err: any) {
      console.error("Error loading data:", err);
      setError(err.message || "Failed to load data. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddPermission = async (newPermission: PerMenuAddDto) => {
    try {
      setError(null);
      const createdPermission = await menuPermissionService.createMenuPermission(newPermission);
      const updatedPermissions = [...permissions, createdPermission];
      const updatedFiltered = [...filteredPermissions, createdPermission];
      setPermissions(updatedPermissions);
      setFilteredPermissions(updatedFiltered);
      setCurrentPage(1);
      await reloadModules();
      return { success: true, data: createdPermission };
    } catch (err: any) {
      console.error("Error creating menu permission:", err);
      setError(err.message || "Failed to create menu permission. Please try again.");
      throw err;
    }
  };

  const handleEditClick = (permission: PerMenuListDto) => {
    setEditingPermission(permission);
  };

  const handleEditClose = () => {
    setEditingPermission(null);
  };

  const handleUpdatePermission = async (updatedMenu: PerMenuModDto) => {


    if (!updatedMenu || !updatedMenu.id) {
      toast.error("Invalid menu data");
      return;
    }

    try {
      // Pass the entire updatedMenu object - the service will use updatedMenu.id
      await menuPermissionService.updateMenuPermission(updatedMenu.id, updatedMenu);
      toast.success("Menu permission updated successfully");
      setEditingPermission(null);
      await loadData();
    } catch (error: any) {
      console.error("Error updating menu permission:", error);
      toast.error(error.message || "Failed to update menu permission");
    }
  };

  const handleDeleteClick = (permission: PerMenuListDto) => {
    setDeletingPermission(permission);
    setIsDeleteModalOpen(true);
  };

  const handleDeletePermission = async (permissionKey: string) => {
    try {
      setError(null);

      await menuPermissionService.deleteMenuPermissionByKey(permissionKey);

      const updatedPermissions = permissions.filter((perm) => perm.key !== permissionKey);
      const updatedFiltered = filteredPermissions.filter((perm) => perm.key !== permissionKey);

      setPermissions(updatedPermissions);
      setFilteredPermissions(updatedFiltered);
      await reloadModules();
      toast.success('Menu permission deleted successfully!');
      return { success: true, message: 'Menu permission deleted successfully!' };
    } catch (err: any) {
      console.error("Error deleting menu permission:", err);
      setError(err.message || "Failed to delete menu permission. Please try again.");
      throw err;
    }
  };

  const handleDeleteConfirm = async (permissionKey: string) => {
    await handleDeletePermission(permissionKey);
    setIsDeleteModalOpen(false);
    setDeletingPermission(null);
  };


  const reloadModules = async () => {
    try {
      const modulesData = await menuPermissionService.getAllModules();
      setModules(modulesData);
    } catch (err) {
      console.error("Error reloading modules:", err);
    }
  };

  const filterPermissions = (permissionsList: PerMenuListDto[], term: string) => {
    if (!term.trim()) return permissionsList;
    const searchLower = term.toLowerCase();
    return permissionsList.filter(permission => {
      const key = safeString(permission.key);
      const name = safeString(permission.name);
      const module = safeString(permission.module);
      const label = safeString(permission.label);
      const path = safeString(permission.path);
      const icon = safeString(permission.icon);
      const parentKey = safeString(permission.parentKey);
      return key.includes(searchLower) || name.includes(searchLower) || module.includes(searchLower) ||
          label.includes(searchLower) || path.includes(searchLower) || icon.includes(searchLower) ||
          parentKey.includes(searchLower);
    });
  };

  useEffect(() => {
    if (permissions.length === 0) return;
    if (searchTerm && searchTerm.trim()) {
      const filtered = filterPermissions(permissions, searchTerm);
      setFilteredPermissions(filtered);
      setCurrentPage(1);
    } else {
      setFilteredPermissions(permissions);
    }
  }, [searchTerm, permissions]);

  const totalPages = Math.ceil(filteredPermissions.length / itemsPerPage);
  const paginatedPermissions = filteredPermissions.slice(
      (currentPage - 1) * itemsPerPage,
      currentPage * itemsPerPage
  );

  useEffect(() => {
    if (currentPage > totalPages && totalPages > 0) {
      setCurrentPage(totalPages);
    }
  }, [filteredPermissions, totalPages, currentPage]);

  return (
      <>
        <motion.section
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="w-full h-full flex flex-col space-y-6"
        >
          <div className="flex justify-between items-center">
            <MenuPermissionHeader menuPermissions={permissions} />
          </div>

          <div className="flex-1">
            {isLoading && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex justify-center items-center py-12"
                >
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500 mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading menu permissions...</p>
                  </div>
                </motion.div>
            )}

            {!isLoading && (
                <div className="space-y-6">
                  {error && (
                      <motion.div
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg"
                      >
                        <div className="flex justify-between items-center">
                    <span className="font-medium">
                      {error.includes("Failed to load") ? (
                          <>
                            Failed to load menu permissions.{" "}
                            <button onClick={loadData} className="underline hover:text-red-800 font-semibold">
                              Try again
                            </button>
                          </>
                      ) : (
                          error
                      )}
                    </span>
                          <button onClick={() => setError(null)} className="text-red-700 hover:text-red-900 font-bold text-lg ml-4">
                            ×
                          </button>
                        </div>
                      </motion.div>
                  )}

                  <MenuPermissionSearchFilters
                      searchTerm={searchTerm}
                      setSearchTerm={setSearchTerm}
                      modules={modules}
                      onAddPermission={handleAddPermission}
                  />

                  <MenuPermissionTable
                      permissions={paginatedPermissions}
                      currentPage={currentPage}
                      totalPages={totalPages}
                      totalItems={filteredPermissions.length}
                      onPageChange={setCurrentPage}
                      onEditPermission={handleEditClick}
                      onDeletePermission={handleDeleteClick}
                  />
                </div>
            )}
          </div>
        </motion.section>

        <EditMenuPermissionModal
            permission={editingPermission}
            modules={modules}
            onEditPermission={handleUpdatePermission}
            onClose={handleEditClose}
        />

        {isDeleteModalOpen && deletingPermission && (
            <DeleteMenuPermissionModal
                permission={deletingPermission}
                onConfirm={handleDeleteConfirm}
                isOpen={isDeleteModalOpen}
                onClose={() => {
                  setIsDeleteModalOpen(false);
                  setDeletingPermission(null);
                }}
            />
        )}
      </>
  );
}

export default PageMenuSettings;