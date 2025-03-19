import QuestionManager from "@/components/questions/QuestionManager";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/add-question")({
  component: RouteComponent,
});

function RouteComponent() {
  return <QuestionManager />;
}
