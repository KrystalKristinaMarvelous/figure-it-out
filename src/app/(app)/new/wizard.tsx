"use client";

import { useMemo, useState, useTransition } from "react";
import { ArrowLeft, ArrowRight, Check } from "lucide-react";
import type { CategoryDef, SubtypeDef } from "@/lib/schema/taxonomy";
import type { Readiness } from "@/lib/schema/types";
import { Button } from "@/components/ui/button";
import { Input, Textarea, Label } from "@/components/ui/field";
import { CheckboxField } from "@/components/ui/field";
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
    if (subtype) {
      setModules(Array.from(new Set(subtype.modules[r] ?? subtype.modules.vague)));
    }
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
    <div className="mx-auto max-w-2xl">
      <ol className="mb-8 flex items-center gap-2 text-xs text-muted">
        {STEPS.map((s, i) => (
          <li key={s} className="flex items-center gap-2">
            <span
              className={cn(
                "grid h-5 w-5 place-items-center rounded-full border text-[11px]",
                i === step && "border-unresolved bg-unresolved text-white",
                i < step && "border-ink bg-ink text-surface",
                i > step && "border-hairline",
              )}
            >
              {i < step ? <Check size={11} /> : i + 1}
            </span>
            <span className={cn(i === step && "text-ink")}>{s}</span>
            {i < STEPS.length - 1 && <span className="text-hairline">·</span>}
          </li>
        ))}
      </ol>

      {step === 0 && (
        <div className="space-y-6">
          <h1 className="voice text-2xl text-ink">What are you making?</h1>
          {taxonomy.map((c) => (
            <div key={c.key}>
              <button
                onClick={() => {
                  setCategory(c.key);
                  setSubtypeKey(c.subtypes.length === 1 ? c.subtypes[0].key : null);
                }}
                className={cn(
                  "flex w-full items-center gap-2 rounded-md border px-3 py-2 text-left text-sm",
                  category === c.key ? "border-ink bg-raised" : "border-hairline",
                )}
              >
                <span>{c.glyph}</span>
                <span className="font-medium text-ink">{c.label}</span>
                <span className="text-xs text-muted">— {c.blurb}</span>
              </button>
              {category === c.key && (
                <div className="mt-2 flex flex-wrap gap-1.5 pl-3">
                  {c.subtypes.map((s) => (
                    <button
                      key={s.key}
                      onClick={() => setSubtypeKey(s.key)}
                      className={cn(
                        "rounded-full border px-3 py-1 text-sm",
                        subtypeKey === s.key
                          ? "border-unresolved bg-unresolved-soft text-unresolved"
                          : "border-hairline text-muted hover:text-ink",
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
      )}

      {step === 1 && (
        <div className="space-y-4">
          <h1 className="voice text-2xl text-ink">Give it a working title.</h1>
          <p className="voice text-sm text-muted">
            Changeable any time. Being asked to name a thing you haven&apos;t had yet is a real
            blocker — so you can skip it.
          </p>
          <div className="space-y-1.5">
            <Label htmlFor="title">Working title</Label>
            <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} autoFocus />
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setTitle(`Untitled ${subtype?.label ?? "project"}`);
              setStep(2);
            }}
          >
            Name it later
          </Button>
          <div className="space-y-1.5">
            <Label htmlFor="desc">One line of description</Label>
            <Textarea
              id="desc"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What do you have in mind? (optional)"
            />
          </div>
        </div>
      )}

      {step === 2 && (
        <div className="space-y-4">
          <h1 className="voice text-2xl text-ink">Anything more specific?</h1>
          <p className="voice text-sm text-muted">
            Optional. These refine which modules load and how the prompts read.
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
                    "rounded-full border px-3 py-1 text-sm",
                    tags.includes(t)
                      ? "border-ink bg-raised text-ink"
                      : "border-hairline text-muted",
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
        <div className="space-y-4">
          <h1 className="voice text-2xl text-ink">Where are you with it?</h1>
          <p className="voice text-sm text-muted">
            Not how far along the tasks are — how well-defined the idea is. Changeable, and changing
            it only ever adds.
          </p>
          {(["seed", "vague", "defined"] as Readiness[]).map((r) => {
            const m = readinessMeta[r];
            return (
              <button
                key={r}
                onClick={() => goReadiness(r)}
                className={cn(
                  "block w-full rounded-md border p-3 text-left",
                  readiness === r ? "border-ink bg-raised" : "border-hairline",
                )}
              >
                <div className="text-sm font-medium text-ink">
                  {m.glyph} {m.label}
                </div>
                <div className="voice mt-0.5 text-sm text-muted">{m.meaning}</div>
                <div className="mt-1 text-xs text-muted">{m.emphasis}</div>
              </button>
            );
          })}
        </div>
      )}

      {step === 4 && (
        <div className="space-y-4">
          <h1 className="voice text-2xl text-ink">Confirm your workspace.</h1>
          <p className="voice text-sm text-muted">
            These modules will be set up. Uncheck anything — modules are optional, and you can add
            more from the library later.
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
                  className="flex items-start gap-3 rounded-md border border-hairline px-3 py-2"
                >
                  <CheckboxField
                    checked={on}
                    onCheckedChange={(v) =>
                      !forced &&
                      setModules((s) => (v ? [...new Set([...s, key])] : s.filter((k) => k !== key)))
                    }
                    label={
                      <span>
                        <span className="text-sm font-medium text-ink">{meta.name}</span>
                        {forced && <span className="ml-2 text-[11px] text-muted">always on</span>}
                        <span className="mt-0.5 block text-xs text-muted">{meta.intro}</span>
                      </span>
                    }
                  />
                </div>
              );
            })}
          </div>
          {error && <p className="text-sm text-unresolved">{error}</p>}
        </div>
      )}

      <div className="mt-8 flex items-center justify-between">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setStep((s) => Math.max(0, s - 1))}
          disabled={step === 0 || pending}
        >
          <ArrowLeft size={14} /> Back
        </Button>
        {step < 4 ? (
          <Button
            variant="primary"
            size="sm"
            disabled={!canNext}
            onClick={() => setStep((s) => s + 1)}
          >
            Next <ArrowRight size={14} />
          </Button>
        ) : (
          <Button variant="primary" size="sm" disabled={pending || !canNext} onClick={submit}>
            {pending ? "Creating…" : "Create workspace"}
          </Button>
        )}
      </div>
    </div>
  );
}
