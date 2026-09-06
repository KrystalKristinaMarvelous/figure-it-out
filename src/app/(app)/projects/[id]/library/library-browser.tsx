"use client";

import { useState, useTransition } from "react";
import { Search, Check } from "lucide-react";
import { addModule, archiveModuleByKey } from "@/lib/actions";
import { Icon } from "@/components/icon";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/field";

interface Mod {
  key: string;
  name: string;
  icon: string;
  intro: string;
  presentation: string;
  fields: string[];
  universal: boolean;
  status: string | null;
}

export function LibraryBrowser({
  projectId,
  modules,
  otherModules,
}: {
  projectId: string;
  modules: Mod[];
  otherModules: Mod[];
}) {
  const [q, setQ] = useState("");
  const [showOther, setShowOther] = useState(false);
  const [pending, start] = useTransition();
  const [busy, setBusy] = useState<string | null>(null);

  const match = (m: Mod) =>
    !q.trim() ||
    `${m.name} ${m.intro} ${m.fields.join(" ")}`.toLowerCase().includes(q.toLowerCase());

  const shown = (showOther ? [...modules, ...otherModules] : modules).filter(match);

  function toggle(m: Mod) {
    setBusy(m.key);
    start(async () => {
      if (m.status === "active") {
        // find pm via server; simple approach: archive by key is not available, so re-query client-side not needed — call a helper
        await archiveModuleByKey(projectId, m.key);
      } else {
        await addModule(projectId, m.key);
      }
      setBusy(null);
    });
  }

  return (
    <div className="space-y-4">
      <div className="relative">
        <Search size={14} className="absolute left-2.5 top-2.5 text-muted" />
        <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search modules" className="pl-8" />
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {shown.map((m) => (
          <Card key={m.key} className="flex flex-col p-3">
            <div className="flex items-center gap-2">
              <Icon name={m.icon} size={15} className="text-muted" />
              <h3 className="text-sm font-semibold text-ink">{m.name}</h3>
              {m.universal && <span className="text-[10px] text-muted">universal</span>}
            </div>
            <p className="mt-1 text-xs text-muted">{m.intro}</p>
            <p className="mt-2 text-[11px] text-muted/80">
              {m.presentation} · {m.fields.slice(0, 4).join(" · ")}
            </p>
            <div className="mt-3">
              {m.key === "rant_space" || m.key === "open_questions" ? (
                <span className="text-xs text-muted">always on</span>
              ) : m.status === "active" ? (
                <Button
                  variant="ghost"
                  size="sm"
                  disabled={pending && busy === m.key}
                  onClick={() => toggle(m)}
                >
                  <Check size={12} /> Added — remove
                </Button>
              ) : (
                <Button
                  variant="outline"
                  size="sm"
                  disabled={pending && busy === m.key}
                  onClick={() => toggle(m)}
                >
                  {m.status === "archived" ? "Restore" : "Add"}
                </Button>
              )}
            </div>
          </Card>
        ))}
      </div>

      {!showOther && otherModules.length > 0 && (
        <button onClick={() => setShowOther(true)} className="text-sm text-unresolved underline">
          Show {otherModules.length} modules from other categories
        </button>
      )}
    </div>
  );
}
