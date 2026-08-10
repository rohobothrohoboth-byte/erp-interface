import type { Department } from "@/modules/core/types/coreTypes";

type DepartmentOverviewCardProps = {
  departments: Department[];
};

const DepartmentOverviewCard = ({ departments }: DepartmentOverviewCardProps) => {
  const totalDepartments = departments.length;
  
  // Count top-level departments (without parent)
  const topLevelDepartments = departments.filter(
    dept => dept.parentId === null
  ).length;

  return (
    <div className="mb-8">
      {/* Department Management Title */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold">
          <span className="text-black">Department</span>
          <span className="text-green-500"> Management</span>
        </h1>
      </div>

      {/* Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Total Departments Card */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="rounded-full bg-indigo-100 p-3">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
            <div className="ml-4">
              <h3 className="text-2xl font-bold text-gray-900">{totalDepartments}</h3>
              <p className="text-sm font-medium text-gray-500">Total Departments</p>
            </div>
          </div>
        </div>

        {/* Top-Level Departments Card */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="rounded-full bg-green-100 p-3">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
            </div>
            <div className="ml-4">
              <h3 className="text-2xl font-bold text-gray-900">{topLevelDepartments}</h3>
              <p className="text-sm font-medium text-gray-500">Top-Level Departments</p>
            </div>
          </div>
        </div>

        {/* Departments with Sub-Departments Card */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="rounded-full bg-amber-100 p-3">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <div className="ml-4">
              <h3 className="text-2xl font-bold text-gray-900">
                {departments.filter(dept => 
                  departments.some(d => d.parentId === dept.id)
                ).length}
              </h3>
              <p className="text-sm font-medium text-gray-500">Departments with Sub-Departments</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DepartmentOverviewCard;