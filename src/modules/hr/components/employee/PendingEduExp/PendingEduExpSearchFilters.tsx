import { useState } from "react";
import { motion } from "framer-motion";
import { Search, Filter, X, Eye } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/shared/components/ui/select";
import { Label } from "@/shared/components/ui/label";
import ReviewModal from "@/modules/hr/components/employee/ReviewEmployee";


interface PendingEduExpFilters {
  gender: string;
}

interface SearchFiltersProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  filters: PendingEduExpFilters;
  setFilters: (filters: PendingEduExpFilters) => void;
  onRefresh: () => void;
  loading: boolean;
}

export default function PendingEduExpSearchFilters({
  searchTerm,
  setSearchTerm,
  filters,
  setFilters,
  // onRefresh,
  // loading,
}: SearchFiltersProps) {
  const [showFilters, setShowFilters] = useState(false);
  const hasActiveFilters = !!filters.gender;
  const [showReviewModal, setShowReviewModal] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-4"
    >
      {/* Search Bar */}
      <div className="flex gap-2 items-center justify-between">
        <div className="relative md:w-1/2">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search by name or code..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-[12px] bg-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
          />
        </div>
        {/* <Button
          variant="outline"
          size="sm"
          onClick={onRefresh}
          disabled={loading}
          className="h-10 px-3 gap-2 hover:bg-emerald-50"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          <span className="hidden sm:inline">Refresh</span>
        </Button> */}

        {/* <Button
          variant={hasActiveFilters ? "default" : "outline"}
          size="sm"
          onClick={() => setShowFilters(!showFilters)}
          className={`h-10 px-3 gap-2 ${
            hasActiveFilters
              ? "bg-emerald-600 hover:bg-emerald-700 text-white"
              : "hover:bg-emerald-50"
          }`}
        >
          <Filter className="w-4 h-4" />
          <span className="hidden sm:inline">Filter</span>

          {hasActiveFilters && (
            <span className="inline-flex items-center justify-center h-5 w-5 rounded-full bg-white/20 text-xs font-semibold ml-1">
              1
            </span>
          )}
        </Button> */}
      </div>

      {/* Filter Panel */}
      {/* {showFilters && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-1 gap-4 p-4 bg-gray-50 rounded-[12px] border border-gray-200"
        >
          <div className="flex flex-col gap-1">
            <Label className="text-xs font-medium text-gray-500">Gender</Label>

            <Select
              value={filters.gender || "__all__"}
              onValueChange={(value) =>
                setFilters({
                  gender: value === "__all__" ? "" : value,
                })
              }
            >
              <SelectTrigger size="sm" className="w-full">
                <SelectValue placeholder="All Genders" />
              </SelectTrigger>

              <SelectContent>
                <SelectItem value="__all__">All Genders</SelectItem>

                <SelectItem value="Male">Male</SelectItem>

                <SelectItem value="Female">Female</SelectItem>
              </SelectContent>
            </Select>
          </div>

        
          {hasActiveFilters && (
            <div className="flex justify-end">
              <Button
                variant="ghost"
                size="sm"
                onClick={() =>
                  setFilters({
                    gender: "",
                  })
                }
                className="text-red-600 hover:bg-red-50"
              >
                <X className="w-4 h-4 mr-2" />
                Clear Filters
              </Button>
            </div>
          )}
        </motion.div>
      )} */}
    </motion.div>
  );
}
