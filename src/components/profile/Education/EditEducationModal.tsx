import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ClipboardList } from "lucide-react";
import { Label } from "../../ui/label";
import { Input } from "../../ui/input";
import { Button } from "../../ui/button";
import type {
  EmpEduListDto,
  EmpEduModDto,
} from "../../../types/profile/EmpEdu.types";
import { EducationLevel } from "../../../types/enum";
import EnumSelect from "../../ui/enumSelect";

interface EditEducationModalProps {
  isOpen: boolean;
  isLoading?: boolean;
  data: EmpEduListDto | null;
  onClose: () => void;
  onSubmit: (data: EmpEduModDto) => void;
}

const EditEducationModal: React.FC<EditEducationModalProps> = ({
  isOpen,
  isLoading = false,
  data,
  onClose,
  onSubmit,
}) => {
  const [form, setForm] = useState({
    eduLevel: "",
    institution: "",
    fieldOfStudy: "",
    gpa: null as number | null,
    startDate: "",
    endDate: "",
  });
  const [dateError, setDateError] = useState<string>("");

  const toEduLevelKey = (val: string): string => {
    // Direct key match (e.g. "0", "1")
    if (Object.prototype.hasOwnProperty.call(EducationLevel, val)) return val;
    // Label match (e.g. "High School" → "6")
    const entry = Object.entries(EducationLevel).find(
      ([, label]) => label.toLowerCase().trim() === val.toLowerCase().trim(),
    );
    return entry?.[0] ?? "";
  };

  useEffect(() => {
    if (data) {
      const start = new Date(data.dateStart);
      const end = new Date(data.dateEnd);
      setForm({
        eduLevel: toEduLevelKey(data.eduLevel),
        institution: data.institution,
        fieldOfStudy: data.fieldOfStudy,
        gpa: data.gpa ?? null,
        startDate: !isNaN(start.getTime())
          ? start.toISOString().split("T")[0]
          : "",
        endDate: !isNaN(end.getTime()) ? end.toISOString().split("T")[0] : "",
      });
      setDateError("");
    }
  }, [data]);

  const handleStartDateChange = (value: string) => {
    setForm((p) => ({ ...p, startDate: value }));
    if (form.endDate && value && form.endDate <= value) {
      setDateError("End date must be after start date.");
    } else {
      setDateError("");
    }
  };

  const handleEndDateChange = (value: string) => {
    setForm((p) => ({ ...p, endDate: value }));
    if (form.startDate && value && value <= form.startDate) {
      setDateError("End date must be after start date.");
    } else {
      setDateError("");
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!data) return;
    if (form.endDate <= form.startDate) {
      setDateError("End date must be after start date.");
      return;
    }

    const payload: EmpEduModDto = {
      id: data.id,
      eduLevel: form.eduLevel,
      institution: form.institution,
      fieldOfStudy: form.fieldOfStudy,
      gpa: form.gpa,
      startDate: new Date(form.startDate).toISOString(),
      endDate: new Date(form.endDate).toISOString(),
      rowVersion: (data as any).rowVersion ?? "",
    };

    onSubmit(payload);
  };

  if (!isOpen || !data) return null;

  return (
    <AnimatePresence>
      <motion.div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm px-4">
        <motion.div className="bg-white rounded-xl shadow-xl w-full max-w-xl">
          <div className="flex items-center gap-3 border-b px-6 py-4">
            <ClipboardList className="text-green-600" />
            <h2 className="text-lg font-bold">Edit Education</h2>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Education Level */}
              <div className="space-y-2">
                <Label>
                  Education Level <span className="text-red-500">*</span>
                </Label>

                <EnumSelect
                  enumObject={EducationLevel}
                  value={form.eduLevel}
                  onChange={(value) =>
                    setForm((prev) => ({
                      ...prev,
                      eduLevel: value as EducationLevel,
                    }))
                  }
                  disabled={isLoading}
                />
              </div>
              <div className="space-y-2">
                <Label>Institution</Label>
                <Input
                  value={form.institution}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, institution: e.target.value }))
                  }
                />
              </div>

              <div className="space-y-2">
                <Label>Field of Study</Label>
                <Input
                  value={form.fieldOfStudy}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, fieldOfStudy: e.target.value }))
                  }
                />
              </div>

              <div className="space-y-2">
                <Label>GPA</Label>
                <Input
                  type="number"
                  value={form.gpa ?? ""}
                  onChange={(e) =>
                    setForm((p) => ({
                      ...p,
                      gpa:
                        e.target.value === "" ? null : Number(e.target.value),
                    }))
                  }
                />
              </div>

              <div className="space-y-2">
                <Label>Start Date</Label>
                <Input
                  type="date"
                  value={form.startDate}
                  onChange={(e) => handleStartDateChange(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label>End Date</Label>
                <Input
                  type="date"
                  value={form.endDate}
                  min={form.startDate ? form.startDate : undefined}
                  onChange={(e) => handleEndDateChange(e.target.value)}
                />
                {dateError && (
                  <p className="text-xs text-red-500 mt-1">{dateError}</p>
                )}
              </div>
            </div>

            <div className="border-t px-6 py-4 flex justify-center gap-2">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>

              <Button
                type="submit"
                className="bg-green-600 text-white hover:bg-green-700"
              >
                Save Changes
              </Button>
            </div>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default EditEducationModal;
