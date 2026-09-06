"use client";

import { useMemo, useState, useTransition } from "react";
import { ArrowLeft, ArrowRight, Check } from "lucide-react";
import type { CategoryDef, SubtypeDef } from "@/lib/schema/taxonomy";
import type { Readiness } from "@/lib/schema/types";
import { Button } from "@/components/ui/button";
import { Input, Textarea, Label, CheckboxField } from "@/components/ui/field";
import { Icon } from "@/components/icon";
import { ReadinessMark } from "@/components/readiness-mark";
import { createProject } from "@/lib/actions";
import { cn } from "@/lib/utils";

type ModuleMeta = Record<string, { name: string; intro: string; icon: string }>;
type ReadinessMeta = Record<
  Readiness,
  { label: string; glyph: string; meaning: string; emphasis: string }
>;

const STEPS = ["Type", "Title", "Specifics", "Readiness", "Workspace"];

export function Wizard({
  taxonomy,
  readinessMeta,
  moduleMeta,
}: {
  taxonomy: CategoryDef[];
  readinessMeta: ReadinessMeta;
  moduleMeta: ModuleMeta;
}) {
  const [step, setStep] = useState(0);
  const [category, setCategory] = useState<string | null>(null);
  const [subtypeKey, setSubtypeKey] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [readiness, setReadiness] = useState<Readiness | null>(null);
  const [modules, setModules] = useState<string[]>([]);
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const cat = taxonomy.find((c) => c.key === category);
  const subtype: SubtypeDef | undefined = cat?.subtypes.find((s) => s.key === subtypeKey);

  const suggestedModules = useMemo(() => {
    if (!subtype || !readiness) return [];
    return Array.from(new Set(subtype.modules[readiness] ?? subtype.modules.vague));
  }, [subtype, readiness]);

  function goReadiness(r: Readiness) {
    setReadiness(r);
    if (subtype) setModules(Array.from(new Set(subtype.modules[r] ?? subtype.modules.vague)));
  }

  const canNext =
    (step === 0 && category && subtypeKey) ||
    (step === 1 && title.trim()) ||
    step === 2 ||
    (step === 3 && readiness) ||
    (step === 4 && modules.length > 0);

  function submit() {
    if (!category || !subtypeKey || !readiness) return;
    setError(null);
    start(async () => {
      try {
        await createProject({
          category,
          subtype: subtypeKey,
          title: title.trim(),
          description: description.trim() || undefined,
          spec_tags: tags,
          readiness,
          modules,
          target_type: subtype?.target?.type ?? null,
        });
      } catch (e) {
        setError(e instanceof Error ? e.message : "Something went wrong");
      }
    });
  }

  return (
    <div>
      {/* progress */}
      <div className="mb-10 flex items-center gap-1.5">
        {STEPS.map((s, i) => (
          <div key={s} className="flex items-center gap-1.5">
            <span
              className={cn(
                "h-1 rounded-full transition-all duration-300",
                i === step ? "w-8 bg-accent" : i < step ? "w-4 bg-ink-2" : "w-4 bg-hairline",
              )}
            />
          </div>
        ))}
        <span className="ml-2 text-[11.5px] text-faint">
          {STEPS[step]} · {step + 1} of {STEPS.length}
        </span>
      </div>

      <div className="animate-rise" key={step}>
        {step === 0 && (
          <div className="space-y-6">
            <h1 className="voice-xl">What are you making?</h1>
            <div className="space-y-2.5">
              {taxonomy.map((c) => (
                <div key={c.key}>
                  <button
                    onClick={() => {
                      setCategory(c.key);
                      setSubtypeKey(c.subtypes.length === 1 ? c.subtypes[0].key : null);
                    }}
                    className={cn(
                      "flex w-full items-center gap-3 rounded-[var(--radius-sm)] border px-3.5 py-3 text-left transition-colors",
                      category === c.key
                        ? "border-accent bg-accent-wash/40"
                        : "border-hairline hover:border-ink-2",
                    )}
                  >
                    <span className="grid h-8 w-8 shrink-0 place-items-center rounded-[var(--radius-sm)] bg-sunken text-muted">
                      <Icon name={c.icon} size={15} />
                    </span>
                    <span className="min-w-0">
                      <span className="block text-[13px] font-medium text-ink">{c.label}</span>
                      <span className="block truncate text-[12px] text-muted">{c.blurb}</span>
                    </span>
                  </button>
                  {category === c.key && c.subtypes.length > 1 && (
                    <div className="animate-pop mt-2 flex flex-wrap gap-1.5 pl-3">
                      {c.subtypes.map((s) => (
                        <button
                          key={s.key}
                          onClick={() => setSubtypeKey(s.key)}
                          className={cn(
                            "pressable rounded-full border px-3 py-1 text-[12.5px] transition-colors",
                            subtypeKey === s.key
                              ? "border-ink bg-ink text-surface"
                              : "border-hairline text-muted hover:border-muted hover:text-ink",
                          )}
                        >
                          {s.label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {step === 1 && (
          <div className="space-y-5">
            <h1 className="voice-xl">Give it a working title.</h1>
            <p className="voice measure text-[14px] text-muted">
              Changeable any time. Being asked to name a thing you haven&apos;t had yet is a real
              blocker — so you can skip it.
            </p>
            <div className="space-y-1.5">
              <Label htmlFor="title">Working title</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                autoFocus
                className="h-11 text-[15px]"
              />
            </div>
            <button
              className="text-[12.5px] text-unresolved hover:underline"
              onClick={() => {
                setTitle(`Untitled ${subtype?.label ?? "project"}`);
                setStep(2);
              }}
            >
              Name it later →
            </button>
            <div className="space-y-1.5">
              <Label htmlFor="desc">
                One line of description <span className="text-faint">optional</span>
              </Label>
              <Textarea
                id="desc"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="What do you have in mind?"
              />
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-5">
            <h1 className="voice-xl">Anything more specific?</h1>
            <p className="voice measure text-[14px] text-muted">
              Optional. These nudge which modules load and how the prompts read.
            </p>
            {subtype && subtype.tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {subtype.tags.map((t) => (
                  <button
                    key={t}
                    onClick={() =>
                      setTags((s) => (s.includes(t) ? s.filter((x) => x !== t) : [...s, t]))
                    }
                    className={cn(
                      "pressable rounded-full border px-3 py-1 text-[12.5px] transition-colors",
                      tags.includes(t)
                        ? "border-ink bg-ink text-surface"
                        : "border-hairline text-muted hover:border-muted",
                    )}
                  >
                    {t}
                  </button>
                ))}
              </div>
            )}
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Free text — what do you have in mind?"
              className="min-h-[6rem]"
            />
          </div>
        )}

        {step === 3 && (
          <div className="space-y-5">
            <h1 className="voice-xl">Where are you with it?</h1>
            <p className="voice measure text-[14px] text-muted">
              Not how far along the tasks are — how well-defined the <em>idea</em> is. Changeable,
              and changing it only ever adds.
            </p>
            <div className="space-y-2.5">
              {(["seed", "vague", "defined"] as Readiness[]).map((r) => {
                const m = readinessMeta[r];
                return (
                  <button
                    key={r}
                    onClick={() => goReadiness(r)}
                    className={cn(
                      "block w-full rounded-[var(--radius-sm)] border p-4 text-left transition-colors",
                      readiness === r
                        ? "border-accent bg-accent-wash/40"
                        : "border-hairline hover:border-ink-2",
                    )}
                  >
                    <div className="flex items-center gap-2 text-[13px] font-medium text-ink">
                      <ReadinessMark readiness={r} /> {m.label}
                    </div>
                    <div className="voice mt-1.5 text-[13.5px] text-ink-2">{m.meaning}</div>
                    <div className="mt-1 text-[11.5px] text-muted">{m.emphasis}</div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {step === 4 && (
          <div className="space-y-5">
            <h1 className="voice-xl">Confirm your workspace.</h1>
            <p className="voice measure text-[14px] text-muted">
              These modules will be set up. Uncheck anything — modules are optional, and you can add
              more from the library any time.
            </p>
            <div className="space-y-1.5">
              {suggestedModules.map((key) => {
                const meta = moduleMeta[key];
                if (!meta) return null;
                const on = modules.includes(key);
                const forced = key === "rant_space" || key === "open_questions";
                return (
                  <div
                    key={key}
                    className={cn(
                      "rounded-[var(--radius-sm)] border px-3.5 py-2.5 transition-colors",
                      on ? "border-hairline bg-paper" : "border-hairline-2 opacity-70",
                    )}
                  >
                    <CheckboxField
                      checked={on}
                      onCheckedChange={(v) =>
                        !forced &&
                        setModules((s) =>
                          v ? [...new Set([...s, key])] : s.filter((k) => k !== key),
                        )
                      }
                      label={
                        <span>
                          <span className="text-[13px] font-medium text-ink">{meta.name}</span>
                          {forced && (
                            <span className="ml-2 text-[10.5px] text-faint">always on</span>
                          )}
                          <span className="mt-0.5 block text-[11.5px] leading-snug text-muted">
                            {meta.intro}
                          </span>
                        </span>
                      }
                    />
                  </div>
                );
              })}
            </div>
            {error && <p className="text-[13px] text-unresolved">{error}</p>}
          </div>
        )}
      </div>

      <div className="mt-10 flex items-center justify-between">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setStep((s) => Math.max(0, s - 1))}
          disabled={step === 0 || pending}
        >
          <ArrowLeft size={14} /> Back
        </Button>
        {step < 4 ? (
          <Button variant="primary" size="md" disabled={!canNext} onClick={() => setStep((s) => s + 1)}>
            Continue <ArrowRight size={14} />
          </Button>
        ) : (
          <Button variant="primary" size="md" disabled={pending || !canNext} onClick={submit}>
            {pending ? "Creating…" : "Create workspace"}
            {!pending && <Check size={14} />}
          </Button>
        )}
      </div>
    </div>
  );
}
