import LogViewer from "@/components/logs-viewer/log-viewer";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/logs")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <div>
      <div className="container mx-auto py-8 px-4">
        <h1 className="text-2xl font-bold mb-2">App Database Logs</h1>
        <p className="text-gray-500 dark:text-gray-400 mb-8">
          View and manage all your journal questions, answers, affirmations, and
          activity logs.
        </p>
        <LogViewer />
      </div>
    </div>
  );
}
