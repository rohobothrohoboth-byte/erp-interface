import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Camera, Upload, User, CheckCircle, AlertCircle } from "lucide-react";
import { useLanguage } from "@/shared/i18n/LanguageContext";

interface ProfilePictureUploadProps {
  profilePicture: File | null;
  onProfilePictureSelect: (file: File) => void;
  onProfilePictureRemove: () => void;
  size?: "small" | "medium" | "large";
  maxSize?: number;
  acceptedTypes?: string[];
}

export const ProfilePictureUpload: React.FC<ProfilePictureUploadProps> = ({
                                                                            profilePicture,
                                                                            onProfilePictureSelect,
                                                                            onProfilePictureRemove,
                                                                            size = "medium",
                                                                            maxSize = 5,
                                                                            acceptedTypes = ["image/jpeg", "image/png", "image/jpg", "image/webp"],
                                                                          }) => {
  const { t } = useLanguage();
  const [isDragging, setIsDragging] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isHovering, setIsHovering] = useState(false);

  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  const sizeConfig = {
    small: {
      container: "w-28 h-28",
      icon: "w-5 h-5",
      text: "text-xs",
      removeButton: "-top-1 -right-1 p-0.5",
      fileName: "max-w-[100px] text-xs",
      badgeSize: "w-7 h-7",
      badgeIcon: "w-3.5 h-3.5",
    },
    medium: {
      container: "w-40 h-40",
      icon: "w-6 h-6",
      text: "text-sm",
      removeButton: "-top-2 -right-2 p-1",
      fileName: "max-w-[150px] text-sm",
      badgeSize: "w-8 h-8",
      badgeIcon: "w-4 h-4",
    },
    large: {
      container: "w-64 h-64",
      icon: "w-8 h-8",
      text: "text-base",
      removeButton: "-top-3 -right-3 p-1.5",
      fileName: "max-w-[220px] text-base",
      badgeSize: "w-10 h-10",
      badgeIcon: "w-5 h-5",
    },
  };

  const currentSize = sizeConfig[size];

  const validateFile = (file: File): boolean => {
    if (file.size > maxSize * 1024 * 1024) {
      setError(t.fileSizeExceeds ? `${t.fileSizeExceeds} ${maxSize}MB` : `File size exceeds ${maxSize}MB limit`);
      return false;
    }
    if (!acceptedTypes.includes(file.type)) {
      setError(t.unsupportedFileType ? `${t.unsupportedFileType} ${acceptedTypes.map(t => t.split('/').pop()?.toUpperCase()).join(', ')}` : `Unsupported file type. Please upload ${acceptedTypes.map(t => t.split('/').pop()?.toUpperCase()).join(', ')}`);
      return false;
    }
    setError(null);
    return true;
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && validateFile(file)) {
      onProfilePictureSelect(file);
      if (previewUrl) URL.revokeObjectURL(previewUrl);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file && validateFile(file)) {
      onProfilePictureSelect(file);
      if (previewUrl) URL.revokeObjectURL(previewUrl);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  };

  const handleRemove = () => {
    onProfilePictureRemove();
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    setPreviewUrl(null);
    setError(null);
  };

  return (
      <div className="flex flex-col items-center">
        <div className="relative">
          <label className="cursor-pointer block">
            <input type="file" className="hidden" accept={acceptedTypes.join(',')} onChange={handleFileChange} />
            <motion.div
                whileHover={{ scale: profilePicture ? 1.02 : 1.05 }}
                whileTap={{ scale: profilePicture ? 0.98 : 0.95 }}
                onMouseEnter={() => setIsHovering(true)}
                onMouseLeave={() => setIsHovering(false)}
                className={`relative ${currentSize.container} rounded-2xl transition-all duration-300 ${isDragging ? "border-emerald-500 bg-emerald-50/50 scale-105 shadow-lg" : profilePicture ? "border-emerald-200 bg-white shadow-sm" : "border-dashed border-slate-300 bg-gradient-to-br from-slate-50 to-gray-50 hover:border-emerald-400 hover:shadow-md"} overflow-hidden flex items-center justify-center border-2`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
            >
              {profilePicture && previewUrl ? (
                  <div className="relative w-full h-full group">
                    <img src={previewUrl} alt={t.profilePreview || "Profile preview"} className="w-full h-full object-cover" />
                    <div className={`absolute inset-0 bg-black/50 flex items-center justify-center transition-opacity duration-300 ${isHovering ? 'opacity-100' : 'opacity-0'}`}>
                      <Camera className="w-6 h-6 text-white" />
                    </div>
                  </div>
              ) : (
                  <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ duration: 0.3 }} className="flex flex-col items-center justify-center p-6 text-center">
                    {isDragging ? (
                        <Upload className={`${currentSize.icon} text-emerald-500 mb-3 animate-bounce`} />
                    ) : (
                        <div className="relative">
                          <div className="absolute inset-0 bg-gradient-to-r from-emerald-400 to-teal-400 rounded-full blur-xl opacity-20" />
                          <Camera className={`${currentSize.icon} text-slate-400 mb-3 relative`} />
                        </div>
                    )}
                    <p className={`${currentSize.text} font-medium text-slate-600`}>
                      {isDragging ? (t.dropToUpload || "Drop to upload") : (t.addPhoto || "Add Photo")}
                    </p>
                    {size === "large" && !isDragging && (
                        <p className="text-xs text-slate-400 mt-2">{t.clickOrDragAndDrop || "Click or drag & drop"}</p>
                    )}
                    {size === "large" && (
                        <p className="text-xs text-slate-400 mt-1">Max {maxSize}MB</p>
                    )}
                  </motion.div>
              )}
            </motion.div>
          </label>

          <AnimatePresence>
            {profilePicture && (
                <motion.div initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0, opacity: 0 }} className={`absolute ${currentSize.removeButton} bg-emerald-500 rounded-full shadow-lg z-10`}>
                  <CheckCircle className={`${currentSize.badgeIcon || "w-4 h-4"} text-white`} />
                </motion.div>
            )}
          </AnimatePresence>

          <AnimatePresence>
            {profilePicture && isHovering && (
                <motion.button
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0, opacity: 0 }}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    type="button"
                    onClick={handleRemove}
                    className={`absolute ${currentSize.removeButton} bg-gradient-to-r from-red-500 to-red-600 text-white rounded-full hover:shadow-lg transition-all duration-200 z-20`}
                >
                  <X className={currentSize.icon} />
                </motion.button>
            )}
          </AnimatePresence>
        </div>

        <AnimatePresence>
          {error && (
              <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="mt-3 flex items-center gap-2 text-red-600 text-sm">
                <AlertCircle className="w-4 h-4" />
                <span>{error}</span>
              </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {profilePicture && !error && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="mt-4 text-center w-full">
                <div className="bg-gradient-to-r from-emerald-50 to-teal-50 rounded-xl p-3 border border-emerald-100">
                  <div className="flex items-center justify-center gap-3">
                    <div className="p-1.5 bg-white rounded-lg shadow-sm">
                      <User className={`${currentSize.text === "text-xs" ? "w-3 h-3" : "w-4 h-4"} text-emerald-600`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`font-medium text-slate-800 truncate ${currentSize.fileName}`}>{profilePicture.name}</p>
                      <div className="flex items-center justify-center gap-2 mt-1">
                        <span className={`text-slate-500 ${size === "large" ? "text-xs" : "text-xs"}`}>{(profilePicture.size / 1024 / 1024).toFixed(2)} MB</span>
                        <span className="text-slate-300">•</span>
                        <span className={`text-slate-500 ${size === "large" ? "text-xs" : "text-xs"}`}>{profilePicture.type.split('/').pop()?.toUpperCase()}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
          )}
        </AnimatePresence>

        {!profilePicture && !error && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }} className="mt-3 text-center">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-slate-100 rounded-full">
                <Camera className="w-3 h-3 text-slate-500" />
                <span className="text-xs text-slate-500">
                  {acceptedTypes.map(t => t.split('/').pop()?.toUpperCase()).join(', ')} • Max {maxSize}MB
                </span>
              </div>
            </motion.div>
        )}
      </div>
  );
};