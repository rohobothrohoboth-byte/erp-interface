import { memo, useCallback, useRef, useState } from "react";
import {
  User,
  Briefcase,
  Shield,
  FileText,
  Heart,
  Users,
  ArrowLeft,
  KeyRound,
  Calendar,
  Book,
} from "lucide-react";
import { EmpPhotoRect } from "../ui/EmpPhoto";
import {
  useProfileInfo,
  useProfilePhoto,
} from "../../services/profile/profile.queries";
import { empStateColors } from "./shared";
import type { EmpPhotoRes } from "../../types/hr/employee/empPhoto";
import { useNavigate } from "react-router-dom";
import { Button } from "../ui/button";
import { motion } from "framer-motion";
import { Camera } from "lucide-react";
import { Input } from "../ui/input";
const TAB_ICONS: Record<string, React.ElementType> = {
  User,
  Briefcase,
  Shield,
  FileText,
  Heart,
  Users,
  KeyRound,
  Book,
};

export const PROFILE_TABS = [
  { id: "overview", label: "Overview", icon: "User" },
  { id: "basic", label: "Basic Info", icon: "Briefcase" },
  { id: "bio", label: "Biographical", icon: "FileText" },
  { id: "emergency", label: "Emergency Contact", icon: "Heart" },
  { id: "family", label: "Family", icon: "Users" },
  { id: "guarantor", label: "Guarantor", icon: "Shield" },
  { id: "password", label: "Change Password", icon: "KeyRound" },
  { id: "eduExp", label: "Education and Experiance", icon: "Book" },
];

