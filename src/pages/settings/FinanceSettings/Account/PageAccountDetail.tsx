import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Button } from '../../../../components/ui/button';
import AccountDetailSection from '../../../../components/settings/FinanceSettings/chartofAccount/accountDetail/AccountDetailSection';

const PageAccountDetail = () => {
  const { accountId } = useParams<{ accountId: string }>();
  const navigate = useNavigate();

  const handleBack = () => {
    navigate(-1);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button
          onClick={handleBack}
          variant="outline"
          className="flex items-center gap-2"
        >
          <ArrowLeft size={18} />
          Back 
        </Button>
      </div>

      <AccountDetailSection accountId={accountId!} />
    </div>
  );
};

export default PageAccountDetail;
