import { useTranslation } from "react-i18next";
import { type Table } from "@tanstack/react-table";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ContextMenu, type ContextMenuOption } from "./ContextMenu";

interface DataTableToolbarProps<TData> {
  table: Table<TData>;
  searchVal: string;
  onSearchChange: (val: string) => void;
  massContextMenu?: ContextMenuOption[];
  title?: string;
  description?: string;
  search?: boolean;
}

export function DataTableToolbar<TData>({
  table,
  searchVal,
  onSearchChange,
  massContextMenu,
  title,
  description,
  search,
}: DataTableToolbarProps<TData>) {
  const { t } = useTranslation();

  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-4">
      <div className="space-y-1">
        {title && (
          <h2 className="text-xl font-bold tracking-tight text-foreground">
            {t(title)}
          </h2>
        )}
        {description && (
          <p className="text-sm text-muted-foreground">{t(description)}</p>
        )}
      </div>

      <div className="flex flex-row items-center justify-between gap-3 w-full sm:w-auto">
        {search && (
          <div className="relative flex-1 sm:w-72">
            <Search className="absolute start-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={t("common.table.search_placeholder")}
              value={searchVal}
              onChange={(e) => onSearchChange(e.target.value)}
              className="ps-9 h-9 text-sm focus-visible:ring-accent"
            />
          </div>
        )}

        <div className="flex items-center gap-3">
          {/* Rows per page Dropdown */}
          {/* <div className="flex items-center gap-2">
            <p className="text-xs font-medium text-muted-foreground whitespace-nowrap hidden sm:block">
              {t("common.table.rows_per_page")}
            </p>
            <Select
              value={`${table.getState().pagination.pageSize}`}
              onValueChange={(value) => {
                table.setPageSize(Number(value));
              }}
            >
              <SelectTrigger className="h-9 w-[70px] text-xs focus:ring-accent">
                <SelectValue
                  placeholder={table.getState().pagination.pageSize}
                />
              </SelectTrigger>
              <SelectContent side="bottom" align="end">
                {[10, 20, 30, 40, 50].map((pageSize) => (
                  <SelectItem
                    key={pageSize}
                    value={`${pageSize}`}
                    className="text-xs"
                  >
                    {pageSize}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div> */}

          {massContextMenu && massContextMenu.length > 0 && (
            <ContextMenu options={massContextMenu} side="bottom" align="end" />
          )}
        </div>
      </div>
    </div>
  );
}
