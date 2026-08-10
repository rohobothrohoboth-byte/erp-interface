import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/shared/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/components/ui/select";
import { Textarea } from "@/shared/components/ui/textarea";
import { PlusCircle, ChevronRight, ChevronLeft } from "lucide-react";
import { Badge } from "@/shared/components/ui/badge";
import { ArrowLeft } from "lucide-react";

interface Department {
  id: string;
  name: string;
}

interface CostCenter {
  id: string;
  name: string;
  departmentId: string;
}

export default function BudgetCreate() {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    title: "",
    fiscalYear: "",
    budgetType: "",
    department: "",
    costCenter: "",
    currency: "USD",
    assumptions: "",
    objectives: "",
    historicalData: false,
    zeroBased: false,
    growthTarget: 0,
    costConstraints: "",
    attachments: [] as File[],
    reviewApprovers: [] as string[],
    forecastFrequency: "Quarterly",
    scenarioPlanning: "Base Case",
    kpis: [] as string[]
  });

  const departments: Department[] = [
    { id: "dept-001", name: "Marketing" },
    { id: "dept-002", name: "Sales" },
    { id: "dept-003", name: "Research & Development" },
    { id: "dept-004", name: "Operations" },
    { id: "dept-005", name: "Human Resources" },
    { id: "dept-006", name: "Finance" },
    { id: "dept-007", name: "IT" }
  ];

  const costCenters: CostCenter[] = [
    { id: "cc-101", name: "Digital Marketing", departmentId: "dept-001" },
    { id: "cc-102", name: "Product Marketing", departmentId: "dept-001" },
    { id: "cc-201", name: "Enterprise Sales", departmentId: "dept-002" },
    { id: "cc-301", name: "Software Development", departmentId: "dept-003" },
    { id: "cc-401", name: "Logistics", departmentId: "dept-004" },
    { id: "cc-501", name: "Recruitment", departmentId: "dept-005" }
  ];

  const filteredCostCenters = costCenters.filter(
    center => center.departmentId === formData.department
  );

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    
    setFormData(prev => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value
    }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  const navigate = useNavigate();
    const handleBack = () => {
    navigate('/finance/budget-list'); // Navigate back to budget list
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFormData(prev => ({
        ...prev,
        attachments: [...prev.attachments, ...Array.from(e.target.files!)]
      }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Budget created:", formData);
    // Submit logic would go here
  };

  const nextStep = () => setCurrentStep(prev => Math.min(prev + 1, 4));
  const prevStep = () => setCurrentStep(prev => Math.max(prev - 1, 1));

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="mb-8">
        <Button 
          variant="outline"
          onClick={handleBack}
          className="mr-4"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
        <h1 className="text-2xl font-bold text-gray-800">Create New Budget</h1>
        <p className="text-sm text-gray-600 mt-1">
          Follow the workflow to define and submit a new budget
        </p>
      </div>

      {/* Enhanced Workflow Stepper */}
      <div className="mb-10">
        <div className="relative">
          <div className="flex justify-between mb-3">
            {[1, 2, 3, 4].map(step => (
              <div key={step} className="flex flex-col items-center flex-1 relative z-10">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 ${
                  currentStep === step 
                    ? "border-blue-600 bg-blue-600 text-white shadow-md" 
                    : currentStep > step 
                      ? "border-blue-300 bg-blue-50 text-blue-600" 
                      : "border-gray-300 bg-white text-gray-700"
                } transition-all duration-300`}>
                  {step}
                </div>
                <div className={`mt-2 text-xs text-center font-medium ${
                  currentStep === step ? "text-blue-600 font-semibold" : "text-gray-500"
                }`}>
                  {step === 1 && "Strategic Input"}
                  {step === 2 && "Budget Details"}
                  {step === 3 && "Review & Approvals"}
                  {step === 4 && "Finalization"}
                </div>
              </div>
            ))}
          </div>
          
          {/* Progress bar container */}
          <div className="absolute top-5 left-0 right-0 h-1 bg-gray-200 z-0">
            <div 
              className="h-full bg-blue-600 transition-all duration-500 ease-in-out" 
              style={{ 
                width: currentStep === 1 ? '0%' : 
                       currentStep === 2 ? '33%' : 
                       currentStep === 3 ? '66%' : '100%' 
              }}
            ></div>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        {/* Step 1: Strategic Planning Input */}
        {currentStep === 1 && (
          <Card className="mb-6 border border-blue-100 shadow-sm rounded-xl overflow-hidden">
            <CardHeader className="bg-blue-50 border-b border-blue-100 py-4">
              <CardTitle className="text-lg flex items-center">
                <span className="bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm mr-2">1</span>
                Strategic Planning Input
              </CardTitle>
              <p className="text-sm text-gray-500 mt-1">
                Define high-level objectives and financial targets
              </p>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="objectives">Strategic Objectives</Label>
                    <Textarea
                      id="objectives"
                      name="objectives"
                      value={formData.objectives}
                      onChange={handleChange}
                      placeholder="Enter key business objectives..."
                      className="mt-1 min-h-[100px]"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="growthTarget">Growth Target (%)</Label>
                    <Input
                      type="number"
                      id="growthTarget"
                      name="growthTarget"
                      value={formData.growthTarget}
                      onChange={handleChange}
                      min="0"
                      max="100"
                      className="mt-1"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="fiscalYear">Fiscal Year</Label>
                    <Select
                      value={formData.fiscalYear}
                      onValueChange={value => handleSelectChange("fiscalYear", value)}
                    >
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder="Select fiscal year" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="2024">2024</SelectItem>
                        <SelectItem value="2025">2025</SelectItem>
                        <SelectItem value="2026">2026</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="assumptions">Key Assumptions</Label>
                    <Textarea
                      id="assumptions"
                      name="assumptions"
                      value={formData.assumptions}
                      onChange={handleChange}
                      placeholder="Enter financial assumptions..."
                      className="mt-1 min-h-[100px]"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="costConstraints">Cost Constraints</Label>
                    <Input
                      id="costConstraints"
                      name="costConstraints"
                      value={formData.costConstraints}
                      onChange={handleChange}
                      placeholder="Enter cost constraints..."
                      className="mt-1"
                    />
                  </div>
                  
                  <div className="flex space-x-4">
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="historicalData"
                        name="historicalData"
                        checked={formData.historicalData}
                        onChange={handleChange}
                        className="h-4 w-4"
                      />
                      <Label htmlFor="historicalData">Use Historical Data</Label>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="zeroBased"
                        name="zeroBased"
                        checked={formData.zeroBased}
                        onChange={handleChange}
                        className="h-4 w-4"
                      />
                      <Label htmlFor="zeroBased">Zero-Based Budgeting</Label>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 2: Budget Preparation */}
        {currentStep === 2 && (
          <Card className="mb-6 border border-blue-100 shadow-sm rounded-xl overflow-hidden">
            <CardHeader className="bg-blue-50 border-b border-blue-100 py-4">
              <CardTitle className="text-lg flex items-center">
                <span className="bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm mr-2">2</span>
                Budget Preparation
              </CardTitle>
              <p className="text-sm text-gray-500 mt-1">
                Define budget details and methodology
              </p>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="title">Budget Title</Label>
                    <Input
                      id="title"
                      name="title"
                      value={formData.title}
                      onChange={handleChange}
                      placeholder="e.g., FY25 HR Operational Budget"
                      className="mt-1"
                      required
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="department">Department</Label>
                    <Select
                      value={formData.department}
                      onValueChange={value => handleSelectChange("department", value)}
                    >
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder="Select department" />
                      </SelectTrigger>
                      <SelectContent>
                        {departments.map(dept => (
                          <SelectItem key={dept.id} value={dept.id}>
                            {dept.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label htmlFor="budgetType">Budget Type</Label>
                    <Select
                      value={formData.budgetType}
                      onValueChange={value => handleSelectChange("budgetType", value)}
                    >
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder="Select budget type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Operational">Operational</SelectItem>
                        <SelectItem value="Capital">Capital</SelectItem>
                        <SelectItem value="Departmental">Departmental</SelectItem>
                        <SelectItem value="Project-based">Project-based</SelectItem>
                        <SelectItem value="Program">Program</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="costCenter">Cost Center / Project (Optional)</Label>
                    <Select
                      value={formData.costCenter}
                      onValueChange={value => handleSelectChange("costCenter", value)}
                      disabled={!formData.department}
                    >
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder="Select cost center" />
                      </SelectTrigger>
                      <SelectContent>
                        {filteredCostCenters.map(center => (
                          <SelectItem key={center.id} value={center.id}>
                            {center.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label htmlFor="currency">Currency</Label>
                    <Select
                      value={formData.currency}
                      onValueChange={value => handleSelectChange("currency", value)}
                    >
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder="Select currency" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="USD">US Dollar (USD)</SelectItem>
                        <SelectItem value="EUR">Euro (EUR)</SelectItem>
                        <SelectItem value="GBP">British Pound (GBP)</SelectItem>
                        <SelectItem value="JPY">Japanese Yen (JPY)</SelectItem>
                        <SelectItem value="CAD">Canadian Dollar (CAD)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label htmlFor="attachments">Supporting Documents</Label>
                    <Input
                      type="file"
                      id="attachments"
                      name="attachments"
                      onChange={handleFileChange}
                      className="mt-1"
                      multiple
                    />
                    {formData.attachments.length > 0 && (
                      <div className="mt-2 text-sm text-gray-600">
                        {formData.attachments.length} file(s) selected
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 3: Review & Approvals */}
        {currentStep === 3 && (
          <Card className="mb-6 border border-blue-100 shadow-sm rounded-xl overflow-hidden">
            <CardHeader className="bg-blue-50 border-b border-blue-100 py-4">
              <CardTitle className="text-lg flex items-center">
                <span className="bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm mr-2">3</span>
                Review & Approval Workflow
              </CardTitle>
              <p className="text-sm text-gray-500 mt-1">
                Configure approval process and reviewers
              </p>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-6">
                <div>
                  <Label>Approval Workflow</Label>
                  <div className="mt-2 bg-gray-50 p-4 rounded-lg border">
                    <div className="flex items-center justify-between mb-3">
                      <div className="font-medium">Department Review</div>
                      <Badge variant="default">Required</Badge>
                    </div>
                    <div className="flex items-center justify-between mb-3">
                      <div className="font-medium">Finance Review</div>
                      <Badge variant="default">Required</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="font-medium">Executive Approval</div>
                      <Badge variant="default">Required</Badge>
                    </div>
                  </div>
                </div>
                
                <div>
                  <Label>Forecasting Settings</Label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                    <div>
                      <Label htmlFor="forecastFrequency">Forecast Frequency</Label>
                      <Select
                        value={formData.forecastFrequency}
                        onValueChange={value => handleSelectChange("forecastFrequency", value)}
                      >
                        <SelectTrigger className="mt-1">
                          <SelectValue placeholder="Select frequency" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Monthly">Monthly</SelectItem>
                          <SelectItem value="Quarterly">Quarterly</SelectItem>
                          <SelectItem value="Semi-Annual">Semi-Annual</SelectItem>
                          <SelectItem value="Annual">Annual</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div>
                      <Label htmlFor="scenarioPlanning">Scenario Planning</Label>
                      <Select
                        value={formData.scenarioPlanning}
                        onValueChange={value => handleSelectChange("scenarioPlanning", value)}
                      >
                        <SelectTrigger className="mt-1">
                          <SelectValue placeholder="Select scenario" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Base Case">Base Case</SelectItem>
                          <SelectItem value="Best Case">Best Case</SelectItem>
                          <SelectItem value="Worst Case">Worst Case</SelectItem>
                          <SelectItem value="Growth Scenario">Growth Scenario</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
                
                <div>
                  <Label>Key Performance Indicators (KPIs)</Label>
                  <div className="mt-2 grid grid-cols-2 md:grid-cols-4 gap-2">
                    {["Budget Utilization", "Variance %", "ROI", "Cost Savings", "Revenue Growth", "EBITDA Margin", "Cash Flow", "Headcount"].map(kpi => (
                      <div key={kpi} className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id={kpi}
                          checked={formData.kpis.includes(kpi)}
                          onChange={(e) => {
                            const updatedKPIs = e.target.checked
                              ? [...formData.kpis, kpi]
                              : formData.kpis.filter(item => item !== kpi);
                            setFormData(prev => ({ ...prev, kpis: updatedKPIs }));
                          }}
                          className="h-4 w-4"
                        />
                        <Label htmlFor={kpi}>{kpi}</Label>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 4: Finalization */}
        {currentStep === 4 && (
          <Card className="mb-6 border border-blue-100 shadow-sm rounded-xl overflow-hidden">
            <CardHeader className="bg-blue-50 border-b border-blue-100 py-4">
              <CardTitle className="text-lg flex items-center">
                <span className="bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm mr-2">4</span>
                Finalization & Submission
              </CardTitle>
              <p className="text-sm text-gray-500 mt-1">
                Review and submit your budget for approval
              </p>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-6">
                <div className="border rounded-lg p-4">
                  <h3 className="font-bold mb-3">Budget Summary</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className="text-sm text-gray-500">Budget Title</div>
                      <div className="font-medium">{formData.title || "N/A"}</div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-500">Department</div>
                      <div className="font-medium">
                        {departments.find(d => d.id === formData.department)?.name || "N/A"}
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-500">Budget Type</div>
                      <div className="font-medium">{formData.budgetType || "N/A"}</div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-500">Fiscal Year</div>
                      <div className="font-medium">{formData.fiscalYear || "N/A"}</div>
                    </div>
                  </div>
                </div>
                
                <div className="border rounded-lg p-4">
                  <h3 className="font-bold mb-3">Strategic Input</h3>
                  <div className="space-y-2">
                    <div>
                      <div className="text-sm text-gray-500">Growth Target</div>
                      <div className="font-medium">{formData.growthTarget}%</div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-500">Budgeting Method</div>
                      <div className="font-medium">
                        {formData.zeroBased ? "Zero-Based Budgeting" : "Incremental Budgeting"}
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-500">Forecasting</div>
                      <div className="font-medium">{formData.forecastFrequency}</div>
                    </div>
                  </div>
                </div>
                
                <div className="border rounded-lg p-4">
                  <h3 className="font-bold mb-3">Review & Approval</h3>
                  <p className="text-sm text-gray-600">
                    Your budget will go through a multi-level approval process:
                  </p>
                  <ul className="list-disc pl-5 mt-2 space-y-1">
                    <li>Department Head Review</li>
                    <li>Finance Team Validation</li>
                    <li>Executive Committee Approval</li>
                  </ul>
                </div>
                
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="confirmation"
                    required
                    className="h-4 w-4"
                  />
                  <Label htmlFor="confirmation">
                    I confirm that all information provided is accurate and complete
                  </Label>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Navigation Buttons */}
        <div className="flex justify-between mt-8">
          <Button
            type="button"
            variant="outline"
            onClick={prevStep}
            disabled={currentStep === 1}
            className="px-6 py-3 rounded-lg transition-colors"
          >
            <ChevronLeft className="mr-2 h-4 w-4" />
            Previous
          </Button>
          
          {currentStep < 4 ? (
            <Button 
              type="button"
              onClick={nextStep}
              className="px-8 py-3 rounded-lg bg-blue-600 hover:bg-blue-700 transition-colors"
            >
              Next
              <ChevronRight className="ml-2 h-4 w-4" />
            </Button>
          ) : (
            <Button 
              type="submit" 
              className="px-8 py-3 rounded-lg bg-green-600 hover:bg-green-700 transition-colors shadow-md"
            >
              <PlusCircle className="mr-2 h-4 w-4" />
              Submit Budget
            </Button>
          )}
        </div>
      </form>
    </div>
  );
}