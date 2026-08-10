import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Loader2 } from 'lucide-react';
import ViewContractModal from '@/modules/crm/components/salesManagement/components/contracts/ViewContractModal';
import { getContractById } from '@/modules/crm/services/crm.api';
import { Button } from '@/shared/components/ui/button';
import { showToast } from '@/shared/layout/layout';
import type { ContractDto } from '@/modules/crm/types/crm.types';

export default function ContractDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [contract, setContract] = useState<ContractDto | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    const load = async () => {
      try {
        setLoading(true);
        const response = await getContractById(id);
        const data = response.data?.data || response.data;
        setContract(data);
      } catch {
        showToast.error('Failed to load contract');
        navigate('/crm/sales/contracts');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id, navigate]);

  if (loading) {
    return (
      <div className="flex min-h-[320px] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
      </div>
    );
  }

  return (
    <div className="space-y-4 p-4 md:p-6">
      <Button variant="outline" size="sm" onClick={() => navigate('/crm/sales/contracts')}>
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to contracts
      </Button>
      <ViewContractModal
        isOpen
        contract={contract}
        onClose={() => navigate('/crm/sales/contracts')}
        onEdit={() => navigate(`/crm/sales/contracts/edit/${id}`)}
      />
    </div>
  );
}
