import { useNavigate, useLocation } from 'react-router-dom';
import { AddAccountWizard } from '../../../components/core/usermgmt/v2/AddAccountWizard';
import type { EmpSearchRes } from '../../../types/core/EmpSearchRes';

export default function PageAddUserV2() {
  const navigate = useNavigate();
  const location = useLocation();

  // Employee is passed via router state from the user management list
  const employee = (location.state as any)?.employee as EmpSearchRes | undefined;

  if (!employee) {
    navigate('/core/users', { replace: true });
    return null;
  }

  return (
    <AddAccountWizard
      employee={employee}
      onDone={() => navigate('/core/users')}
      onCancel={() => navigate(-1)}
    />
  );
}
