import AffirmationTracker from "@/components/AffirmationTracker";
import GratitudePage from "@/components/gratitude/GratitudePage";
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
          <TabsList className="grid w-full max-l-md mx-auto grid-cols-4 mb-8">
            <TabsTrigger value="question">Daily Question</TabsTrigger>
            <TabsTrigger value="gratitude">Gratitude Journal</TabsTrigger>
            <TabsTrigger value="affirmation">Affirmation</TabsTrigger>
            <TabsTrigger value="creativity">Creativity Journal</TabsTrigger>
          </TabsList>

          {/* Move these TabsContent inside this Tabs component */}
          <div className="mt-8">
            <TabsContent value="question">
              <DailyQuestion />
            </TabsContent>

            <TabsContent value="gratitude">
              <GratitudePage />
            </TabsContent>

            <TabsContent value="affirmation">
              <AffirmationTracker />
            </TabsContent>

            <TabsContent value="creativity">
              <div>Creativity jouranl</div>
            </TabsContent>
          </div>
        </Tabs>
      </main>
    </>
  );
}
