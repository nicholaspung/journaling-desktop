// frontend/components/EditDialog.tsx
import React, { useState } from "react";
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
import { Slider } from "@/components/ui/slider";

interface EditDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  content: string;
  onSave: (content: string) => Promise<void>;
  type: "question" | "answer" | "affirmation";
}

const EditDialog: React.FC<EditDialogProps> = ({
  open,
  onOpenChange,
  title,
  content,
  onSave,
  type,
}) => {
  const [value, setValue] = useState(content);
  const [saving, setSaving] = useState(false);
  const [textareaHeight, setTextareaHeight] = useState(150);

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
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[525px]">
        <DialogHeader>
          <DialogTitle>Edit {title}</DialogTitle>
          <DialogDescription>
            Make changes to the content below.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <Textarea
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder={`Enter ${type} content...`}
            className="min-h-[60px]"
            style={{ height: `${textareaHeight}px` }}
          />

          <div className="py-2">
            <div className="text-sm text-muted-foreground mb-2">
              Adjust textarea height
            </div>
            <Slider
              defaultValue={[textareaHeight]}
              min={100}
              max={400}
              step={10}
              onValueChange={(vals) => setTextareaHeight(vals[0])}
              className="w-full"
            />
          </div>
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
