import { motion } from 'framer-motion';
import { FolderTree, FolderOpen, Network, Code, Layers } from 'lucide-react';
import SettingsHeader from '../../../components/settings/SettingsHeader';
import SettingCard from '../../../components/settings/SettingCard';

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      when: 'beforeChildren',
    },
  },
};

// Finance specific settings card data
const financeSettingsCards = [
  {
    id: 1,
    title: 'Chart of Accounts',
    description: 'Manage account hierarchy, codes, and structure for financial reporting',
    icon: FolderTree,
    href: '/settings/finance/accounts',
    color: 'from-indigo-500 to-indigo-600',
    bgColor: 'bg-indigo-50',
    iconColor: 'text-indigo-600',
  },
  {
    id: 2,
    title: 'Account Category',
    description: 'Configure account categories and classifications for better organization',
    icon: FolderOpen,
    href: '/settings/finance/account-category',
    color: 'from-purple-500 to-purple-600',
    bgColor: 'bg-purple-50',
    iconColor: 'text-purple-600',
  },
  {
    id: 3,
    title: 'Cost Center',
    description: 'Manage cost center hierarchy and structure for expense tracking',
    icon: Network,
    href: '/settings/finance/cost-center',
    color: 'from-violet-500 to-violet-600',
    bgColor: 'bg-violet-50',
    iconColor: 'text-violet-600',
  },
  {
    id: 4,
    title: 'Budget Code',
    description: 'Manage budget codes for financial planning and tracking',
    icon: Code,
    href: '/settings/finance/budget-code',
    color: 'from-blue-500 to-blue-600',
    bgColor: 'bg-blue-50',
    iconColor: 'text-blue-600',
  },
  {
    id: 5,
    title: 'Budget Category',
    description: 'Configure budget categories for expense classification and tracking',
    icon: Layers,
    href: '/settings/finance/budget-category',
    color: 'from-teal-500 to-teal-600',
    bgColor: 'bg-teal-50',
    iconColor: 'text-teal-600',
  },
];

function PageFinanceSettings() {
  return (
    <>
      <motion.section
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="flex flex-col space-y-6 bg-gray-50"
      >
        <SettingsHeader />

        <div className="mx-auto w-full">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {financeSettingsCards.map((card, index) => (
              <SettingCard key={card.id} {...card} index={index} />
            ))}
          </div>
        </div>
      </motion.section>
    </>
  );
}

export default PageFinanceSettings;
