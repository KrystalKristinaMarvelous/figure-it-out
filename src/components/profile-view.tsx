import Link from "next/link";
import { Icon } from "@/components/icon";
import { findCategory, findSubtype } from "@/lib/schema/taxonomy";
import { ReadinessMark } from "@/components/readiness-mark";
import { initials } from "@/lib/utils";
import { shortDate } from "@/lib/format";
import type { FullProfile } from "@/lib/data-profile";
import { getFollowState } from "@/lib/data-social";
import { FollowButton } from "@/components/follow-button";
import type { ProjectRow, PortfolioItemRow } from "@/lib/supabase/database.types";

export async function ProfileView({ data }: { data: FullProfile }) {
  const { profile, isMe, working, finished, external } = data;
  const name = profile.display_name || profile.username || "Someone";
  const fs = await getFollowState(profile.id);
  const totalFinished = finished.length + external.length;
  const figured =
    working.reduce((s, p) => s + (p.resolved_count ?? 0), 0) +
    finished.reduce((s, p) => s + (p.resolved_count ?? 0), 0);

  return (
    <div className="mx-auto w-full max-w-2xl px-5 py-10 sm:px-8">
      <header className="flex items-start gap-4">
        <div className="grid h-16 w-16 shrink-0 place-items-center overflow-hidden rounded-full border border-hairline bg-sunken text-[18px] text-muted">
          {profile.avatar_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={profile.avatar_url} alt="" className="h-full w-full object-cover" />
          ) : (
            initials(name)
          )}
        </div>
        <div className="min-w-0 flex-1">
          <h1 className="voice-lg leading-tight">{name}</h1>
          {profile.username && <p className="mono text-[11.5px] text-faint">@{profile.username}</p>}
          {profile.headline && (
            <p className="voice mt-1.5 text-[14px] text-ink-2">{profile.headline}</p>
          )}
        </div>
        {isMe ? (
          <Link
            href="/settings"
            className="mono shrink-0 rounded-[var(--radius-sm)] border border-hairline px-3 py-1 text-[11px] uppercase tracking-[0.05em] text-muted hover:text-ink"
          >
            Edit
          </Link>
        ) : (
          <FollowButton userId={profile.id} initialFollowing={fs.iFollow} username={profile.username} />
        )}
      </header>

      {profile.bio && (
        <p className="voice measure mt-5 whitespace-pre-wrap text-[14px] text-muted">{profile.bio}</p>
      )}

      <div className="mono mt-5 flex flex-wrap gap-x-5 gap-y-1 text-[11px] uppercase tracking-[0.05em] text-faint">
        <span>
          <span className="text-ink-2">{totalFinished}</span> finished
        </span>
        <span>
          <span className="text-ink-2">{working.length}</span> in progress
        </span>
        {figured > 0 && (
          <span>
            <span className="text-ink-2">{figured}</span> figured out
          </span>
        )}
        <Link href="/people?tab=followers" className="hover:text-ink">
          <span className="text-ink-2">{fs.followerCount}</span> followers
        </Link>
        <Link href="/people?tab=following" className="hover:text-ink">
          <span className="text-ink-2">{fs.followingCount}</span> following
        </Link>
        {fs.followsMe && !isMe && <span>· follows you</span>}
      </div>

      {working.length > 0 && (
        <Section title="Working on">
          {working.map((p) => (
            <ProjectCard key={p.id} p={p} />
          ))}
        </Section>
      )}

      {(finished.length > 0 || external.length > 0) && (
        <Section title="Finished">
          {finished.map((p) => (
            <ProjectCard key={p.id} p={p} finished />
          ))}
          {external.map((it) => (
            <ExternalCard key={it.id} it={it} />
          ))}
        </Section>
      )}

      {totalFinished === 0 && working.length === 0 && (
        <p className="voice mt-10 text-[14px] text-muted">
          {isMe
            ? "Nothing on your profile yet. Feature a project you're working on (from its Overview), or add finished work in Settings."
            : "This person hasn't shared any work yet."}
        </p>
      )}
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mt-10">
      <p className="eyebrow mb-3">{title}</p>
      <div className="grid gap-3 sm:grid-cols-2">{children}</div>
    </section>
  );
}

function ProjectCard({ p, finished }: { p: ProjectRow; finished?: boolean }) {
  const cat = findCategory(p.category);
  return (
    <Link href={`/projects/${p.id}`} className="group">
      <div className="well card flex h-full flex-col gap-2 p-4 transition-colors group-hover:border-accent">
        <div className="flex items-center justify-between">
          <span className="grid h-7 w-7 place-items-center rounded-[var(--radius-sm)] bg-sunken text-muted">
            <Icon name={cat?.icon ?? "Square"} size={14} />
          </span>
          {finished ? (
            <span className="mono text-[10px] uppercase tracking-[0.05em] text-brass">
              {p.finished_at ? new Date(p.finished_at).getFullYear() : "done"}
            </span>
          ) : (
            <ReadinessMark readiness={p.readiness} />
          )}
        </div>
        <h3 className="text-[13px] font-medium leading-snug text-ink">{p.title}</h3>
        <p className="voice line-clamp-3 text-[13px] leading-snug text-muted">
          {p.one_liner || <span className="text-faint">No one-line idea yet.</span>}
        </p>
        <div className="mono mt-auto flex flex-wrap items-center gap-x-2 gap-y-0.5 pt-1.5 text-[10px] uppercase tracking-[0.05em] text-faint">
          <span>{findSubtype(p.category, p.subtype)?.label ?? p.subtype}</span>
          {(p.resolved_count ?? 0) > 0 && <span>· {p.resolved_count} figured out</span>}
          {finished && p.finished_at && <span>· {shortDate(p.finished_at)}</span>}
        </div>
      </div>
    </Link>
  );
}

function ExternalCard({ it }: { it: PortfolioItemRow }) {
  const body = (
    <div className="well card flex h-full flex-col gap-2 p-4">
      <div className="flex items-center justify-between">
        <span className="grid h-7 w-7 place-items-center rounded-[var(--radius-sm)] bg-sunken text-muted">
          <Icon name="ExternalLink" size={13} />
        </span>
        {it.year && (
          <span className="mono text-[10px] uppercase tracking-[0.05em] text-brass">{it.year}</span>
        )}
      </div>
      <h3 className="text-[13px] font-medium leading-snug text-ink">{it.title}</h3>
      {it.blurb && (
        <p className="voice line-clamp-3 text-[13px] leading-snug text-muted">{it.blurb}</p>
      )}
      <div className="mono mt-auto pt-1.5 text-[10px] uppercase tracking-[0.05em] text-faint">
        {[it.kind, "elsewhere"].filter(Boolean).join(" · ")}
      </div>
    </div>
  );
  return it.link_url ? (
    <a href={it.link_url} target="_blank" rel="noreferrer" className="group">
      {body}
    </a>
  ) : (
    body
  );
}
