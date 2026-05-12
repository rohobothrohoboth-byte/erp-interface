import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { EditAccountStepForm } from "../../../components/core/usermgmt/EditAccountStepForm";
import { usermgmtApi } from "../../../services/core/usermgmt/usermgmt.api";

export default function EditAccountPage() {
  const { empId } = useParams();
  const navigate = useNavigate();

  const [employee, setEmployee] = useState<any>();
  const [accountData, setAccountData] = useState<any>();

  useEffect(() => {
    if (!empId) return;

   usermgmtApi.getAllEmployees().then((list) => {
     const emp = list.find((e) => e.id === empId);
     setEmployee(emp);
   });
    usermgmtApi.getAccountData(empId).then(setAccountData);
  }, [empId]);

  if (!employee || !accountData) return <div>Loading...</div>;

  return (
    <EditAccountStepForm
      employee={employee}
      accountData={accountData}
      onBackToAccounts={() => navigate("/core/user-management")}
      onAccountUpdated={() => navigate("/core/user-management")}
      onAccountDeleted={() => navigate("/core/user-management")}
    />
  );
}
