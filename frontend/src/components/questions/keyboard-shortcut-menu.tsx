// src/components/KeyboardShortcutMenu.tsx
import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableHead,
  TableRow,
} from "@/components/ui/table";

interface KeyboardShortcutMenuProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const KeyboardShortcutMenu: React.FC<KeyboardShortcutMenuProps> = ({
  open,
  onOpenChange,
}) => {
  const shortcuts = [
    { action: "Cycle View Modes", shortcut: "Alt + P" },
    { action: "Split View Mode", shortcut: "Alt + Ctrl + E" },
    { action: "Show Keyboard Shortcuts", shortcut: "Ctrl + /" },
    { action: "Bold", shortcut: "Ctrl + B" },
    { action: "Italic", shortcut: "Ctrl + I" },
    { action: "Heading 1", shortcut: "Alt + Ctrl + 1" },
    { action: "Heading 2", shortcut: "Alt + Ctrl + 2" },
    { action: "Heading 3", shortcut: "Alt + Ctrl + 3" },
    { action: "Link", shortcut: "Ctrl + K" },
    { action: "Code", shortcut: "Ctrl + `" },
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            Keyboard Shortcuts
          </DialogTitle>
          <DialogDescription>
            Quickly navigate the editor with these keyboard shortcuts.
          </DialogDescription>
        </DialogHeader>
        <div className="mt-2 max-h-[60vh] overflow-y-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Action</TableHead>
                <TableHead className="text-right">Shortcut</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {shortcuts.map((shortcut) => (
                <TableRow key={shortcut.action}>
                  <TableCell>{shortcut.action}</TableCell>
                  <TableCell className="text-right font-mono">
                    {shortcut.shortcut}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default KeyboardShortcutMenu;
