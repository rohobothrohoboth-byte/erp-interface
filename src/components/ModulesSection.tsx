import React from "react";
import { useModule } from "../ModuleContext";
import { useNavigate } from "react-router";
import {
  Users,
  BarChart3,
  FileText,
  Package,
  ShoppingCart,
  CreditCard,
  Cpu,
  ChevronRight,
} from "lucide-react";
import { BorderBeam } from "../components/ui/border-beam";
import { hasRole } from "../utils/jwt.utils";
import { jwtDecode } from "jwt-decode";

/* ================= TYPES ================= */

interface BackendModule {
  K: string;
  L: string;
  M: any[];
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

/* ================= MODULE CARD (UNCHANGED UI) ================= */

const ModuleCard: React.FC<ModuleCardProps> = ({
  label,
  path,
  icon,
  color,
  moduleKey,
}) => {
  const navigate = useNavigate();
  const { setActiveModule } = useModule();

  const handleClick = () => {
    setActiveModule(moduleKey); // ✅ FIXED
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
        <span className="text-white/90">Access Module</span>
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
  const getCookie = (name: string): string => {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    return parts.length === 2 ? parts.pop()?.split(";").shift() || "" : "";
  };

  const token = getCookie("accessToken") || getCookie("access_token") || "";

  const parsePermissions = (): BackendModule[] => {
    if (!token) return [];

    try {
      const decoded: any = jwtDecode(token);
      return JSON.parse(decoded.permissions || "[]");
    } catch (e) {
      console.error("Permission parse error", e);
      return [];
    }
  };

  const ALL_MODULES: AllowedModule[] = [
    {
      label: "HR",
      key: "mod.hrm",
      path: "/hr",
      icon: <Users size={24} />,
      color: "from-blue-500 via-blue-400 to-cyan-400",
    },
    {
      label: "CRM",
      key: "mod.crm",
      path: "/crm",
      icon: <BarChart3 size={24} />,
      color: "from-purple-500 via-purple-400 to-pink-400",
    },
    {
      label: "File",
      key: "mod.flm",
      path: "/file",
      icon: <FileText size={24} />,
      color: "from-emerald-500 via-emerald-400 to-teal-400",
    },
    {
      label: "Inventory",
      key: "mod.inv",
      path: "/inventory",
      icon: <Package size={24} />,
      color: "from-amber-500 via-amber-400 to-orange-400",
    },
    {
      label: "Procurement",
      key: "mod.pro",
      path: "/procurement",
      icon: <ShoppingCart size={24} />,
      color: "from-rose-500 via-rose-400 to-red-400",
    },
    {
      label: "Finance",
      key: "mod.fnm",
      path: "/finance",
      icon: <CreditCard size={24} />,
      color: "from-green-500 via-green-400 to-lime-400",
    },
    {
      label: "Core",
      key: "mod.core",
      path: "/core",
      icon: <Cpu size={24} />,
      color: "from-gray-700 via-gray-600 to-gray-500",
    },
  ];

  const getAllowedModules = (): AllowedModule[] => {
    if (!token) return [];

    // Specific employee override — full admin access
    try {
      const decoded: any = jwtDecode(token);
      if (decoded.employeeId === '019d19c0-ae3e-78bd-bd2a-98d36bd6e078') {
        return ALL_MODULES;
      }
    } catch { /* ignore */ }

    if (
      hasRole(token, "admin") ||
      hasRole(token, "ceo") ||
      hasRole(token, "vice.ceo") ||
      hasRole(token, "auditor")
    ) {
      return ALL_MODULES;
    }

    const perms = parsePermissions();

    return perms.map((mod) => ({
      label: mod.L,
      key: mod.K,
      path: `/${mod.K.replace("mod.", "")}`,
      icon: <BarChart3 size={24} />,
      color: "from-purple-500 via-purple-400 to-pink-400",
    }));
  };

  const allowedModules: AllowedModule[] = getAllowedModules();

  if (allowedModules.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center p-8">
        <Cpu className="w-20 h-20 text-gray-400 mb-8" />
        <h2 className="text-3xl font-semibold text-gray-700 mb-4">Welcome!</h2>
        <p className="text-lg text-gray-600">
          No modules are currently assigned to your role.
        </p>
      </div>
    );
  }

  return (
    <div className="relative w-full h-full flex items-center justify-center p-4">
      <style>{`
        @keyframes float {
          0%,100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
      `}</style>

      <div className="relative grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 max-w-6xl w-full">
        {allowedModules.map((module, index) => (
          <div
            key={module.key}
            className="relative animate-in fade-in slide-in-from-bottom-4 duration-700"
            style={{
              animationDelay: `${index * 150}ms`,
              animationFillMode: "both",
            }}
          >
            <ModuleCard {...module} moduleKey={module.key} />
          </div>
        ))}
      </div>
    </div>
  );
};

export default ModulesSection;
