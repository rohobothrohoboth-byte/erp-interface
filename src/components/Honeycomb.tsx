import { useNavigate } from 'react-router-dom';
import './Honeycomb.css';
import { useModuleStore } from '../stores/module.store';

const modules = [
  { label: "HR", color: "group-hover:from-green-400 group-hover:to-green-600", path: "/hr" },
  { label: "CRM", color: "group-hover:from-orange-300 group-hover:to-orange-500", path: "/crm" },
  { label: "File", color: "group-hover:from-emerald-300 group-hover:to-emerald-500", path: "/file" },
  { label: "Inventory", color: "group-hover:from-yellow-300 group-hover:to-yellow-500", path: "/inventory" },
  { label: "Procurement", color: "group-hover:from-purple-300 group-hover:to-purple-500", path: "/procurement" },
  { label: "Finance", color: "group-hover:from-indigo-800 group-hover:to-indigo-500", path: "/finance" },
  { label: "Logo", color: "", path: "/core" }, 
];

const positions = [
  "-translate-x-[120px] translate-y-0",
  "-translate-x-[60px] translate-y-[104px]",
  "translate-x-[60px] translate-y-[104px]",
  "translate-x-[120px] translate-y-0",
  "translate-x-[60px] -translate-y-[104px]",
  "-translate-x-[60px] -translate-y-[104px]",
  "translate-x-0 translate-y-0",
];

interface HoneycombProps {
  onModuleSelect?: (moduleName: string) => void;
}

export default function Honeycomb({ onModuleSelect }: HoneycombProps) {
  const navigate = useNavigate();
  const setActiveModule = useModuleStore((s) => s.setActiveModule);

  const handleModuleClick = (module: typeof modules[0]) => {
    const moduleName = module.label === "Logo" ? "Core" : module.label;
        setActiveModule(moduleName);
        document.title = `RST | ${moduleName}`;
        if (onModuleSelect) {
      onModuleSelect(moduleName);
    }
        if (module.path) {
      navigate(module.path);
    }
  };

  return (
    <section className="flex items-center justify-center h-full w-full">
      <div className="relative w-full max-w-[90vmin] h-[90vmin] flex items-center justify-center">
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="bg-gradient-to-r from-blue-400 to-blue-600 blur-[10vmin] opacity-20 rounded-full w-[60%] h-[60%] animate-pulse" />
        </div>

        {modules.map((mod, i) => (
          <div
            key={mod.label}
            className={`absolute transform -translate-x-1/2 -translate-y-1/2 ${positions[i]} group cursor-pointer transition-all duration-300`}
            style={{
              width: 'clamp(68px, 15.5vmin, 125px)',
              height: 'clamp(68px, 15.5vmin, 125px)',
              animation: `honeycomb 2.1s ease forwards`,
              animationDelay: `${i * 0.1}s`,
              opacity: 0, 
            }}
            onClick={() => handleModuleClick(mod)}
          >
            <div
              className={`
                hexagon
                flex items-center justify-center
                w-full h-full
                font-semibold text-center px-2
                shadow-xl
                transition-all duration-300
                bg-white
                ${mod.color ? `group-hover:bg-gradient-to-r ${mod.color} group-hover:text-white` : ""}
              `}
            >
              {mod.label === "Logo" ? (
                <img
                  src="/bda-logo-1.png"
                  alt="Company Logo"
                  className="w-[80%] h-[80%] object-contain"
                />
              ) : (
                mod.label
              )}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}