import Link from "next/link";
import { requireUser } from "@/lib/supabase/server";
import { getConversations } from "@/lib/data-social";
import { initials, relativeTime } from "@/lib/utils";

export const metadata = { title: "Messages — FIO" };

export default async function MessagesPage() {
  const user = await requireUser();
  const convos = await getConversations();

  return (
    <div className="mx-auto w-full max-w-2xl px-5 py-10 sm:px-8">
      <h1 className="voice-lg mb-2">Messages</h1>
      <p className="voice mb-6 text-[13px] text-muted">
        Find someone on <Link href="/people" className="link-accent">People</Link> and start a
        conversation.
      </p>

      {convos.length === 0 ? (
        <p className="voice py-10 text-center text-[14px] text-muted">No conversations yet.</p>
      ) : (
        <ul className="hairline-x framed">
          {convos.map((c) => {
            const p = c.profile!;
            const name = p.display_name || p.username || "Someone";
            return (
              <li key={p.id}>
                <Link
                  href={`/messages/${p.username || p.id}`}
                  className="flex items-center gap-3 py-3.5 transition-colors hover:bg-accent-wash/30"
                >
                  <span className="grid h-10 w-10 shrink-0 place-items-center overflow-hidden rounded-full border border-hairline bg-sunken text-[12px] text-muted">
                    {p.avatar_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={p.avatar_url} alt="" className="h-full w-full object-cover" />
                    ) : (
                      initials(name)
                    )}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="flex items-baseline justify-between gap-2">
                      <span className="text-[13px] font-medium text-ink">{name}</span>
                      <span className="mono text-[10px] text-faint">
                        {relativeTime(c.last.created_at)}
                      </span>
                    </span>
                    <span className="mt-0.5 flex items-center gap-2">
                      <span className="voice line-clamp-1 flex-1 text-[12.5px] text-muted">
                        {c.last.sender_id === user.id ? "You: " : ""}
                        {c.last.body}
                      </span>
                      {c.unread > 0 && (
                        <span className="mono grid h-4 min-w-4 place-items-center rounded-full bg-accent px-1 text-[10px] text-white">
                          {c.unread}
                        </span>
                      )}
                    </span>
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
