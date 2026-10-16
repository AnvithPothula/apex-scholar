import React from "react";
import { Button } from "../ui/UIComponents";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { format, addDays, addWeeks, addMonths, startOfWeek, endOfWeek } from "date-fns";

export default function CalendarHeader({ currentDate, onDateChange, viewMode, onViewModeChange }) {
  const navigateDate = (direction) => {
    const increment = direction === "prev" ? -1 : 1;
    
    let newDate;
    switch (viewMode) {
      case "day":
        newDate = addDays(currentDate, increment);
        break;
      case "week":
        newDate = addWeeks(currentDate, increment);
        break;
      case "month":
      default:
        newDate = addMonths(currentDate, increment);
        break;
    }
    onDateChange(newDate);
  };

  const getDateDisplay = () => {
    switch (viewMode) {
      case "day":
        return format(currentDate, "EEEE, MMMM d, yyyy");
      case "week": {
        // A week that crosses a month read as just one month ("October 2026").
        const a = startOfWeek(currentDate, { weekStartsOn: 1 });
        const b = endOfWeek(currentDate, { weekStartsOn: 1 });
        if (a.getFullYear() !== b.getFullYear()) return `${format(a, "MMM d, yyyy")} – ${format(b, "MMM d, yyyy")}`;
        return a.getMonth() === b.getMonth()
          ? `${format(a, "MMMM d")} – ${format(b, "d, yyyy")}`
          : `${format(a, "MMM d")} – ${format(b, "MMM d, yyyy")}`;
      }
      case "month":
        return format(currentDate, "MMMM yyyy");
      default:
        return format(currentDate, "MMMM yyyy");
    }
  };

  return (
    <div className="bg-base-900 border-b border-border p-4 md:p-6">
      <div className="flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Navigation */}
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="icon" onClick={() => navigateDate("prev")} aria-label={`Previous ${viewMode}`}>
            <ChevronLeft className="w-4 h-4" strokeWidth={1.5} />
          </Button>

          <Button variant="outline" onClick={() => onDateChange(new Date())}>
            Today
          </Button>

          <Button variant="outline" size="icon" onClick={() => navigateDate("next")} aria-label={`Next ${viewMode}`}>
            <ChevronRight className="w-4 h-4" strokeWidth={1.5} />
          </Button>

          <div className="text-lg md:text-2xl font-bold text-content-primary pl-4">
            {getDateDisplay()}
          </div>
        </div>

        {/* Note: the Week/Month view-mode selector lives on the SmartScheduler
            page header alongside the List option. Keeping the toggle in two
            places was just visual duplication. */}
      </div>
    </div>
  );
}