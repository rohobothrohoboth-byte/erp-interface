import React from 'react';
import { Combobox, type ComboboxOption } from '@/shared/components/ui/combobox';

interface AccountSearchFilterProps {
  accountOptions: ComboboxOption[];
  selectedAccountId: string;
  onAccountSelect: (accountId: string) => void;
}

const AccountSearchFilter: React.FC<AccountSearchFilterProps> = ({
  accountOptions,
  selectedAccountId,
  onAccountSelect,
}) => {
  return (
    <div className="bg-white p-4 rounded-lg shadow-sm border">
      <div className="space-y-4">
        <div className="lg:w-1/2 w-full">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Select Account
          </label>
          <Combobox
            options={accountOptions}
            value={selectedAccountId}
            onValueChange={onAccountSelect}
            placeholder="Select an account to view transactions"
            searchPlaceholder="Search accounts..."
            emptyMessage="No accounts found"
          />
        </div>
      </div>
    </div>
  );
};

export default AccountSearchFilter;
