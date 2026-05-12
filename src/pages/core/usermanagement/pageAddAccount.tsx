import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { AddAccountStepForm } from "../../../components/core/usermgmt/AddAccountStepForm";
import { usermgmtApi } from "../../../services/core/usermgmt/usermgmt.api";

export default function AddAccountPage() {
  const { empId } = useParams();
  const navigate = useNavigate();

  const [employee, setEmployee] = useState<any>();

  useEffect(() => {
    if (!empId) return;

 usermgmtApi.getAllEmployees().then((list) => {
   const emp = list.find((e) => e.id === empId);
   setEmployee(emp);
 });
  }, [empId]);

  if (!employee) return <div>Loading...</div>;

  return (
    <AddAccountStepForm
      employee={employee}
      onBackToAccounts={() => navigate("/core/users")}
      onAccountAdded={() => navigate("/core/users")}
    />
  );
}
