"use client";

import { useState, useTransition } from "react";
import { joinProject } from "@/lib/actions";
import { Button } from "@/components/ui/button";

export function JoinCard({ token, access }: { token: string; access: "view" | "edit" }) {
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);

  return (
    <div className="space-y-3">
      <Button
        variant="primary"
        size="md"
        disabled={pending}
        onClick={() =>
          start(async () => {
            setError(null);
            try {
              await joinProject(token);
            } catch (e) {
              setError(e instanceof Error ? e.message : "Could not join.");
            }
          })
        }
      >
        {pending ? "Joining…" : access === "edit" ? "Join as a collaborator" : "Open the project"}
      </Button>
      {error && <p className="text-[12px] text-accent-ink">{error}</p>}
    </div>
  );
}
