import { useState } from "react";
import { GraduationCap, Briefcase, Eye } from "lucide-react";
import { Button } from "../../../ui/button";
import type { EmpEduListDto } from "../../../../types/profile/EmpEdu.types";
import type { EmpExpListDto } from "../../../../types/profile/EmpExp.types";
import { useEducation, useEducations } from "../../../../services/profile/Education/education.queries";
import { useExperience, useExperiences } from "../../../../services/profile/Experiance/experiance.queries";
import EducationDetailModal from "../../../profile/Education/EducationDetailModal";
import ExperienceDetailModal from "../../../profile/Experiance/ExperienceDetailModal";

function Field({ label, value, className = "" }: { label: string; value: React.ReactNode; className?: string }) {
  return (
    <div className={className}>
      <p className="text-xs font-medium text-gray-400 uppercase tracking-wide">{label}</p>
      <p className="text-sm font-medium text-gray-800 mt-1">{value || "-"}</p>
    </div>
  );
}

export default function EmpEduExpTab() {
  const [selectedEducation, setSelectedEducation] =
    useState<EmpEduListDto | null>(null);
  const [selectedExperience, setSelectedExperience] =
    useState<EmpExpListDto | null>(null);
  const [viewEducation, setViewEducation] = useState<EmpEduListDto | null>(
    null,
  );
  const [viewExperience, setViewExperience] = useState<EmpExpListDto | null>(
    null,
  );

  // ── Queries ──────────────────────────────────────────────────────────────
  const { data: educations = [], isLoading: edusLoading } = useEducations();
  const { data: educationDetail, isLoading: eduDetailLoading } = useEducation(
    viewEducation?.id as string,
  );
  const { data: experiences = [], isLoading: expsLoading } = useExperiences();
  const { data: experienceDetail, isLoading: expDetailLoading } = useExperience(
    viewExperience?.id as string,
  );

  return (
    <>
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* EDUCATION */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 bg-linear-to-r from-emerald-50 via-green-50 to-emerald-100 border-b border-emerald-100">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-linear-to-br from-emerald-500 to-green-600 flex items-center justify-center text-white shadow-sm">
                <GraduationCap className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-emerald-800 uppercase tracking-wide">
                  Educations
                </h3>
                <p className="text-xs text-emerald-600">
                  Academic qualifications
                </p>
              </div>
            </div>
          </div>

          <div className="p-5 space-y-4">
            {edusLoading ? (
              <p className="text-sm text-gray-400 italic">Loading...</p>
            ) : educations.length === 0 ? (
              <p className="text-sm text-gray-400 italic">
                No education records found.
              </p>
            ) : (
              educations.map((edu) => (
                <div
                  key={edu.id as string}
                  className="rounded-xl border border-gray-100 hover:border-emerald-200 hover:shadow-sm transition-all overflow-hidden"
                >
                  <div className="flex justify-between items-center px-4 p-2">
                    <h4 className="font-semibold text-gray-800">
                      {edu.fieldOfStudy}
                    </h4>

                    <button
                      className="flex items-center gap-2 text-sm text-green-600 hover:bg-green-50 px-3 py-2 rounded-md transition-colors"
                      onClick={() => setViewEducation(edu)}
                    >
                      <Eye className="w-3.5 h-3.5" /> View
                    </button>
                  </div>
                  <hr className="border-gray-100" />
                  <div className="px-4 py-3 grid grid-cols-2 gap-4">
                    <Field label="Level" value={edu.eduLevel} />
                    <Field label="Institution" value={edu.institution} />
                    <Field label="Start Date" value={edu.dateStart} />
                    <Field label="End Date" value={edu.dateEnd} />
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* EXPERIENCE */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 bg-linear-to-r from-emerald-50 via-green-50 to-emerald-100 border-b border-emerald-100">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-linear-to-br from-emerald-500 to-green-600 flex items-center justify-center text-white shadow-sm">
                <Briefcase className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-emerald-800 uppercase tracking-wide">
                  Experience
                </h3>
                <p className="text-xs text-emerald-600">
                  Professional work history
                </p>
              </div>
            </div>
          </div>

          <div className="p-5 space-y-4">
            {expsLoading ? (
              <p className="text-sm text-gray-400 italic">Loading...</p>
            ) : experiences.length === 0 ? (
              <p className="text-sm text-gray-400 italic">
                No experience records found.
              </p>
            ) : (
              experiences.map((exp) => (
                <div
                  key={exp.id as string}
                  className="rounded-xl border border-gray-100 hover:border-emerald-200 hover:shadow-sm transition-all overflow-hidden"
                >
                  <div className="flex items-start justify-between px-4 p-2">
                    <h4 className="font-semibold text-gray-800">
                      {exp.posTitle}
                    </h4>

                    <button
                      className="flex items-center gap-2 text-sm text-green-600 hover:bg-green-50 px-3 py-2 rounded-md transition-colors"
                      onClick={() => setViewExperience(exp)}
                    >
                      <Eye className="w-3.5 h-3.5" /> View
                    </button>
                  </div>
                  <hr className="border-gray-100" />
                  <div className="px-4 py-3 grid grid-cols-2 gap-4">
                    <Field label="Company" value={exp.company} />
                    <Field label="Location" value={exp.location} />
                    <Field label="Start Date" value={exp.dateStart} />
                    <Field label="End Date" value={exp.dateEnd} />
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* modals */}
      <EducationDetailModal
        isOpen={!!viewEducation}
        data={educationDetail}
        isLoading={eduDetailLoading}
        onClose={() => setViewEducation(null)}
      />

      <ExperienceDetailModal
        isOpen={!!viewExperience}
        data={experienceDetail}
        isLoading={expDetailLoading}
        onClose={() => setViewExperience(null)}
      />
    </>
  );
}
