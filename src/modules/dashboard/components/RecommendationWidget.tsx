// components/RecommendationWidget.tsx
import React, { useState, useEffect } from 'react';
import { Lightbulb, ThumbsUp, ThumbsDown, X, TrendingUp, Clock, Star } from 'lucide-react';

interface Recommendation {
    id: string;
    title: string;
    description: string;
    type: 'training' | 'promotion' | 'task' | 'document' | 'benefit';
    priority: 'high' | 'medium' | 'low';
    confidence: number;
    actionUrl: string;
    expiresAt?: string;
}

const RecommendationWidget: React.FC<{ userId: string }> = ({ userId }) => {
    const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
    const [loading, setLoading] = useState(true);
    const [show, setShow] = useState(true);

    useEffect(() => {
        fetchRecommendations();
    }, [userId]);

    const fetchRecommendations = async () => {
        try {
            const response = await fetch(`/api/recommendations/${userId}`);
            const data = await response.json();
            setRecommendations(data);
        } catch (error) {
            console.error('Failed to fetch recommendations:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleFeedback = async (recommendationId: string, feedback: 'like' | 'dislike') => {
        await fetch(`/api/recommendations/${recommendationId}/feedback`, {
            method: 'POST',
            body: JSON.stringify({ feedback }),
            headers: { 'Content-Type': 'application/json' }
        });

        setRecommendations(prev => prev.filter(r => r.id !== recommendationId));
    };

    const getPriorityColor = (priority: string) => {
        switch(priority) {
            case 'high': return 'bg-red-100 text-red-800 border-red-200';
            case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
            default: return 'bg-blue-100 text-blue-800 border-blue-200';
        }
    };

    const getTypeIcon = (type: string) => {
        switch(type) {
            case 'training': return <TrendingUp className="w-5 h-5" />;
            case 'promotion': return <Star className="w-5 h-5" />;
            case 'task': return <Clock className="w-5 h-5" />;
            default: return <Lightbulb className="w-5 h-5" />;
        }
    };

    if (!show || (recommendations.length === 0 && !loading)) return null;

    return (
        <div className="fixed bottom-4 right-4 w-80 z-40">
            {recommendations.map(rec => (
                <div
                    key={rec.id}
                    className="mb-3 bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden animate-slide-in"
                >
                    <div className={`p-1 ${getPriorityColor(rec.priority)}`}>
                        <div className="bg-white p-4">
                            <div className="flex justify-between items-start mb-2">
                                <div className="flex items-center space-x-2">
                                    {getTypeIcon(rec.type)}
                                    <h4 className="font-semibold text-gray-900">{rec.title}</h4>
                                </div>
                                <button
                                    onClick={() => setShow(false)}
                                    className="text-gray-400 hover:text-gray-600"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            </div>

                            <p className="text-sm text-gray-600 mb-3">{rec.description}</p>

                            <div className="flex items-center justify-between">
                                <div className="flex space-x-2">
                  <span className="text-xs text-gray-500">
                    {Math.round(rec.confidence * 100)}% match
                  </span>
                                    {rec.expiresAt && (
                                        <span className="text-xs text-orange-500">
                      Expires: {new Date(rec.expiresAt).toLocaleDateString()}
                    </span>
                                    )}
                                </div>

                                <div className="flex space-x-2">
                                    <a
                                        href={rec.actionUrl}
                                        className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                                    >
                                        View
                                    </a>
                                    <button
                                        onClick={() => handleFeedback(rec.id, 'like')}
                                        className="p-1 text-gray-400 hover:text-green-600"
                                    >
                                        <ThumbsUp className="w-4 h-4" />
                                    </button>
                                    <button
                                        onClick={() => handleFeedback(rec.id, 'dislike')}
                                        className="p-1 text-gray-400 hover:text-red-600"
                                    >
                                        <ThumbsDown className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default RecommendationWidget;