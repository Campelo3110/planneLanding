"use client"

import { Moon, Sun } from "lucide-react"

export function ThemeToggle({ label }: { label: string }) {
  function toggleTheme() {
    const root = document.documentElement
    const nextTheme = root.classList.contains("dark") ? "light" : "dark"

    root.classList.toggle("dark", nextTheme === "dark")
    root.style.colorScheme = nextTheme
    localStorage.setItem("theme", nextTheme)
  }

  return (
    <button
      type="button"
      aria-label={label}
      onClick={toggleTheme}
      className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-border bg-background/80 text-foreground shadow-sm transition-colors hover:border-primary hover:text-primary"
    >
      <Sun className="hidden h-4 w-4 dark:block" />
      <Moon className="h-4 w-4 dark:hidden" />
    </button>
  )
}
