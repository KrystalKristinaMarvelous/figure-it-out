"use client";

import { useMemo, useState, useTransition } from "react";
import { Plus, Pencil, Trash2 } from "lucide-react";
import type { FieldDef, EntryValues, Presentation } from "@/lib/schema/types";
import type { EntryRow } from "@/lib/supabase/database.types";
import { titleFor } from "@/lib/schema/values";
import { shortDate } from "@/lib/format";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogBody } from "@/components/ui/dialog";
import { EntryForm, type RefOption } from "@/components/fields/entry-form";
import { FieldValue, summarize } from "./entry-value";
import { createEntry, updateEntry, deleteEntry, setEntryStatus } from "@/lib/actions";
import { cn } from "@/lib/utils";

interface Props {
  projectId: string;
  pmId: string;
  presentation: Presentation;
  schema: FieldDef[];
  entries: EntryRow[];
  refOptions: RefOption[];
  moduleName: string;
}

export function ModuleView(props: Props) {
  const { presentation } = props;
  const [editing, setEditing] = useState<EntryRow | "new" | null>(null);
  const refLabels = useMemo(
    () => new Map(props.refOptions.map((o) => [o.id, o.label])),
    [props.refOptions],
  );

  const titleField = props.schema.find((f) => f.isTitle) ?? props.schema[0];
  const bodyFields = props.schema.filter((f) => f !== titleField);

  async function save(values: Record<string, unknown>) {
    if (editing === "new") {
      await createEntry(props.projectId, props.pmId, values);
    } else if (editing) {
      await updateEntry(props.projectId, props.pmId, editing.id, values);
    }
    setEditing(null);
  }

  const addButton = (
    <Button variant="outline" size="sm" onClick={() => setEditing("new")}>
      <Plus size={14} /> Add {props.entries.length > 0 ? "" : "the first one"}
    </Button>
  );

  return (
    <div className="space-y-4">
      {props.entries.length > 0 && (
        <div className="flex items-center justify-between">
          <span className="text-[12px] text-faint tnum">
            {props.entries.length} {props.entries.length === 1 ? "entry" : "entries"}
          </span>
          {addButton}
        </div>
      )}

      {props.entries.length === 0 ? (
        <Card className="p-8 text-center" tint="paper">
          <p className="voice text-[14px] text-muted">Nothing here yet.</p>
          <div className="mt-4 flex justify-center">{addButton}</div>
        </Card>
      ) : presentation === "board" ? (
        <BoardView {...props} onEdit={setEditing} refLabels={refLabels} />
      ) : presentation === "table" ? (
        <TableView {...props} onEdit={setEditing} refLabels={refLabels} />
      ) : presentation === "sheet" || presentation === "slots" ? (
        <SheetView {...props} onEdit={setEditing} refLabels={refLabels} />
      ) : (
        <CardsView
          {...props}
          layout={presentation === "gallery" || presentation === "grid" ? "grid" : "list"}
          onEdit={setEditing}
          refLabels={refLabels}
        />
      )}

      <Dialog open={editing !== null} onOpenChange={(o) => !o && setEditing(null)}>
        <DialogContent size="lg" className="max-h-[88vh] overflow-y-auto">
          <DialogHeader
            title={editing === "new" ? `New ${props.moduleName.toLowerCase()} entry` : "Edit entry"}
          />
          <DialogBody>
            {editing !== null && (
              <EntryForm
                schema={props.schema}
                initial={editing === "new" ? undefined : (editing.values as EntryValues)}
                refOptions={props.refOptions}
                onSubmit={save}
                onCancel={() => setEditing(null)}
              />
            )}
          </DialogBody>
        </DialogContent>
      </Dialog>
    </div>
  );
}

type SubProps = Props & {
  onEdit: (e: EntryRow) => void;
  refLabels: Map<string, string>;
};

function RowActions({ e, projectId }: { e: EntryRow; projectId: string }) {
  const [pending, start] = useTransition();
  return (
    <button
      className="text-muted hover:text-unresolved disabled:opacity-40"
      disabled={pending}
      onClick={(ev) => {
        ev.stopPropagation();
        if (confirm("Delete this entry?")) start(() => deleteEntry(projectId, e.id).then(() => {}));
      }}
      aria-label="Delete"
    >
      <Trash2 size={13} />
    </button>
  );
}

function CardsView({
  entries,
  schema,
  onEdit,
  refLabels,
  projectId,
  layout,
}: SubProps & { layout: "grid" | "list" }) {
  const imageField = schema.find((f) => f.type === "image");
  return (
    <div className={cn(layout === "grid" ? "grid gap-3 sm:grid-cols-2 lg:grid-cols-3" : "space-y-2")}>
      {entries.map((e) => {
        const values = e.values as EntryValues;
        const img = imageField ? (values[imageField.key] as string) : null;
        return (
          <Card
            key={e.id}
            interactive
            className="group overflow-hidden p-3.5"
            onClick={() => onEdit(e)}
          >
            {img && (
              <img
                src={img}
                alt=""
                className="mb-2.5 -mx-3.5 -mt-3.5 h-32 w-[calc(100%+1.75rem)] object-cover"
              />
            )}
            <div className="flex items-start justify-between gap-2">
              <h3 className="text-[13px] font-semibold leading-snug text-ink">
                {e.title || titleFor(schema, values)}
              </h3>
              <span className="flex shrink-0 items-center gap-2 opacity-0 transition-opacity group-hover:opacity-100">
                <Pencil size={12} className="text-faint" />
                <RowActions e={e} projectId={projectId} />
              </span>
            </div>
            <p className="voice mt-1 line-clamp-3 text-[12.5px] leading-snug text-muted">
              {summarize(schema, values)}
            </p>
          </Card>
        );
      })}
    </div>
  );
}

