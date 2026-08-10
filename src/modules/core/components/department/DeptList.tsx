import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/components/ui/tabs";
import { Alert, AlertDescription, AlertTitle } from "@/shared/components/ui/alert";
import { AlertCircle } from 'lucide-react';
import DepartmentTable from "@/modules/core/components/department/DeptTable";
import DepartmentForm from "@/modules/core/components/department/DepartmentForm";
import DepartmentHierarchy from "@/modules/core/components/department/DeptHier";
import type { Department } from "@/modules/core/types/coreTypes";

export const DepartmentListTab = ({ 
  departments, 
  onEdit, 
  onDelete,
}: { 
  departments: Department[];
  onEdit: (department: Department) => void;
  onDelete: (id: string) => void;
}) => (
  <Card className="border-none shadow-none">
    <CardContent className="p-0">
      <DepartmentTable 
        departments={departments}
        onEdit={onEdit}
        onDelete={onDelete}
      />
    </CardContent>
  </Card>
);

export const DepartmentHierarchyTab = ({ 
  treeData, 
  expandedNodes, 
  onToggle 
}: { 
  treeData: Department[];
  expandedNodes: Set<string>;
  onToggle: (nodeId: string) => void;
}) => (
  <Card className="border-none shadow-none">
    <CardHeader className="px-0 pt-0 pb-4">
      <CardTitle className="text-xl">Department Hierarchy</CardTitle>
    </CardHeader>
    <CardContent className="px-0">
      <DepartmentHierarchy 
        treeData={treeData}
        expandedNodes={expandedNodes}
        onToggle={onToggle}
      />
    </CardContent>
  </Card>
);

interface DepartmentListProps {
  departments: Department[];
  onCreateDepartment: (department: Department) => void;
  onUpdateDepartment: (department: Department) => void;
  onDeleteDepartment: (id: string) => void;
}

const DepartmentList = ({ departments, onCreateDepartment, onUpdateDepartment, onDeleteDepartment }: DepartmentListProps) => {
  const [tabValue, setTabValue] = useState('list');
  const [selectedDepartment, setSelectedDepartment] = useState<Department | null>(null);
  const [formData, setFormData] = useState<Omit<Department, 'id'> & { id?: string }>({
    name: '',
    description: '',
    parentId: null
  });
  const [formError, setFormError] = useState<string | null>(null);
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(() => {
    const rootNodeIds = departments.filter(dept => dept.parentId === null).map(dept => dept.id);
    return new Set(rootNodeIds);
  });
  const [filteredDepartments, setFilteredDepartments] = useState<Department[]>(departments);
  const [searchTerm, setSearchTerm] = useState('');

  // Reset form when switching to form tab without a selected department
  useEffect(() => {
    if (tabValue === 'form' && !selectedDepartment) {
      setFormData({ name: '', description: '', parentId: null });
      setFormError(null);
    }
  }, [tabValue, selectedDepartment]);

  useEffect(() => {
    setFilteredDepartments(departments);
  }, [departments]);

  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredDepartments(departments);
      return;
    }
    
    const lowerTerm = searchTerm.toLowerCase();
    const filtered = departments.filter(
      dept => 
        dept.name.toLowerCase().includes(lowerTerm) || 
        (dept.description && dept.description.toLowerCase().includes(lowerTerm))
    );
    
    setFilteredDepartments(filtered);
  }, [searchTerm, departments]);

  const handleSelectDepartment = (department: Department) => {
    setSelectedDepartment(department);
    setFormData(department);
    setTabValue('form');
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    
    if (!formData.name.trim()) {
      setFormError('Department name is required');
      return;
    }

    if (selectedDepartment) {
      const updatedDepartment = { ...formData, id: selectedDepartment.id } as Department;
      onUpdateDepartment(updatedDepartment);
    } else {
      const newDepartment: Department = {
        ...formData,
        id: (Math.max(0, ...departments.map(d => parseInt(d.id))) + 1).toString()
      };
      onCreateDepartment(newDepartment);
    }
    
    setTabValue('list');
  };

  const handleFormChange = (field: keyof Department, value: string | null) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleDeleteDepartment = (id: string) => {
    if (departments.some(d => d.parentId === id)) {
      setFormError('Cannot delete department with child departments');
      return;
    }
    
    onDeleteDepartment(id);
    if (selectedDepartment?.id === id) {
      setSelectedDepartment(null);
      setFormData({ name: '', description: '', parentId: null });
    }
  };

  const buildTree = (depts: Department[], parentId: string | null = null): Department[] => {
    return depts
      .filter(dept => dept.parentId === parentId)
      .map(dept => ({
        ...dept,
        children: buildTree(depts, dept.id)
      }));
  };

  const toggleNode = (nodeId: string) => {
    setExpandedNodes(prev => {
      const newSet = new Set(prev);
      if (newSet.has(nodeId)) {
        newSet.delete(nodeId);
      } else {
        newSet.add(nodeId);
      }
      return newSet;
    });
  };

  const treeData = buildTree(departments);

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <Tabs value={tabValue} onValueChange={setTabValue}>
          <TabsList className="bg-gray-100 p-1.5 rounded-lg">
            <TabsTrigger 
              value="list" 
              className="px-6 py-2 rounded-md data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-green-600 font-medium transition-colors hover:bg-gray-200"
            >
              Department List
            </TabsTrigger>
            <TabsTrigger 
              value="hierarchy" 
              className="px-6 py-2 rounded-md data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-green-600 font-medium transition-colors hover:bg-gray-200"
            >
              Department Hierarchy
            </TabsTrigger>
          </TabsList>
        </Tabs>
        
        <div className="flex items-center space-x-4">
          <div className="relative">
            <input
              type="text"
              placeholder="Search departments..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-64 rounded-lg border border-gray-300 px-4 py-2 pl-10 focus:border-green-500 focus:ring-1 focus:ring-green-500"
            />
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" 
              />
            </svg>
          </div>
          

        </div>
      </div>

      <Tabs value={tabValue} className="w-full">
        <TabsContent value="list" className="mt-0">
          <DepartmentListTab 
            departments={filteredDepartments}
            onEdit={handleSelectDepartment}
            onDelete={handleDeleteDepartment}
          />
        </TabsContent>

        <TabsContent value="hierarchy" className="mt-0">
          <DepartmentHierarchyTab 
            treeData={treeData}
            expandedNodes={expandedNodes}
            onToggle={toggleNode}
          />
        </TabsContent>
      </Tabs>

      {/* Form Modal */}
      {tabValue === 'form' && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-md">
            <Card className="border-none">
              <CardHeader className="px-6 pt-6 pb-4">
                <CardTitle className="text-xl">
                  {selectedDepartment ? "Edit Department" : "Create New Department"}
                </CardTitle>
              </CardHeader>
              <CardContent className="px-6 pb-6">
                {formError && (
                  <Alert variant="destructive" className="mb-4">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Error</AlertTitle>
                    <AlertDescription>{formError}</AlertDescription>
                  </Alert>
                )}
                <DepartmentForm 
                  initialData={formData}
                  departments={departments}
                  isEdit={!!selectedDepartment}
                  onChange={handleFormChange}
                  onSubmit={handleFormSubmit}
                  onCancel={() => setTabValue('list')}
                />
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
};

export default DepartmentList;