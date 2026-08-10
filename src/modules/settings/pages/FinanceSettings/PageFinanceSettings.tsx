// src/pages/settings/finance/PageFinanceSettings.tsx
import { motion } from 'framer-motion';
import {
  FolderTree, FolderOpen, Network, Code, Layers, GitBranch,
  Settings, Shield, Users, DollarSign, Clock, CheckCircle
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Badge } from '@/shared/components/ui/badge';

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

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

// Finance specific settings card data
const financeSettingsCards = [
  {
    id: 'accounts',
    title: 'Chart of Accounts',
    description: 'Manage account hierarchy, codes, and structure for financial reporting',
    icon: FolderTree,
    href: '/settings/finance/accounts',
    color: 'from-indigo-500 to-indigo-600',
    bgColor: 'bg-indigo-50',
    iconColor: 'text-indigo-600',
    status: 'Active',
    count: '156 Accounts',
  },
  {
    id: 'account-category',
    title: 'Account Category',
    description: 'Configure account categories and classifications for better organization',
    icon: FolderOpen,
    href: '/settings/finance/account-category',
    color: 'from-purple-500 to-purple-600',
    bgColor: 'bg-purple-50',
    iconColor: 'text-purple-600',
    status: 'Active',
    count: '8 Categories',
  },
  {
    id: 'cost-center',
    title: 'Cost Center',
    description: 'Manage cost center hierarchy and structure for expense tracking',
    icon: Network,
    href: '/settings/finance/cost-center',
    color: 'from-violet-500 to-violet-600',
    bgColor: 'bg-violet-50',
    iconColor: 'text-violet-600',
    status: 'Active',
    count: '24 Centers',
  },
  {
    id: 'budget-code',
    title: 'Budget Code',
    description: 'Manage budget codes for financial planning and tracking',
    icon: Code,
    href: '/settings/finance/budget-code',
    color: 'from-blue-500 to-blue-600',
    bgColor: 'bg-blue-50',
    iconColor: 'text-blue-600',
    status: 'Active',
    count: '45 Codes',
  },
  {
    id: 'budget-category',
    title: 'Budget Category',
    description: 'Configure budget categories for expense classification and tracking',
    icon: Layers,
    href: '/settings/finance/budget-category',
    color: 'from-teal-500 to-teal-600',
    bgColor: 'bg-teal-50',
    iconColor: 'text-teal-600',
    status: 'Active',
    count: '12 Categories',
  },
  {
    id: 'payment-approval-chain',
    title: 'Payment Approval Chain',
    description: 'Configure payment approval workflows and chains for different payment types',
    icon: GitBranch,
    href: '/settings/finance/payment-approval-chain',
    color: 'from-indigo-500 to-indigo-600',
    bgColor: 'bg-indigo-50',
    iconColor: 'text-indigo-600',
    status: 'Active',
    count: '5 Chains',
  },
];

const PageFinanceSettings = () => {
  return (
      <motion.section
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="min-h-screen bg-gray-50/50 p-6"
      >
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-indigo-100 rounded-lg">
              <DollarSign className="h-6 w-6 text-indigo-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Finance Settings</h1>
              <p className="text-sm text-gray-500">
                Configure and manage all financial settings in one place
              </p>
            </div>
          </div>
          <div className="flex items-center gap-4 text-sm text-gray-500">
          <span className="flex items-center gap-1">
            <CheckCircle className="h-4 w-4 text-green-500" />
            All systems operational
          </span>
            <span className="w-px h-4 bg-gray-300" />
            <span>{financeSettingsCards.length} modules available</span>
          </div>
        </div>

        {/* Settings Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {financeSettingsCards.map((card) => (
              <motion.div
                  key={card.id}
                  variants={itemVariants}
                  whileHover={{ y: -4, transition: { duration: 0.2 } }}
              >
                <Link to={card.href} className="block h-full">
                  <Card className="h-full border-gray-200 hover:border-indigo-300 transition-all duration-200 shadow-sm hover:shadow-md">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className={`p-3 rounded-xl ${card.bgColor}`}>
                          <card.icon className={`h-6 w-6 ${card.iconColor}`} />
                        </div>
                        <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                          {card.status}
                        </Badge>
                      </div>
                      <CardTitle className="text-lg font-semibold text-gray-900 mt-3">
                        {card.title}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-gray-500 mb-3">{card.description}</p>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-400">{card.count}</span>
                        <span className="text-indigo-600 font-medium hover:text-indigo-700">
                      Configure →
                    </span>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              </motion.div>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="mt-8 p-4 bg-white rounded-xl border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-3">
              <Settings className="h-5 w-5 text-gray-400" />
              <span className="text-sm font-medium text-gray-700">Quick Actions</span>
            </div>
            <div className="flex gap-3 flex-wrap">
              <button className="px-4 py-2 text-sm bg-indigo-50 text-indigo-700 rounded-lg hover:bg-indigo-100 transition-colors">
                Export All Settings
              </button>
              <button className="px-4 py-2 text-sm bg-gray-50 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors">
                Import Configuration
              </button>
              <button className="px-4 py-2 text-sm bg-amber-50 text-amber-700 rounded-lg hover:bg-amber-100 transition-colors">
                Audit Log
              </button>
            </div>
          </div>
        </div>
      </motion.section>
  );
};

export default PageFinanceSettings;