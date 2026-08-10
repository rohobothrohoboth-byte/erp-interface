// src/pages/crm/salesManagement/SalesManagement.tsx

import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import OpportunitiesPage from '@/modules/crm/pages/salesManagement/OpportunitiesPage';
import OpportunityDetailPage from '@/modules/crm/components/salesManagement/components/opportunities/OpportunityDetails';
import QuotationsPage from '@/modules/crm/pages/salesManagement/QuotationsPage';
import OrdersPage from '@/modules/crm/pages/salesManagement/OrdersPage';
import OrderDetailPage from '@/modules/crm/pages/salesManagement/OrderDetailPage';
import ContractsPage from '@/modules/crm/pages/salesManagement/ContractsPage';
import SalesForecastPage from '@/modules/crm/pages/salesManagement/SalesForecastPage';

const SalesManagement: React.FC = () => {
    return (
        <Routes>
            {/* Redirect /crm/sales to /crm/sales/opportunities */}
            <Route path="/" element={<Navigate to="/crm/sales/opportunities" replace />} />

            {/* Static Routes */}
            <Route path="opportunities" element={<OpportunitiesPage />} />
            <Route path="opportunities/add" element={<OpportunitiesPage />} />
            <Route path="quotes" element={<QuotationsPage />} />
            <Route path="quotes/add" element={<QuotationsPage />} />
            <Route path="orders" element={<OrdersPage />} />
            <Route path="orders/add" element={<OrdersPage />} />
            <Route path="contracts" element={<ContractsPage />} />
            <Route path="forecast" element={<SalesForecastPage />} />

            {/* Edit Routes - Static paths with :id */}
            <Route path="opportunities/edit/:id" element={<OpportunityDetailPage />} />
            <Route path="quotes/edit/:id" element={<QuotationsPage />} />
            <Route path="orders/edit/:id" element={<OrderDetailPage />} />
            <Route path="contracts/edit/:id" element={<ContractsPage />} />

            {/* Dynamic Routes - MUST be last */}
            <Route path="opportunities/:id" element={<OpportunityDetailPage />} />
            <Route path="quotes/:id" element={<QuotationsPage />} />
            <Route path="orders/:id" element={<OrderDetailPage />} />
            <Route path="contracts/:id" element={<ContractsPage />} />
        </Routes>
    );
};

export default SalesManagement;