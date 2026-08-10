import React, { useState, useEffect, useCallback } from 'react';
import {
    Plus,
    Trash2,
    Calendar,
    Clock,
    MapPin,
    User,
    AlertCircle,
    CheckCircle,
    XCircle,
    RefreshCw,
    Search,
    Filter,
    ChevronLeft,
    ChevronRight
} from 'lucide-react';

// ============ Types ============
interface Shift {
    id: string;
    employeeId: string;
    employeeName: string;
    start: string;
    end: string;
    location: string;
    department?: string;
    status?: 'scheduled' | 'in-progress' | 'completed' | 'cancelled';
    notes?: string;
}

interface Conflict {
    shiftId: string;
    message: string;
    type: 'employee' | 'location' | 'time';
}

interface Employee {
    id: string;
    name: string;
    department: string;
    email: string;
}

interface ShiftFormData {
    employeeId: string;
    employeeName: string;
    start: string;
    end: string;
    location: string;
    notes: string;
}

// ============ API Service ============
const shiftApi = {
    // Simulate API calls - replace with actual API endpoints
    getShifts: async (): Promise<Shift[]> => {
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 600));
        const saved = localStorage.getItem('shifts');
        return saved ? JSON.parse(saved) : [];
    },

    saveShifts: async (shifts: Shift[]): Promise<void> => {
        await new Promise(resolve => setTimeout(resolve, 500));
        localStorage.setItem('shifts', JSON.stringify(shifts));
        console.log('Shifts saved:', shifts.length);
    },

    getEmployees: async (): Promise<Employee[]> => {
        await new Promise(resolve => setTimeout(resolve, 400));
        // Mock employees
        return [
            { id: 'EMP-001', name: 'John Doe', department: 'Engineering', email: 'john@company.com' },
            { id: 'EMP-002', name: 'Jane Smith', department: 'Marketing', email: 'jane@company.com' },
            { id: 'EMP-003', name: 'Bob Johnson', department: 'Sales', email: 'bob@company.com' },
            { id: 'EMP-004', name: 'Alice Brown', department: 'HR', email: 'alice@company.com' },
            { id: 'EMP-005', name: 'Charlie Wilson', department: 'Finance', email: 'charlie@company.com' },
        ];
    }
};

