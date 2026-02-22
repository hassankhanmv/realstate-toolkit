import * as React from "react";
import { format } from "date-fns";
import { Calendar as CalendarIcon, X } from "lucide-react";
import type { DateRange } from "react-day-picker";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

export function DatePickerWithRange({
  className,
  date,
  setDate,
  placeholder,
}: {
  className?: string;
  date: DateRange | undefined;
  setDate: (date: DateRange | undefined) => void;
  placeholder?: string;
}) {
  return (
    <div className={cn("grid gap-2", className)}>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            id="date"
            variant={"outline"}
            className={cn(
              "w-full justify-start text-left font-normal border-border bg-transparent h-9 px-3 rounded-lg flex items-center gap-2",
              !date && "text-muted-foreground",
            )}
          >
            <CalendarIcon className="h-4 w-4 shrink-0" />
            <span className="flex-1 truncate">
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
                <span>{placeholder || "Pick a date"}</span>
              )}
            </span>
            {date?.from && (
              <X
                className="h-3.5 w-3.5 opacity-50 hover:opacity-100 cursor-pointer"
                onClick={(e) => {
                  e.stopPropagation();
                  setDate(undefined);
                }}
              />
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            initialFocus
            mode="range"
            defaultMonth={date?.from}
            selected={date}
            onSelect={setDate}
            numberOfMonths={2}
          />
        </PopoverContent>
      </Popover>
    </div>
  );
}
