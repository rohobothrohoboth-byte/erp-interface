// Calendar.tsx
import { useState, useEffect } from 'react';

interface Task {
  id: number;
  title: string;
  time: string;
  completed: boolean;
}

interface CalendarProps {
  tasks: Task[];
  onTaskToggle: (id: number) => void;
}

export default function Calendar({ tasks, onTaskToggle }: CalendarProps) {
  const [currentDate, setCurrentDate] = useState<string>('');
  const [currentMonth, setCurrentMonth] = useState<Date>(new Date());

  useEffect(() => {
    const today = new Date();
    const options: Intl.DateTimeFormatOptions = { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    };
    setCurrentDate(today.toLocaleDateString(undefined, options));
  }, []);

  const getDaysInMonth = (year: number, month: number) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (year: number, month: number) => {
    return new Date(year, month, 1).getDay();
  };

  const getMonthName = (month: number) => {
    const date = new Date(0, month);
    return date.toLocaleString('default', { month: 'long' });
  };

  const renderCalendar = () => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const daysInMonth = getDaysInMonth(year, month);
    const firstDayOfMonth = getFirstDayOfMonth(year, month);
    const today = new Date();
    
    const days = [];
    // Add empty cells for days before the first day of the month
    for (let i = 0; i < firstDayOfMonth; i++) {
      days.push(<div key={`empty-${i}`} className="h-8 w-8 flex items-center justify-center text-gray-300"></div>);
    }

    // Add cells for each day of the month
    for (let i = 1; i <= daysInMonth; i++) {
      const isToday = today.getDate() === i && 
                     today.getMonth() === month && 
                     today.getFullYear() === year;
      
      days.push(
        <div 
          key={`day-${i}`} 
          className={`h-8 w-8 flex items-center justify-center rounded-full text-sm font-medium ${
            isToday 
              ? 'bg-blue-500 text-white' 
              : i < today.getDate() 
                ? 'text-gray-400' 
                : 'text-gray-700 hover:bg-gray-100'
          }`}
        >
          {i}
        </div>
      );
    }

    return days;
  };

  return (
    <div className="w-full h-full min-h-0 p-6 border-r border-gray-200 bg-white/50 backdrop-blur-sm flex flex-col">
      {/* Calendar Section */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-4">
          <p className="text-gray-600">{currentDate}</p>
        </div>

        <div className="bg-white rounded-xl shadow p-4">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-800">
              {getMonthName(currentMonth.getMonth())}{" "}
              {currentMonth.getFullYear()}
            </h3>
            <div className="flex space-x-2">
              <button
                onClick={() =>
                  setCurrentMonth(
                    new Date(
                      currentMonth.getFullYear(),
                      currentMonth.getMonth() - 1,
                    ),
                  )
                }
                className="p-1 rounded-full hover:bg-gray-100"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 text-gray-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 19l-7-7 7-7"
                  />
                </svg>
              </button>
              <button
                onClick={() =>
                  setCurrentMonth(
                    new Date(
                      currentMonth.getFullYear(),
                      currentMonth.getMonth() + 1,
                    ),
                  )
                }
                className="p-1 rounded-full hover:bg-gray-100"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 text-gray-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-7 gap-1 text-center mb-2">
            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
              <div key={day} className="text-xs font-medium text-gray-500 py-1">
                {day}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-1">{renderCalendar()}</div>
        </div>
      </div>

      {/* Tasks Section */}
      <div className="flex-1 overflow-y-auto">
        <h3 className="font-medium text-gray-700 mb-3"> Tasks</h3>

        {tasks.length > 0 ? (
          tasks.map((task) => (
            <div
              key={task.id}
              className={`flex items-center p-3 rounded-lg mb-2 ${
                task.completed
                  ? "bg-green-50 border border-green-200"
                  : "bg-white shadow-sm"
              }`}
            >
              <input
                type="checkbox"
                checked={task.completed}
                onChange={() => onTaskToggle(task.id)}
                className="h-4 w-4 text-blue-600 rounded mr-3"
              />
              <div className="flex-1">
                <span
                  className={`font-medium ${task.completed ? "line-through text-gray-500" : "text-gray-800"}`}
                >
                  {task.title}
                </span>
                <div className="text-sm text-gray-500">{task.time}</div>
              </div>
            </div>
          ))
        ) : (
          <p className="text-gray-500 text-center py-4">
            No tasks scheduled for today
          </p>
        )}
      </div>
    </div>
  );
}