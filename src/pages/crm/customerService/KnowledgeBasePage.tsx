// src/pages/crm/customerService/KnowledgeBasePage.tsx

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
    ArrowLeft,
    Search,
    Plus,
    RefreshCw,
    Book,
    FileText,
    Video,
    Link,
    Star,
    Eye,
    ThumbsUp,
    Clock,
    Filter,
    Loader2,
} from 'lucide-react';
import { Button } from '../../../components/ui/button';
import { Card, CardContent } from '../../../components/ui/card';
import { Badge } from '../../../components/ui/badge';
import { Input } from '../../../components/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '../../../components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../../components/ui/tabs';

interface Article {
    id: string;
    title: string;
    category: string;
    description: string;
    views: number;
    likes: number;
    createdAt: string;
    status: 'Published' | 'Draft' | 'Archived';
}

const mockArticles: Article[] = [
    {
        id: '1',
        title: 'Getting Started with the Platform',
        category: 'Onboarding',
        description: 'A comprehensive guide to help you get started with our platform.',
        views: 1250,
        likes: 89,
        createdAt: '2026-07-01T10:00:00Z',
        status: 'Published',
    },
    {
        id: '2',
        title: 'How to Reset Your Password',
        category: 'Account Management',
        description: 'Step-by-step instructions on how to reset your account password.',
        views: 890,
        likes: 56,
        createdAt: '2026-07-05T14:30:00Z',
        status: 'Published',
    },
    {
        id: '3',
        title: 'Understanding the Dashboard',
        category: 'Features',
        description: 'Learn about the different sections and features of the dashboard.',
        views: 450,
        likes: 34,
        createdAt: '2026-07-08T09:15:00Z',
        status: 'Published',
    },
];

const KnowledgeBasePage: React.FC = () => {
    const navigate = useNavigate();
    const [searchTerm, setSearchTerm] = useState('');
    const [filterCategory, setFilterCategory] = useState('all');
    const [loading, setLoading] = useState(false);

    const filteredArticles = mockArticles.filter(article => {
        const search = searchTerm.toLowerCase();
        const matchesSearch = article.title.toLowerCase().includes(search) ||
            article.description.toLowerCase().includes(search);
        const matchesCategory = filterCategory === 'all' || article.category === filterCategory;
        return matchesSearch && matchesCategory;
    });

    const categories = ['All', 'Onboarding', 'Account Management', 'Features', 'Troubleshooting'];

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6 p-6"
        >
            {/* Header */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => navigate('/crm/support')}
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                        <ArrowLeft className="w-5 h-5 text-gray-600" />
                    </button>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Knowledge Base</h1>
                        <p className="text-sm text-gray-500">
                            Browse articles, guides, and documentation
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <Button
                        variant="outline"
                        size="sm"
                        className="flex items-center gap-2"
                        onClick={() => {
                            setLoading(true);
                            setTimeout(() => setLoading(false), 1000);
                        }}
                    >
                        <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
                        Refresh
                    </Button>
                    <Button
                        size="sm"
                        className="bg-indigo-600 hover:bg-indigo-700 flex items-center gap-2"
                    >
                        <Plus size={16} />
                        New Article
                    </Button>
                </div>
            </div>

            {/* Search and Filters */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 flex flex-wrap gap-4">
                <div className="flex-1 min-w-[200px] relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                    <Input
                        placeholder="Search articles..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                    />
                </div>
                <Select value={filterCategory} onValueChange={setFilterCategory}>
                    <SelectTrigger className="w-48">
                        <Filter className="h-4 w-4 mr-2" />
                        <SelectValue placeholder="Category" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Categories</SelectItem>
                        <SelectItem value="Onboarding">Onboarding</SelectItem>
                        <SelectItem value="Account Management">Account Management</SelectItem>
                        <SelectItem value="Features">Features</SelectItem>
                        <SelectItem value="Troubleshooting">Troubleshooting</SelectItem>
                    </SelectContent>
                </Select>
                <Button
                    variant="outline"
                    onClick={() => {
                        setSearchTerm('');
                        setFilterCategory('all');
                    }}
                    className="flex items-center gap-2"
                >
                    Clear Filters
                </Button>
            </div>

            {/* Categories */}
            <div className="flex flex-wrap gap-2">
                {categories.map((category) => (
                    <Badge
                        key={category}
                        variant={filterCategory === category ? 'default' : 'outline'}
                        className="cursor-pointer px-4 py-2"
                        onClick={() => setFilterCategory(category === 'All' ? 'all' : category)}
                    >
                        {category}
                    </Badge>
                ))}
            </div>

            {/* Articles Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredArticles.map((article) => (
                    <Card
                        key={article.id}
                        className="hover:shadow-lg transition-shadow cursor-pointer"
                    >
                        <CardContent className="p-6 space-y-4">
                            <div className="flex items-start justify-between">
                                <Badge className="bg-blue-100 text-blue-700 border-blue-200">
                                    {article.category}
                                </Badge>
                                <Badge
                                    className={
                                        article.status === 'Published'
                                            ? 'bg-green-100 text-green-700 border-green-200'
                                            : article.status === 'Draft'
                                                ? 'bg-yellow-100 text-yellow-700 border-yellow-200'
                                                : 'bg-gray-100 text-gray-700 border-gray-200'
                                    }
                                >
                                    {article.status}
                                </Badge>
                            </div>
                            <h3 className="font-semibold text-gray-900 text-lg">{article.title}</h3>
                            <p className="text-sm text-gray-500 line-clamp-2">{article.description}</p>
                            <div className="flex items-center justify-between text-sm text-gray-500 pt-2 border-t">
                                <div className="flex items-center gap-4">
                                    <span className="flex items-center gap-1">
                                        <Eye className="h-4 w-4" />
                                        {article.views}
                                    </span>
                                    <span className="flex items-center gap-1">
                                        <ThumbsUp className="h-4 w-4" />
                                        {article.likes}
                                    </span>
                                </div>
                                <span className="flex items-center gap-1">
                                    <Clock className="h-4 w-4" />
                                    {new Date(article.createdAt).toLocaleDateString()}
                                </span>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {filteredArticles.length === 0 && (
                <div className="text-center py-12">
                    <Book className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-700">No articles found</h3>
                    <p className="text-gray-500">Try adjusting your search or filters.</p>
                </div>
            )}
        </motion.div>
    );
};

export default KnowledgeBasePage;