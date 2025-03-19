import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { ArrowUpRight } from "lucide-react";
import ContentDialog from "./content-dialog";

interface TrimmedContentItemProps {
  id: number | string;
  content: string;
  date: string;
  title?: string;
  maxLines?: number;
}

const TrimmedContentItem: React.FC<TrimmedContentItemProps> = ({
  id,
  content,
  date,
  title = "Content",
  maxLines = 2,
}) => {
  const [dialogOpen, setDialogOpen] = useState(false);

  // Determine if there are multiple paragraphs or if content is long
  const hasMultipleLines = content.includes("\n") || content.length > 150;

  // Create a subtitle with the date
  const formattedDate = date;

  return (
    <div key={id} className="border-b pb-2">
      <p className="text-xs text-muted-foreground mb-1">{formattedDate}</p>
      <div className="flex justify-between items-start gap-2">
        <p
          className={`font-medium line-clamp-${maxLines}`}
          style={{
            display: "-webkit-box",
            WebkitLineClamp: maxLines,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
          }}
        >
          {content}
        </p>
        {hasMultipleLines && (
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 mt-0 flex-shrink-0"
            onClick={() => setDialogOpen(true)}
          >
            <ArrowUpRight className="h-4 w-4" />
          </Button>
        )}
      </div>

      <ContentDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        title={title}
        subtitle={formattedDate}
        content={content}
      />
    </div>
  );
};

export default TrimmedContentItem;
