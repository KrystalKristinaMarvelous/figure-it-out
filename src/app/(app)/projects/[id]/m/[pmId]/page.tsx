import { getModuleByPmId, getEntries, getAllEntries } from "@/lib/data";
import { getProjectAccess } from "@/lib/data-collab";
import { ModuleView } from "@/components/modules/module-view";
import type { RefOption } from "@/components/fields/entry-form";
import type { EntryValues } from "@/lib/schema/types";
import { Suspense } from "react";
import { Icon } from "@/components/icon";
import { GapPanel } from "@/components/gap-panel";
import { ArchiveModuleButton } from "./archive-button";

export default async function ModulePage({ params }: PageProps<"/projects/[id]/m/[pmId]">) {
  const { id, pmId } = await params;
  const mod = await getModuleByPmId(id, pmId);
  const [entries, allEntries, access] = await Promise.all([
    getEntries(pmId),
    getAllEntries(id),
    getProjectAccess(id),
  ]);
  const canEdit = access.isOwner || access.editableModuleIds.has(pmId);

  const refOptions: RefOption[] = allEntries
    .filter((e) => e.moduleKey && e.id)
    .map((e) => ({
      id: e.id,
      label: e.title || "Untitled",
      moduleKey: e.moduleKey!,
    }));

  const sort = mod.def.defaultSort;
  const sorted = [...entries].sort((a, b) => {
    if (sort === "date") {
      const df = mod.def.entrySchema.find((f) => f.type === "date");
      const av = df ? String((a.values as EntryValues)[df.key] ?? "") : "";
      const bv = df ? String((b.values as EntryValues)[df.key] ?? "") : "";
      return av.localeCompare(bv);
    }
    if (sort === "title") return (a.title ?? "").localeCompare(b.title ?? "");
    if (sort === "created") return a.created_at.localeCompare(b.created_at);
    return a.order_index - b.order_index;
  });

  return (
    <div className="space-y-5">
      <header className="flex items-start justify-between gap-4">
        <div>
          <h1 className="flex items-center gap-2 screen-title text-[17px]">
            <Icon name={mod.def.icon} size={16} className="text-muted" />
            {mod.name}
          </h1>
          <p className="voice measure mt-1.5 text-[13.5px] text-muted">{mod.def.intro}</p>
        </div>
        {access.isOwner && !mod.def.universal && (
          <ArchiveModuleButton projectId={id} pmId={pmId} />
        )}
      </header>

      {access.role && !access.isOwner && (
        <p className="rounded-[var(--radius-sm)] border border-hairline-2 bg-raised px-3 py-2 text-[12px] text-muted">
          {canEdit
            ? "This module is assigned to you — your edits save for everyone."
            : "You're viewing this module. Ask the owner to assign it to you on the checklist to make changes."}
        </p>
      )}

      {mod.pm.status === "archived" && (
        <p className="rounded-[var(--radius-sm)] border border-hairline-2 bg-raised px-3 py-2 text-[12.5px] text-muted">
          This module is archived. Its data is kept — re-add it from the library to restore.
        </p>
      )}

      <Suspense fallback={null}>
        <GapPanel projectId={id} moduleKey={mod.def.key} />
      </Suspense>

      <ModuleView
        projectId={id}
        pmId={pmId}
        presentation={mod.def.presentation}
        schema={mod.def.entrySchema}
        entries={sorted}
        refOptions={refOptions}
        moduleName={mod.name}
        canEdit={canEdit}
      />
    </div>
  );
}
