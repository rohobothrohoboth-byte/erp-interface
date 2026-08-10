// src/pages/crm/salesManagement/PrintQuotePage.tsx

import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { getQuoteById } from '@/modules/crm/services/crm.api';
import type { QuoteDto } from '@/modules/crm/types/crm.types';

const PrintQuotePage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const [quote, setQuote] = useState<QuoteDto | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchQuote = async () => {
            if (!id) return;
            try {
                const response = await getQuoteById(id);
                setQuote(response.data);
            } catch (error) {
                console.error('Error fetching quote:', error);
            } finally {
                setLoading(false);
            }
        };

        // Check if quote data is in sessionStorage
        const storedQuote = sessionStorage.getItem('printQuote');
        if (storedQuote) {
            setQuote(JSON.parse(storedQuote));
            setLoading(false);
            sessionStorage.removeItem('printQuote');
        } else {
            fetchQuote();
        }
    }, [id]);

    if (loading) return <div className="p-8 text-center">Loading...</div>;
    if (!quote) return <div className="p-8 text-center">Quote not found</div>;

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
        }).format(amount);
    };

    return (
        <div className="p-8 max-w-4xl mx-auto" style={{ fontFamily: 'Arial, sans-serif' }}>
            <div className="text-center mb-8">
                <h1 className="text-3xl font-bold">QUOTE</h1>
                <p className="text-gray-600">{quote.quoteNumber}</p>
            </div>

            <div className="mb-8">
                <h2 className="font-semibold mb-2">Customer Information</h2>
                <p><strong>Name:</strong> {quote.customerName}</p>
                {quote.customerEmail && <p><strong>Email:</strong> {quote.customerEmail}</p>}
                {quote.customerPhone && <p><strong>Phone:</strong> {quote.customerPhone}</p>}
                <p><strong>Valid Until:</strong> {new Date(quote.validUntil).toLocaleDateString()}</p>
            </div>

            <table className="w-full mb-8 border-collapse">
                <thead>
                <tr className="bg-gray-100">
                    <th className="border p-2 text-left">Product</th>
                    <th className="border p-2 text-left">Description</th>
                    <th className="border p-2 text-right">Qty</th>
                    <th className="border p-2 text-right">Unit Price</th>
                    <th className="border p-2 text-right">Total</th>
                </tr>
                </thead>
                <tbody>
                {quote.items?.map((item, index) => (
                    <tr key={item.id || index}>
                        <td className="border p-2">{item.productName}</td>
                        <td className="border p-2">{item.description || '-'}</td>
                        <td className="border p-2 text-right">{item.quantity}</td>
                        <td className="border p-2 text-right">{formatCurrency(item.unitPrice)}</td>
                        <td className="border p-2 text-right">{formatCurrency(item.total)}</td>
                    </tr>
                ))}
                </tbody>
            </table>

            <div className="text-right mb-8">
                <p><strong>Subtotal:</strong> {formatCurrency(quote.subtotal)}</p>
                <p><strong>Tax (10%):</strong> {formatCurrency(quote.tax)}</p>
                {quote.discount > 0 && <p><strong>Discount:</strong> -{formatCurrency(quote.discount)}</p>}
                <p className="text-xl font-bold"><strong>Total:</strong> {formatCurrency(quote.totalAmount)}</p>
            </div>

            {quote.notes && (
                <div className="border-t pt-4">
                    <h3 className="font-semibold">Notes:</h3>
                    <p className="whitespace-pre-wrap">{quote.notes}</p>
                </div>
            )}

            <div className="text-center text-sm text-gray-500 mt-8">
                <p>Thank you for your business!</p>
            </div>
        </div>
    );
};

export default PrintQuotePage;