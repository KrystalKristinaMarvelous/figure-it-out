import "server-only";

import { cache } from "react";
import { createClient, getUser } from "@/lib/supabase/server";
import type { ProfileRow, MessageRow } from "@/lib/supabase/database.types";

export const getUnreadCount = cache(async (): Promise<number> => {
  const user = await getUser();
  if (!user) return 0;
  const supabase = await createClient();
  const { count } = await supabase
    .from("messages")
    .select("id", { count: "exact", head: true })
    .eq("recipient_id", user.id)
    .is("read_at", null);
  return count ?? 0;
});

export const getFollowState = cache(async (profileId: string) => {
  const user = await getUser();
  const supabase = await createClient();
  const [mine, theirs, followers, following] = await Promise.all([
    user
      ? supabase
          .from("follows")
          .select("follower_id", { head: true, count: "exact" })
          .eq("follower_id", user.id)
          .eq("following_id", profileId)
      : Promise.resolve({ count: 0 }),
    user
      ? supabase
          .from("follows")
          .select("follower_id", { head: true, count: "exact" })
          .eq("follower_id", profileId)
          .eq("following_id", user.id)
      : Promise.resolve({ count: 0 }),
    supabase.from("follows").select("follower_id", { head: true, count: "exact" }).eq("following_id", profileId),
    supabase.from("follows").select("follower_id", { head: true, count: "exact" }).eq("follower_id", profileId),
  ]);
  return {
    iFollow: (mine.count ?? 0) > 0,
    followsMe: (theirs.count ?? 0) > 0,
    followerCount: followers.count ?? 0,
    followingCount: following.count ?? 0,
  };
});

export const searchPeople = cache(async (q: string, tab: "discover" | "following" | "followers") => {
  const user = await getUser();
  if (!user) return [];
  const supabase = await createClient();

  let ids: string[] | null = null;
  if (tab === "following") {
    const { data } = await supabase.from("follows").select("following_id").eq("follower_id", user.id);
    ids = (data ?? []).map((r) => r.following_id);
  } else if (tab === "followers") {
    const { data } = await supabase.from("follows").select("follower_id").eq("following_id", user.id);
    ids = (data ?? []).map((r) => r.follower_id);
  }
  if (ids && ids.length === 0) return [];

  let query = supabase.from("profiles").select("*").neq("id", user.id).limit(60);
  if (ids) query = query.in("id", ids);
  if (q.trim()) {
    const term = `%${q.trim()}%`;
    query = query.or(`display_name.ilike.${term},username.ilike.${term},headline.ilike.${term}`);
  }
  const { data: profiles } = await query;
  const list = (profiles ?? []) as ProfileRow[];

  const { data: myFollows } = await supabase
    .from("follows")
    .select("following_id")
    .eq("follower_id", user.id);
  const followingSet = new Set((myFollows ?? []).map((r) => r.following_id));

  return list.map((p) => ({ ...p, iFollow: followingSet.has(p.id) }));
});

export const getConversations = cache(async () => {
  const user = await getUser();
  if (!user) return [];
  const supabase = await createClient();
  const { data } = await supabase
    .from("messages")
    .select("*")
    .or(`sender_id.eq.${user.id},recipient_id.eq.${user.id}`)
    .order("created_at", { ascending: false })
    .limit(400);
  const msgs = (data ?? []) as MessageRow[];

  const byOther = new Map<
    string,
    { last: MessageRow; unread: number }
  >();
  for (const m of msgs) {
    const other = m.sender_id === user.id ? m.recipient_id : m.sender_id;
    const entry = byOther.get(other);
    if (!entry) {
      byOther.set(other, {
        last: m,
        unread: m.recipient_id === user.id && !m.read_at ? 1 : 0,
      });
    } else if (m.recipient_id === user.id && !m.read_at) {
      entry.unread += 1;
    }
  }
  const otherIds = [...byOther.keys()];
  if (otherIds.length === 0) return [];

  const { data: profiles } = await supabase.from("profiles").select("*").in("id", otherIds);
  const pmap = new Map((profiles ?? []).map((p) => [p.id, p as ProfileRow]));

  return otherIds
    .map((id) => ({
      profile: pmap.get(id),
      last: byOther.get(id)!.last,
      unread: byOther.get(id)!.unread,
    }))
    .filter((c) => c.profile)
    .sort((a, b) => b.last.created_at.localeCompare(a.last.created_at));
});

export const getThread = cache(async (handle: string) => {
  const user = await getUser();
  if (!user) return null;
  const supabase = await createClient();

  const byId = /^[0-9a-f-]{36}$/.test(handle);
  const { data: other } = await supabase
    .from("profiles")
    .select("*")
    .eq(byId ? "id" : "username", byId ? handle : handle.toLowerCase())
    .maybeSingle();
  if (!other || other.id === user.id) return null;

  const { data } = await supabase
    .from("messages")
    .select("*")
    .or(
      `and(sender_id.eq.${user.id},recipient_id.eq.${other.id}),and(sender_id.eq.${other.id},recipient_id.eq.${user.id})`,
    )
    .order("created_at");

  return {
    me: user.id,
    other: other as ProfileRow,
    messages: (data ?? []) as MessageRow[],
  };
});
