import AffirmationTracker from "@/components/AffirmationTracker";
import DailyQuestion from "@/components/questions/DailyQuestion";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
  component: Index,
});

function Index() {
  return (
    <>
      <main className="container mx-auto py-8 px-4">
        <Tabs defaultValue="question" className="w-full">
          <TabsList className="grid w-full max-l-md mx-auto grid-cols-3 mb-8">
            <TabsTrigger value="question">Daily Question</TabsTrigger>
            <TabsTrigger value="gratitude">Gratitude Journal</TabsTrigger>
            <TabsTrigger value="affirmation">Affirmation</TabsTrigger>
          </TabsList>

          {/* Move these TabsContent inside this Tabs component */}
          <div className="mt-8">
            <TabsContent value="question">
              <DailyQuestion />
            </TabsContent>

            <TabsContent value="gratitude">
              <div>Gratitude journal</div>
            </TabsContent>

            <TabsContent value="affirmation">
              <AffirmationTracker />
            </TabsContent>
          </div>
        </Tabs>
      </main>
    </>
  );
}
