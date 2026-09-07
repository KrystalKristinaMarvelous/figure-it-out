"use client";

import { useEffect, useState, useTransition } from "react";
import { Check } from "lucide-react";
import type { ProfileRow, PortfolioItemRow } from "@/lib/supabase/database.types";
import {
  updateProfile,
  saveThemePref,
  addPortfolioItem,
  deletePortfolioItem,
} from "@/lib/actions";
import { SKINS, usePrefs } from "@/components/theme";
import { Button } from "@/components/ui/button";
import { Input, Textarea, Label } from "@/components/ui/field";
import { cn } from "@/lib/utils";

export function SettingsClient({
  profile,
  email,
  items,
}: {
  profile: ProfileRow;
  email: string;
  items: PortfolioItemRow[];
}) {
  return (
    <div className="space-y-12">
      <ThemeSection />
      <ProfileSection profile={profile} email={email} />
      <ExternalWorkSection items={items} />
    </div>
  );
}

function ExternalWorkSection({ items }: { items: PortfolioItemRow[] }) {
  const [f, setF] = useState({ title: "", kind: "", year: "", blurb: "", link_url: "" });
  const [pending, start] = useTransition();
  const set = (k: keyof typeof f, v: string) => setF((s) => ({ ...s, [k]: v }));

  return (
    <section>
      <p className="eyebrow mb-1">Finished work from elsewhere</p>
      <p className="voice mb-5 text-[14px] text-muted">
        Work you completed outside FIO. It shows on your profile alongside finished projects.
      </p>

      {items.length > 0 && (
        <ul className="hairline-x framed mb-5">
          {items.map((it) => (
            <li key={it.id} className="flex items-center justify-between gap-3 py-2.5">
              <span className="min-w-0">
                <span className="text-[13px] font-medium text-ink">{it.title}</span>
                <span className="mono ml-2 text-[10px] uppercase tracking-[0.05em] text-faint">
                  {[it.kind, it.year].filter(Boolean).join(" · ")}
                </span>
              </span>
              <button
                onClick={() => start(() => deletePortfolioItem(it.id).then(() => {}))}
                className="mono text-[10px] uppercase tracking-[0.05em] text-faint hover:text-accent-ink"
              >
                Remove
              </button>
            </li>
          ))}
        </ul>
      )}

      <div className="grid gap-3 sm:grid-cols-2">
        <div className="space-y-1.5 sm:col-span-2">
          <Label>Title</Label>
          <Input value={f.title} onChange={(e) => set("title", e.target.value)} />
        </div>
        <div className="space-y-1.5">
          <Label>Kind</Label>
          <Input value={f.kind} onChange={(e) => set("kind", e.target.value)} placeholder="novel, thesis, trip…" />
        </div>
        <div className="space-y-1.5">
          <Label>Year</Label>
          <Input value={f.year} onChange={(e) => set("year", e.target.value)} inputMode="numeric" />
        </div>
        <div className="space-y-1.5 sm:col-span-2">
          <Label>Link <span className="text-faint">optional</span></Label>
          <Input value={f.link_url} onChange={(e) => set("link_url", e.target.value)} placeholder="https://" />
        </div>
        <div className="space-y-1.5 sm:col-span-2">
          <Label>A line about it</Label>
          <Textarea value={f.blurb} onChange={(e) => set("blurb", e.target.value)} rows={2} />
        </div>
      </div>
      <Button
        className="mt-3"
        variant="outline"
        size="sm"
        disabled={pending || !f.title.trim()}
        onClick={() =>
          start(async () => {
            await addPortfolioItem(f);
            setF({ title: "", kind: "", year: "", blurb: "", link_url: "" });
          })
        }
      >
        Add
      </Button>
    </section>
  );
}

