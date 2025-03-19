import { Edit, Trash2 } from "lucide-react";
import { Button } from "../ui/button";
import { Textarea } from "../ui/textarea";
import { GratitudeItem } from "@/types";
import { useState } from "react";
import { toast } from "sonner";
import {
  DeleteGratitudeItem,
  UpdateGratitudeItem,
} from "../../../wailsjs/go/backend/App";
import DeleteDialog from "../reusable/delete-dialog";

export default function GratitudeEntries({
  todayItems,
  setIsLoading,
  loadData,
}: {
  todayItems: GratitudeItem[];
  setIsLoading: (isLoading: boolean) => void;
  loadData: () => void;
}) {
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editContent, setEditContent] = useState("");
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<number | null>(null);

  const startEdit = (item: GratitudeItem) => {
    setEditingId(item.id);
    setEditContent(item.content);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditContent("");
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingId) return;

    // Validate input
    if (editContent.trim().length < 3) {
      toast.error("Gratitude entry must be at least 3 characters long");
      return;
    }

    if (editContent.length > 500) {
      toast.error("Gratitude entry must be less than 500 characters");
      return;
    }

    try {
      setIsLoading(true);
      await UpdateGratitudeItem(editingId, editContent);

      // Reload data
      await loadData();
      setEditingId(null);
      setEditContent("");

      toast.success("Gratitude entry updated successfully.");
    } catch (error) {
      console.error("Error updating gratitude item:", error);
      toast.error("Failed to update gratitude entry.");
    } finally {
      setIsLoading(false);
    }
  };

  const openDeleteModal = (id: number) => {
    setItemToDelete(id);
    setDeleteModalOpen(true);
  };

  const closeDeleteModal = () => {
    setDeleteModalOpen(false);
    setItemToDelete(null);
  };

  const confirmDelete = async () => {
    if (!itemToDelete) return;

    try {
      setIsLoading(true);
      await DeleteGratitudeItem(itemToDelete);

      // Reload data
      await loadData();

      toast.success("Gratitude entry deleted successfully.");
    } catch (error) {
      console.error("Error deleting gratitude item:", error);
      toast.error("Failed to delete gratitude entry.");
    } finally {
      setIsLoading(false);
      closeDeleteModal();
    }
  };

  return (
    <>
      {todayItems.length > 0 && (
        <div className="mb-6">
          <h3 className="text-lg font-medium mb-2">Today's Entries</h3>
          <ul className="space-y-2">
            {todayItems.map((item) => (
              <li key={item.id} className="p-3 border rounded-md bg-card">
                {editingId === item.id ? (
                  <form onSubmit={handleEditSubmit} className="space-y-2">
                    <Textarea
                      value={editContent}
                      onChange={(e) => setEditContent(e.target.value)}
                      className="min-h-20"
                    />
                    <div className="flex gap-2 justify-end">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={cancelEdit}
                      >
                        Cancel
                      </Button>
                      <Button type="submit" size="sm">
                        Save
                      </Button>
                    </div>
                  </form>
                ) : (
                  <div className="flex justify-between items-start gap-2">
                    <div className="flex-1">{item.content}</div>
                    <div className="flex gap-2 shrink-0">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => startEdit(item)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => openDeleteModal(item.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}

      <DeleteDialog
        open={deleteModalOpen}
        onOpenChange={closeDeleteModal}
        onDelete={confirmDelete}
        title="Delete Gratitude Entry"
        description="Are you sure you want to delete this gratitude entry? This action cannot be undone."
      />
    </>
  );
}
