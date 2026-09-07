"use client";

import { Moon, Sun } from "lucide-react";
import { useEffect, useSyncExternalStore } from "react";

const listeners = new Set<() => void>();
const subscribe = (listener: () => void) => { listeners.add(listener); return () => listeners.delete(listener); };
const getSnapshot = () => window.localStorage.getItem("applyloop-theme") === "dark";
const getServerSnapshot = () => false;

export function ThemeToggle() {
  const dark = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
  }, [dark]);
  function toggle() {
    const nextDark = !dark;
    document.documentElement.classList.toggle("dark", nextDark);
    window.localStorage.setItem("applyloop-theme", nextDark ? "dark" : "light");
    listeners.forEach((listener) => listener());
  }
  return <button type="button" onClick={toggle} aria-label={dark ? "Use light mode" : "Use dark mode"} title={dark ? "Light mode" : "Dark mode"} className="flex size-8 items-center justify-center rounded-full border border-border bg-tint text-muted transition hover:border-border-strong hover:text-ink">{dark ? <Sun className="size-3.5" /> : <Moon className="size-3.5" />}</button>;
}
