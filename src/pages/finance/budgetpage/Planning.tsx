// src/pages/finance/Planning.tsx
import React from 'react';
import BudgetList from '../../components/finance/budget/BudgetList';

const Planning: React.FC = () => {
  return (
      <div className="min-h-screen bg-gray-50">
        <BudgetList />
      </div>
  );
};

export default Planning;