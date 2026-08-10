import React from 'react'
import { Chart, registerables } from 'chart.js';
import { Bar } from 'react-chartjs-2';
import {Card} from '@/shared/components/ui/card';

interface Department {
  id: string;
  name: string;
  employeeCount: number;
  vacancies: number;
  manager: string;
  location: string;
}
Chart.register(...registerables);

interface DepartmentChartProps {
  departments: Department[];
}

const DepartmentChart: React.FC<DepartmentChartProps> = ({ departments }) => {
  const chartData = {
    labels: departments.map(dept => dept.name),
    datasets: [
      {
        label: 'Current Employees',
        data: departments.map(dept => dept.employeeCount),
        backgroundColor: '#3B82F6',
        barPercentage: 0.6,
      },
      {
        label: 'Open Positions',
        data: departments.map(dept => dept.vacancies),
        backgroundColor: '#F59E0B',
        barPercentage: 0.6,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
      },
    },
    scales: {
      x: {
        grid: {
          display: false,
        },
      },
      y: {
        beginAtZero: true,
        grid: {
          color: '#E5E7EB',
        },
      },
    },
  };

  return (
    <Card
      title="Department Overview"
      className="h-full p-6 bg-white rounded-xl shadow-sm border border-gray-200"
    >
      <div className="flex flex-col">
        <h2 className="text-xl font-semibold text-gray-800">Department Overview</h2>
        <p className="text-sm font-medium text-gray-700 my-2">Distribution of employees throughout departments</p>
        <hr />
      </div>
      <div className="h-64">
        <Bar data={chartData} options={options} />
      </div>
    </Card>
  );
};

export default DepartmentChart;