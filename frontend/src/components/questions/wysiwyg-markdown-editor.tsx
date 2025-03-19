import React, { useState, useRef, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import { Button } from "@/components/ui/button";
import {
  Bold,
  Italic,
  List,
  ListOrdered,
  Quote,
  Heading1,
  Heading2,
  Heading3,
  Code,
  Link,
  Keyboard,
  ChevronDown,
  Eye,
  Code2,
  Columns,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import KeyboardShortcutMenu from "./keyboard-shortcut-menu";

interface WysiwygMarkdownEditorProps {
  value: string;
  onChange: (value: string) => void;
  className?: string;
  placeholder?: string;
}

const WysiwygMarkdownEditor: React.FC<WysiwygMarkdownEditorProps> = ({
  value,
  onChange,
  className = "",
  placeholder = "Write something...",
}) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const previewRef = useRef<HTMLDivElement>(null);
  // Three view modes: "preview", "markdown", "split"
  const [viewMode, setViewMode] = useState<"preview" | "markdown" | "split">(
    "markdown"
  );
  const [showShortcutMenu, setShowShortcutMenu] = useState(false);

  // Helper computed properties based on viewMode
  const showMarkdown = viewMode === "markdown" || viewMode === "split";
  const showPreview = viewMode === "preview" || viewMode === "split";
  const isSplitView = viewMode === "split";

  // Toggle between view modes cyclically
  const cycleViewMode = () => {
    setViewMode((current) => {
      if (current === "preview") return "markdown";
      if (current === "markdown") return "split";
      return "preview";
    });
  };

  // Handle keyboard shortcuts
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.ctrlKey || e.metaKey) {
      if (e.key === "b") {
        e.preventDefault();
        handleToolbarAction("bold");
      } else if (e.key === "i") {
        e.preventDefault();
        handleToolbarAction("italic");
      } else if (e.key === "1" && e.altKey) {
        e.preventDefault();
        handleToolbarAction("heading1");
      } else if (e.key === "2" && e.altKey) {
        e.preventDefault();
        handleToolbarAction("heading2");
      } else if (e.key === "3" && e.altKey) {
        e.preventDefault();
        handleToolbarAction("heading3");
      } else if (e.key === "k") {
        e.preventDefault();
        handleToolbarAction("link");
      } else if (e.key === "`") {
        e.preventDefault();
        handleToolbarAction("code");
      } else if (e.key === "/") {
        e.preventDefault();
        setShowShortcutMenu(true);
      } else if (e.key === "e" && e.altKey) {
        // Alt+Ctrl+E for split view
        e.preventDefault();
        setViewMode("split");
      }
    } else if (e.key === "p" && e.altKey) {
      // Cycle through view modes instead of just toggling
      e.preventDefault();
      cycleViewMode();
    }
  };

  const handleToolbarAction = (
    action:
      | "bold"
      | "italic"
      | "heading1"
      | "heading2"
      | "heading3"
      | "quote"
      | "code"
      | "link"
      | "list"
      | "orderedList"
  ) => {
    if (!textareaRef.current) return;

    const textarea = textareaRef.current;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = value.substring(start, end);
    let replacementText = "";

    switch (action) {
      case "bold":
        replacementText = `**${selectedText}**`;
        break;
      case "italic":
        replacementText = `*${selectedText}*`;
        break;
      case "heading1":
        replacementText = `# ${selectedText}`;
        break;
      case "heading2":
        replacementText = `## ${selectedText}`;
        break;
      case "heading3":
        replacementText = `### ${selectedText}`;
        break;
      case "quote":
        replacementText = `> ${selectedText.split("\n").join("\n> ")}`;
        break;
      case "code":
        replacementText = selectedText.includes("\n")
          ? `\`\`\`\n${selectedText}\n\`\`\``
          : `\`${selectedText}\``;
        break;
      case "link":
        replacementText = `[${selectedText || "Link text"}](url)`;
        break;
      case "list":
        replacementText = selectedText
          .split("\n")
          .map((line) => `- ${line}`)
          .join("\n");
        break;
      case "orderedList":
        replacementText = selectedText
          .split("\n")
          .map((line, i) => `${i + 1}. ${line}`)
          .join("\n");
        break;
    }

    const newValue =
      value.substring(0, start) + replacementText + value.substring(end);
    onChange(newValue);

    // Set cursor position after update
    setTimeout(() => {
      textarea.focus();
      const newCursorPos = start + replacementText.length;
      textarea.setSelectionRange(newCursorPos, newCursorPos);
    }, 0);
  };

  // Synchronize scrolling between textarea and preview
  useEffect(() => {
    const syncScroll = () => {
      if (textareaRef.current && previewRef.current && viewMode === "split") {
        const textareaEl = textareaRef.current;
        const previewEl = previewRef.current;

        const textareaScrollPercentage =
          textareaEl.scrollTop /
          (textareaEl.scrollHeight - textareaEl.clientHeight || 1);

        previewEl.scrollTop =
          textareaScrollPercentage *
          (previewEl.scrollHeight - previewEl.clientHeight || 1);
      }
    };

    const textarea = textareaRef.current;
    if (textarea) {
      textarea.addEventListener("scroll", syncScroll);
      return () => {
        textarea.removeEventListener("scroll", syncScroll);
      };
    }
  }, [viewMode]);

  // Ensure the textarea matches the size of its content
  useEffect(() => {
    const resizeTextarea = () => {
      if (textareaRef.current) {
        textareaRef.current.style.height = "auto";
        textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
      }
    };

    resizeTextarea();
    window.addEventListener("resize", resizeTextarea);

    return () => {
      window.removeEventListener("resize", resizeTextarea);
    };
  }, [value]);

  // Get the icon and text for the current view mode
  const getViewModeInfo = () => {
    switch (viewMode) {
      case "preview":
        return { icon: <Eye className="h-4 w-4 mr-2" />, text: "Preview" };
      case "markdown":
        return { icon: <Code2 className="h-4 w-4 mr-2" />, text: "Markdown" };
      case "split":
        return {
          icon: <Columns className="h-4 w-4 mr-2" />,
          text: "Split View",
        };
    }
  };

  const viewModeInfo = getViewModeInfo();

  return (
    <div
      className={`flex flex-col border rounded-md overflow-hidden ${className}`}
    >
      <div className="flex items-center p-2 border-b bg-muted/30 gap-0.5 flex-wrap">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => handleToolbarAction("bold")}
          className="h-8 w-8"
          title="Bold (Ctrl+B)"
        >
          <Bold className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => handleToolbarAction("italic")}
          className="h-8 w-8"
          title="Italic (Ctrl+I)"
        >
          <Italic className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => handleToolbarAction("heading1")}
          className="h-8 w-8"
          title="Heading 1 (Alt+Ctrl+1)"
        >
          <Heading1 className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => handleToolbarAction("heading2")}
          className="h-8 w-8"
          title="Heading 2 (Alt+Ctrl+2)"
        >
          <Heading2 className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => handleToolbarAction("heading3")}
          className="h-8 w-8"
          title="Heading 3 (Alt+Ctrl+3)"
        >
          <Heading3 className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => handleToolbarAction("quote")}
          className="h-8 w-8"
          title="Quote"
        >
          <Quote className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => handleToolbarAction("code")}
          className="h-8 w-8"
          title="Code (Ctrl+`)"
        >
          <Code className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => handleToolbarAction("link")}
          className="h-8 w-8"
          title="Link (Ctrl+K)"
        >
          <Link className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => handleToolbarAction("list")}
          className="h-8 w-8"
          title="Bulleted List"
        >
          <List className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => handleToolbarAction("orderedList")}
          className="h-8 w-8"
          title="Numbered List"
        >
          <ListOrdered className="h-4 w-4" />
        </Button>

        <Button
          variant="ghost"
          size="icon"
          onClick={() => setShowShortcutMenu(true)}
          className="h-8 w-8"
          title="Keyboard Shortcuts (Ctrl+/)"
        >
          <Keyboard className="h-4 w-4" />
        </Button>

        <div className="ml-auto">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="text-xs flex items-center"
                title="View Mode (Alt+P to cycle)"
              >
                {viewModeInfo.icon}
                {viewModeInfo.text}
                <ChevronDown className="h-3 w-3 ml-1" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem
                onClick={() => setViewMode("preview")}
                className={viewMode === "preview" ? "bg-accent" : ""}
              >
                <Eye className="h-4 w-4 mr-2" />
                <span>Preview Mode</span>
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => setViewMode("markdown")}
                className={viewMode === "markdown" ? "bg-accent" : ""}
              >
                <Code2 className="h-4 w-4 mr-2" />
                <span>Markdown Mode</span>
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => setViewMode("split")}
                className={viewMode === "split" ? "bg-accent" : ""}
              >
                <Columns className="h-4 w-4 mr-2" />
                <span>Split View</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <div className={`relative min-h-[300px] ${isSplitView ? "flex" : ""}`}>
        {/* The editable textarea - visibility depends on viewMode */}
        <div
          className={`${isSplitView ? "w-1/2 border-r" : "w-full"} relative`}
        >
          <textarea
            ref={textareaRef}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            className={`w-full h-full min-h-[300px] p-4 resize-none outline-none font-mono text-sm ${
              showMarkdown ? "" : "opacity-0 absolute inset-0 z-10"
            }`}
            style={{
              caretColor:
                viewMode === "markdown" || viewMode === "split"
                  ? "currentColor"
                  : "black",
              background: "transparent",
            }}
          />
        </div>

        {/* Preview layer - visibility depends on viewMode */}
        <div
          ref={previewRef}
          className={`${isSplitView ? "w-1/2" : "w-full"} h-full min-h-[300px] p-4 overflow-auto max-w-none markdown-content whitespace-pre-wrap ${
            showPreview ? "" : "hidden"
          }`}
          style={{ pointerEvents: "none" }}
          onClick={() => textareaRef.current?.focus()}
        >
          {value ? (
            <ReactMarkdown>{value}</ReactMarkdown>
          ) : (
            <p className="text-muted-foreground italic">{placeholder}</p>
          )}
        </div>
      </div>

      {/* Keyboard Shortcut Menu */}
      <KeyboardShortcutMenu
        open={showShortcutMenu}
        onOpenChange={setShowShortcutMenu}
      />
    </div>
  );
};

export default WysiwygMarkdownEditor;
