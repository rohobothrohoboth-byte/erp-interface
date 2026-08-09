import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
    ChevronLeft,
    ChevronRight,
    Calendar as CalendarIcon,
    Plus,
    Search,
    Filter,
    Clock,
    CheckCircle,
    AlertCircle,
    XCircle,
    Eye,
    Edit,
    Trash2,
    Loader2,
    RefreshCw,
    Target,
    Flag,
    Award,
    TrendingUp,
    ChevronDown,
    ChevronUp,
    MoreVertical,
    Download,
    FileText,
    Users,
    Building2,
    DollarSign,
    Calendar,
    List,
    Grid
} from 'lucide-react';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Card, CardContent } from '../../../components/ui/card';
import { Badge } from '../../../components/ui/badge';
import { showToast } from '../../../layout/layout';
import { getProjects } from '../../../services/plandev/project.api';
import type{ Project } from '../../../services/plandev/project.api';
// ============================================================
// TYPES
// ============================================================

interface CalendarEvent {
    id: string;
    title: string;
    startDate: string;
    endDate: string;
    type: 'milestone' | 'task' | 'project' | 'meeting';
    status: string;
    priority: string;
    projectId?: string;
    projectName?: string;
    color: string;
}

// ============================================================
// STATUS CONFIGURATIONS
// ============================================================

const statusColors: Record<string, string> = {
    Pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    Active: 'bg-green-100 text-green-800 border-green-200',
    Completed: 'bg-purple-100 text-purple-800 border-purple-200',
    Achieved: 'bg-green-100 text-green-800 border-green-200',
    Missed: 'bg-red-100 text-red-800 border-red-200',
    OnHold: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    Planning: 'bg-blue-100 text-blue-800 border-blue-200',
};

const eventColors: Record<string, string> = {
    milestone: 'bg-purple-500',
    task: 'bg-blue-500',
    project: 'bg-emerald-500',
    meeting: 'bg-orange-500',
};

// ============================================================
// MAIN COMPONENT
// ============================================================

