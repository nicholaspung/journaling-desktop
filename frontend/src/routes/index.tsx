import AffirmationTracker from "@/components/AffirmationTracker";
import DailyQuestion from "@/components/questions/DailyQuestion";
// import JournalPage from "@/components/questions/JournalPage";
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
          <TabsList className="grid w-full max-w-md mx-auto grid-cols-2 mb-8">
            <TabsTrigger value="question">Daily Question</TabsTrigger>
            <TabsTrigger value="affirmation">Affirmation</TabsTrigger>
          </TabsList>

          <TabsContent value="question">
            <DailyQuestion />
            {/* <JournalPage /> */}
          </TabsContent>

          <TabsContent value="affirmation">
            <AffirmationTracker />
          </TabsContent>
        </Tabs>
      </main>
    </>
  );
}
