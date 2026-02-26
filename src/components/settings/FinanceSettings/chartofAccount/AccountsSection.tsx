import { useState } from 'react';
import { motion } from 'framer-motion';
import AccountsHeader from './AccountsHeader';
import AccountsSearchFilter from './AccountsSearchFilter';
import AccountsTree from './AccountsTree';
import AddAccountModal from './AddAccountModal';
import EditAccountModal from './EditAccountModal';
import DeleteAccountModal from './DeleteAccountModal';
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
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState<Account | null>(null);
  const [selectedParentAccount, setSelectedParentAccount] = useState<Account | null>(null);

  // Mock data - replace with actual API calls
  const [accounts, setAccounts] = useState<Account[]>([
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

  const accountCategories: AccountCategory[] = [
    { id: 'cat1' as UUID, name: 'Balance Sheet' },
    { id: 'cat2' as UUID, name: 'Income Statement' },
  ];

  const currencies: Currency[] = [
    { id: 'curr1' as UUID, name: 'US Dollar', code: 'USD' },
    { id: 'curr2' as UUID, name: 'Ethiopian Birr', code: 'ETB' },
  ];

  const companies: Company[] = [
    { id: 'comp1' as UUID, name: 'Main Company' },
    { id: 'comp2' as UUID, name: 'Branch Company' },
  ];

  const handleAddAccount = async (accountData: any) => {
    console.log('Adding account:', accountData);
    
    // Create new account object
    const newAccount: Account = {
      id: `acc-${Date.now()}` as UUID,
      code: accountData.code,
      name: accountData.name,
      accountCategoryId: accountData.accountCategoryId,
      accountCategoryName: accountCategories.find(c => c.id === accountData.accountCategoryId)?.name || '',
      isGroup: accountData.isGroup,
      accountType: accountData.accountType,
      currencyId: accountData.currencyId,
      currencyCode: currencies.find(c => c.id === accountData.currencyId)?.code || '',
      companyId: accountData.companyId,
      companyName: companies.find(c => c.id === accountData.companyId)?.name || '',
      isActive: accountData.isActive,
      balance: 0,
      createdAt: new Date().toISOString(),
      children: [],
    };

    // If there's a parent account, add as child
    if (selectedParentAccount) {
      newAccount.parentAccountId = selectedParentAccount.id;
      
      // Helper function to add child to parent recursively
      const addChildToParent = (accounts: Account[], parentId: UUID, child: Account): Account[] => {
        return accounts.map(account => {
          if (account.id === parentId) {
            return {
              ...account,
              children: [...(account.children || []), child],
            };
          }
          if (account.children && account.children.length > 0) {
            return {
              ...account,
              children: addChildToParent(account.children, parentId, child),
            };
          }
          return account;
        });
      };

      setAccounts(prev => addChildToParent(prev, selectedParentAccount.id, newAccount));
    } else {
      // Add as root account
      setAccounts(prev => [...prev, newAccount]);
    }

    setIsAddModalOpen(false);
    setSelectedParentAccount(null);
    
    return { data: { message: 'Account added successfully!' } };
  };

  const handleEditAccount = async (accountData: any) => {
    console.log('Editing account:', accountData);
    // API call here
    setIsEditModalOpen(false);
    setSelectedAccount(null);
  };

  const handleDeleteAccount = async () => {
    console.log('Deleting account:', selectedAccount);
    // API call here
    setIsDeleteModalOpen(false);
    setSelectedAccount(null);
  };

  const handleAddChildAccount = (parentAccount: Account) => {
    setSelectedParentAccount(parentAccount);
    setIsAddModalOpen(true);
  };

  const handleEdit = (account: Account) => {
    setSelectedAccount(account);
    setIsEditModalOpen(true);
  };

  const handleDelete = (account: Account) => {
    setSelectedAccount(account);
    setIsDeleteModalOpen(true);
  };

  return (
    <motion.section
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="bg-gray-50 space-y-6 min-h-screen"
    >
      <AccountsHeader />

      <AccountsSearchFilter
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        onAddClick={() => setIsAddModalOpen(true)}
      />

      <AccountsTree
        accounts={accounts}
        searchTerm={searchTerm}
        onAddChild={handleAddChildAccount}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />

      <AddAccountModal
        isOpen={isAddModalOpen}
        onClose={() => {
          setIsAddModalOpen(false);
          setSelectedParentAccount(null);
        }}
        onAddAccount={handleAddAccount}
        accountCategories={accountCategories}
        currencies={currencies}
        companies={companies}
        parentAccount={selectedParentAccount}
      />

      <EditAccountModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setSelectedAccount(null);
        }}
        onEditAccount={handleEditAccount}
        account={selectedAccount}
        accountCategories={accountCategories}
        currencies={currencies}
        companies={companies}
      />

      <DeleteAccountModal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setSelectedAccount(null);
        }}
        onDelete={handleDeleteAccount}
        accountName={selectedAccount?.name || ''}
      />
    </motion.section>
  );
};

export default AccountsSection;
