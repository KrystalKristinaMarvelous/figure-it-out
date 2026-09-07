"use client";

import { useEffect, useState } from "react";
import { Monitor, Moon, Sun } from "lucide-react";
import { cn } from "@/lib/utils";

type Mode = "light" | "dark" | "system";

const MODE_KEY = "fio-theme";
const SKIN_KEY = "fio-skin";

export const SKINS = [
  { id: "editorial", name: "Editorial", blurb: "Bone paper, oxblood, a literary serif. The default.", kind: "palette" },
  { id: "warm", name: "Warm", blurb: "Cream and terracotta. Same layout, sunlit.", kind: "palette" },
  { id: "midnight", name: "Midnight", blurb: "Deep navy, cyan and violet. Same layout, after dark.", kind: "palette" },
  { id: "paper", name: "Paper", blurb: "A manuscript. Serif everywhere, no boxes, narrow column.", kind: "theme" },
  { id: "cards", name: "Cards", blurb: "A soft product UI — floating panels, pills, more air.", kind: "theme" },
  { id: "bare", name: "Bare", blurb: "Brutalist. Hard boxes, bold grotesque, uppercase, no radius.", kind: "theme" },
  { id: "terminal", name: "Terminal", blurb: "A TUI. Monospace, drawn borders, > prompts, all caps.", kind: "theme" },
] as const;

export type SkinId = (typeof SKINS)[number]["id"];
export const DEFAULT_SKIN: SkinId = "editorial";

/** Inline, runs before paint — no flash of the wrong theme. */
export function ThemeScript() {
  const js = `(function(){try{
    var m=localStorage.getItem('${MODE_KEY}')||'system';
    var d=m==='dark'||(m==='system'&&matchMedia('(prefers-color-scheme:dark)').matches);
    var s=localStorage.getItem('${SKIN_KEY}')||'${DEFAULT_SKIN}';
    var r=document.documentElement;
    r.setAttribute('data-theme',d?'dark':'light');
    r.setAttribute('data-skin',s);
  }catch(e){}})();`;
  return <script dangerouslySetInnerHTML={{ __html: js }} />;
}

/** On a fresh device localStorage is empty — adopt the server-saved prefs. */
export function PrefSync({ theme, skin }: { theme?: string | null; skin?: string | null }) {
  useEffect(() => {
    try {
      if (theme && !localStorage.getItem(MODE_KEY)) {
        localStorage.setItem(MODE_KEY, theme);
        applyTheme(theme as Mode);
      }
      if (skin && !localStorage.getItem(SKIN_KEY)) {
        localStorage.setItem(SKIN_KEY, skin);
        applySkin(skin);
      }
    } catch {
      /* ignore */
    }
  }, [theme, skin]);
  return null;
}

function resolveDark(mode: Mode) {
  return (
    mode === "dark" ||
    (mode === "system" && window.matchMedia("(prefers-color-scheme: dark)").matches)
  );
}

export function applyTheme(mode: Mode) {
  document.documentElement.setAttribute("data-theme", resolveDark(mode) ? "dark" : "light");
}

export function applySkin(skin: string) {
  document.documentElement.setAttribute("data-skin", skin);
}

/** Read the current stored preferences (client only). */
export function usePrefs() {
  const [mode, setModeState] = useState<Mode>("system");
  const [skin, setSkinState] = useState<string>(DEFAULT_SKIN);

  useEffect(() => {
    setModeState((localStorage.getItem(MODE_KEY) as Mode) || "system");
    setSkinState(localStorage.getItem(SKIN_KEY) || DEFAULT_SKIN);
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const onChange = () => {
      if ((localStorage.getItem(MODE_KEY) as Mode) === "system") applyTheme("system");
    };
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  const setMode = (m: Mode) => {
    setModeState(m);
    localStorage.setItem(MODE_KEY, m);
    applyTheme(m);
  };
  const setSkin = (s: string) => {
    setSkinState(s);
    localStorage.setItem(SKIN_KEY, s);
    applySkin(s);
  };
  return { mode, skin, setMode, setSkin };
}

export function ThemeToggle({ className }: { className?: string }) {
  const { mode, setMode } = usePrefs();

  const opts: { m: Mode; icon: typeof Sun; label: string }[] = [
    { m: "light", icon: Sun, label: "Light" },
    { m: "dark", icon: Moon, label: "Dark" },
    { m: "system", icon: Monitor, label: "System" },
  ];

  return (
    <div
      className={cn(
        "inline-flex items-center gap-0.5 rounded-[var(--radius-sm)] border border-hairline bg-paper p-0.5",
        className,
      )}
    >
      {opts.map(({ m, icon: Icon, label }) => (
        <button
          key={m}
          type="button"
          aria-label={label}
          aria-pressed={mode === m}
          onClick={() => setMode(m)}
          className={cn(
            "grid h-6 w-6 place-items-center rounded-[calc(var(--radius-sm)-2px)] text-muted transition-colors",
            mode === m && "bg-sunken text-ink",
          )}
        >
          <Icon size={13} />
        </button>
      ))}
    </div>
  );
}
