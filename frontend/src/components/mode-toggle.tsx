import { Moon, Sun, Monitor } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/components/theme-provider";
import { useEffect, useState } from "react";

type Theme = "dark" | "light" | "system";

export function ModeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Ensure component is mounted before rendering to avoid hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  const cycleTheme = () => {
    const themesSelection: Theme[] = ["light", "dark", "system"];
    const currentIndex = themesSelection.indexOf(theme);
    const nextIndex = (currentIndex + 1) % themesSelection.length;
    setTheme(themesSelection[nextIndex]);
  };

  if (!mounted) {
    return null;
  }

  const getIcon = () => {
    switch (theme) {
      case "light":
        return <Sun className="h-[1.2rem] w-[1.2rem]" />;
      case "dark":
        return <Moon className="h-[1.2rem] w-[1.2rem]" />;
      case "system":
        return <Monitor className="h-[1.2rem] w-[1.2rem]" />;
      default:
        return <Sun className="h-[1.2rem] w-[1.2rem]" />;
    }
  };

  const getLabel = () => {
    return theme.charAt(0).toUpperCase() + theme.slice(1);
  };

  return (
    <Button
      variant="outline"
      size="default"
      className="flex items-center gap-2"
      onClick={cycleTheme}
    >
      {getIcon()}
      <span className="hidden sm:inline">{getLabel()}</span>
    </Button>
  );
}

export default ModeToggle;
