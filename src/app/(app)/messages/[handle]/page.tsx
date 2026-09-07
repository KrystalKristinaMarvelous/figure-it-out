import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import { getThread } from "@/lib/data-social";
import { initials } from "@/lib/utils";
import { Thread } from "./thread";

export async function generateMetadata({ params }: PageProps<"/messages/[handle]">) {
  const { handle } = await params;
  const t = await getThread(handle);
  const name = t?.other.display_name || t?.other.username || "Message";
  return { title: `${name} — FIO` };
}

export default async function ThreadPage({ params }: PageProps<"/messages/[handle]">) {
  const { handle } = await params;
  const t = await getThread(handle);
  if (!t) notFound();
  const name = t.other.display_name || t.other.username || "Someone";

  return (
    <div className="mx-auto flex h-[calc(100vh-3.5rem)] w-full max-w-2xl flex-col px-5 sm:px-8">
      <header className="flex items-center gap-3 border-b border-hairline-2 py-3">
        <Link href="/messages" className="text-muted hover:text-ink">
          <ChevronLeft size={18} />
        </Link>
        <Link
          href={t.other.username ? `/u/${t.other.username}` : `/u/${t.other.id}`}
          className="flex items-center gap-2.5"
        >
          <span className="grid h-8 w-8 place-items-center overflow-hidden rounded-full border border-hairline bg-sunken text-[11px] text-muted">
            {t.other.avatar_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={t.other.avatar_url} alt="" className="h-full w-full object-cover" />
            ) : (
              initials(name)
            )}
          </span>
          <span className="text-[13px] font-medium text-ink">{name}</span>
        </Link>
      </header>

      <Thread
        me={t.me}
        otherId={t.other.id}
        otherName={name}
        initialMessages={t.messages}
      />
    </div>
  );
}
