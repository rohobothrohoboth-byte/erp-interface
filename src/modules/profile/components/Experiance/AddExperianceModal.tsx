// src/components/profile/experience/AddExperienceModal.tsx

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Briefcase, Upload, X, File, Image, FileText, Loader2 } from "lucide-react";
import { Label } from "@/shared/components/ui/label";
import { Input } from "@/shared/components/ui/input";
import { Button } from "@/shared/components/ui/button";
import { Textarea } from "@/shared/components/ui/textarea";
import { showToast } from "@/shared/layout/layout";


import { uploadFile } from "@/modules/file/services/fileManagement/fileManagementApi";

import type { EmpExpAddDto } from "@/modules/profile/types/EmpExp.types";

interface AddExperienceModalProps {
  isOpen: boolean;
  isLoading?: boolean;
  onClose: () => void;
  onSubmit: (data: EmpExpAddDto) => void;
}

interface UploadedFile {
  id: string;
  fileName: string;
  name: string;
  fileSize: number;
  size: number;
  mimeType: string;
  fileType: string;
}

type FormState = {
  company: string;
  posTitle: string;
  location: string;
  startDate: string;
  endDate: string;
  respo: string;
  experienceLetterFileId: string | null;
};

const defaultForm: FormState = {
  company: "",
  posTitle: "",
  location: "",
  startDate: "",
  endDate: "",
  respo: "",
  experienceLetterFileId: null,
};

