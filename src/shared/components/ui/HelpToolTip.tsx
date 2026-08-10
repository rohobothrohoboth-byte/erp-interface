import { HelpCircle } from "lucide-react";

export default function HelpTooltip({ text }: { text: string }) {
  return (
    <div className="group relative inline-block ml-1">
      <HelpCircle className="w-3 h-3 text-gray-400 cursor-help" />
      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10">
        {text}
      </div>
    </div>
  );
}
