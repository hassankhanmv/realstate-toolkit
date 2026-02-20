import { useState, type ReactNode } from "react";
import { useTranslation } from "react-i18next";
import {
  flexRender,
  getCoreRowModel,
  useReactTable,
  getPaginationRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  type SortingState,
  type ColumnDef,
} from "@tanstack/react-table";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { ContextMenu, type ContextMenuOption } from "./ContextMenu";
import { DataTableToolbar } from "./DataTableToolbar";
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
} from "lucide-react";

export interface HeaderConfig<T = any> {
  text: string;
  accessorKey?: string;
  cell?: (row: T) => ReactNode;
  tooltip?: string;
  sortable?: boolean;
  width?: string | number;
  align?: "start" | "center" | "end";
  type?: "default" | "action";
  menuSide?: "top" | "right" | "bottom" | "left";
  menuAlign?: "start" | "center" | "end";
}

interface GlobalDataTableProps<T> {
  headers: HeaderConfig<T>[];
  data: T[];
  title?: string;
  description?: string;
  limit?: number;
  search?: boolean;
  searchVal?: string;
  onSearchChange?: (val: string) => void;
  contextMenuOptions?: (row: T) => ContextMenuOption[];
  massContextMenu?: ContextMenuOption[];
  noDataIcon?: React.ElementType;
  noDataMessage?: string;
  noDataDesc?: string;
}

