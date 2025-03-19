import { useState, useMemo } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Pencil,
  Trash2,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Download,
  Search,
  X,
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ColumnConfig } from "@/types";

export interface DataTableProps<T> {
  data: T[];
  columns: ColumnConfig<T>[];
  idField: keyof T;
  onEdit?: (id: any, item: T) => void;
  onDelete?: (id: any) => void;
  emptyMessage?: string;
  showActions?: boolean;
  // New props for enhanced features
  enableSorting?: boolean;
  enableFiltering?: boolean;
  enablePagination?: boolean;
  enableExport?: boolean;
  defaultSortColumn?: string;
  defaultSortDirection?: "asc" | "desc";
  defaultPageSize?: number;
  pageSizeOptions?: number[];
  filename?: string;
}

function DataTable<T>({
  data,
  columns,
  idField,
  onEdit,
  onDelete,
  emptyMessage = "No data found",
  showActions = true,
  enableSorting = true,
  enableFiltering = true,
  enablePagination = true,
  enableExport = true,
  defaultSortColumn,
  defaultSortDirection = "asc",
  defaultPageSize = 10,
  pageSizeOptions = [5, 10, 25, 50, 100],
  filename = "data-export",
}: DataTableProps<T>) {
  // Sorting state
  const [sortColumn, setSortColumn] = useState<string | null>(
    defaultSortColumn || null
  );
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">(
    defaultSortDirection
  );

  // Filtering state
  const [filters, setFilters] = useState<Record<string, string>>({});

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(defaultPageSize);

  // Handle sorting
  const handleSort = (columnKey: string) => {
    if (sortColumn === columnKey) {
      // Toggle direction if already sorting by this column
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      // Set new sort column and default to ascending
      setSortColumn(columnKey);
      setSortDirection("asc");
    }
    // Reset to first page when sorting changes
    setCurrentPage(1);
  };

  // Handle filtering
  const handleFilterChange = (columnKey: string, value: string) => {
    setFilters((prev) => ({
      ...prev,
      [columnKey]: value,
    }));
    // Reset to first page when filters change
    setCurrentPage(1);
  };

  const clearFilter = (columnKey: string) => {
    setFilters((prev) => {
      const newFilters = { ...prev };
      delete newFilters[columnKey];
      return newFilters;
    });
    // Reset to first page when filters change
    setCurrentPage(1);
  };

  const clearAllFilters = () => {
    setFilters({});
    // Reset to first page when filters change
    setCurrentPage(1);
  };

  // Process data with filters, sorting, and pagination
  const processedData = useMemo(() => {
    let result = [...data];

    // Apply filters
    if (Object.keys(filters).length > 0) {
      result = result.filter((item) => {
        return Object.entries(filters).every(([key, filterValue]) => {
          if (!filterValue.trim()) return true;

          // Handle nested properties with dot notation
          const value = key.includes(".")
            ? key.split(".").reduce((obj, k) => (obj as any)?.[k], item)
            : item[key as keyof T];

          // Convert to string for comparison if it's not null or undefined
          const valueStr = value != null ? String(value).toLowerCase() : "";
          return valueStr.includes(filterValue.toLowerCase());
        });
      });
    }

    // Apply sorting
    if (sortColumn) {
      result.sort((a, b) => {
        // Handle nested properties with dot notation
        const aValue = sortColumn.includes(".")
          ? sortColumn.split(".").reduce((obj, key) => (obj as any)?.[key], a)
          : a[sortColumn as keyof T];

        const bValue = sortColumn.includes(".")
          ? sortColumn.split(".").reduce((obj, key) => (obj as any)?.[key], b)
          : b[sortColumn as keyof T];

        // Handle different data types
        if (aValue == null && bValue == null) return 0;
        if (aValue == null) return sortDirection === "asc" ? -1 : 1;
        if (bValue == null) return sortDirection === "asc" ? 1 : -1;

        // String comparison
        if (typeof aValue === "string" || typeof bValue === "string") {
          const aStr = String(aValue).toLowerCase();
          const bStr = String(bValue).toLowerCase();
          return sortDirection === "asc"
            ? aStr.localeCompare(bStr)
            : bStr.localeCompare(aStr);
        }

        // Number comparison
        if (typeof aValue === "number" || typeof bValue === "number") {
          return sortDirection === "asc"
            ? Number(aValue) - Number(bValue)
            : Number(bValue) - Number(aValue);
        }

        // Date comparison
        if (aValue instanceof Date || bValue instanceof Date) {
          const aDate =
            aValue instanceof Date
              ? aValue
              : new Date(aValue as string | number);
          const bDate =
            bValue instanceof Date
              ? bValue
              : new Date(bValue as string | number);
          return sortDirection === "asc"
            ? aDate.getTime() - bDate.getTime()
            : bDate.getTime() - aDate.getTime();
        }

        // Default: convert to string and compare
        return sortDirection === "asc"
          ? String(aValue).localeCompare(String(bValue))
          : String(bValue).localeCompare(String(aValue));
      });
    }

    return result;
  }, [data, filters, sortColumn, sortDirection]);

  // Apply pagination
  const paginatedData = useMemo(() => {
    if (!enablePagination) return processedData;

    const startIndex = (currentPage - 1) * pageSize;
    return processedData.slice(startIndex, startIndex + pageSize);
  }, [processedData, currentPage, pageSize, enablePagination]);

  // Calculate total pages
  const totalPages = useMemo(() => {
    return Math.ceil(processedData.length / pageSize);
  }, [processedData, pageSize]);

  // Pagination controls
  const goToPage = (page: number) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)));
  };

  // Export data
  const exportData = () => {
    // Choose what to export: filtered data or all data
    const dataToExport = processedData;

    // Get visible columns (excluding columns that should be hidden in export)
    const exportColumns = columns.filter((col) => col.hideInExport !== true);

    // Create CSV content
    let csv = exportColumns.map((col) => `"${col.header}"`).join(",") + "\n";

    // Add data rows
    csv += dataToExport
      .map((row) => {
        return exportColumns
          .map((col) => {
            // Get the value using the column key
            let value;
            if (typeof col.key === "string" && col.key.includes(".")) {
              value = col.key
                .split(".")
                .reduce((obj: any, key: string) => obj && obj[key], row);
            } else {
              value = row[col.key as keyof T];
            }

            // Use renderCell if provided for export formatting
            if (col.renderForExport) {
              value = col.renderForExport(row);
            } else if (col.renderCell && !col.skipRenderInExport) {
              // Attempt to use renderCell, but this might not always work for complex JSX
              // Component authors should use renderForExport for proper export formatting
              const rendered = col.renderCell(row);
              if (
                typeof rendered === "string" ||
                typeof rendered === "number"
              ) {
                value = rendered;
              }
            }

            // Format date values
            if (value instanceof Date) {
              value = value.toISOString();
            }

            // Escape double quotes and wrap in quotes
            if (value === null || value === undefined) {
              return '""';
            }
            return `"${String(value).replace(/"/g, '""')}"`;
          })
          .join(",");
      })
      .join("\n");

    // Create and download the file
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `${filename}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Count active filters
  const activeFilterCount = Object.keys(filters).length;

  return (
    <div className="space-y-4">
      {/* Filtering and Export Controls */}
      {(enableFiltering || enableExport) && (
        <div className="flex flex-col md:flex-row justify-between gap-4 mb-4">
          {enableFiltering && (
            <div className="flex items-center gap-2">
              <Search size={16} className="text-muted-foreground" />
              <Input
                placeholder="Search all columns..."
                className="max-w-sm"
                value={filters["_global"] || ""}
                onChange={(e) => handleFilterChange("_global", e.target.value)}
              />
              {activeFilterCount > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearAllFilters}
                  className="h-8 gap-1 text-xs"
                >
                  <X size={14} />
                  Clear filters ({activeFilterCount})
                </Button>
              )}
            </div>
          )}

          {enableExport && (
            <Button
              variant="outline"
              size="sm"
              onClick={exportData}
              className="gap-2"
            >
              <Download size={16} />
              Export CSV
            </Button>
          )}
        </div>
      )}

      {/* Table */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              {columns.map((column) => (
                <TableHead
                  key={column.key.toString()}
                  className={`${column.width || "min-w-24"} ${enableSorting && column.sortable !== false ? "cursor-pointer select-none" : ""} py-2`}
                  onClick={() => {
                    if (enableSorting && column.sortable !== false) {
                      handleSort(column.key.toString());
                    }
                  }}
                >
                  <div className="flex items-center justify-between">
                    <span className="py-2">{column.header}</span>
                    {enableSorting && column.sortable !== false && (
                      <ArrowUpDown
                        size={14}
                        className={`ml-1 opacity-50 ${
                          sortColumn === column.key.toString()
                            ? "opacity-100"
                            : ""
                        }`}
                      />
                    )}
                  </div>

                  {/* Column filters */}
                  {enableFiltering && column.filterable !== false && (
                    <div className="mt-1">
                      <div className="flex items-center gap-1">
                        <Input
                          placeholder={`Filter ${column.header}...`}
                          value={filters[column.key.toString()] || ""}
                          onChange={(e) =>
                            handleFilterChange(
                              column.key.toString(),
                              e.target.value
                            )
                          }
                          onClick={(e) => e.stopPropagation()} // Prevent sort when clicking filter
                          className="h-7 text-xs"
                        />
                        {filters[column.key.toString()] && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6"
                            onClick={(e) => {
                              e.stopPropagation();
                              clearFilter(column.key.toString());
                            }}
                          >
                            <X size={12} />
                          </Button>
                        )}
                      </div>
                    </div>
                  )}
                </TableHead>
              ))}
              {showActions && (onEdit || onDelete) && (
                <TableHead className="text-center">Actions</TableHead>
              )}
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedData.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={showActions ? columns.length + 1 : columns.length}
                  className="text-center py-4"
                >
                  {emptyMessage}
                </TableCell>
              </TableRow>
            ) : (
              paginatedData.map((item) => (
                <TableRow key={String(item[idField])}>
                  {columns.map((column) => (
                    <TableCell
                      key={`${String(item[idField])}-${column.key.toString()}`}
                    >
                      {column.renderCell ? (
                        column.renderCell(item)
                      ) : (
                        <div
                          className={
                            column.truncate
                              ? `truncate ${
                                  column.maxWidth
                                    ? column.maxWidth
                                    : "max-w-[200px]"
                                }`
                              : ""
                          }
                          title={
                            column.truncate
                              ? String(
                                  typeof column.key === "string" &&
                                    column.key.includes(".")
                                    ? column.key
                                        .split(".")
                                        .reduce(
                                          (obj: any, key) =>
                                            obj && obj[key] ? obj[key] : "",
                                          item
                                        )
                                    : item[column.key as keyof T]
                                )
                              : undefined
                          }
                        >
                          {typeof column.key === "string" &&
                          column.key.includes(".")
                            ? column.key
                                .split(".")
                                .reduce(
                                  (obj: any, key) =>
                                    obj && obj[key] ? obj[key] : "",
                                  item
                                )
                            : String(item[column.key as keyof T])}
                        </div>
                      )}
                    </TableCell>
                  ))}
                  {showActions && (onEdit || onDelete) && (
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        {onEdit && (
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => onEdit(item[idField], item)}
                          >
                            <Pencil size={16} />
                          </Button>
                        )}
                        {onDelete && (
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => onDelete(item[idField])}
                          >
                            <Trash2 size={16} />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  )}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination Controls */}
      {enablePagination && totalPages > 1 && (
        <div className="flex items-center justify-between space-x-2 py-4">
          <div className="flex-1 text-sm text-muted-foreground">
            Showing{" "}
            {paginatedData.length > 0 ? (currentPage - 1) * pageSize + 1 : 0} to{" "}
            {Math.min(currentPage * pageSize, processedData.length)} of{" "}
            {processedData.length} entries
          </div>
          <div className="flex items-center space-x-2">
            <div className="flex items-center space-x-2">
              <p className="text-sm font-medium">Rows per page</p>
              <Select
                value={String(pageSize)}
                onValueChange={(value) => {
                  setPageSize(Number(value));
                  setCurrentPage(1); // Reset to first page when changing page size
                }}
              >
                <SelectTrigger className="h-8 w-[70px]">
                  <SelectValue placeholder={pageSize} />
                </SelectTrigger>
                <SelectContent side="top">
                  {pageSizeOptions.map((size) => (
                    <SelectItem key={size} value={String(size)}>
                      {size}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="icon"
                onClick={() => goToPage(1)}
                disabled={currentPage === 1}
                className="h-8 w-8"
              >
                <ChevronsLeft size={16} />
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={() => goToPage(currentPage - 1)}
                disabled={currentPage === 1}
                className="h-8 w-8"
              >
                <ChevronLeft size={16} />
              </Button>
              <span className="text-sm">
                Page {currentPage} of {totalPages}
              </span>
              <Button
                variant="outline"
                size="icon"
                onClick={() => goToPage(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="h-8 w-8"
              >
                <ChevronRight size={16} />
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={() => goToPage(totalPages)}
                disabled={currentPage === totalPages}
                className="h-8 w-8"
              >
                <ChevronsRight size={16} />
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default DataTable;
