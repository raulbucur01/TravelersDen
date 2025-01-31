"use client";

import * as React from "react";
import { format } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";
import { DateRange } from "react-day-picker";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface DatePickerWithRangeProps {
  className?: string;
  onChange: (date: DateRange | undefined) => void;
}

export function DatePickerWithRange({
  className,
  onChange,
}: DatePickerWithRangeProps) {
  const [date, setDate] = React.useState<DateRange | undefined>({
    from: new Date(),
    to: new Date(),
  });

  const handleDateChange = (selectedDate: DateRange | undefined) => {
    if (selectedDate) {
      const normalizedFrom = selectedDate.from
        ? new Date(selectedDate.from.setHours(10, 0, 0, 0))
        : undefined;
      const normalizedTo = selectedDate.to
        ? new Date(selectedDate.to.setHours(23, 59, 59, 999)) // Optional: keep `to` at end of day
        : undefined;

      const normalizedDateRange = { from: normalizedFrom, to: normalizedTo };

      setDate(normalizedDateRange);
      onChange(normalizedDateRange); // Invoke onChange with the corrected range
    } else {
      setDate(undefined);
      onChange(undefined);
    }
  };

  return (
    <div className={cn("grid gap-2", className)}>
      <Popover>
        <PopoverTrigger asChild className="bg-dm-dark">
          <Button
            id="date"
            variant={"outline"}
            className={cn(
              "w-[300px] justify-start text-left font-normal hover:bg-dm-secondary",
              !date && "text-muted-foreground"
            )}
          >
            <CalendarIcon />
            {date?.from ? (
              date.to ? (
                <>
                  {format(date.from, "LLL dd, y")} -{" "}
                  {format(date.to, "LLL dd, y")}
                </>
              ) : (
                format(date.from, "LLL dd, y")
              )
            ) : (
              <span>Pick a date</span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0 bg-dm-dark-2" align="start">
          <Calendar
            initialFocus
            mode="range"
            defaultMonth={date?.from}
            selected={date}
            onSelect={handleDateChange}
            numberOfMonths={1}
            className="bg-dm-dark-1"
            classNames={{
              day_selected: "bg-dm-secondary text-white text-lg",
              day_today: "bg-dm-dark-4 text-white",
              nav_button_previous: "absolute left-1 hover:bg-dm-secondary",
              nav_button_next: "absolute right-1 hover:bg-dm-secondary",
            }}
          />
        </PopoverContent>
      </Popover>
    </div>
  );
}
