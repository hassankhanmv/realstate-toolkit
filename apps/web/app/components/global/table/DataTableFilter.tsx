import { useState } from "react";
import { useTranslation } from "react-i18next";
import { ListFilter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import type { Column } from "@tanstack/react-table";

export interface FilterConfig {
  dataType: "string" | "number" | string[] | { label: string; value: string }[];
  type: "field" | "select";
  placeholder?: string;
}

interface DataTableFilterProps<TData> {
  column: Column<TData, unknown>;
  filter: FilterConfig;
}

export function DataTableFilter<TData>({
  column,
  filter,
}: DataTableFilterProps<TData>) {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const [localValue, setLocalValue] = useState<string>("");

  const isActive = column.getFilterValue() !== undefined;

  const handleOpen = (nextOpen: boolean) => {
    if (nextOpen) {
      const current = column.getFilterValue();
      setLocalValue(
        current !== undefined && current !== null ? String(current) : "",
      );
    }
    setOpen(nextOpen);
  };

  const handleApply = () => {
    if (localValue === "" || localValue === "__all__") {
      column.setFilterValue(undefined);
    } else if (filter.type === "field" && filter.dataType === "number") {
      column.setFilterValue(Number(localValue));
    } else {
      column.setFilterValue(localValue);
    }
    setOpen(false);
  };

  const handleCancel = () => {
    column.setFilterValue(undefined);
    setLocalValue("");
    setOpen(false);
  };

  const getOptions = (): { label: string; value: string }[] => {
    if (filter.type !== "select") return [];
    const dt = filter.dataType;
    if (Array.isArray(dt)) {
      if (dt.length > 0 && typeof dt[0] === "string") {
        return (dt as string[]).map((s) => ({ label: t(s), value: s }));
      }
      return dt as { label: string; value: string }[];
    }
    return [];
  };

  return (
    <Popover open={open} onOpenChange={handleOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          className={`inline-flex items-center justify-center h-8 w-8 rounded-full transition-colors ms-1 ${
            isActive
              ? "text-accent bg-accent/20"
              : "text-muted-foreground/80 hover:text-muted-foreground hover:bg-slate-100"
          }`}
        >
          <ListFilter className="h-3.5 w-3.5" />
        </button>
      </PopoverTrigger>
      {/* Increased width and padding for a less cramped feel */}
      <PopoverContent
        align="start"
        className="w-64 p-4 space-y-4 border-border shadow-lg"
      >
        <p className="text-sm font-semibold text-foreground">
          {t("common.table.filter_by")}
        </p>

        {filter.type === "field" && (
          <Input
            type={filter.dataType === "number" ? "number" : "text"}
            value={localValue}
            onChange={(e) => setLocalValue(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleApply();
            }}
            placeholder={
              filter.placeholder
                ? t(filter.placeholder)
                : t("common.table.filter_placeholder")
            }
            // Removed focus rings, added transparent bg
            className="h-9 text-xs rounded-lg border-border bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:border-accent transition-colors"
            autoFocus
          />
        )}

        {filter.type === "select" && (
          <Select value={localValue || "__all__"} onValueChange={setLocalValue}>
            {/* Removed focus rings from SelectTrigger */}
            <SelectTrigger className="h-9 text-xs rounded-lg border-border bg-transparent focus:ring-0 focus:ring-offset-0 focus-visible:ring-0 focus-visible:ring-offset-0 transition-colors">
              <SelectValue
                placeholder={t("common.table.filter_select_placeholder")}
              />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="__all__" className="text-xs cursor-pointer">
                {t("common.table.filter_all")}
              </SelectItem>
              {getOptions().map((opt) => (
                <SelectItem
                  key={opt.value}
                  value={opt.value}
                  className="text-xs cursor-pointer"
                >
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}

        <div className="flex items-center gap-3 pt-1">
          {/* Cancel button with gray hover background */}
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleCancel}
            className="flex-1 h-8 text-xs font-medium rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
          >
            {t("common.table.filter_cancel")}
          </Button>
          <Button
            type="button"
            size="sm"
            onClick={handleApply}
            className="flex-1 h-8 text-xs font-semibold rounded-lg bg-accent text-accent-foreground hover:bg-accent/90 shadow-sm"
          >
            {t("common.table.filter_apply")}
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}