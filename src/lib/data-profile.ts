import "server-only";

import { cache } from "react";
import { createClient, getUser } from "@/lib/supabase/server";
import type {
  ProfileRow,
  PortfolioItemRow,
  ProjectRow,
} from "@/lib/supabase/database.types";

export interface FullProfile {
  profile: ProfileRow;
  isMe: boolean;
  working: ProjectRow[];
  finished: ProjectRow[];
  external: PortfolioItemRow[];
}

export const getProfileByHandle = cache(
  async (handle: string): Promise<FullProfile | null> => {
    const supabase = await createClient();
    const me = await getUser();

    const byId = /^[0-9a-f-]{36}$/.test(handle);
    const { data: profile } = await supabase
      .from("profiles")
      .select("*")
      .eq(byId ? "id" : "username", byId ? handle : handle.toLowerCase())
      .maybeSingle();
    if (!profile) return null;

    const [projRes, extRes] = await Promise.all([
      supabase
        .from("projects")
        .select("*")
        .eq("user_id", profile.id)
        .or("lifecycle.eq.finished,show_on_profile.eq.true")
        .order("finished_at", { ascending: false }),
      supabase
        .from("portfolio_items")
        .select("*")
        .eq("user_id", profile.id)
        .order("order_index"),
    ]);

    const projects = (projRes.data ?? []) as ProjectRow[];
    return {
      profile,
      isMe: me?.id === profile.id,
      working: projects.filter((p) => p.lifecycle !== "finished" && p.show_on_profile),
      finished: projects.filter((p) => p.lifecycle === "finished"),
      external: (extRes.data ?? []) as PortfolioItemRow[],
    };
  },
);

export const getMyProfile = cache(async () => {
  const user = await getUser();
  if (!user) return null;
  const supabase = await createClient();
  const { data } = await supabase.from("profiles").select("*").eq("id", user.id).maybeSingle();
  return data as ProfileRow | null;
});
