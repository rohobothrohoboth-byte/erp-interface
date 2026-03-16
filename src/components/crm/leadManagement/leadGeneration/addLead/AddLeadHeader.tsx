import { ArrowLeft } from 'lucide-react';
import { Button } from '../../../../ui/button';
import { useNavigate } from 'react-router-dom';

export default function AddLeadHeader() {
  const navigate = useNavigate();
  return (
    <div className="flex items-center gap-3">
      <Button
        type="button"
        variant="outline"
        onClick={() => navigate('/crm/leads/generation')}
        className="cursor-pointer hover:bg-gray-50 transition-all duration-200 shadow-sm hover:shadow-md"
      >
        <ArrowLeft className="w-4 h-4" />
        <span className="font-medium text-gray-700">Back</span>
      </Button>
      <div className="flex-1">
        <h1 className="text-2xl font-bold bg-gradient-to-r from-orange-500 via-orange-700 to-orange-800 bg-clip-text text-transparent mb-2 tracking-tight">
          Add New Lead
        </h1>
      </div>
      <div className="w-40" />
    </div>
  );
}
