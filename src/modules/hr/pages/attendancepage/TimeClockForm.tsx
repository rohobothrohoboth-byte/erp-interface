// src/pages/hr/attendance/TimeClockForm.tsx
import React, { useState, useEffect } from 'react';
import {
  Clock,
  X,
  Save,
  Calendar,
  Check,
  AlertCircle,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import type { ShiftSchedule, DaySchedule } from '@/modules/hr/types/attendance';

export interface TimeClockFormProps {
  schedule: ShiftSchedule;
  onScheduleChange: (newSchedule: ShiftSchedule) => void;
  onClose: () => void;
  employeeId?: string;
  employeeName?: string;
}

const TimeClockForm: React.FC<TimeClockFormProps> = ({
                                                       schedule,
                                                       onScheduleChange,
                                                       onClose,
                                                       employeeId,
                                                       employeeName
                                                     }) => {
  const [localSchedule, setLocalSchedule] = useState<ShiftSchedule>(schedule);
  const [selectedDay, setSelectedDay] = useState<string>("Monday");
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [isSaving, setIsSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const dayNames = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  // Validate a single day's schedule
  const validateDay = (day: string, daySchedule: DaySchedule): string | null => {
    const { clockInStart, clockInEnd, clockOutStart, clockOutEnd } = daySchedule;

    // If all fields are empty, it's a day off - valid
    if (!clockInStart && !clockInEnd && !clockOutStart && !clockOutEnd) {
      return null;
    }

    // Check if any field is partially filled
    if (clockInStart && !clockInEnd) {
      return 'Clock In End time is required';
    }
    if (clockInEnd && !clockInStart) {
      return 'Clock In Start time is required';
    }
    if (clockOutStart && !clockOutEnd) {
      return 'Clock Out End time is required';
    }
    if (clockOutEnd && !clockOutStart) {
      return 'Clock Out Start time is required';
    }

    // Validate time ranges
    if (clockInStart && clockInEnd && clockInStart >= clockInEnd) {
      return 'Clock In Start must be before Clock In End';
    }
    if (clockOutStart && clockOutEnd && clockOutStart >= clockOutEnd) {
      return 'Clock Out Start must be before Clock Out End';
    }

    return null;
  };

  const handleTimeChange = (day: string, field: keyof DaySchedule, value: string) => {
    setLocalSchedule(prev => {
      const updated = {
        ...prev,
        [day]: {
          ...prev[day],
          [field]: value
        }
      };

      // Clear error for this day
      const error = validateDay(day, updated[day]);
      if (error) {
        setErrors(prev => ({ ...prev, [day]: error }));
      } else {
        setErrors(prev => {
          const newErrors = { ...prev };
          delete newErrors[day];
          return newErrors;
        });
      }

      return updated;
    });
  };

  const handleSave = async () => {
    // Validate all days
    let hasErrors = false;
    const newErrors: { [key: string]: string } = {};

    dayNames.forEach(day => {
      const error = validateDay(day, localSchedule[day]);
      if (error) {
        newErrors[day] = error;
        hasErrors = true;
      }
    });

    if (hasErrors) {
      setErrors(newErrors);
      return;
    }

    setIsSaving(true);
    setSuccessMessage(null);

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 800));

      onScheduleChange(localSchedule);
      setSuccessMessage('✅ Schedule saved successfully!');

      setTimeout(() => {
        setSuccessMessage(null);
        onClose();
      }, 1500);
    } catch (error) {
      setErrors({ submit: 'Failed to save schedule. Please try again.' });
    } finally {
      setIsSaving(false);
    }
  };

  const handleCopyToAllDays = () => {
    const currentDaySchedule = localSchedule[selectedDay];
    const confirmCopy = window.confirm(
        `Copy schedule from ${selectedDay} to all other days?`
    );

    if (!confirmCopy) return;

    const updatedSchedule = { ...localSchedule };
    dayNames.forEach(day => {
      if (day !== selectedDay) {
        updatedSchedule[day] = { ...currentDaySchedule };
      }
    });

    setLocalSchedule(updatedSchedule);
    setSuccessMessage(`✅ Copied schedule to all days`);
    setTimeout(() => setSuccessMessage(null), 3000);
  };

  const handleClearDay = (day: string) => {
    setLocalSchedule(prev => ({
      ...prev,
      [day]: { clockInStart: '', clockInEnd: '', clockOutStart: '', clockOutEnd: '' }
    }));
  };

  const formatTimeDisplay = (time: string): string => {
    if (!time) return '--:--';
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const hour12 = hour % 12 || 12;
    return `${hour12}:${minutes} ${ampm}`;
  };

  return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl max-h-[90vh] overflow-y-auto">
          {/* Header */}
          <div className="sticky top-0 bg-gradient-to-r from-green-600 to-emerald-600 px-6 py-4 rounded-t-2xl">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-3">
                <Clock className="h-6 w-6 text-white" />
                <h2 className="text-2xl font-bold text-white">Shift Schedule Configuration</h2>
              </div>
              <button
                  onClick={onClose}
                  className="p-2 hover:bg-white/20 rounded-lg transition-colors"
              >
                <X className="h-6 w-6 text-white" />
              </button>
            </div>
            {employeeName && (
                <p className="text-white/80 text-sm mt-1">
                  Employee: {employeeName} {employeeId && `(${employeeId})`}
                </p>
            )}
          </div>

          <div className="p-6">
            {/* Success Message */}
            {successMessage && (
                <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg flex items-center gap-2 text-green-700">
                  <Check className="h-5 w-5" />
                  <span>{successMessage}</span>
                </div>
            )}

            {/* Error Message */}
            {errors.submit && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-700">
                  <AlertCircle className="h-5 w-5" />
                  <span>{errors.submit}</span>
                </div>
            )}

            {/* Day Selector */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Day to Configure
              </label>
              <div className="flex flex-wrap gap-2">
                {dayNames.map((day) => {
                  const daySchedule = localSchedule[day];
                  const isActive = daySchedule && daySchedule.clockInStart && daySchedule.clockInEnd;
                  const hasError = errors[day];

                  return (
                      <button
                          key={day}
                          type="button"
                          onClick={() => setSelectedDay(day)}
                          className={`px-4 py-2 rounded-lg text-sm font-medium transition-all cursor-pointer flex items-center gap-2 ${
                              selectedDay === day
                                  ? 'bg-green-600 text-white shadow-md'
                                  : hasError
                                      ? 'bg-red-50 text-red-700 border border-red-200'
                                      : isActive
                                          ? 'bg-green-50 text-green-700 border border-green-200'
                                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                          }`}
                      >
                        <span>{day.slice(0, 3)}</span>
                        {isActive && !hasError && selectedDay !== day && (
                            <Check className="h-3 w-3" />
                        )}
                        {hasError && selectedDay !== day && (
                            <AlertCircle className="h-3 w-3 text-red-500" />
                        )}
                      </button>
                  );
                })}
              </div>
              {errors[selectedDay] && (
                  <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
                    <AlertCircle className="h-4 w-4" />
                    {errors[selectedDay]}
                  </p>
              )}
            </div>

            {/* Schedule Configuration */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              {/* Clock In */}
              <div className="p-5 bg-blue-50 rounded-xl border border-blue-200">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center">
                    <Clock className="h-4 w-4 text-white" />
                  </div>
                  <h4 className="font-semibold text-blue-800">Clock In Window</h4>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Start Time
                    </label>
                    <input
                        type="time"
                        value={localSchedule[selectedDay].clockInStart}
                        onChange={(e) => handleTimeChange(selectedDay, 'clockInStart', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      End Time
                    </label>
                    <input
                        type="time"
                        value={localSchedule[selectedDay].clockInEnd}
                        onChange={(e) => handleTimeChange(selectedDay, 'clockInEnd', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>
              </div>

              {/* Clock Out */}
              <div className="p-5 bg-red-50 rounded-xl border border-red-200">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-8 h-8 rounded-full bg-red-600 flex items-center justify-center">
                    <Clock className="h-4 w-4 text-white" />
                  </div>
                  <h4 className="font-semibold text-red-800">Clock Out Window</h4>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Start Time
                    </label>
                    <input
                        type="time"
                        value={localSchedule[selectedDay].clockOutStart}
                        onChange={(e) => handleTimeChange(selectedDay, 'clockOutStart', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      End Time
                    </label>
                    <input
                        type="time"
                        value={localSchedule[selectedDay].clockOutEnd}
                        onChange={(e) => handleTimeChange(selectedDay, 'clockOutEnd', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-3 items-center justify-between border-t border-gray-200 pt-4">
              <div className="flex gap-3">
                <button
                    type="button"
                    onClick={handleCopyToAllDays}
                    className="px-4 py-2 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition-colors text-sm font-medium flex items-center gap-2"
                >
                  <Calendar className="h-4 w-4" />
                  Copy to All Days
                </button>
                <button
                    type="button"
                    onClick={() => handleClearDay(selectedDay)}
                    className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium"
                >
                  Clear Day
                </button>
              </div>
              <div className="flex gap-3">
                <button
                    type="button"
                    onClick={onClose}
                    className="px-5 py-2.5 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors font-medium"
                    disabled={isSaving}
                >
                  Cancel
                </button>
                <button
                    type="button"
                    onClick={handleSave}
                    disabled={isSaving}
                    className={`px-5 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium flex items-center gap-2 ${
                        isSaving ? 'opacity-75 cursor-not-allowed' : ''
                    }`}
                >
                  {isSaving ? (
                      <>
                        <span className="animate-spin">⏳</span>
                        Saving...
                      </>
                  ) : (
                      <>
                        <Save className="h-4 w-4" />
                        Save Schedule
                      </>
                  )}
                </button>
              </div>
            </div>

            {/* Day Preview */}
            <div className="mt-6 p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600">
                <strong>{selectedDay}:</strong>{' '}
                {localSchedule[selectedDay].clockInStart ? (
                    <>
                      Clock In: {formatTimeDisplay(localSchedule[selectedDay].clockInStart)} - {formatTimeDisplay(localSchedule[selectedDay].clockInEnd)}
                      {' | '}
                      Clock Out: {formatTimeDisplay(localSchedule[selectedDay].clockOutStart)} - {formatTimeDisplay(localSchedule[selectedDay].clockOutEnd)}
                    </>
                ) : (
                    'No schedule set (Day off)'
                )}
              </p>
            </div>
          </div>
        </div>
      </div>
  );
};

export default TimeClockForm;