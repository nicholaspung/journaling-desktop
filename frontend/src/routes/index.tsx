import AffirmationTracker from "@/components/AffirmationTracker";
import DailyQuestion from "@/components/DailyQuestion";
import LogViewer from "@/components/LogViewer";
import { useTheme } from "@/components/theme-provider";
import { Button } from "@/components/ui/button";
import { Toaster } from "@/components/ui/sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { createFileRoute } from "@tanstack/react-router";
import { MoonIcon, SunIcon } from "lucide-react";

export const Route = createFileRoute("/")({
  component: Index,
});

function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
    >
      {theme === "dark" ? (
        <SunIcon className="h-5 w-5" />
      ) : (
        <MoonIcon className="h-5 w-5" />
      )}
    </Button>
  );
}

function Index() {
  return (
    <>
      <div className="min-h-screen bg-background text-foreground">
        <header className="border-b p-4 flex justify-between items-center">
          <h1 className="text-xl font-bold">Daily Reflection</h1>
          <ThemeToggle />
        </header>

        <main className="container mx-auto py-8 px-4">
          <Tabs defaultValue="question" className="w-full">
            <TabsList className="grid w-full max-w-md mx-auto grid-cols-2 mb-8">
              <TabsTrigger value="question">Daily Question</TabsTrigger>
              <TabsTrigger value="affirmation">Affirmation</TabsTrigger>
            </TabsList>

            <TabsContent value="question">
              <DailyQuestion />
            </TabsContent>

            <TabsContent value="affirmation">
              <AffirmationTracker />
            </TabsContent>
          </Tabs>
        </main>
      </div>
      <div>
        <div className="container mx-auto py-8 px-4">
          <h1 className="text-3xl font-bold mb-6">App Database Logs</h1>
          <p className="text-gray-500 dark:text-gray-400 mb-8">
            View and manage all your journal questions, answers, affirmations,
            and activity logs.
          </p>
          <LogViewer />
        </div>
      </div>
      <Toaster />
    </>
  );
}
