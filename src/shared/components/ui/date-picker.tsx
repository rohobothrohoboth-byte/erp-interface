import React from "react";
import { Calendar } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/shared/components/ui/popover";
import { cn } from "@/shared/lib/utils";

interface DateRange {
  from?: Date;
  to?: Date;
}

interface DatePickerWithRangeProps {
  date: DateRange | undefined;
  onDateChange: (range: DateRange | undefined) => void;
  placeholder?: string;
  className?: string;
}

export function DatePickerWithRange({
  date,
  onDateChange,
  placeholder = "Pick a date range",
  className,
}: DatePickerWithRangeProps) {
  const formatDateRange = (range: DateRange | undefined) => {
    if (!range?.from) return placeholder;
    if (!range.to) return range.from.toLocaleDateString();
    return `${range.from.toLocaleDateString()} - ${range.to.toLocaleDateString()}`;
  };

  return (
    <div className={cn("grid gap-2", className)}>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            id="date"
            variant="outline"
            className={cn(
              "w-[260px] justify-start text-left font-normal",
              !date && "text-muted-foreground",
            )}
          >
            <Calendar className="mr-2 h-4 w-4" />
            {formatDateRange(date)}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <div className="p-3">
            <p className="text-sm text-gray-600 mb-2">
              Select date range for filtering
            </p>
            <div className="flex space-x-2">
              <input
                type="date"
                className="px-3 py-2 border border-gray-300 rounded-md text-sm"
                onChange={(e) => {
                  const newDate = e.target.value
                    ? new Date(e.target.value)
                    : undefined;
                  onDateChange({ from: newDate, to: date?.to });
                }}
                value={date?.from ? date.from.toISOString().split("T")[0] : ""}
              />
              <input
                type="date"
                className="px-3 py-2 border border-gray-300 rounded-md text-sm"
                onChange={(e) => {
                  const newDate = e.target.value
                    ? new Date(e.target.value)
                    : undefined;
                  onDateChange({ from: date?.from, to: newDate });
                }}
                value={date?.to ? date.to.toISOString().split("T")[0] : ""}
              />
            </div>
            <div className="flex justify-end mt-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() => onDateChange(undefined)}
              >
                Clear
              </Button>
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}
