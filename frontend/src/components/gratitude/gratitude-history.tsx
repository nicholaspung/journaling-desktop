import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "../ui/accordion";
import { Badge } from "../ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { formatDate } from "@/lib/utils";
import { GratitudeEntry } from "@/types";

export default function GratitudeHistory({
  entries,
}: {
  entries: GratitudeEntry[];
}) {
  return (
    <div className="w-full md:w-1/2">
      <Card>
        <CardHeader>
          <CardTitle>Gratitude History</CardTitle>
          <CardDescription>Browse your past gratitude entries</CardDescription>
        </CardHeader>
        <CardContent>
          {entries.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              No gratitude entries yet. Start by adding some today!
            </p>
          ) : (
            <Accordion type="single" collapsible className="w-full">
              {entries.map((entry, index) => (
                <AccordionItem key={index} value={entry.date}>
                  <AccordionTrigger className="hover:no-underline">
                    <div className="flex justify-between items-center w-full pr-4">
                      <span>{formatDate(entry.date)}</span>
                      <Badge variant="outline">
                        {entry.items.length} entries
                      </Badge>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent>
                    <ul className="space-y-2 py-2">
                      {entry.items.map((item) => (
                        <li
                          key={item.id}
                          className="p-3 border rounded-md bg-card"
                        >
                          {item.content}
                        </li>
                      ))}
                    </ul>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
