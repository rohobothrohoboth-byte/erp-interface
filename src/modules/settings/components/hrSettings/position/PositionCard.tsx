import React, { useState, useRef } from "react";
import {
  Users,
  Building,
  MoreVertical,
  Edit,
  Trash2,
  ArrowRight,
} from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import type { PositionListDto } from "@/modules/hr/types/position";
import { useNavigate } from "react-router-dom";

interface PositionCardProps {
  position: PositionListDto;
  expanded: boolean;
  onToggleExpand: () => void;
  viewMode: "grid" | "list";
  onEdit: (position: PositionListDto) => void;
  onDelete: (position: PositionListDto) => void;
}

const PositionCard: React.FC<PositionCardProps> = ({
  position,
  viewMode,
  onEdit,
  onDelete,
}) => {
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  // Close menu when clicking outside
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowMenu(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent card click when editing
    setShowMenu(false);
    onEdit(position);
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent card click when deleting
    setShowMenu(false);
    onDelete(position);
  };

  // Navigate to position details page with the 4 sub-cards
  const handleCardClick = () => {
    navigate(`/settings/hr/position/${position.id}`, {
      state: { position },
    });
  };

  const handleMenuClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent card click when opening menu
    setShowMenu(!showMenu);
  };

  return (
    <div
      onClick={handleCardClick}
      className={`bg-white border border-green-100 rounded-xl shadow-sm hover:shadow-md transition-shadow relative cursor-pointer group ${
        viewMode === "grid" ? "p-5" : "p-4 flex items-start"
      }`}
    >
      {viewMode === "grid" ? (
        <>
          {/* Header Section with proper spacing */}
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-start flex-1 min-w-0">
              <div className="p-3 rounded-full bg-green-50 mr-4 flex-shrink-0">
                <Users className="text-green-600" size={24} />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-lg font-bold text-black truncate">
                  {position.name}
                </h3>
                <p className="text-sm text-gray-600 mt-1 truncate">
                  {position.nameAm}
                </p>
              </div>
            </div>

            {/* Right side with menu only - removed vacancy badge */}
            <div className="flex items-center gap-3 ml-4 flex-shrink-0">
              {/* More Options Menu */}
              <div ref={menuRef}>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0 text-gray-400 hover:text-gray-600 hover:bg-gray-100 cursor-pointer"
                  onClick={handleMenuClick}
                >
                  <MoreVertical className="h-4 w-4" />
                </Button>

                {showMenu && (
                  <div className="absolute right-0 top-8 w-40 bg-white border border-gray-200 rounded-lg shadow-lg z-10 py-1">
                    <button
                      className="w-full flex items-center px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 cursor-pointer"
                      onClick={handleEdit}
                    >
                      <Edit className="h-4 w-4 mr-2" />
                      Edit
                    </button>
                    <button
                      className="w-full flex items-center px-3 py-2 text-sm text-red-600 hover:bg-red-50 cursor-pointer"
                      onClick={handleDelete}
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Position Information */}
          <div className="space-y-3 text-sm">
            <div className="bg-green-50 p-3 rounded-lg">
              <p className="font-medium text-green-800 mb-2">
                Position Details
              </p>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Number of Positions:</span>
                  <span className="font-semibold">{position.noOfPosition}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Department:</span>
                  <span className="font-semibold text-sm truncate max-w-[120px]">
                    {position.department}
                  </span>
                </div>
                <div className="flex justify-between border-t border-green-200 pt-2 mt-2">
                  <span className="text-gray-600 font-medium">Is Vacant?</span>
                  <span
                    className={`font-bold ${
                      position.isVacant === "1"
                        ? "text-green-600"
                        : "text-gray-600"
                    }`}
                  >
                    {position.isVacantStr}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </>
      ) : (
        // List View
        <>
          <div className="p-2 rounded-md bg-green-50 mr-4 flex-shrink-0">
            <Users className="text-green-600" size={20} />
          </div>
          <div className="flex-1 min-w-0">
            {/* Header for list view */}
            <div className="flex justify-between items-start mb-3">
              <div className="flex-1 min-w-0 mr-4">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-bold text-black truncate flex-1">
                    {position.name}
                  </h3>
                </div>
                <p className="text-sm text-gray-600 mb-2 truncate">
                  {position.nameAm}
                </p>
                <div className="flex items-center text-sm text-gray-500 mb-2">
                  <Building className="h-4 w-4 mr-1 flex-shrink-0" />
                  <span className="truncate">{position.department}</span>
                </div>
              </div>

              {/* Right side with menu and arrow - removed vacancy badge */}
              <div className="flex items-center gap-3 flex-shrink-0">
                {/* More Options Menu */}
                <div ref={menuRef}>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0 text-gray-400 hover:text-gray-600 hover:bg-gray-100 cursor-pointer"
                    onClick={handleMenuClick}
                  >
                    <MoreVertical className="h-4 w-4" />
                  </Button>

                  {showMenu && (
                    <div className="absolute right-0 top-8 w-40 bg-white border border-gray-200 rounded-lg shadow-lg z-10 py-1">
                      <button
                        className="w-full flex items-center px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 cursor-pointer"
                        onClick={handleEdit}
                      >
                        <Edit className="h-4 w-4 mr-2" />
                        Edit
                      </button>
                      <button
                        className="w-full flex items-center px-3 py-2 text-sm text-red-600 hover:bg-red-50 cursor-pointer"
                        onClick={handleDelete}
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete
                      </button>
                    </div>
                  )}
                </div>

                <ArrowRight className="h-4 w-4 text-green-500" />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4 text-sm text-gray-700">
              <div>
                <p className="text-xs text-gray-500">Positions</p>
                <p className="font-semibold">{position.noOfPosition}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Department</p>
                <p className="font-semibold truncate">{position.department}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Status</p>
                <p
                  className={`font-semibold ${
                    position.isVacant === "1"
                      ? "text-green-600"
                      : "text-gray-600"
                  }`}
                >
                  {position.isVacantStr}
                </p>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default PositionCard;
