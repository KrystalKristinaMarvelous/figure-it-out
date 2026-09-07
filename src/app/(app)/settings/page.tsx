import { createClient, requireUser } from "@/lib/supabase/server";
import type { ProfileRow, PortfolioItemRow } from "@/lib/supabase/database.types";
import { SettingsClient } from "./settings-client";

export const metadata = { title: "Settings — FIO" };

export default async function SettingsPage() {
  const user = await requireUser();
  const supabase = await createClient();
  const [{ data: prof }, { data: items }] = await Promise.all([
    supabase.from("profiles").select("*").eq("id", user.id).maybeSingle(),
    supabase
      .from("portfolio_items")
      .select("*")
      .eq("user_id", user.id)
      .order("order_index"),
  ]);
  const profile = (prof ?? { id: user.id }) as ProfileRow;

  return (
    <div className="mx-auto w-full max-w-2xl px-5 py-10 sm:px-8">
      <h1 className="voice-lg mb-8">Settings</h1>
      <SettingsClient
        profile={profile}
        email={user.email ?? ""}
        items={(items ?? []) as PortfolioItemRow[]}
      />
    </div>
  );
}
