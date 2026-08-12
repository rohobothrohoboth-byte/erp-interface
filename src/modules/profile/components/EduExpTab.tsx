import { useState, useEffect } from "react";
import {
  GraduationCap,
  Briefcase,
  Plus,
  MoreVertical,
  Eye,
  Pencil,
  Trash2,
  File,
  Image,
  FileText,
  Loader2,
  Download,
} from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/shared/components/ui/popover";
import AddEducationModal from "@/modules/profile/components/Education/AddEducationModal";
import AddExperienceModal from "@/modules/profile/components/Experiance/AddExperianceModal";
import DeleteEducationModal from "@/modules/profile/components/Education/DeleteEducationModal";
import DeleteExperianceModal from "@/modules/profile/components/Experiance/DeleteExperianceModal";
import EditEducationModal from "@/modules/profile/components/Education/EditEducationModal";
import EditExperienceModal from "@/modules/profile/components/Experiance/EditExperianceModal";
import EducationDetailModal from "@/modules/profile/components/Education/EducationDetailModal";
import ExperienceDetailModal from "@/modules/profile/components/Experiance/ExperienceDetailModal";
import {
  useEducations,
  useCreateEducation,
  useUpdateEducation,
  useDeleteEducation,
  useEducation,
} from "@/modules/profile/services/Education/education.queries";
import {
  useExperiences,
  useCreateExperience,
  useUpdateExperience,
  useDeleteExperience,
  useExperience,
} from "@/modules/profile/services/Experiance/experiance.queries";
import type {
  EmpEduListDto,
  EmpEduAddDto,
  EmpEduModDto,
} from "@/modules/profile/types/EmpEdu.types";
import type {
  EmpExpListDto,
  EmpExpAddDto,
  EmpExpModDto,
} from "@/modules/profile/types/EmpExp.types";
import { showToast } from "@/shared/layout/layout";
import { getFilesByReference, deleteFile, downloadFile } from "@/modules/file/services/fileManagement/fileManagementApi";

// ============================================================
// ✅ FileList Component
// ============================================================
interface FileListProps {
  module: string;
  referenceId: string;
  category?: string;
  onFileDelete?: (fileId: string) => void;
  onFileDownload?: (fileId: string) => void;
  readOnly?: boolean;
  refreshTrigger?: number; // ✅ Add refresh trigger
}

