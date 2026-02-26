import { Building, Folder, Coins, Calendar, DollarSign } from 'lucide-react';

interface AccountInfoCardProps {
  account: {
    accountCategoryName: string;
    accountType?: string;
    currencyCode: string;
    currencyName: string;
    companyName: string;
    parentAccountCode?: string;
    parentAccountName?: string;
    createdAt: string;
    balance: number;
  };
}

const AccountInfoCard: React.FC<AccountInfoCardProps> = ({ account }) => {
  return (
    <div className="space-y-6">
      {/* Account Details Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-gray-600">
            <Building size={18} />
            <span className="text-sm font-medium">Category</span>
          </div>
          <p className="text-gray-900 font-medium">{account.accountCategoryName}</p>
        </div>

        {account.accountType && (
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-gray-600">
              <Folder size={18} />
              <span className="text-sm font-medium">Account Type</span>
            </div>
            <p className="text-gray-900 font-medium">{account.accountType}</p>
          </div>
        )}

        <div className="space-y-2">
          <div className="flex items-center gap-2 text-gray-600">
            <Coins size={18} />
            <span className="text-sm font-medium">Currency</span>
          </div>
          <p className="text-gray-900 font-medium">
            {account.currencyCode} - {account.currencyName}
          </p>
        </div>

        <div className="space-y-2">
          <div className="flex items-center gap-2 text-gray-600">
            <Building size={18} />
            <span className="text-sm font-medium">Company</span>
          </div>
          <p className="text-gray-900 font-medium">{account.companyName}</p>
        </div>

        {account.parentAccountCode && (
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-gray-600">
              <Folder size={18} />
              <span className="text-sm font-medium">Parent Account</span>
            </div>
            <p className="text-gray-900 font-medium">
              {account.parentAccountCode} - {account.parentAccountName}
            </p>
          </div>
        )}

        <div className="space-y-2">
          <div className="flex items-center gap-2 text-gray-600">
            <Calendar size={18} />
            <span className="text-sm font-medium">Created Date</span>
          </div>
          <p className="text-gray-900 font-medium">
            {new Date(account.createdAt).toLocaleDateString()}
          </p>
        </div>
      </div>

      {/* Balance Card */}
      <div className="p-4 bg-indigo-50 rounded-lg border border-indigo-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-indigo-700">
            <DollarSign size={20} />
            <span className="text-sm font-medium">Current Balance</span>
          </div>
          <p className="text-2xl font-bold text-indigo-900">${account.balance.toLocaleString()}</p>
        </div>
      </div>
    </div>
  );
};

export default AccountInfoCard;
