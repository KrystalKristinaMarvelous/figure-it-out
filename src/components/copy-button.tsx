"use client";

import { useState } from "react";
import { Check, Copy } from "lucide-react";
import { cn } from "@/lib/utils";

export function CopyButton({
  text,
  label = "Copy",
  className,
}: {
  text: string | (() => string);
  label?: string;
  className?: string;
}) {
  const [done, setDone] = useState(false);

  async function copy() {
    const value = typeof text === "function" ? text() : text;
    try {
      await navigator.clipboard.writeText(value);
    } catch {
      // fallback for non-secure contexts
      const ta = document.createElement("textarea");
      ta.value = value;
      ta.style.position = "fixed";
      ta.style.opacity = "0";
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      ta.remove();
    }
    setDone(true);
    setTimeout(() => setDone(false), 1600);
  }

  return (
    <button
      onClick={(e) => {
        e.stopPropagation();
        copy();
      }}
      className={cn(
        "pressable mono inline-flex items-center gap-1 text-[10.5px] uppercase tracking-[0.05em] text-muted hover:text-accent-ink",
        className,
      )}
    >
      {done ? <Check size={12} className="text-ok" /> : <Copy size={12} />}
      {done ? "Copied" : label}
    </button>
  );
}
