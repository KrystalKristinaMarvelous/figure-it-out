import { NextResponse } from "next/server";
import { getProject, getProjectModules, getAllEntries, getQuestions, getRants } from "@/lib/data";
import { titleFor } from "@/lib/schema/values";
import { plainText } from "@/lib/schema/values";
import type { EntryValues } from "@/lib/schema/types";

export async function GET(request: Request, ctx: RouteContext<"/projects/[id]/export">) {
  const { id } = await ctx.params;
  const format = new URL(request.url).searchParams.get("format") ?? "md";

  const [project, modules, entries, questions, rants] = await Promise.all([
    getProject(id),
    getProjectModules(id, true),
    getAllEntries(id),
    getQuestions(id),
    getRants(id),
  ]);

  if (format === "json") {
    return NextResponse.json(
      { project, modules: modules.map((m) => ({ key: m.def.key, name: m.name, status: m.pm.status })), entries, questions, rants },
      { headers: { "content-disposition": `attachment; filename="${slug(project.title)}.json"` } },
    );
  }

  const lines: string[] = [
    `# ${project.title}`,
    "",
    project.one_liner ?? "_No one-line idea yet._",
    "",
    `- **Type:** ${project.category} → ${project.subtype}`,
    `- **Readiness:** ${project.readiness}`,
    project.original_one_liner && project.original_one_liner !== project.one_liner
      ? `- **Started as:** ${project.original_one_liner}`
      : "",
    "",
    "## Open Questions",
    "",
    `Figured out ${questions.filter((q) => q.status === "resolved").length}, ${questions.filter((q) => q.status !== "resolved").length} open.`,
    "",
    ...questions.map((q) =>
      q.status === "resolved"
        ? `- ~~${q.text}~~ — **${q.answer ?? ""}**`
        : `- [ ] (${q.priority}) ${q.text}`,
    ),
    "",
  ];

  for (const m of modules) {
    const mine = entries.filter((e) => e.moduleKey === m.def.key);
    if (!mine.length) continue;
    lines.push(`## ${m.name}`, "");
    for (const e of mine) {
      lines.push(`### ${e.title || titleFor(m.def.entrySchema, e.values as EntryValues)}`, "");
      for (const f of m.def.entrySchema) {
        if (f.isTitle) continue;
        const v = plainText((e.values as EntryValues)[f.key]);
        if (v) lines.push(`- **${f.label}:** ${v}`);
      }
      lines.push("");
    }
  }

  if (rants.length) {
    lines.push("## Rant Space", "");
    for (const r of rants) {
      lines.push(`> ${(r.body_text ?? r.transcript ?? "").replace(/\n/g, "\n> ")}`, `> — ${r.created_at.slice(0, 10)}`, "");
    }
  }

  return new NextResponse(lines.filter((l) => l !== undefined).join("\n"), {
    headers: {
      "content-type": "text/markdown; charset=utf-8",
      "content-disposition": `attachment; filename="${slug(project.title)}.md"`,
    },
  });
}

function slug(s: string) {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "project";
}
