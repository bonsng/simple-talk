"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Moon, Sun } from "lucide-react";

export default function DarkModeIcon() {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const prefersDark =
      localStorage.theme === "dark" ||
      (!("theme" in localStorage) &&
        window.matchMedia("(prefers-color-scheme: dark)").matches);
    document.documentElement.setAttribute(
      "data-theme",
      prefersDark ? "dark" : "light",
    );
    setIsDark(prefersDark);
  }, []);

  function toggleDarkMode() {
    const currentTheme = document.documentElement.getAttribute("data-theme");
    const newTheme = currentTheme === "dark" ? "light" : "dark";
    document.documentElement.setAttribute("data-theme", newTheme);
    localStorage.theme = newTheme;
    setIsDark(newTheme === "dark");
  }

  return (
    <Button
      onClick={toggleDarkMode}
      aria-label="toggle dark mode"
      variant="outline"
      size="icon"
      className="rounded-3xl absolute top-5 right-5"
    >
      {isDark ? (
        <Moon className="text-white" />
      ) : (
        <Sun className="text-black" />
      )}
    </Button>
  );
}
