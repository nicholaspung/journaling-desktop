import React, { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import DataTable from "./data-table";
import EditDialog from "./edit-dialog";
import DeleteDialog from "./delete-dialog";
import { toast } from "sonner";
import { TabConfig } from "@/types";

export interface DataViewerProps {
  title?: string;
  description?: string;
  tabs: TabConfig<any>[];
  formatDate?: (dateString: string) => string;
  defaultTab?: string;
  // Global settings (can be overridden by individual tabs)
  enableSorting?: boolean;
  enableFiltering?: boolean;
  enablePagination?: boolean;
  enableExport?: boolean;
  defaultPageSize?: number;
}

const DataViewer: React.FC<DataViewerProps> = ({
  title,
  description,
  tabs,
  formatDate,
  defaultTab,
  enableSorting = true,
  enableFiltering = true,
  enablePagination = true,
  enableExport = true,
  defaultPageSize = 10,
}) => {
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editItem, setEditItem] = useState<{
    tabId: string;
    id: any;
    content: string;
    title: string;
  } | null>(null);

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteItem, setDeleteItem] = useState<{
    tabId: string;
    id: any;
    title: string;
  } | null>(null);

  // Add default date formatter if not provided
  const formatDateFn =
    formatDate ||
    ((dateString: string) => {
      if (!dateString) return "N/A";
      try {
        const date = new Date(dateString);
        if (isNaN(date.getTime())) return dateString;
        return new Intl.DateTimeFormat("en-US", {
          year: "numeric",
          month: "short",
          day: "numeric",
          hour: "numeric",
          minute: "2-digit",
          hour12: true,
        }).format(date);
      } catch (err) {
        console.error("Error formatting date:", err);
        return dateString;
      }
    });

  // Preprocess column definitions to apply date formatting
  const processedTabs = tabs.map((tab) => {
    const processedColumns = tab.columns.map((column) => {
      // If it's a date field and doesn't have a custom renderer, add date formatting
      if (
        (column.key.toString().toLowerCase().includes("date") ||
          column.key.toString().toLowerCase().includes("at")) &&
        !column.renderCell
      ) {
        return {
          ...column,
          renderCell: (row: any) => formatDateFn(row[column.key as string]),
          // Also add an export renderer for formatted dates
          renderForExport: !column.renderForExport
            ? (row: any) => {
                const dateStr = row[column.key as string];
                if (!dateStr) return "";
                try {
                  const date = new Date(dateStr);
                  if (isNaN(date.getTime())) return dateStr;
                  return date.toISOString();
                } catch (err) {
                  console.error(`Error formatting date: ${err}`);
                  return dateStr;
                }
              }
            : column.renderForExport,
        };
      }
      return column;
    });

    return {
      ...tab,
      columns: processedColumns,
    };
  });

  const handleEdit = (tabId: string, id: any, item: any) => {
    const tab = tabs.find((t) => t.id === tabId);
    if (!tab || !tab.contentField) return;

    const content = item[tab.contentField];
    const title = tab.label.endsWith("s") ? tab.label.slice(0, -1) : tab.label;

    setEditItem({
      tabId,
      id,
      content,
      title,
    });
    setEditDialogOpen(true);
  };

  const handleDelete = (tabId: string, id: any) => {
    const tab = tabs.find((t) => t.id === tabId);
    if (!tab) return;

    const title = tab.label.endsWith("s") ? tab.label.slice(0, -1) : tab.label;

    setDeleteItem({
      tabId,
      id,
      title,
    });
    setDeleteDialogOpen(true);
  };

  const handleSaveEdit = async (content: string) => {
    if (!editItem) return;

    try {
      const tab = tabs.find((t) => t.id === editItem.tabId);
      if (!tab || !tab.onUpdate) {
        throw new Error("Tab not found or update function not provided");
      }

      await tab.onUpdate(editItem.id, content);

      // Call additional update function if provided
      if (tab.additionalUpdates) {
        tab.additionalUpdates(editItem.id, content);
      }

      toast.success(
        `Updated successfully. The ${editItem.title.toLowerCase()} has been updated.`
      );
    } catch (error) {
      console.error(`Error updating ${editItem.title}:`, error);
      toast.error(
        `Update failed. Failed to update the ${editItem.title.toLowerCase()}. Please try again.`
      );
    }
  };

  const handleConfirmDelete = async () => {
    if (!deleteItem) return;

    try {
      const tab = tabs.find((t) => t.id === deleteItem.tabId);
      if (!tab || !tab.onDelete) {
        throw new Error("Tab not found or delete function not provided");
      }

      await tab.onDelete(deleteItem.id);

      toast.success(
        `Deleted successfully. The ${deleteItem.title.toLowerCase()} has been deleted.`
      );
    } catch (error) {
      console.error(`Error deleting ${deleteItem.title}:`, error);
      toast.error(
        `Delete failed. Failed to delete the ${deleteItem.title.toLowerCase()}. Please try again.`
      );
    }
  };

  return (
    <>
      <Card className={`w-full ${title || description ? "" : "pt-6"}`}>
        {title ||
          (description && (
            <CardHeader>
              {title && <CardTitle className="text-2xl">{title}</CardTitle>}
              {description && <CardDescription>{description}</CardDescription>}
            </CardHeader>
          ))}
        <CardContent>
          <Tabs
            defaultValue={defaultTab || processedTabs[0]?.id}
            className="w-full"
          >
            <TabsList className={`grid grid-cols-4 mb-4`}>
              {processedTabs.map((tab) => (
                <TabsTrigger
                  key={tab.id}
                  value={tab.id}
                  className="flex items-center gap-2 px-4 mx-4"
                  id={`${tab.id}-trigger`}
                >
                  {tab.icon && <tab.icon size={16} />}
                  {tab.label}
                </TabsTrigger>
              ))}
            </TabsList>

            {processedTabs.map((tab) => (
              <TabsContent key={tab.id} value={tab.id} id={`${tab.id}-panel`}>
                <DataTable
                  data={tab.data}
                  columns={tab.columns}
                  idField={tab.idField}
                  onEdit={
                    tab.canEdit
                      ? (id, item) => handleEdit(tab.id, id, item)
                      : undefined
                  }
                  onDelete={
                    tab.canDelete ? (id) => handleDelete(tab.id, id) : undefined
                  }
                  emptyMessage={
                    tab.emptyMessage || `No ${tab.label.toLowerCase()} found`
                  }
                  showActions={tab.canEdit || tab.canDelete}
                  // Enhanced features
                  enableSorting={
                    tab.enableSorting !== undefined
                      ? tab.enableSorting
                      : enableSorting
                  }
                  enableFiltering={
                    tab.enableFiltering !== undefined
                      ? tab.enableFiltering
                      : enableFiltering
                  }
                  enablePagination={
                    tab.enablePagination !== undefined
                      ? tab.enablePagination
                      : enablePagination
                  }
                  enableExport={
                    tab.enableExport !== undefined
                      ? tab.enableExport
                      : enableExport
                  }
                  defaultSortColumn={tab.defaultSortColumn}
                  defaultSortDirection={tab.defaultSortDirection}
                  defaultPageSize={tab.defaultPageSize || defaultPageSize}
                  pageSizeOptions={tab.pageSizeOptions}
                  filename={
                    tab.exportFilename || `${tab.label.toLowerCase()}-export`
                  }
                />
              </TabsContent>
            ))}
          </Tabs>
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      {editItem && (
        <EditDialog
          open={editDialogOpen}
          onOpenChange={setEditDialogOpen}
          title={`Edit ${editItem.title}`}
          content={editItem.content}
          onSave={handleSaveEdit}
          type={editItem.tabId}
        />
      )}

      {/* Delete Dialog */}
      {deleteItem && (
        <DeleteDialog
          open={deleteDialogOpen}
          onOpenChange={setDeleteDialogOpen}
          title={`Delete ${deleteItem.title}`}
          description={`Are you sure you want to delete this ${deleteItem.title.toLowerCase()}? This action cannot be undone.`}
          onDelete={handleConfirmDelete}
        />
      )}
    </>
  );
};

export default DataViewer;
