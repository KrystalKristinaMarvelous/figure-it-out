import Link from "next/link";
import { createClient, requireUser } from "@/lib/supabase/server";
import { JoinCard } from "./join-card";

export const metadata = { title: "Join a project — FIO" };

export default async function JoinPage({ params }: PageProps<"/join/[token]">) {
  const { token } = await params;
  await requireUser();
  const supabase = await createClient();

  const { data } = await supabase.rpc("invite_info", { invite_token: token });
  const info = Array.isArray(data) ? data[0] : null;

  if (!info) {
    return (
      <div className="mx-auto w-full max-w-md px-5 py-20 text-center">
        <h1 className="voice-lg mb-2">This link isn&apos;t working</h1>
        <p className="voice text-[14px] text-muted">
          It may have been turned off, or it was never quite right.
        </p>
        <Link href="/dashboard" className="link-accent mt-6 inline-block text-[13px]">
          Back to your projects
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-md px-5 py-20">
      <p className="eyebrow mb-3">You&apos;ve been invited</p>
      <h1 className="voice-xl leading-tight">{info.project_title}</h1>
      <p className="voice mt-3 text-[14px] text-muted">
        {info.owner_name} shared this with you.{" "}
        {info.access === "edit"
          ? "You'll be able to work on the parts assigned to you."
          : "You'll be able to read everything, but not make changes."}
      </p>
      <div className="mt-8">
        <JoinCard token={token} access={info.access} />
      </div>
    </div>
  );
}
