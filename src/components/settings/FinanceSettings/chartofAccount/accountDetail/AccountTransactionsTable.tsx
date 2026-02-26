import { motion } from 'framer-motion';
import type { UUID } from 'crypto';

interface Transaction {
  id: UUID;
  date: string;
  description: string;
  debit: number;
  credit: number;
  balance: number;
  reference: string;
}

interface AccountTransactionsTableProps {
  transactions: Transaction[];
}

const AccountTransactionsTable: React.FC<AccountTransactionsTableProps> = ({ transactions }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
      className="bg-white rounded-lg border border-indigo-200 shadow-sm"
    >
      <div className="px-6 py-4 border-b border-indigo-200">
        <h2 className="text-lg font-bold text-indigo-900">Recent Transactions</h2>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-indigo-200">
          <thead className="bg-white">
            <tr>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-indigo-700 uppercase tracking-wider"
              >
                Date
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-indigo-700 uppercase tracking-wider"
              >
                Reference
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-indigo-700 uppercase tracking-wider"
              >
                Description
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-right text-xs font-medium text-indigo-700 uppercase tracking-wider"
              >
                Debit
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-right text-xs font-medium text-indigo-700 uppercase tracking-wider"
              >
                Credit
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-right text-xs font-medium text-indigo-700 uppercase tracking-wider"
              >
                Balance
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-indigo-200">
            {transactions.map((transaction, index) => (
              <motion.tr
                key={transaction.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className="hover:bg-indigo-50 transition-colors"
              >
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {new Date(transaction.date).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-indigo-700">
                  {transaction.reference}
                </td>
                <td className="px-6 py-4 text-sm text-gray-900">{transaction.description}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-medium">
                  {transaction.debit > 0 && (
                    <span className="text-green-600">${transaction.debit.toLocaleString()}</span>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-medium">
                  {transaction.credit > 0 && (
                    <span className="text-red-600">${transaction.credit.toLocaleString()}</span>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-bold text-indigo-900">
                  ${transaction.balance.toLocaleString()}
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>
    </motion.div>
  );
};

export default AccountTransactionsTable;