// ============ Main Component ============
const ShiftScheduler: React.FC = () => {
    // State
    const [shifts, setShifts] = useState<Shift[]>([]);
    const [employees, setEmployees] = useState<Employee[]>([]);
    const [conflicts, setConflicts] = useState<Conflict[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    // Form state
    const [formData, setFormData] = useState<ShiftFormData>({
        employeeId: '',
        employeeName: '',
        start: '',
        end: '',
        location: '',
        notes: ''
    });

    // Filter state
    const [filterLocation, setFilterLocation] = useState<string>('');
    const [filterEmployee, setFilterEmployee] = useState<string>('');
    const [filterDate, setFilterDate] = useState<string>('');

    // Load data on mount
    useEffect(() => {
        const loadData = async () => {
            setIsLoading(true);
            try {
                const [shiftsData, employeesData] = await Promise.all([
                    shiftApi.getShifts(),
                    shiftApi.getEmployees()
                ]);
                setShifts(shiftsData);
                setEmployees(employeesData);
            } catch (error) {
                console.error('Failed to load data:', error);
                setErrorMessage('Failed to load shifts. Please refresh the page.');
            } finally {
                setIsLoading(false);
            }
        };
        loadData();
    }, []);

    // Save shifts whenever they change
    useEffect(() => {
        const saveShifts = async () => {
            if (!isLoading && shifts.length > 0) {
                try {
                    await shiftApi.saveShifts(shifts);
                } catch (error) {
                    console.error('Failed to save shifts:', error);
                }
            }
        };
        saveShifts();
    }, [shifts, isLoading]);

    // ============ Validation Functions ============
    const validateShift = (shift: ShiftFormData): Conflict[] => {
        const conflictsFound: Conflict[] = [];

        // Check required fields
        if (!shift.employeeId) {
            conflictsFound.push({
                shiftId: 'missing-employee',
                message: 'Please select an employee',
                type: 'time'
            });
        }

        if (!shift.start) {
            conflictsFound.push({
                shiftId: 'missing-start',
                message: 'Please select start time',
                type: 'time'
            });
        }

        if (!shift.end) {
            conflictsFound.push({
                shiftId: 'missing-end',
                message: 'Please select end time',
                type: 'time'
            });
        }

        if (!shift.location) {
            conflictsFound.push({
                shiftId: 'missing-location',
                message: 'Please select a location',
                type: 'time'
            });
        }

        // If missing required fields, return early
        if (conflictsFound.length > 0) {
            return conflictsFound;
        }

        const newStart = new Date(shift.start);
        const newEnd = new Date(shift.end);

        // Check time range validity
        if (newStart >= newEnd) {
            conflictsFound.push({
                shiftId: 'invalid-time',
                message: 'Shift end time must be after start time',
                type: 'time'
            });
        }

        // Check duration (max 12 hours)
        const durationMs = newEnd.getTime() - newStart.getTime();
        const durationHours = durationMs / (1000 * 60 * 60);
        if (durationHours > 12) {
            conflictsFound.push({
                shiftId: 'duration-too-long',
                message: 'Shift duration cannot exceed 12 hours',
                type: 'time'
            });
        }

        // Check for overlapping shifts
        for (const existingShift of shifts) {
            const existingStart = new Date(existingShift.start);
            const existingEnd = new Date(existingShift.end);

            // Check same employee overlap
            if (existingShift.employeeId === shift.employeeId) {
                if (newStart < existingEnd && newEnd > existingStart) {
                    conflictsFound.push({
                        shiftId: existingShift.id,
                        message: `${shift.employeeName || 'Employee'} already has a shift during this time (${formatDateTime(existingShift.start)} - ${formatDateTime(existingShift.end)})`,
                        type: 'employee'
                    });
                }
            }

            // Check location overlap
            if (existingShift.location === shift.location) {
                if (newStart < existingEnd && newEnd > existingStart) {
                    conflictsFound.push({
                        shiftId: existingShift.id,
                        message: `Location "${shift.location}" is occupied by ${existingShift.employeeName} during this time`,
                        type: 'location'
                    });
                }
            }
        }

        return conflictsFound;
    };

    // ============ Handlers ============
    const handleAddShift = async () => {
        setErrorMessage(null);
        setSuccessMessage(null);
        setConflicts([]);

        // Validate
        const validationConflicts = validateShift(formData);
        if (validationConflicts.length > 0) {
            setConflicts(validationConflicts);
            return;
        }

        setIsSaving(true);

        try {
            const newShift: Shift = {
                id: `shift-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
                employeeId: formData.employeeId,
                employeeName: formData.employeeName || 'Unknown',
                start: formData.start,
                end: formData.end,
                location: formData.location,
                notes: formData.notes,
                status: 'scheduled'
            };

            const updatedShifts = [...shifts, newShift];
            setShifts(updatedShifts);
            await shiftApi.saveShifts(updatedShifts);

            setSuccessMessage('✅ Shift added successfully!');
            resetForm();

            setTimeout(() => setSuccessMessage(null), 3000);
        } catch (error) {
            console.error('Failed to add shift:', error);
            setErrorMessage('Failed to add shift. Please try again.');
        } finally {
            setIsSaving(false);
        }
    };

    const handleDeleteShift = async (id: string) => {
        if (!window.confirm('Are you sure you want to remove this shift?')) return;

        try {
            const updatedShifts = shifts.filter(shift => shift.id !== id);
            setShifts(updatedShifts);
            await shiftApi.saveShifts(updatedShifts);
            setSuccessMessage('✅ Shift removed successfully!');
            setTimeout(() => setSuccessMessage(null), 3000);
        } catch (error) {
            console.error('Failed to delete shift:', error);
            setErrorMessage('Failed to delete shift. Please try again.');
        }
    };

    const resetForm = () => {
        setFormData({
            employeeId: '',
            employeeName: '',
            start: '',
            end: '',
            location: '',
            notes: ''
        });
        setConflicts([]);
    };

    const handleEmployeeSelect = (employeeId: string) => {
        const employee = employees.find(e => e.id === employeeId);
        setFormData({
            ...formData,
            employeeId: employeeId,
            employeeName: employee ? employee.name : ''
        });
    };

    // ============ Helper Functions ============
    const formatDateTime = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleString([], {
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const getLocationColor = (location: string): string => {
        const colors: Record<string, string> = {
            'Main Office': 'bg-blue-100 text-blue-800 border-blue-200',
            'Warehouse': 'bg-amber-100 text-amber-800 border-amber-200',
            'Retail Store': 'bg-emerald-100 text-emerald-800 border-emerald-200',
            'Remote': 'bg-purple-100 text-purple-800 border-purple-200'
        };
        return colors[location] || 'bg-gray-100 text-gray-800 border-gray-200';
    };

    const getStatusColor = (status?: string): string => {
        const colors: Record<string, string> = {
            'scheduled': 'bg-blue-100 text-blue-800',
            'in-progress': 'bg-yellow-100 text-yellow-800',
            'completed': 'bg-green-100 text-green-800',
            'cancelled': 'bg-red-100 text-red-800'
        };
        return colors[status || 'scheduled'] || 'bg-gray-100 text-gray-800';
    };

    const getStatusText = (status?: string): string => {
        const text: Record<string, string> = {
            'scheduled': 'Scheduled',
            'in-progress': 'In Progress',
            'completed': 'Completed',
            'cancelled': 'Cancelled'
        };
        return text[status || 'scheduled'] || 'Scheduled';
    };

    // ============ Filter Functions ============
    const getFilteredShifts = (): Shift[] => {
        return shifts.filter(shift => {
            const matchLocation = filterLocation ? shift.location === filterLocation : true;
            const matchEmployee = filterEmployee ? shift.employeeId === filterEmployee : true;
            const matchDate = filterDate ? shift.start.startsWith(filterDate) : true;
            return matchLocation && matchEmployee && matchDate;
        });
    };

    const filteredShifts = getFilteredShifts();

    // ============ Loading State ============
    if (isLoading) {
        return (
            <div className="flex justify-center items-center min-h-[400px]">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Loading shifts...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto p-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
                        <Calendar className="h-8 w-8 text-green-600" />
                        Shift <span className="text-green-600">Scheduler</span>
                    </h1>
                    <p className="text-gray-500 mt-1">Manage employee shifts and schedules</p>
                </div>
                <div className="flex items-center gap-3">
          <span className="bg-blue-100 text-blue-800 text-sm font-medium px-4 py-2 rounded-full">
            {shifts.length} Total Shifts
          </span>
                    <button
                        onClick={() => window.location.reload()}
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                        title="Refresh"
                    >
                        <RefreshCw className="h-5 w-5 text-gray-600" />
                    </button>
                </div>
            </div>

            {/* Success/Error Messages */}
            {successMessage && (
                <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center gap-2 text-green-700">
                    <CheckCircle className="h-5 w-5" />
                    <span>{successMessage}</span>
                </div>
            )}

            {errorMessage && (
                <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-700">
                    <AlertCircle className="h-5 w-5" />
                    <span>{errorMessage}</span>
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* ============ Form Section ============ */}
                <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
                    <div className="bg-gradient-to-r from-green-600 to-emerald-600 px-6 py-4">
                        <h2 className="text-xl font-bold text-white flex items-center gap-2">
                            <Plus className="h-5 w-5" />
                            Create New Shift
                        </h2>
                    </div>

                    <div className="p-6">
                        <div className="space-y-4">
                            {/* Employee Selection */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Employee <span className="text-red-500">*</span>
                                </label>
                                <select
                                    value={formData.employeeId}
                                    onChange={e => handleEmployeeSelect(e.target.value)}
                                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                >
                                    <option value="">Select Employee</option>
                                    {employees.map(emp => (
                                        <option key={emp.id} value={emp.id}>
                                            {emp.name} ({emp.id}) - {emp.department}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Employee Name (auto-filled) */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Employee Name
                                </label>
                                <input
                                    type="text"
                                    value={formData.employeeName}
                                    readOnly
                                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-300 rounded-lg text-gray-600"
                                    placeholder="Employee name will auto-fill"
                                />
                            </div>

                            {/* Start & End Times */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Start Time <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="datetime-local"
                                        value={formData.start}
                                        onChange={e => setFormData({ ...formData, start: e.target.value })}
                                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        End Time <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="datetime-local"
                                        value={formData.end}
                                        onChange={e => setFormData({ ...formData, end: e.target.value })}
                                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                    />
                                </div>
                            </div>

                            {/* Location */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Location <span className="text-red-500">*</span>
                                </label>
                                <select
                                    value={formData.location}
                                    onChange={e => setFormData({ ...formData, location: e.target.value })}
                                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                >
                                    <option value="">Select Location</option>
                                    <option value="Main Office">🏢 Main Office</option>
                                    <option value="Warehouse">📦 Warehouse</option>
                                    <option value="Retail Store">🏪 Retail Store</option>
                                    <option value="Remote">🏠 Remote</option>
                                </select>
                            </div>

                            {/* Notes */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Notes
                                </label>
                                <textarea
                                    value={formData.notes}
                                    onChange={e => setFormData({ ...formData, notes: e.target.value })}
                                    placeholder="Add any additional notes..."
                                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none"
                                    rows={2}
                                />
                            </div>

                            {/* Action Buttons */}
                            <div className="flex gap-3 pt-2">
                                <button
                                    onClick={handleAddShift}
                                    disabled={isSaving}
                                    className={`flex-1 bg-green-600 hover:bg-green-700 text-white font-medium py-2.5 px-4 rounded-lg transition duration-200 flex items-center justify-center gap-2 ${
                                        isSaving ? 'opacity-75 cursor-not-allowed' : ''
                                    }`}
                                >
                                    {isSaving ? (
                                        <>
                                            <span className="animate-spin">⏳</span>
                                            Adding...
                                        </>
                                    ) : (
                                        <>
                                            <Plus className="h-4 w-4" />
                                            Add Shift
                                        </>
                                    )}
                                </button>
                                <button
                                    onClick={resetForm}
                                    className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium py-2.5 px-4 rounded-lg transition duration-200"
                                >
                                    Clear
                                </button>
                            </div>
                        </div>

                        {/* Conflicts Display */}
                        {conflicts.length > 0 && (
                            <div className="mt-6 bg-red-50 border border-red-200 rounded-lg p-4">
                                <h4 className="font-bold text-red-700 flex items-center gap-2 mb-2">
                                    <AlertCircle className="h-5 w-5" />
                                    Scheduling Conflicts
                                </h4>
                                <ul className="space-y-1">
                                    {conflicts.map((conflict, index) => (
                                        <li key={index} className="text-red-600 text-sm flex items-start gap-2">
                                            <span className="mt-1">•</span>
                                            <span>{conflict.message}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}
                    </div>
                </div>

                {/* ============ Shift List Section ============ */}
                <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
                    <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-4">
                        <div className="flex justify-between items-center">
                            <h2 className="text-xl font-bold text-white flex items-center gap-2">
                                <Clock className="h-5 w-5" />
                                Scheduled Shifts
                            </h2>
                            <span className="bg-white/20 text-white text-sm font-medium px-3 py-1 rounded-full">
                {filteredShifts.length} shifts
              </span>
                        </div>
                    </div>

                    {/* Filters */}
                    <div className="p-4 bg-gray-50 border-b border-gray-200">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                            <div>
                                <label className="block text-xs font-medium text-gray-500 mb-1">Location</label>
                                <select
                                    value={filterLocation}
                                    onChange={e => setFilterLocation(e.target.value)}
                                    className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                >
                                    <option value="">All Locations</option>
                                    <option value="Main Office">Main Office</option>
                                    <option value="Warehouse">Warehouse</option>
                                    <option value="Retail Store">Retail Store</option>
                                    <option value="Remote">Remote</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-gray-500 mb-1">Employee</label>
                                <select
                                    value={filterEmployee}
                                    onChange={e => setFilterEmployee(e.target.value)}
                                    className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                >
                                    <option value="">All Employees</option>
                                    {employees.map(emp => (
                                        <option key={emp.id} value={emp.id}>{emp.name}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-gray-500 mb-1">Date</label>
                                <input
                                    type="date"
                                    value={filterDate}
                                    onChange={e => setFilterDate(e.target.value)}
                                    className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Shift Cards */}
                    <div className="p-6 max-h-[600px] overflow-y-auto">
                        {filteredShifts.length === 0 ? (
                            <div className="text-center py-12">
                                <div className="mx-auto w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-4">
                                    <Calendar className="h-8 w-8 text-gray-400" />
                                </div>
                                <h3 className="text-lg font-medium text-gray-900 mb-1">No shifts found</h3>
                                <p className="text-gray-500">
                                    {shifts.length === 0
                                        ? 'Add your first shift using the form'
                                        : 'No shifts match the current filters'}
                                </p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {filteredShifts.map(shift => {
                                    const employee = employees.find(e => e.id === shift.employeeId);

                                    return (
                                        <div
                                            key={shift.id}
                                            className="border border-gray-200 rounded-xl overflow-hidden hover:shadow-md transition-all duration-200"
                                        >
                                            <div className={`p-4 ${getLocationColor(shift.location)}`}>
                                                <div className="flex justify-between items-start">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-10 h-10 rounded-full bg-white/80 flex items-center justify-center">
                                                            <User className="h-5 w-5 text-gray-700" />
                                                        </div>
                                                        <div>
                                                            <h4 className="font-semibold text-gray-800">{shift.employeeName}</h4>
                                                            <p className="text-sm text-gray-600">
                                                                {shift.employeeId} {employee?.department ? `• ${employee.department}` : ''}
                                                            </p>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(shift.status)}`}>
                              {getStatusText(shift.status)}
                            </span>
                                                        <span className="px-2 py-1 rounded-full text-xs font-medium bg-white/80 border border-gray-200">
                              {shift.location}
                            </span>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="p-4 bg-gray-50">
                                                <div className="grid grid-cols-2 gap-4">
                                                    <div className="flex items-center gap-2">
                                                        <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center">
                                                            <Clock className="h-4 w-4 text-blue-600" />
                                                        </div>
                                                        <div>
                                                            <p className="text-xs text-gray-500">Start</p>
                                                            <p className="text-sm font-medium">{formatDateTime(shift.start)}</p>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <div className="w-8 h-8 rounded-lg bg-red-100 flex items-center justify-center">
                                                            <Clock className="h-4 w-4 text-red-600" />
                                                        </div>
                                                        <div>
                                                            <p className="text-xs text-gray-500">End</p>
                                                            <p className="text-sm font-medium">{formatDateTime(shift.end)}</p>
                                                        </div>
                                                    </div>
                                                </div>
                                                {shift.notes && (
                                                    <p className="mt-2 text-sm text-gray-500 border-t border-gray-200 pt-2">
                                                        📝 {shift.notes}
                                                    </p>
                                                )}
                                            </div>

                                            <div className="px-4 py-2 bg-white border-t border-gray-200 flex justify-end">
                                                <button
                                                    onClick={() => handleDeleteShift(shift.id)}
                                                    className="text-red-600 hover:text-red-800 flex items-center gap-1 text-sm font-medium px-3 py-1 rounded-lg hover:bg-red-50 transition-colors"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                    Remove
                                                </button>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ShiftScheduler;