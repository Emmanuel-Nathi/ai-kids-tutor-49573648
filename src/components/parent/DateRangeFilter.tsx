import { format, subDays } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";

interface DateRange {
  from: Date | undefined;
  to: Date | undefined;
}

interface DateRangeFilterProps {
  dateRange: DateRange;
  onChange: (range: DateRange) => void;
}

const presets = [
  { label: "7 days", days: 7 },
  { label: "30 days", days: 30 },
  { label: "All time", days: 0 },
];

export function DateRangeFilter({ dateRange, onChange }: DateRangeFilterProps) {
  const applyPreset = (days: number) => {
    if (days === 0) {
      onChange({ from: undefined, to: undefined });
    } else {
      onChange({ from: subDays(new Date(), days), to: new Date() });
    }
  };

  return (
    <div className="flex flex-wrap items-center gap-2">
      {presets.map((p) => (
        <Button
          key={p.label}
          variant="outline"
          size="sm"
          className={cn(
            "text-xs",
            p.days === 0 && !dateRange.from && !dateRange.to && "bg-primary/10 border-primary text-primary",
            p.days > 0 && dateRange.from && Math.abs(subDays(new Date(), p.days).getTime() - dateRange.from.getTime()) < 86400000 && "bg-primary/10 border-primary text-primary"
          )}
          onClick={() => applyPreset(p.days)}
        >
          {p.label}
        </Button>
      ))}

      <Popover>
        <PopoverTrigger asChild>
          <Button variant="outline" size="sm" className="text-xs gap-1">
            <CalendarIcon className="w-3 h-3" />
            {dateRange.from ? format(dateRange.from, "MMM d") : "From"}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="single"
            selected={dateRange.from}
            onSelect={(d) => onChange({ ...dateRange, from: d })}
            disabled={(d) => d > new Date()}
            initialFocus
            className="p-3 pointer-events-auto"
          />
        </PopoverContent>
      </Popover>

      <span className="text-xs text-muted-foreground">–</span>

      <Popover>
        <PopoverTrigger asChild>
          <Button variant="outline" size="sm" className="text-xs gap-1">
            <CalendarIcon className="w-3 h-3" />
            {dateRange.to ? format(dateRange.to, "MMM d") : "To"}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="single"
            selected={dateRange.to}
            onSelect={(d) => onChange({ ...dateRange, to: d })}
            disabled={(d) => d > new Date()}
            initialFocus
            className="p-3 pointer-events-auto"
          />
        </PopoverContent>
      </Popover>
    </div>
  );
}
