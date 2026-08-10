import { motion } from 'framer-motion';
import { Folder, FileText } from 'lucide-react';

interface AccountDetailHeaderProps {
  account: {
    code: string;
    name: string;
    isGroup: boolean;
    isActive: boolean;
  };
}

const AccountDetailHeader: React.FC<AccountDetailHeaderProps> = ({ account }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-lg border border-indigo-200 shadow-sm p-6"
    >
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-indigo-100 flex items-center justify-center">
            {account.isGroup ? (
              <Folder size={32} className="text-indigo-600" />
            ) : (
              <FileText size={32} className="text-indigo-600" />
            )}
          </div>
          <div>
            <h1 className="text-2xl font-bold text-indigo-900">{account.name}</h1>
            <p className="text-sm text-gray-600 font-mono">{account.code}</p>
          </div>
        </div>
        <div>
          <span
            className={`px-3 py-1 rounded-full text-sm font-medium ${
              account.isActive ? 'bg-indigo-100 text-indigo-800' : 'bg-gray-100 text-gray-600'
            }`}
          >
            {account.isActive ? 'Active' : 'Inactive'}
          </span>
        </div>
      </div>
    </motion.div>
  );
};

export default AccountDetailHeader;
