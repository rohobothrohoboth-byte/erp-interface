import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Loader2 } from 'lucide-react';
import OpportunityDetails from '@/modules/crm/components/salesManagement/components/opportunities/OpportunityDetails';
import { getOpportunityById } from '@/modules/crm/services/crm.api';
import { Button } from '@/shared/components/ui/button';
import { showToast } from '@/shared/layout/layout';
import type { OpportunityDto } from '@/modules/crm/types/crm.types';

export default function OpportunityDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [opportunity, setOpportunity] = useState<OpportunityDto | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    const load = async () => {
      try {
        setLoading(true);
        const response = await getOpportunityById(id);
        const data = response.data?.data || response.data;
        setOpportunity(data);
      } catch {
        showToast.error('Failed to load opportunity');
        navigate('/crm/sales/opportunities');
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
      <Button variant="outline" size="sm" onClick={() => navigate('/crm/sales/opportunities')}>
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to opportunities
      </Button>
      <OpportunityDetails
        isOpen
        opportunity={opportunity}
        onClose={() => navigate('/crm/sales/opportunities')}
        onEdit={() => navigate(`/crm/sales/opportunities`)}
        onCreateQuote={() => navigate('/crm/sales/quotes/add')}
      />
    </div>
  );
}