export function GlobalDataTable<T extends { id?: string | number }>({
  headers,
  data,
  title,
  description,
  limit = 10,
  search,
  searchVal,
  onSearchChange,
  contextMenuOptions,
  massContextMenu,
  noDataIcon: NoDataIcon,
  noDataMessage = "common.table.no_data",
  noDataDesc = "common.table.no_data_desc",
}: GlobalDataTableProps<T>) {
  const { t } = useTranslation();
  const [internalSearch, setInternalSearch] = useState("");
  const [sorting, setSorting] = useState<SortingState>([]);
  const searchValue = searchVal !== undefined ? searchVal : internalSearch;

  const handleSearchChange = (val: string) => {
    if (onSearchChange) onSearchChange(val);
    else setInternalSearch(val);
  };

  const baseColumns: ColumnDef<T>[] = headers.map((header) => {
    const isAction = header.type === "action";
    return {
      id: isAction ? "actions" : header.accessorKey || header.text,
      accessorKey: header.accessorKey,
      header: ({ column }) => {
        let HeaderContent = (
          <div
            className={`flex items-center gap-1 ${
              header.align === "end"
                ? "justify-end"
                : header.align === "center"
                  ? "justify-center"
                  : "justify-start"
            }`}
            style={{ width: header.width }}
          >
            {t(header.text)}
          </div>
        );

        if (header.sortable) {
          const isSorted = column.getIsSorted();
          HeaderContent = (
            <Button
              variant="ghost"
              onClick={() => column.toggleSorting(isSorted === "asc")}
              className={`-ml-4 h-8 px-4 font-semibold text-[11px] uppercase tracking-wider text-muted-foreground hover:bg-secondary/60 hover:text-foreground transition-colors ${
                header.align === "end"
                  ? "w-full justify-end"
                  : header.align === "center"
                    ? "w-full justify-center"
                    : "justify-start"
              }`}
            >
              <span>{t(header.text)}</span>
              {isSorted === "asc" ? (
                <ArrowUp className="ml-1.5 h-3.5 w-3.5" />
              ) : isSorted === "desc" ? (
                <ArrowDown className="ml-1.5 h-3.5 w-3.5" />
              ) : (
                <ArrowUpDown className="ml-1.5 h-3.5 w-3.5 opacity-0 group-hover:opacity-100 placeholder:opacity-50" />
              )}
            </Button>
          );
        }

        if (header.tooltip) {
          return (
            <Tooltip delayDuration={200}>
              <TooltipTrigger asChild>
                <div className="cursor-help w-max">{HeaderContent}</div>
              </TooltipTrigger>
              <TooltipContent
                side="top"
                className="text-xs bg-primary text-primary-foreground z-50 px-2 py-1 shadow-md"
              >
                <p>{t(header.tooltip)}</p>
              </TooltipContent>
            </Tooltip>
          );
        }
        return HeaderContent;
      },
      cell: ({ row }) => {
        if (isAction && contextMenuOptions) {
          const options = contextMenuOptions(row.original);
          return (
            <div
              className={
                header.align === "end"
                  ? "flex justify-end"
                  : header.align === "center"
                    ? "flex justify-center"
                    : "flex justify-start"
              }
            >
              <ContextMenu
                options={options}
                side={header.menuSide}
                align={header.menuAlign}
              />
            </div>
          );
        }
        if (header.cell) return header.cell(row.original);

        const val = row.getValue(header.accessorKey as string);
        return (
          <div
            className={
              header.align === "end"
                ? "text-end"
                : header.align === "center"
                  ? "text-center"
                  : "text-start"
            }
          >
            {val as ReactNode}
          </div>
        );
      },
    } as ColumnDef<T>;
  });

  const table = useReactTable({
    data,
    columns: baseColumns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    initialState: { pagination: { pageSize: limit } },
    state: { globalFilter: searchValue, sorting },
    onGlobalFilterChange: handleSearchChange,
    onSortingChange: setSorting,
  });

  return (
    <TooltipProvider delayDuration={200}>
      <div className="space-y-4">
        <DataTableToolbar
          table={table}
          searchVal={searchValue}
          onSearchChange={handleSearchChange}
          massContextMenu={massContextMenu}
          title={title}
          description={description}
          search={search}
        />

        <div className="rounded-xl border border-border bg-card shadow-sm min-h-[550px] flex flex-col">
          <div className="overflow-x-auto flex-1">
            <Table>
              <TableHeader>
                {table.getHeaderGroups().map((hg) => (
                  <TableRow
                    key={hg.id}
                    className="bg-secondary/40 hover:bg-secondary/40 border-b-border"
                  >
                    {hg.headers.map((header) => (
                      <TableHead
                        key={header.id}
                        className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground h-11 px-4"
                      >
                        {header.isPlaceholder
                          ? null
                          : flexRender(
                              header.column.columnDef.header,
                              header.getContext(),
                            )}
                      </TableHead>
                    ))}
                  </TableRow>
                ))}
              </TableHeader>
              <TableBody>
                {table.getRowModel().rows.length ? (
                  table.getRowModel().rows.map((row) => (
                    <TableRow
                      key={row.id}
                      className="transition-colors hover:bg-muted/40 border-b-border/40"
                    >
                      {row.getVisibleCells().map((cell) => (
                        <TableCell
                          key={cell.id}
                          className="py-3.5 px-4 text-sm"
                        >
                          {flexRender(
                            cell.column.columnDef.cell,
                            cell.getContext(),
                          )}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell
                      colSpan={baseColumns.length}
                      className="h-64 text-center"
                    >
                      <div className="flex flex-col items-center gap-3 text-muted-foreground">
                        {NoDataIcon && (
                          <NoDataIcon className="h-10 w-10 opacity-20" />
                        )}
                        <p className="font-medium text-foreground">
                          {t(noDataMessage)}
                        </p>
                        {noDataDesc && (
                          <p className="text-xs">{t(noDataDesc)}</p>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          {/* Pagination Footer */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-4 py-3 border-t border-border/50 bg-secondary/10">
            {/* Left Side: Total Items & Rows Per Page */}
            <div className="flex flex-wrap items-center gap-4 lg:gap-6 text-xs text-muted-foreground flex-1">
              <span className="font-medium">
                {table.getFilteredRowModel().rows.length}{" "}
                {t("common.table.total_items")}
              </span>

              <div className="flex items-center gap-2">
                <span className="hidden sm:inline-block font-medium">
                  {t("common.table.rows_per_page")}
                </span>
                <Select
                  value={`${table.getState().pagination.pageSize}`}
                  onValueChange={(value) => table.setPageSize(Number(value))}
                >
                  <SelectTrigger className="h-7 w-[65px] text-xs font-medium focus:ring-accent bg-transparent border-border/60">
                    <SelectValue
                      placeholder={table.getState().pagination.pageSize}
                    />
                  </SelectTrigger>
                  {/* Opens upwards so it doesn't get cut off */}
                  <SelectContent side="top" align="center">
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
              </div>
            </div>

            {/* Right Side: Page Controls */}
            <div className="flex items-center gap-4 lg:gap-8">
              <div className="flex items-center justify-center text-xs font-medium text-foreground whitespace-nowrap">
                {t("common.table.page_of", {
                  current: table.getState().pagination.pageIndex + 1,
                  total: table.getPageCount() || 1,
                })}
              </div>
              <div className="flex items-center gap-1.5 shrink-0">
                <Button
                  variant="outline"
                  className="hidden h-7 w-7 p-0 lg:flex focus-visible:ring-accent"
                  onClick={() => table.setPageIndex(0)}
                  disabled={!table.getCanPreviousPage()}
                  title={t("common.table.go_to_first")}
                >
                  <ChevronsLeft className="h-4 w-4 rtl:rotate-180" />
                </Button>
                <Button
                  variant="outline"
                  className="h-7 w-7 p-0 focus-visible:ring-accent"
                  onClick={() => table.previousPage()}
                  disabled={!table.getCanPreviousPage()}
                  title={t("common.table.go_to_prev")}
                >
                  <ChevronLeft className="h-4 w-4 rtl:rotate-180" />
                </Button>
                <Button
                  variant="outline"
                  className="h-7 w-7 p-0 focus-visible:ring-accent"
                  onClick={() => table.nextPage()}
                  disabled={!table.getCanNextPage()}
                  title={t("common.table.go_to_next")}
                >
                  <ChevronRight className="h-4 w-4 rtl:rotate-180" />
                </Button>
                <Button
                  variant="outline"
                  className="hidden h-7 w-7 p-0 lg:flex focus-visible:ring-accent"
                  onClick={() => table.setPageIndex(table.getPageCount() - 1)}
                  disabled={!table.getCanNextPage()}
                  title={t("common.table.go_to_last")}
                >
                  <ChevronsRight className="h-4 w-4 rtl:rotate-180" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </TooltipProvider>
  );
}
