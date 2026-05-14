import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { EditEmployeeStepForm } from '../../../components/hr/employee/EditEmployee/EditEmployeeStepForm';
import type { UUID } from 'crypto';

export const EditEmployeePage: React.FC = () => {
  const navigate = useNavigate();
  const { employeeId } = useParams<{ employeeId: UUID }>();

  const handleBackToEmployees = () => {
    navigate('/hr/employees/record');
  };

  const handleEmployeeUpdated = (result: any) => {
    console.log('Employee updated successfully:', result);
    
    // Navigate back to employees list
    navigate('/hr/employees/record');
  };

  if (!employeeId) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-red-600 mb-2">Error</h2>
          <p className="text-gray-600">Employee ID is missing</p>
          <button
            onClick={handleBackToEmployees}
            className="mt-4 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
          >
            Back to Employees
          </button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <EditEmployeeStepForm
        employeeId={employeeId}
        onBackToEmployees={handleBackToEmployees}
        onEmployeeUpdated={handleEmployeeUpdated}
      />
    </div>
  );
};

export default EditEmployeePage;
