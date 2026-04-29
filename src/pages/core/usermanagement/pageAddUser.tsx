import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { CheckCircle, User, Printer } from "lucide-react";
import { BasicInfoStep } from "../../../components/hr/employee/AddEmployee/steps/BasicInfoStep";
import { BasicInfoReviewStep } from "../../../components/core/usermgmt/AddEmployee/InfoReviewStep";
import { AddEmployeeStepHeader } from "../../../components/core/usermgmt/AddEmployee/AddUserEmployeeHeader";
import type { Step1Dto, EmpAddPrintDto } from "../../../types/hr/employee/empAddDto";
import type { UUID } from "crypto";
import { usermgmtService } from "../../../services/core/usermgtservice";
import { useEmpAddStore } from "../../../stores/hr/empAdd.store";

const steps = [
  { id: 1, title: 'Basic Info', icon: User },
  { id: 2, title: 'Print', icon: Printer },
];

function PageAddUser() {
  const navigate = useNavigate();
  const {
    adminEmployeeId,
    adminCurrentStep,
    setAdminEmployeeId,
    setAdminStep,
    resetAdmin,
  } = useEmpAddStore();

  const [currentStep, setCurrentStep] = useState(adminCurrentStep);
  const [basicInfoData, setBasicInfoData] = useState<Partial<Step1Dto & { branchId: UUID; jobGradeStepId: UUID }>>({});
  const [step2Data, setStep2Data] = useState<EmpAddPrintDto | null>(null);
  const [photoData, setPhotoData] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const goToStep = (step: number) => {
    setCurrentStep(step);
    setAdminStep(step);
  };

  const handleBackToEmployees = () => navigate(-1);
  const handleBackToBasicInfo = () => { goToStep(1); setError(null); };

  const handleBasicInfoComplete = async (data: Step1Dto & { branchId: UUID }) => {
    setIsLoading(true);
    setError(null);
    try {
      setBasicInfoData(data);
      if (data.File) {
        const reader = new FileReader();
        reader.onloadend = () => setPhotoData(reader.result as string);
        reader.readAsDataURL(data.File);
      }
      const result = await usermgmtService.addEmployeeStep1(data);
      setAdminEmployeeId(result.id);
      const step2Response = await usermgmtService.getEmployeeStep2Data(result.id);
      setStep2Data(step2Response);
      goToStep(2);
    } catch (err: any) {
      setError(err.message || 'Failed to create employee. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleConfirmAndSave = async () => {
    setIsLoading(true);
    setError(null);
    try {
      setSaveSuccess(true);
      resetAdmin();
      setTimeout(() => navigate("/core/users"), 2000);
    } catch (err: any) {
      setError(err.message || "Failed to complete employee creation. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // Handle print functionality
  const handlePrint = () => {
    // Scroll to top
    window.scrollTo({ top: 0, behavior: "smooth" });

    setTimeout(() => {
      const basicInfoElement = document.getElementById("basic-info-section");

      if (!basicInfoElement) {
        alert("Basic Information section not found.");
        return;
      }

      // Clone the Basic Info section
      const clone = basicInfoElement.cloneNode(true) as HTMLElement;

      // Open print window
      const printWindow = window.open("", "_blank");

      if (!printWindow) return;

      // Extract styles
      const styles = Array.from(
        document.querySelectorAll("style, link[rel='stylesheet']"),
      )
        .map((node) => node.outerHTML)
        .join("\n");

      // Print-friendly CSS
      const printCSS = `
        <style>
          @page {
            size: A4;
            margin: 12mm;
          }

          body {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
            font-family: 'Segoe UI', Tahoma, sans-serif;
            margin: 0;
            padding: 0;
            font-size: 14px;
          }

          #print-root {
            page-break-inside: avoid;
          }

          .print-section * {
            page-break-inside: avoid !important;
            break-inside: avoid !important;
          }

          .print-layout {
            display: flex !important;
            flex-direction: row !important;
            gap: 20px !important;
            width: 100% !important;
          }

          .left-column {
            flex: 1 !important;
            max-width: 35% !important;
            display: flex !important;
            flex-direction: column !important;
            align-items: center !important;
            justify-content: flex-start !important;
          }

          .right-column {
            flex: 2 !important;
            max-width: 65% !important;
          }

          .photo-section {
            width: 100% !important;
            max-width: 180px !important;
            margin-bottom: 20px !important;
          }

          .employee-photo {
            width: 100% !important;
            height: auto !important;
            max-height: 180px !important;
            object-fit: contain !important;
            border: 1px solid #ddd !important;
            border-radius: 8px !important;
          }

          .placeholder-photo {
            width: 180px !important;
            height: 180px !important;
            border: 2px dashed #ddd !important;
            border-radius: 8px !important;
            display: flex !important;
            align-items: center !important;
            justify-content: center !important;
            background-color: #f9fafb !important;
          }

          .employee-code {
            margin-top: 10px !important;
            text-align: center !important;
            width: 100% !important;
          }

          .employee-code div {
            background-color: #f0f9ff !important;
            border: 1px solid #bae6fd !important;
            border-radius: 6px !important;
            padding: 10px !important;
            width: 100% !important;
          }

          .field {
            margin-bottom: 12px !important;
            page-break-inside: avoid !important;
          }

          .field label {
            display: block !important;
            font-size: 12px !important;
            color: #6b7280 !important;
            margin-bottom: 4px !important;
            font-weight: 500 !important;
          }

          .field p {
            margin: 0 !important;
            font-size: 14px !important;
            color: #111827 !important;
            font-weight: 500 !important;
            word-break: break-word !important;
          }

          button, .no-print {
            display: none !important;
          }

          .print-header {
            margin-bottom: 20px !important;
            padding-bottom: 15px !important;
            border-bottom: 2px solid #e5e7eb !important;
          }

          .print-header h3 {
            margin: 0 !important;
            font-size: 18px !important;
            color: #111827 !important;
            font-weight: 600 !important;
          }

          .section-title {
            display: flex !important;
            align-items: center !important;
            margin-bottom: 20px !important;
            font-size: 16px !important;
            font-weight: 600 !important;
            color: #111827 !important;
          }

          .border-gray-200 {
            border: 1px solid #e5e7eb !important;
          }

          .rounded-xl {
            border-radius: 12px !important;
          }

          .p-6 {
            padding: 24px !important;
          }

          .mb-4 {
            margin-bottom: 16px !important;
          }

          .mt-2 {
            margin-top: 8px !important;
          }
        </style>
      `;

      // Build print document
      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>Employee Basic Information</title>
          ${styles}
          ${printCSS}
        </head>
        <body>
          <div id="print-root">
            <div class="print-header">
              <h3>Employee Basic Information</h3>
            </div>
            <div class="print-section">
              ${clone.outerHTML}
            </div>
          </div>
        </body>
        </html>
      `);

      printWindow.document.close();
      printWindow.focus();

      setTimeout(() => {
        printWindow.print();
        printWindow.close();
      }, 250);
    }, 50);
  };

  // Render success message
  if (saveSuccess) {
    return (
      <section className="w-full bg-gray-50 overflow-auto p-6">
        <div className="max-w-4xl mx-auto">
          <div className="text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-3">
              Employee Added Successfully!
            </h1>
            <p className="text-gray-600 mb-6">
              Employee code:{" "}
              <span className="font-semibold text-green-600">
                {step2Data?.code || "N/A"}
              </span>
            </p>
            <p className="text-gray-500">Redirecting to employees list...</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="w-full bg-gray-50 overflow-auto">
      <div className="max-w-7xl mx-auto">
        {/* Step Header */}
        <AddEmployeeStepHeader
          steps={steps}
          currentStep={currentStep}
          onStepClick={(step) => { if (step < currentStep) goToStep(step); }}
          onBack={handleBackToEmployees}
          title="Add New Employee"
          backButtonText="Back to Employees"
        />

        {/* Error Display */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-xl p-4">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <svg
                  className="h-5 w-5 text-red-400"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">Error</h3>
                <p className="text-sm text-red-700 mt-1">{error}</p>
              </div>
              <div className="ml-auto pl-3">
                <button
                  onClick={() => setError(null)}
                  className="text-red-800 hover:text-red-900"
                >
                  <svg
                    className="h-4 w-4"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Step Content */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 px-6 py-4">
          {currentStep === 1 ? (
            <BasicInfoStep
              data={basicInfoData}
              onNext={handleBasicInfoComplete}
              onBack={handleBackToEmployees}
              loading={isLoading}
            />
          ) : (
            <BasicInfoReviewStep
              step1Data={basicInfoData as Step1Dto & { branchId: UUID }}
              step2Data={step2Data}
              photo={photoData}
              onBack={handleBackToBasicInfo}
              onConfirm={handleConfirmAndSave}
              onPrint={handlePrint}
              loading={isLoading}
            />
          )}
        </div>
      </div>
    </section>
  );
}

export default PageAddUser;
