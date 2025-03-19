import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

interface EditDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  content: string;
  onSave: (content: string) => Promise<void> | void;
  type?: string; // Made optional since it's now more generic
  placeholder?: string; // Added for more flexibility
}

const EditDialog: React.FC<EditDialogProps> = ({
  open,
  onOpenChange,
  title,
  content,
  onSave,
  type = "item", // Default value for generic use
  placeholder,
}) => {
  const [value, setValue] = useState(content);
  const [saving, setSaving] = useState(false);

  // Reset value when content changes (useful when editing different items)
  useEffect(() => {
    setValue(content);
  }, [content]);

  const handleSave = async () => {
    if (!value.trim()) return;

    setSaving(true);
    try {
      await onSave(value);
      onOpenChange(false);
    } catch (error) {
      console.error(`Error saving ${type}:`, error);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(isOpen) => {
        // If closing, reset to original content
        if (!isOpen) {
          setValue(content);
        }
        onOpenChange(isOpen);
      }}
    >
      <DialogContent className="sm:max-w-[525px]">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>
            Make changes to the content below.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <Textarea
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder={placeholder || `Enter ${type} content...`}
            className="min-h-[60px]"
          />
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={saving || !value.trim()}>
            {saving ? "Saving..." : "Save Changes"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default EditDialog;
