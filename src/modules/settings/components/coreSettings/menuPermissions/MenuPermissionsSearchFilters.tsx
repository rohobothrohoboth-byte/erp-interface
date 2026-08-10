import { motion } from "framer-motion";
import AddMenuPermissionModal from "@/modules/settings/components/coreSettings/menuPermissions/AddMenuPermissionsModal";
import { useMemo } from "react";

interface MenuPermissionSearchFiltersProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  onAddPermission?: (permission: any) => void;
  permissions?: any[]; // Add this prop if you're passing permissions
}

const MenuPermissionSearchFilters = ({
                                       searchTerm,
                                       setSearchTerm,
                                       onAddPermission,
                                       permissions = [],
                                     }: MenuPermissionSearchFiltersProps) => {
  const clearSearch = () => {
    setSearchTerm('');
  };

  const hasSearchTerm = searchTerm !== '';

  // Deduplicate permissions by ID to prevent key warnings
  const uniquePermissions = useMemo(() => {
    const seen = new Set();
    return permissions.filter(permission => {
      if (seen.has(permission.id)) {
        console.warn(`Duplicate permission ID found: ${permission.id}`);
        return false;
      }
      seen.add(permission.id);
      return true;
    });
  }, [permissions]);

  const handleAddPermission = async (permission: any) => {

    if (onAddPermission) {
      await onAddPermission(permission);
    }
  };

  return (
      <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4 }}
          className="bg-white p-4 rounded-lg shadow-sm mb-4"
      >
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex-1">
            <label htmlFor="search" className="sr-only">
              Search menu permissions
            </label>
            <div className="relative max-w-md">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg
                    className="h-5 w-5 text-gray-400"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                >
                  <path
                      fillRule="evenodd"
                      d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z"
                      clipRule="evenodd"
                  />
                </svg>
              </div>
              <input
                  id="search"
                  name="search"
                  type="text"
                  placeholder="Search menu permissions by key, name, label, path, icon, module..."
                  className="block w-full pl-10 pr-10 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
              />
              {hasSearchTerm && (
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                    <button
                        type="button"
                        onClick={clearSearch}
                        className="text-gray-400 hover:text-gray-600 transition-colors duration-200"
                    >
                      <svg
                          className="h-4 w-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                      >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M6 18L18 6M6 6l12 12"
                        />
                      </svg>
                      <span className="sr-only">Clear search</span>
                    </button>
                  </div>
              )}
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <AddMenuPermissionModal
                onAddPermission={handleAddPermission}
            />
          </div>
        </div>

        {/* Render unique permissions list */}
        {uniquePermissions.length > 0 && (
            <div className="mt-4">
              {uniquePermissions.map((permission) => (
                  <div key={permission.id} className="permission-item">
                    {/* Your permission display logic */}
                  </div>
              ))}
            </div>
        )}
      </motion.div>
  );
};

export default MenuPermissionSearchFilters;