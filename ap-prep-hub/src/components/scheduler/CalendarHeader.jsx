import React from "react";
import { Button } from "../ui/UIComponents";
import { ChevronLeft, ChevronRight, Calendar, Grid, List, Clock } from "lucide-react";
import { format, addDays, addWeeks, addMonths, subDays, subWeeks, subMonths } from "date-fns";

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
      case "week":
        return format(currentDate, "MMMM yyyy");
      case "month":
        return format(currentDate, "MMMM yyyy");
      default:
        return format(currentDate, "MMMM yyyy");
    }
  };

  const viewModeIcons = {
    day: Clock,
    week: List,
    month: Grid
  };

  return (
    <div data-filename="pages/ViewCode" data-linenumber="1255" data-visual-selector-id="pages/ViewCode1255" className="bg-base-900 border-b border-border p-4 md:p-6">
      <div data-filename="pages/ViewCode" data-linenumber="1256" data-visual-selector-id="pages/ViewCode1256" className="flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Navigation */}
        <div data-filename="pages/ViewCode" data-linenumber="1258" data-visual-selector-id="pages/ViewCode1258" className="flex items-center space-x-2">
          <Button data-filename="pages/ViewCode" data-linenumber="1259" data-visual-selector-id="pages/ViewCode1259" variant="outline" size="icon" onClick={() => navigateDate("prev")}>
            <ChevronLeft data-filename="pages/ViewCode" data-linenumber="1260" data-visual-selector-id="pages/ViewCode1260" className="w-4 h-4" strokeWidth={1.5} />
          </Button>
          
          <Button data-filename="pages/ViewCode" data-linenumber="1263" data-visual-selector-id="pages/ViewCode1263" variant="outline" onClick={() => onDateChange(new Date())}>
            Today
          </Button>
          
          <Button data-filename="pages/ViewCode" data-linenumber="1267" data-visual-selector-id="pages/ViewCode1267" variant="outline" size="icon" onClick={() => navigateDate("next")}>
            <ChevronRight data-filename="pages/ViewCode" data-linenumber="1268" data-visual-selector-id="pages/ViewCode1268" className="w-4 h-4" strokeWidth={1.5} />
          </Button>
          
          <div data-filename="pages/ViewCode" data-linenumber="1271" data-visual-selector-id="pages/ViewCode1271" className="text-lg md:text-2xl font-bold text-content-primary pl-4">
            {getDateDisplay()}
          </div>
        </div>

        {/* View Mode Selector */}
        <div data-filename="pages/ViewCode" data-linenumber="1277" data-visual-selector-id="pages/ViewCode1277" className="flex items-center space-x-1 bg-base-800 p-1 rounded-sm">
          {["week", "month"].map((mode) => {
            const Icon = viewModeIcons[mode];
            return (
              <Button
                key={mode}
                variant={viewMode === mode ? "secondary" : "ghost"}
                size="sm"
                onClick={() => onViewModeChange(mode)}
                className={`${
                  viewMode === mode
                    ? "bg-base-750 text-content-primary"
                    : "text-content-muted hover:text-content-primary hover:bg-base-800/50"
                }`}
              >
                <Icon data-filename="pages/ViewCode" data-linenumber="1292" data-visual-selector-id="pages/ViewCode1292" className="w-4 h-4 mr-2" strokeWidth={1.5} />
                {mode.charAt(0).toUpperCase() + mode.slice(1)}
              </Button>
            );
          })}
        </div>
      </div>
    </div>
  );
}