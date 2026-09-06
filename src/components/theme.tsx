"use client";

import { useEffect, useState } from "react";
import { Monitor, Moon, Sun } from "lucide-react";
import { cn } from "@/lib/utils";

type Mode = "light" | "dark" | "system";

const KEY = "fio-theme";

/** Inline, runs before paint — avoids a flash of the wrong theme. */
export function ThemeScript() {
  const js = `(function(){try{var m=localStorage.getItem('${KEY}')||'system';var d=m==='dark'||(m==='system'&&matchMedia('(prefers-color-scheme:dark)').matches);document.documentElement.setAttribute('data-theme',d?'dark':'light');}catch(e){}})();`;
  return <script dangerouslySetInnerHTML={{ __html: js }} />;
}

export function applyTheme(mode: Mode) {
  const dark =
    mode === "dark" ||
    (mode === "system" &&
      window.matchMedia("(prefers-color-scheme: dark)").matches);
  document.documentElement.setAttribute("data-theme", dark ? "dark" : "light");
}

export function ThemeToggle({ className }: { className?: string }) {
  const [mode, setMode] = useState<Mode>("system");

  useEffect(() => {
    const stored = (localStorage.getItem(KEY) as Mode) || "system";
    setMode(stored);
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const onChange = () => {
      if ((localStorage.getItem(KEY) as Mode) === "system") applyTheme("system");
    };
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  function set(next: Mode) {
    setMode(next);
    localStorage.setItem(KEY, next);
    applyTheme(next);
  }

  const opts: { m: Mode; icon: typeof Sun; label: string }[] = [
    { m: "light", icon: Sun, label: "Light" },
    { m: "dark", icon: Moon, label: "Dark" },
    { m: "system", icon: Monitor, label: "System" },
  ];

  return (
    <div
      className={cn(
        "inline-flex items-center gap-0.5 rounded-md border border-hairline bg-raised p-0.5",
        className,
      )}
    >
      {opts.map(({ m, icon: Icon, label }) => (
        <button
          key={m}
          type="button"
          aria-label={label}
          aria-pressed={mode === m}
          onClick={() => set(m)}
          className={cn(
            "grid h-6 w-6 place-items-center rounded-sm text-muted transition-colors",
            mode === m && "bg-surface text-ink shadow-[var(--shadow)]",
          )}
        >
          <Icon size={13} />
        </button>
      ))}
    </div>
  );
}
