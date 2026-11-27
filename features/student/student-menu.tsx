"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { ArrowsLeftRight, CaretDown, CircleNotch } from "@phosphor-icons/react/ssr";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { forgetStudent } from "./identity";

/** Profile menu for the picked student: who's practising + "Not you? Switch student". */
export function StudentMenu({ name, className }: { name: string; className: string }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const switchStudent = () =>
    start(async () => {
      await forgetStudent();
      router.replace("/student/who");
      router.refresh();
    });
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        aria-label={`${name}, ${className}. Open profile menu`}
        className="flex w-full items-center gap-2.5 rounded-xl border-2 border-foreground/12 bg-card p-2 text-left outline-none hover:border-primary/40 focus-visible:ring-3 focus-visible:ring-ring/50 group-data-[collapsible=icon]:border-0 group-data-[collapsible=icon]:p-0"
      >
        <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-tint-peach font-heading font-bold text-primary">
          {name.charAt(0).toUpperCase()}
        </span>
        <span className="min-w-0 flex-1 group-data-[collapsible=icon]:hidden">
          <span className="block truncate font-heading text-sm font-bold">{name}</span>
          <span className="block truncate text-xs text-muted-foreground">{className}</span>
        </span>
        <CaretDown className="size-4 shrink-0 text-muted-foreground group-data-[collapsible=icon]:hidden" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-60 rounded-xl border-2 border-foreground/12">
        <DropdownMenuLabel className="font-heading">
          {name} · {className}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onSelect={(e) => (e.preventDefault(), switchStudent())} disabled={pending} className="font-semibold">
          {pending ? <CircleNotch className="animate-spin" /> : <ArrowsLeftRight />} Not you? Switch student
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
