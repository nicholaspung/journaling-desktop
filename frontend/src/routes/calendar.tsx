import ActivityDashboard from "@/components/calendar/activity-dashboard";
import { Button } from "@/components/ui/button";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { ChevronLeft } from "lucide-react";

export const Route = createFileRoute("/calendar")({
  component: RouteComponent,
});

function RouteComponent() {
  const navigate = useNavigate();
  return (
    <main className="container mx-auto py-8 px-4">
      <div className="mb-6">
        <Button
          variant="outline"
          className="mb-4"
          onClick={() => navigate({ to: "/" })}
        >
          <ChevronLeft />
          Back to Journal
        </Button>
        <ActivityDashboard />
      </div>
    </main>
  );
}
