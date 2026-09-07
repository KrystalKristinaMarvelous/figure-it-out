"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { follow, unfollow } from "@/lib/actions";
import { Button } from "@/components/ui/button";

export function FollowButton({
  userId,
  initialFollowing,
  username,
  compact,
}: {
  userId: string;
  initialFollowing: boolean;
  username?: string | null;
  compact?: boolean;
}) {
  const [following, setFollowing] = useState(initialFollowing);
  const [pending, start] = useTransition();

  const toggle = () =>
    start(async () => {
      const next = !following;
      setFollowing(next);
      try {
        await (next ? follow(userId) : unfollow(userId));
      } catch {
        setFollowing(!next);
      }
    });

  if (compact) {
    return (
      <button
        onClick={toggle}
        disabled={pending}
        className={`mono rounded-full border px-2.5 py-1 text-[10px] uppercase tracking-[0.05em] transition-colors ${
          following
            ? "border-hairline text-muted hover:border-accent hover:text-accent-ink"
            : "border-accent bg-accent text-white"
        }`}
      >
        {following ? "Following" : "Follow"}
      </button>
    );
  }

  return (
    <div className="flex shrink-0 items-center gap-2">
      <Button
        variant={following ? "outline" : "primary"}
        size="sm"
        onClick={toggle}
        disabled={pending}
      >
        {following ? "Following" : "Follow"}
      </Button>
      <Button asChild variant="ghost" size="sm">
        <Link href={`/messages/${username || userId}`}>Message</Link>
      </Button>
    </div>
  );
}
