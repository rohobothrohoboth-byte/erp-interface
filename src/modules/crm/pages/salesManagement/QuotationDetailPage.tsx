import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Loader2 } from 'lucide-react';
import ViewQuotationModal from '@/modules/crm/components/salesManagement/components/quotations/ViewQuotationModal';
import { getQuoteById } from '@/modules/crm/services/crm.api';
import { Button } from '@/shared/components/ui/button';
import { showToast } from '@/shared/layout/layout';
import type { QuoteDto } from '@/modules/crm/types/crm.types';

export default function QuotationDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [quote, setQuote] = useState<QuoteDto | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    const load = async () => {
      try {
        setLoading(true);
        const data = await getQuoteById(id);
        setQuote(data);
      } catch {
        showToast.error('Failed to load quote');
        navigate('/crm/sales/quotes');
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
      <Button variant="outline" size="sm" onClick={() => navigate('/crm/sales/quotes')}>
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to quotes
      </Button>
      <ViewQuotationModal
        isOpen
        quote={quote}
        onClose={() => navigate('/crm/sales/quotes')}
        onEdit={() => navigate(`/crm/sales/quotes/edit/${id}`)}
        canEdit
        canSend
      />
    </div>
  );
}
