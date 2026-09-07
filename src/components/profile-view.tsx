import Link from "next/link";
import { Icon } from "@/components/icon";
import { findCategory, findSubtype } from "@/lib/schema/taxonomy";
import { initials } from "@/lib/utils";
import type { FullProfile } from "@/lib/data-profile";

export function ProfileView({ data }: { data: FullProfile }) {
  const { profile, isMe, working, finished, external } = data;
  const name = profile.display_name || profile.username || "Someone";

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
          {profile.username && (
            <p className="mono text-[11.5px] text-faint">@{profile.username}</p>
          )}
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
          <FollowButton />
        )}
      </header>

      {profile.bio && (
        <p className="voice measure mt-5 whitespace-pre-wrap text-[14px] text-muted">{profile.bio}</p>
      )}

      <div className="mono mt-5 flex gap-5 text-[11px] uppercase tracking-[0.05em] text-faint">
        <span>
          <span className="text-ink-2">{finished.length + external.length}</span> finished
        </span>
        <span>
          <span className="text-ink-2">{working.length}</span> in progress
        </span>
      </div>

      {working.length > 0 && (
        <Section title="Working on">
          {working.map((p) => (
            <li key={p.id}>
              <Link href={`/projects/${p.id}`} className="group flex items-start gap-3 py-3">
                <Cat catKey={p.category} />
                <span className="min-w-0 flex-1">
                  <span className="text-[13px] font-medium text-ink">{p.title}</span>
                  <span className="voice mt-0.5 block line-clamp-2 text-[13px] text-muted">
                    {p.one_liner || "—"}
                  </span>
                </span>
              </Link>
            </li>
          ))}
        </Section>
      )}

      {(finished.length > 0 || external.length > 0) && (
        <Section title="Finished">
          {finished.map((p) => (
            <li key={p.id}>
              <Link href={`/projects/${p.id}`} className="group flex items-start gap-3 py-3">
                <Cat catKey={p.category} />
                <span className="min-w-0 flex-1">
                  <span className="text-[13px] font-medium text-ink">{p.title}</span>
                  <span className="voice mt-0.5 block line-clamp-2 text-[13px] text-muted">
                    {p.one_liner || "—"}
                  </span>
                  <span className="mono mt-1 block text-[10px] uppercase tracking-[0.05em] text-faint">
                    {findSubtype(p.category, p.subtype)?.label ?? p.subtype}
                    {p.finished_at ? ` · ${new Date(p.finished_at).getFullYear()}` : ""}
                  </span>
                </span>
              </Link>
            </li>
          ))}
          {external.map((it) => (
            <li key={it.id} className="flex items-start gap-3 py-3">
              <span className="mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-[var(--radius-sm)] bg-sunken text-muted">
                <Icon name="ExternalLink" size={14} />
              </span>
              <span className="min-w-0 flex-1">
                <span className="text-[13px] font-medium text-ink">
                  {it.link_url ? (
                    <a href={it.link_url} target="_blank" rel="noreferrer" className="hover:underline">
                      {it.title}
                    </a>
                  ) : (
                    it.title
                  )}
                </span>
                {it.blurb && (
                  <span className="voice mt-0.5 block line-clamp-2 text-[13px] text-muted">
                    {it.blurb}
                  </span>
                )}
                <span className="mono mt-1 block text-[10px] uppercase tracking-[0.05em] text-faint">
                  {[it.kind, it.year, "elsewhere"].filter(Boolean).join(" · ")}
                </span>
              </span>
            </li>
          ))}
        </Section>
      )}

      {finished.length === 0 && external.length === 0 && working.length === 0 && (
        <p className="voice mt-10 text-[14px] text-muted">
          {isMe
            ? "Nothing on your profile yet. Feature a project you're working on, or add finished work — from Settings, or from a project's page."
            : "This person hasn't shared any work yet."}
        </p>
      )}
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mt-9">
      <p className="eyebrow mb-1">{title}</p>
      <ul className="hairline-x framed">{children}</ul>
    </section>
  );
}

function Cat({ catKey }: { catKey: string }) {
  return (
    <span className="mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-[var(--radius-sm)] bg-sunken text-muted">
      <Icon name={findCategory(catKey)?.icon ?? "Square"} size={14} />
    </span>
  );
}

function FollowButton() {
  return (
    <button
      disabled
      className="mono shrink-0 rounded-[var(--radius-sm)] border border-hairline px-3 py-1 text-[11px] uppercase tracking-[0.05em] text-faint"
      title="Following & messages are coming next"
    >
      Follow
    </button>
  );
}
