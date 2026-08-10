import { memo, useState, useCallback, lazy, Suspense, useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router";
import { Toaster } from "react-hot-toast";
import { Bell, Briefcase, LogOut, User } from "lucide-react";
import { ProfileHeader } from "@/modules/profile/components/ProfileHeader";
import { ProfileSkeleton } from "@/modules/profile/components/ProfileLoadState";
import { ChangePasswordModal } from "@/modules/profile/components/ChangePasswordModal";
import { profileKeys } from "@/modules/profile/services/profile.keys";
import { profileApi } from "@/modules/profile/services/profile.api";
import { useAuthStore } from "@/shared/stores/auth.store";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/shared/components/ui/dropdown-menu";
import { EmpPhotoCircle } from "@/shared/components/ui/EmpPhoto";
import type { EmpPhotoRes } from "@/modules/hr/types/employee/empPhoto";

const STALE = 5 * 60 * 1000;

const OverviewTab = lazy(() =>
    import("@/modules/profile/components/OverviewTab").then((m) => ({
        default: m.OverviewTab,
    })),
);
const BasicInfoTab = lazy(() =>
    import("@/modules/profile/components/BasicInfoTab").then((m) => ({
        default: m.BasicInfoTab,
    })),
);
const BiographicalTab = lazy(() =>
    import("@/modules/profile/components/BiographicalTab").then((m) => ({
        default: m.BiographicalTab,
    })),
);
const EmergencyTab = lazy(() =>
    import("@/modules/profile/components/EmergencyTab").then((m) => ({
        default: m.EmergencyTab,
    })),
);
const FamilyTab = lazy(() =>
    import("@/modules/profile/components/FamilyTab").then((m) => ({
        default: m.FamilyTab,
    })),
);
const GuarantorTab = lazy(() =>
    import("@/modules/profile/components/GuarantorTab").then((m) => ({
        default: m.GuarantorTab,
    })),
);
const EduExpTab = lazy(() => import("@/modules/profile/components/EduExpTab"));
const TAB_MAP: Record<string, React.ComponentType> = {
    overview: OverviewTab,
    basic: BasicInfoTab,
    bio: BiographicalTab,
    emergency: EmergencyTab,
    family: FamilyTab,
    guarantor: GuarantorTab,
    eduExp: EduExpTab,
};

const TabFallback = () => (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        {Array.from({ length: 4 }).map((_, i) => (
            <ProfileSkeleton key={i} rows={3} />
        ))}
    </div>
);

function ProfilePage() {
    const [activeTab, setActiveTab] = useState("overview");
    const [pwdModalOpen, setPwdModalOpen] = useState(false);
    const queryClient = useQueryClient();
    const navigate = useNavigate();
    const { logout, userName } = useAuthStore();

    const handleLogout = () => {
        logout();
        navigate("/login", { replace: true });
    };

    const DEMO_PHOTO: EmpPhotoRes = {
        id: "demo-id",
        fileName: "demo.png",
        contentType: "image/png",
        photoSize: "1 KB",
        photo: "https://github.com/shadcn.png",
    };

    useEffect(() => {
        const opts = (fn: () => Promise<unknown>, key: readonly unknown[]) => ({
            queryKey: key,
            queryFn: fn,
            staleTime: STALE,
        });

        queryClient.prefetchQuery(opts(profileApi.getInfo, profileKeys.info()));
        queryClient.prefetchQuery(opts(profileApi.getPhoto, profileKeys.photo()));
        queryClient.prefetchQuery(opts(profileApi.getCard, profileKeys.card()));
        queryClient.prefetchQuery(opts(profileApi.getBasic, profileKeys.basic()));
        queryClient.prefetchQuery(opts(profileApi.getBio, profileKeys.bio()));
        queryClient.prefetchQuery(
            opts(profileApi.getEmContact, profileKeys.emContact()),
        );
        queryClient.prefetchQuery(opts(profileApi.getFamily, profileKeys.family()));
        queryClient.prefetchQuery(
            opts(profileApi.getLeaveBalance, profileKeys.leaveBalance()),
        );
    }, [queryClient]);

    const handleTabChange = useCallback((id: string) => {
        if (id === "password") {
            setPwdModalOpen(true);
            return;
        }
        setActiveTab(id);
    }, []);

    const ActiveTab = TAB_MAP[activeTab] ?? OverviewTab;

    return (
        <div className="min-h-screen bg-gray-50 overflow-y-auto h-full">
            {/* Fixed toaster for profile page — not affected by scroll */}
            <Toaster
                position="top-right"
                gutter={12}
                toastOptions={{
                    duration: 3000,
                    success: {
                        style: { background: "#10b981", color: "#fff" },
                        iconTheme: { primary: "#fff", secondary: "#10b981" },
                    },
                    error: {
                        duration: 5000,
                        iconTheme: { primary: "#ef4444", secondary: "#fff" },
                    },
                }}
            />

            {/* Header — same style as Modules page */}
            <div className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur border-b border-white/20 shadow-sm py-2">
                <div className="container mx-auto px-4">
                    <div className="flex items-center justify-between gap-3">
                        {/* Logo & back */}
                        <div className="flex items-center gap-3">
                            <div className="relative">
                                <div className="absolute inset-0 bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl blur-md opacity-50" />
                                <div className="relative w-10 h-10 bg-gradient-to-br from-blue-100 to-blue-200 rounded-xl flex items-center justify-center shadow-xs">
                                    <Briefcase className="w-5 h-5 text-blue-500" />
                                </div>
                            </div>
                            <div>
                                <h1 className="text-xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
                                    RST
                                </h1>
                                <p className="text-xs text-slate-400 hidden sm:block">
                                    Enterprise Resource Planning
                                </p>
                            </div>
                        </div>

                        {/* Right side */}
                        <div className="flex items-center gap-2 shrink-0">
                            {/* Notification bell */}
                            <button className="p-2 rounded-full hover:bg-gray-100 transition-colors relative">
                                <Bell className="h-5 w-5 text-gray-600" />
                                <span className="absolute -top-0.5 -right-0.5 flex">
                  <span className="absolute inline-flex h-4 w-4 rounded-full bg-red-400 opacity-75 animate-ping" />
                  <span className="relative min-w-4 h-4 px-1 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                    3
                  </span>
                </span>
                            </button>

                            <DropdownMenu>
                                <DropdownMenuTrigger>
                                    <EmpPhotoCircle
                                        photo={DEMO_PHOTO}
                                        size={32}
                                        name={userName || undefined}
                                    />
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                    <DropdownMenuLabel>My Account</DropdownMenuLabel>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem
                                        className="rounded-lg cursor-pointer"
                                        disabled
                                    >
                                        <User className="w-4 h-4 mr-2" />
                                        <span>{userName || "Profile"}</span>
                                    </DropdownMenuItem>
                                    <DropdownMenuItem
                                        onClick={handleLogout}
                                        className="rounded-lg cursor-pointer text-red-600 focus:text-red-600"
                                    >
                                        <LogOut className="w-4 h-4 mr-2" />
                                        <span>Logout</span>
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>
                    </div>
                </div>
            </div>

            {/* Page content pushed below fixed header */}
            <div className="pt-16 px-8 py-4 pb-8">
                <ProfileHeader activeTab={activeTab} onTabChange={handleTabChange} />
                <Suspense fallback={<TabFallback />}>
                    <ActiveTab />
                </Suspense>
                <ChangePasswordModal
                    open={pwdModalOpen}
                    onClose={() => setPwdModalOpen(false)}
                />
            </div>
        </div>
    );
}

export default memo(ProfilePage);
