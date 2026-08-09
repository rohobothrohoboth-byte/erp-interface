import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Briefcase } from "lucide-react";
import { Label } from "../../ui/label";
import { Input } from "../../ui/input";
import type { UUID } from "../../../types/auth/auth.types";
import { Button } from "../../ui/button";
import type {
  EmpExpListDto,
  EmpExpModDto,
} from "../../../types/profile/EmpExp.types";

interface EditExperienceModalProps {
  isOpen: boolean;
  isLoading?: boolean;
  data: EmpExpListDto | null;
  onClose: () => void;
  onSubmit: (data: EmpExpModDto) => void;
}

const EditExperienceModal: React.FC<EditExperienceModalProps> = ({
  isOpen,
  isLoading = false,
  data,
  onClose,
  onSubmit,
}) => {
  const [form, setForm] = useState({
    company: "",
    posTitle: "",
    location: "",
    startDate: "",
    endDate: "",
    respo: "",
  });
  const [dateError, setDateError] = useState<string>("");

  useEffect(() => {
    if (data) {
      const start = new Date(data.dateStart);
      const end = new Date(data.dateEnd);

      setForm({
        company: data.company,
        posTitle: data.posTitle,
        location: data.location,
        respo: data.respo,
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

    const payload: EmpExpModDto = {
      id: data.id,
      company: form.company,
      posTitle: form.posTitle,
      location: form.location,
      respo: form.respo,
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
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          className="bg-white rounded-xl shadow-xl w-full max-w-xl"
        >
          <div className="flex items-center gap-3 border-b px-6 py-4">
            <Briefcase className="text-green-600" />
            <h2 className="text-lg font-bold">Edit Experience</h2>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Company</Label>
                <Input
                  value={form.company}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, company: e.target.value }))
                  }
                />
              </div>

              <div className="space-y-2">
                <Label>Title</Label>
                <Input
                  value={form.posTitle}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, posTitle: e.target.value }))
                  }
                />
              </div>

              <div className="space-y-2">
                <Label>Location</Label>
                <Input
                  value={form.location}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, location: e.target.value }))
                  }
                />
              </div>

              <div className="space-y-2">
                <Label>Responsibility</Label>
                <Input
                  value={form.respo}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, respo: e.target.value }))
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
                disabled={isLoading}
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

export default EditExperienceModal;
