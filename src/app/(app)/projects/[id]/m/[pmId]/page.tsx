import { getModuleByPmId, getEntries, getAllEntries } from "@/lib/data";
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
  const [entries, allEntries] = await Promise.all([getEntries(pmId), getAllEntries(id)]);

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
    <div className="space-y-4">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="flex items-center gap-2 text-lg font-semibold text-ink">
            <Icon name={mod.def.icon} size={16} /> {mod.name}
          </h2>
          <p className="voice mt-1 max-w-prose text-sm text-muted">{mod.def.intro}</p>
        </div>
        {!mod.def.universal && <ArchiveModuleButton projectId={id} pmId={pmId} />}
      </div>

      {mod.pm.status === "archived" && (
        <p className="rounded-md border border-hairline bg-raised px-3 py-2 text-sm text-muted">
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
      />
    </div>
  );
}
