"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { CircleNotch, Copy } from "@phosphor-icons/react/ssr";
import { toast } from "sonner";
import { OutlineButton } from "@/components/brand/ui";

/** "Duplicate & edit": POST /api/materials/[id]/duplicate → "<title> (copy)", unlocked, no assignments. */
export function DuplicateMaterialButton({ materialId, title }: { materialId: string; title: string }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  return (
    <OutlineButton
      className="h-9 px-3 text-xs"
      disabled={pending}
      aria-label={`Duplicate ${title}`}
      onClick={() =>
        start(async () => {
          const res = await fetch(`/api/materials/${materialId}/duplicate`, { method: "POST" }).catch(() => null);
          if (res?.ok) {
            toast.success(`Copied as “${title} (copy)”.`);
            router.refresh();
          } else toast.error("Couldn't duplicate it. Please try again.");
        })
      }
    >
      {pending ? <CircleNotch className="animate-spin" /> : <Copy weight="bold" />} Duplicate
    </OutlineButton>
  );
}
