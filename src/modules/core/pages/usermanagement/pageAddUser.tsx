import { useNavigate } from 'react-router-dom';
import { AddUserStepForm } from '@/modules/core/components/usermgmt/AddEmployee/AddUserStepForm';

function PageAddUser() {
  const navigate = useNavigate();

  return (
    <AddUserStepForm
      onBackToUsers={() => navigate(-1)}
      onUserAdded={() => navigate('/core/users')}
    />
  );
}

export default PageAddUser;
