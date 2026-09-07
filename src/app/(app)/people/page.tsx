import Link from "next/link";
import { requireUser } from "@/lib/supabase/server";
import { searchPeople } from "@/lib/data-social";
import { FollowButton } from "@/components/follow-button";
import { initials } from "@/lib/utils";
import { Input } from "@/components/ui/field";
import { Search } from "lucide-react";

export const metadata = { title: "People — FIO" };

const TABS = [
  { key: "discover", label: "Discover" },
  { key: "following", label: "Following" },
  { key: "followers", label: "Followers" },
] as const;

export default async function PeoplePage({ searchParams }: PageProps<"/people">) {
  await requireUser();
  const sp = await searchParams;
  const tab = (typeof sp.tab === "string" ? sp.tab : "discover") as
    | "discover"
    | "following"
    | "followers";
  const q = typeof sp.q === "string" ? sp.q : "";
  const people = await searchPeople(q, tab);

  return (
    <div className="mx-auto w-full max-w-2xl px-5 py-10 sm:px-8">
      <h1 className="voice-lg mb-4">People</h1>

      <div className="mb-4 flex gap-4">
        {TABS.map((t) => (
          <Link
            key={t.key}
            href={`/people?tab=${t.key}${q ? `&q=${encodeURIComponent(q)}` : ""}`}
            className={`text-[12.5px] transition-colors ${
              tab === t.key
                ? "font-medium text-ink underline decoration-accent decoration-2 underline-offset-4"
                : "text-muted hover:text-ink"
            }`}
          >
            {t.label}
          </Link>
        ))}
      </div>

      <form className="relative mb-6" action="/people">
        <input type="hidden" name="tab" value={tab} />
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-faint" />
        <Input
          name="q"
          defaultValue={q}
          placeholder="Search by name, @username, or what they're working on"
          className="pl-9"
        />
      </form>

      {people.length === 0 ? (
        <p className="voice py-10 text-center text-[14px] text-muted">
          {tab === "following"
            ? "You're not following anyone yet."
            : tab === "followers"
              ? "No followers yet."
              : q
                ? "Nobody matches that."
                : "No other members to show."}
        </p>
      ) : (
        <ul className="hairline-x framed">
          {people.map((p) => {
            const name = p.display_name || p.username || "Someone";
            const href = p.username ? `/u/${p.username}` : `/u/${p.id}`;
            return (
              <li key={p.id} className="flex items-center gap-3 py-3.5">
                <Link href={href} className="shrink-0">
                  <span className="grid h-10 w-10 place-items-center overflow-hidden rounded-full border border-hairline bg-sunken text-[12px] text-muted">
                    {p.avatar_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={p.avatar_url} alt="" className="h-full w-full object-cover" />
                    ) : (
                      initials(name)
                    )}
                  </span>
                </Link>
                <Link href={href} className="min-w-0 flex-1">
                  <span className="text-[13px] font-medium text-ink">{name}</span>
                  {p.username && (
                    <span className="mono ml-1.5 text-[10.5px] text-faint">@{p.username}</span>
                  )}
                  {p.headline && (
                    <span className="voice mt-0.5 block line-clamp-1 text-[12.5px] text-muted">
                      {p.headline}
                    </span>
                  )}
                </Link>
                <FollowButton userId={p.id} initialFollowing={p.iFollow} compact />
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
