import { requireUser } from "@/lib/supabase/server";
import { TAXONOMY, READINESS_META } from "@/lib/schema/taxonomy";
import { ALL_MODULES } from "@/content/modules";
import { Wizard } from "./wizard";

export const metadata = { title: "New project — FIO" };

export default async function NewProjectPage() {
  await requireUser();
  const moduleMeta = Object.fromEntries(
    ALL_MODULES.map((m) => [m.key, { name: m.name, intro: m.intro, icon: m.icon }]),
  );
  return (
    <Wizard taxonomy={TAXONOMY} readinessMeta={READINESS_META} moduleMeta={moduleMeta} />
  );
}