const FileList: React.FC<FileListProps> = ({
                                             module,
                                             referenceId,
                                             category,
                                             onFileDelete,
                                             onFileDownload,
                                             readOnly = false,
                                             refreshTrigger = 0, // ✅ Add refresh trigger
                                           }) => {
  const [files, setFiles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const loadFiles = async () => {
    // ✅ Don't try to load if no referenceId
    if (!referenceId) {
      setLoading(false);
      setFiles([]);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const response = await getFilesByReference(module, referenceId, category);
      const data = response?.data?.data || response?.data || [];
      setFiles(Array.isArray(data) ? data : []);
    } catch (error: any) {
      console.error('Failed to load files:', error);
      // ✅ Don't show error for 404 - just means no files
      if (error.response?.status !== 404) {
        setError(error?.message || 'Failed to load files');
        showToast.error(error?.message || 'Failed to load files');
      }
      setFiles([]);
    } finally {
      setLoading(false);
    }
  };

  // ✅ Load files when referenceId changes or refreshTrigger changes
  useEffect(() => {
    loadFiles();
  }, [referenceId, module, category, refreshTrigger]);

  const handleDelete = async (fileId: string) => {
    try {
      await deleteFile(fileId, false);
      setFiles(prev => prev.filter(f => f.id !== fileId));
      if (onFileDelete) {
        onFileDelete(fileId);
      }
      showToast.success('File deleted successfully');
    } catch (error: any) {
      showToast.error(error?.message || 'Failed to delete file');
    }
  };

  const handleDownload = async (file: any) => {
    setDownloading(file.id);
    try {
      const blob = await downloadFile(file.id);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = file.fileName || file.name || 'download';
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      if (onFileDownload) {
        onFileDownload(file.id);
      }
    } catch (error: any) {
      showToast.error(error?.message || 'Failed to download file');
    } finally {
      setDownloading(null);
    }
  };

  const getFileIcon = (file: any) => {
    const mimeType = file.mimeType || file.fileType || file.documentType || '';
    if (mimeType.startsWith('image/')) return <Image className="w-5 h-5" />;
    if (mimeType === 'application/pdf') return <FileText className="w-5 h-5" />;
    return <File className="w-5 h-5" />;
  };

  const formatFileSize = (bytes: number) => {
    if (!bytes || bytes === 0) return '0 B';
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  // ✅ Show error state
  if (error) {
    return (
        <div className="text-center py-2">
          <p className="text-xs text-red-500">Failed to load files</p>
          <button
              onClick={loadFiles}
              className="text-xs text-blue-500 hover:underline mt-1"
          >
            Retry
          </button>
        </div>
    );
  }

  if (loading) {
    return (
        <div className="flex items-center justify-center py-2">
          <Loader2 className="w-4 h-4 animate-spin text-gray-400" />
          <span className="ml-2 text-xs text-gray-400">Loading files...</span>
        </div>
    );
  }

  if (files.length === 0) {
    return (
        <div className="text-center py-2">
          <p className="text-xs text-gray-400">No files attached</p>
        </div>
    );
  }

  return (
      <div className="space-y-1.5">
        <p className="text-xs font-medium text-gray-500">Attached Files ({files.length})</p>
        {files.map((file) => (
            <div
                key={file.id}
                className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700"
            >
              <div className="flex items-center gap-2 min-w-0">
                <div className="text-gray-500 dark:text-gray-400 flex-shrink-0">
                  {getFileIcon(file)}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-medium text-gray-800 dark:text-gray-200 truncate">
                    {file.fileName || file.name || file.originalFileName || 'File'}
                  </p>
                  <p className="text-[10px] text-gray-500 dark:text-gray-400">
                    {formatFileSize(file.fileSize || file.size || 0)}
                    {file.uploadedAt && (
                        <> • {new Date(file.uploadedAt).toLocaleDateString()}</>
                    )}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1 flex-shrink-0">
                <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-7 w-7 p-0 text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:hover:bg-blue-950/30"
                    onClick={() => handleDownload(file)}
                    disabled={downloading === file.id}
                >
                  {downloading === file.id ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                      <Download className="w-3.5 h-3.5" />
                  )}
                </Button>
                {!readOnly && (
                    <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="h-7 w-7 p-0 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/30"
                        onClick={() => handleDelete(file.id)}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                )}
              </div>
            </div>
        ))}
      </div>
  );
};



// ============================================================
// ✅ EduExpTab Main Component
// ============================================================

function EduExpTab() {
  const [educationModalOpen, setEducationModalOpen] = useState(false);
  const [experienceModalOpen, setExperienceModalOpen] = useState(false);
  const [openEduPopover, setOpenEduPopover] = useState<string | null>(null);
  const [openExpPopover, setOpenExpPopover] = useState<string | null>(null);
  const [selectedEducation, setSelectedEducation] = useState<EmpEduListDto | null>(null);
  const [selectedExperience, setSelectedExperience] = useState<EmpExpListDto | null>(null);
  const [editEducation, setEditEducation] = useState<EmpEduListDto | null>(null);
  const [editExperience, setEditExperience] = useState<EmpExpListDto | null>(null);
  const [viewEducation, setViewEducation] = useState<EmpEduListDto | null>(null);
  const [viewExperience, setViewExperience] = useState<EmpExpListDto | null>(null);

  // ✅ Add refresh triggers for file lists
  const [eduRefreshTrigger, setEduRefreshTrigger] = useState(0);
  const [expRefreshTrigger, setExpRefreshTrigger] = useState(0);

  // ── Queries ──────────────────────────────────────────────────────────────
  const { data: educations = [], isLoading: edusLoading } = useEducations();
  const { data: educationDetail, isLoading: eduDetailLoading } = useEducation(
      viewEducation?.id as string,
  );
  const { data: experiences = [], isLoading: expsLoading } = useExperiences();
  const { data: experienceDetail, isLoading: expDetailLoading } = useExperience(
      viewExperience?.id as string,
  );

  // ── Mutations ─────────────────────────────────────────────────────────────
  const createEdu = useCreateEducation();
  const updateEdu = useUpdateEducation();
  const deleteEdu = useDeleteEducation();

  const createExp = useCreateExperience();
  const updateExp = useUpdateExperience();
  const deleteExp = useDeleteExperience();

  const handleCreateEducation = async (data: EmpEduAddDto) => {
    try {
      const response = await createEdu.mutateAsync(data);
      const message = typeof response === 'string' ? response : response?.message || "Education added successfully";
      showToast.success(message);
      setEducationModalOpen(false);
      // ✅ Trigger file list refresh
      setEduRefreshTrigger(prev => prev + 1);
    } catch (error: any) {
      showToast.error(error?.message || "Failed to add education");
      throw error;
    }
  };

  const handleUpdateEducation = async (data: EmpEduModDto) => {
    try {
      const response = await updateEdu.mutateAsync(data);
      const message = typeof response === 'string' ? response : response?.message || "Education updated successfully";
      showToast.success(message);
      setEditEducation(null);
      // ✅ Trigger file list refresh
      setEduRefreshTrigger(prev => prev + 1);
    } catch (error: any) {
      showToast.error(error?.message || "Failed to update education");
      throw error;
    }
  };

  const handleDeleteEducation = async (id: string) => {
    try {
      const response = await deleteEdu.mutateAsync(id);
      const message = typeof response === 'string' ? response : response?.message || "Education deleted successfully";
      showToast.success(message);
      setSelectedEducation(null);
      // ✅ Trigger file list refresh
      setEduRefreshTrigger(prev => prev + 1);
    } catch (error: any) {
      showToast.error(error?.message || "Failed to delete education");
      throw error;
    }
  };

  const handleCreateExperience = async (data: EmpExpAddDto) => {
    try {
      const response = await createExp.mutateAsync(data);
      const message = typeof response === 'string' ? response : response?.message || "Experience added successfully";
      showToast.success(message);
      setExperienceModalOpen(false);
      // ✅ Trigger file list refresh
      setExpRefreshTrigger(prev => prev + 1);
    } catch (error: any) {
      showToast.error(error?.message || "Failed to add experience");
      throw error;
    }
  };

  const handleUpdateExperience = async (data: EmpExpModDto) => {
    try {
      const response = await updateExp.mutateAsync(data);
      const message = typeof response === 'string' ? response : response?.message || "Experience updated successfully";
      showToast.success(message);
      setEditExperience(null);
      // ✅ Trigger file list refresh
      setExpRefreshTrigger(prev => prev + 1);
    } catch (error: any) {
      showToast.error(error?.message || "Failed to update experience");
      throw error;
    }
  };

  const handleDeleteExperience = async (id: string) => {
    try {
      const response = await deleteExp.mutateAsync(id);
      const message = typeof response === 'string' ? response : response?.message || "Experience deleted successfully";
      showToast.success(message);
      setSelectedExperience(null);
      // ✅ Trigger file list refresh
      setExpRefreshTrigger(prev => prev + 1);
    } catch (error: any) {
      showToast.error(error?.message || "Failed to delete experience");
      throw error;
    }
  };

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
              <Button
                  size="sm"
                  onClick={() => setEducationModalOpen(true)}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white"
              >
                <Plus className="w-4 h-4 mr-1" /> Add Education
              </Button>
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
                        <div className="flex items-start justify-between px-4 p-2">
                          <h4 className="font-semibold text-gray-800">
                            {edu.fieldOfStudy}
                          </h4>
                          <Popover
                              open={openEduPopover === String(edu.id)}
                              onOpenChange={(o) =>
                                  setOpenEduPopover(o ? String(edu.id) : null)
                              }
                          >
                            <PopoverTrigger asChild>
                              <Button
                                  variant="ghost"
                                  size="sm"
                                  className="text-gray-400 hover:text-gray-600 hover:bg-gray-50"
                              >
                                <MoreVertical className="w-4 h-4" />
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent align="end" className="w-36 p-1">
                              <button
                                  className="flex items-center gap-2 w-full px-3 py-2 text-sm text-sky-600 hover:bg-sky-50 rounded-md transition-colors"
                                  onClick={() => {
                                    setOpenEduPopover(null);
                                    setViewEducation(edu);
                                  }}
                              >
                                <Eye className="w-3.5 h-3.5" /> View
                              </button>
                              <button
                                  className="flex items-center gap-2 w-full px-3 py-2 text-sm text-green-600 hover:bg-green-50 rounded-md transition-colors"
                                  onClick={() => {
                                    setOpenEduPopover(null);
                                    setEditEducation(edu);
                                  }}
                              >
                                <Pencil className="w-3.5 h-3.5" /> Edit
                              </button>
                              <button
                                  className="flex items-center gap-2 w-full px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-md transition-colors"
                                  onClick={() => {
                                    setOpenEduPopover(null);
                                    setSelectedEducation(edu);
                                  }}
                              >
                                <Trash2 className="w-3.5 h-3.5" /> Delete
                              </button>
                            </PopoverContent>
                          </Popover>
                        </div>
                        <hr className="border-gray-100" />
                        <div className="px-4 py-3 grid grid-cols-2 gap-4">
                          <Field label="Level" value={edu.eduLevel} />
                          <Field label="Institution" value={edu.institution} />
                          <Field label="Start Date" value={edu.dateStart} />
                          <Field label="End Date" value={edu.dateEnd} />
                        </div>
                        {/* ✅ Show attached files */}
                        {edu.id && (
                            <div className="px-4 py-2 border-t border-gray-100">
                              <FileList
                                  module="education"
                                  referenceId={edu.id}
                                  category="certificate"
                                  readOnly={false}
                              />
                            </div>
                        )}
                      </div>
                  ))
              )}
            </div>
          </div>

          {/* EXPERIENCE */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 bg-linear-to-r from-emerald-50 via-sky-50 to-emerald-100 border-b border-emerald-100">
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
              <Button
                  size="sm"
                  onClick={() => setExperienceModalOpen(true)}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white"
              >
                <Plus className="w-4 h-4 mr-1" /> Add Experience
              </Button>
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
                          <Popover
                              open={openExpPopover === String(exp.id)}
                              onOpenChange={(o) =>
                                  setOpenExpPopover(o ? String(exp.id) : null)
                              }
                          >
                            <PopoverTrigger asChild>
                              <Button
                                  variant="ghost"
                                  size="sm"
                                  className="text-gray-400 hover:text-gray-600 hover:bg-gray-50"
                              >
                                <MoreVertical className="w-4 h-4" />
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent align="end" className="w-36 p-1">
                              <button
                                  className="flex items-center gap-2 w-full px-3 py-2 text-sm text-sky-600 hover:bg-sky-50 rounded-md transition-colors"
                                  onClick={() => {
                                    setOpenExpPopover(null);
                                    setViewExperience(exp);
                                  }}
                              >
                                <Eye className="w-3.5 h-3.5" /> View
                              </button>
                              <button
                                  className="flex items-center gap-2 w-full px-3 py-2 text-sm text-green-600 hover:bg-green-50 rounded-md transition-colors"
                                  onClick={() => {
                                    setOpenExpPopover(null);
                                    setEditExperience(exp);
                                  }}
                              >
                                <Pencil className="w-3.5 h-3.5" /> Edit
                              </button>
                              <button
                                  className="flex items-center gap-2 w-full px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-md transition-colors"
                                  onClick={() => {
                                    setOpenExpPopover(null);
                                    setSelectedExperience(exp);
                                  }}
                              >
                                <Trash2 className="w-3.5 h-3.5" /> Delete
                              </button>
                            </PopoverContent>
                          </Popover>
                        </div>
                        <hr className="border-gray-100" />
                        <div className="px-4 py-3 grid grid-cols-2 gap-4">
                          <Field label="Company" value={exp.company} />
                          <Field label="Location" value={exp.location} />
                          <Field label="Start Date" value={exp.dateStart} />
                          <Field label="End Date" value={exp.dateEnd} />
                        </div>
                        {/* ✅ Show attached files */}
                        {exp.id && (
                            <div className="px-4 py-2 border-t border-gray-100">
                              <FileList
                                  module="experience"
                                  referenceId={exp.id}
                                  category="experience_letter"
                                  readOnly={false}
                              />
                            </div>
                        )}
                      </div>
                  ))
              )}
            </div>
          </div>
        </div>

        {/* MODALS */}
        <AddEducationModal
            isOpen={educationModalOpen}
            isLoading={createEdu.isPending}
            onClose={() => setEducationModalOpen(false)}
            onSubmit={handleCreateEducation}
        />

        <AddExperienceModal
            isOpen={experienceModalOpen}
            isLoading={createExp.isPending}
            onClose={() => setExperienceModalOpen(false)}
            onSubmit={handleCreateExperience}
        />

        <EditEducationModal
            isOpen={!!editEducation}
            isLoading={updateEdu.isPending}
            data={editEducation}
            onClose={() => setEditEducation(null)}
            onSubmit={handleUpdateEducation}
        />

        <EditExperienceModal
            isOpen={!!editExperience}
            isLoading={updateExp.isPending}
            data={editExperience}
            onClose={() => setEditExperience(null)}
            onSubmit={handleUpdateExperience}
        />

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

        <DeleteEducationModal
            EmpEdu={selectedEducation}
            isOpen={!!selectedEducation}
            onClose={() => setSelectedEducation(null)}
            onConfirm={handleDeleteEducation}
        />

        <DeleteExperianceModal
            EmpExp={selectedExperience}
            isOpen={!!selectedExperience}
            onClose={() => setSelectedExperience(null)}
            onConfirm={handleDeleteExperience}
        />
      </>
  );
}

// ============================================================
// ✅ Field Component
// ============================================================

function Field({
                 label,
                 value,
                 className = "",
               }: {
  label: string;
  value: React.ReactNode;
  className?: string;
}) {
  return (
      <div className={className}>
        <p className="text-xs font-medium text-gray-400 uppercase tracking-wide">
          {label}
        </p>
        <p className="text-sm font-medium text-gray-800 mt-1">{value || "-"}</p>
      </div>
  );
}

export default EduExpTab;