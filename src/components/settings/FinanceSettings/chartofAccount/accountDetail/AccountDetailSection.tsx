import type { UUID } from 'crypto';
import AccountDetailHeader from './AccountDetailHeader';
import AccountInfoCard from './AccountInfoCard';
import AccountTransactionsTable from './AccountTransactionsTable';

interface AccountDetailSectionProps {
  accountId: string;
}

const AccountDetailSection: React.FC<AccountDetailSectionProps> = ({ accountId }) => {
  // Mock data - replace with actual API call
  const account = {
    id: accountId as UUID,
    code: '1110',
    name: 'Cash',
    accountCategoryName: 'Balance Sheet',
    isGroup: false,
    accountType: undefined,
    currencyCode: 'USD',
    currencyName: 'US Dollar',
    companyName: 'Main Company',
    isActive: true,
    balance: 50000,
    createdAt: '2024-01-01',
    parentAccountCode: '1100',
    parentAccountName: 'Current Assets',
  };

  const transactions = [
    {
      id: '1' as UUID,
      date: '2024-02-15',
      description: 'Cash deposit',
      debit: 5000,
      credit: 0,
      balance: 50000,
      reference: 'JV-001',
    },
    {
      id: '2' as UUID,
      date: '2024-02-14',
      description: 'Payment to supplier',
      debit: 0,
      credit: 2000,
      balance: 45000,
      reference: 'JV-002',
    },
    {
      id: '3' as UUID,
      date: '2024-02-13',
      description: 'Cash sales',
      debit: 3000,
      credit: 0,
      balance: 47000,
      reference: 'JV-003',
    },
  ];

  return (
    <div className="space-y-6">
      <AccountDetailHeader account={account} />
      
      <div className="bg-white rounded-lg border border-indigo-200 shadow-sm p-6">
        <AccountInfoCard account={account} />
      </div>

      <AccountTransactionsTable transactions={transactions} />
    </div>
  );
};

export default AccountDetailSection;
