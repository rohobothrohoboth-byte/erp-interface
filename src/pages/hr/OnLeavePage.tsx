// pages/hr/OnLeavePage.tsx
import React from 'react';
import { useOnLeaveEmployees } from '../../hooks/hr/useOnLeaveEmployees';
import OnLeaveEmployee from '../../components/hr/OnLeaveEmployee';

const OnLeavePage: React.FC = () => {
    const { employees, loading, error, refetch } = useOnLeaveEmployees();

    return (
        <div className="container mx-auto p-6">
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-slate-800">On Leave Employees</h1>
                <p className="text-slate-500">View all employees currently on leave</p>
            </div>

            <OnLeaveEmployee
                title="All On Leave Employees"
                limit={undefined} // Show all
                showRefresh={true}
            />
        </div>
    );
};

export default OnLeavePage;