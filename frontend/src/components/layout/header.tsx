import { Link, useNavigate } from "@tanstack/react-router";
import ThemeToggle from "../reusable/theme-toggle";
import { Calendar, ScrollText } from "lucide-react";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge"; // Import Badge from shadcn/ui
import { VERSION_NUMBER } from "@/lib/version";
import Logo from "@/assets/logo.svg";

export default function Header() {
  const navigate = useNavigate();
  return (
    <header className="sticky top-0 z-10 bg-background border-b p-4 flex justify-between items-center">
      <Link to="/" className="flex items-center gap-2">
        <img src={Logo} alt="Daily Reflection Logo" className="h-16 w-16" />
        <h1 className="text-xl font-bold">Daily Reflection</h1>
        <Badge variant="secondary" className="text-xs">
          v{VERSION_NUMBER}
        </Badge>
      </Link>
      <div className="flex items-center space-x-4">
        <Button
          variant="outline"
          size="icon"
          className="rounded-full h-10 w-10"
          onClick={() => navigate({ to: "/calendar" })}
          title="View Activity Calendar"
        >
          <Calendar size={18} />
        </Button>
        <Link to="/add-question">
          <h4>Add Question</h4>
        </Link>
        <Button
          variant="outline"
          size="icon"
          className="rounded-full h-10 w-10"
          onClick={() => navigate({ to: "/logs" })}
          title="View Database Entries"
        >
          <ScrollText size={18} />
        </Button>
        <ThemeToggle />
      </div>
    </header>
  );
}
