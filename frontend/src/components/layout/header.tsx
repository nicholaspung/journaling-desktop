import { Link } from "@tanstack/react-router";
import ThemeToggle from "../reusable/theme-toggle";

export default function Header() {
  return (
    <header className="border-b p-4 flex justify-between items-center">
      <Link to="/">
        <h1 className="text-xl font-bold">Daily Reflection</h1>
      </Link>
      <div className="flex items-center space-x-4">
        <Link to="/logs">
          <h4>Logs</h4>
        </Link>
        <ThemeToggle />
      </div>
    </header>
  );
}
