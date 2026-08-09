// src/pages/hr/recruitment/VacanciesPage.tsx
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
    Briefcase, Search, Loader2, MapPin, Calendar,
    Users, Building2, Clock, Eye, ChevronRight,
    Filter, Award, GraduationCap, Star
} from 'lucide-react';
import { Button } from '../../../components/ui/button';
import { Card, CardContent } from '../../../components/ui/card';
import { Input } from '../../../components/ui/input';
import { Badge } from '../../../components/ui/badge';
import { useVacancies } from '../../../services/hr/recruitment/vacancy/vacancy.queries';
import { format, formatDistanceToNow, differenceInDays } from 'date-fns';

const VacanciesPage: React.FC = () => {
    const navigate = useNavigate();
    const [searchTerm, setSearchTerm] = useState('');

    const { data: vacancies, isLoading, refetch } = useVacancies();

    const filteredVacancies = vacancies?.filter(vacancy => {
        const matchesSearch = vacancy.position?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            vacancy.postNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            vacancy.department?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            vacancy.location?.toLowerCase().includes(searchTerm.toLowerCase());
        return matchesSearch;
    });

    const getDaysRemaining = (deadline: string) => {
        try {
            const days = differenceInDays(new Date(deadline), new Date());
            if (days < 0) return 'Expired';
            if (days === 0) return 'Today';
            return `${days} days left`;
        } catch {
            return 'N/A';
        }
    };

    const getStatusBadge = (deadline: string) => {
        try {
            const days = differenceInDays(new Date(deadline), new Date());
            if (days < 0) return <Badge className="bg-red-100 text-red-700">Expired</Badge>;
            if (days <= 7) return <Badge className="bg-yellow-100 text-yellow-700">Closing Soon</Badge>;
            return <Badge className="bg-green-100 text-green-700">Open</Badge>;
        } catch {
            return <Badge className="bg-gray-100 text-gray-700">Unknown</Badge>;
        }
    };

    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-64">
                <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
            </div>
        );
    }

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6 p-6 max-w-7xl mx-auto">
            <div className="text-center py-8">
                <h1 className="text-3xl font-bold text-gray-900">Current Vacancies</h1>
                <p className="text-gray-500 mt-2">Find your next career opportunity</p>
            </div>

            <Card>
                <CardContent className="p-4">
                    <div className="flex gap-4">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <Input
                                placeholder="Search positions, departments, locations..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-9"
                            />
                        </div>
                        <Button onClick={() => refetch()} variant="outline">
                            <RefreshCw className="w-4 h-4 mr-2" />
                            Refresh
                        </Button>
                    </div>
                </CardContent>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredVacancies && filteredVacancies.length > 0 ? (
                    filteredVacancies.map((vacancy, index) => (
                        <motion.div
                            key={vacancy.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.05 }}
                        >
                            <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full"
                                  onClick={() => navigate(`/vacancies/${vacancy.id}`)}>
                                <CardContent className="p-6">
                                    <div className="flex items-start justify-between mb-3">
                                        <div className="p-2 bg-emerald-50 rounded-lg">
                                            <Briefcase className="w-5 h-5 text-emerald-600" />
                                        </div>
                                        {getStatusBadge(vacancy.deadline)}
                                    </div>

                                    <h3 className="text-lg font-semibold text-gray-900 mb-1">{vacancy.position}</h3>
                                    <p className="text-sm text-gray-500 mb-3">{vacancy.department}</p>

                                    <div className="space-y-2 text-sm text-gray-500">
                                        <div className="flex items-center gap-2">
                                            <MapPin className="w-4 h-4" />
                                            <span>{vacancy.location}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Users className="w-4 h-4" />
                                            <span>{vacancy.numOpen} position{vacancy.numOpen > 1 ? 's' : ''} available</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Clock className="w-4 h-4" />
                                            <span className={differenceInDays(new Date(vacancy.deadline), new Date()) < 0 ? 'text-red-500' : ''}>
                        {getDaysRemaining(vacancy.deadline)}
                      </span>
                                        </div>
                                    </div>

                                    <div className="mt-4 pt-4 border-t flex items-center justify-between">
                    <span className="text-xs text-gray-400">
                      Posted {formatDistanceToNow(new Date(vacancy.datePosted), { addSuffix: true })}
                    </span>
                                        <Button variant="ghost" size="sm" className="text-emerald-600">
                                            Apply Now <ChevronRight className="w-4 h-4 ml-1" />
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        </motion.div>
                    ))
                ) : (
                    <div className="col-span-full">
                        <Card>
                            <CardContent className="p-12 text-center">
                                <Briefcase className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                                <p className="text-gray-500">No vacancies found</p>
                                <p className="text-sm text-gray-400">Check back later for new opportunities</p>
                            </CardContent>
                        </Card>
                    </div>
                )}
            </div>
        </motion.div>
    );
};

export default VacanciesPage;