const AddExperienceModal: React.FC<AddExperienceModalProps> = ({
                                                                 isOpen,
                                                                 isLoading = false,
                                                                 onClose,
                                                                 onSubmit,
                                                               }) => {
  const [form, setForm] = useState<FormState>(defaultForm);
  const [dateError, setDateError] = useState<string>("");
  const [uploading, setUploading] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  // ✅ Add upload error state
  const [uploadError, setUploadError] = useState<string | null>(null);

  const reset = () => {
    setForm(defaultForm);
    setDateError("");
    setUploadedFiles([]);
    setUploadError(null);
  };

  const handleClose = () => {
    if (!isLoading && !uploading) {
      reset();
      onClose();
    }
  };

  const handleStartDateChange = (value: string) => {
    setForm((prev) => ({ ...prev, startDate: value }));
    if (form.endDate && value && form.endDate <= value) {
      setDateError("End date must be after start date.");
    } else {
      setDateError("");
    }
  };

  const handleEndDateChange = (value: string) => {
    setForm((prev) => ({ ...prev, endDate: value }));
    if (form.startDate && value && value <= form.startDate) {
      setDateError("End date must be after start date.");
    } else {
      setDateError("");
    }
  };

  const handleFileUpload = async (file: File) => {
    if (!file) return;

    setUploading(true);
    setUploadError(null);

    try {
      const response = await uploadFile({
        file,
        module: "experience",
        category: "experience_letter",
        description: file.name,
        isPublic: false,
        isShared: false,
        sharingLevel: "Private",
      });

      // ✅ Safely extract the file data
      const uploadedFile = response?.data || response || {};

      const fileData: UploadedFile = {
        id: uploadedFile.id || uploadedFile.fileId || '',
        fileName: uploadedFile.fileName || uploadedFile.name || file.name,
        name: uploadedFile.fileName || uploadedFile.name || file.name,
        fileSize: uploadedFile.fileSize || uploadedFile.size || file.size || 0,
        size: uploadedFile.fileSize || uploadedFile.size || file.size || 0,
        mimeType: uploadedFile.mimeType || uploadedFile.fileType || file.type || '',
        fileType: uploadedFile.mimeType || uploadedFile.fileType || file.type || '',
      };

      setUploadedFiles(prev => [...prev, fileData]);
      setForm(prev => ({
        ...prev,
        experienceLetterFileId: fileData.id,
      }));

      showToast.success(`File "${file.name}" uploaded successfully`);
    } catch (error: any) {
      console.error("Upload error:", error);

      // ✅ Handle specific error codes
      let errorMessage = "Failed to upload file";

      if (error.response) {
        switch (error.response.status) {
          case 502:
            errorMessage = "File service is currently unavailable. Please try again later or contact support.";
            break;
          case 504:
            errorMessage = "File service timeout. Please try again later.";
            break;
          case 413:
            errorMessage = "File is too large. Please upload a smaller file.";
            break;
          case 400:
            errorMessage = error.response.data?.message || "Invalid file format or data.";
            break;
          default:
            errorMessage = error.response.data?.message || "Failed to upload file";
        }
      } else if (error.code === 'ECONNABORTED') {
        errorMessage = "Upload timed out. Please try again.";
      }

      setUploadError(errorMessage);
      showToast.error(errorMessage);
    } finally {
      setUploading(false);
    }
  };

  const handleFileRemove = (fileId: string) => {
    setUploadedFiles(prev => prev.filter(f => f.id !== fileId));
    setForm(prev => ({
      ...prev,
      experienceLetterFileId: null,
    }));
    setUploadError(null);
    showToast.success("File removed");
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // ✅ Validate file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        showToast.error("File size exceeds 10MB limit");
        e.target.value = '';
        return;
      }
      handleFileUpload(file);
    }
    e.target.value = '';
  };

  const getFileIcon = (file: UploadedFile) => {
    const mimeType = file.mimeType || file.fileType || '';
    if (mimeType.startsWith('image/')) return <Image className="w-4 h-4" />;
    if (mimeType === 'application/pdf') return <FileText className="w-4 h-4" />;
    return <File className="w-4 h-4" />;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (form.endDate <= form.startDate) {
      setDateError("End date must be after start date.");
      return;
    }

    const submitData: EmpExpAddDto = {
      company: form.company.trim(),
      posTitle: form.posTitle.trim(),
      location: form.location.trim(),
      startDate: new Date(form.startDate).toISOString(),
      endDate: new Date(form.endDate).toISOString(),
      respo: form.respo.trim() || null,
    };

    if (form.experienceLetterFileId) {
      submitData.experienceLetterFileId = form.experienceLetterFileId;
    }

    onSubmit(submitData);
    reset();
  };

  return (
      <AnimatePresence>
        {isOpen && (
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm px-4"
                onClick={(e) => {
                  if (e.target === e.currentTarget) {
                    handleClose();
                  }
                }}
            >
              <motion.div
                  initial={{ opacity: 0, scale: 0.95, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: 20 }}
                  transition={{
                    type: "spring",
                    damping: 25,
                    stiffness: 300,
                  }}
                  className="bg-white rounded-xl shadow-xl w-full max-w-xl max-h-[90vh] overflow-y-auto"
              >
                {/* Header */}
                <div className="flex items-center gap-3 border-b px-6 py-4 sticky top-0 bg-white z-10">
                  <Briefcase size={20} className="text-green-600" />
                  <h2 className="text-lg font-bold text-gray-800">Add Experience</h2>
                </div>

                <form onSubmit={handleSubmit}>
                  <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Company */}
                    <div className="space-y-2">
                      <Label>
                        Company <span className="text-red-500">*</span>
                      </Label>
                      <Input
                          value={form.company}
                          onChange={(e) =>
                              setForm((prev) => ({
                                ...prev,
                                company: e.target.value,
                              }))
                          }
                          placeholder="Enter company name"
                          required
                          disabled={isLoading || uploading}
                      />
                    </div>

                    {/* Job Title */}
                    <div className="space-y-2">
                      <Label>
                        Job Title <span className="text-red-500">*</span>
                      </Label>
                      <Input
                          value={form.posTitle}
                          onChange={(e) =>
                              setForm((prev) => ({
                                ...prev,
                                posTitle: e.target.value,
                              }))
                          }
                          placeholder="Enter job title"
                          required
                          disabled={isLoading || uploading}
                      />
                    </div>

                    {/* Start Date */}
                    <div className="space-y-2">
                      <Label>
                        Start Date <span className="text-red-500">*</span>
                      </Label>
                      <Input
                          type="date"
                          value={form.startDate}
                          onChange={(e) => handleStartDateChange(e.target.value)}
                          required
                          disabled={isLoading || uploading}
                      />
                    </div>

                    {/* End Date */}
                    <div className="space-y-2">
                      <Label>
                        End Date <span className="text-red-500">*</span>
                      </Label>
                      <Input
                          type="date"
                          value={form.endDate}
                          min={form.startDate ? form.startDate : undefined}
                          onChange={(e) => handleEndDateChange(e.target.value)}
                          required
                          disabled={isLoading || uploading}
                      />
                      {dateError && (
                          <p className="text-xs text-red-500 mt-1">{dateError}</p>
                      )}
                    </div>

                    {/* Location */}
                    <div className="space-y-2">
                      <Label>
                        Location <span className="text-red-500">*</span>
                      </Label>
                      <Input
                          value={form.location}
                          onChange={(e) =>
                              setForm((prev) => ({
                                ...prev,
                                location: e.target.value,
                              }))
                          }
                          placeholder="Enter work location"
                          required
                          disabled={isLoading || uploading}
                      />
                    </div>

                    {/* Responsibilities */}
                    <div className="space-y-2 md:col-span-2">
                      <Label>Responsibilities</Label>
                      <Textarea
                          value={form.respo}
                          onChange={(e) =>
                              setForm((prev) => ({
                                ...prev,
                                respo: e.target.value,
                              }))
                          }
                          placeholder="Describe your key responsibilities..."
                          rows={4}
                          disabled={isLoading || uploading}
                          className="resize-none"
                      />
                    </div>

                    {/* Experience Letter Upload */}
                    <div className="space-y-2 md:col-span-2">
                      <Label>Experience Letter / Document</Label>
                      <div className="flex items-center gap-3">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => document.getElementById('experience-letter-upload')?.click()}
                            disabled={isLoading || uploading || uploadedFiles.length >= 1}
                            className="relative"
                        >
                          {uploading ? (
                              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          ) : (
                              <Upload className="w-4 h-4 mr-2" />
                          )}
                          Upload Document
                          <input
                              id="experience-letter-upload"
                              type="file"
                              accept="image/*,application/pdf"
                              onChange={handleFileSelect}
                              className="hidden"
                              disabled={isLoading || uploading}
                          />
                        </Button>
                        {uploadedFiles.length > 0 && (
                            <span className="text-xs text-green-600">
                        {uploadedFiles.length} file(s) uploaded
                      </span>
                        )}
                      </div>

                      {/* Upload Error */}
                      {uploadError && (
                          <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                            <p className="text-sm text-red-600">{uploadError}</p>
                            <p className="text-xs text-red-400 mt-1">
                              You can still save the experience record without a document and upload it later.
                            </p>
                          </div>
                      )}

                      {/* Uploaded Files List */}
                      {uploadedFiles.length > 0 && (
                          <div className="mt-2 space-y-2">
                            {uploadedFiles.map((file) => (
                                <div
                                    key={file.id}
                                    className="flex items-center justify-between p-2 bg-gray-50 rounded-lg border border-gray-200"
                                >
                                  <div className="flex items-center gap-2 min-w-0">
                                    {getFileIcon(file)}
                                    <div className="min-w-0 flex-1">
                                      <p className="text-sm font-medium text-gray-800 truncate">
                                        {file.fileName || file.name}
                                      </p>
                                      <p className="text-xs text-gray-500">
                                        {formatFileSize(file.fileSize || file.size || 0)}
                                      </p>
                                    </div>
                                  </div>
                                  <Button
                                      type="button"
                                      variant="ghost"
                                      size="sm"
                                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                      onClick={() => handleFileRemove(file.id)}
                                      disabled={isLoading || uploading}
                                  >
                                    <X className="w-4 h-4" />
                                  </Button>
                                </div>
                            ))}
                          </div>
                      )}
                    </div>
                  </div>

                  {/* Footer */}
                  <div className="border-t px-6 py-4 bg-gray-50 rounded-b-xl flex justify-center gap-3">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={handleClose}
                        disabled={isLoading || uploading}
                    >
                      Cancel
                    </Button>
                    <Button
                        type="submit"
                        disabled={isLoading || uploading}
                        className="bg-green-600 hover:bg-green-700 text-white"
                    >
                      {isLoading ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                            Adding...
                          </>
                      ) : (
                          "Add Experience"
                      )}
                    </Button>
                  </div>
                </form>
              </motion.div>
            </motion.div>
        )}
      </AnimatePresence>
  );
};

export default AddExperienceModal;