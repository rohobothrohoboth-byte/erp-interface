// src/components/ModulesSection.tsx
import React, { useState, useEffect } from "react";
import { useModuleStore } from "../stores/module.store";
import { useNavigate } from "react-router";
import { useLanguage } from "../i18n/LanguageContext";
import {
  Users,
  BarChart3,
  FileText,
  Package,
  ShoppingCart,
  CreditCard,
  Cpu,
  ChevronRight,
  ClipboardList,
  BriefcaseBusiness,
  LayoutGrid,
  Settings,
  Heart,
  DollarSign,
  Target,
  Folder,
} from "lucide-react";
import { BorderBeam } from "../components/ui/border-beam";
import { useAuthStore } from "../stores/auth.store";
import { authListApi } from "../services/List/auth/authList.api";

/* ================= TYPES ================= */

interface ModuleFromAPI {
  id: string;
  name: string;
  key: string;
  icon?: string;
  order?: number;
}

interface AllowedModule {
  label: string;
  key: string;
  path: string;
  icon: React.ReactNode;
  color: string;
}

interface ModuleCardProps {
  label: string;
  path: string;
  icon: React.ReactNode;
  color: string;
  moduleKey: string;
}

// Icon mapping from string to component
const ICON_MAP: Record<string, React.ReactNode> = {
  Settings: <Settings size={24} />,
  Users: <Users size={24} />,
  DollarSign: <DollarSign size={24} />,
  Package: <Package size={24} />,
  Heart: <Heart size={24} />,
  ShoppingCart: <ShoppingCart size={24} />,
  Target: <Target size={24} />,
  Briefcase: <BriefcaseBusiness size={24} />,
  Folder: <Folder size={24} />,
  BarChart: <BarChart3 size={24} />,
  CreditCard: <CreditCard size={24} />,
  Cpu: <Cpu size={24} />,
  ClipboardList: <ClipboardList size={24} />,
  LayoutGrid: <LayoutGrid size={24} />,
  FileText: <FileText size={24} />,
};

// Color mapping based on module key
const COLOR_MAP: Record<string, string> = {
  "mod.core": "from-gray-700 via-gray-600 to-gray-500",
  "mod.hrm": "from-blue-500 via-blue-400 to-cyan-400",
  "mod.fnm": "from-green-500 via-green-400 to-lime-400",
  "mod.inv": "from-amber-500 via-amber-400 to-orange-400",
  "mod.crm": "from-purple-500 via-purple-400 to-pink-400",
  "mod.pro": "from-rose-500 via-rose-400 to-red-400",
  "mod.pld": "from-indigo-600 via-indigo-500 to-sky-400",
  "mod.prm": "from-yellow-500 via-yellow-400 to-amber-300",
  "mod.flm": "from-emerald-500 via-emerald-400 to-teal-400",
  "mod.rpt": "from-slate-500 via-slate-400 to-gray-400",
};

// Path mapping based on module key
const PATH_MAP: Record<string, string> = {
  "mod.core": "/core",
  "mod.hrm": "/hr",
  "mod.fnm": "/finance",
  "mod.inv": "/inventory",
  "mod.crm": "/crm",
  "mod.pro": "/procurement",
  "mod.pld": "/plandev",
  "mod.prm": "/project-management",
  "mod.flm": "/file",
  "mod.rpt": "/reports",
};

// Label mapping based on module key
const LABEL_MAP: Record<string, string> = {
  "mod.core": "Core System",
  "mod.hrm": "HR Management",
  "mod.fnm": "Finance",
  "mod.inv": "Inventory",
  "mod.crm": "CRM",
  "mod.pro": "Procurement",
  "mod.pld": "Plan & Development",
  "mod.prm": "Project Management",
  "mod.flm": "File Management",
  "mod.rpt": "Reports & Analytics",
};

function getIconComponent(iconName?: string): React.ReactNode {
  if (iconName && ICON_MAP[iconName]) {
    return ICON_MAP[iconName];
  }
  return <LayoutGrid size={24} />;
}

/* ================= MODULE CARD ================= */

