// src/components/crm/salesManagement/SalesManagement.tsx

import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import OpportunitiesSection from './opportunitiesSection/OpportunitiesSection';
import QuotationsPage from '../../../pages/crm/salesManagement/QuotationsPage';
import OrdersPage from '../../../pages/crm/salesManagement/OrdersPage';
import ContractsPage from '../../../pages/crm/salesManagement/ContractsPage';
import SalesForecastPage from '../../../pages/crm/salesManagement/SalesForecastPage';

const SalesManagement: React.FC = () => {
  return (
      <Routes>
        <Route path="/" element={<Navigate to="/crm/sales/opportunities" replace />} />
        <Route path="opportunities/*" element={<OpportunitiesSection />} />
        <Route path="quotations" element={<QuotationsPage />} />
        <Route path="orders" element={<OrdersPage />} />
        <Route path="contracts" element={<ContractsPage />} />
        <Route path="forecast" element={<SalesForecastPage />} />
      </Routes>
  );
};

export default SalesManagement;