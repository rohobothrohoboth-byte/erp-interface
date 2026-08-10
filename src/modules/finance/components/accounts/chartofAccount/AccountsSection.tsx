import { useState } from 'react';
import { motion } from 'framer-motion';
import AccountsHeader from '@/modules/finance/components/accounts/chartofAccount/AccountsHeader';
import AccountsSearchFilter from '@/modules/finance/components/accounts/chartofAccount/AccountsSearchFilter';
import AccountsTree from '@/modules/finance/components/accounts/chartofAccount/AccountsTree';
import type { UUID } from 'crypto';

export interface Account {
  id: UUID;
  code: string;
  name: string;
  accountCategoryId: UUID;
  accountCategoryName: string;
  isGroup: boolean;
  accountType?: 'Asset' | 'Liability' | 'Capital' | 'Income' | 'Expenditure';
  currencyId: UUID;
  currencyCode: string;
  companyId: UUID;
  companyName: string;
  isActive: boolean;
  parentAccountId?: UUID;
  children?: Account[];
  balance?: number;
  createdAt: string;
}

export interface AccountCategory {
  id: UUID;
  name: string;
}

export interface Currency {
  id: UUID;
  name: string;
  code: string;
}

export interface Company {
  id: UUID;
  name: string;
}

const AccountsSection = () => {
  const [searchTerm, setSearchTerm] = useState('');

  // Mock data - replace with actual API calls
  const [accounts] = useState<Account[]>([
    {
      id: '1' as UUID,
      code: '1000',
      name: 'Assets',
      accountCategoryId: 'cat1' as UUID,
      accountCategoryName: 'Balance Sheet',
      isGroup: true,
      accountType: 'Asset',
      currencyId: 'curr1' as UUID,
      currencyCode: 'USD',
      companyId: 'comp1' as UUID,
      companyName: 'Main Company',
      isActive: true,
      balance: 150000,
      createdAt: '2024-01-01',
      children: [
        {
          id: '2' as UUID,
          code: '1100',
          name: 'Current Assets',
          accountCategoryId: 'cat1' as UUID,
          accountCategoryName: 'Balance Sheet',
          isGroup: true,
          accountType: 'Asset',
          currencyId: 'curr1' as UUID,
          currencyCode: 'USD',
          companyId: 'comp1' as UUID,
          companyName: 'Main Company',
          isActive: true,
          parentAccountId: '1' as UUID,
          balance: 100000,
          createdAt: '2024-01-01',
          children: [
            {
              id: '3' as UUID,
              code: '1110',
              name: 'Cash',
              accountCategoryId: 'cat1' as UUID,
              accountCategoryName: 'Balance Sheet',
              isGroup: false,
              currencyId: 'curr1' as UUID,
              currencyCode: 'USD',
              companyId: 'comp1' as UUID,
              companyName: 'Main Company',
              isActive: true,
              parentAccountId: '2' as UUID,
              balance: 50000,
              createdAt: '2024-01-01',
            },
            {
              id: '4' as UUID,
              code: '1120',
              name: 'Bank',
              accountCategoryId: 'cat1' as UUID,
              accountCategoryName: 'Balance Sheet',
              isGroup: false,
              currencyId: 'curr1' as UUID,
              currencyCode: 'USD',
              companyId: 'comp1' as UUID,
              companyName: 'Main Company',
              isActive: true,
              parentAccountId: '2' as UUID,
              balance: 50000,
              createdAt: '2024-01-01',
            },
          ],
        },
      ],
    },
  ]);

  return (
    <motion.section
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="bg-gray-50 space-y-6 min-h-screen"
    >
      <AccountsHeader />

      <AccountsSearchFilter searchTerm={searchTerm} setSearchTerm={setSearchTerm} />

      <AccountsTree accounts={accounts} searchTerm={searchTerm} />
    </motion.section>
  );
};

export default AccountsSection;
