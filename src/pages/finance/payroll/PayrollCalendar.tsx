// src/pages/finance/payroll/PayrollCalendar.tsx
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
    Calendar,
    ChevronLeft,
    ChevronRight,
    DollarSign,
    Users,
    Clock,
    CheckCircle,
    XCircle,
    AlertCircle,
    Plus
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../../components/ui/card';
import { Button } from '../../../components/ui/button';
import { Badge } from '../../../components/ui/badge';
import useToast from '../../../hooks/useToast';
import { payrollApi } from '../../../services/finance/payroll/payrollApi';
import dayjs from 'dayjs';

interface PayrollEvent {
    id: string;
    date: string;
    title: string;
    type: 'payday' | 'cutoff' | 'holiday' | 'processing';
    description?: string;
}

const PayrollCalendar: React.FC = () => {
    const toast = useToast();
    const [currentDate, setCurrentDate] = useState(dayjs());
    const [events, setEvents] = useState<PayrollEvent[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadEvents();
    }, [currentDate]);

    const loadEvents = async () => {
        setLoading(true);
        try {
            const data = await payrollApi.getCalendarEvents(
                currentDate.year(),
                currentDate.month() + 1
            );
            setEvents(data || []);
        } catch (error) {
            console.error('Error loading calendar events:', error);
            toast.error('Failed to load calendar events');
        } finally {
            setLoading(false);
        }
    };

    const getEventColor = (type: string) => {
        switch (type) {
            case 'payday': return 'bg-green-100 text-green-800 border-green-200';
            case 'cutoff': return 'bg-blue-100 text-blue-800 border-blue-200';
            case 'holiday': return 'bg-red-100 text-red-800 border-red-200';
            case 'processing': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
            default: return 'bg-gray-100 text-gray-800 border-gray-200';
        }
    };

    const getEventIcon = (type: string) => {
        switch (type) {
            case 'payday': return <DollarSign className="h-4 w-4" />;
            case 'cutoff': return <Clock className="h-4 w-4" />;
            case 'holiday': return <XCircle className="h-4 w-4" />;
            case 'processing': return <AlertCircle className="h-4 w-4" />;
            default: return <Calendar className="h-4 w-4" />;
        }
    };

    const daysInMonth = currentDate.daysInMonth();
    const firstDay = currentDate.startOf('month').day();

    const nextMonth = () => setCurrentDate(currentDate.add(1, 'month'));
    const prevMonth = () => setCurrentDate(currentDate.subtract(1, 'month'));

    const getEventsForDay = (day: number) => {
        const dateStr = currentDate.date(day).format('YYYY-MM-DD');
        return events.filter(e => e.date === dateStr);
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Loading calendar...</p>
                </div>
            </div>
        );
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="space-y-6"
        >
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
                        <Calendar className="h-8 w-8 text-indigo-600" />
                        Payroll <span className="text-indigo-600">Calendar</span>
                    </h1>
                    <p className="text-gray-500 mt-1">Track payroll events and important dates</p>
                </div>
                <Button className="bg-indigo-600 hover:bg-indigo-700 text-white flex items-center gap-2">
                    <Plus className="h-4 w-4" />
                    Add Event
                </Button>
            </div>

            <Card>
                <CardHeader>
                    <div className="flex justify-between items-center">
                        <CardTitle>{currentDate.format('MMMM YYYY')}</CardTitle>
                        <div className="flex gap-2">
                            <Button variant="outline" size="sm" onClick={prevMonth}>
                                <ChevronLeft className="h-4 w-4" />
                            </Button>
                            <Button variant="outline" size="sm" onClick={nextMonth}>
                                <ChevronRight className="h-4 w-4" />
                            </Button>
                            <Button variant="outline" size="sm" onClick={() => setCurrentDate(dayjs())}>
                                Today
                            </Button>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-7 gap-1">
                        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                            <div key={day} className="text-center font-semibold text-gray-600 py-2">
                                {day}
                            </div>
                        ))}
                        {Array.from({ length: firstDay }, (_, i) => (
                            <div key={`empty-${i}`} className="h-24" />
                        ))}
                        {Array.from({ length: daysInMonth }, (_, i) => {
                            const day = i + 1;
                            const dayEvents = getEventsForDay(day);
                            const isToday = currentDate.date(day).isSame(dayjs(), 'day');

                            return (
                                <div
                                    key={day}
                                    className={`border rounded-lg p-2 min-h-24 transition-colors ${
                                        isToday ? 'border-indigo-500 bg-indigo-50' : 'border-gray-200 hover:bg-gray-50'
                                    }`}
                                >
                                    <div className="flex justify-between items-center">
                    <span className={`font-medium ${isToday ? 'text-indigo-600' : 'text-gray-700'}`}>
                      {day}
                    </span>
                                        {dayEvents.length > 0 && (
                                            <Badge variant="outline" className="text-xs">
                                                {dayEvents.length}
                                            </Badge>
                                        )}
                                    </div>
                                    <div className="space-y-1 mt-1">
                                        {dayEvents.map(event => (
                                            <div
                                                key={event.id}
                                                className={`text-xs p-1 rounded ${getEventColor(event.type)} flex items-center gap-1`}
                                            >
                                                {getEventIcon(event.type)}
                                                <span className="truncate">{event.title}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </CardContent>
            </Card>

            {/* Legend */}
            <div className="flex flex-wrap gap-4 p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded bg-green-500"></div>
                    <span className="text-sm">Payday</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded bg-blue-500"></div>
                    <span className="text-sm">Cutoff</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded bg-red-500"></div>
                    <span className="text-sm">Holiday</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded bg-yellow-500"></div>
                    <span className="text-sm">Processing</span>
                </div>
            </div>
        </motion.div>
    );
};

export default PayrollCalendar;