const PlanningCalendarPage = () => {
    const navigate = useNavigate();

    // State
    const [projects, setProjects] = useState<Project[]>([]);
    const [events, setEvents] = useState<CalendarEvent[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [currentDate, setCurrentDate] = useState(new Date());
    const [viewMode, setViewMode] = useState<'month' | 'week'>('month');
    const [searchTerm, setSearchTerm] = useState('');
    const [filterType, setFilterType] = useState<string>('all');
    const [selectedDate, setSelectedDate] = useState<Date | null>(null);

    // Fetch projects and events
    const fetchData = useCallback(async () => {
        try {
            setLoading(true);
            const data = await getProjects({ status: 'all' });
            setProjects(data);

            // Generate events from projects and their milestones
            const generatedEvents: CalendarEvent[] = [];

            data.forEach(project => {
                // Project events
                generatedEvents.push({
                    id: `project-${project.id}`,
                    title: project.name,
                    startDate: project.startDate,
                    endDate: project.endDate,
                    type: 'project',
                    status: project.status,
                    priority: project.priority,
                    projectId: project.id,
                    projectName: project.name,
                    color: eventColors.project
                });

                // Milestone events
                if (project.milestones) {
                    project.milestones.forEach(milestone => {
                        generatedEvents.push({
                            id: `milestone-${milestone.id}`,
                            title: milestone.name,
                            startDate: milestone.targetDate,
                            endDate: milestone.targetDate,
                            type: 'milestone',
                            status: milestone.status,
                            priority: 'High',
                            projectId: project.id,
                            projectName: project.name,
                            color: eventColors.milestone
                        });
                    });
                }

                // Task events (if available)
                if (project.tasks) {
                    project.tasks.forEach(task => {
                        generatedEvents.push({
                            id: `task-${task.id}`,
                            title: task.title,
                            startDate: task.startDate,
                            endDate: task.endDate || task.startDate,
                            type: 'task',
                            status: task.status,
                            priority: task.priority,
                            projectId: project.id,
                            projectName: project.name,
                            color: eventColors.task
                        });
                    });
                }
            });

            setEvents(generatedEvents);
            console.log(`✅ Generated ${generatedEvents.length} calendar events`);
        } catch (error: any) {
            console.error('Error fetching calendar data:', error);
            showToast.error(error?.response?.data?.message || 'Failed to load calendar');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    // Calendar navigation
    const goToPrevious = () => {
        const newDate = new Date(currentDate);
        if (viewMode === 'month') {
            newDate.setMonth(newDate.getMonth() - 1);
        } else {
            newDate.setDate(newDate.getDate() - 7);
        }
        setCurrentDate(newDate);
    };

    const goToNext = () => {
        const newDate = new Date(currentDate);
        if (viewMode === 'month') {
            newDate.setMonth(newDate.getMonth() + 1);
        } else {
            newDate.setDate(newDate.getDate() + 7);
        }
        setCurrentDate(newDate);
    };

    const goToToday = () => {
        setCurrentDate(new Date());
    };

    const getMonthName = (date: Date) => {
        return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    };

    const getWeekRange = (date: Date) => {
        const start = new Date(date);
        start.setDate(start.getDate() - start.getDay());
        const end = new Date(start);
        end.setDate(end.getDate() + 6);
        return `${start.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${end.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`;
    };

    const getDaysInMonth = (date: Date) => {
        const year = date.getFullYear();
        const month = date.getMonth();
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        const firstDayOfMonth = new Date(year, month, 1).getDay();
        return { daysInMonth, firstDayOfMonth };
    };

    const getEventsForDate = (date: Date) => {
        const dateStr = date.toISOString().split('T')[0];
        return events.filter(event => {
            const eventDate = new Date(event.startDate).toISOString().split('T')[0];
            return eventDate === dateStr;
        });
    };

    const getEventStatusBadge = (status: string) => {
        return (
            <Badge className={`${statusColors[status] || 'bg-gray-100'} text-xs`}>
                {status}
            </Badge>
        );
    };

    // Filter events
    const filteredEvents = events.filter(event => {
        const matchesSearch = event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (event.projectName?.toLowerCase().includes(searchTerm.toLowerCase()));
        const matchesType = filterType === 'all' || event.type === filterType;
        return matchesSearch && matchesType;
    });

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="text-center">
                    <Loader2 className="animate-spin h-12 w-12 text-emerald-600 mx-auto" />
                    <p className="mt-4 text-gray-600">Loading calendar...</p>
                </div>
            </div>
        );
    }

    const { daysInMonth, firstDayOfMonth } = getDaysInMonth(currentDate);
    const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-6"
        >
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <CalendarIcon className="w-6 h-6 text-emerald-600" />
                        <h1 className="text-2xl font-bold text-gray-900">Planning Calendar</h1>
                    </div>
                    <p className="text-sm text-gray-500">
                        {viewMode === 'month' ? getMonthName(currentDate) : getWeekRange(currentDate)}
                    </p>
                </div>
                <div className="flex gap-2">
                    <Button
                        variant="outline"
                        className="flex items-center gap-2"
                        onClick={goToToday}
                    >
                        Today
                    </Button>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={goToPrevious}
                    >
                        <ChevronLeft className="w-4 h-4" />
                    </Button>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={goToNext}
                    >
                        <ChevronRight className="w-4 h-4" />
                    </Button>
                    <Button
                        variant="outline"
                        className="flex items-center gap-2"
                        onClick={() => setViewMode(viewMode === 'month' ? 'week' : 'month')}
                    >
                        {viewMode === 'month' ? 'Week View' : 'Month View'}
                    </Button>
                    <Button
                        variant="outline"
                        className="flex items-center gap-2"
                        onClick={() => {
                            setRefreshing(true);
                            fetchData();
                        }}
                        disabled={refreshing}
                    >
                        <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
                        Refresh
                    </Button>
                </div>
            </div>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input
                        placeholder="Search events..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-9"
                    />
                </div>
                <select
                    value={filterType}
                    onChange={(e) => setFilterType(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 min-w-[130px]"
                >
                    <option value="all">All Events</option>
                    <option value="project">Projects</option>
                    <option value="milestone">Milestones</option>
                    <option value="task">Tasks</option>
                    <option value="meeting">Meetings</option>
                </select>
            </div>

            {/* Legend */}
            <div className="flex flex-wrap gap-4 p-3 bg-gray-50 rounded-lg border border-gray-200">
                <span className="text-sm text-gray-500">Event Types:</span>
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-emerald-500" />
                    <span className="text-xs text-gray-600">Project</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-purple-500" />
                    <span className="text-xs text-gray-600">Milestone</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-blue-500" />
                    <span className="text-xs text-gray-600">Task</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-orange-500" />
                    <span className="text-xs text-gray-600">Meeting</span>
                </div>
            </div>

            {/* Calendar Grid */}
            <Card>
                <CardContent className="p-4">
                    <div className="grid grid-cols-7 gap-1">
                        {/* Week headers */}
                        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                            <div key={day} className="text-center text-sm font-medium text-gray-500 py-2">
                                {day}
                            </div>
                        ))}

                        {/* Empty days before first day of month */}
                        {Array.from({ length: firstDayOfMonth }, (_, i) => (
                            <div key={`empty-${i}`} className="min-h-[100px] p-1 bg-gray-50 rounded" />
                        ))}

                        {/* Calendar days */}
                        {days.map((day) => {
                            const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
                            const dayEvents = getEventsForDate(date);
                            const isToday = new Date().toDateString() === date.toDateString();
                            const isSelected = selectedDate?.toDateString() === date.toDateString();

                            return (
                                <div
                                    key={day}
                                    className={`min-h-[100px] p-1 border rounded-lg cursor-pointer transition-colors ${
                                        isToday ? 'border-emerald-500 bg-emerald-50' :
                                            isSelected ? 'border-blue-500 bg-blue-50' :
                                                'border-gray-200 hover:bg-gray-50'
                                    }`}
                                    onClick={() => setSelectedDate(date)}
                                >
                                    <div className={`text-sm font-medium text-right px-1 ${
                                        isToday ? 'text-emerald-600' : 'text-gray-700'
                                    }`}>
                                        {day}
                                    </div>
                                    <div className="mt-1 space-y-0.5">
                                        {dayEvents.slice(0, 3).map((event, index) => (
                                            <div
                                                key={event.id}
                                                className={`text-xs px-1.5 py-0.5 rounded truncate flex items-center gap-1 ${
                                                    event.color ? `${event.color} text-white` : 'bg-gray-200 text-gray-700'
                                                }`}
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    if (event.type === 'project') {
                                                        navigate(`/plandev/initiatives/${event.projectId}`);
                                                    }
                                                }}
                                            >
                                                <span className="truncate">{event.title}</span>
                                            </div>
                                        ))}
                                        {dayEvents.length > 3 && (
                                            <div className="text-xs text-gray-400 px-1">
                                                +{dayEvents.length - 3} more
                                            </div>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </CardContent>
            </Card>

            {/* Selected Date Events */}
            {selectedDate && (
                <Card>
                    <CardContent className="p-4">
                        <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-emerald-600" />
                            Events for {selectedDate.toLocaleDateString('en-US', {
                            weekday: 'long',
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                        })}
                        </h3>
                        <div className="space-y-2">
                            {getEventsForDate(selectedDate).length === 0 ? (
                                <p className="text-sm text-gray-500">No events on this day</p>
                            ) : (
                                getEventsForDate(selectedDate).map((event) => (
                                    <div
                                        key={event.id}
                                        className="flex items-center justify-between p-2 bg-gray-50 rounded-lg border border-gray-200 hover:bg-gray-100 transition-colors cursor-pointer"
                                        onClick={() => {
                                            if (event.type === 'project') {
                                                navigate(`/plandev/initiatives/${event.projectId}`);
                                            }
                                        }}
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className={`w-3 h-3 rounded-full ${event.color}`} />
                                            <div>
                                                <p className="text-sm font-medium text-gray-900">
                                                    {event.title}
                                                </p>
                                                <div className="flex items-center gap-2 text-xs text-gray-500">
                                                    <span>{event.type}</span>
                                                    <span>•</span>
                                                    <span>{event.projectName}</span>
                                                    {getEventStatusBadge(event.status)}
                                                </div>
                                            </div>
                                        </div>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className="text-blue-600"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                if (event.type === 'project') {
                                                    navigate(`/plandev/initiatives/${event.projectId}`);
                                                }
                                            }}
                                        >
                                            <Eye className="w-4 h-4" />
                                        </Button>
                                    </div>
                                ))
                            )}
                        </div>
                    </CardContent>
                </Card>
            )}
        </motion.div>
    );
};

export default PlanningCalendarPage;