function TableView({ entries, schema, onEdit, refLabels, projectId }: SubProps) {
  const cols = schema.slice(0, 5);
  return (
    <div className="overflow-x-auto rounded-lg border border-hairline">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-hairline bg-raised text-left text-xs text-muted">
            {cols.map((c) => (
              <th key={c.key} className="whitespace-nowrap px-3 py-2 font-medium">
                {c.label}
              </th>
            ))}
            <th className="w-8" />
          </tr>
        </thead>
        <tbody>
          {entries.map((e) => {
            const values = e.values as EntryValues;
            return (
              <tr
                key={e.id}
                className="cursor-pointer border-b border-hairline last:border-0 hover:bg-raised"
                onClick={() => onEdit(e)}
              >
                {cols.map((c) => (
                  <td key={c.key} className="px-3 py-2 align-top">
                    <FieldValue field={c} value={values[c.key]} refLabels={refLabels} />
                  </td>
                ))}
                <td className="px-2 py-2 text-right">
                  <RowActions e={e} projectId={projectId} />
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

function BoardView({ entries, schema, onEdit, refLabels, projectId }: SubProps) {
  const statusField =
    schema.find((f) => f.slot === "status") ??
    schema.find((f) => f.type === "select" && (f.options ?? []).length >= 2);
  const columns = statusField?.options ?? ["todo", "doing", "done"];
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [, start] = useTransition();

  return (
    <div className="grid gap-3 md:grid-cols-3">
      {columns.map((col) => {
        const inCol = entries.filter((e) => {
          const v = statusField ? (e.values as EntryValues)[statusField.key] : e.status;
          return (v ?? columns[0]) === col;
        });
        return (
          <div key={col} className="rounded-lg border border-hairline bg-raised/50 p-2">
            <div className="mb-2 px-1 text-xs font-medium capitalize text-muted">
              {col} · {inCol.length}
            </div>
            <div className="space-y-2">
              {inCol.map((e) => (
                <Card
                  key={e.id}
                  className={cn("cursor-pointer p-2.5 text-sm hover:border-muted", pendingId === e.id && "opacity-50")}
                  onClick={() => onEdit(e)}
                >
                  <div className="flex items-start justify-between gap-2">
                    <span className="font-medium text-ink">{e.title}</span>
                    <RowActions e={e} projectId={projectId} />
                  </div>
                  <p className="mt-1 line-clamp-2 text-xs text-muted">
                    {summarize(schema, e.values as EntryValues)}
                  </p>
                  {statusField && (
                    <div className="mt-2 flex gap-1">
                      {columns
                        .filter((c) => c !== col)
                        .map((c) => (
                          <button
                            key={c}
                            className="rounded bg-sunken px-1.5 py-0.5 text-[11px] text-muted hover:text-ink"
                            onClick={(ev) => {
                              ev.stopPropagation();
                              setPendingId(e.id);
                              start(() =>
                                updateEntry(
                                  projectId,
                                  e.project_module_id,
                                  e.id,
                                  { ...(e.values as EntryValues), [statusField.key]: c },
                                ).then(() => setPendingId(null)),
                              );
                            }}
                          >
                            → {c}
                          </button>
                        ))}
                    </div>
                  )}
                </Card>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function SheetView({ entries, schema, onEdit, refLabels, projectId }: SubProps) {
  return (
    <div className="space-y-4">
      {entries.map((e) => {
        const values = e.values as EntryValues;
        return (
          <Card key={e.id} className="p-4">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-base font-semibold text-ink">{e.title || "Untitled"}</h3>
              <div className="flex items-center gap-3">
                <button onClick={() => onEdit(e)} className="text-muted hover:text-ink">
                  <Pencil size={13} />
                </button>
                <RowActions e={e} projectId={projectId} />
              </div>
            </div>
            <dl className="grid gap-x-6 gap-y-2 sm:grid-cols-[10rem_1fr]">
              {schema
                .filter((f) => !f.isTitle)
                .map((f) => {
                  const v = values[f.key];
                  const empty = v == null || v === "" || (Array.isArray(v) && !v.length);
                  return (
                    <div key={f.key} className="contents">
                      <dt
                        className={cn(
                          "text-[13px] font-medium",
                          empty && f.required ? "text-unresolved" : "text-muted",
                        )}
                      >
                        {f.label}
                      </dt>
                      <dd className="text-sm text-ink">
                        <FieldValue field={f} value={v} refLabels={refLabels} />
                      </dd>
                    </div>
                  );
                })}
            </dl>
          </Card>
        );
      })}
    </div>
  );
}
