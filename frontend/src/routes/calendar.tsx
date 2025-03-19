import ActivityDashboard from "@/components/calendar/activity-dashboard";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/calendar")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <main className="container mx-auto py-8 px-4">
      <div className="mb-6">
        <ActivityDashboard />
      </div>
    </main>
  );
}