function ThemeSection() {
  const { mode, skin, setMode, setSkin } = usePrefs();
  const [, start] = useTransition();

  function pick(id: string) {
    setSkin(id);
    start(() => saveThemePref({ skin: id }).catch(() => {}));
  }
  function pickMode(m: "light" | "dark" | "system") {
    setMode(m);
    start(() => saveThemePref({ theme: m }).catch(() => {}));
  }

  return (
    <section>
      <p className="eyebrow mb-1">Appearance</p>
      <p className="voice mb-5 text-[14px] text-muted">
        A theme is yours alone — it doesn&apos;t change how anyone else sees the app.
      </p>

      <div className="mb-6 flex gap-2">
        {(["light", "dark", "system"] as const).map((m) => (
          <button
            key={m}
            onClick={() => pickMode(m)}
            className={cn(
              "rounded-[var(--radius-sm)] border px-3 py-1.5 text-[12.5px] capitalize transition-colors",
              mode === m ? "border-accent bg-accent-wash/40 text-accent-ink" : "border-hairline text-muted",
            )}
          >
            {m}
          </button>
        ))}
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        {SKINS.map((s) => (
          <button
            key={s.id}
            onClick={() => pick(s.id)}
            className={cn(
              "group relative overflow-hidden rounded-[var(--radius)] border p-4 text-left transition-colors",
              skin === s.id ? "border-accent" : "border-hairline hover:border-ink-2",
            )}
          >
            <SkinSwatch id={s.id} />
            <div className="mt-3 flex items-center justify-between">
              <span className="text-[13px] font-medium text-ink">{s.name}</span>
              {skin === s.id && (
                <span className="grid h-4 w-4 place-items-center rounded-full bg-accent text-white">
                  <Check size={10} strokeWidth={3} />
                </span>
              )}
            </div>
            <p className="voice mt-0.5 text-[12px] leading-snug text-muted">{s.blurb}</p>
          </button>
        ))}
      </div>
    </section>
  );
}

/** A tiny preview strip using the skin's own tokens, forced via data-skin. */
function SkinSwatch({ id }: { id: string }) {
  const ref = (el: HTMLDivElement | null) => {
    if (el) el.setAttribute("data-skin", id);
  };
  return (
    <div
      ref={ref}
      data-theme="light"
      className="flex h-12 overflow-hidden rounded-[var(--radius-sm)] border border-hairline-2"
    >
      <div className="w-1/2" style={{ background: "var(--bg)" }}>
        <div
          className="m-2 h-2 w-8 rounded-full"
          style={{ background: "var(--ink)" }}
        />
        <div
          className="mx-2 h-2 w-5 rounded-full"
          style={{ background: "var(--accent)" }}
        />
      </div>
      <div
        className="w-1/2"
        data-theme="dark"
        style={{ background: "var(--bg)" }}
      >
        <div className="m-2 h-2 w-8 rounded-full" style={{ background: "var(--ink)" }} />
        <div className="mx-2 h-2 w-5 rounded-full" style={{ background: "var(--accent)" }} />
      </div>
    </div>
  );
}

function ProfileSection({ profile, email }: { profile: ProfileRow; email: string }) {
  const [form, setForm] = useState({
    display_name: profile.display_name ?? "",
    username: profile.username ?? "",
    headline: profile.headline ?? "",
    bio: profile.bio ?? "",
  });
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, start] = useTransition();

  useEffect(() => {
    if (saved) {
      const t = setTimeout(() => setSaved(false), 2000);
      return () => clearTimeout(t);
    }
  }, [saved]);

  const set = (k: keyof typeof form, v: string) => setForm((s) => ({ ...s, [k]: v }));

  function save() {
    setError(null);
    start(async () => {
      try {
        await updateProfile(form);
        setSaved(true);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Could not save");
      }
    });
  }

  return (
    <section>
      <p className="eyebrow mb-1">Profile</p>
      <p className="voice mb-5 text-[14px] text-muted">
        Visible to other signed-in FIO members. The public parts of your projects show here too.
      </p>

      <div className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="dn">Name</Label>
            <Input id="dn" value={form.display_name} onChange={(e) => set("display_name", e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="un" hint="fio.app/u/…">
              Username
            </Label>
            <Input
              id="un"
              value={form.username}
              onChange={(e) => set("username", e.target.value.toLowerCase())}
              placeholder="raven_writes"
            />
          </div>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="hl">Headline</Label>
          <Input
            id="hl"
            value={form.headline}
            onChange={(e) => set("headline", e.target.value)}
            placeholder="Writing a fantasy novel · planning a wedding · learning Portuguese"
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="bio">Bio</Label>
          <Textarea id="bio" value={form.bio} onChange={(e) => set("bio", e.target.value)} rows={4} />
        </div>
        <p className="text-[11.5px] text-faint">Signed in as {email}</p>
        {error && <p className="text-[13px] text-accent-ink">{error}</p>}
        <Button variant="primary" size="sm" onClick={save} disabled={pending}>
          {pending ? "Saving…" : saved ? "Saved" : "Save profile"}
        </Button>
      </div>
    </section>
  );
}