const ModuleCard: React.FC<ModuleCardProps> = ({
                                                 label,
                                                 path,
                                                 icon,
                                                 color,
                                                 moduleKey,
                                               }) => {
  const navigate = useNavigate();
  const setActiveModule = useModuleStore((s) => s.setActiveModule);
  const { t } = useLanguage();

  const handleClick = () => {
    setActiveModule(moduleKey);
    navigate(path);
  };

  const fromColor = color.split(" ")[0].replace("from-", "");
  const toColor = color.split(" ")[2]
      ? color.split(" ")[2].replace("to-", "")
      : color.split(" ")[1].replace("to-", "");

  return (
      <button
          onClick={handleClick}
          className={`
        relative group w-full
        rounded-2xl p-6
        transition-all duration-500 ease-out
        hover:scale-[1.05] hover:shadow-2xl
        active:scale-95
        flex flex-col items-center justify-center
        overflow-hidden
        bg-white
        border border-gray-200/50
        cursor-pointer
        shadow-md
      `}
      >
        <div className="absolute inset-0 bg-white rounded-2xl" />

        <div
            className={`
        absolute inset-0
        bg-gradient-to-br ${color}
        opacity-0 group-hover:opacity-100
        transition-all duration-500 ease-out
        rounded-2xl
      `}
        />

        <div
            className={`
        absolute inset-0
        bg-gradient-to-br ${color}
        opacity-0 group-hover:opacity-20
        blur-xl group-hover:blur-2xl
        transition-all duration-700 ease-out
        rounded-2xl
      `}
        />

        <BorderBeam
            duration={12}
            size={200}
            colorFrom={fromColor}
            colorTo={toColor}
        />

        <div
            className={`
        relative mb-5 p-4 rounded-xl
        ${color}
        bg-gradient-to-br
        transition-all duration-500 ease-out
        group-hover:scale-110 group-hover:rotate-3
        group-hover:bg-white
        group-hover:${fromColor}-600
        shadow-lg
        z-10
      `}
        >
          <div className="text-white text-2xl group-hover:text-white transition-colors duration-500">
            {icon}
          </div>
        </div>

        <h3
            className={`
        relative text-xl font-bold mb-3
        text-gray-800
        group-hover:text-white
        transition-all duration-500 ease-out
        group-hover:tracking-wide
        z-10
      `}
        >
          {label}
        </h3>

        <div className="relative flex items-center gap-2 text-sm font-medium opacity-0 group-hover:opacity-100 transition-all duration-500 ease-out z-10">
          <span className="text-white/90">{t.accessModule}</span>
          <ChevronRight className="w-4 h-4 text-white/90 group-hover:translate-x-1 transition-transform duration-300" />
        </div>

        <div className="absolute inset-0 opacity-0 group-hover:opacity-30 transition-opacity duration-700">
          {[...Array(15)].map((_, i) => (
              <div
                  key={i}
                  className="absolute w-1 h-1 bg-white/50 rounded-full"
                  style={{
                    left: `${Math.random() * 100}%`,
                    top: `${Math.random() * 100}%`,
                    animation: `float ${3 + Math.random() * 4}s ease-in-out infinite`,
                    animationDelay: `${Math.random() * 2}s`,
                  }}
              />
          ))}
        </div>
      </button>
  );
};

/* ================= MAIN COMPONENT ================= */

const ModulesSection: React.FC = () => {
  const { token, role, employeeId, permissions } = useAuthStore();
  const { t } = useLanguage();
  const [modules, setModules] = useState<ModuleFromAPI[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch modules from API
  useEffect(() => {
    const fetchModules = async () => {
      try {
        setLoading(true);
        const data = await authListApi.getAllModuleNames();
        console.log("Fetched modules:", data);
        setModules(data);
      } catch (error) {
        console.error("Failed to fetch modules:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchModules();
  }, []);

  const getAllowedModules = (): AllowedModule[] => {
    if (!token) return [];

    // Admin check - full access
    if (
        employeeId === "019d19c0-ae3e-78bd-bd2a-98d36bd6e078" ||
        role === "admin" ||
        role === "ceo" ||
        role === "vice.ceo" ||
        role === "auditor"
    ) {
      return modules
          .filter((mod) => mod.key && PATH_MAP[mod.key])
          .map((mod) => ({
            label: t[mod.key as keyof typeof t] as string || LABEL_MAP[mod.key] || mod.name,
            key: mod.key,
            path: PATH_MAP[mod.key] || "/",
            icon: getIconComponent(mod.icon),
            color: COLOR_MAP[mod.key] || "from-gray-500 via-gray-400 to-gray-300",
          }));
    }

    // Role-based access from permissions
    const parsedPermissions = permissions || [];
    const allowedModuleKeys = parsedPermissions.map((p: any) => p.key || p.K);

    return modules
        .filter(
            (mod) =>
                mod.key &&
                PATH_MAP[mod.key] &&
                allowedModuleKeys.includes(mod.key)
        )
        .map((mod) => ({
          label: t[mod.key as keyof typeof t] as string || LABEL_MAP[mod.key] || mod.name,
          key: mod.key,
          path: PATH_MAP[mod.key] || "/",
          icon: getIconComponent(mod.icon),
          color: COLOR_MAP[mod.key] || "from-gray-500 via-gray-400 to-gray-300",
        }));
  };

  const allowedModules: AllowedModule[] = getAllowedModules();

  // Loading state
  if (loading) {
    return (
        <div className="flex flex-col items-center justify-center h-full text-center p-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500 mb-4" />
          <p className="text-lg text-gray-600">{t.loadingModules}</p>
        </div>
    );
  }

  if (allowedModules.length === 0) {
    return (
        <div className="flex flex-col items-center justify-center h-full text-center p-8">
          <Cpu className="w-20 h-20 text-gray-400 mb-8" />
          <h2 className="text-3xl font-semibold text-gray-700 mb-4">{t.welcome}</h2>
          <p className="text-lg text-gray-600">
            {t.noModulesAssigned}
          </p>
        </div>
    );
  }

  // Sort modules by order from database
  const sortedModules = [...allowedModules].sort((a, b) => {
    const moduleA = modules.find(m => m.key === a.key);
    const moduleB = modules.find(m => m.key === b.key);
    return (moduleA?.order || 0) - (moduleB?.order || 0);
  });

  return (
      <div className="relative w-full h-full flex items-center justify-center p-4">
        <style>{`
        @keyframes float {
          0%,100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
      `}</style>

        <div className="relative grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 max-w-6xl w-full">
          {sortedModules.map((module, index) => {
            const { key, ...moduleProps } = module;
            return (
                <div
                    key={key}
                    className="relative animate-in fade-in slide-in-from-bottom-4 duration-700"
                    style={{
                      animationDelay: `${index * 150}ms`,
                      animationFillMode: "both",
                    }}
                >
                  <ModuleCard {...moduleProps} moduleKey={key} />
                </div>
            );
          })}
        </div>
      </div>
  );
};

export default ModulesSection;