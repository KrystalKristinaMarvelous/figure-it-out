"use client";

import { useTransition } from "react";
import { X } from "lucide-react";
import { dismissGap } from "@/lib/actions";

export function DismissGap({ projectId, gapKey }: { projectId: string; gapKey: string }) {
  const [pending, start] = useTransition();
  return (
    <button
      aria-label="Dismiss"
      disabled={pending}
      onClick={() => start(() => dismissGap(projectId, gapKey).then(() => {}))}
      className="text-muted hover:text-ink disabled:opacity-40"
    >
      <X size={13} />
    </button>
  );
}