// ── Hero — no activeTab prop, never re-renders on tab change ───────────────
const ProfileHero = memo(function ProfileHero() {
  const { data: info } = useProfileInfo();
  const { data: photoData } = useProfilePhoto();

  const photo: EmpPhotoRes | undefined = photoData
      ? {
        id: photoData.id,
        fileName: photoData.fileName,
        contentType: photoData.contentType,
        photoSize: photoData.photoSize,
        photo: photoData.photo,
      }
      : undefined;

  const stateKey = info?.empState
      ? (Object.entries(empStateColors).find(([, v]) =>
          v.includes(info.empState.toLowerCase().replace(/\s/g, "-")),
      )?.[0] ?? "0")
      : "0";

  const navigate = useNavigate();
  const handleBack = useCallback(() => {
    if (window.history.length > 1) navigate(-1);
    else navigate("/modules");
  }, [navigate]);
  const [selectedPhoto, setSelectedPhoto] = useState<File | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handlePhotoClick = () => {
    fileInputRef.current?.click();
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];

    if (!file) return;

    setSelectedPhoto(file);

    console.log("Selected file:", file);

    // Later:
    // updatePhotoMutation.mutate(file);
  };
  return (
      <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="relative rounded-2xl overflow-hidden mb-6 shadow-xl border border-slate-200"
      >
        {/* Gradient Background */}
        <div className="absolute inset-0 bg-white" />

        {/* Diagonal mesh grid */}
        <svg
            className="absolute inset-0 w-full h-full pointer-events-none"
            xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <pattern
                id="mesh"
                x="0"
                y="0"
                width="36"
                height="36"
                patternUnits="userSpaceOnUse"
                patternTransform="rotate(30)"
            >
              <line
                  x1="0"
                  y1="0"
                  x2="0"
                  y2="36"
                  stroke="#059669"
                  strokeWidth="1"
                  strokeOpacity="0.18"
              />
              <line
                  x1="0"
                  y1="0"
                  x2="36"
                  y2="0"
                  stroke="#059669"
                  strokeWidth="1"
                  strokeOpacity="0.18"
              />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#mesh)" />
        </svg>

        {/* Content */}
        <div className="relative z-10 px-8 py-6">
          {/* Back button */}
          <div>
            <button
                onClick={handleBack}
                aria-label="Go back"
                className="flex items-center gap-1.5 text-sm font-medium text-emerald-700 hover:text-emerald-900 border border-emerald-300 hover:border-emerald-500 bg-white/70 hover:bg-white px-3 py-1.5 rounded-lg transition-all duration-150 backdrop-blur-sm"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Back
            </button>
          </div>

          {/* Photo + info */}
          <div className="flex items-center justify-center gap-8 mt-5">
            <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.1, type: "spring", stiffness: 200 }}
                className="shrink-0"
            >
              <div className="flex flex-col items-center gap-3">
                {/* <div className="rounded-2xl overflow-hidden shadow-lg ring-2 ring-emerald-400/50 ring-offset-2 ring-offset-emerald-50">
                <EmpPhotoRect
                  width={116}
                  height={130}
                  photo={photo}
                  name={info?.fullName ?? ""}
                />
              </div> */}
                <div className="relative group rounded-2xl overflow-hidden shadow-lg ring-2 ring-emerald-400/50 ring-offset-2 ring-offset-emerald-50">
                  <EmpPhotoRect
                      width={116}
                      height={130}
                      photo={photo}
                      name={info?.fullName ?? ""}
                  />

                  {/* Hover Overlay */}
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center">
                    <button
                        type="button"
                        onClick={handlePhotoClick}
                        className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white text-emerald-700 shadow-md hover:bg-emerald-50"
                    >
                      <Camera className="w-4 h-4" />
                      Edit
                    </button>
                  </div>

                  {/* Hidden File Input */}
                  <Input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handlePhotoChange}
                  />
                </div>
                {info?.empState && (
                    <span
                        className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full border bg-white/90 backdrop-blur-sm ${empStateColors[stateKey]}`}
                    >
                  <span className="w-1.5 h-1.5 rounded-full bg-current opacity-80" />
                      {info.empState}
                </span>
                )}
              </div>{" "}
            </motion.div>

            <div className="min-w-0 -mt-8">
              <h1 className="text-2xl font-bold text-gray-900 tracking-tight leading-snug truncate flex justify-center items-center">
                {info?.fullName ?? (
                    <span className="inline-block h-7 w-44 bg-emerald-100 rounded-lg animate-pulse" />
                )}
              </h1>
              {info?.fullNameAm && (
                  <p className="text-sm text-gray-500 mt-0.5 truncate">
                    {info.fullNameAm}
                  </p>
              )}
              <p className="text-sm font-medium text-emerald-600 mt-1.5 truncate">
                {info?.position ?? (
                    <span className="inline-block h-4 w-28 bg-emerald-100 rounded animate-pulse" />
                )}
              </p>
            </div>
            {/* Quick Stats (Optional) */}
            <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.35 }}
                className="absolute right-10 bottom-0 -translate-y-1/2 hidden lg:block"
            >
              <div className="bg-white/80 backdrop-blur-sm rounded-xl px-4 py-3 border border-slate-200 shadow-sm">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-xs text-slate-500">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>Joined: {info?.joinedDate || "N/A"}</span>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </motion.div>
  );
});

// ── Tab bar — only re-renders when activeTab changes ───────────────────────
const ProfileTabBar = memo(function ProfileTabBar({
                                                    activeTab,
                                                    onTabChange,
                                                  }: {
  activeTab: string;
  onTabChange: (id: string) => void;
}) {
  return (
      <div className="pb-4">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-1.5">
          <nav className="flex items-center gap-1 overflow-x-auto ">
            {/* Main tabs */}
            {PROFILE_TABS.filter((t) => t.id !== "password").map(
                ({ id, label, icon }) => {
                  const Icon = TAB_ICONS[icon];
                  const active = activeTab === id;
                  return (
                      <button
                          key={id}
                          onClick={() => onTabChange(id)}
                          className={`flex items-center gap-2 py-2.5 px-4 rounded-xl text-sm font-medium transition-all duration-200 whitespace-nowrap ${
                              active
                                  ? "bg-emerald-50 border border-emerald-200 text-emerald-700 shadow-sm"
                                  : "text-gray-500 hover:text-emerald-700 hover:bg-emerald-50/60"
                          }`}
                      >
                        <Icon
                            className={`w-4 h-4 ${active ? "text-emerald-600" : "text-gray-400"}`}
                        />
                        {label}
                        {active && (
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 ml-0.5" />
                        )}
                      </button>
                  );
                },
            )}

            {/* Spacer */}
            <div className="flex-1" />

            {/* Change Password — pinned right */}
            {(() => {
              const tab = PROFILE_TABS.find((t) => t.id === "password")!;
              const Icon = TAB_ICONS[tab.icon];
              const active = activeTab === tab.id;
              return (
                  <Button
                      key={tab.id}
                      onClick={() => onTabChange(tab.id)}
                      className={`flex items-center gap-2 bg-linear-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white cursor-pointer${
                          active
                              ? "bg-emerald-50 border border-emerald-200 text-emerald-700 shadow-sm"
                              : "text-white  hover:bg-emerald-50/60"
                      }`}
                  >
                    <Icon
                        className={`w-4 h-4 ${active ? "text-emerald-600" : "text-white "}`}
                    />
                    {tab.label}
                    {active && (
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 ml-0.5" />
                    )}
                  </Button>
              );
            })()}
          </nav>
        </div>
      </div>
  );
});

// ── Public export ──────────────────────────────────────────────────────────
interface ProfileHeaderProps {
  activeTab: string;
  onTabChange: (id: string) => void;
}

export const ProfileHeader = memo(function ProfileHeader({
                                                           activeTab,
                                                           onTabChange,
                                                         }: ProfileHeaderProps) {
  return (
      <>
        <ProfileHero />
        <ProfileTabBar activeTab={activeTab} onTabChange={onTabChange} />
      </>
  );
});
