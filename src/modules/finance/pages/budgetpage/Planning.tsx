// src/pages/finance/Planning.tsx
import React from 'react';
import BudgetList from '@/modules/finance/pages/budgetpage/BudgetList';

const Planning: React.FC = () => {
  return (
      <div className="min-h-screen bg-gray-50">
        <BudgetList />
      </div>
  );
};

export default Planning;