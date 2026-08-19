import { motion } from 'framer-motion';
import { Settings } from 'lucide-react';
import { useLocation } from 'react-router-dom';

// Module color mapping
const moduleColors: Record<string, { from: string; to: string; icon: string }> = {
  'hr': { from: 'from-blue-500', to: 'to-blue-700', icon: 'text-blue-600' },
  'core': { from: 'from-gray-500', to: 'to-gray-700', icon: 'text-gray-600' },
  'crm': { from: 'from-green-500', to: 'to-green-700', icon: 'text-green-600' },
  'finance': { from: 'from-purple-500', to: 'to-purple-700', icon: 'text-purple-600' },
  'procurement': { from: 'from-orange-500', to: 'to-orange-700', icon: 'text-orange-600' },
  'inventory': { from: 'from-yellow-500', to: 'to-yellow-700', icon: 'text-yellow-600' },
  'file': { from: 'from-red-500', to: 'to-red-700', icon: 'text-red-600' },
  'default': { from: 'from-green-500', to: 'to-green-900', icon: 'text-green-600' }
};

// Function to get module info from path
const getModuleInfo = (pathname: string) => {
  if (pathname === '/settings') return { name: '', colors: moduleColors.default };
  
  const pathParts = pathname.split('/');
  if (pathParts.length >= 3) {
    const module = pathParts[2];
    const moduleKey = module.toLowerCase();
    const colors = moduleColors[moduleKey] || moduleColors.default;
    const name = module.charAt(0).toUpperCase() + module.slice(1);
    return { name, colors };
  }
  return { name: '', colors: moduleColors.default };
};

function SettingsHeader() {
  const location = useLocation();
  const { name: moduleName, colors } = getModuleInfo(location.pathname);
  
  return (
    <div className="flex items-center gap-3">
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex items-center gap-2"
      >
        <Settings className={`w-5 h-5 ${colors.icon}`} />
        
        <div className="flex items-center">
          {moduleName ? (
            <>
              <motion.span
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className={`text-2xl font-bold bg-gradient-to-r ${colors.from} ${colors.to} bg-clip-text text-transparent dark:text-white uppercase mr-1.5`}
              >
             {moduleName} 
              </motion.span>
              {/* <ChevronRight className="w-5 h-5 text-gray-400 mx-2" /> */}
              <motion.span
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className={`text-2xl font-bold bg-gradient-to-r ${colors.from} ${colors.to} bg-clip-text text-transparent dark:text-white`}
              >
                Settings
              </motion.span>
            </>
          ) : (
            <motion.h1 
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className="text-2xl font-bold bg-gradient-to-r from-green-500 to-green-900 bg-clip-text text-transparent dark:text-white"
            >
              Settings
            </motion.h1>
          )}
        </div>
      </motion.div>
      
      {/* Optional: Breadcrumb for nested paths
      {location.pathname.includes('/settings/') && location.pathname.split('/').length > 3 && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="ml-4 text-sm text-gray-500 hidden md:flex items-center"
        >
          {location.pathname.split('/').slice(2).map((part, index, arr) => (
            <span key={part} className="flex items-center">
              <span className="capitalize">{part.replace('-', ' ')}</span>
              {index < arr.length - 1 && (
                <ChevronRight className="w-4 h-4 mx-1" />
              )}
            </span>
          ))}
        </motion.div>
      )} */}
    </div>
  );
}

export default SettingsHeader;