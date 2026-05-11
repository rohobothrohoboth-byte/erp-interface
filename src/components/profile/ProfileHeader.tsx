import { memo, useCallback } from "react";
import {
  User,
  Briefcase,
  Shield,
  FileText,
  Heart,
  Users,
  ArrowLeft,
  KeyRound,
} from "lucide-react";
import { EmpPhotoRect } from "../ui/EmpPhoto";
import {
  useProfileInfo,
  useProfilePhoto,
} from "../../services/profile/profile.queries";
import type { EmpPhotoRes } from "../../types/hr/employee/empPhoto";
import { useNavigate } from "react-router-dom";

const TAB_ICONS: Record<string, React.ElementType> = {
  User,
  Briefcase,
  Shield,
  FileText,
  Heart,
  Users,
  KeyRound,
};

export const PROFILE_TABS = [
  { id: "overview", label: "Overview", icon: "User" },
  { id: "basic", label: "Basic Info", icon: "Briefcase" },
  { id: "bio", label: "Biographical", icon: "FileText" },
  { id: "emergency", label: "Emergency Contact", icon: "Heart" },
  { id: "family", label: "Family", icon: "Users" },
  { id: "guarantor", label: "Guarantor", icon: "Shield" },
  { id: "password", label: "Change Password", icon: "KeyRound" },
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

  const navigate = useNavigate();
  const handleBack = useCallback(() => {
    if (window.history.length > 1) navigate(-1);
    else navigate("/modules");
  }, [navigate]);

  return (
    <div className="relative rounded-2xl border border-emerald-100 shadow-sm mb-4 px-8 py-6 overflow-hidden bg-gradient-to-br from-emerald-600 via-emerald-500 to-teal-400">
      {/* Decorative circles */}
      <div className="absolute -top-8 -right-8 w-40 h-40 rounded-full bg-white/10 pointer-events-none" />
      <div className="absolute -bottom-10 -left-6 w-52 h-52 rounded-full bg-white/5 pointer-events-none" />
      <div className="absolute top-4 right-32 w-16 h-16 rounded-full bg-white/10 pointer-events-none" />

      {/* Back button */}
      <div>
        <button
          onClick={handleBack}
          aria-label="Go back"
          className="flex items-center gap-1.5 text-sm font-medium text-white/80 hover:text-white border border-white/30 hover:border-white/50 bg-white/10 hover:bg-white/20 px-3 py-1.5 rounded-lg transition-all duration-150"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Back
        </button>
      </div>

      {/* Photo + info */}
      <div className="flex items-center justify-center gap-8 mt-5">
        <div className="shrink-0 flex flex-col items-center gap-3">
          <div className="rounded-2xl overflow-hidden shadow-lg ring-2 ring-white/40 ring-offset-2 ring-offset-emerald-500">
            <EmpPhotoRect
              width={116}
              height={130}
              photo={photo}
              name={info?.fullName ?? ""}
            />
          </div>
          {info?.empState && (
            <span
              className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full border bg-white/20 backdrop-blur-sm text-white border-white/30`}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-white opacity-80" />
              {info.empState}
            </span>
          )}
        </div>

        <div className="min-w-0 -mt-8">
          <h1 className="text-2xl font-bold text-white tracking-tight leading-snug truncate flex justify-center items-center">
            {info?.fullName ?? (
              <span className="inline-block h-7 w-44 bg-white/20 rounded-lg animate-pulse" />
            )}
          </h1>
          {info?.fullNameAm && (
            <p className="text-sm text-white/70 mt-0.5 truncate">
              {info.fullNameAm}
            </p>
          )}
          <p className="text-sm font-medium text-white/90 mt-1.5 truncate">
            {info?.position ?? (
              <span className="inline-block h-4 w-28 bg-white/20 rounded animate-pulse" />
            )}
          </p>
        </div>
      </div>
    </div>
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
        <nav className="flex items-center gap-1 overflow-x-auto scrollbar-none">
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
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                className={`flex items-center gap-2 py-2.5 px-4 rounded-xl text-sm font-medium transition-all duration-200 whitespace-nowrap ${
                  active
                    ? "bg-emerald-50 border border-emerald-200 text-emerald-700 shadow-sm"
                    : "text-gray-500 hover:text-emerald-700 hover:bg-emerald-50/60"
                }`}
              >
                <Icon
                  className={`w-4 h-4 ${active ? "text-emerald-600" : "text-gray-400"}`}
                />
                {tab.label}
                {active && (
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 ml-0.5" />
                )}
              </button>
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
