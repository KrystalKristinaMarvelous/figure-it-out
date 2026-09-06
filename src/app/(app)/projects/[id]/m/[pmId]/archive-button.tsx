"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Archive } from "lucide-react";
import { archiveModule } from "@/lib/actions";
import { Button } from "@/components/ui/button";

export function ArchiveModuleButton({ projectId, pmId }: { projectId: string; pmId: string }) {
  const [pending, start] = useTransition();
  const router = useRouter();
  return (
    <Button
      variant="ghost"
      size="sm"
      disabled={pending}
      onClick={() =>
        start(async () => {
          await archiveModule(projectId, pmId);
          router.push(`/projects/${projectId}`);
        })
      }
    >
      <Archive size={13} /> Remove
    </Button>
  );
}
